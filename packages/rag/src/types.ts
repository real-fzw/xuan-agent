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

export interface SourceChunk {
  id: string;
  sourceId: string;
  locator?: string;
  text: string;
  tags: string[];
}

export interface Citation {
  sourceId: string;
  chunkId: string;
  locator?: string;
  title?: string;
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
