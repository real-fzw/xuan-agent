import { createZiweiChart } from "@xuan/core";
import type { BirthProfile } from "@xuan/core";

export function postZiweiChart(body: BirthProfile) {
  return createZiweiChart(body);
}
