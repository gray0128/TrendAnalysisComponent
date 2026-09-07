import { describe, expect, it } from 'vitest'
import { itemKey, itemTriple } from '../src/domain/identity'

describe('itemKey', () => {
  it('joins deviceCode, pointId, and kpiId with *', () => {
    expect(itemKey({ deviceCode: 'A', pointId: '01', kpiId: 'k' })).toBe('A*01*k')
  })
})

describe('itemTriple', () => {
  it('joins deviceCode, pointName, and displayName with ·', () => {
    expect(itemTriple({
      deviceCode: 'MTR01',
      pointId: '02',
      kpiId: 'RMS',
      pointName: '电机负荷端2H',
      displayName: '低频加速度RMS',
    })).toBe('MTR01·电机负荷端2H·低频加速度RMS')
  })

  it('falls back to pointId and kpiId when names are missing', () => {
    expect(itemTriple({ deviceCode: 'A', pointId: '01', kpiId: 'k' })).toBe('A·01·k')
  })
})
