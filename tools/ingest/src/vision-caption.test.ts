import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it, vi } from "vitest";
import {
  captionArtifactToRagRecords,
  captionImageWithOpenAiCompatibleApi
} from "./vision-caption.js";

describe("vision caption provider", () => {
  it("blocks private image upload unless explicitly enabled", async () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-caption-"));
    const imagePath = join(root, "chart.png");
    writeFileSync(imagePath, "fake png");

    await expect(
      captionImageWithOpenAiCompatibleApi({
        imagePath,
        sourceHint: "book/chart.png",
        baseUrl: "https://example.invalid",
        apiKey: "test-key",
        model: "test-vision-model",
        privateRoots: [root],
        fetchImpl: vi.fn()
      })
    ).rejects.toThrow("XUAN_ALLOW_REMOTE_PRIVATE=true");
  });

  it("creates a traced caption artifact and RAG chunk", async () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-caption-"));
    const imagePath = join(root, "chart.png");
    writeFileSync(imagePath, "fake png");
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "test-vision-model",
          choices: [
            {
              message: {
                content: JSON.stringify({
                  caption: "一张紫微斗数命盘案例图。",
                  tags: ["紫微斗数", "命盘案例"],
                  uncertainties: ["细小文字未核验"]
                })
              }
            }
          ],
          usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const artifact = await captionImageWithOpenAiCompatibleApi({
      imagePath,
      sourceHint: "book/chart.png",
      baseUrl: "https://gateway.example/v1",
      apiKey: "test-key",
      model: "test-vision-model",
      allowRemotePrivate: true,
      privateRoots: [root],
      now: () => new Date("2026-07-13T00:00:00Z"),
      fetchImpl
    });
    const records = captionArtifactToRagRecords(artifact);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://gateway.example/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
    expect(artifact).toMatchObject({
      caption: "一张紫微斗数命盘案例图。",
      model: "test-vision-model",
      usage: { totalTokens: 120 },
      trace: {
        rulesetId: "rag.image-caption-v1",
        sourceHint: "book/chart.png",
        confidence: "experimental"
      }
    });
    expect(records.chunk).toMatchObject({
      modality: "image-caption",
      tags: ["本地私有", "图片Caption", "紫微斗数", "命盘案例"],
      provenance: { assetPath: "book/chart.png" },
      trace: { formulaId: expect.stringContaining("test-vision-model") }
    });
  });

  it("falls back to plain text and records uncertainty", async () => {
    const root = mkdtempSync(join(tmpdir(), "xuan-caption-"));
    const imagePath = join(root, "chart.png");
    writeFileSync(imagePath, "fake png");

    const artifact = await captionImageWithOpenAiCompatibleApi({
      imagePath,
      sourceHint: "fixtures/chart.png",
      baseUrl: "https://gateway.example",
      apiKey: "test-key",
      model: "test-vision-model",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "一张合成的紫微斗数测试图。" } }]
          }),
          { status: 200 }
        )
    });

    expect(artifact.caption).toBe("一张合成的紫微斗数测试图。");
    expect(artifact.tags).toEqual([]);
    expect(artifact.uncertainties[0]).toContain("纯文本降级");
  });
});
