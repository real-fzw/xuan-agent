import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  documentArtifactToRagRecords,
  loadDocumentExtractionArtifacts,
  type DocumentExtractionArtifact
} from "./document-extraction.js";

describe("document extraction artifacts", () => {
  it("loads a traced artifact and converts it into provenance-aware chunks", () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-document-"));
    mkdirSync(join(root, "nested"));
    const artifact: DocumentExtractionArtifact = {
      version: 1,
      kind: "document-extraction",
      sourcePath: "book/紫微笔记.pdf",
      sourceHash: "source-hash",
      extractor: { id: "docling", version: "2.112.0" },
      createdAt: "2026-07-13T00:00:00.000Z",
      warnings: [],
      blocks: [
        {
          id: "text-1-1",
          type: "text",
          text: "紫微斗数资料片段。",
          locator: "page 3, text 1",
          page: 3,
          bbox: [10, 20, 30, 40],
          trace: {
            rulesetId: "rag.document-extraction-v1",
            formulaId: "extract.docling.2.112.0",
            sourceHint: "book/紫微笔记.pdf",
            confidence: "experimental"
          }
        }
      ]
    };
    writeFileSync(join(root, "nested", "artifact.json"), JSON.stringify(artifact));

    const [loaded] = loadDocumentExtractionArtifacts(root);
    const records = documentArtifactToRagRecords(loaded!, ["本地私有", "紫微斗数"]);

    expect(records.source).toMatchObject({
      title: "紫微笔记",
      usage: "local-private-only"
    });
    expect(records.chunks[0]).toMatchObject({
      locator: "page 3, text 1",
      provenance: {
        page: 3,
        bbox: [10, 20, 30, 40],
        extractorId: "docling",
        extractorVersion: "2.112.0"
      },
      trace: {
        rulesetId: "rag.document-extraction-v1",
        formulaId: "extract.docling.2.112.0"
      }
    });
  });
});
