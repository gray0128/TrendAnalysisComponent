<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { itemKey } from '../domain/identity'
import { MAX_TREND_SERIES } from '../types'
import type { TrendItemIdentity } from '../types'
import '../styles/panel.css'

const props = defineProps<{
  candidates: TrendItemIdentity[]
  selected: TrendItemIdentity[]
  grouped?: boolean
}>()

const emit = defineEmits<{
  'update:selected': [items: TrendItemIdentity[]]
}>()

const capNotice = ref(false)
const filters = reactive({
  pointId: '',
  pointName: '',
  kpiId: '',
  displayName: '',
})

const selectedKeys = computed(() => new Set(props.selected.map(itemKey)))

function isSelected(item: TrendItemIdentity) {
  return selectedKeys.value.has(itemKey(item))
}

function labelOf(item: TrendItemIdentity) {
  return item.displayName || item.kpiId
}

function contains(value: string | undefined, query: string) {
  const q = query.trim()
  if (!q) return true
  return (value ?? '').toLowerCase().includes(q.toLowerCase())
}

const visibleCandidates = computed(() => {
  if (!props.grouped) return props.candidates
  return props.candidates.filter(item =>
    contains(item.pointId, filters.pointId)
    && contains(item.pointName, filters.pointName)
    && contains(item.kpiId, filters.kpiId)
    && contains(item.displayName, filters.displayName),
  )
})

const groups = computed(() => {
  const result: { pointId: string; pointName: string; items: TrendItemIdentity[] }[] = []
  const indexByPoint = new Map<string, number>()
  for (const item of visibleCandidates.value) {
    let index = indexByPoint.get(item.pointId)
    if (index == null) {
      index = result.length
      indexByPoint.set(item.pointId, index)
      result.push({
        pointId: item.pointId,
        pointName: item.pointName ?? '',
        items: [],
      })
    }
    const group = result[index]!
    group.items.push(item)
    if (!group.pointName && item.pointName) group.pointName = item.pointName
  }
  return result
})

function groupTitle(group: { pointId: string; pointName: string }) {
  return group.pointName ? `${group.pointId} ${group.pointName}` : group.pointId
}

function onChange(item: TrendItemIdentity, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    if (isSelected(item)) return
    if (props.selected.length >= MAX_TREND_SERIES) {
      ;(event.target as HTMLInputElement).checked = false
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
  <div class="trend-picker" :class="{ 'trend-picker--grouped': grouped }">
    <div v-if="grouped" class="trend-picker__filters">
      <label>测点编号 <input v-model="filters.pointId" type="text"></label>
      <label>测点名称 <input v-model="filters.pointName" type="text"></label>
      <label>数据项 <input v-model="filters.kpiId" type="text"></label>
      <label>数据项展示名称 <input v-model="filters.displayName" type="text"></label>
    </div>
    <template v-if="grouped">
      <div
        v-for="group in groups"
        :key="group.pointId"
        class="trend-picker__group"
      >
        <div class="trend-picker__group-title">{{ groupTitle(group) }}</div>
        <div class="trend-picker__items">
          <label
            v-for="item in group.items"
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
        </div>
      </div>
    </template>
    <template v-else>
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
    </template>
    <p v-if="capNotice" class="trend-picker__notice">最多选择 8 个数据项</p>
  </div>
</template>
