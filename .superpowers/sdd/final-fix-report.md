# Final Fix Report: picker 身份不匹配与列表加载失败仍绘制趋势

## What you implemented

Package (`/Users/libo/Documents/gitlab/data-item-trend`):

- Modified `src/components/TrendPanel.vue`
  - `hydrate` 后 `selected = resolveSelected(candidates, capped.items)`：匹配 `itemKey` 的 picker 候选，加上不在候选中的 `capped.items`，趋势输入项不再因身份不一致被丢弃
  - picker 复选框仍只遍历 `candidates`，因此只勾匹配候选；未匹配的趋势输入项继续进入 `loadTrends`
  - `fetchDeviceDataItems` 包在 try/catch 中；失败时 `candidates = []`，仍选中并绘制 `capped.items`，并设置 notice「数据项列表加载失败」
- Modified `tests/panel.test.ts`
  - device picker 返回不同 `kpiId` 时仍对趋势输入项调用 1 次 `fetchAggregateTrend`，对应复选框不勾选
  - `fetchDeviceDataItems` reject 时仍拉取输入项趋势，并展示「数据项列表加载失败」

Host：`DeviceDetailDrawer` 无需改动。宿主继续传 `kpiId: item.code` + `picker: { type: 'device' }`；包侧补齐未匹配输入项，设备详情路径可继续工作。

## What you tested and results

- 包：`npm test` 通过（12 files / 44 tests，exit 0）

## TDD Evidence

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/panel.test.ts (11 tests)

 Test Files  12 passed (12)
      Tests  44 passed (44)
EXIT:0
```

Covered:

1. picker 候选 `kpiId`（如 `VEL_RMS`）与趋势输入 `kpiId`（如 `12345`）不一致时，仍 `fetchAggregateTrend` 1 次且对象为趋势输入项
2. `fetchDeviceDataItems` 抛错时仍拉取输入项趋势，并显示「数据项列表加载失败」
3. 匹配成功的既有用例仍只勾选匹配候选、只拉一次趋势

## Files changed

Package:

- `src/components/TrendPanel.vue`
- `tests/panel.test.ts`

Host: 无

Report only (dosiv-v2，未提交):

- `.superpowers/sdd/final-fix-report.md`
