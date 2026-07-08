# Zi Wei Dou Shu Domain Model

The first domain target is Zi Wei Dou Shu.

## Core Objects

- `BirthProfile`: gender, timezone, location, solar/lunar birth data, calendar options.
- `LunarBirth`: lunar year, month, leap month flag, day, and birth hour branch.
- `ZiweiChart`: twelve palaces, stars, transformations, luck cycles, and provenance.
- `Palace`: branch, palace name, major stars, auxiliary stars, notes, and computed facts.
- `ComputedFact`: machine-readable claim with formula id, value, and confidence.
- `InterpretationReport`: answer, chart facts, retrieved evidence, caveats.

## First Ruleset Boundary

The current `experimental-v0` ruleset only models palace scaffolding and life/body palace placement. It is intentionally marked experimental. The next rulesets should add:

1. Five-element bureau.
2. Zi Wei star placement.
3. Tian Fu system placement.
4. Four transformations by heavenly stem.
5. Decade and annual flow.

## Testing Approach

Each formula should be backed by fixtures:

- raw birth input
- expected palace branch
- expected star positions
- source note
- school/ruleset id

Fixtures should include disagreements between schools instead of silently choosing one.
