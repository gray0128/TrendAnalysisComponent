import { itemKey } from './identity'
import type { ThresholdMark } from './mapThreshold'
import type { TrendItemIdentity } from '../types'

export interface ThemeTokens {
  danger: string
  warning: string
  notice: string
}

export const defaultTokens: ThemeTokens = {
  danger: '#ff6b6b',
  warning: '#ff8a2b',
  notice: '#4d9eff',
}

export interface ChartSeriesInput {
  item: TrendItemIdentity
  times: number[]
  values: (number | null)[]
}

export interface BuildChartOptionInput {
  series: ChartSeriesInput[]
  showThresholds: boolean
  marks: ThresholdMark[]
  themeTokens: ThemeTokens
}

function seriesName(item: TrendItemIdentity): string {
  return item.displayName || item.kpiId
}

function levelColor(level: ThresholdMark['level'], tokens: ThemeTokens): string {
  if (level === '危险') return tokens.danger
  if (level === '警告') return tokens.warning
  return tokens.notice
}

export function parseAggregateData(payload: any): { times: number[]; values: (number | null)[] } {
  const data = payload?.data
  if (data == null) return { times: [], values: [] }
  const timestamps: unknown[] = Array.isArray(data.timestamps) ? data.timestamps : []
  const rawValues: unknown[] = Array.isArray(data.values?.[0]) ? data.values[0] : []
  return {
    times: timestamps.map(t => Number(t) / 1e6),
    values: rawValues as (number | null)[],
  }
}

export function buildChartOption(input: BuildChartOptionInput) {
  const { series, showThresholds, marks, themeTokens } = input

  return {
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    legend: { data: series.map(s => seriesName(s.item)) },
    series: series.map(s => {
      const key = itemKey(s.item)
      const matchedMarks = showThresholds ? marks.filter(m => m.itemKey === key) : []
      const option: Record<string, unknown> = {
        type: 'line',
        name: seriesName(s.item),
        data: s.times.map((t, i) => [t, s.values[i] ?? null]),
      }
      if (matchedMarks.length > 0) {
        option.markLine = {
          symbol: 'none',
          data: matchedMarks.map(m => ({
            yAxis: m.y,
            name: m.label,
            label: { formatter: m.label },
            lineStyle: {
              type: 'dashed',
              color: levelColor(m.level, themeTokens),
            },
          })),
        }
      }
      return option
    }),
  }
}
