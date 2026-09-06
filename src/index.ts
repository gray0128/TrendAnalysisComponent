import './styles/tokens.css'

export {
  THEMES, MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC, RESERVE_DECIMAL,
  resolveTheme,
} from './types'
export type {
  Theme, TrendItemIdentity, TrendLoadInput, PickerInput, TrendRequest, PluginOptions,
} from './types'
export { install, default } from './plugin'
export { default as TrendPanel } from './components/TrendPanel.vue'
export { default as TrendDrawer } from './components/TrendDrawer.vue'
export { default as TrendModal } from './components/TrendModal.vue'
