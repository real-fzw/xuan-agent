export interface KnowledgeSource {
  id: string;
  title: string;
  author?: string;
  edition?: string;
  language: "zh" | "en" | "other";
  license: "public-domain" | "original" | "user-private" | "licensed" | "unknown";
  usage: "repo-safe" | "local-private-only";
  notes?: string;
}

export type SourceChunkModality = "text" | "image-caption";

export type BoundingBox = readonly [number, number, number, number];

export interface ChunkProvenance {
  sourcePath: string;
  page?: number;
  bbox?: BoundingBox;
  assetPath?: string;
  extractorId: string;
  extractorVersion: string;
  sourceHash?: string;
  contentHash?: string;
}

export interface InferenceTrace {
  rulesetId: string;
  formulaId: string;
  sourceHint: string;
  confidence: "experimental" | "fixture-backed" | "verified";
  notes?: string[];
}

interface BaseSourceChunk {
  id: string;
  sourceId: string;
  locator?: string;
  text: string;
  tags: string[];
}

export interface TextSourceChunk extends BaseSourceChunk {
  modality?: "text";
  provenance?: ChunkProvenance;
  trace?: InferenceTrace;
}

export interface ImageCaptionSourceChunk extends BaseSourceChunk {
  modality: "image-caption";
  provenance: ChunkProvenance;
  trace: InferenceTrace;
}

export type SourceChunk = TextSourceChunk | ImageCaptionSourceChunk;

export interface Citation {
  sourceId: string;
  chunkId: string;
  locator?: string;
  title?: string;
  page?: number;
  bbox?: BoundingBox;
  assetPath?: string;
}

export interface RetrievalQuery {
  text: string;
  tags?: string[];
  topK?: number;
}

export interface RetrievalHit {
  chunk: SourceChunk;
  citation: Citation;
  score: number;
}

export interface Retriever {
  search(query: RetrievalQuery): Promise<RetrievalHit[]>;
}

export interface RagIndex {
  version: 1;
  generatedAt: string;
  usage: "repo-safe" | "local-private-only";
  sources: KnowledgeSource[];
  chunks: SourceChunk[];
  warnings: string[];
}
