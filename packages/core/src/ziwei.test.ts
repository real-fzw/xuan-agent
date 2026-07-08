import { describe, expect, it } from "vitest";
import { createZiweiChart } from "./ziwei.js";

describe("createZiweiChart", () => {
  it("creates an experimental Zi Wei chart from lunar input", () => {
    const chart = createZiweiChart({
      gender: "unknown",
      inputMode: "lunar",
      lunar: {
        year: 1990,
        month: 8,
        isLeapMonth: false,
        day: 15,
        hourBranch: "子"
      }
    });

    expect(chart.chartId).toMatch(/^zwds_/);
    expect(chart.palaces).toHaveLength(12);
    expect(chart.facts.some((fact) => fact.key === "life_palace.branch")).toBe(true);
    expect(chart.warnings.length).toBeGreaterThan(0);
  });
});
