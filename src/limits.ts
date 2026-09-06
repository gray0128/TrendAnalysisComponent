import { MAX_TREND_SERIES } from './types'

export function capSeries<T>(items: T[]): { items: T[]; overflow: number } {
  return {
    items: items.slice(0, MAX_TREND_SERIES),
    overflow: Math.max(0, items.length - MAX_TREND_SERIES),
  }
}
