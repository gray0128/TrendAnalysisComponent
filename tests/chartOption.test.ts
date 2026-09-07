import { describe, expect, it, vi } from 'vitest'
import {
  buildChartOption,
  defaultTokens,
  parseAggregateData,
  readThemeTokens,
} from '../src/domain/chartOption'
import type { ThresholdMark } from '../src/domain/mapThreshold'
import type { TrendItemIdentity } from '../src/types'

const item: TrendItemIdentity = {
  deviceCode: 'DEV01',
  pointId: '01',
  kpiId: 'RMS',
  displayName: 'RMS',
}

describe('parseAggregateData', () => {
  it('treats code 200 data null as empty', () => {
    expect(parseAggregateData({ code: 200, data: null })).toEqual({ times: [], values: [] })
  })

  it('converts nanosecond timestamps to ms', () => {
    const parsed = parseAggregateData({
      code: 200,
      data: { timestamps: ['1777032984000000000'], values: [[1584.632]] },
    })
    expect(parsed.times[0]).toBe(1777032984000)
    expect(parsed.values[0]).toBe(1584.632)
  })
})

describe('buildChartOption', () => {
  it('hides legend when there is no series or no points', () => {
    const empty = buildChartOption({
      series: [],
      showThresholds: false,
      marks: [],
      themeTokens: defaultTokens,
    })
    expect(empty.legend.show).toBe(false)
    expect(empty.legend.data).toEqual([])

    const noPoints = buildChartOption({
      series: [{ item, times: [], values: [] }],
      showThresholds: false,
      marks: [],
      themeTokens: defaultTokens,
    })
    expect(noPoints.legend.show).toBe(false)
    expect(noPoints.legend.data).toEqual([])
  })

  it('omits markLine when thresholds hidden', () => {
    const option = buildChartOption({
      series: [],
      showThresholds: false,
      marks: [{ itemKey: 'a', level: '危险', y: 1, label: '≥ 1' }],
      themeTokens: defaultTokens,
    })
    expect(JSON.stringify(option)).not.toContain('markLine')
  })

  it('builds shared-axis line series and dashed markLines by level color', () => {
    const marks: ThresholdMark[] = [
      { itemKey: 'DEV01*01*RMS', level: '危险', y: 100, label: '危险', triple: 'DEV01·01·RMS', condition: '大于 100' },
      { itemKey: 'DEV01*01*RMS', level: '警告', y: 80, label: '警告', triple: 'DEV01·01·RMS', condition: '大于 80' },
      { itemKey: 'DEV01*01*RMS', level: '注意', y: 60, label: '注意', triple: 'DEV01·01·RMS', condition: '大于 60' },
    ]
    const option = buildChartOption({
      series: [{ item, times: [1, 2], values: [10, 20] }],
      showThresholds: true,
      marks,
      themeTokens: defaultTokens,
    })

    expect(option.yAxis).toEqual(expect.objectContaining({
      type: 'value',
      axisLabel: { color: defaultTokens.chartText },
      splitLine: { lineStyle: { color: defaultTokens.chartGrid } },
    }))
    expect(Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis]).toHaveLength(1)
    expect(option.series).toHaveLength(1)
    expect(option.series[0]).toEqual(expect.objectContaining({
      type: 'line',
      name: 'DEV01·01·RMS',
      showSymbol: false,
      symbol: 'none',
      data: [[1, 10], [2, 20]],
    }))
    expect(option.legend.show).toBe(true)
    expect(option.legend.data).toEqual(['DEV01·01·RMS'])

    const markLine = (option.series[0] as { markLine: { data: Array<{ yAxis: number; hover: string; lineStyle: { type: string; color: string } }> } }).markLine
    expect(markLine.data).toHaveLength(3)
    expect(markLine.data.every(d => d.lineStyle.type === 'dashed')).toBe(true)
    expect(markLine.data.map(d => d.lineStyle.color)).toEqual([
      defaultTokens.danger,
      defaultTokens.warning,
      defaultTokens.notice,
    ])
    expect(markLine.data.map(d => d.yAxis)).toEqual([100, 80, 60])
    expect(markLine.data[0]!.hover).toBe('DEV01·01·RMS<br/>条件：大于 100')
    expect(option.color).toEqual(defaultTokens.series)
  })

  it('names series as deviceCode·pointName·displayName', () => {
    const named: TrendItemIdentity = {
      deviceCode: 'MTR01',
      pointId: '02',
      kpiId: 'RMS',
      pointName: '电机负荷端2H',
      displayName: '低频加速度RMS',
    }
    const option = buildChartOption({
      series: [{ item: named, times: [1], values: [1] }],
      showThresholds: false,
      marks: [],
      themeTokens: defaultTokens,
    })
    expect(option.series[0]).toEqual(expect.objectContaining({
      name: 'MTR01·电机负荷端2H·低频加速度RMS',
    }))
    expect(option.legend.data).toEqual(['MTR01·电机负荷端2H·低频加速度RMS'])
  })
})

describe('readThemeTokens', () => {
  it('falls back to defaultTokens when the element is missing or vars are empty', () => {
    expect(readThemeTokens(null)).toBe(defaultTokens)
    const el = document.createElement('div')
    el.className = 'dit-root'
    expect(readThemeTokens(el)).toBe(defaultTokens)
  })

  it('reads danger, warning, notice and series from computed CSS vars', () => {
    const el = document.createElement('div')
    el.className = 'dit-root'
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => ({
        '--danger': ' #aa0000 ',
        '--warning': '#bb8800',
        '--notice': '#0033aa',
        '--chart-series-1': '#111111',
        '--chart-series-2': '#222222',
        '--chart-series-3': '#333333',
        '--chart-series-4': '#444444',
        '--chart-text': '#abcdef',
        '--chart-grid': 'rgba(1,2,3,.2)',
      }[name] ?? ''),
    } as CSSStyleDeclaration)
    expect(readThemeTokens(el)).toEqual({
      danger: '#aa0000',
      warning: '#bb8800',
      notice: '#0033aa',
      series: ['#111111', '#222222', '#333333', '#444444'],
      chartText: '#abcdef',
      chartGrid: 'rgba(1,2,3,.2)',
    })
  })
})
