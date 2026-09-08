# 数据项趋势组件 Implementation Plan

> 仓库已迁至 `/Users/libo/Documents/github/TrendAnalysisComponent`（npm：`@gray0128/trend-analysis-component`）。dosiv-v2 接入暂缓。需求说明见 `docs/需求说明.md`。下文保留当时的实现计划原文。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 发布独立 Vue 3 npm 包 `data-item-trend`，在 dosiv-v2 设备详情中用其内容区替换诊断分析跳转，绘制最多 8 条非信号数据项聚合趋势及可选启用阈值线。

**Architecture:** 新仓库实现纯展示包：宿主注入 `request`，包内调用数据项列表、busout 聚合、阈值三条接口。导出 `TrendPanel`（内容区）以及可选 `TrendDrawer` / `TrendModal`。dosiv-v2 用现有抽屉外壳承载 `TrendPanel`，传入当前数据项作为趋势、当前设备作为待选、当前平台主题。

**Tech Stack:** Vue 3、TypeScript、Vite library mode、echarts 6、vitest、@vue/test-utils。包不依赖 ant-design-vue、pinia、vue-router。

**Spec:** `docs/数据项趋势组件需求说明.md`

## Global Constraints

- 最多同时绘制 8 条趋势；超出取前 8 条并提示。
- 只处理非信号数据项（`signal !== true` / `isSignal === false`）。
- 未传时间：截止 = 现在，开始 = 现在 − 2 小时。
- `aggregateFunc` 必须为 `2`，`reserveDecimal` 必须为 `3`。
- 阈值开关默认关闭；关闭时不得为画线请求阈值。
- 只画 `enabled === '1'` 的阈值；双阈值画两条水平虚线。
- 主题只能是 `dark` | `light` | `remote-blue`。
- 待选参数为空时不得渲染待选区域。
- 趋势接口：`POST /iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition`。
- 数据项列表：`POST /dosis/service/ISDV01/getKpiValueListByBusFilterDoGet`。
- 阈值：`POST /api/threshold/customized/getThresholdListByCondition`。
- 包不依赖 ant-design-vue。

## File Structure

新仓库（与 dosiv-v2 同级）：`/Users/libo/Documents/gitlab/data-item-trend/`

```
data-item-trend/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  vitest.config.ts
  src/
    index.ts
    types.ts
    time.ts
    limits.ts
    plugin.ts
    api/
      http.ts
      dataItems.ts
      trend.ts
      thresholds.ts
    domain/
      identity.ts
      mapDataItem.ts
      mapThreshold.ts
      chartOption.ts
    components/
      TrendPanel.vue
      TrendQueryBar.vue
      TrendChart.vue
      TrendPicker.vue
      TrendDrawer.vue
      TrendModal.vue
    styles/
      tokens.css
      panel.css
  tests/
    time.test.ts
    limits.test.ts
    identity.test.ts
    mapDataItem.test.ts
    mapThreshold.test.ts
    chartOption.test.ts
    api.test.ts
```

dosiv-v2 修改：

- `package.json`：依赖 `data-item-trend`（本地开发用 `file:../data-item-trend`）。
- `src/main.ts`：`app.use(DataItemTrend, { request })`。
- `src/views/wgMyDevice/components/DeviceDetailDrawer.vue`：用本组件替换 `openDdsatAnalyze`。
- 新建 `src/views/wgMyDevice/adapters/dataItemTrendRequest.ts`：按 URL 选择 token 头并转发 axios。

---

### Task 1: 脚手架与导出入口

**Files:**
- Create: `/Users/libo/Documents/gitlab/data-item-trend/package.json`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/vite.config.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/tsconfig.json`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/vitest.config.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/src/index.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/src/types.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/tests/types-smoke.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: `Theme`、`TrendItemIdentity`、`TrendLoadInput`、`PickerInput`、`TrendRequest`、`MAX_TREND_SERIES`

- [ ] **Step 1: 初始化仓库与 package.json**

```bash
mkdir -p /Users/libo/Documents/gitlab/data-item-trend
cd /Users/libo/Documents/gitlab/data-item-trend
git init
```

`package.json`：

```json
{
  "name": "data-item-trend",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.5.0"
  },
  "dependencies": {
    "echarts": "^6.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.8",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^26.1.0",
    "typescript": "~5.9.0",
    "vite": "^8.2.0",
    "vite-plugin-dts": "^4.5.0",
    "vitest": "^3.2.0",
    "vue": "^3.5.40"
  },
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: 写入 types.ts**

