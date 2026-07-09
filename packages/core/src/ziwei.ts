import { MAJOR_STARS, PALACE_SEQUENCE, ZIWEI_PALACE_BRANCHES } from "./constants.js";
import { resolveCalendarBirth } from "./calendar.js";
import {
  calculateFiveElementBureauFromStemBranch,
  getNayin
} from "./nayin.js";
import {
  branchIndex,
  calculatePalaceStemBranch,
  lunarYearStemBranch,
  mod,
  ziweiBranchIndex
} from "./sexagenary.js";
import type {
  BirthProfile,
  ComputedFact,
  EarthlyBranch,
  FiveElementBureau,
  FiveElementBureauNumber,
  FormulaTrace,
  MajorStar,
  Palace,
  StemBranch,
  ZiweiChart,
  ZiweiChartOptions,
  ZiweiPalaceBranch,
  ZiweiRuleset
} from "./types.js";

const RULESET_ID = "ziwei.common-v0";
const COMMON_RULE_SOURCE_HINT =
  "Common Zi Wei Dou Shu calculation sequence for palaces, Nayin five-element bureau, Zi Wei placement, and the fourteen major stars. Public reference: https://zh.wikipedia.org/wiki/紫微斗数#推算方法";

const STAR_FACT_KEY_BY_NAME: Record<MajorStar, string> = {
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

const ZIWEI_SYSTEM_OFFSETS: Array<readonly [MajorStar, number]> = [
  ["紫微", 0],
  ["天机", -1],
  ["太阳", -3],
  ["武曲", -4],
  ["天同", -5],
  ["廉贞", -8]
];

const TIANFU_SYSTEM_OFFSETS: Array<readonly [MajorStar, number]> = [
  ["天府", 0],
  ["太阴", 1],
  ["贪狼", 2],
  ["巨门", 3],
  ["天相", 4],
  ["天梁", 5],
  ["七杀", 6],
  ["破军", 10]
];

function ruleTrace(
  formulaId: string,
  notes: string[] = [],
  confidence: FormulaTrace["confidence"] = "fixture-backed"
): FormulaTrace {
  return {
    rulesetId: RULESET_ID,
    formulaId,
    sourceHint: COMMON_RULE_SOURCE_HINT,
    confidence,
    notes
  };
}

export function calculateLifePalaceBranch(
  lunarMonth: number,
  hourBranch: EarthlyBranch
): ZiweiPalaceBranch {
  const monthAnchor = lunarMonth - 1;
  const hourOffset = branchIndex(hourBranch);
  return ZIWEI_PALACE_BRANCHES[mod(monthAnchor - hourOffset, 12)];
}

export function calculateBodyPalaceBranch(
  lunarMonth: number,
  hourBranch: EarthlyBranch
): ZiweiPalaceBranch {
  const monthAnchor = lunarMonth - 1;
  const hourOffset = branchIndex(hourBranch);
  return ZIWEI_PALACE_BRANCHES[mod(monthAnchor + hourOffset, 12)];
}

export interface ZiweiStarCalculation {
  lunarDay: number;
  bureauNumber: FiveElementBureauNumber;
  multiplier: number;
  difference: number;
  countingStep: number;
  branch: ZiweiPalaceBranch;
}

export function calculateZiweiStarPosition(
  lunarDay: number,
  bureauNumber: FiveElementBureauNumber
): ZiweiStarCalculation {
  const multiplier = Math.ceil(lunarDay / bureauNumber);
  const difference = multiplier * bureauNumber - lunarDay;
  const countingStep =
    difference % 2 === 0 ? multiplier + difference : multiplier - difference;
  const branch = ZIWEI_PALACE_BRANCHES[mod(countingStep - 1, 12)];

  return {
    lunarDay,
    bureauNumber,
    multiplier,
    difference,
    countingStep,
    branch
  };
}

export function calculateZiweiStarBranch(
  lunarDay: number,
  bureauNumber: FiveElementBureauNumber
): ZiweiPalaceBranch {
  return calculateZiweiStarPosition(lunarDay, bureauNumber).branch;
}

export interface MajorStarPlacement {
  name: MajorStar;
  branch: ZiweiPalaceBranch;
  system: "ziwei" | "tianfu";
  offset: number;
  trace: FormulaTrace;
}

export function calculateTianfuStarBranch(
  ziweiBranch: ZiweiPalaceBranch
): ZiweiPalaceBranch {
  return ZIWEI_PALACE_BRANCHES[mod(12 - ziweiBranchIndex(ziweiBranch), 12)];
}

export function calculateMajorStarPlacements(
  ziweiBranch: ZiweiPalaceBranch,
  ziweiTrace: FormulaTrace = ruleTrace("major-star.ziwei.day-and-bureau")
): MajorStarPlacement[] {
  const ziweiIndex = ziweiBranchIndex(ziweiBranch);
  const tianfuBranch = calculateTianfuStarBranch(ziweiBranch);
  const tianfuIndex = ziweiBranchIndex(tianfuBranch);
  const ziweiSystemTrace = ruleTrace("major-star.ziwei-system.from-ziwei", [
    `ziweiBranch=${ziweiBranch}`
  ]);
  const tianfuTrace = ruleTrace("major-star.tianfu.mirror-from-ziwei", [
    `ziweiBranch=${ziweiBranch}`,
    `tianfuBranch=${tianfuBranch}`
  ]);
  const tianfuSystemTrace = ruleTrace("major-star.tianfu-system.from-tianfu", [
    `tianfuBranch=${tianfuBranch}`
  ]);

  const ziweiSystem = ZIWEI_SYSTEM_OFFSETS.map(([name, offset]) => ({
    name,
    branch: ZIWEI_PALACE_BRANCHES[mod(ziweiIndex + offset, 12)],
    system: "ziwei" as const,
    offset,
    trace: name === "紫微" ? ziweiTrace : ziweiSystemTrace
  }));

  const tianfuSystem = TIANFU_SYSTEM_OFFSETS.map(([name, offset]) => ({
    name,
    branch: ZIWEI_PALACE_BRANCHES[mod(tianfuIndex + offset, 12)],
    system: "tianfu" as const,
    offset,
    trace: name === "天府" ? tianfuTrace : tianfuSystemTrace
  }));

  return [...ziweiSystem, ...tianfuSystem].sort(
    (left, right) => MAJOR_STARS.indexOf(left.name) - MAJOR_STARS.indexOf(right.name)
  );
}

function buildPalaces(lifeBranch: ZiweiPalaceBranch): Palace[] {
  const lifeIndex = ziweiBranchIndex(lifeBranch);

  return PALACE_SEQUENCE.map((name, offset) => ({
    name,
    branch: ZIWEI_PALACE_BRANCHES[mod(lifeIndex - offset, 12)],
    stars: [],
    facts: [
      {
        key: `palace.${name}.branch`,
        label: `${name}地支`,
        value: ZIWEI_PALACE_BRANCHES[mod(lifeIndex - offset, 12)],
        trace: ruleTrace("palace.sequence.counter-clockwise")
      }
    ]
  }));
}

function placeMajorStars(
  palaces: Palace[],
  placements: MajorStarPlacement[]
): Palace[] {
  const placementsByBranch = new Map<ZiweiPalaceBranch, MajorStarPlacement[]>();
  for (const placement of placements) {
    const branchPlacements = placementsByBranch.get(placement.branch) ?? [];
    branchPlacements.push(placement);
    placementsByBranch.set(placement.branch, branchPlacements);
  }

  return palaces.map((palace) =>
    placementsByBranch.has(palace.branch)
      ? {
          ...palace,
          stars: [
            ...palace.stars,
            ...(placementsByBranch.get(palace.branch) ?? []).map((placement) => ({
              name: placement.name,
              category: "major" as const,
              trace: placement.trace
            }))
          ]
        }
      : palace
  );
}

function findPalaceByBranch(
  palaces: Palace[],
  branch: ZiweiPalaceBranch
): Palace | undefined {
  return palaces.find((palace) => palace.branch === branch);
}

function buildValidationFacts(
  palaces: Palace[],
  lifeBranch: ZiweiPalaceBranch,
  bodyBranch: ZiweiPalaceBranch
): ComputedFact[] {
  const branches = palaces.map((palace) => palace.branch);
  const uniqueBranches = new Set(branches);
  const bodyPalace = findPalaceByBranch(palaces, bodyBranch);

  return [
    {
      key: "palace.validation.twelve_unique_branches",
      label: "十二宫地支唯一性校验",
      value: {
        pass: branches.length === 12 && uniqueBranches.size === 12,
        branches
      },
      trace: ruleTrace("palace.validation.twelve-branches")
    },
    {
      key: "life_body.validation.branches_on_chart",
      label: "命宫身宫落宫校验",
      value: {
        pass:
          uniqueBranches.has(lifeBranch) &&
          uniqueBranches.has(bodyBranch) &&
          bodyPalace !== undefined,
        lifeBranch,
        bodyBranch,
        bodyPalaceName: bodyPalace?.name
      },
      trace: ruleTrace("life-body.validation.branches-on-chart")
    }
  ];
}

function chartIdFrom(input: BirthProfile): string {
  const raw = JSON.stringify(input);
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }

  return `zwds_${hash.toString(16).padStart(8, "0")}`;
}

