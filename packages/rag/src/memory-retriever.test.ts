import { describe, expect, it } from "vitest";
import { MemoryRetriever } from "./memory-retriever.js";
import type { KnowledgeSource, SourceChunk } from "./types.js";

const source: KnowledgeSource = {
  id: "source-1",
  title: "原创测试来源",
  language: "zh",
  license: "original",
  usage: "repo-safe"
};

describe("MemoryRetriever", () => {
  it("matches free-text query tokens against chunk tags", async () => {
    const chunks: SourceChunk[] = [
      {
        id: "source-1#p1",
        sourceId: "source-1",
        text: "这段文本没有直接出现检索标签。",
        tags: ["天纪", "紫微斗数"]
      }
    ];
    const retriever = new MemoryRetriever([source], chunks);

    const hits = await retriever.search({ text: "天纪", topK: 1 });

    expect(hits).toHaveLength(1);
    expect(hits[0]?.citation).toMatchObject({
      sourceId: "source-1",
      chunkId: "source-1#p1",
      title: "原创测试来源"
    });
  });
});
