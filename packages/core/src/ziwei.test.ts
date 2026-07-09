import { describe, expect, it } from "vitest";
import type {
  CalendarProvider,
  FiveElementBureau,
  FormulaTrace,
  MajorStar,
  StemBranch,
  ZiweiChart
} from "./types.js";
import { MAJOR_STARS } from "./constants.js";
import { calculateFiveElementBureauFromStemBranch } from "./nayin.js";
import { ziweiCoreFixtures } from "./ziwei.fixtures.js";
import { createZiweiChart } from "./ziwei.js";

function factValue<TValue>(chart: ZiweiChart, key: string): TValue {
  const fact = chart.facts.find((candidate) => candidate.key === key);
  expect(fact, `Missing fact ${key}`).toBeDefined();
  return fact?.value as TValue;
}

function expectTrace(trace: FormulaTrace): void {
  expect(trace.rulesetId).toBeTruthy();
  expect(trace.formulaId).toBeTruthy();
  expect(trace.sourceHint).toBeTruthy();
  expect(trace.confidence).toBeTruthy();
}

function expectAllFactsToBeTraced(chart: ZiweiChart): void {
  for (const fact of chart.facts) {
    expectTrace(fact.trace);
  }

  for (const palace of chart.palaces) {
    for (const fact of palace.facts) {
      expectTrace(fact.trace);
    }

    for (const star of palace.stars) {
      expectTrace(star.trace);
    }
  }
}

const starFactKeyByName: Record<MajorStar, string> = {
  紫微: "star.ziwei.branch",
  天机: "star.tianji.branch",
  太阳: "star.taiyang.branch",
  武曲: "star.wuqu.branch",
  天同: "star.tiantong.branch",
  廉贞: "star.lianzhen.branch",
  天府: "star.tianfu.branch",
  太阴: "star.taiyin.branch",
  贪狼: "star.tanlang.branch",
  巨门: "star.jumen.branch",
  天相: "star.tianxiang.branch",
  天梁: "star.tianliang.branch",
  七杀: "star.qisha.branch",
  破军: "star.pojun.branch"
};

