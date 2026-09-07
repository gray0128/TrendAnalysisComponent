import { DEFAULT_WINDOW_MS } from './types'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const FIGURE_SPACE = '\u2007'

export function padPresetLabel(label: string): string {
  return label.replace(/^(\d+)/, n => n.padStart(2, FIGURE_SPACE))
}

export const TIME_PRESETS: { id: string; label: string; ms: number }[] = [
  { id: '5m', label: '5分钟', ms: 5 * MINUTE },
  { id: '10m', label: '10分钟', ms: 10 * MINUTE },
  { id: '30m', label: '30分钟', ms: 30 * MINUTE },
  { id: '2h', label: '2小时', ms: 2 * HOUR },
  { id: '8h', label: '8小时', ms: 8 * HOUR },
  { id: '24h', label: '24小时', ms: 24 * HOUR },
  { id: '2d', label: '2天', ms: 2 * DAY },
  { id: '7d', label: '7天', ms: 7 * DAY },
  { id: '14d', label: '14天', ms: 14 * DAY },
  { id: '30d', label: '30天', ms: 30 * DAY },
  { id: '60d', label: '60天', ms: 60 * DAY },
  { id: '90d', label: '90天', ms: 90 * DAY },
]

export function resolveTimeWindow(
  start?: number,
  end?: number,
  now: number = Date.now(),
): { startTimeMs: number; endTimeMs: number } {
  const endTimeMs = end ?? now
  const startTimeMs = start ?? endTimeMs - DEFAULT_WINDOW_MS
  return { startTimeMs, endTimeMs }
}

export function applyPreset(
  endTimeMs: number,
  presetMs: number,
  now?: number,
): { startTimeMs: number; endTimeMs: number } {
  return {
    startTimeMs: endTimeMs - presetMs,
    endTimeMs,
  }
}

export function shiftWindow(
  start: number,
  end: number,
  deltaMs: number,
  now: number,
): { startTimeMs: number; endTimeMs: number } {
  let startTimeMs = start + deltaMs
  let endTimeMs = end + deltaMs
  if (endTimeMs > now) {
    const duration = endTimeMs - startTimeMs
    endTimeMs = now
    startTimeMs = now - duration
  }
  return { startTimeMs, endTimeMs }
}
