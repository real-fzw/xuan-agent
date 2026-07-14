import { describe, expect, it } from "vitest";
import {
  createLangChainRetrieverFromIndex,
  createXuanRagLangChainToolFromIndex,
  ragIndexToLangChainDocuments,
  type XuanRagToolResult
} from "./langchain-adapter.js";
import type { RagIndex } from "./types.js";

const fixtureIndex: RagIndex = {
  version: 1,
  generatedAt: "2026-01-01T00:00:00.000Z",
  usage: "local-private-only",
  sources: [
    {
      id: "original-note",
      title: "原创紫微笔记",
      author: "XuanAgent",
      language: "zh",
      license: "original",
      usage: "repo-safe"
    }
  ],
  chunks: [
    {
      id: "original-note#p1-1",
      sourceId: "original-note",
      locator: "paragraph 1",
      text: "命宫是排盘结构事实，解释时必须带引用。",
      tags: ["命宫", "紫微斗数"]
    },
    {
      id: "original-note#p2-1",
      sourceId: "original-note",
      locator: "paragraph 2",
      text: "紫微星落宫应来自确定性安星公式。",
      tags: ["紫微星", "主星"]
    }
  ],
  warnings: []
};

describe("LangChain adapter", () => {
  it("converts a RAG index into LangChain documents with citation metadata", () => {
    const documents = ragIndexToLangChainDocuments(fixtureIndex);

    expect(documents).toHaveLength(2);
    expect(documents[0]?.pageContent).toContain("命宫");
    expect(documents[0]?.metadata).toMatchObject({
      sourceId: "original-note",
      chunkId: "original-note#p1-1",
      title: "原创紫微笔记",
      usage: "repo-safe",
      citation: {
        sourceId: "original-note",
        chunkId: "original-note#p1-1",
        locator: "paragraph 1",
        title: "原创紫微笔记"
      }
    });
  });

  it("preserves image caption provenance and inference trace", () => {
    const captionIndex: RagIndex = {
      ...fixtureIndex,
      chunks: [
        {
          id: "original-note#image-1",
          sourceId: "original-note",
          locator: "image chart-1.png",
          text: "一张用于检索的紫微斗数命盘案例图。",
          tags: ["紫微斗数", "命盘案例"],
          modality: "image-caption",
          provenance: {
            sourcePath: "private/chart-1.png",
            assetPath: "private/chart-1.png",
            extractorId: "image-caption-worker",
            extractorVersion: "0.1.0"
          },
          trace: {
            rulesetId: "rag.image-caption-v1",
            formulaId: "caption.prompt.ziwei-image-v1",
            sourceHint: "private/chart-1.png",
            confidence: "experimental"
          }
        }
      ]
    };

    const [document] = ragIndexToLangChainDocuments(captionIndex);

    expect(document?.metadata).toMatchObject({
      modality: "image-caption",
      citation: {
        assetPath: "private/chart-1.png"
      },
      trace: {
        rulesetId: "rag.image-caption-v1",
        formulaId: "caption.prompt.ziwei-image-v1",
        confidence: "experimental"
      }
    });
  });

  it("wraps the local retriever as a LangChain BaseRetriever", async () => {
    const retriever = createLangChainRetrieverFromIndex(fixtureIndex, { topK: 1 });
    const documents = await retriever.invoke("紫微星");

    expect(documents).toHaveLength(1);
    expect(documents[0]?.metadata.score).toBeGreaterThan(0);
    expect(documents[0]?.metadata.citation.chunkId).toBe("original-note#p2-1");
  });

  it("creates an agent-ready LangChain tool that returns grounded citations", async () => {
    const ragTool = createXuanRagLangChainToolFromIndex(fixtureIndex, { topK: 1 });
    const result = (await ragTool.invoke({ query: "命宫" })) as XuanRagToolResult;

    expect(result).toMatchObject({
      usage: "local-private-only",
      groundingPolicy: "chart-facts-and-citations-only",
      hits: [
        {
          citation: {
            sourceId: "original-note",
            chunkId: "original-note#p1-1"
          },
          source: {
            title: "原创紫微笔记",
            usage: "repo-safe"
          }
        }
      ]
    });
  });
});
