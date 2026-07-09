import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createZiweiChart } from "@xuan/core";
import type { BirthProfile } from "@xuan/core";
import { createRetrieverFromIndex } from "@xuan/rag";
import type { RagIndex, RetrievalHit, RetrievalQuery, Retriever } from "@xuan/rag";
import { indexHtml } from "./page.js";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4317;
const PRIVATE_RAG_INDEX_FILE = resolve("data/private/rag-index.json");
const RAG_FRAMEWORK = "LangChain.js";

interface RagRuntime {
  index?: RagIndex;
  retriever?: Retriever;
  error?: string;
}

interface RagSearchRequest {
  text?: string;
  tags?: string[];
  topK?: number;
}

function send(
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType: string
): void {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": contentType
  });
  response.end(body);
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  send(response, statusCode, JSON.stringify(body), "application/json; charset=utf-8");
}

function readJson(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 32_000) {
        reject(new Error("请求体过大。"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body.length > 0 ? JSON.parse(body) : {});
      } catch {
        reject(new Error("请求体必须是合法 JSON。"));
      }
    });
    request.on("error", reject);
  });
}

function isBirthProfile(value: unknown): value is BirthProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BirthProfile>;
  return candidate.inputMode === "lunar" || candidate.inputMode === "solar";
}

function isRagSearchRequest(value: unknown): value is RagSearchRequest {
  return Boolean(value && typeof value === "object" && "text" in value);
}

function loadPrivateRag(): RagRuntime {
  if (!existsSync(PRIVATE_RAG_INDEX_FILE)) {
    return {
      error:
        "未找到 data/private/rag-index.json。请先运行：node tools/ingest/dist/index.js index-text book data/private/rag-index.json"
    };
  }

  try {
    const index = JSON.parse(readFileSync(PRIVATE_RAG_INDEX_FILE, "utf8")) as RagIndex;
    return {
      index,
      retriever: createRetrieverFromIndex(index)
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "读取本地 RAG index 失败。"
    };
  }
}

function hitToResponse(hit: RetrievalHit) {
  const text = hit.chunk.text.replace(/\s+/g, " ").trim();
  return {
    score: hit.score,
    citation: hit.citation,
    tags: hit.chunk.tags,
    snippet: text.length > 180 ? `${text.slice(0, 180)}...` : text
  };
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/") {
    send(response, 200, indexHtml, "text/html; charset=utf-8");
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/rag/status") {
    const runtime = loadPrivateRag();
    sendJson(response, 200, {
      ready: Boolean(runtime.index && runtime.retriever),
      error: runtime.error,
      sourceCount: runtime.index?.sources.length ?? 0,
      chunkCount: runtime.index?.chunks.length ?? 0,
      usage: runtime.index?.usage,
      framework: RAG_FRAMEWORK
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/ziwei/chart") {
    try {
      const body = await readJson(request);
      if (!isBirthProfile(body)) {
        sendJson(response, 400, {
          error: "请求体必须是 BirthProfile。当前本地页面默认使用农历输入。"
        });
        return;
      }

      sendJson(response, 200, createZiweiChart(body));
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "排盘失败。"
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/rag/search") {
    try {
      const runtime = loadPrivateRag();
      if (!runtime.retriever || !runtime.index) {
        sendJson(response, 404, {
          error: runtime.error ?? "本地 RAG index 未准备好。"
        });
        return;
      }

      const body = await readJson(request);
      if (!isRagSearchRequest(body) || !body.text?.trim()) {
        sendJson(response, 400, { error: "请输入检索问题。" });
        return;
      }

      const query: RetrievalQuery = {
        text: body.text,
        tags: body.tags,
        topK: body.topK ?? 5
      };
      const hits = await runtime.retriever.search(query);
      sendJson(response, 200, {
        query,
        hits: hits.map(hitToResponse),
        sourceCount: runtime.index.sources.length,
        chunkCount: runtime.index.chunks.length,
        framework: RAG_FRAMEWORK
      });
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "检索失败。"
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function listen(port: number): void {
  const server = createServer((request, response) => {
    void handleRequest(request, response);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if ((error.code === "EADDRINUSE" || error.code === "EACCES") && port < DEFAULT_PORT + 20) {
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, DEFAULT_HOST, () => {
    console.log(`XuanAgent Web 工作台已启动：http://${DEFAULT_HOST}:${port}`);
  });
}

listen(Number(process.env.PORT ?? DEFAULT_PORT));
