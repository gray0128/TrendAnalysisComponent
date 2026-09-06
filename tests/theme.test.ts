import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { TrendItemIdentity } from '../src/types'

vi.mock('echarts', () => ({
  init: () => ({
    setOption: vi.fn(),
    dispose: vi.fn(),
  }),
}))

vi.mock('../src/api/dataItems', () => ({
  fetchDeviceDataItems: vi.fn(),
}))
vi.mock('../src/api/trend', () => ({
  fetchAggregateTrend: vi.fn(),
}))
vi.mock('../src/api/thresholds', () => ({
  fetchEnabledThresholds: vi.fn(),
}))

import { fetchDeviceDataItems } from '../src/api/dataItems'
import { fetchAggregateTrend } from '../src/api/trend'
import { fetchEnabledThresholds } from '../src/api/thresholds'
import { resolveTheme } from '../src/types'
import TrendPanel from '../src/components/TrendPanel.vue'

function item(i: number): TrendItemIdentity {
  return {
    deviceCode: 'DEV',
    pointId: '01',
    kpiId: `KPI_${i}`,
    displayName: `数据项${i}`,
  }
}

describe('resolveTheme', () => {
  it('follows html dataset when prop is omitted', () => {
    expect(resolveTheme(undefined, 'light')).toBe('light')
  })

  it('falls back to remote-blue when html dataset is unknown', () => {
    expect(resolveTheme(undefined, 'foo')).toBe('remote-blue')
  })
})

describe('threshold toggle', () => {
  beforeEach(() => {
    vi.mocked(fetchDeviceDataItems).mockReset()
    vi.mocked(fetchAggregateTrend).mockReset()
    vi.mocked(fetchEnabledThresholds).mockReset()
    vi.mocked(fetchDeviceDataItems).mockResolvedValue([])
    vi.mocked(fetchAggregateTrend).mockResolvedValue({ code: 200, data: null })
    vi.mocked(fetchEnabledThresholds).mockResolvedValue([])
  })

  it('fetches enabled thresholds once when toggled on, not again when toggled off', async () => {
    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(fetchEnabledThresholds).not.toHaveBeenCalled()

    const checkbox = wrapper.find('.dit-threshold input')
    await checkbox.setValue(true)
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(1)

    await checkbox.setValue(false)
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(1)
  })
})
