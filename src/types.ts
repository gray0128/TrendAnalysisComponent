export type Theme = 'dark' | 'light' | 'remote-blue'

export const THEMES: readonly Theme[] = ['dark', 'light', 'remote-blue']

export function resolveTheme(
  prop?: string | null,
  htmlDataset?: string | null,
): Theme {
  if (THEMES.includes(prop as Theme)) return prop as Theme
  if (THEMES.includes(htmlDataset as Theme)) return htmlDataset as Theme
  return 'remote-blue'
}

export const MAX_TREND_SERIES = 10
export const DEFAULT_WINDOW_MS = 2 * 60 * 60 * 1000
export const AGGREGATE_FUNC = 2
export const RESERVE_DECIMAL = 3

export type ShellVariant = 'drawer' | 'modal'

export const SHELL_VARIANTS: readonly ShellVariant[] = ['drawer', 'modal']

export const DEFAULT_DRAWER_WIDTH_PERCENT = 80
export const MIN_DRAWER_WIDTH_PERCENT = 20
export const MAX_DRAWER_WIDTH_PERCENT = 100

export function clampDrawerWidthPercent(value?: number | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_DRAWER_WIDTH_PERCENT
  return Math.min(
    MAX_DRAWER_WIDTH_PERCENT,
    Math.max(MIN_DRAWER_WIDTH_PERCENT, Math.round(value)),
  )
}

export type ModalSize = '1040*720' | '1280*800' | 'fullscreen'

export const MODAL_SIZES: readonly ModalSize[] = ['1040*720', '1280*800', 'fullscreen']
export const DEFAULT_MODAL_SIZE: ModalSize = '1040*720'

export function resolveModalSize(size?: string | null): ModalSize {
  if (size === '1280*800' || size === 'xlarge') return '1280*800'
  if (size === 'fullscreen') return 'fullscreen'
  return DEFAULT_MODAL_SIZE
}

export function resolveShellVariant(variant?: string | null): ShellVariant {
  if (SHELL_VARIANTS.includes(variant as ShellVariant)) return variant as ShellVariant
  return 'drawer'
}

export interface TrendItemIdentity {
  deviceCode: string
  pointId: string
  kpiId: string
  displayName?: string
  pointName?: string
  unit?: string
}

export interface TrendLoadInput {
  items: TrendItemIdentity[]
  startTimeMs?: number
  endTimeMs?: number
}

export type PickerInput =
  | { type: 'device'; deviceCode: string; deviceName?: string }
  | { type: 'items'; items: TrendItemIdentity[] }

export interface TrendRequest {
  (url: string, init: { method?: 'GET' | 'POST'; data?: unknown; headers?: Record<string, string> }): Promise<unknown>
}

export interface PluginOptions {
  request: TrendRequest
}
