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
import TrendPanel from '../src/components/TrendPanel.vue'

function item(i: number): TrendItemIdentity {
  return {
    deviceCode: 'DEV',
    pointId: '01',
    kpiId: `KPI_${i}`,
    displayName: `数据项${i}`,
  }
}

describe('TrendPanel', () => {
  beforeEach(() => {
    vi.mocked(fetchDeviceDataItems).mockReset()
    vi.mocked(fetchAggregateTrend).mockReset()
    vi.mocked(fetchEnabledThresholds).mockReset()
    vi.mocked(fetchDeviceDataItems).mockResolvedValue([])
    vi.mocked(fetchAggregateTrend).mockResolvedValue({ code: 200, data: null })
    vi.mocked(fetchEnabledThresholds).mockResolvedValue([])
  })

  it('does not render .dit-picker when picker is omitted', async () => {
    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(wrapper.find('.dit-picker').exists()).toBe(false)
  })

  it('does not fetch trends when nothing is selected', async () => {
    mount(TrendPanel, {
      props: { trend: { items: [] } },
    })
    await flushPromises()
    expect(fetchAggregateTrend).not.toHaveBeenCalled()
  })

  it('selects the matching device-list item and fetches that trend once', async () => {
    const list = [item(0), item(1), item(2)]
    vi.mocked(fetchDeviceDataItems).mockResolvedValue(list)

    const wrapper = mount(TrendPanel, {
      props: {
        trend: { items: [{ deviceCode: 'DEV', pointId: '01', kpiId: 'KPI_0' }] },
        picker: { type: 'device', deviceCode: 'DEV' },
      },
    })
    await flushPromises()

    expect(fetchDeviceDataItems).toHaveBeenCalledWith('DEV')
    const boxes = wrapper.findAll('.dit-picker input[type="checkbox"]')
    expect(boxes).toHaveLength(3)
    expect((boxes[0].element as HTMLInputElement).checked).toBe(true)
    expect((boxes[1].element as HTMLInputElement).checked).toBe(false)
    expect((boxes[2].element as HTMLInputElement).checked).toBe(false)
    expect(fetchAggregateTrend).toHaveBeenCalledTimes(1)
    expect(fetchAggregateTrend).toHaveBeenCalledWith(
      list[0],
      expect.any(Number),
      expect.any(Number),
    )
  })

  it('does not request thresholds by default', async () => {
    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('阈值线')
    expect(fetchEnabledThresholds).not.toHaveBeenCalled()
  })
})
