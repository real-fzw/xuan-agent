import { MemoryRetriever } from "./memory-retriever.js";
import type { RagIndex, Retriever } from "./types.js";

export function createRetrieverFromIndex(index: RagIndex): Retriever {
  return new MemoryRetriever(index.sources, index.chunks);
}
