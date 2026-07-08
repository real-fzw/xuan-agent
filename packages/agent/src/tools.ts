import { createZiweiChart } from "@xuan/core";
import type { BirthProfile } from "@xuan/core";
import type { Retriever } from "@xuan/rag";

export interface ToolDefinition<TInput, TOutput> {
  name: string;
  description: string;
  run(input: TInput): Promise<TOutput> | TOutput;
}

export function createZiweiChartTool(): ToolDefinition<BirthProfile, ReturnType<typeof createZiweiChart>> {
  return {
    name: "ziwei_create_chart",
    description: "Create a Zi Wei Dou Shu chart from validated birth data.",
    run: createZiweiChart
  };
}

export function createRetrievalTool(retriever: Retriever) {
  return {
    name: "xuan_retrieve_sources",
    description: "Retrieve source chunks for a metaphysics interpretation question.",
    run: retriever.search.bind(retriever)
  };
}
