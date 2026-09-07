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
2. `enabled: '1'`、`severity: 3`、`refValue1: 60` → 一条 `y: 60, level: '危险'`。
3. `ruleCondition: '07'`、`refValue1: 10`、`refValue2: 60` → 两条 y。
4. 同一等级两条启用规则 → 两条 mark。

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现**

`severity`：3 危险、2 警告、其他注意。数值解析与设备详情 `parseNumericValue` 相同思路（有限数字才画）。

- [ ] **Step 4: 跑测试确认通过**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: map enabled thresholds to markline points"
```

---

