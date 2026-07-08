import type {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  MAJOR_STARS,
  PALACE_SEQUENCE,
  ZIWEI_PALACE_BRANCHES
} from "./constants.js";

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];
export type ZiweiPalaceBranch = (typeof ZIWEI_PALACE_BRANCHES)[number];
export type PalaceName = (typeof PALACE_SEQUENCE)[number];
export type MajorStar = (typeof MAJOR_STARS)[number];

export type Gender = "female" | "male" | "unknown";
export type CalendarInputMode = "lunar" | "solar";

export interface BirthLocation {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface LunarBirth {
  year: number;
  month: number;
  isLeapMonth: boolean;
  day: number;
  hourBranch: EarthlyBranch;
}

export interface SolarBirth {
  isoDateTime: string;
  timezone: string;
}

export interface BirthProfile {
  gender: Gender;
  inputMode: CalendarInputMode;
  lunar?: LunarBirth;
  solar?: SolarBirth;
  location?: BirthLocation;
  useTrueSolarTime?: boolean;
}

export interface FormulaTrace {
  rulesetId: string;
  formulaId: string;
  sourceHint?: string;
  confidence: "experimental" | "fixture-backed" | "verified";
  notes?: string[];
}

export interface ComputedFact<TValue = unknown> {
  key: string;
  label: string;
  value: TValue;
  trace: FormulaTrace;
}

export interface StarPlacement {
  name: MajorStar | string;
  category: "major" | "auxiliary" | "transformative" | "flow";
  trace: FormulaTrace;
}

export interface Palace {
  name: PalaceName;
  branch: ZiweiPalaceBranch;
  stars: StarPlacement[];
  facts: ComputedFact[];
}

export interface ZiweiChart {
  chartId: string;
  rulesetId: string;
  birth: BirthProfile;
  palaces: Palace[];
  facts: ComputedFact[];
  warnings: string[];
  createdAt: string;
}

export interface ZiweiRuleset {
  id: string;
  label: string;
  version: string;
  calculate(input: BirthProfile): ZiweiChart;
}
