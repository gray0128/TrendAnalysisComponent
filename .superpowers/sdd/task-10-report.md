# Task 10 Report: 阈值开关、主题、外壳、插件导出

## What you implemented

- Created `src/styles/tokens.css`：从 dosiv-v2 `tokens.css` 复制三套变量，选择器改为 `.dit-root` / `.dit-root[data-theme='remote-blue'|'light'|'dark']`，无 `:root`。无 `data-theme` 时与 remote-blue 相同。
- Created `src/components/TrendDrawer.vue`：右侧 `aside` + 遮罩，点击遮罩 emit `close`，内部渲染 `TrendPanel` 并透传 `trend` / `picker` / `theme`。
- Created `src/components/TrendModal.vue`：居中层 + 遮罩，同样 emit `close` 并透传 props。
- Modified `src/components/TrendPanel.vue`
  - 根节点 `class="dit-root dit-panel"` `:data-theme="resolvedTheme"`
  - `resolveTheme(prop, html[data-theme])`
  - 「阈值线」默认关，不请求
  - 打开：对当前勾选（cap 后）调用 `fetchEnabledThresholds`，按勾选 key 缓存 marks，重建 option（`showThresholds: true`）
  - 关闭：只把 `showThresholds` 设为 false 并重建 option，不请求、不丢缓存
  - 勾选变化且开关仍开时，新 key 才再请求
- Modified `src/types.ts`：`resolveTheme(prop, htmlDataset)`
- Modified `src/plugin.ts`：保留 `setTrendRequest(options.request)`，增加 `export default { install }`
- Modified `src/index.ts`：导出 `TrendPanel`、`TrendDrawer`、`TrendModal`、`install`、`resolveTheme`、default plugin，以及已有类型/常量；入口引入 `tokens.css`
- Created `tests/theme.test.ts`
- Extended `src/styles/panel.css`：外壳（mask / 右侧抽屉 / 居中层）与 panel 使用 token 色

## What you tested and results

- `npm test` (vitest run) against theme + existing suites
- Final result: **12 test files passed, 36 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ❯ tests/theme.test.ts (3 tests | 3 failed) 27ms
   × resolveTheme > follows html dataset when prop is omitted
     → resolveTheme is not a function
   × resolveTheme > falls back to remote-blue when html dataset is unknown
     → resolveTheme is not a function
   × threshold toggle > fetches enabled thresholds once when toggled on, not again when toggled off
     → expected "spy" to be called 1 times, but got 0 times
 Test Files  1 failed | 11 passed (12)
      Tests  3 failed | 33 passed (36)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/theme.test.ts (3 tests) 60ms
 Test Files  12 passed (12)
      Tests  36 passed (36)
EXIT:0
```

Covered:

1. `resolveTheme(undefined, 'light') === 'light'`
2. `resolveTheme(undefined, 'foo') === 'remote-blue'`
3. 阈值开关关→开：`fetchEnabledThresholds` 1 次；再关：仍 1 次

## Files changed

Created/modified in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/styles/tokens.css`
- `src/styles/panel.css`
- `src/components/TrendPanel.vue`
- `src/components/TrendDrawer.vue`
- `src/components/TrendModal.vue`
- `src/plugin.ts`
- `src/index.ts`
- `src/types.ts`
- `tests/theme.test.ts`

Report only (dosiv-v2):

- `.superpowers/sdd/task-10-report.md`

## Commit

- `742c16a` feat: add theme tokens, threshold toggle, and optional shells

## Self-review findings

- Completeness: Create/Modify files present; three required tests pass; tokens 无 `:root`；Panel 根节点 `dit-root` + `resolvedTheme`；Drawer `aside`+mask、Modal 居中层均透传 props 并 emit `close`；`index.ts` 导出组件、`install`、`resolveTheme`。
- `install` 仍只 `setTrendRequest(options.request)`。
- Native checkbox；无 ant-design-vue。
- YAGNI: 无 `open` prop（宿主 `v-if`）；外壳无关闭按钮（点遮罩即可）；未给 Drawer/Modal 单独单测。
- Commit used explicit paths (not `git add .`).

## Concerns

