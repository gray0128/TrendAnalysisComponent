import { describe, expect, it } from 'vitest'
import { mapThresholdRows } from '../src/domain/mapThreshold'
import type { TrendItemIdentity } from '../src/types'

const item: TrendItemIdentity = {
  deviceCode: 'DEV01',
  pointId: '01',
  kpiId: 'RMS',
}

describe('mapThresholdRows', () => {
  it('drops rows when enabled is not 1', () => {
    const marks = mapThresholdRows(
      [{ enabled: '0', severity: 3, refValue1: 60 }],
      item,
    )
    expect(marks).toEqual([])
  })

  it('maps enabled severity 3 refValue1 to one danger mark', () => {
    const marks = mapThresholdRows(
      [{ enabled: '1', severity: 3, refValue1: 60 }],
      item,
    )
    expect(marks).toEqual([
      { itemKey: 'DEV01*01*RMS', level: '危险', y: 60, label: '危险' },
    ])
  })

  it('emits two y marks for ruleCondition 07', () => {
    const marks = mapThresholdRows(
      [{ enabled: '1', severity: 2, ruleCondition: '07', refValue1: 10, refValue2: 60 }],
      item,
    )
    expect(marks.map(m => m.y)).toEqual([10, 60])
    expect(marks.every(m => m.level === '警告')).toBe(true)
  })

  it('keeps multiple enabled rules at the same level', () => {
    const marks = mapThresholdRows(
      [
        { enabled: '1', severity: 3, refValue1: 40 },
        { enabled: '1', severity: 3, refValue1: 80 },
      ],
      item,
    )
    expect(marks).toHaveLength(2)
    expect(marks.map(m => m.y)).toEqual([40, 80])
    expect(marks.every(m => m.level === '危险')).toBe(true)
  })

  it('emits two marks when message has 介于 even if condition is non-matching text', () => {
    const marks = mapThresholdRows(
      [
        {
          enabled: '1',
          severity: 2,
          condition: '大于',
          message: '介于上下限',
          refValue1: 10,
          refValue2: 60,
        },
      ],
      item,
    )
    expect(marks).toHaveLength(2)
    expect(marks.map(m => m.y)).toEqual([10, 60])
  })
})
