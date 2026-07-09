import type { ZiweiChart } from "@xuan/core";

export type DisplayLanguage = "zh" | "en";

export function summarizeChart(
  chart: ZiweiChart,
  language: DisplayLanguage = "zh"
): string {
  const life = chart.facts.find((fact) => fact.key === "life_palace.branch")?.value;
  const body = chart.facts.find((fact) => fact.key === "body_palace.branch")?.value;
  const bureau = chart.facts.find((fact) => fact.key === "five_element_bureau")
    ?.value as { label?: string } | undefined;
  const ziwei = chart.facts.find((fact) => fact.key === "star.ziwei.branch")?.value;

  if (language === "en") {
    return `Life palace ${life ?? "unknown"}, body palace ${body ?? "unknown"}, ${bureau?.label ?? "five-element bureau unknown"}, Zi Wei ${ziwei ?? "unknown"}.`;
  }

  return `命宫 ${life ?? "未知"}，身宫 ${body ?? "未知"}，${bureau?.label ?? "五行局未知"}，紫微 ${ziwei ?? "未知"}。`;
}