```ts
export type Theme = 'dark' | 'light' | 'remote-blue'

export const THEMES: readonly Theme[] = ['dark', 'light', 'remote-blue']
export const MAX_TREND_SERIES = 8
export const DEFAULT_WINDOW_MS = 2 * 60 * 60 * 1000
export const AGGREGATE_FUNC = 2
export const RESERVE_DECIMAL = 3

export interface TrendItemIdentity {
  deviceCode: string
  pointId: string
  kpiId: string
  displayName?: string
  pointName?: string
  unit?: string
}

export interface TrendLoadInput {
  items: TrendItemIdentity[]
  startTimeMs?: number
  endTimeMs?: number
}

export type PickerInput =
  | { type: 'device'; deviceCode: string; deviceName?: string }
  | { type: 'items'; items: TrendItemIdentity[] }

export interface TrendRequest {
  (url: string, init: { method?: 'GET' | 'POST'; data?: unknown; headers?: Record<string, string> }): Promise<unknown>
}

export interface PluginOptions {
  request: TrendRequest
}
```

`src/index.ts` 先只导出类型与常量：

```ts
export {
  THEMES, MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC, RESERVE_DECIMAL,
} from './types'
export type {
  Theme, TrendItemIdentity, TrendLoadInput, PickerInput, TrendRequest, PluginOptions,
} from './types'
```

- [ ] **Step 3: 写失败测试（常量存在）**

```ts
import { describe, expect, it } from 'vitest'
import { MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC } from '../src/types'

describe('package constants', () => {
  it('caps series at 8 and defaults window to 2 hours with max aggregate', () => {
    expect(MAX_TREND_SERIES).toBe(8)
    expect(DEFAULT_WINDOW_MS).toBe(2 * 60 * 60 * 1000)
    expect(AGGREGATE_FUNC).toBe(2)
  })
})
```

- [ ] **Step 4: 配置 vitest 并跑通**

`vitest.config.ts`：`environment: 'jsdom'`，`include: ['tests/**/*.test.ts']`。

Run: `cd /Users/libo/Documents/gitlab/data-item-trend && npm test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold data-item-trend package"
```

---

### Task 2: 时间窗、上限、身份键

**Files:**
- Create: `src/time.ts`
- Create: `src/limits.ts`
- Create: `src/domain/identity.ts`
- Create: `tests/time.test.ts`
- Create: `tests/limits.test.ts`
- Create: `tests/identity.test.ts`

**Interfaces:**
- Consumes: `TrendItemIdentity`、`DEFAULT_WINDOW_MS`、`MAX_TREND_SERIES`
- Produces:
  - `TIME_PRESETS: { id: string; label: string; ms: number }[]`
  - `resolveTimeWindow(start?: number, end?: number, now?: number): { startTimeMs: number; endTimeMs: number }`
  - `applyPreset(endTimeMs: number, presetMs: number, now?: number): { startTimeMs: number; endTimeMs: number }`
  - `shiftWindow(start, end, deltaMs, now): { startTimeMs; endTimeMs }`
  - `capSeries<T>(items: T[]): { items: T[]; overflow: number }`
  - `itemKey(item: TrendItemIdentity): string`

- [ ] **Step 1: 写失败测试**

