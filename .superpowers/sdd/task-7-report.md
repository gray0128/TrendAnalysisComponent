# Task 7 Report: TrendQueryBar 与 TrendChart

## What you implemented

- Created `src/components/TrendQueryBar.vue`
  - props: `startTimeMs`, `endTimeMs`, optional `now` (fallback `Date.now()`)
  - native `input[type=datetime-local]` for start/end
  - shortcut buttons from `TIME_PRESETS` labels
  - `前移` + preset `<select>` + `后移`
  - `查询` button
  - emit `change: { startTimeMs, endTimeMs }` and `query`
  - shortcut uses `applyPreset` (keep end, change duration) then emits `change` + `query`
  - 后移 uses `shiftWindow(..., +presetMs, now)` so end never exceeds `now`
- Created `src/components/TrendChart.vue`
  - prop `option`
  - `echarts.init` on mount, `watch(option, { deep: true })` → `setOption`, `dispose` on `onBeforeUnmount`
- Created `src/styles/panel.css` (query bar flex layout, chart 320px height)
- Created `tests/queryBar.test.ts`

Did **not** re-export from `src/index.ts` (brief did not require it).
Did **not** add a TrendChart test (brief: QueryBar tests mandatory; echarts may be mocked).

## What you tested and results

- `npm test` (vitest run) against queryBar + existing suites
- Final result: **9 test files passed, 25 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 FAIL  tests/queryBar.test.ts [ tests/queryBar.test.ts ]
Error: Failed to resolve import "../src/components/TrendQueryBar.vue" from "tests/queryBar.test.ts". Does the file exist?
 Test Files  1 failed | 8 passed (9)
      Tests  23 passed (23)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/queryBar.test.ts (2 tests) 26ms
 Test Files  9 passed (9)
      Tests  25 passed (25)
EXIT:0
```

## Files changed

Created in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/components/TrendQueryBar.vue`
- `src/components/TrendChart.vue`
- `src/styles/panel.css`
- `tests/queryBar.test.ts`

Report only (dosiv-v2):

- `.superpowers/sdd/task-7-report.md`

## Commit

- `0ea908f` feat: add query bar and echarts trend chart

## Self-review findings

- Completeness: all four Create files present; QueryBar emit contract and Chart lifecycle covered.
- Native controls only; no ant-design-vue.
- Shortcut `8小时` keeps end and sets duration to 8h; 后移 test injects `now` to avoid flake.
- YAGNI: no index re-exports, no chart test, no resize observer, no CSS theme tokens yet.
- Commit used explicit paths (not `git add .`).

## Concerns

- `resolveTimeWindow` is not called inside QueryBar; start/end are required props, so resolving omitted times stays a parent concern.
- `buildChartOption` is not called inside TrendChart; parent passes an already-built `option`.
- datetime-local values drop seconds (minute precision).
- TrendChart is untested; `echarts.init` will fail in jsdom without a mock.
- CSS is imported by both components; not yet wired through `src/index.ts` / `./style.css` export.
