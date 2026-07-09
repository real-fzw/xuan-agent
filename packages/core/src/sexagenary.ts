import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  ZIWEI_PALACE_BRANCHES
} from "./constants.js";
import { UnsupportedInputError } from "./errors.js";
import type {
  EarthlyBranch,
  HeavenlyStem,
  StemBranch,
  ZiweiPalaceBranch
} from "./types.js";

export function mod(value: number, by: number): number {
  return ((value % by) + by) % by;
}

export function stemIndex(stem: HeavenlyStem): number {
  return HEAVENLY_STEMS.indexOf(stem);
}

export function branchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

export function ziweiBranchIndex(branch: ZiweiPalaceBranch): number {
  return ZIWEI_PALACE_BRANCHES.indexOf(branch);
}

export function sexagenaryFromIndex(index: number): StemBranch {
  const cycleIndex = mod(index, 60);
  const stem = HEAVENLY_STEMS[cycleIndex % 10];
  const branch = EARTHLY_BRANCHES[cycleIndex % 12];

  return {
    stem,
    branch,
    label: `${stem}${branch}`,
    cycleIndex
  };
}

export function sexagenaryIndexForStemBranch(
  stem: HeavenlyStem,
  branch: EarthlyBranch
): number {
  const stemOffset = stemIndex(stem);
  const branchOffset = branchIndex(branch);

  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemOffset && index % 12 === branchOffset) {
      return index;
    }
  }

  throw new UnsupportedInputError(`Invalid stem-branch pairing: ${stem}${branch}`);
}

export function lunarYearStemBranch(year: number): StemBranch {
  return sexagenaryFromIndex(year - 4);
}

export function calculatePalaceStem(
  yearStem: HeavenlyStem,
  palaceBranch: ZiweiPalaceBranch
): HeavenlyStem {
  const tigerDunYinStemIndex = mod((stemIndex(yearStem) % 5) * 2 + 2, 10);
  const palaceOffset = ziweiBranchIndex(palaceBranch);
  return HEAVENLY_STEMS[mod(tigerDunYinStemIndex + palaceOffset, 10)];
}

export function calculatePalaceStemBranch(
  yearStem: HeavenlyStem,
  palaceBranch: ZiweiPalaceBranch
): StemBranch {
  const stem = calculatePalaceStem(yearStem, palaceBranch);
  const cycleIndex = sexagenaryIndexForStemBranch(stem, palaceBranch);

  return {
    stem,
    branch: palaceBranch,
    label: `${stem}${palaceBranch}`,
    cycleIndex
  };
}