`tests/time.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { applyPreset, resolveTimeWindow, shiftWindow, TIME_PRESETS } from '../src/time'

describe('resolveTimeWindow', () => {
  it('defaults to last 2 hours when times omitted', () => {
    const now = 1_700_000_000_000
    expect(resolveTimeWindow(undefined, undefined, now)).toEqual({
      startTimeMs: now - 2 * 60 * 60 * 1000,
      endTimeMs: now,
    })
  })
})

describe('TIME_PRESETS', () => {
  it('includes the confirmed shortcut list', () => {
    expect(TIME_PRESETS.map(p => p.label)).toEqual([
      '2小时', '8小时', '24小时', '2天', '7天', '14天', '30天', '60天', '90天',
    ])
  })
})

describe('applyPreset', () => {
  it('keeps end time and changes duration', () => {
    const end = 1_700_000_000_000
    expect(applyPreset(end, 8 * 3600 * 1000)).toEqual({
      startTimeMs: end - 8 * 3600 * 1000,
      endTimeMs: end,
    })
  })
})

describe('shiftWindow', () => {
  it('shifts both ends and does not let end pass now', () => {
    const now = 1000
    expect(shiftWindow(0, 400, 800, now)).toEqual({ startTimeMs: 600, endTimeMs: 1000 })
  })
})
```

`tests/limits.test.ts`：10 条输入 → `items.length === 8` 且 `overflow === 2`。

`tests/identity.test.ts`：`itemKey({ deviceCode: 'A', pointId: '01', kpiId: 'k' }) === 'A*01*k'`。

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`

Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现**

`src/time.ts` 快捷档毫秒：2h、8h、24h、2d、7d、14d、30d、60d、90天。`shiftWindow` 先加 delta，若 `end > now` 则整体回退使 `end === now`。

`src/limits.ts`：`items.slice(0, MAX_TREND_SERIES)`。

`src/domain/identity.ts`：`` `${deviceCode}*${pointId}*${kpiId}` ``。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add time window, series cap, and item key"
```

---

### Task 3: 数据项映射与信号过滤

**Files:**
- Create: `src/domain/mapDataItem.ts`
- Create: `tests/mapDataItem.test.ts`

**Interfaces:**
- Consumes: `TrendItemIdentity`
- Produces: `mapKpiRowToIdentity(row, deviceCode, pointNo): TrendItemIdentity | null`（信号项返回 `null`）；`mapAllDateList(allDateList, deviceCode): TrendItemIdentity[]`

映射与设备详情 `mapKpiToDataItem` 对齐：

- `pointId` ← `row.pointNo ?? pointNo`
- `kpiId` ← `String(row.kpiId ?? row.kpiCode ?? '')`；若宿主行含 `collectKpiId` 则优先用它
- `displayName` ← `row.dataItemDisplayName ?? row.kpiId`
- `signal === true` 的行丢弃

- [ ] **Step 1: 写失败测试**

```ts
it('drops signal rows and keeps collect identity', () => {
  const list = mapAllDateList({
    '01': [
      { kpiId: 'RMS', dataItemDisplayName: '速度有效值', signal: false, pointNo: '01' },
      { kpiId: 'WAVE', signal: true, pointNo: '01' },
    ],
  }, 'DEV01')
  expect(list).toEqual([
    { deviceCode: 'DEV01', pointId: '01', kpiId: 'RMS', displayName: '速度有效值', pointName: undefined, unit: undefined },
  ])
})
```

补一条：`collectKpiId` 优先于数字 `kpiId`。

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现 mapDataItem.ts**

`signal === true` 返回 `null`。`kpiId` 取值顺序：`collectKpiId`、非纯数字的 `kpiId`、`kpiCode`。纯数字 `kpiId` 且无 `collectKpiId` 时仍映射但测试要锁住「有 collectKpiId 时不用数字」。

- [ ] **Step 4: 跑测试确认通过**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: map device KPI rows and drop signal items"
```

---

### Task 4: 阈值映射与 markLine 点

**Files:**
- Create: `src/domain/mapThreshold.ts`
- Create: `tests/mapThreshold.test.ts`

**Interfaces:**
- Consumes: 阈值原始行
- Produces:
  - `ThresholdMark { itemKey: string; level: '危险' | '警告' | '注意'; y: number; label: string }`
  - `mapThresholdRows(rows, item): ThresholdMark[]`：过滤 `enabled !== '1'` 且 `enabled !== 1`；单阈值一条；`ruleCondition` 为 `07|08|09|10` 或条件含「介于」「上下限」时输出 `refValue1`/`refValue2` 两条。同一等级多条全部保留。

- [ ] **Step 1: 写失败测试**

1. `enabled: '0'` 不出现。
2. `enabled: '1'`、`severity: 4`、`refValue1: 60` → 一条 `y: 60, level: '危险'`。
3. `ruleCondition: '07'`、`refValue1: 10`、`refValue2: 60` → 两条 y。
4. 同一等级两条启用规则 → 两条 mark。

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现**

`severity`：4 危险、3 警告、2 注意。数值解析与设备详情 `parseNumericValue` 相同思路（有限数字才画）。

- [ ] **Step 4: 跑测试确认通过**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: map enabled thresholds to markline points"
```