function buildFiveElementFacts(
  yearStemBranch: StemBranch,
  lifePalaceStemBranch: StemBranch,
  bureau: FiveElementBureau
): ComputedFact[] {
  return [
    {
      key: "birth.sexagenary_year",
      label: "出生年干支",
      value: yearStemBranch,
      trace: ruleTrace("sexagenary.lunar-year")
    },
    {
      key: "life_palace.stem_branch",
      label: "命宫干支",
      value: lifePalaceStemBranch,
      trace: ruleTrace("palace-stem.five-tigers")
    },
    {
      key: "life_palace.nayin",
      label: "命宫纳音",
      value: getNayin(lifePalaceStemBranch),
      trace: ruleTrace("nayin.sixty-cycle")
    },
    {
      key: "five_element_bureau",
      label: "五行局",
      value: bureau,
      trace: ruleTrace("five-element-bureau.nayin")
    }
  ];
}

function buildMajorStarFacts(placements: MajorStarPlacement[]): ComputedFact[] {
  const placementFacts = placements.map((placement) => ({
    key: STAR_FACT_KEY_BY_NAME[placement.name],
    label: `${placement.name}地支`,
    value: placement.branch,
    trace: placement.trace
  }));

  return [
    ...placementFacts,
    {
      key: "major_stars.placements",
      label: "十四主星落宫",
      value: placements.map((placement) => ({
        name: placement.name,
        branch: placement.branch,
        system: placement.system,
        offset: placement.offset
      })),
      trace: ruleTrace("major-star.fourteen-star-placement")
    }
  ];
}

