import { UnsupportedInputError } from "./errors.js";
import { assertLunarBirth } from "./validation.js";
import type {
  BirthProfile,
  CalendarProvider,
  CalendarResolution,
  FormulaTrace
} from "./types.js";

const LUNAR_INPUT_PROVIDER_ID = "calendar.lunar-input-v0";

function calendarTrace(formulaId: string, notes: string[] = []): FormulaTrace {
  return {
    rulesetId: LUNAR_INPUT_PROVIDER_ID,
    formulaId,
    sourceHint:
      "User supplied lunar birth fields directly; no solar-to-lunar conversion was performed.",
    confidence: "verified",
    notes
  };
}

export const lunarInputCalendarProvider: CalendarProvider = {
  id: LUNAR_INPUT_PROVIDER_ID,
  label: "Lunar Input Calendar Provider",
  resolve(input: BirthProfile): CalendarResolution {
    if (input.inputMode !== "lunar") {
      throw new UnsupportedInputError(
        "Solar birth input requires an explicit CalendarProvider. The built-in provider only validates supplied lunar birth data."
      );
    }

    const lunar = assertLunarBirth(input);
    const warnings = input.useTrueSolarTime
      ? [
          "useTrueSolarTime was requested, but lunar-input mode does not adjust the hour branch. Provide a calendar provider with true-solar-time support for solar input."
        ]
      : [];

    return {
      providerId: LUNAR_INPUT_PROVIDER_ID,
      lunar,
      facts: [
        {
          key: "birth.lunar",
          label: "农历出生信息",
          value: lunar,
          trace: calendarTrace("calendar.lunar-input.validate")
        }
      ],
      warnings
    };
  }
};

export function resolveCalendarBirth(
  input: BirthProfile,
  provider: CalendarProvider = lunarInputCalendarProvider
): CalendarResolution {
  return provider.resolve(input);
}
