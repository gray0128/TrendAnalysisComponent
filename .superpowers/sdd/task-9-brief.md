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

