### Task 12: 替换设备详情诊断分析跳转

**Files:**
- Modify: `src/views/wgMyDevice/components/DeviceDetailDrawer.vue`（`openDdsatAnalyze` 及两处调用：看板实时值、数据项「分析」）

**Interfaces:**
- Consumes: `TrendPanel`、`DataItem`、`detail.code`、`pointCode(item)`、`item.code`、`usePlatformTheme`
- Produces: 打开本页抽屉内嵌的趋势层（宿主自有抽屉，不用包的 Drawer）

行为：

- `trend.items = [{ deviceCode, pointId: pointCode(item), kpiId: item.code, displayName: item.displayName, pointName: pointName(item), unit: item.unit }]`
- 不传时间（组件默认 2 小时）
- `picker = { type: 'device', deviceCode, deviceName: detail.name }`
- `theme = drawerTheme`

删除 `openInNewTab` 诊断分析 URL 拼装；可保留函数名改为 `openItemTrend`。缺少三元组时仍 toast「缺少设备编码/测点/数据项，无法打开分析」。成功 toast 改为「已打开数据项趋势」或不 toast。

模板：在 `DataItemDetailDrawer` 旁增加一层，结构与现有 `drawer-l2` 类似，或在当前设备抽屉内用全宽面板。**选定：与数据项详情同级的右侧第二层抽屉，宽度与 `DataItemDetailDrawer` 相当，内部只放 `TrendPanel`。** 点击遮罩关闭。

- [ ] **Step 1: 实现状态 `trendOpen` + `trendItem`，`openItemTrend` 赋值并打开**

- [ ] **Step 2: 看板 `@click.stop="openDdsatAnalyze(item)"` 与列表「分析」改为 `openItemTrend(item)`**

- [ ] **Step 3: 确认源码中不再出现 `DDSAT_BASE_URL` 用于分析跳转（该常量若仅此处使用可移出 import）**

- [ ] **Step 4: `npm run lint:tsc`**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: open data-item trend panel instead of ddsat analyze"
```

---

## Self-Review

**1. Spec coverage**

| 需求 | 任务 |
| --- | --- |
| 趋势清单可跨设备、上限 8、超出提示 | Task 2、9 |
| 待选可空 / 设备 / 清单 | Task 8、9 |
| 默认 2 小时、快捷档、平移、后移不超过现在 | Task 2、7 |
| 一张图多曲线共用 Y | Task 5、7 |
| 阈值默认关、启用才画、双阈值两条虚线、等级色 | Task 4、5、10 |
| 三条指定接口与 busout 请求体 | Task 6 |
| 非信号过滤、collectKpiId | Task 3 |
| 主题三套、可传入 | Task 10、12 |
| 包独立、宿主决定外壳、可选 Drawer/Modal | Task 1、10、12 |
| 替换看板实时值与「分析」 | Task 12 |
| 自定义树 / LPBI01 / ant-design-vue | 明确不做 |

**2. Placeholder scan:** 无 TBD。Task 11 的单测改为安装验收，避免 dosiv-v2 无测试框架时卡住。

**3. Type consistency:** 全程使用 `TrendItemIdentity`、`deviceCode`/`pointId`/`kpiId`；身份键 `deviceCode*pointId*kpiId`；阈值 tag `deviceCode.pointId.kpiId`。
