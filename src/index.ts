import './styles/tokens.css'
import './styles/panel.css'

export {
  THEMES, MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC, RESERVE_DECIMAL,
  SHELL_VARIANTS, MODAL_SIZES,
  DEFAULT_DRAWER_WIDTH_PERCENT, MIN_DRAWER_WIDTH_PERCENT, MAX_DRAWER_WIDTH_PERCENT,
  resolveTheme, clampDrawerWidthPercent, resolveModalSize, resolveShellVariant,
} from './types'
export type {
  Theme, TrendItemIdentity, TrendLoadInput, PickerInput, TrendRequest, PluginOptions,
  ShellVariant, ModalSize,
} from './types'
export { install, default } from './plugin'
export { default as TrendPanel } from './components/TrendPanel.vue'
export { default as TrendDrawer } from './components/TrendDrawer.vue'
export { default as TrendModal } from './components/TrendModal.vue'
