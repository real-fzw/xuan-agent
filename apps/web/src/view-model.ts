import type { ZiweiChart } from "@xuan/core";

export function summarizeChart(chart: ZiweiChart): string {
  const life = chart.facts.find((fact) => fact.key === "life_palace.branch")?.value;
  const body = chart.facts.find((fact) => fact.key === "body_palace.branch")?.value;
  return `命宫 ${life ?? "未知"}，身宫 ${body ?? "未知"}。`;
}
