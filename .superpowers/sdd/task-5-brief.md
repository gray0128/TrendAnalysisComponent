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

