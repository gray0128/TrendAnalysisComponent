<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { TrendDrawer, TrendModal } from '../src/index'
import type { ModalSize, PickerInput, Theme, TrendLoadInput } from '../src/types'
import {
  THEMES,
  MODAL_SIZES,
  clampDrawerWidthPercent,
  resolveModalSize,
  resolveShellVariant,
} from '../src/types'
import { mockSeedItem } from './mockRequest'

const debug = reactive({
  mode: (localStorage.getItem('trend.debug.mode') || 'mock') as 'mock' | 'live',
  theme: (localStorage.getItem('trend.debug.theme') || 'remote-blue') as Theme,
  deviceCode: localStorage.getItem('trend.debug.deviceCode') || mockSeedItem.deviceCode,
  token: localStorage.getItem('trend.debug.token') || '',
  userId: localStorage.getItem('trend.debug.userId') || '',
  showPicker: localStorage.getItem('trend.debug.showPicker') !== '0',
  shell: resolveShellVariant(localStorage.getItem('trend.debug.shell')),
  drawerWidthPercent: clampDrawerWidthPercent(
    (() => {
      const stored = localStorage.getItem('trend.debug.drawerWidthPercent')
      return stored == null ? undefined : Number(stored)
    })(),
  ),
  modalSize: resolveModalSize(localStorage.getItem('trend.debug.modalSize')),
})

const panelKey = ref(0)

const trend = computed<TrendLoadInput>(() => ({
  items: debug.showPicker
    ? []
    : [{
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
  localStorage.setItem('trend.debug.showPicker', debug.showPicker ? '1' : '0')
  localStorage.setItem('trend.debug.shell', debug.shell)
  localStorage.setItem('trend.debug.drawerWidthPercent', String(debug.drawerWidthPercent))
  localStorage.setItem('trend.debug.modalSize', debug.modalSize)
}

function apply() {
  persist()
  panelKey.value += 1
}

function onTheme(theme: Theme) {
  debug.theme = theme
  persist()
}

function onShowPicker(show: boolean) {
  debug.showPicker = show
  persist()
}

function onShell(variant: string) {
  debug.shell = resolveShellVariant(variant)
  persist()
}

function onDrawerWidth(raw: string) {
  debug.drawerWidthPercent = clampDrawerWidthPercent(Number(raw))
  persist()
}

function onModalSize(size: string) {
  debug.modalSize = resolveModalSize(size)
  persist()
}

const modalSizeLabels: Record<ModalSize, string> = {
  default: '默认',
  large: '大',
  xlarge: '更大',
  fullscreen: '全屏',
}
</script>

<template>
  <div class="pg dit-root" :data-theme="debug.theme">
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
      <label>待选区域
        <select
          :value="debug.showPicker ? '1' : '0'"
          @change="onShowPicker(($event.target as HTMLSelectElement).value === '1')"
        >
          <option value="1">展示</option>
          <option value="0">隐藏</option>
        </select>
      </label>
      <label>外壳
        <select
          :value="debug.shell"
          @change="onShell(($event.target as HTMLSelectElement).value)"
        >
          <option value="drawer">抽屉弹窗</option>
          <option value="modal">普通弹窗</option>
        </select>
      </label>
      <label v-if="debug.shell === 'drawer'">抽屉宽度
        <input
          type="number"
          min="20"
          max="100"
          :value="debug.drawerWidthPercent"
          @change="onDrawerWidth(($event.target as HTMLInputElement).value)"
        >
        %
      </label>
      <label v-else>弹窗大小
        <select
          :value="debug.modalSize"
          @change="onModalSize(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="id in MODAL_SIZES" :key="id" :value="id">{{ modalSizeLabels[id] }}</option>
        </select>
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
      <TrendDrawer
        v-if="debug.shell === 'drawer'"
        :key="panelKey"
        :trend="trend"
        :picker="picker"
        :show-picker="debug.showPicker"
        :theme="debug.theme"
        :width-percent="debug.drawerWidthPercent"
        diagnose-base-url="/ddsat/"
      />
      <TrendModal
        v-else
        :key="panelKey"
        :trend="trend"
        :picker="picker"
        :show-picker="debug.showPicker"
        :theme="debug.theme"
        :size="debug.modalSize"
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
  background: var(--app-background);
  color: var(--text);
}
.pg-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-height: 56px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--shell-topbar-border);
  background: var(--shell-topbar-background);
  box-shadow: var(--shell-topbar-shadow);
}
.pg-bar strong {
  color: var(--shell-title);
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.02em;
  margin-right: 8px;
}
.pg-bar label { display: inline-flex; align-items: center; gap: 6px; }
.pg-bar input, .pg-bar select, .pg-bar button {
  height: 32px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: var(--radius-control);
  padding: 0 10px;
}
.pg-bar button { cursor: pointer; color: var(--text-2); }
.pg-hint { color: var(--text-3); font-size: 12px; }
.pg-main {
  flex: 1;
  min-height: 0;
  display: flex;
  position: relative;
  padding: 12px;
}
.pg-main > .dit-shell {
  position: absolute;
  inset: 12px;
  z-index: 1;
}
</style>
