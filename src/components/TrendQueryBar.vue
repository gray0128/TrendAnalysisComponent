<script setup lang="ts">
import { computed, ref } from 'vue'
import { TIME_PRESETS, applyPreset, padPresetLabel, shiftWindow } from '../time'
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

const shortcutId = ref('2h')
const shiftPresetId = ref('2h')

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

const canShiftForward = computed(() => props.endTimeMs < currentNow())

function onStartInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('change', { startTimeMs: fromDatetimeLocal(value), endTimeMs: props.endTimeMs })
}

function onEndInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('change', { startTimeMs: props.startTimeMs, endTimeMs: fromDatetimeLocal(value) })
}

function onShortcutSelect() {
  const preset = TIME_PRESETS.find(p => p.id === shortcutId.value)
  if (!preset) return
  emit('change', applyPreset(props.endTimeMs, preset.ms))
  emit('query')
}

function onShift(direction: -1 | 1) {
  if (direction === 1 && !canShiftForward.value) return
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
    <div class="trend-query-bar__times">
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
      <label>
        快捷时间
        <select
          v-model="shortcutId"
          class="trend-query-bar__shortcut"
          @change="onShortcutSelect"
        >
          <option
            v-for="preset in TIME_PRESETS"
            :key="preset.id"
            :value="preset.id"
          >{{ padPresetLabel(preset.label) }}</option>
        </select>
      </label>
    </div>
    <button type="button" class="trend-query-bar__query" @click="onQuery">查询</button>
    <div class="trend-query-bar__shift">
      <button type="button" class="trend-query-bar__shift-btn" @click="onShift(-1)">前移</button>
      <select v-model="shiftPresetId">
        <option
          v-for="preset in TIME_PRESETS"
          :key="preset.id"
          :value="preset.id"
        >{{ padPresetLabel(preset.label) }}</option>
      </select>
      <button
        type="button"
        class="trend-query-bar__shift-btn"
        :disabled="!canShiftForward"
        @click="onShift(1)"
      >后移</button>
    </div>
  </div>
</template>