describe("createZiweiChart", () => {
  it.each(ziweiCoreFixtures)(
    "creates a fixture-backed Zi Wei chart: $id",
    (fixture) => {
      const chart = createZiweiChart(fixture.birth, {
        now: () => new Date("2026-01-01T00:00:00.000Z")
      });

      expect(chart.chartId).toMatch(/^zwds_/);
      expect(chart.rulesetId).toBe("ziwei.common-v0");
      expect(chart.createdAt).toBe("2026-01-01T00:00:00.000Z");
      expect(chart.palaces).toHaveLength(12);
      expect(new Set(chart.palaces.map((palace) => palace.branch)).size).toBe(12);

      expect(factValue(chart, "life_palace.branch")).toBe(
        fixture.expected.lifePalaceBranch
      );
      expect(factValue(chart, "body_palace.branch")).toBe(
        fixture.expected.bodyPalaceBranch
      );
      expect(factValue<{ palaceName: string }>(chart, "body_palace.host_palace")).toMatchObject({
        palaceName: fixture.expected.bodyHostPalaceName
      });

      expect(factValue<StemBranch>(chart, "birth.sexagenary_year").label).toBe(
        fixture.expected.lunarYearStemBranch
      );
      expect(factValue<StemBranch>(chart, "life_palace.stem_branch").label).toBe(
        fixture.expected.lifePalaceStemBranch
      );
      expect(factValue(chart, "life_palace.nayin")).toMatchObject({
        name: fixture.expected.nayinName,
        element: fixture.expected.bureauElement
      });

      const bureau = factValue<FiveElementBureau>(chart, "five_element_bureau");
      expect(bureau.element).toBe(fixture.expected.bureauElement);
      expect(bureau.number).toBe(fixture.expected.bureauNumber);
      expect(bureau.label).toBe(
        `${fixture.expected.bureauElement}${fixture.expected.bureauNumber}局`
      );

      expect(factValue(chart, "star.ziwei.branch")).toBe(
        fixture.expected.ziweiStarBranch
      );
      for (const starName of MAJOR_STARS) {
        const expectedBranch = fixture.expected.majorStarBranches[starName];
        expect(factValue(chart, starFactKeyByName[starName])).toBe(expectedBranch);
        expect(
          chart.palaces
            .find((palace) => palace.branch === expectedBranch)
            ?.stars.some((star) => star.name === starName)
        ).toBe(true);
      }
      expect(chart.palaces.flatMap((palace) => palace.stars)).toHaveLength(14);
      expect(factValue(chart, "major_stars.placements")).toHaveLength(14);

      expect(factValue(chart, "palace.validation.twelve_unique_branches")).toMatchObject({
        pass: true
      });
      expect(factValue(chart, "life_body.validation.branches_on_chart")).toMatchObject({
        pass: true
      });
      expectAllFactsToBeTraced(chart);
    }
  );

  it("maps Nayin elements to all five bureau numbers", () => {
    expect(
      calculateFiveElementBureauFromStemBranch({
        stem: "丙",
        branch: "子",
        label: "丙子",
        cycleIndex: 12
      }).number
    ).toBe(2);
    expect(
      calculateFiveElementBureauFromStemBranch({
        stem: "戊",
        branch: "辰",
        label: "戊辰",
        cycleIndex: 4
      }).number
    ).toBe(3);
    expect(
      calculateFiveElementBureauFromStemBranch({
        stem: "甲",
        branch: "子",
        label: "甲子",
        cycleIndex: 0
      }).number
    ).toBe(4);
    expect(
      calculateFiveElementBureauFromStemBranch({
        stem: "庚",
        branch: "午",
        label: "庚午",
        cycleIndex: 6
      }).number
    ).toBe(5);
    expect(
      calculateFiveElementBureauFromStemBranch({
        stem: "丙",
        branch: "寅",
        label: "丙寅",
        cycleIndex: 2
      }).number
    ).toBe(6);
  });

  it("requires a calendar provider for solar birth input", () => {
    expect(() =>
      createZiweiChart({
        gender: "unknown",
        inputMode: "solar",
        solar: {
          isoDateTime: "1990-10-03T00:30:00+08:00",
          timezone: "Asia/Shanghai"
        }
      })
    ).toThrow(/CalendarProvider/);
  });

  it("accepts solar input through an explicit calendar provider", () => {
    const provider: CalendarProvider = {
      id: "calendar.fixture-solar-v0",
      label: "Fixture Solar Calendar",
      resolve() {
        return {
          providerId: "calendar.fixture-solar-v0",
          lunar: {
            year: 1990,
            month: 8,
            isLeapMonth: false,
            day: 15,
            hourBranch: "子"
          },
          facts: [
            {
              key: "calendar.fixture.solar_to_lunar",
              label: "测试历法换算",
              value: "1990-08-15 子时",
              trace: {
                rulesetId: "calendar.fixture-solar-v0",
                formulaId: "calendar.fixture.solar-to-lunar",
                sourceHint: "Unit-test fixture calendar provider.",
                confidence: "fixture-backed"
              }
            }
          ],
          warnings: ["Fixture calendar provider used for tests."]
        };
      }
    };

    const chart = createZiweiChart(
      {
        gender: "unknown",
        inputMode: "solar",
        solar: {
          isoDateTime: "1990-10-03T00:30:00+08:00",
          timezone: "Asia/Shanghai"
        }
      },
      { calendarProvider: provider }
    );

    expect(chart.calendar.providerId).toBe("calendar.fixture-solar-v0");
    expect(chart.warnings).toContain("Fixture calendar provider used for tests.");
    expect(factValue(chart, "calendar.fixture.solar_to_lunar")).toBe(
      "1990-08-15 子时"
    );
    expect(factValue(chart, "star.ziwei.branch")).toBe("申");
  });
});
