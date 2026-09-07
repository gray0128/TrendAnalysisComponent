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