---

### Task 5: busout 响应与 echarts option

**Files:**
- Create: `src/domain/chartOption.ts`
- Create: `tests/chartOption.test.ts`

**Interfaces:**
- Consumes: `TrendItemIdentity`、`ThresholdMark`
- Produces:
  - `parseAggregateData(payload): { times: number[]; values: (number | null)[] }`
  - `buildChartOption({ series, showThresholds, marks, themeTokens })`

`parseAggregateData`：读 `data.timestamps`（纳秒字符串 `/ 1e6` 得到毫秒）与 `data.values[0]`。`data == null` 返回空数组。

`buildChartOption`：一张图、多 `line`、共用 Y 轴。`showThresholds === false` 时 option 不含 markLine。为真时按 level 上色：危险 `#ff6b6b`、警告 `#ff8a2b`、注意 `#4d9eff`（与 token `--danger/--warning/--notice` 默认值一致；主题切换时由 CSS 变量同步到调用方传入的 `themeTokens`）。线型 `dashed`。

- [ ] **Step 1: 写失败测试**

```ts
it('treats code 200 data null as empty', () => {
  expect(parseAggregateData({ code: 200, data: null })).toEqual({ times: [], values: [] })
})

it('converts nanosecond timestamps to ms', () => {
  const parsed = parseAggregateData({
    code: 200,
    data: { timestamps: ['1777032984000000000'], values: [[1584.632]] },
  })
  expect(parsed.times[0]).toBe(1777032984000)
  expect(parsed.values[0]).toBe(1584.632)
})

it('omits markLine when thresholds hidden', () => {
  const option = buildChartOption({ series: [], showThresholds: false, marks: [{ itemKey: 'a', level: '危险', y: 1, label: '≥ 1' }], themeTokens: defaultTokens })
  expect(JSON.stringify(option)).not.toContain('markLine')
})
```

- [ ] **Step 2–4: 失败 → 实现 → 通过**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: parse aggregate series and build shared-axis chart option"
```

---

### Task 6: 注入 request 与三条 API

**Files:**
- Create: `src/api/http.ts`
- Create: `src/api/dataItems.ts`
- Create: `src/api/trend.ts`
- Create: `src/api/thresholds.ts`
- Create: `src/plugin.ts`
- Create: `tests/api.test.ts`

**Interfaces:**
- Consumes: `TrendRequest`、`AGGREGATE_FUNC`、`RESERVE_DECIMAL`
- Produces:
  - `setTrendRequest(fn)` / `getTrendRequest()`
  - `fetchDeviceDataItems(deviceCode)`
  - `fetchAggregateTrend(item, startTimeMs, endTimeMs)`
  - `fetchEnabledThresholds(items)`（内部组 `tags` 为 `deviceCode.pointId.kpiId`）
  - `install(app, { request })`

路径必须逐字为：

- `/dosis/service/ISDV01/getKpiValueListByBusFilterDoGet`
- `/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition`
- `/api/threshold/customized/getThresholdListByCondition`

- [ ] **Step 1: 写失败测试（mock request）**

```ts
it('posts busout body without params wrapper', async () => {
  const calls: unknown[] = []
  setTrendRequest(async (url, init) => {
    calls.push({ url, init })
    return { code: 200, data: null }
  })
  await fetchAggregateTrend(
    { deviceCode: 'D', pointId: '01', kpiId: 'k' },
    1,
    2,
  )
  expect(calls[0]).toMatchObject({
    url: '/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition',
    init: {
      method: 'POST',
      data: {
        startTimeMS: 1,
        endTimeMS: 2,
        aggregateFunc: 2,
        reserveDecimal: 3,
        deviceCode: 'D',
        pointId: '01',
        kpiId: 'k',
      },
    },
  })
})
```

另测：数据项列表 body 为 `{ params: { deviceCode, dataItemLabel: null } }`；阈值 body 为 `{ tags: ['D.01.k'] }`。

- [ ] **Step 2–4: 失败 → 实现 → 通过**

未注入 `request` 时抛错：`data-item-trend: request is not installed`。

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add injected request client for three trend APIs"
```

