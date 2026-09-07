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

