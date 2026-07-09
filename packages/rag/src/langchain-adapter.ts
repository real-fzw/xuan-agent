import { Document, type DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever, type BaseRetrieverInput } from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { tool } from "langchain";
import { z } from "zod";
import { createRetrieverFromIndex } from "./index-retriever.js";
import type {
  Citation,
  KnowledgeSource,
  RagIndex,
  RetrievalHit,
  RetrievalQuery,
  Retriever,
  SourceChunk
} from "./types.js";

export interface XuanLangChainMetadata extends Record<string, unknown> {
  sourceId: string;
  chunkId: string;
  locator?: string;
  title?: string;
  author?: string;
  language?: KnowledgeSource["language"];
  license?: KnowledgeSource["license"];
  usage?: KnowledgeSource["usage"];
  tags: string[];
  citation: Citation;
  score?: number;
}

export interface XuanLangChainRetrieverInput extends BaseRetrieverInput {
  retriever: Retriever;
  sources?: KnowledgeSource[];
  topK?: number;
  filterTags?: string[];
}

export type XuanLangChainRetrieverOptions = Omit<
  XuanLangChainRetrieverInput,
  "retriever" | "sources"
>;

export interface XuanRagToolHit {
  text: string;
  score: number;
  tags: string[];
  citation: Citation;
  source?: {
    title?: string;
    author?: string;
    license?: KnowledgeSource["license"];
    usage?: KnowledgeSource["usage"];
  };
}

export interface XuanRagToolResult {
  query: RetrievalQuery;
  usage: RagIndex["usage"] | "unknown";
  groundingPolicy: "chart-facts-and-citations-only";
  hits: XuanRagToolHit[];
}

export interface XuanRagLangChainToolOptions {
  name?: string;
  description?: string;
  topK?: number;
  filterTags?: string[];
  sources?: KnowledgeSource[];
  usage?: RagIndex["usage"] | "unknown";
}

export const xuanRagSearchSchema = z.object({
  query: z.string().min(1).describe("需要检索的紫微斗数问题或关键词。"),
  tags: z.array(z.string()).optional().describe("可选主题标签，例如命宫、身宫、主星、四化。"),
  topK: z.number().int().min(1).max(10).optional().describe("最多返回多少条引用片段。")
});

export type XuanRagToolInput = z.input<typeof xuanRagSearchSchema>;

type XuanRagToolRuntimeInput = z.output<typeof xuanRagSearchSchema>;

function sourceMap(sources: KnowledgeSource[] = []): Map<string, KnowledgeSource> {
  return new Map(sources.map((source) => [source.id, source]));
}

function citationForChunk(chunk: SourceChunk, source?: KnowledgeSource): Citation {
  return {
    sourceId: chunk.sourceId,
    chunkId: chunk.id,
    locator: chunk.locator,
    title: source?.title
  };
}

export function sourceChunkToLangChainDocument(
  chunk: SourceChunk,
  source?: KnowledgeSource
): Document<XuanLangChainMetadata> {
  const citation = citationForChunk(chunk, source);

  return new Document<XuanLangChainMetadata>({
    id: chunk.id,
    pageContent: chunk.text,
    metadata: {
      sourceId: chunk.sourceId,
      chunkId: chunk.id,
      locator: chunk.locator,
      title: source?.title,
      author: source?.author,
      language: source?.language,
      license: source?.license,
      usage: source?.usage,
      tags: chunk.tags,
      citation
    }
  });
}

export function retrievalHitToLangChainDocument(
  hit: RetrievalHit,
  source?: KnowledgeSource
): Document<XuanLangChainMetadata> {
  const document = sourceChunkToLangChainDocument(hit.chunk, source);

  return new Document<XuanLangChainMetadata>({
    id: document.id,
    pageContent: document.pageContent,
    metadata: {
      ...document.metadata,
      citation: hit.citation,
      score: hit.score
    }
  });
}

export function ragIndexToLangChainDocuments(index: RagIndex): Document<XuanLangChainMetadata>[] {
  const sources = sourceMap(index.sources);

  return index.chunks.map((chunk) => sourceChunkToLangChainDocument(chunk, sources.get(chunk.sourceId)));
}

export class XuanLangChainRetriever extends BaseRetriever<XuanLangChainMetadata> {
  lc_namespace = ["xuan", "rag"];

  private readonly sourceById: Map<string, KnowledgeSource>;
  private readonly retriever: Retriever;
  private readonly topK?: number;
  private readonly filterTags?: string[];

  constructor(fields: XuanLangChainRetrieverInput) {
    const { retriever, sources, topK, filterTags, ...baseFields } = fields;
    super(baseFields);
    this.retriever = retriever;
    this.sourceById = sourceMap(sources);
    this.topK = topK;
    this.filterTags = filterTags;
  }

  async _getRelevantDocuments(
    query: string,
    _callbacks?: CallbackManagerForRetrieverRun
  ): Promise<DocumentInterface<XuanLangChainMetadata>[]> {
    const hits = await this.retriever.search({
      text: query,
      tags: this.filterTags,
      topK: this.topK
    });

    return hits.map((hit) => retrievalHitToLangChainDocument(hit, this.sourceById.get(hit.chunk.sourceId)));
  }
}

export function createLangChainRetrieverFromIndex(
  index: RagIndex,
  options: XuanLangChainRetrieverOptions = {}
): XuanLangChainRetriever {
  return new XuanLangChainRetriever({
    ...options,
    retriever: createRetrieverFromIndex(index),
    sources: index.sources
  });
}

function retrievalHitToToolHit(hit: RetrievalHit, source?: KnowledgeSource): XuanRagToolHit {
  return {
    text: hit.chunk.text,
    score: hit.score,
    tags: hit.chunk.tags,
    citation: hit.citation,
    source: source
      ? {
          title: source.title,
          author: source.author,
          license: source.license,
          usage: source.usage
        }
      : undefined
  };
}

export function createXuanRagLangChainTool(
  retriever: Retriever,
  options: XuanRagLangChainToolOptions = {}
): StructuredToolInterface<typeof xuanRagSearchSchema, XuanRagToolInput, XuanRagToolResult> {
  const sourceById = sourceMap(options.sources);

  return tool(
    async (input: XuanRagToolRuntimeInput): Promise<XuanRagToolResult> => {
      const query: RetrievalQuery = {
        text: input.query,
        tags: input.tags ?? options.filterTags,
        topK: input.topK ?? options.topK ?? 5
      };
      const hits = await retriever.search(query);

      return {
        query,
        usage: options.usage ?? "unknown",
        groundingPolicy: "chart-facts-and-citations-only",
        hits: hits.map((hit) => retrievalHitToToolHit(hit, sourceById.get(hit.chunk.sourceId)))
      };
    },
    {
      name: options.name ?? "xuan_rag_search",
      description:
        options.description ??
        "检索紫微斗数本地知识库，返回可用于解读的原文片段、citation 和来源使用范围。解释层只能基于排盘事实与这些 citation 作答。",
      schema: xuanRagSearchSchema
    }
  ) as StructuredToolInterface<typeof xuanRagSearchSchema, XuanRagToolInput, XuanRagToolResult>;
}

export function createXuanRagLangChainToolFromIndex(
  index: RagIndex,
  options: Omit<XuanRagLangChainToolOptions, "sources" | "usage"> = {}
): StructuredToolInterface<typeof xuanRagSearchSchema, XuanRagToolInput, XuanRagToolResult> {
  return createXuanRagLangChainTool(createRetrieverFromIndex(index), {
    ...options,
    sources: index.sources,
    usage: index.usage
  });
}
