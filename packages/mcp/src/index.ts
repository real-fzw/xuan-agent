import { createZiweiChart } from "@xuan/core";
import type { BirthProfile } from "@xuan/core";

export const mcpTools = [
  {
    name: "ziwei_create_chart",
    description: "Create an experimental Zi Wei Dou Shu chart from lunar birth input.",
    inputSchema: {
      type: "object",
      additionalProperties: true
    },
    handler: (input: BirthProfile) => createZiweiChart(input)
  }
] as const;
