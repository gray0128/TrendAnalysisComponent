import { describe, expect, it } from 'vitest'
import {
  buildChartOption,
  defaultTokens,
  parseAggregateData,
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
      { itemKey: 'DEV01*01*RMS', level: '危险', y: 100, label: '危险' },
      { itemKey: 'DEV01*01*RMS', level: '警告', y: 80, label: '警告' },
      { itemKey: 'DEV01*01*RMS', level: '注意', y: 60, label: '注意' },
    ]
    const option = buildChartOption({
      series: [{ item, times: [1, 2], values: [10, 20] }],
      showThresholds: true,
      marks,
      themeTokens: defaultTokens,
    })

    expect(option.yAxis).toEqual(expect.objectContaining({ type: 'value' }))
    expect(Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis]).toHaveLength(1)
    expect(option.series).toHaveLength(1)
    expect(option.series[0]).toEqual(expect.objectContaining({
      type: 'line',
      name: 'RMS',
      data: [[1, 10], [2, 20]],
    }))

    const markLine = (option.series[0] as { markLine: { data: Array<{ yAxis: number; lineStyle: { type: string; color: string } }> } }).markLine
    expect(markLine.data).toHaveLength(3)
    expect(markLine.data.every(d => d.lineStyle.type === 'dashed')).toBe(true)
    expect(markLine.data.map(d => d.lineStyle.color)).toEqual([
      defaultTokens.danger,
      defaultTokens.warning,
      defaultTokens.notice,
    ])
    expect(markLine.data.map(d => d.yAxis)).toEqual([100, 80, 60])
  })
})
