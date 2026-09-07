<script setup lang="ts">
import { computed } from 'vue'
import { clampDrawerWidthPercent, resolveTheme } from '../types'
import type { PickerInput, Theme, TrendLoadInput } from '../types'
import TrendPanel from './TrendPanel.vue'
import '../styles/tokens.css'
import '../styles/panel.css'

const props = withDefaults(defineProps<{
  trend: TrendLoadInput
  picker?: PickerInput | null
  showPicker?: boolean
  theme?: Theme
  diagnoseBaseUrl?: string
  widthPercent?: number
}>(), {
  showPicker: true,
})

const drawerWidth = computed(() => `${clampDrawerWidthPercent(props.widthPercent)}%`)

const emit = defineEmits<{
  close: []
}>()

const resolvedTheme = computed(() =>
  resolveTheme(props.theme, document.documentElement.dataset.theme),
)
</script>

<template>
  <div class="dit-root dit-shell" :data-theme="resolvedTheme">
    <div class="dit-drawer-mask" @click="emit('close')" />
    <aside class="dit-drawer" :style="{ width: drawerWidth }">
      <TrendPanel
        :trend="trend"
        :picker="picker"
        :show-picker="showPicker"
        :theme="theme"
        :diagnose-base-url="diagnoseBaseUrl"
      />
    </aside>
  </div>
</template>
