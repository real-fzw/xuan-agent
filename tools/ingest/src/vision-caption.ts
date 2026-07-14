import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import type {
  ImageCaptionSourceChunk,
  InferenceTrace,
  KnowledgeSource
} from "@xuan/rag";

export const IMAGE_CAPTION_PROMPT_VERSION = "ziwei-image-caption-v1";

export const IMAGE_CAPTION_PROMPT = `你正在为一个紫微斗数 RAG 知识库生成图片 Caption。
只描述图片中清晰可见的整体主题、图表类型、显著结构和可能相关的知识标签。
不要把细小文字、精确空间位置、星曜落宫或出生信息当作可靠事实；不确定内容必须写入 uncertainties。
只返回 JSON，不要使用 Markdown：
{"caption":"简洁中文描述","tags":["标签"],"uncertainties":["不确定项"]}`;

export interface ImageCaptionArtifact {
  version: 1;
  kind: "image-caption";
  sourcePath: string;
  sourceHash: string;
  caption: string;
  tags: string[];
  uncertainties: string[];
  provider: "openai-compatible";
  model: string;
  promptVersion: typeof IMAGE_CAPTION_PROMPT_VERSION;
  createdAt: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  trace: InferenceTrace;
}

export interface CaptionImageOptions {
  imagePath: string;
  sourceHint: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  allowRemotePrivate?: boolean;
  privateRoots?: string[];
  now?: () => Date;
  fetchImpl?: typeof fetch;
}

export interface CaptionRagRecords {
  source: KnowledgeSource;
  chunk: ImageCaptionSourceChunk;
}

const MEDIA_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function sha256(input: Uint8Array | string): string {
  return createHash("sha256").update(input).digest("hex");
}

function isPathInside(path: string, root: string): boolean {
  const absolutePath = resolve(path);
  const absoluteRoot = resolve(root);
  return absolutePath === absoluteRoot || absolutePath.startsWith(`${absoluteRoot}${sep}`);
}

function chatCompletionsUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/+$/, "");
  return normalized.endsWith("/v1")
    ? `${normalized}/chat/completions`
    : `${normalized}/v1/chat/completions`;
}

function responseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new Error("Vision API returned an invalid response object.");
  }

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") {
    throw new Error("Vision API response did not include choices[0].");
  }

  const content = (choices[0] as { message?: { content?: unknown } }).message?.content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") {
          return "";
        }
        return typeof (part as { text?: unknown }).text === "string"
          ? (part as { text: string }).text
          : "";
      })
      .join("\n");
  }

  throw new Error("Vision API response did not include text content.");
}

function parseCaptionJson(content: string): {
  caption: string;
  tags: string[];
  uncertainties: string[];
} {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    const fallbackCaption = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    if (!fallbackCaption) {
      throw new Error("Vision API response did not include caption text.");
    }
    return {
      caption: fallbackCaption,
      tags: [],
      uncertainties: ["模型未按约定返回 JSON，Caption 已按纯文本降级保存。"]
    };
  }

  const parsed = JSON.parse(content.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
  if (typeof parsed.caption !== "string" || !parsed.caption.trim()) {
    throw new Error("Vision API response did not include a non-empty caption.");
  }

  const stringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

  return {
    caption: parsed.caption.trim(),
    tags: stringArray(parsed.tags),
    uncertainties: stringArray(parsed.uncertainties)
  };
}

function usageFromPayload(payload: unknown): ImageCaptionArtifact["usage"] {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  const usage = (payload as { usage?: Record<string, unknown> }).usage;
  if (!usage) {
    return undefined;
  }

  const numeric = (value: unknown): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

  return {
    promptTokens: numeric(usage.prompt_tokens),
    completionTokens: numeric(usage.completion_tokens),
    totalTokens: numeric(usage.total_tokens)
  };
}

