# Task 9 Report: TrendPanel 编排

## What you implemented

- Created `src/components/TrendPanel.vue`
  - props: `trend: TrendLoadInput`, `picker?: PickerInput | null`, `theme?: Theme`
  - open flow:
    1. `capSeries(trend.items)`; `overflow>0` shows 「最多加载 8 个数据项，其余未加载」
    2. `resolveTimeWindow(trend.startTimeMs, trend.endTimeMs)`
    3. `picker` empty/null → no `.dit-picker`
    4. `picker.type==='device'` → `fetchDeviceDataItems`, default none selected, then check `capSeries(trend.items)` by `itemKey`
    5. `picker.type==='items'` → candidates = list, same check logic
    6. each selected item → `fetchAggregateTrend`; failure recorded in `failedKeys`, others continue
    7. 阈值开关 default `false`; does **not** call `fetchEnabledThresholds`
  - template: query bar + 「阈值线」 switch on the right + chart + optional picker
  - `buildChartOption({ showThresholds: false, marks: [] })`
  - re-fetch on query-bar `query` and picker `update:selected`
- Created `tests/panel.test.ts` (api + echarts mocked)
- Modified `src/index.ts` to export `TrendPanel`
- Extended `src/styles/panel.css` with `.dit-panel` / `.dit-query` / `.dit-threshold` layout

Did **not** implement theme tokens, drawer, or plugin changes.
Did **not** call `fetchEnabledThresholds` (switch is local UI only).

## What you tested and results

- `npm test` (vitest run) against panel + existing suites
- Final result: **11 test files passed, 30 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 FAIL  tests/panel.test.ts [ tests/panel.test.ts ]
Error: Failed to resolve import "../src/components/TrendPanel.vue" from "tests/panel.test.ts". Does the file exist?
 Test Files  1 failed | 10 passed (11)
      Tests  26 passed (26)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/panel.test.ts (4 tests) 41ms
 Test Files  11 passed (11)
      Tests  30 passed (30)
EXIT:0
```

Covered:

1. 无 picker：容器无 `.dit-picker`
2. 无勾选：`fetchAggregateTrend` 调用 0 次
3. 1 条 trend + device picker：mock 3 条非信号，选中 1 条，trend 请求 1 次
4. 阈值默认不请求

## Files changed

Created/modified in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/components/TrendPanel.vue`
- `tests/panel.test.ts`
- `src/index.ts`
- `src/styles/panel.css`

Report only (dosiv-v2):

- `.superpowers/sdd/task-9-report.md`

## Commit

- `0f1dc02` feat: wire TrendPanel load, picker, and query flow

## Self-review findings

- Completeness: Create/Modify files present; four required tests pass; overflow copy and `failedKeys` continue path implemented.
- Native checkbox for 「阈值线」; no ant-design-vue; APIs mocked in tests.
- YAGNI: no theme tokens, no drawer, no threshold fetch, `showThresholds: false` hard-coded into `buildChartOption`.
- Commit used explicit paths (not `git add .`).

## Concerns

- 「阈值线」开关可勾选，但本任务不请求、不改 `showChart` option；Task 10 再接线。
- overflow 文案与 `failedKeys` 提示无对应测试（实现有，brief Step 1 未要求）。
- `picker.type==='items'` 无单独测试（实现有，device 路径已覆盖勾选规则）。
- datetime 输入只 `change` 不重查，需点「查询」；快捷档/平移会 `query`。
- TrendChart 仍默认 merge `setOption`；本任务未改。

## Important findings fix

### Findings

1. **Cap before draw:** `hydrate` already `capSeries(trend.items)`，但 `loadTrends` 直接用 `selected`，`onUpdateSelected` 也不封顶。picker 若发出 9 项会 fetch/draw 9 条。
2. **Race:** `hydrate` / `onQuery` / `onUpdateSelected` / `loadTrends` 无 generation。慢请求后返回会覆盖较新的 `series` / `failedKeys` / `option`。

### What changed

- `loadTrends` 先 `capSeries(selected)`：overflow>0 时裁到 8、写回 `selected`、展示「最多加载 8 个数据项，其余未加载」；fetch/draw 不超过 `MAX_TREND_SERIES`。
- 单调 `loadGeneration`：`hydrate` bump 后把 generation 传给 `loadTrends`；`onQuery` / `onUpdateSelected` 经 `loadTrends()` 默认参数 bump。await 之后 `generation !== loadGeneration` 则 return，不写 `failedKeys` / `option`。
- `hydrate` 在 `fetchDeviceDataItems` 之后同样丢弃过期 generation。

### TDD Evidence

#### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test -- tests/panel.test.ts
```

Output (abridged):

```
 ❯ tests/panel.test.ts (7 tests | 2 failed) 55ms
   ✓ fetches at most 8 series when 9 trend.items are given without a picker
   × fetches at most 8 series when selected somehow exceeds the cap
     → expected "spy" to be called 8 times, but got 9 times
   × ignores a stale trend response after a newer query
     → expected [ [ [ 2, 99 ] ] ] to deeply equal [ [ [ 1, 1 ] ] ]
 Test Files  1 failed (1)
      Tests  2 failed | 5 passed (7)
EXIT:1
```

9 条 `trend.items` 无 picker 的用例在改前已通过（`hydrate` 已 cap）。

#### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/panel.test.ts (7 tests) 56ms
 Test Files  11 passed (11)
      Tests  33 passed (33)
EXIT:0
```

Covered:

1. 无 picker + 9 条 `trend.items`：`fetchAggregateTrend` 8 次，溢出文案出现
2. picker `update:selected` 发出 9 条：仍 8 次 fetch，勾选保持 8，溢出文案出现
3. 首请求挂起后点「查询」：过期响应不覆盖较新的 chart option

### Fix commit

- `80f57dd` fix: cap TrendPanel series at 8 and ignore stale loads
- Files: `src/components/TrendPanel.vue`, `tests/panel.test.ts`
