# TrendAnalysisComponent

Vue 3 数据项历史趋势组件。支持最多 10 条非信号数据项的聚合趋势、启用阈值线，以及 `dark` / `light` / `remote-blue` 三套主题。

## 安装

```bash
npm install @gray0128/trend-analysis-component@0.1.6
```

依赖从 npm registry 安装。宿主项目的 `package.json` 和锁文件不得使用本地目录、`file:` 依赖或临时 tarball 路径，否则其他环境无法通过 `npm ci` 还原依赖。

宿主需注入 `request`，由宿主按路径带上 `x-token` / `token` / `Xplat-Token`。

```ts
import { createApp } from 'vue'
import TrendAnalysis, { TrendPanel } from '@gray0128/trend-analysis-component'
import '@gray0128/trend-analysis-component/style.css'

const app = createApp(App)
app.use(TrendAnalysis, {
  request: async (url, init) => {
    const res = await fetch(url, {
      method: init.method ?? 'POST',
      headers: { 'Content-Type': 'application/json', ...init.headers },
      body: init.data != null ? JSON.stringify(init.data) : undefined,
    })
    return res.json()
  },
})
```

## 使用

外壳（抽屉或弹窗）由宿主决定。内容区用 `TrendPanel`：

```vue
<script setup lang="ts">
import { TrendPanel } from '@gray0128/trend-analysis-component'
import type { TrendLoadInput, PickerInput, Theme } from '@gray0128/trend-analysis-component'

const trend: TrendLoadInput = {
  items: [{ deviceCode: 'DEV01', pointId: '01', kpiId: 'RMS', displayName: '速度有效值' }],
}
const picker: PickerInput = { type: 'device', deviceCode: 'DEV01', deviceName: '示例设备' }
const theme: Theme = 'remote-blue'
</script>

<template>
  <TrendPanel
    :trend="trend"
    :picker="picker"
    :theme="theme"
    diagnose-base-url="/ddsat/"
  />
</template>
```

也可使用包内可选外壳 `TrendDrawer`（缺省抽屉，`widthPercent` 为页面宽度百分比）/ `TrendModal`（`size`：`1040*720`（缺省） / `1280*800` / `fullscreen`）。

未传时间时，默认最近 2 小时。待选参数为空则不渲染待选区域。

`diagnoseBaseUrl` 只传诊断分析应用基址，不要包含 `#/comprehensiveTrend/...`。0.1.5 及以上版本会从应用根入口跳转，将 `origin`、`deviceCode` 等查询参数放在 Hash 路由之前。多选数据项时，组件同时写入 `sessionStorage.deviceKpi`，供诊断分析页恢复选中项并自动查询。

阈值接口的 `severity` 使用 `2`（注意）、`3`（警告）、`4`（危险）。组件仅绘制已启用且阈值为有效数字的规则。

宿主接入步骤、入参和故障排查见 [docs/接入指南.md](docs/接入指南.md)。完整需求见 [docs/需求说明.md](docs/需求说明.md)。实现计划见 [docs/superpowers/plans/2026-09-06-data-item-trend.md](docs/superpowers/plans/2026-09-06-data-item-trend.md)，SDD 记录见 [.superpowers/sdd/progress.md](.superpowers/sdd/progress.md)。

## 开发

```bash
npm install
npm test
npm run dev
npm run build
```

`npm run dev` 打开 playground（默认 `http://localhost:5177`）。

- 数据源选 **Mock**：不发真实请求，用内置设备 `MOCKDEV01`。
- 数据源选 **后端代理**：按 `vite.config.ts` 里的 `PROXY_TARGET` 转发 `/dosis`、`/iehm-cloud`、`/api/threshold`（写法与 dosiv-v2 相同，切换环境只改这一处），并填写 token / userId。配置模板见 [vite.config.example.ts](vite.config.example.ts)。