---

### Task 7: TrendQueryBar 与 TrendChart

**Files:**
- Create: `src/components/TrendQueryBar.vue`
- Create: `src/components/TrendChart.vue`
- Create: `src/styles/panel.css`（查询栏、图容器最小样式）
- Test: `tests/queryBar.test.ts`（用 `@vue/test-utils` 挂载）

**Interfaces:**
- Consumes: `TIME_PRESETS`、`resolveTimeWindow`、`applyPreset`、`shiftWindow`、`buildChartOption`
- Produces:
  - QueryBar emit `change: { startTimeMs, endTimeMs }` 与 `query`
  - Chart props：`option`（由父组件传入已 build 的 option）

- [ ] **Step 1: 写失败测试**

点击「8小时」后 emit 的窗口长度为 8 小时且 end 不变。点击「后移」后 end 不超过 `Date.now()` 的测试用注入 `now` prop 避免 flake。

- [ ] **Step 2–4: 实现原生 input[type=datetime-local]、快捷档按钮、前移/档位/后移、查询按钮。Chart 用 echarts.init，`watch option` 后 `setOption`，`onBeforeUnmount` dispose。**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add query bar and echarts trend chart"
```

---

### Task 8: TrendPicker 与 8 条勾选上限

**Files:**
- Create: `src/components/TrendPicker.vue`
- Create: `tests/picker.test.ts`

**Interfaces:**
- Consumes: `PickerInput`、`TrendItemIdentity`、`itemKey`、`MAX_TREND_SERIES`
- Produces: emit `update:selected`（`TrendItemIdentity[]`）；已满 8 条时再勾新项不增加并展示提示「最多选择 8 个数据项」

- [ ] **Step 1: 写失败测试**

`picker=null` 的父级不渲染 picker（在 Task 9 测 Panel）。本任务测：8 条已选时勾第 9 条，`selected` 仍为 8。

- [ ] **Step 2–4: 实现 checkbox 列表；设备类型只展示传入的 `candidates`（由 Panel 请求后传入），不在 Picker 内发请求。**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add data-item picker with 8-item cap"
```

---

### Task 9: TrendPanel 编排

**Files:**
- Create: `src/components/TrendPanel.vue`
- Create: `tests/panel.test.ts`
- Modify: `src/index.ts` 导出 `TrendPanel`

**Interfaces:**
- Consumes: 前述全部
- Produces: props：

```ts
{
  trend: TrendLoadInput
  picker?: PickerInput | null
  theme?: Theme
}
```

打开逻辑必须按需求第 5 节：

1. `capSeries(trend.items)`，`overflow>0` 时内部 `notice` 文案为「最多加载 8 个数据项，其余未加载」。
2. `resolveTimeWindow(trend.startTimeMs, trend.endTimeMs)`。
3. `picker` 为空不渲染 `.dit-picker`。
4. `picker.type==='device'` 时调用 `fetchDeviceDataItems`，默认不勾选，再按 `itemKey` 勾上 cap 后的 trend.items。
5. `picker.type==='items'` 时候选=清单，勾选规则同 4。
6. 对当前勾选逐条 `fetchAggregateTrend`；某条失败记录到 `failedKeys`，其余继续。
7. 阈值开关默认 `false`，不调用 `fetchEnabledThresholds`。

- [ ] **Step 1: 写失败测试（mock api 模块）**

