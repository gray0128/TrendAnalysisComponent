import { itemKey, itemTriple } from './identity'
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
  return itemTriple(item)
}

function markHover(m: ThresholdMark): string {
  return [m.triple, m.condition ? `条件：${m.condition}` : '']
    .filter(Boolean)
    .join('<br/>')
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
  const legendData = series
    .filter(s => s.times.length > 0)
    .map(s => seriesName(s.item))
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
      show: legendData.length > 0,
      data: legendData,
      textStyle: axisText,
    },
    tooltip: {
      trigger: 'axis',
      formatter(params: unknown) {
        const items = Array.isArray(params) ? params : [params]
        const mark = items.find((p: { componentType?: string; data?: { hover?: string } }) =>
          p.componentType === 'markLine' && p.data?.hover,
        )
        if (mark?.data?.hover) return mark.data.hover
        return items.map((p: { marker?: string; seriesName?: string; value?: unknown }) => {
          const raw = Array.isArray(p.value) ? p.value[1] : p.value
          const text = raw == null || raw === '' ? '—' : raw
          return `${p.marker ?? ''}${p.seriesName ?? ''}: ${text}`
        }).join('<br/>')
      },
    },
    series: series.map(s => {
      const key = itemKey(s.item)
      const matchedMarks = showThresholds ? marks.filter(m => m.itemKey === key) : []
      const option: Record<string, unknown> = {
        type: 'line',
        name: seriesName(s.item),
        showSymbol: false,
        symbol: 'none',
        data: s.times.map((t, i) => [t, s.values[i] ?? null]),
      }
      if (matchedMarks.length > 0) {
        option.markLine = {
          symbol: 'none',
          silent: false,
          z: 100,
          tooltip: { show: false },
          data: matchedMarks.map(m => {
            const hover = markHover(m)
            const color = levelColor(m.level, themeTokens)
            return {
              yAxis: m.y,
              name: m.label,
              hover,
              label: {
                formatter: m.label,
                color: themeTokens.chartText,
                padding: [4, 8],
              },
              lineStyle: { type: 'dashed', color, width: 2 },
              emphasis: {
                label: { padding: [4, 8] },
                lineStyle: { width: 2, color },
              },
            }
          }),
        }
      }
      return option
    }),
  }
}
