# Task 4 Report: 阈值映射与 markLine 点

## What you implemented

- Created `src/domain/mapThreshold.ts` with:
  - `ThresholdMark { itemKey; level: '危险' | '警告' | '注意'; y; label }`
  - `mapThresholdRows(rows, item): ThresholdMark[]`
- Enabled filter: keep only `enabled === '1'` or `enabled === 1`
- Severity map: `3` → 危险, `2` → 警告, else 注意
- Single-value: one mark from finite `refValue1`
- Two-value (`ruleCondition` in `07|08|09|10`, or condition text in `condition|message|ruleDesc|title` containing `介于`/`上下限`): marks from finite `refValue1` and `refValue2`
- Same level, multiple enabled rules: all kept
- `label` set to the level string; `itemKey` via `itemKey(item)`
- Numeric parse mirrors deviceDrawer `parseNumericValue` (only finite numbers become `y`)
- Created `tests/mapThreshold.test.ts`
- Did **not** re-export from `src/index.ts` (brief did not require it)

## What you tested and results

- `npm test` (vitest run) against mapThreshold + existing suites
- Final result: **6 test files passed, 13 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 FAIL  tests/mapThreshold.test.ts [ tests/mapThreshold.test.ts ]
Error: Failed to resolve import "../src/domain/mapThreshold" from "tests/mapThreshold.test.ts". Does the file exist?
 Test Files  1 failed | 5 passed (6)
      Tests  9 passed (9)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/mapThreshold.test.ts (4 tests) 5ms
 ✓ tests/types-smoke.test.ts (1 test) 1ms
 ✓ tests/limits.test.ts (1 test) 2ms
 ✓ tests/mapDataItem.test.ts (2 tests) 2ms
 ✓ tests/identity.test.ts (1 test) 1ms
 ✓ tests/time.test.ts (4 tests) 2ms
 Test Files  6 passed (6)
      Tests  13 passed (13)
EXIT:0
```

## Files changed

Created in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/domain/mapThreshold.ts`
- `tests/mapThreshold.test.ts`

Report only (dosiv-v2):

- `.superpowers/sdd/task-4-report.md`

## Commit

- `ca2555d` feat: map enabled thresholds to markline points

## Self-review findings

- Completeness: both Create files present; `ThresholdMark` and `mapThresholdRows` covered.
- Brief tests locked: disabled drop, severity-3 single mark, ruleCondition `07` two y, same-level multi keep.
- `label` not specified by brief; locked as level string in the single-mark assertion.
- Two-value text fallback checks `condition|message|ruleDesc|title` (raw-row equivalents of mapped `condition`).
- YAGNI: no index re-exports, no chart wiring.
- Commit used explicit paths (not `git add .`).

## Concerns

- `label` equals `level`; if later markLine needs value/condition text, the field will need a defined formatter.
- Two-value text detection field set is inferred from host `mapThresholdByTags` sources; only `ruleCondition: '07'` is locked by tests.
- Non-finite `refValue1`/`refValue2` are silently skipped (per finite-only rule); no dedicated test.

## Important findings fix

### What changed

- Added regression test: `enabled: '1'`, no `07–10` `ruleCondition`, `condition: '大于'` (non-matching) but `message` contains `介于`/`上下限`, with finite `refValue1`/`refValue2` → two marks.
- Fixed `isTwoValue`: `condition` / `message` / `ruleDesc` / `title` checked as a **union** (`some`); no longer `??`-short-circuits on the first non-nullish field.

### TDD Evidence

#### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ❯ tests/mapThreshold.test.ts (5 tests | 1 failed) 19ms
   × mapThresholdRows > emits two marks when message has 介于 even if condition is non-matching text 16ms
     → expected [ { itemKey: 'DEV01*01*RMS', …(3) } ] to have a length of 2 but got 1
 Test Files  1 failed | 5 passed (6)
      Tests  1 failed | 13 passed (14)
EXIT:1
```

#### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/mapThreshold.test.ts (5 tests) 3ms
 Test Files  6 passed (6)
      Tests  14 passed (14)
EXIT:0
```

### Fix commit

- `df75217` fix: detect two-value threshold from any text field
