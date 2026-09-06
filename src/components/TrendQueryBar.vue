<script setup lang="ts">
import { ref } from 'vue'
import { TIME_PRESETS, applyPreset, shiftWindow } from '../time'
import '../styles/panel.css'

const props = defineProps<{
  startTimeMs: number
  endTimeMs: number
  now?: number
}>()

const emit = defineEmits<{
  change: [window: { startTimeMs: number; endTimeMs: number }]
  query: []
}>()

const shiftPresetId = ref(TIME_PRESETS[0].id)

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDatetimeLocal(ms: number) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string) {
  return new Date(value).getTime()
}

function currentNow() {
  return props.now ?? Date.now()
}

function shiftPresetMs() {
  return TIME_PRESETS.find(p => p.id === shiftPresetId.value)?.ms ?? TIME_PRESETS[0].ms
}

function onStartInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('change', { startTimeMs: fromDatetimeLocal(value), endTimeMs: props.endTimeMs })
}

function onEndInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('change', { startTimeMs: props.startTimeMs, endTimeMs: fromDatetimeLocal(value) })
}

function onShortcut(presetMs: number) {
  emit('change', applyPreset(props.endTimeMs, presetMs))
  emit('query')
}

function onShift(direction: -1 | 1) {
  emit('change', shiftWindow(
    props.startTimeMs,
    props.endTimeMs,
    direction * shiftPresetMs(),
    currentNow(),
  ))
  emit('query')
}

function onQuery() {
  emit('query')
}
</script>

<template>
  <div class="trend-query-bar">
    <label>
      开始时间
      <input
        type="datetime-local"
        :value="toDatetimeLocal(startTimeMs)"
        @input="onStartInput"
      >
    </label>
    <label>
      截止时间
      <input
        type="datetime-local"
        :value="toDatetimeLocal(endTimeMs)"
        @input="onEndInput"
      >
    </label>
    <button
      v-for="preset in TIME_PRESETS"
      :key="preset.id"
      type="button"
      @click="onShortcut(preset.ms)"
    >
      {{ preset.label }}
    </button>
    <button type="button" @click="onShift(-1)">前移</button>
    <select v-model="shiftPresetId">
      <option
        v-for="preset in TIME_PRESETS"
        :key="preset.id"
        :value="preset.id"
      >
        {{ preset.label }}
      </option>
    </select>
    <button type="button" @click="onShift(1)">后移</button>
    <button type="button" @click="onQuery">查询</button>
  </div>
</template>
