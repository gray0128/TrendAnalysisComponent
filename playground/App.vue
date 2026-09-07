<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { TrendPanel } from '../src/index'
import type { PickerInput, Theme, TrendLoadInput } from '../src/types'
import { THEMES } from '../src/types'
import { mockSeedItem } from './mockRequest'

const debug = reactive({
  mode: (localStorage.getItem('trend.debug.mode') || 'mock') as 'mock' | 'live',
  theme: (localStorage.getItem('trend.debug.theme') || 'remote-blue') as Theme,
  deviceCode: localStorage.getItem('trend.debug.deviceCode') || mockSeedItem.deviceCode,
  token: localStorage.getItem('trend.debug.token') || '',
  userId: localStorage.getItem('trend.debug.userId') || '',
})

const panelKey = ref(0)

const trend = computed<TrendLoadInput>(() => ({
  items: [{
    ...mockSeedItem,
    deviceCode: debug.deviceCode,
  }],
}))

const picker = computed<PickerInput>(() => ({
  type: 'device',
  deviceCode: debug.deviceCode,
  deviceName: debug.mode === 'mock' ? 'Mock 设备' : debug.deviceCode,
}))

function persist() {
  localStorage.setItem('trend.debug.mode', debug.mode)
  localStorage.setItem('trend.debug.theme', debug.theme)
  localStorage.setItem('trend.debug.deviceCode', debug.deviceCode)
  localStorage.setItem('trend.debug.token', debug.token)
  localStorage.setItem('trend.debug.userId', debug.userId)
}

function apply() {
  persist()
  panelKey.value += 1
}

function onTheme(theme: Theme) {
  debug.theme = theme
  persist()
}
</script>

<template>
  <div class="pg" :data-theme="debug.theme">
    <header class="pg-bar">
      <strong>趋势分析组件调试</strong>
      <label>数据源
        <select v-model="debug.mode">
          <option value="mock">Mock</option>
          <option value="live">后端代理</option>
        </select>
      </label>
      <label>主题
        <select :value="debug.theme" @change="onTheme(($event.target as HTMLSelectElement).value as Theme)">
          <option v-for="id in THEMES" :key="id" :value="id">{{ id }}</option>
        </select>
      </label>
      <label>设备编码
        <input v-model="debug.deviceCode" placeholder="deviceCode">
      </label>
      <template v-if="debug.mode === 'live'">
        <label>token
          <input v-model="debug.token" placeholder="x-token / token">
        </label>
        <label>userId
          <input v-model="debug.userId" placeholder="userId">
        </label>
      </template>
      <button type="button" @click="apply">应用</button>
      <span class="pg-hint">{{ debug.mode === 'mock' ? '不发真实请求' : '经 vite proxy 转发' }}</span>
    </header>
    <main class="pg-main">
      <TrendPanel
        :key="panelKey"
        :trend="trend"
        :picker="picker"
        :theme="debug.theme"
        diagnose-base-url="/ddsat/"
      />
    </main>
  </div>
</template>

<style>
html, body, #app { height: 100%; margin: 0; }
.pg {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0b1628;
  color: #d7e0e8;
  font: 13px/1.4 system-ui, sans-serif;
}
.pg-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(70,128,188,.4);
  background: #10233f;
}
.pg-bar label { display: inline-flex; align-items: center; gap: 6px; }
.pg-bar input, .pg-bar select, .pg-bar button {
  height: 28px;
  border: 1px solid rgba(72,106,151,.72);
  background: rgba(18,38,70,.9);
  color: #d7e0e8;
  border-radius: 3px;
  padding: 0 8px;
}
.pg-bar button { cursor: pointer; }
.pg-hint { color: #879bb5; font-size: 12px; }
.pg-main {
  flex: 1;
  min-height: 0;
  display: flex;
}
.pg-main > .dit-panel {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