1. 无 picker：容器无 `.dit-picker`。
2. 无勾选：`fetchAggregateTrend` 调用 0 次。
3. 传入 1 条 trend + device picker：mock 列表返回 3 条非信号，选中 1 条，trend 请求 1 次。
4. 阈值默认不请求。

- [ ] **Step 2–4: 实现 Panel 模板：查询栏 + 图 + 条件待选；阈值开关放在查询栏右侧，文案「阈值线」。**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: wire TrendPanel load, picker, and query flow"
```

---

### Task 10: 阈值开关、主题、外壳、插件导出

**Files:**
- Create: `src/styles/tokens.css`（从 dosiv-v2 `src/views/wgMyDevice/styles/tokens.css` 复制三套变量，选择器改为 `.dit-root` / `.dit-root[data-theme='…']`，不要用 `:root` 以免污染宿主）
- Create: `src/components/TrendDrawer.vue`
- Create: `src/components/TrendModal.vue`
- Modify: `src/components/TrendPanel.vue`（根节点 `class="dit-root"` `:data-theme="resolvedTheme"`）
- Modify: `src/plugin.ts`、`src/index.ts`
- Create: `tests/theme.test.ts`

**Interfaces:**
- Consumes: `Theme`、`THEMES`
- Produces: `resolveTheme(prop, htmlDataset): Theme`；未传且 html 不是三套之一时返回 `remote-blue`

- [ ] **Step 1: 写失败测试**

`resolveTheme(undefined, 'light') === 'light'`；`resolveTheme(undefined, 'foo') === 'remote-blue'`。开关从关到开后 `fetchEnabledThresholds` 调用 1 次；再关掉不增加调用。

- [ ] **Step 2–4: 实现**

`TrendDrawer`：右侧 `aside` + 遮罩，emit `close`。`TrendModal`：居中层。两者内部渲染 `TrendPanel` 并透传 props。

`index.ts` 导出组件、`install`、`resolveTheme`。

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add theme tokens, threshold toggle, and optional shells"
```

---

### Task 11: dosiv-v2 安装与 request 适配

**Files:**
- Modify: `/Users/libo/Documents/gitlab/dosiv-v2/package.json`
- Create: `/Users/libo/Documents/gitlab/dosiv-v2/src/views/wgMyDevice/adapters/dataItemTrendRequest.ts`
- Modify: `/Users/libo/Documents/gitlab/dosiv-v2/src/main.ts`

**Interfaces:**
- Consumes: 包的 `install` / `TrendRequest`
- Produces: 按 URL 前缀选头：`/iehm-cloud` → `x-token` 且同时设 `Xplat-Token`；`/api/threshold` → `token`；`/dosis` → `x-token`。一律带 `userId`。

- [ ] **Step 1: 写失败测试（若 dosiv-v2 无 vitest，用最小 node 脚本或把适配函数写成纯函数并在包外用现有 eslint 无测试则改为本任务在 data-item-trend 增加 `tests/hostHeaders.test.ts` 复制同一纯函数）**

将选头逻辑做成纯函数 `headersForUrl(url, token, userId)` 放在适配文件并导出，测试写在包的 `tests/hostHeaders.test.ts` 中复制断言（或抽到包的 `src/api/headers.ts` 仅作文档）。**选定：纯函数放 dosiv-v2 适配文件，测试放包内一份相同实现的单测不现实。改为在 dosiv-v2 适配文件顶部导出 `headersForUrl`，本任务用 node --experimental-vm-modules 不引入。验收改为手动：`npm ls data-item-trend` 能解析 file 依赖。**

实现 `headersForUrl`：

```ts
export function headersForUrl(url: string, token: string, userId: string): Record<string, string> {
  const headers: Record<string, string> = { userId }
  if (url.startsWith('/api/threshold')) headers.token = token
  else headers['x-token'] = token
  if (url.startsWith('/iehm-cloud/api/v1/busout')) headers['Xplat-Token'] = token
  return headers
}
```

- [ ] **Step 2: package.json 增加** `"data-item-trend": "file:../data-item-trend"`，执行 `npm install`。

- [ ] **Step 3: main.ts 在 `app.mount` 前：**

