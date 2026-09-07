import { describe, expect, it } from 'vitest'
import { capSeries } from '../src/limits'
import { MAX_TREND_SERIES } from '../src/types'

describe('capSeries', () => {
  it('keeps first MAX_TREND_SERIES items and reports overflow', () => {
    const extra = 2
    const input = Array.from({ length: MAX_TREND_SERIES + extra }, (_, i) => i)
    const result = capSeries(input)
    expect(result.items.length).toBe(MAX_TREND_SERIES)
    expect(result.overflow).toBe(extra)
    expect(result.items).toEqual(input.slice(0, MAX_TREND_SERIES))
  })
})
