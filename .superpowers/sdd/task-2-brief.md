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

