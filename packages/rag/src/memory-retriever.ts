import type { KnowledgeSource, RetrievalHit, RetrievalQuery, Retriever, SourceChunk } from "./types.js";

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\s,.;:!?，。；：！？、]+/)
    .filter(Boolean);
}

export class MemoryRetriever implements Retriever {
  private readonly sourceById = new Map<string, KnowledgeSource>();

  constructor(
    sources: KnowledgeSource[],
    private readonly chunks: SourceChunk[]
  ) {
    for (const source of sources) {
      this.sourceById.set(source.id, source);
    }
  }

  async search(query: RetrievalQuery): Promise<RetrievalHit[]> {
    const tokens = tokenize(query.text);
    const requiredTags = new Set(query.tags ?? []);
    const topK = query.topK ?? 5;

    return this.chunks
      .map((chunk) => {
        const text = chunk.text.toLowerCase();
        const tokenScore = tokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
        const tagScore = [...requiredTags].reduce(
          (score, tag) => score + (chunk.tags.includes(tag) ? 1 : 0),
          0
        );
        return { chunk, score: tokenScore + tagScore * 2 };
      })
      .filter((hit) => hit.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
      .map((hit) => {
        const source = this.sourceById.get(hit.chunk.sourceId);
        return {
          ...hit,
          citation: {
            sourceId: hit.chunk.sourceId,
            chunkId: hit.chunk.id,
            locator: hit.chunk.locator,
            title: source?.title
          }
        };
      });
  }
}
