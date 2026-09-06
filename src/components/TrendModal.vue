<script setup lang="ts">
import { computed } from 'vue'
import { resolveTheme } from '../types'
import type { PickerInput, Theme, TrendLoadInput } from '../types'
import TrendPanel from './TrendPanel.vue'
import '../styles/tokens.css'
import '../styles/panel.css'

const props = defineProps<{
  trend: TrendLoadInput
  picker?: PickerInput | null
  theme?: Theme
}>()

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
    <div class="dit-modal">
      <TrendPanel :trend="trend" :picker="picker" :theme="theme" />
    </div>
  </div>
</template>
