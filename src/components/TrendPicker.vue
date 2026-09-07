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
  result.sort((a, b) => a.pointId.localeCompare(b.pointId, undefined, { numeric: true }))
  return result
})

const nameAggregates = computed(() => {
  const result: { name: string; items: TrendItemIdentity[] }[] = []
  const indexByName = new Map<string, number>()
  for (const item of visibleCandidates.value) {
    const name = labelOf(item)
    let index = indexByName.get(name)
    if (index == null) {
      index = result.length
      indexByName.set(name, index)
      result.push({ name, items: [] })
    }
    result[index]!.items.push(item)
  }
  return result
})

function groupTitle(group: { pointId: string; pointName: string }) {
  return group.pointName ? `${group.pointId} ${group.pointName}` : group.pointId
}

function onAggregateClick(items: TrendItemIdentity[]) {
  const next = items.slice(0, MAX_TREND_SERIES)
  capNotice.value = items.length > MAX_TREND_SERIES
  emit('update:selected', next)
}

function onReset() {
  capNotice.value = false
  if (props.selected.length === 0) return
  emit('update:selected', [])
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
      <div class="trend-picker__actions">
        <p class="trend-picker__meta">已选 {{ selected.length }}/{{ MAX_TREND_SERIES }}</p>
        <button
          type="button"
          class="trend-picker__reset"
          :disabled="selected.length === 0"
          @click="onReset"
        >重置</button>
      </div>
    </div>
    <p v-else class="trend-picker__meta">已选 {{ selected.length }}/{{ MAX_TREND_SERIES }}</p>
    <div v-if="grouped && nameAggregates.length" class="trend-picker__aggregates">
      <button
        v-for="agg in nameAggregates"
        :key="agg.name"
        type="button"
        class="trend-picker__aggregate"
        @click="onAggregateClick(agg.items)"
      >
        {{ agg.name }}（{{ agg.items.length }}）
      </button>
    </div>
    <div class="trend-picker__list">
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
              :class="{ 'is-selected': isSelected(item) }"
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
          :class="{ 'is-selected': isSelected(item) }"
        >
          <input
            type="checkbox"
            :checked="isSelected(item)"
            @change="onChange(item, $event)"
          >
          {{ labelOf(item) }}
        </label>
      </template>
      <p v-if="grouped && groups.length === 0" class="trend-picker__notice">没有匹配的数据项</p>
      <p v-if="capNotice" class="trend-picker__notice">最多选择 {{ MAX_TREND_SERIES }} 个数据项</p>
    </div>
  </div>
</template>
