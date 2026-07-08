import type { KnowledgeSource, SourceChunk } from "./types.js";

export function chunkPlainTextByParagraphs(
  source: KnowledgeSource,
  text: string,
  tags: string[] = []
): SourceChunk[] {
  return text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => ({
      id: `${source.id}#p${index + 1}`,
      sourceId: source.id,
      locator: `paragraph ${index + 1}`,
      text: chunk,
      tags
    }));
}
