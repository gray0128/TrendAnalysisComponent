# Task 8 Report: TrendPicker 与 8 条勾选上限

## What you implemented

- Created `src/components/TrendPicker.vue`
  - props: `candidates: TrendItemIdentity[]`, `selected: TrendItemIdentity[]`
  - native checkbox list; label = `displayName || kpiId`
  - identity via `itemKey`; cap via `MAX_TREND_SERIES`
  - emit `update:selected` with `TrendItemIdentity[]`
  - when `selected.length >= 8` and user checks a new item: do not emit a larger list; show 「最多选择 8 个数据项」
  - does **not** fetch; Panel owns request / `PickerInput`
- Extended `src/styles/panel.css` with `.trend-picker` layout
- Created `tests/picker.test.ts`

Did **not** re-export from `src/index.ts` (brief did not require it).
Did **not** put `PickerInput` on the component (candidates/selected only).

## What you tested and results

- `npm test` (vitest run) against picker + existing suites
- Final result: **10 test files passed, 26 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 FAIL  tests/picker.test.ts [ tests/picker.test.ts ]
Error: Failed to resolve import "../src/components/TrendPicker.vue" from "tests/picker.test.ts". Does the file exist?
 Test Files  1 failed | 9 passed (10)
      Tests  25 passed (25)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/picker.test.ts (1 test) 22ms
 Test Files  10 passed (10)
      Tests  26 passed (26)
EXIT:0
```

## Files changed

Created/modified in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/components/TrendPicker.vue`
- `src/styles/panel.css`
- `tests/picker.test.ts`

Report only (dosiv-v2):

- `.superpowers/sdd/task-8-report.md`

## Commit

- `a0dd4ac` feat: add data-item picker with 8-item cap

## Self-review findings

- Completeness: both Create files present; 8-cap + message covered by test.
- Native checkboxes only; no ant-design-vue; no fetch inside Picker.
- YAGNI: no index re-export, no search/filter, no disable-all-unchecked UX beyond reject+notice.
- Commit used explicit paths (not `git add .`).

## Concerns

- Cap notice is set on overflow attempt and cleared on successful toggle; not shown merely because count is already 8.
- Controlled `:checked` relies on parent updating `selected` after emit; overflow path does not emit.
- Brief lists `PickerInput` under Consumes, but Step 2 / parent task put fetch+PickerInput in Panel; component only takes `candidates`/`selected`.
- Label omits `pointName` (same as chart `seriesName`: `displayName || kpiId`).

## Follow-up fix: overflow checkbox DOM reset (Important/Medium)

### Finding

When `selected.length >= MAX_TREND_SERIES` and the user checked a new item, the handler set `capNotice` and returned without emitting, but left `(event.target as HTMLInputElement).checked === true`. The original test only asserted emitted payloads were ≤8 (vacuously true when nothing emitted) and did not assert `checked === false`.

### TDD

**RED** — tightened `tests/picker.test.ts` first:

- `expect(wrapper.emitted('update:selected')).toBeFalsy()`
- `expect((boxes[8].element as HTMLInputElement).checked).toBe(false)`
- keep 「最多选择 8 个数据项」

```
FAIL  tests/picker.test.ts
AssertionError: expected true to be false
expect((boxes[8].element as HTMLInputElement).checked).toBe(false)
EXIT:1
```

**GREEN** — in `onChange` overflow branch:

```ts
;(event.target as HTMLInputElement).checked = false
capNotice.value = true
return
```

```
✓ tests/picker.test.ts (1 test)
Test Files  10 passed (10)
Tests  26 passed (26)
EXIT:0
```

### Commit

- `55a6939` fix: uncheck overflow checkbox and reject 9th selection emit
- Files: `src/components/TrendPicker.vue`, `tests/picker.test.ts`
