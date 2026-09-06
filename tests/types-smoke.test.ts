import { describe, expect, it } from 'vitest'
import { MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC } from '../src/types'

describe('package constants', () => {
  it('caps series at 8 and defaults window to 2 hours with max aggregate', () => {
    expect(MAX_TREND_SERIES).toBe(8)
    expect(DEFAULT_WINDOW_MS).toBe(2 * 60 * 60 * 1000)
    expect(AGGREGATE_FUNC).toBe(2)
  })
})
