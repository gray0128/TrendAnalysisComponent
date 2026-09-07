<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import '../styles/panel.css'

const props = defineProps<{
  option: Record<string, unknown>
  loading?: boolean
}>()

function hasSeriesData(option: Record<string, unknown>) {
  const series = option.series
  if (!Array.isArray(series) || series.length === 0) return false
  return series.some((item) => {
    const data = (item as { data?: unknown }).data
    return Array.isArray(data) && data.length > 0
  })
}

const el = ref<HTMLDivElement | null>(null)
const rootEl = ref<HTMLDivElement | null>(null)
const tipEl = ref<HTMLDivElement | null>(null)
const markTip = ref<{ html: string; x: number; y: number } | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function isMarkLabel(params: unknown): boolean {
  const target = (params as { event?: { target?: { type?: string; style?: { text?: unknown } } } }).event?.target
  if (!target) return false
  return target.type === 'text' || target.type === 'tspan' || typeof target.style?.text === 'string'
}

function markHoverHtml(params: unknown): string | null {
  const p = params as { componentType?: string; data?: { hover?: string } }
  if (p.componentType !== 'markLine' || !isMarkLabel(params)) return null
  return p.data?.hover || null
}

function eventPoint(params: unknown): { x: number; y: number } {
  const ev = (params as { event?: { offsetX?: number; offsetY?: number; zrX?: number; zrY?: number } }).event
  return {
    x: ev?.offsetX ?? ev?.zrX ?? 0,
    y: ev?.offsetY ?? ev?.zrY ?? 0,
  }
}

function placeTip(html: string, x: number, y: number) {
  markTip.value = { html, x, y }
  void nextTick(() => {
    const root = rootEl.value
    const tip = tipEl.value
    if (!root || !tip || markTip.value?.html !== html) return
    const pad = 8
    const tw = tip.offsetWidth
    const th = tip.offsetHeight
    let left = x - tw - 8
    let top = y - th / 2
    if (left < pad) left = pad
    if (left + tw > root.clientWidth - pad) left = Math.max(pad, root.clientWidth - tw - pad)
    if (top < pad) top = pad
    if (top + th > root.clientHeight - pad) top = Math.max(pad, root.clientHeight - th - pad)
    markTip.value = { html, x: left, y: top }
  })
}

function onMarkHover(params: unknown) {
  const html = markHoverHtml(params)
  if (!html) return
  chart?.dispatchAction({ type: 'hideTip' })
  const pt = eventPoint(params)
  placeTip(html, pt.x, pt.y)
}

function onMarkOut(params: unknown) {
  const p = params as { componentType?: string }
  if (p.componentType === 'markLine') markTip.value = null
}

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  chart.setOption(props.option, { notMerge: true })
  chart.on('mouseover', onMarkHover)
  chart.on('mousemove', onMarkHover)
  chart.on('mouseout', onMarkOut)
  chart.on('globalout', () => {
    markTip.value = null
  })
  if (rootEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(rootEl.value)
  }
})

watch(
  () => props.option,
  option => {
    markTip.value = null
    chart?.setOption(option, { notMerge: true })
  },
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div
    ref="rootEl"
    class="trend-chart"
    :class="{ 'is-loading': loading }"
    :aria-busy="loading ? 'true' : undefined"
  >
    <div ref="el" class="trend-chart__plot" />
    <div v-if="loading" class="trend-chart__state">加载中</div>
    <div v-else-if="!hasSeriesData(option)" class="trend-chart__state">暂无趋势数据</div>
    <div
      v-if="markTip"
      ref="tipEl"
      class="trend-chart__tip"
      :style="{ left: `${markTip.x}px`, top: `${markTip.y}px` }"
      v-html="markTip.html"
    />
  </div>
</template>
