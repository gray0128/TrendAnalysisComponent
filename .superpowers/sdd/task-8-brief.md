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

