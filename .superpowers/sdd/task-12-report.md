# Task 12 Report: 替换设备详情诊断分析跳转

## What you implemented

Host (`/Users/libo/Documents/gitlab/dosiv-v2`):

- Modified `src/views/wgMyDevice/components/DeviceDetailDrawer.vue`
  - 删除 `openDdsatAnalyze` 及 `DDSAT_BASE_URL` / 诊断分析 URL 拼装 / `openInNewTab` 跳转
  - 新增 `trendOpen` + `trendItem`，`openItemTrend(item)` 校验三元组后赋值并打开
  - `trend.items = [{ deviceCode, pointId: pointCode(item), kpiId: item.code, displayName, pointName, unit }]`，不传时间
  - `picker = { type: 'device', deviceCode, deviceName: detail.name }`
  - `theme = drawerTheme`
  - 缺少三元组仍 toast「缺少设备编码/测点/数据项，无法打开分析」；成功不 toast
  - 看板实时值、数据项「分析」两处改为 `openItemTrend`；title 改为「打开数据项趋势」
  - 宿主自有 `drawer-l2` 外壳（宽度用 `secondaryStyle`），内部只放 `TrendPanel`；点击遮罩关闭
- Modified `src/views/wgMyDevice/styles/device-drawer.css`：`.drawer-l2 > .dit-panel` 填满并滚动

未使用包的 `TrendDrawer` / `TrendModal`。`openInNewTab` / `rewriteToCurrentOrigin` 仍用于模型配置与规则编辑器。

## What you tested and results

- 宿主：`npm run lint:tsc` 通过（exit 0）
- 源码检索：`DeviceDetailDrawer.vue` 中无 `openDdsatAnalyze`、无 `DDSAT_BASE_URL`、无诊断分析 URL 拼装

## TDD Evidence

本任务 brief 无单测步骤（Task 11 已将 dosiv-v2 单测改为安装验收）。

### RED

无失败测试。验收为源码不再拼装 ddsat 分析 URL，改为本页 `TrendPanel`。

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/dosiv-v2 && npm run lint:tsc
```

Output (abridged):

```
> dosiv-v2@0.0.0 lint:tsc
> vue-tsc --noEmit -p tsconfig.app.json

EXIT:0
```

Covered:

1. `openItemTrend` 缺三元组 toast，成功打开本页二层抽屉
2. 看板实时值与数据项「分析」均调用 `openItemTrend`
3. 不传时间、传入当前设备 picker 与 `drawerTheme`

## Files changed

Host:

- `src/views/wgMyDevice/components/DeviceDetailDrawer.vue`
- `src/views/wgMyDevice/styles/device-drawer.css`

Report only (dosiv-v2，未提交):

- `.superpowers/sdd/task-12-report.md`