```ts
import DataItemTrend from 'data-item-trend'
import 'data-item-trend/style.css'
import { createDataItemTrendRequest } from '@/views/wgMyDevice/adapters/dataItemTrendRequest'

app.use(DataItemTrend, { request: createDataItemTrendRequest() })
```

`createDataItemTrendRequest` 用现有 axios 或三个已有实例（`dosisRequest` / `ddslpRequest` 不直接用，统一 `axios({ url, method, data, headers })` 走 vite proxy）。

- [ ] **Step 4: `npm run lint:tsc` 通过**

- [ ] **Step 5: Commit（dosiv-v2）**

```bash
git add package.json package-lock.json src/main.ts src/views/wgMyDevice/adapters/dataItemTrendRequest.ts
git commit -m "feat: install data-item-trend and inject proxied request"
```

---

### Task 12: 替换设备详情诊断分析跳转

**Files:**
- Modify: `src/views/wgMyDevice/components/DeviceDetailDrawer.vue`（`openDdsatAnalyze` 及两处调用：看板实时值、数据项「分析」）

**Interfaces:**
- Consumes: `TrendPanel`、`DataItem`、`detail.code`、`pointCode(item)`、`item.code`、`usePlatformTheme`
- Produces: 打开本页抽屉内嵌的趋势层（宿主自有抽屉，不用包的 Drawer）

行为：

- `trend.items = [{ deviceCode, pointId: pointCode(item), kpiId: item.code, displayName: item.displayName, pointName: pointName(item), unit: item.unit }]`
- 不传时间（组件默认 2 小时）
- `picker = { type: 'device', deviceCode, deviceName: detail.name }`
- `theme = drawerTheme`

删除 `openInNewTab` 诊断分析 URL 拼装；可保留函数名改为 `openItemTrend`。缺少三元组时仍 toast「缺少设备编码/测点/数据项，无法打开分析」。成功 toast 改为「已打开数据项趋势」或不 toast。

模板：在 `DataItemDetailDrawer` 旁增加一层，结构与现有 `drawer-l2` 类似，或在当前设备抽屉内用全宽面板。**选定：与数据项详情同级的右侧第二层抽屉，宽度与 `DataItemDetailDrawer` 相当，内部只放 `TrendPanel`。** 点击遮罩关闭。

- [ ] **Step 1: 实现状态 `trendOpen` + `trendItem`，`openItemTrend` 赋值并打开**

- [ ] **Step 2: 看板 `@click.stop="openDdsatAnalyze(item)"` 与列表「分析」改为 `openItemTrend(item)`**

- [ ] **Step 3: 确认源码中不再出现 `DDSAT_BASE_URL` 用于分析跳转（该常量若仅此处使用可移出 import）**

- [ ] **Step 4: `npm run lint:tsc`**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: open data-item trend panel instead of ddsat analyze"
```

---

## Self-Review

**1. Spec coverage**

| 需求 | 任务 |
| --- | --- |
| 趋势清单可跨设备、上限 8、超出提示 | Task 2、9 |
| 待选可空 / 设备 / 清单 | Task 8、9 |
| 默认 2 小时、快捷档、平移、后移不超过现在 | Task 2、7 |
| 一张图多曲线共用 Y | Task 5、7 |
| 阈值默认关、启用才画、双阈值两条虚线、等级色 | Task 4、5、10 |
| 三条指定接口与 busout 请求体 | Task 6 |
| 非信号过滤、collectKpiId | Task 3 |
| 主题三套、可传入 | Task 10、12 |
| 包独立、宿主决定外壳、可选 Drawer/Modal | Task 1、10、12 |
| 替换看板实时值与「分析」 | Task 12 |
| 自定义树 / LPBI01 / ant-design-vue | 明确不做 |

**2. Placeholder scan:** 无 TBD。Task 11 的单测改为安装验收，避免 dosiv-v2 无测试框架时卡住。

**3. Type consistency:** 全程使用 `TrendItemIdentity`、`deviceCode`/`pointId`/`kpiId`；身份键 `deviceCode*pointId*kpiId`；阈值 tag `deviceCode.pointId.kpiId`。
