<script setup lang="ts">
import { computed } from 'vue'
import { resolveModalSize, resolveTheme } from '../types'
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
  size?: string
}>(), {
  showPicker: true,
})

const modalSize = computed(() => resolveModalSize(props.size))

const emit = defineEmits<{
  close: []
}>()

const resolvedTheme = computed(() =>
  resolveTheme(props.theme, document.documentElement.dataset.theme),
)
</script>

<template>
  <div class="dit-root dit-shell" :data-theme="resolvedTheme">
    <div class="dit-modal-mask" @click="emit('close')" />
    <div class="dit-modal" :class="`dit-modal--${modalSize}`">
      <TrendPanel
        :trend="trend"
        :picker="picker"
        :show-picker="showPicker"
        :theme="theme"
        :diagnose-base-url="diagnoseBaseUrl"
      />
    </div>
  </div>
</template>