export function createZiweiChart(
  input: BirthProfile,
  options: ZiweiChartOptions = {}
): ZiweiChart {
  const calendar = resolveCalendarBirth(input, options.calendarProvider);
  const lunar = calendar.lunar;
  const lifeBranch = calculateLifePalaceBranch(lunar.month, lunar.hourBranch);
  const bodyBranch = calculateBodyPalaceBranch(lunar.month, lunar.hourBranch);
  const yearStemBranch = lunarYearStemBranch(lunar.year);
  const lifePalaceStemBranch = calculatePalaceStemBranch(
    yearStemBranch.stem,
    lifeBranch
  );
  const bureau = calculateFiveElementBureauFromStemBranch(lifePalaceStemBranch);
  const ziweiStar = calculateZiweiStarPosition(lunar.day, bureau.number);
  const ziweiStarTrace = ruleTrace("major-star.ziwei.day-and-bureau", [
    `lunarDay=${ziweiStar.lunarDay}`,
    `bureauNumber=${ziweiStar.bureauNumber}`,
    `multiplier=${ziweiStar.multiplier}`,
    `difference=${ziweiStar.difference}`,
    `countingStep=${ziweiStar.countingStep}`
  ]);
  const majorStarPlacements = calculateMajorStarPlacements(
    ziweiStar.branch,
    ziweiStarTrace
  );
  const palaces = placeMajorStars(buildPalaces(lifeBranch), majorStarPlacements);
  const facts: ComputedFact[] = [
    ...calendar.facts,
    {
      key: "life_palace.branch",
      label: "命宫地支",
      value: lifeBranch,
      trace: ruleTrace("life-palace.month-hour")
    },
    {
      key: "body_palace.branch",
      label: "身宫地支",
      value: bodyBranch,
      trace: ruleTrace("body-palace.month-hour")
    },
    {
      key: "body_palace.host_palace",
      label: "身宫所落十二宫",
      value: {
        branch: bodyBranch,
        palaceName: findPalaceByBranch(palaces, bodyBranch)?.name
      },
      trace: ruleTrace("body-palace.host-palace")
    },
    ...buildFiveElementFacts(yearStemBranch, lifePalaceStemBranch, bureau),
    ...buildMajorStarFacts(majorStarPlacements),
    {
      key: "star.ziwei.calculation",
      label: "紫微星定位计算",
      value: ziweiStar,
      trace: ziweiStarTrace
    },
    ...buildValidationFacts(palaces, lifeBranch, bodyBranch)
  ];

  return {
    chartId: chartIdFrom(input),
    rulesetId: RULESET_ID,
    birth: input,
    calendar,
    palaces,
    facts,
    warnings: [
      ...calendar.warnings,
      "ziwei.common-v0 implements a fixture-backed common-rule core for palaces, five-element bureau, Zi Wei placement, and fourteen major stars; school-specific disagreements are not modeled yet.",
      "Solar-to-lunar conversion, true solar time, auxiliary stars, transformations, and flow cycles still require later rulesets/providers."
    ],
    createdAt: (options.now?.() ?? new Date()).toISOString()
  };
}

export const commonZiweiRuleset: ZiweiRuleset = {
  id: RULESET_ID,
  label: "Zi Wei Dou Shu Common Ruleset",
  version: "0.2.0",
  calculate: createZiweiChart
};

export const experimentalZiweiRuleset: ZiweiRuleset = commonZiweiRuleset;
