import type {
  FiveElement,
  FiveElementBureau,
  FiveElementBureauNumber,
  HeavenlyStem,
  Nayin,
  StemBranch,
  ZiweiPalaceBranch
} from "./types.js";
import { calculatePalaceStemBranch, sexagenaryIndexForStemBranch } from "./sexagenary.js";

const NAYIN_BY_PAIR_INDEX: Array<{ name: string; element: FiveElement }> = [
  { name: "海中金", element: "金" },
  { name: "炉中火", element: "火" },
  { name: "大林木", element: "木" },
  { name: "路旁土", element: "土" },
  { name: "剑锋金", element: "金" },
  { name: "山头火", element: "火" },
  { name: "涧下水", element: "水" },
  { name: "城头土", element: "土" },
  { name: "白蜡金", element: "金" },
  { name: "杨柳木", element: "木" },
  { name: "泉中水", element: "水" },
  { name: "屋上土", element: "土" },
  { name: "霹雳火", element: "火" },
  { name: "松柏木", element: "木" },
  { name: "长流水", element: "水" },
  { name: "沙中金", element: "金" },
  { name: "山下火", element: "火" },
  { name: "平地木", element: "木" },
  { name: "壁上土", element: "土" },
  { name: "金箔金", element: "金" },
  { name: "覆灯火", element: "火" },
  { name: "天河水", element: "水" },
  { name: "大驿土", element: "土" },
  { name: "钗钏金", element: "金" },
  { name: "桑柘木", element: "木" },
  { name: "大溪水", element: "水" },
  { name: "沙中土", element: "土" },
  { name: "天上火", element: "火" },
  { name: "石榴木", element: "木" },
  { name: "大海水", element: "水" }
];

const BUREAU_NUMBER_BY_ELEMENT: Record<FiveElement, FiveElementBureauNumber> = {
  水: 2,
  木: 3,
  金: 4,
  土: 5,
  火: 6
};

export function getNayin(stemBranch: StemBranch): Nayin {
  const sexagenaryIndex =
    stemBranch.cycleIndex ??
    sexagenaryIndexForStemBranch(stemBranch.stem, stemBranch.branch);
  const pair = NAYIN_BY_PAIR_INDEX[Math.floor(sexagenaryIndex / 2)];

  return {
    ...pair,
    sexagenaryIndex
  };
}

export function calculateFiveElementBureauFromStemBranch(
  lifePalaceStemBranch: StemBranch
): FiveElementBureau {
  const nayin = getNayin(lifePalaceStemBranch);
  const number = BUREAU_NUMBER_BY_ELEMENT[nayin.element];

  return {
    element: nayin.element,
    number,
    label: `${nayin.element}${number}局`,
    lifePalaceStemBranch,
    nayin
  };
}

export function calculateFiveElementBureau(
  yearStem: HeavenlyStem,
  lifePalaceBranch: ZiweiPalaceBranch
): FiveElementBureau {
  return calculateFiveElementBureauFromStemBranch(
    calculatePalaceStemBranch(yearStem, lifePalaceBranch)
  );
}
