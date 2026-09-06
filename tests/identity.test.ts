import { describe, expect, it } from 'vitest'
import { itemKey } from '../src/domain/identity'

describe('itemKey', () => {
  it('joins deviceCode, pointId, and kpiId with *', () => {
    expect(itemKey({ deviceCode: 'A', pointId: '01', kpiId: 'k' })).toBe('A*01*k')
  })
})
