import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import type {
  BoundingBox,
  InferenceTrace,
  KnowledgeSource,
  TextSourceChunk
} from "@xuan/rag";

export interface DocumentExtractionBlock {
  id: string;
  type: string;
  text: string;
  locator: string;
  page?: number | null;
  bbox?: BoundingBox | null;
  trace: InferenceTrace;
}

export interface DocumentExtractionArtifact {
  version: 1;
  kind: "document-extraction";
  sourcePath: string;
  sourceHash: string;
  extractor: {
    id: string;
    version: string;
  };
  createdAt: string;
  blocks: DocumentExtractionBlock[];
  warnings: string[];
}

export interface DocumentRagRecords {
  source: KnowledgeSource;
  chunks: TextSourceChunk[];
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sourceIdFromPath(path: string): string {
  return path
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function walkJsonFiles(inputDir: string): string[] {
  if (!existsSync(inputDir)) {
    return [];
  }
  return readdirSync(inputDir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(inputDir, entry.name);
    if (entry.isDirectory()) {
      return walkJsonFiles(path);
    }
    return entry.isFile() && extname(entry.name).toLowerCase() === ".json" ? [path] : [];
  });
}

export function loadDocumentExtractionArtifacts(
  inputDir: string
): DocumentExtractionArtifact[] {
  return walkJsonFiles(inputDir).map((path) => {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as DocumentExtractionArtifact;
    if (
      parsed.version !== 1 ||
      parsed.kind !== "document-extraction" ||
      !parsed.extractor?.id ||
      !parsed.extractor?.version ||
      !Array.isArray(parsed.blocks) ||
      parsed.blocks.some(
        (block) =>
          !block.id ||
          !block.text ||
          !block.trace?.rulesetId ||
          !block.trace?.formulaId ||
          !block.trace?.sourceHint ||
          !block.trace?.confidence
      )
    ) {
      throw new Error(`Invalid document extraction artifact: ${relative(inputDir, path)}`);
    }
    return parsed;
  });
}

export function documentArtifactToRagRecords(
  artifact: DocumentExtractionArtifact,
  tags: string[]
): DocumentRagRecords {
  const sourceId = sourceIdFromPath(artifact.sourcePath);
  return {
    source: {
      id: sourceId,
      title: basename(artifact.sourcePath).replace(/\.[^.]+$/, ""),
      author: artifact.sourcePath.includes("倪海厦") ? "倪海厦" : undefined,
      language: "zh",
      license: "user-private",
      usage: "local-private-only",
      notes: `Local private extracted document: ${artifact.sourcePath}`
    },
    chunks: artifact.blocks.map((block) => ({
      id: `${sourceId}#${block.id}`,
      sourceId,
      locator: block.locator,
      text: block.text,
      tags,
      modality: "text",
      provenance: {
        sourcePath: artifact.sourcePath,
        page: block.page ?? undefined,
        bbox: block.bbox ?? undefined,
        extractorId: artifact.extractor.id,
        extractorVersion: artifact.extractor.version,
        sourceHash: artifact.sourceHash,
        contentHash: sha256(block.text)
      },
      trace: block.trace
    }))
  };
}
