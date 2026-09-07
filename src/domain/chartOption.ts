import { itemKey } from './identity'
import type { ThresholdMark } from './mapThreshold'
import type { TrendItemIdentity } from '../types'

export interface ThemeTokens {
  danger: string
  warning: string
  notice: string
  series: string[]
  chartText: string
  chartGrid: string
}

export const defaultTokens: ThemeTokens = {
  danger: '#ff6b6b',
  warning: '#ff8a2b',
  notice: '#4d9eff',
  series: ['#32b4dd', '#67d5ae', '#249fe0', '#ffbd61'],
  chartText: '#a9b7ca',
  chartGrid: 'rgba(84,124,172,.2)',
}

const SERIES_VARS = ['--chart-series-1', '--chart-series-2', '--chart-series-3', '--chart-series-4'] as const

export function readThemeTokens(el: Element | null | undefined): ThemeTokens {
  if (!el) return defaultTokens
  const style = getComputedStyle(el)
  const css = (name: string) => style.getPropertyValue(name).trim()
  const danger = css('--danger')
  const warning = css('--warning')
  const notice = css('--notice')
  const chartText = css('--chart-text')
  const chartGrid = css('--chart-grid')
  const series = SERIES_VARS.map(css)
  if (!danger && !warning && !notice && !chartText && !chartGrid && series.every(c => !c)) return defaultTokens
  return {
    danger: danger || defaultTokens.danger,
    warning: warning || defaultTokens.warning,
    notice: notice || defaultTokens.notice,
    series: series.map((c, i) => c || defaultTokens.series[i]!),
    chartText: chartText || defaultTokens.chartText,
    chartGrid: chartGrid || defaultTokens.chartGrid,
  }
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

  const axisText = { color: themeTokens.chartText }
  return {
    color: themeTokens.series,
    textStyle: { color: themeTokens.chartText },
    backgroundColor: 'transparent',
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: themeTokens.chartGrid } },
      axisLabel: axisText,
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: themeTokens.chartGrid } },
      axisLabel: axisText,
      splitLine: { lineStyle: { color: themeTokens.chartGrid } },
    },
    legend: {
      data: series.map(s => seriesName(s.item)),
      textStyle: axisText,
    },
    tooltip: { trigger: 'axis' },
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
            label: { formatter: m.label, color: themeTokens.chartText },
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
