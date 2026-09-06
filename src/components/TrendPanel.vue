<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { capSeries } from '../limits'
import { resolveTimeWindow } from '../time'
import { itemKey } from '../domain/identity'
import { buildChartOption, parseAggregateData, readThemeTokens } from '../domain/chartOption'
import type { ChartSeriesInput } from '../domain/chartOption'
import type { ThresholdMark } from '../domain/mapThreshold'
import { fetchDeviceDataItems } from '../api/dataItems'
import { fetchAggregateTrend } from '../api/trend'
import { fetchEnabledThresholds } from '../api/thresholds'
import { resolveTheme } from '../types'
import type { PickerInput, Theme, TrendItemIdentity, TrendLoadInput } from '../types'
import TrendQueryBar from './TrendQueryBar.vue'
import TrendChart from './TrendChart.vue'
import TrendPicker from './TrendPicker.vue'
import '../styles/tokens.css'
import '../styles/panel.css'

const props = defineProps<{
  trend: TrendLoadInput
  picker?: PickerInput | null
  theme?: Theme
}>()

const initialWindow = resolveTimeWindow(props.trend.startTimeMs, props.trend.endTimeMs)
const startTimeMs = ref(initialWindow.startTimeMs)
const endTimeMs = ref(initialWindow.endTimeMs)
const candidates = ref<TrendItemIdentity[]>([])
const selected = ref<TrendItemIdentity[]>([])
const showThresholds = ref(false)
const failedKeys = ref<string[]>([])
const loadedSeries = ref<ChartSeriesInput[]>([])
const thresholdMarks = ref<ThresholdMark[]>([])
const rootEl = ref<HTMLElement | null>(null)
const selectedOverflow = ref(false)
let loadGeneration = 0
let thresholdCacheKey: string | null = null

const overflowNotice = computed(
  () => capSeries(props.trend.items).overflow > 0 || selectedOverflow.value,
)
const hasPicker = computed(() => props.picker != null)
const resolvedTheme = computed(() =>
  resolveTheme(props.theme, document.documentElement.dataset.theme),
)

function emptyOption() {
  return buildChartOption({
    series: [],
    showThresholds: false,
    marks: [],
    themeTokens: readThemeTokens(rootEl.value),
  })
}

const chartOption = ref<Record<string, unknown>>(emptyOption())

function marksKey(items: TrendItemIdentity[]) {
  return items.map(itemKey).join('\0')
}

function rebuildOption() {
  chartOption.value = buildChartOption({
    series: loadedSeries.value,
    showThresholds: showThresholds.value,
    marks: thresholdMarks.value,
    themeTokens: readThemeTokens(rootEl.value),
  })
}

function matchSelected(cappedItems: TrendItemIdentity[]) {
  const keys = new Set(cappedItems.map(itemKey))
  return candidates.value.filter(item => keys.has(itemKey(item)))
}

async function hydrate() {
  const generation = ++loadGeneration
  const capped = capSeries(props.trend.items)
  const window = resolveTimeWindow(props.trend.startTimeMs, props.trend.endTimeMs)
  startTimeMs.value = window.startTimeMs
  endTimeMs.value = window.endTimeMs

  const picker = props.picker
  if (picker == null) {
    if (generation !== loadGeneration) return
    candidates.value = []
    selected.value = capped.items
    await loadTrends(generation)
    return
  }

  let nextCandidates: TrendItemIdentity[]
  if (picker.type === 'device') {
    nextCandidates = await fetchDeviceDataItems(picker.deviceCode)
  } else {
    nextCandidates = picker.items
  }
  if (generation !== loadGeneration) return
  candidates.value = nextCandidates
  selected.value = matchSelected(capped.items)
  await loadTrends(generation)
}

async function ensureThresholds(items: TrendItemIdentity[], generation: number) {
  if (items.length === 0) {
    thresholdMarks.value = []
    thresholdCacheKey = null
    return
  }
  if (!showThresholds.value) return
  const key = marksKey(items)
  if (thresholdCacheKey === key) return
  try {
    const marks = await fetchEnabledThresholds(items)
    if (generation !== loadGeneration) return
    thresholdCacheKey = key
    thresholdMarks.value = marks
  } catch {
    // do not cache a failed fetch
  }
}

async function loadTrends(generation = ++loadGeneration) {
  if (generation !== loadGeneration) return

  const capped = capSeries(selected.value)
  selectedOverflow.value = capped.overflow > 0
  const items = capped.items
  if (capped.overflow > 0) {
    selected.value = items
  }

  if (items.length === 0) {
    failedKeys.value = []
    loadedSeries.value = []
    await ensureThresholds([], generation)
    if (generation !== loadGeneration) return
    rebuildOption()
    return
  }

  const start = startTimeMs.value
  const end = endTimeMs.value
  const results = await Promise.all(items.map(async (item) => {
    try {
      const payload = await fetchAggregateTrend(item, start, end)
      return { ok: true as const, item, parsed: parseAggregateData(payload) }
    } catch {
      return { ok: false as const, item }
    }
  }))

  if (generation !== loadGeneration) return

  const failed: string[] = []
  const series: ChartSeriesInput[] = []
  for (const result of results) {
    if (result.ok) {
      series.push({
        item: result.item,
        times: result.parsed.times,
        values: result.parsed.values,
      })
    } else {
      failed.push(itemKey(result.item))
    }
  }

  failedKeys.value = failed
  loadedSeries.value = series
  await ensureThresholds(items, generation)
  if (generation !== loadGeneration) return
  rebuildOption()
}

function onWindowChange(next: { startTimeMs: number; endTimeMs: number }) {
  startTimeMs.value = next.startTimeMs
  endTimeMs.value = next.endTimeMs
}

function onQuery() {
  void loadTrends()
}

function onUpdateSelected(items: TrendItemIdentity[]) {
  selected.value = items
  void loadTrends()
}

watch(showThresholds, async (on) => {
  if (on) {
    await ensureThresholds(capSeries(selected.value).items, loadGeneration)
  }
  rebuildOption()
})

watch(
  () => [props.trend, props.picker] as const,
  () => {
    void hydrate()
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div ref="rootEl" class="dit-root dit-panel" :data-theme="resolvedTheme">
    <div class="dit-query">
      <TrendQueryBar
        :start-time-ms="startTimeMs"
        :end-time-ms="endTimeMs"
        @change="onWindowChange"
        @query="onQuery"
      />
      <label class="dit-threshold">
        <input v-model="showThresholds" type="checkbox">
        阈值线
      </label>
    </div>
    <p v-if="overflowNotice" class="dit-notice">最多加载 8 个数据项，其余未加载</p>
    <p v-if="failedKeys.length" class="dit-failed">
      {{ failedKeys.join('、') }} 加载失败
    </p>
    <TrendChart :option="chartOption" />
    <div v-if="hasPicker" class="dit-picker">
      <TrendPicker
        :candidates="candidates"
        :selected="selected"
        @update:selected="onUpdateSelected"
      />
    </div>
  </div>
</template>
