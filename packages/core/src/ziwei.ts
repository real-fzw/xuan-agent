import {
  EARTHLY_BRANCHES,
  PALACE_SEQUENCE,
  ZIWEI_PALACE_BRANCHES
} from "./constants.js";
import { assertLunarBirth } from "./validation.js";
import type {
  BirthProfile,
  ComputedFact,
  FormulaTrace,
  Palace,
  ZiweiChart,
  ZiweiPalaceBranch,
  ZiweiRuleset
} from "./types.js";

const RULESET_ID = "ziwei.experimental-v0";

function experimentalTrace(formulaId: string, notes: string[] = []): FormulaTrace {
  return {
    rulesetId: RULESET_ID,
    formulaId,
    sourceHint: "Framework placeholder. Replace with fixture-backed school-specific source before production use.",
    confidence: "experimental",
    notes
  };
}

function mod(value: number, by: number): number {
  return ((value % by) + by) % by;
}

function branchIndex(branch: string): number {
  return EARTHLY_BRANCHES.indexOf(branch as never);
}

function ziweiBranchIndex(branch: ZiweiPalaceBranch): number {
  return ZIWEI_PALACE_BRANCHES.indexOf(branch);
}

export function calculateLifePalaceBranch(
  lunarMonth: number,
  hourBranch: string
): ZiweiPalaceBranch {
  const monthAnchor = lunarMonth - 1;
  const hourOffset = branchIndex(hourBranch);
  return ZIWEI_PALACE_BRANCHES[mod(monthAnchor - hourOffset, 12)];
}

export function calculateBodyPalaceBranch(
  lunarMonth: number,
  hourBranch: string
): ZiweiPalaceBranch {
  const monthAnchor = lunarMonth - 1;
  const hourOffset = branchIndex(hourBranch);
  return ZIWEI_PALACE_BRANCHES[mod(monthAnchor + hourOffset, 12)];
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
        trace: experimentalTrace("palace.sequence.counter-clockwise", [
          "Palace sequence direction must be validated against the selected school."
        ])
      }
    ]
  }));
}

function chartIdFrom(input: BirthProfile): string {
  const raw = JSON.stringify(input);
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }

  return `zwds_${hash.toString(16).padStart(8, "0")}`;
}

export function createZiweiChart(input: BirthProfile): ZiweiChart {
  const lunar = assertLunarBirth(input);
  const lifeBranch = calculateLifePalaceBranch(lunar.month, lunar.hourBranch);
  const bodyBranch = calculateBodyPalaceBranch(lunar.month, lunar.hourBranch);
  const facts: ComputedFact[] = [
    {
      key: "life_palace.branch",
      label: "命宫地支",
      value: lifeBranch,
      trace: experimentalTrace("life-palace.month-hour")
    },
    {
      key: "body_palace.branch",
      label: "身宫地支",
      value: bodyBranch,
      trace: experimentalTrace("body-palace.month-hour")
    },
    {
      key: "birth.lunar",
      label: "农历出生信息",
      value: lunar,
      trace: experimentalTrace("input.lunar")
    }
  ];

  return {
    chartId: chartIdFrom(input),
    rulesetId: RULESET_ID,
    birth: input,
    palaces: buildPalaces(lifeBranch),
    facts,
    warnings: [
      "experimental-v0 is a framework ruleset only.",
      "Solar-to-lunar conversion, true solar time, major star placement, and school fixtures are not implemented yet."
    ],
    createdAt: new Date().toISOString()
  };
}

export const experimentalZiweiRuleset: ZiweiRuleset = {
  id: RULESET_ID,
  label: "Zi Wei Dou Shu Experimental Ruleset",
  version: "0.1.0",
  calculate: createZiweiChart
};
