<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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
const modalClass = computed(() => {
  if (modalSize.value === 'fullscreen') return 'dit-modal--fullscreen'
  return `dit-modal--${modalSize.value.replace('*', 'x')}`
})

const emit = defineEmits<{
  close: []
}>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

const resolvedTheme = computed(() =>
  resolveTheme(props.theme, document.documentElement.dataset.theme),
)
</script>

<template>
  <div class="dit-root dit-shell" :data-theme="resolvedTheme">
    <div class="dit-modal-mask" @click="emit('close')" />
    <div class="dit-modal" :class="modalClass">
      <button
        type="button"
        class="dit-shell-close"
        aria-label="关闭"
        title="关闭"
        @click="emit('close')"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
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
