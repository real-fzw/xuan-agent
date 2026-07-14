import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  createPrivateBookManifest,
  createPrivateRagIndex,
  createPrivateTextRagIndex,
  writePrivateBookManifest,
  writePrivateTextRagIndex
} from "./index.js";
import { writeImageCaptionArtifact, type ImageCaptionArtifact } from "./vision-caption.js";

describe("createPrivateBookManifest", () => {
  it("scans private book files as metadata-only local sources", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-ingest-"));
    mkdirSync(join(root, "天纪"));
    writeFileSync(join(root, ".DS_Store"), "ignored");
    writeFileSync(join(root, "天纪", "partial.pdf.qkdownloading"), "ignored");
    writeFileSync(join(root, "天纪", "sample.pdf"), "not real pdf");
    writeFileSync(join(root, "天纪", "chart.png"), "not real image");
    writeFileSync(join(root, "天纪", "note.txt"), "private note");

    const manifest = createPrivateBookManifest(root, () => new Date("2026-01-01T00:00:00Z"));

    expect(manifest.policy).toBe("local-private-only");
    expect(manifest.generatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(manifest.files).toHaveLength(3);
    expect(manifest.files.map((file) => file.path)).toEqual([
      "天纪/chart.png",
      "天纪/note.txt",
      "天纪/sample.pdf"
    ]);
    expect(manifest.files.every((file) => file.usage === "local-private-only")).toBe(true);
    expect(manifest.files.every((file) => !("text" in file))).toBe(true);
    expect(manifest.files.find((file) => file.extension === "pdf")?.processing).toBe(
      "extract-text"
    );
    expect(manifest.files.find((file) => file.extension === "pdf")).toMatchObject({
      primaryExtractor: "docling",
      fallbackExtractors: ["mineru"]
    });
    expect(manifest.files.find((file) => file.extension === "png")).toMatchObject({
      processing: "caption-image",
      primaryExtractor: "image-caption",
      fallbackExtractors: []
    });
    expect(manifest.warnings).toContain(
      "Images use a caption pipeline, not OCR. Captions are model inferences and must retain trace metadata."
    );
  });

  it("routes legacy and modern Office files to explicit extractors", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-ingest-"));
    writeFileSync(join(root, "legacy.doc"), "not real doc");
    writeFileSync(join(root, "modern.docx"), "not real docx");
    writeFileSync(join(root, "slides.ppt"), "not real ppt");

    const manifest = createPrivateBookManifest(root);

    expect(manifest.files.find((file) => file.extension === "doc")?.primaryExtractor).toBe(
      "apache-tika"
    );
    expect(manifest.files.find((file) => file.extension === "ppt")?.primaryExtractor).toBe(
      "apache-tika"
    );
    expect(manifest.files.find((file) => file.extension === "docx")).toMatchObject({
      primaryExtractor: "docling",
      fallbackExtractors: ["apache-tika"]
    });
  });

  it("writes a local-private manifest file", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-ingest-"));
    const output = join(root, "data", "private", "book-manifest.json");
    writeFileSync(join(root, "sample.txt"), "private text");

    const manifest = writePrivateBookManifest(root, output, () => new Date("2026-01-01T00:00:00Z"));

    expect(existsSync(output)).toBe(true);
    expect(JSON.parse(readFileSync(output, "utf8"))).toMatchObject({
      policy: "local-private-only",
      files: [{ path: "sample.txt", usage: "local-private-only" }]
    });
    expect(manifest.files).toHaveLength(1);
  });

  it("builds a local-private text RAG index", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-ingest-"));
    mkdirSync(join(root, "天机道"));
    writeFileSync(
      join(root, "天机道", "紫微笔记.txt"),
      "命宫为排盘结构事实。\n\n紫微星落宫需要引用公式。"
    );
    writeFileSync(join(root, "天机道", "scan.pdf"), "not indexed yet");

    const index = createPrivateTextRagIndex(root, () => new Date("2026-01-01T00:00:00Z"));

    expect(index.usage).toBe("local-private-only");
    expect(index.sources).toHaveLength(1);
    expect(index.chunks).toHaveLength(2);
    expect(index.chunks[0]?.tags).toContain("紫微斗数");
    expect(index.chunks[0]?.tags).toContain("天机");
    expect(index.warnings[1]).toContain("1 files were skipped");
  });

  it("writes a local-private text RAG index file", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-ingest-"));
    const output = join(root, "data", "private", "rag-index.json");
    writeFileSync(join(root, "sample.txt"), "命宫事实。\n\n身宫事实。");

    const summary = writePrivateTextRagIndex(
      root,
      output,
      () => new Date("2026-01-01T00:00:00Z")
    );

    expect(summary).toMatchObject({
      sourceCount: 1,
      chunkCount: 2,
      skippedCount: 0
    });
    expect(JSON.parse(readFileSync(output, "utf8"))).toMatchObject({
      usage: "local-private-only",
      sources: [{ license: "user-private" }]
    });
  });

  it("merges private image caption artifacts into the RAG index", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-ingest-"));
    const captionDir = join(root, "captions");
    writeFileSync(join(root, "note.txt"), "命宫事实。");
    const artifact: ImageCaptionArtifact = {
      version: 1,
      kind: "image-caption",
      sourcePath: "book/紫微案例图.png",
      sourceHash: "source-hash",
      caption: "一张紫微斗数案例图。",
      tags: ["紫微斗数"],
      uncertainties: ["细节未核验"],
      provider: "openai-compatible",
      model: "test-vision-model",
      promptVersion: "ziwei-image-caption-v1",
      createdAt: "2026-07-13T00:00:00.000Z",
      trace: {
        rulesetId: "rag.image-caption-v1",
        formulaId: "caption.openai-compatible.test-vision-model.ziwei-image-caption-v1",
        sourceHint: "book/紫微案例图.png",
        confidence: "experimental"
      }
    };
    writeImageCaptionArtifact(artifact, join(captionDir, "chart.json"));

    const index = createPrivateRagIndex(root, captionDir);

    expect(index.sources).toHaveLength(2);
    expect(index.chunks).toHaveLength(2);
    expect(index.chunks.find((chunk) => chunk.modality === "image-caption")).toMatchObject({
      text: "一张紫微斗数案例图。",
      trace: {
        rulesetId: "rag.image-caption-v1",
        confidence: "experimental"
      }
    });
  });
});
