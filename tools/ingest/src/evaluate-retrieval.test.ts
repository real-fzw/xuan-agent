import { describe, expect, it } from "vitest";
import type { RagIndex } from "@xuan/rag";
import {
  evaluateRetrieval,
  formatEvalResult,
  validateEvalSuite,
  type RetrievalEvalSuite
} from "./evaluate-retrieval.js";

const index: RagIndex = {
  version: 1,
  generatedAt: "2026-07-14T00:00:00.000Z",
  usage: "repo-safe",
  sources: [
    {
      id: "original-fixture",
      title: "原创测试资料",
      language: "zh",
      license: "original",
      usage: "repo-safe"
    }
  ],
  chunks: [
    {
      id: "original-fixture#1",
      sourceId: "original-fixture",
      text: "命宫与身宫是排盘结构中的两个不同锚点。",
      tags: ["紫微斗数", "命宫", "身宫"]
    }
  ],
  warnings: []
};

const suite: RetrievalEvalSuite = {
  version: 1,
  name: "synthetic",
  description: "原创合成检索测试",
  cases: [
    {
      id: "hit",
      query: "命宫 身宫",
      expectedAnyOf: ["命宫", "身宫"]
    },
    {
      id: "miss",
      query: "四化",
      expectedAnyOf: ["四化"]
    }
  ]
};

describe("retrieval evaluation", () => {
  it("calculates hit rates without returning private chunk text", async () => {
    const result = await evaluateRetrieval(index, suite);

    expect(result).toMatchObject({
      caseCount: 2,
      hitAt1: 0.5,
      hitAt3: 0.5,
      hitAt5: 0.5,
      meanReciprocalRank: 0.5
    });
    expect(result.cases).toEqual([
      {
        id: "hit",
        firstRelevantRank: 1,
        relevantHitCount: 1,
        retrievedHitCount: 1
      },
      {
        id: "miss",
        firstRelevantRank: null,
        relevantHitCount: 0,
        retrievedHitCount: 0
      }
    ]);
    expect(formatEvalResult(result)).not.toContain("排盘结构");
  });

  it("rejects duplicate case ids", () => {
    expect(() =>
      validateEvalSuite({ ...suite, cases: [suite.cases[0], suite.cases[0]] })
    ).toThrow("must be unique");
  });
});
