import { describe, expect, it } from 'vitest'
import {
  MAX_TREND_SERIES,
  DEFAULT_WINDOW_MS,
  AGGREGATE_FUNC,
  DEFAULT_DRAWER_WIDTH_PERCENT,
  DEFAULT_MODAL_SIZE,
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

  it('resolves modal size to 1040*720, 1280*800, or fullscreen with 1040*720 default', () => {
    expect(DEFAULT_MODAL_SIZE).toBe('1040*720')
    expect(resolveModalSize(undefined)).toBe('1040*720')
    expect(resolveModalSize('1040*720')).toBe('1040*720')
    expect(resolveModalSize('1280*800')).toBe('1280*800')
    expect(resolveModalSize('fullscreen')).toBe('fullscreen')
    // backward compatibility
    expect(resolveModalSize('large')).toBe('1040*720')
    expect(resolveModalSize('xlarge')).toBe('1280*800')
    expect(resolveModalSize('default')).toBe('1040*720')
    expect(resolveModalSize('huge')).toBe('1040*720')
  })
})
