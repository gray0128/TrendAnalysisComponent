# TrendAnalysisComponent

Vue 3 数据项历史趋势组件。支持最多 8 条非信号数据项的聚合趋势、启用阈值线，以及 `dark` / `light` / `remote-blue` 三套主题。

## 安装

```bash
npm install @gray0128/trend-analysis-component
```

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
  <TrendPanel :trend="trend" :picker="picker" :theme="theme" />
</template>
```

也可使用包内可选外壳 `TrendDrawer` / `TrendModal`。

未传时间时，默认最近 2 小时。待选参数为空则不渲染待选区域。

## 开发

```bash
npm install
npm test
npm run build
```