- `buildChartOption` 仍用 `defaultTokens`，未从 CSS 变量读 `--danger/--warning/--notice`；light 主题阈值线颜色与 token 不一致。图线也未用 `--chart-series-*`。
- 第二次打开开关的缓存命中无单测（实现按勾选 key 缓存；brief 只要求关时不再请求）。
- Drawer/Modal 无 emit `close` / 透传单测。
- `resolveTheme(prop, html)` 的「prop 优先」无单测（实现有）。
- 阈值请求失败未 catch，watch 内会变成未处理拒绝。

## Important findings fix

### Findings

1. **Theme tokens:** `rebuildOption` 一直传 `defaultTokens`，未读 `.dit-root` 上的 `--danger` / `--warning` / `--notice` / `--chart-series-1..4`；light 主题阈值线与图线颜色和 token 不一致。
2. **markLine leftover:** `TrendChart` 默认 merge `setOption`，关掉阈值后 option 虽省略 `markLine`，图表实例仍可能留下旧 markLine。
3. **ensureThresholds:** 请求失败未 catch，`watch(showThresholds)` 会跳过 `rebuildOption` 并变成未处理拒绝；空勾选只清 `thresholdMarks` 不清 `thresholdCacheKey`，再勾同一批不会重新 fetch。

### What changed

- `readThemeTokens(.dit-root)`：从 computed CSS vars 读颜色，空则回退 `defaultTokens`；`rebuildOption` 传入 `themeTokens`；`buildChartOption` 用 `color: themeTokens.series`。
- `TrendChart.setOption(option, { notMerge: true })`：关阈值后 option/chart 无残留 markLine data。
- `ensureThresholds`：`try/catch` 失败不跳过 `rebuildOption`、不写 cache；空勾选同时清 `thresholdCacheKey` 与 marks。

### TDD Evidence

#### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ❯ tests/chartOption.test.ts (6 tests | 2 failed)
   × readThemeTokens > falls back to defaultTokens when the element is missing or vars are empty
     → (0 , readThemeTokens) is not a function
   × readThemeTokens > reads danger, warning, notice and series from computed CSS vars
     → vi is not defined
 ❯ tests/theme.test.ts (5 tests | 3 failed)
   × threshold toggle > fetches enabled thresholds once when toggled on, not again when toggled off
     → expected undefined to deeply equal { notMerge: true }
   × theme tokens > passes computed CSS vars from .dit-root as themeTokens
     → expected { danger: '#ff6b6b', …(2) } to deeply equal { danger: '#ff0000', …(3) }
   × TrendChart setOption > uses notMerge so hidden markLine is dropped
     → expected undefined to deeply equal { notMerge: true }
 ❯ tests/panel.test.ts (9 tests | 1 failed)
   × TrendPanel > clears threshold cache on empty selection so the same items fetch again
     → expected "spy" to be called 2 times, but got 1 times
   ✓ TrendPanel > rebuilds the trend option when fetchEnabledThresholds rejects
 Unhandled Rejection: Error: threshold fail
 Test Files  3 failed | 9 passed (12)
      Tests  6 failed | 36 passed (42)
     Errors  1 error
EXIT:1
```

关阈值后 `buildChartOption` 的 `showThresholds: false` 与 option 无 markLine data 在改前已通过（option 省略 markLine）；失败点是 `setOption` 未传 `{ notMerge: true }`。reject 用例断言趋势仍在，但 watch 抛未处理拒绝。

#### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/chartOption.test.ts (6 tests) 35ms
 ✓ tests/theme.test.ts (5 tests) 63ms
 ✓ tests/panel.test.ts (9 tests) 140ms
 Test Files  12 passed (12)
      Tests  42 passed (42)
EXIT:0
```

Covered:

1. 阈值开再关：`fetchEnabledThresholds` 仍 1 次；最后一次 `buildChartOption` 的 `showThresholds` 为 false；option 无 markLine data；`setOption(..., { notMerge: true })`
2. 空勾选清 cache：再选同一批会第二次 fetch
3. `fetchEnabledThresholds` reject 后趋势 option 仍画出 series
4. `.dit-root` 上的 CSS vars 作为 `themeTokens` 进入 option（阈值色 + `color` 调色板）；vars 为空回退 `defaultTokens`

### Fix commit

- `ff2500e` fix: apply CSS theme tokens and keep chart drawing when thresholds fail
- Files: `src/domain/chartOption.ts`, `src/components/TrendPanel.vue`, `src/components/TrendChart.vue`, `tests/theme.test.ts`, `tests/panel.test.ts`, `tests/chartOption.test.ts`
