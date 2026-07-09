import type {
  BirthProfile,
  FiveElement,
  FiveElementBureauNumber,
  MajorStar,
  PalaceName,
  ZiweiPalaceBranch
} from "./types.js";

export interface ZiweiCoreFixture {
  id: string;
  description: string;
  birth: BirthProfile;
  expected: {
    lifePalaceBranch: ZiweiPalaceBranch;
    bodyPalaceBranch: ZiweiPalaceBranch;
    bodyHostPalaceName: PalaceName;
    lunarYearStemBranch: string;
    lifePalaceStemBranch: string;
    nayinName: string;
    bureauElement: FiveElement;
    bureauNumber: FiveElementBureauNumber;
    ziweiStarBranch: ZiweiPalaceBranch;
    majorStarBranches: Record<MajorStar, ZiweiPalaceBranch>;
  };
  sourceNote: string;
}

export const ziweiCoreFixtures: ZiweiCoreFixture[] = [
  {
    id: "fixture-1990-08-15-zi",
    description: "庚午年八月十五子时，命身同落酉宫，水二局。",
    birth: {
      gender: "unknown",
      inputMode: "lunar",
      lunar: {
        year: 1990,
        month: 8,
        isLeapMonth: false,
        day: 15,
        hourBranch: "子"
      }
    },
    expected: {
      lifePalaceBranch: "酉",
      bodyPalaceBranch: "酉",
      bodyHostPalaceName: "命宫",
      lunarYearStemBranch: "庚午",
      lifePalaceStemBranch: "乙酉",
      nayinName: "泉中水",
      bureauElement: "水",
      bureauNumber: 2,
      ziweiStarBranch: "申",
      majorStarBranches: {
        紫微: "申",
        天机: "未",
        太阳: "巳",
        武曲: "辰",
        天同: "卯",
        廉贞: "子",
        天府: "申",
        太阴: "酉",
        贪狼: "戌",
        巨门: "亥",
        天相: "子",
        天梁: "丑",
        七杀: "寅",
        破军: "午"
      }
    },
    sourceNote:
      "Original fixture derived from the documented common-rule formulas; contains no copied corpus text."
  },
  {
    id: "fixture-1984-01-01-zi",
    description: "甲子年正月初一子时，命身同落寅宫，火六局。",
    birth: {
      gender: "unknown",
      inputMode: "lunar",
      lunar: {
        year: 1984,
        month: 1,
        isLeapMonth: false,
        day: 1,
        hourBranch: "子"
      }
    },
    expected: {
      lifePalaceBranch: "寅",
      bodyPalaceBranch: "寅",
      bodyHostPalaceName: "命宫",
      lunarYearStemBranch: "甲子",
      lifePalaceStemBranch: "丙寅",
      nayinName: "炉中火",
      bureauElement: "火",
      bureauNumber: 6,
      ziweiStarBranch: "酉",
      majorStarBranches: {
        紫微: "酉",
        天机: "申",
        太阳: "午",
        武曲: "巳",
        天同: "辰",
        廉贞: "丑",
        天府: "未",
        太阴: "申",
        贪狼: "酉",
        巨门: "戌",
        天相: "亥",
        天梁: "子",
        七杀: "丑",
        破军: "巳"
      }
    },
    sourceNote:
      "Original fixture derived from the documented common-rule formulas; contains no copied corpus text."
  },
  {
    id: "fixture-1990-08-12-chen",
    description: "庚午年八月十二辰时，命宫巳、身宫丑，金四局。",
    birth: {
      gender: "unknown",
      inputMode: "lunar",
      lunar: {
        year: 1990,
        month: 8,
        isLeapMonth: false,
        day: 12,
        hourBranch: "辰"
      }
    },
    expected: {
      lifePalaceBranch: "巳",
      bodyPalaceBranch: "丑",
      bodyHostPalaceName: "财帛宫",
      lunarYearStemBranch: "庚午",
      lifePalaceStemBranch: "辛巳",
      nayinName: "白蜡金",
      bureauElement: "金",
      bureauNumber: 4,
      ziweiStarBranch: "辰",
      majorStarBranches: {
        紫微: "辰",
        天机: "卯",
        太阳: "丑",
        武曲: "子",
        天同: "亥",
        廉贞: "申",
        天府: "子",
        太阴: "丑",
        贪狼: "寅",
        巨门: "卯",
        天相: "辰",
        天梁: "巳",
        七杀: "午",
        破军: "戌"
      }
    },
    sourceNote:
      "Original fixture derived from the documented common-rule formulas; contains no copied corpus text."
  }
];
