<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import '../styles/panel.css'

const props = defineProps<{
  option: Record<string, unknown>
}>()

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  chart.setOption(props.option, { notMerge: true })
})

watch(
  () => props.option,
  option => {
    chart?.setOption(option, { notMerge: true })
  },
  { deep: true },
)

onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" class="trend-chart" />
</template>
