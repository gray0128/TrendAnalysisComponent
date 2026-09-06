<script setup lang="ts">
import { computed, ref } from 'vue'
import { itemKey } from '../domain/identity'
import { MAX_TREND_SERIES } from '../types'
import type { TrendItemIdentity } from '../types'
import '../styles/panel.css'

const props = defineProps<{
  candidates: TrendItemIdentity[]
  selected: TrendItemIdentity[]
}>()

const emit = defineEmits<{
  'update:selected': [items: TrendItemIdentity[]]
}>()

const capNotice = ref(false)

const selectedKeys = computed(() => new Set(props.selected.map(itemKey)))

function isSelected(item: TrendItemIdentity) {
  return selectedKeys.value.has(itemKey(item))
}

function labelOf(item: TrendItemIdentity) {
  return item.displayName || item.kpiId
}

function onChange(item: TrendItemIdentity, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    if (isSelected(item)) return
    if (props.selected.length >= MAX_TREND_SERIES) {
      capNotice.value = true
      return
    }
    capNotice.value = false
    emit('update:selected', [...props.selected, item])
    return
  }
  capNotice.value = false
  emit('update:selected', props.selected.filter(s => itemKey(s) !== itemKey(item)))
}
</script>

<template>
  <div class="trend-picker">
    <label
      v-for="item in candidates"
      :key="itemKey(item)"
      class="trend-picker__item"
    >
      <input
        type="checkbox"
        :checked="isSelected(item)"
        @change="onChange(item, $event)"
      >
      {{ labelOf(item) }}
    </label>
    <p v-if="capNotice" class="trend-picker__notice">最多选择 8 个数据项</p>
  </div>
</template>
