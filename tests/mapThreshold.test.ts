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
      {
        itemKey: 'DEV01*01*RMS',
        level: '危险',
        y: 60,
        label: '危险',
        triple: 'DEV01·01·RMS',
        condition: '',
      },
    ])
  })

  it('emits two y marks for ruleCondition 07', () => {
    const marks = mapThresholdRows(
      [{ enabled: '1', severity: 2, ruleCondition: '07', refValue1: 10, refValue2: 60 }],
      item,
    )
    expect(marks.map(m => m.y)).toEqual([10, 60])
    expect(marks.every(m => m.level === '警告')).toBe(true)
    expect(marks.every(m => m.condition === '介于[10,60]')).toBe(true)
    expect(marks.every(m => m.triple === 'DEV01·01·RMS')).toBe(true)
  })

  it('formats single-value 03 as 大于 N', () => {
    const marks = mapThresholdRows(
      [{ enabled: '1', severity: 3, ruleCondition: '03', refValue1: 45 }],
      { ...item, pointName: '电机负荷端2H', displayName: '低频加速度RMS' },
    )
    expect(marks).toEqual([
      {
        itemKey: 'DEV01*01*RMS',
        level: '危险',
        y: 45,
        label: '危险',
        triple: 'DEV01·电机负荷端2H·低频加速度RMS',
        condition: '大于 45',
      },
    ])
  })

  it('maps 01-10 with the device-detail dashboard dictionary and board format', () => {
    const cond = (ruleCondition: string, refValue1: number, refValue2?: number) =>
      mapThresholdRows(
        [{ enabled: '1', severity: 2, ruleCondition, refValue1, refValue2 }],
        item,
      )[0]?.condition

    expect(cond('01', 1)).toBe('等于 1')
    expect(cond('02', 1)).toBe('不等于 1')
    expect(cond('03', 6)).toBe('大于 6')
    expect(cond('04', 6)).toBe('大于等于 6')
    expect(cond('05', 6)).toBe('小于 6')
    expect(cond('06', 6)).toBe('小于等于 6')
    expect(cond('07', 10, 60)).toBe('介于[10,60]')
    expect(cond('08', 10, 60)).toBe('介于(10,60)')
    expect(cond('09', 10, 60)).toBe('上下限[10,60]')
    expect(cond('10', 10, 60)).toBe('上下限(10,60)')
    expect(cond('3', 6)).toBe('大于 6')
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
