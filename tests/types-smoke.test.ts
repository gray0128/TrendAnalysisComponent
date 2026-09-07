import { describe, expect, it } from 'vitest'
import {
  MAX_TREND_SERIES,
  DEFAULT_WINDOW_MS,
  AGGREGATE_FUNC,
  DEFAULT_DRAWER_WIDTH_PERCENT,
  clampDrawerWidthPercent,
  resolveModalSize,
  resolveShellVariant,
} from '../src/types'

describe('package constants', () => {
  it('caps series at 10 and defaults window to 2 hours with max aggregate', () => {
    expect(MAX_TREND_SERIES).toBe(10)
    expect(DEFAULT_WINDOW_MS).toBe(2 * 60 * 60 * 1000)
    expect(AGGREGATE_FUNC).toBe(2)
  })
})

describe('shell options', () => {
  it('defaults shell to drawer and clamps drawer width percent', () => {
    expect(resolveShellVariant(undefined)).toBe('drawer')
    expect(resolveShellVariant('modal')).toBe('modal')
    expect(resolveShellVariant('popup')).toBe('drawer')
    expect(DEFAULT_DRAWER_WIDTH_PERCENT).toBe(80)
    expect(clampDrawerWidthPercent(undefined)).toBe(DEFAULT_DRAWER_WIDTH_PERCENT)
    expect(clampDrawerWidthPercent(55.4)).toBe(55)
    expect(clampDrawerWidthPercent(5)).toBe(20)
    expect(clampDrawerWidthPercent(140)).toBe(100)
  })

  it('resolves modal size to default, large, xlarge, or fullscreen', () => {
    expect(resolveModalSize(undefined)).toBe('default')
    expect(resolveModalSize('large')).toBe('large')
    expect(resolveModalSize('xlarge')).toBe('xlarge')
    expect(resolveModalSize('fullscreen')).toBe('fullscreen')
    expect(resolveModalSize('huge')).toBe('default')
  })
})
