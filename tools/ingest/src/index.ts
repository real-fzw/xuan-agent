import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { KnowledgeSource, RagIndex, SourceChunk } from "@xuan/rag";
import {
  captionArtifactToRagRecords,
  loadImageCaptionArtifacts
} from "./vision-caption.js";
import {
  documentArtifactToRagRecords,
  loadDocumentExtractionArtifacts
} from "./document-extraction.js";

export interface IngestPlan {
  inputDir: string;
  outputDir: string;
  sourcePolicy: "repo-safe" | "local-private-only";
}

export interface PrivateBookFile {
  path: string;
  extension: string;
  sizeBytes: number;
  sourceId: string;
  usage: "local-private-only";
  processing: "metadata-only" | "extract-text" | "caption-image" | "unsupported";
  primaryExtractor: "native-text" | "docling" | "apache-tika" | "image-caption" | "none";
  fallbackExtractors: Array<"mineru" | "apache-tika">;
}

export interface PrivateBookManifest {
  inputDir: string;
  generatedAt: string;
  policy: "local-private-only";
  files: PrivateBookFile[];
  warnings: string[];
}

export interface PrivateRagIndexSummary {
  inputDir: string;
  outputFile: string;
  sourceCount: number;
  chunkCount: number;
  skippedCount: number;
}

