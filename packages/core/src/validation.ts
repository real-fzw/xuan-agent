import type { BirthProfile, LunarBirth } from "./types.js";
import { EARTHLY_BRANCHES } from "./constants.js";
import { UnsupportedInputError } from "./errors.js";

export function assertLunarBirth(input: BirthProfile): LunarBirth {
  if (input.inputMode !== "lunar" || !input.lunar) {
    throw new UnsupportedInputError(
      "The current Zi Wei Dou Shu ruleset accepts lunar birth input only. Solar conversion will be provided by a calendar provider."
    );
  }

  const { month, day, hourBranch } = input.lunar;

  if (month < 1 || month > 12) {
    throw new UnsupportedInputError("Lunar month must be between 1 and 12.");
  }

  if (day < 1 || day > 30) {
    throw new UnsupportedInputError("Lunar day must be between 1 and 30.");
  }

  if (!EARTHLY_BRANCHES.includes(hourBranch)) {
    throw new UnsupportedInputError(`Unsupported birth hour branch: ${hourBranch}`);
  }

  return input.lunar;
}
