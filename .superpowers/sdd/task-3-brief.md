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

