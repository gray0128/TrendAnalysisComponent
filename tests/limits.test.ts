import { describe, expect, it } from 'vitest'
import { capSeries } from '../src/limits'

describe('capSeries', () => {
  it('keeps first 8 items and reports overflow of 2 for 10 inputs', () => {
    const input = Array.from({ length: 10 }, (_, i) => i)
    const result = capSeries(input)
    expect(result.items.length).toBe(8)
    expect(result.overflow).toBe(2)
    expect(result.items).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})
