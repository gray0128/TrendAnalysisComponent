import { describe, expect, it } from 'vitest'
import { applyPreset, padPresetLabel, resolveTimeWindow, shiftWindow, TIME_PRESETS } from '../src/time'

describe('resolveTimeWindow', () => {
  it('defaults to last 2 hours when times omitted', () => {
    const now = 1_700_000_000_000
    expect(resolveTimeWindow(undefined, undefined, now)).toEqual({
      startTimeMs: now - 2 * 60 * 60 * 1000,
      endTimeMs: now,
    })
  })
})

describe('TIME_PRESETS', () => {
  it('includes the confirmed shortcut list', () => {
    expect(TIME_PRESETS.map(p => p.label)).toEqual([
      '5分钟', '10分钟', '30分钟', '2小时', '8小时', '24小时', '2天', '7天', '14天', '30天', '60天', '90天',
    ])
  })
})

describe('padPresetLabel', () => {
  it('pads 1-digit prefixes with a figure space so labels share a width', () => {
    expect(padPresetLabel('5分钟')).toBe('\u20075分钟')
    expect(padPresetLabel('2小时')).toBe('\u20072小时')
    expect(padPresetLabel('2天')).toBe('\u20072天')
    expect(padPresetLabel('10分钟')).toBe('10分钟')
    expect(padPresetLabel('24小时')).toBe('24小时')
    expect(padPresetLabel('90天')).toBe('90天')
  })
})

describe('applyPreset', () => {
  it('keeps end time and changes duration', () => {
    const end = 1_700_000_000_000
    expect(applyPreset(end, 8 * 3600 * 1000)).toEqual({
      startTimeMs: end - 8 * 3600 * 1000,
      endTimeMs: end,
    })
  })
})

describe('shiftWindow', () => {
  it('shifts both ends and does not let end pass now', () => {
    const now = 1000
    expect(shiftWindow(0, 400, 800, now)).toEqual({ startTimeMs: 600, endTimeMs: 1000 })
  })
})
