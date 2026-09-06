export type Theme = 'dark' | 'light' | 'remote-blue'

export const THEMES: readonly Theme[] = ['dark', 'light', 'remote-blue']
export const MAX_TREND_SERIES = 8
export const DEFAULT_WINDOW_MS = 2 * 60 * 60 * 1000
export const AGGREGATE_FUNC = 2
export const RESERVE_DECIMAL = 3

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