const TEXT_EXTENSIONS = new Set([".txt", ".md"]);
const DOCLING_EXTENSIONS = new Set([".pdf", ".docx", ".pptx"]);
const TIKA_EXTENSIONS = new Set([".doc", ".ppt"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const IGNORED_FILENAMES = new Set([".ds_store"]);
const IGNORED_EXTENSIONS = new Set([".qkdownloading"]);

export function createIngestPlan(plan: IngestPlan): IngestPlan {
  return plan;
}

function sourceIdFromPath(path: string): string {
  return path
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function processingForExtension(extension: string): PrivateBookFile["processing"] {
  if (TEXT_EXTENSIONS.has(extension)) {
    return "extract-text";
  }

  if (DOCLING_EXTENSIONS.has(extension) || TIKA_EXTENSIONS.has(extension)) {
    return "extract-text";
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "caption-image";
  }

  return "unsupported";
}

function extractorPlanForExtension(
  extension: string
): Pick<PrivateBookFile, "primaryExtractor" | "fallbackExtractors"> {
  if (TEXT_EXTENSIONS.has(extension)) {
    return { primaryExtractor: "native-text", fallbackExtractors: [] };
  }

  if (DOCLING_EXTENSIONS.has(extension)) {
    return {
      primaryExtractor: "docling",
      fallbackExtractors: extension === ".pdf" ? ["mineru"] : ["apache-tika"]
    };
  }

  if (TIKA_EXTENSIONS.has(extension)) {
    return { primaryExtractor: "apache-tika", fallbackExtractors: [] };
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return { primaryExtractor: "image-caption", fallbackExtractors: [] };
  }

  return { primaryExtractor: "none", fallbackExtractors: [] };
}

function walkFiles(inputDir: string, currentDir: string = inputDir): string[] {
  return readdirSync(currentDir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      return walkFiles(inputDir, path);
    }

    if (!entry.isFile()) {
      return [];
    }

    return [path];
  });
}

export function createPrivateBookManifest(
  inputDir: string,
  now: () => Date = () => new Date()
): PrivateBookManifest {
  const files = walkFiles(inputDir)
    .map((path) => {
      const relativePath = relative(inputDir, path);
      const extension = extname(path).toLowerCase();
      const extractorPlan = extractorPlanForExtension(extension);
      return {
        path: relativePath,
        extension: extension.replace(/^\./, ""),
        sizeBytes: statSync(path).size,
        sourceId: sourceIdFromPath(relativePath),
        usage: "local-private-only" as const,
        processing: processingForExtension(extension),
        ...extractorPlan
      };
    })
    .filter((file) => !IGNORED_FILENAMES.has(basename(file.path).toLowerCase()))
    .filter((file) => !IGNORED_EXTENSIONS.has(`.${file.extension}`))
    .sort((left, right) => left.path.localeCompare(right.path, "zh-Hans-CN"));

  return {
    inputDir,
    generatedAt: now().toISOString(),
    policy: "local-private-only",
    files,
    warnings: [
      "This manifest intentionally contains metadata only. Do not commit extracted text, image captions, embeddings, or copyrighted source files.",
      "Images use a caption pipeline, not OCR. Captions are model inferences and must retain trace metadata.",
      "Write derived private indexes under data/private/ or corpus/private/, both ignored by Git."
    ]
  };
}

export function writePrivateBookManifest(
  inputDir: string,
  outputFile: string,
  now: () => Date = () => new Date()
): PrivateBookManifest {
  const manifest = createPrivateBookManifest(inputDir, now);
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

export function inferTagsFromPath(path: string): string[] {
  const tags = new Set<string>(["本地私有"]);
  const lower = path.toLowerCase();
  const tagHints: Array<readonly [string, string]> = [
    ["紫微", "紫微斗数"],
    ["斗数", "紫微斗数"],
    ["命宫", "命宫"],
    ["身宫", "身宫"],
    ["四化", "四化"],
    ["主星", "主星"],
    ["天机", "天机"],
    ["天纪", "天纪"],
    ["易经", "易经"],
    ["四柱", "八字"],
    ["六神", "六神"],
    ["面相", "面相"],
    ["地脉", "风水"],
    ["罗盘", "风水"],
    ["罗经", "风水"]
  ];

  for (const [needle, tag] of tagHints) {
    if (lower.includes(needle.toLowerCase())) {
      tags.add(tag);
    }
  }

  return [...tags];
}

function titleFromPath(path: string): string {
  return basename(path).replace(/\.[^.]+$/, "").trim();
}

function splitTextIntoChunks(
  source: KnowledgeSource,
  text: string,
  tags: string[],
  maxChars: number = 900
): SourceChunk[] {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: SourceChunk[] = [];

  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    for (let offset = 0; offset < paragraph.length; offset += maxChars) {
      const textSlice = paragraph.slice(offset, offset + maxChars).trim();
      if (!textSlice) {
        continue;
      }

      chunks.push({
        id: `${source.id}#p${paragraphIndex + 1}-${Math.floor(offset / maxChars) + 1}`,
        sourceId: source.id,
        locator: `paragraph ${paragraphIndex + 1}`,
        text: textSlice,
        tags
      });
    }
  }

  return chunks;
}

export function createPrivateTextRagIndex(
  inputDir: string,
  now: () => Date = () => new Date()
): RagIndex {
  const manifest = createPrivateBookManifest(inputDir, now);
  const textFiles = manifest.files.filter((file) =>
    TEXT_EXTENSIONS.has(`.${file.extension}`)
  );
  const sources: KnowledgeSource[] = [];
  const chunks: SourceChunk[] = [];

  for (const file of textFiles) {
    const absolutePath = join(inputDir, file.path);
    const source: KnowledgeSource = {
      id: file.sourceId,
      title: titleFromPath(file.path),
      author: file.path.includes("倪海厦") ? "倪海厦" : undefined,
      language: "zh",
      license: "user-private",
      usage: "local-private-only",
      notes: `Local private source file: ${file.path}`
    };
    const tags = inferTagsFromPath(file.path);
    const text = readFileSync(absolutePath, "utf8");

    sources.push(source);
    chunks.push(...splitTextIntoChunks(source, text, tags));
  }

  return {
    version: 1,
    generatedAt: now().toISOString(),
    usage: "local-private-only",
    sources,
    chunks,
    warnings: [
      "This index may contain private copyrighted text. Keep it under data/private/ or corpus/private/ and never commit it.",
      `${manifest.files.length - textFiles.length} files were skipped by the text-only indexer. Document extraction and image captioning run as explicit local-private plugins.`
    ]
  };
}

export function writePrivateTextRagIndex(
  inputDir: string,
  outputFile: string,
  now: () => Date = () => new Date()
): PrivateRagIndexSummary {
  const index = createPrivateTextRagIndex(inputDir, now);
  const skippedCount = createPrivateBookManifest(inputDir, now).files.length - index.sources.length;
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  return {
    inputDir,
    outputFile,
    sourceCount: index.sources.length,
    chunkCount: index.chunks.length,
    skippedCount
  };
}

export function createPrivateRagIndex(
  inputDir: string,
  captionDir: string,
  documentDir?: string,
  now: () => Date = () => new Date()
): RagIndex {
  const textIndex = createPrivateTextRagIndex(inputDir, now);
  const captionRecords = loadImageCaptionArtifacts(captionDir).map(
    captionArtifactToRagRecords
  );
  const documentRecords = documentDir
    ? loadDocumentExtractionArtifacts(documentDir).map((artifact) =>
        documentArtifactToRagRecords(artifact, inferTagsFromPath(artifact.sourcePath))
      )
    : [];

  return {
    ...textIndex,
    sources: [
      ...textIndex.sources,
      ...documentRecords.map((record) => record.source),
      ...captionRecords.map((record) => record.source)
    ],
    chunks: [
      ...textIndex.chunks,
      ...documentRecords.flatMap((record) => record.chunks),
      ...captionRecords.map((record) => record.chunk)
    ],
    warnings: [
      ...textIndex.warnings,
      `${documentRecords.length} private document extraction artifacts were loaded.`,
      `${captionRecords.length} private image captions were loaded. Captions are model-generated retrieval aids, not deterministic chart facts.`
    ]
  };
}

export function writePrivateRagIndex(
  inputDir: string,
  captionDir: string,
  documentDir: string,
  outputFile: string,
  now: () => Date = () => new Date()
): PrivateRagIndexSummary {
  const index = createPrivateRagIndex(inputDir, captionDir, documentDir, now);
  const manifest = createPrivateBookManifest(inputDir, now);
  const indexedSourceIds = new Set(index.sources.map((source) => source.id));
  const skippedCount = manifest.files.filter(
    (file) => !indexedSourceIds.has(file.sourceId)
  ).length;
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  return {
    inputDir,
    outputFile,
    sourceCount: index.sources.length,
    chunkCount: index.chunks.length,
    skippedCount
  };
}

function runCli(argv: string[]): void {
  const command = argv[2] ?? "manifest";

  if (command === "index-private") {
    const inputDir = resolve(argv[3] ?? "book");
    const captionDir = resolve(argv[4] ?? "data/private/captions");
    const documentDir = resolve(argv[5] ?? "data/private/extraction-artifacts");
    const outputFile = resolve(argv[6] ?? "data/private/rag-index.json");
    const summary = writePrivateRagIndex(inputDir, captionDir, documentDir, outputFile);

    console.log(
      `Wrote private RAG index: ${outputFile} (${summary.sourceCount} sources, ${summary.chunkCount} chunks, ${summary.skippedCount} skipped)`
    );
    return;
  }

  if (command === "index-text") {
    const inputDir = resolve(argv[3] ?? "book");
    const outputFile = resolve(argv[4] ?? "data/private/rag-index.json");
    const summary = writePrivateTextRagIndex(inputDir, outputFile);

    console.log(
      `Wrote private RAG index: ${outputFile} (${summary.sourceCount} sources, ${summary.chunkCount} chunks, ${summary.skippedCount} skipped)`
    );
    return;
  }

  const inputDir = resolve(command === "manifest" ? argv[3] ?? "book" : command);
  const outputFile = resolve(
    command === "manifest" ? argv[4] ?? "data/private/book-manifest.json" : argv[3] ?? "data/private/book-manifest.json"
  );
  const manifest = writePrivateBookManifest(inputDir, outputFile);

  console.log(
    `Wrote private book manifest: ${outputFile} (${manifest.files.length} files)`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli(process.argv);
}