export async function captionImageWithOpenAiCompatibleApi(
  options: CaptionImageOptions
): Promise<ImageCaptionArtifact> {
  if (!options.apiKey) {
    throw new Error("XUAN_VISION_API_KEY is required.");
  }
  if (!options.baseUrl) {
    throw new Error("XUAN_VISION_BASE_URL is required.");
  }

  const privateSource = (options.privateRoots ?? []).some((root) =>
    isPathInside(options.imagePath, root)
  );
  if (privateSource && !options.allowRemotePrivate) {
    throw new Error(
      "Remote captioning of a private asset is disabled. Set XUAN_ALLOW_REMOTE_PRIVATE=true after reviewing the provider policy."
    );
  }

  const extension = extname(options.imagePath).toLowerCase();
  const mediaType = MEDIA_TYPES[extension];
  if (!mediaType) {
    throw new Error(`Unsupported image type: ${extension || "unknown"}`);
  }

  const image = readFileSync(options.imagePath);
  const response = await (options.fetchImpl ?? fetch)(chatCompletionsUrl(options.baseUrl), {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${image.toString("base64")}`,
                detail: "high"
              }
            },
            { type: "text", text: IMAGE_CAPTION_PROMPT }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 500);
    throw new Error(`Vision API request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as unknown;
  const parsed = parseCaptionJson(responseText(payload));
  const modelId = options.model.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");

  return {
    version: 1,
    kind: "image-caption",
    sourcePath: options.sourceHint,
    sourceHash: sha256(image),
    caption: parsed.caption,
    tags: parsed.tags,
    uncertainties: parsed.uncertainties,
    provider: "openai-compatible",
    model: options.model,
    promptVersion: IMAGE_CAPTION_PROMPT_VERSION,
    createdAt: (options.now ?? (() => new Date()))().toISOString(),
    usage: usageFromPayload(payload),
    trace: {
      rulesetId: "rag.image-caption-v1",
      formulaId: `caption.openai-compatible.${modelId}.${IMAGE_CAPTION_PROMPT_VERSION}`,
      sourceHint: options.sourceHint,
      confidence: "experimental",
      notes: parsed.uncertainties
    }
  };
}

export function writeImageCaptionArtifact(
  artifact: ImageCaptionArtifact,
  outputFile: string
): void {
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
}

function sourceIdFromCaptionPath(path: string): string {
  return path
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function captionArtifactToRagRecords(
  artifact: ImageCaptionArtifact
): CaptionRagRecords {
  const sourceId = sourceIdFromCaptionPath(artifact.sourcePath);
  const tags = [...new Set(["本地私有", "图片Caption", ...artifact.tags])];
  return {
    source: {
      id: sourceId,
      title: basename(artifact.sourcePath).replace(/\.[^.]+$/, ""),
      language: "zh",
      license: "user-private",
      usage: "local-private-only",
      notes: `Local private image caption: ${artifact.sourcePath}`
    },
    chunk: {
      id: `${sourceId}#caption-1`,
      sourceId,
      locator: `image ${basename(artifact.sourcePath)}`,
      text: artifact.caption,
      tags,
      modality: "image-caption",
      provenance: {
        sourcePath: artifact.sourcePath,
        assetPath: artifact.sourcePath,
        extractorId: artifact.provider,
        extractorVersion: artifact.promptVersion,
        sourceHash: artifact.sourceHash,
        contentHash: sha256(artifact.caption)
      },
      trace: artifact.trace
    }
  };
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

export function loadImageCaptionArtifacts(inputDir: string): ImageCaptionArtifact[] {
  return walkJsonFiles(inputDir).map((path) => {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as ImageCaptionArtifact;
    if (
      parsed.version !== 1 ||
      parsed.kind !== "image-caption" ||
      typeof parsed.caption !== "string" ||
      !parsed.trace?.rulesetId ||
      !parsed.trace?.formulaId ||
      !parsed.trace?.sourceHint ||
      !parsed.trace?.confidence
    ) {
      throw new Error(`Invalid image caption artifact: ${relative(inputDir, path)}`);
    }
    return parsed;
  });
}
