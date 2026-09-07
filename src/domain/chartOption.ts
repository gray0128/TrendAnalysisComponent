import { itemKey, itemTriple } from './identity'
import type { ThresholdMark } from './mapThreshold'
import { MAX_TREND_SERIES } from '../types'
import type { TrendItemIdentity } from '../types'

export interface ThemeTokens {
  danger: string
  warning: string
  notice: string
  series: string[]
  chartText: string
  chartGrid: string
  chartAccent: string
}

export const defaultTokens: ThemeTokens = {
  danger: '#ff6b6b',
  warning: '#ff8a2b',
  notice: '#4d9eff',
  series: [
    '#32b4dd',
    '#67d5ae',
    '#f472b6',
    '#ffbd61',
    '#a78bfa',
    '#fb923c',
    '#4ade80',
    '#f87171',
    '#facc15',
    '#818cf8',
  ],
  chartText: '#a9b7ca',
  chartGrid: 'rgba(84,124,172,.2)',
  chartAccent: '#32b4dd',
}

const SERIES_VARS = Array.from(
  { length: MAX_TREND_SERIES },
  (_, i) => `--chart-series-${i + 1}`,
)

export function readThemeTokens(el: Element | null | undefined): ThemeTokens {
  if (!el) return defaultTokens
  const style = getComputedStyle(el)
  const css = (name: string) => style.getPropertyValue(name).trim()
  const danger = css('--danger')
  const warning = css('--warning')
  const notice = css('--notice')
  const chartText = css('--chart-text')
  const chartGrid = css('--chart-grid')
  const chartAccent = css('--chart-accent')
  const series = SERIES_VARS.map(css)
  if (!danger && !warning && !notice && !chartText && !chartGrid && !chartAccent && series.every(c => !c)) return defaultTokens
  return {
    danger: danger || defaultTokens.danger,
    warning: warning || defaultTokens.warning,
    notice: notice || defaultTokens.notice,
    series: series.map((c, i) => c || defaultTokens.series[i]!),
    chartText: chartText || defaultTokens.chartText,
    chartGrid: chartGrid || defaultTokens.chartGrid,
    chartAccent: chartAccent || defaultTokens.chartAccent,
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
  startTimeMs?: number
  endTimeMs?: number
}

function seriesName(item: TrendItemIdentity): string {
  return itemTriple(item)
}

function markHover(m: ThresholdMark): string {
  return [m.triple, m.condition ? `条件：${m.condition}` : '']
    .filter(Boolean)
    .join('<br/>')
}

function markLabelStyle(m: ThresholdMark, tokens: ThemeTokens) {
  return {
    show: true,
    formatter: m.label,
    position: 'end' as const,
    align: 'left' as const,
    verticalAlign: 'middle' as const,
    distance: 8,
    color: tokens.chartText,
    fontSize: 12,
    fontWeight: 'normal' as const,
    opacity: 1,
    overflow: 'none' as const,
  }
}

function levelColor(level: ThresholdMark['level'], tokens: ThemeTokens): string {
  if (level === '危险') return tokens.danger
  if (level === '警告') return tokens.warning
  return tokens.notice
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatTooltipTime(ms: number): string {
  const d = new Date(ms)
  if (!Number.isFinite(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

export function formatAxisTime(ms: number): string {
  const d = new Date(ms)
  if (!Number.isFinite(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}\n${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function hexToRgba(color: string, alpha: number): string {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return color
}

function tooltipTimeMs(params: unknown): number | null {
  const items = Array.isArray(params) ? params : [params]
  const first = items[0] as { value?: unknown; axisValue?: unknown } | undefined
  if (!first) return null
  const fromValue = Array.isArray(first.value) ? Number(first.value[0]) : NaN
  if (Number.isFinite(fromValue)) return fromValue
  const fromAxis = Number(first.axisValue)
  return Number.isFinite(fromAxis) ? fromAxis : null
}

function yAxisBound(
  series: ChartSeriesInput[],
  showThresholds: boolean,
  marks: ThresholdMark[],
): { min?: number; max?: number } {
  if (!showThresholds || marks.length === 0) return {}
  let dataMin = Infinity
  let dataMax = -Infinity
  for (const s of series) {
    for (const value of s.values) {
      if (!isFiniteNumber(value)) continue
      if (value < dataMin) dataMin = value
      if (value > dataMax) dataMax = value
    }
  }
  if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) return {}
  const bound: { min?: number; max?: number } = {}
  for (const mark of marks) {
    if (!isFiniteNumber(mark.y)) continue
    if (mark.y < dataMin) bound.min = bound.min == null ? mark.y : Math.min(bound.min, mark.y)
    if (mark.y > dataMax) bound.max = bound.max == null ? mark.y : Math.max(bound.max, mark.y)
  }
  return bound
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
    textStyle: { color: themeTokens.chartText, fontFamily: 'inherit' },
    backgroundColor: 'transparent',
    animationDuration: 360,
    animationEasing: 'cubicOut',
    grid: { top: 44, right: 68, bottom: 42, left: 12, containLabel: true },
    xAxis: {
      type: 'time',
      min: isFiniteNumber(input.startTimeMs) ? input.startTimeMs : undefined,
      max: isFiniteNumber(input.endTimeMs) ? input.endTimeMs : undefined,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: themeTokens.chartGrid } },
      axisLabel: {
        ...axisText,
        hideOverlap: true,
        lineHeight: 15,
        align: 'center',
        formatter: (value: number) => formatAxisTime(value),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      scale: true,
      ...yAxisBound(series, showThresholds, marks),
      axisTick: { show: false },
      axisLine: { show: false, lineStyle: { color: themeTokens.chartGrid } },
      axisLabel: axisText,
      splitLine: { lineStyle: { color: themeTokens.chartGrid, type: 'dashed' } },
      splitNumber: 4,
    },
    dataZoom: [
      {
        type: 'slider',
        yAxisIndex: 0,
        right: 12,
        top: 44,
        bottom: 80,
        width: 16,
        filterMode: 'none',
        showDataShadow: false,
        borderColor: themeTokens.chartGrid,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        fillerColor: hexToRgba(themeTokens.chartAccent, 0.18),
        handleSize: '100%',
        handleStyle: {
          color: themeTokens.chartAccent,
          borderColor: themeTokens.chartAccent,
        },
        moveHandleStyle: {
          color: themeTokens.chartAccent,
        },
        textStyle: {
          color: themeTokens.chartText,
          fontSize: 10,
        },
        brushSelect: false,
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
      },
    ],
    legend: {
      show: legendData.length > 0,
      data: legendData,
      top: 8,
      left: 12,
      itemWidth: 14,
      itemHeight: 3,
      icon: 'roundRect',
      textStyle: axisText,
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      extraCssText: [
        'background: var(--surface-popover)',
        'color: var(--text)',
        'border: 1px solid var(--glass-border)',
        'border-radius: 8px',
        'box-shadow: var(--panel-shadow)',
        'padding: 8px 10px',
        'font-size: 12px',
        'line-height: 1.5',
      ].join(';'),
      axisPointer: {
        type: 'line',
        snap: true,
        z: 20,
        lineStyle: {
          color: themeTokens.chartAccent,
          width: 2,
          type: 'dashed',
          opacity: 0.92,
        },
      },
      formatter(params: unknown) {
        const items = Array.isArray(params) ? params : [params]
        const mark = items.find((p: { componentType?: string; data?: { hover?: string } }) =>
          p.componentType === 'markLine' && p.data?.hover,
        )
        if (mark?.data?.hover) return mark.data.hover
        const lines = items.map((p: { marker?: string; seriesName?: string; value?: unknown }) => {
          const raw = Array.isArray(p.value) ? p.value[1] : p.value
          const text = raw == null || raw === '' ? '-' : raw
          return `${p.marker ?? ''}${p.seriesName ?? ''}: ${text}`
        })
        const ms = tooltipTimeMs(items)
        const time = ms != null ? formatTooltipTime(ms) : ''
        return [time, ...lines].filter(Boolean).join('<br/>')
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
        smooth: false,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.08 },
        emphasis: { focus: 'series', lineStyle: { width: 2.5 } },
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
              label: markLabelStyle(m, themeTokens),
              lineStyle: { type: 'dashed', color, width: 2 },
              emphasis: {
                label: markLabelStyle(m, themeTokens),
                lineStyle: { width: 2, color, opacity: 1 },
              },
              blur: {
                label: markLabelStyle(m, themeTokens),
                lineStyle: { type: 'dashed', width: 2, color, opacity: 1 },
              },
            }
          }),
        }
      }
      return option
    }),
  }
}
