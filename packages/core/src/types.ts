import type {
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_BUREAU_NUMBERS,
  FIVE_ELEMENTS,
  HEAVENLY_STEMS,
  MAJOR_STARS,
  PALACE_SEQUENCE,
  ZIWEI_PALACE_BRANCHES
} from "./constants.js";

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];
export type FiveElement = (typeof FIVE_ELEMENTS)[number];
export type FiveElementBureauNumber = (typeof FIVE_ELEMENT_BUREAU_NUMBERS)[number];
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

export interface StemBranch {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  label: string;
  cycleIndex?: number;
}

export interface Nayin {
  name: string;
  element: FiveElement;
  sexagenaryIndex: number;
}

export interface FiveElementBureau {
  element: FiveElement;
  number: FiveElementBureauNumber;
  label: string;
  lifePalaceStemBranch: StemBranch;
  nayin: Nayin;
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

export interface CalendarResolution {
  providerId: string;
  lunar: LunarBirth;
  facts: ComputedFact[];
  warnings: string[];
}

export interface CalendarProvider {
  id: string;
  label: string;
  resolve(input: BirthProfile): CalendarResolution;
}

export interface JieqiTerm {
  name: string;
  isoDateTime: string;
  timezone: string;
  trace: FormulaTrace;
}

export interface JieqiProvider {
  id: string;
  label: string;
  getTermsForYear(year: number, timezone: string): JieqiTerm[];
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
  calendar: CalendarResolution;
  palaces: Palace[];
  facts: ComputedFact[];
  warnings: string[];
  createdAt: string;
}

export interface ZiweiChartOptions {
  calendarProvider?: CalendarProvider;
  now?: () => Date;
}

export interface ZiweiRuleset {
  id: string;
  label: string;
  version: string;
  calculate(input: BirthProfile, options?: ZiweiChartOptions): ZiweiChart;
}
