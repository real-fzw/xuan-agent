import { createZiweiChart } from "@xuan/core";
import type { BirthProfile } from "@xuan/core";

export const mcpTools = [
  {
    name: "ziwei_create_chart",
    description:
      "生成带溯源信息的紫微斗数核心命盘，包括十二宫、五行局和紫微星落宫。",
    inputSchema: {
      type: "object",
      additionalProperties: true
    },
    handler: (input: BirthProfile) => createZiweiChart(input)
  }
] as const;
