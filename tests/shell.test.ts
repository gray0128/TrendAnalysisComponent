import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { TrendLoadInput } from '../src/types'

vi.mock('echarts', () => ({
  init: () => ({
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    dispatchAction: vi.fn(),
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
import TrendDrawer from '../src/components/TrendDrawer.vue'
import TrendModal from '../src/components/TrendModal.vue'

const trend: TrendLoadInput = { items: [] }

describe('shell close', () => {
  beforeEach(() => {
    vi.mocked(fetchDeviceDataItems).mockReset()
    vi.mocked(fetchAggregateTrend).mockReset()
    vi.mocked(fetchEnabledThresholds).mockReset()
    vi.mocked(fetchDeviceDataItems).mockResolvedValue([])
    vi.mocked(fetchAggregateTrend).mockResolvedValue({ code: 200, data: null })
    vi.mocked(fetchEnabledThresholds).mockResolvedValue([])
  })

  it('TrendDrawer emits close from the corner button and the mask', async () => {
    const wrapper = mount(TrendDrawer, { props: { trend } })
    await flushPromises()

    await wrapper.find('.dit-shell-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.find('.dit-drawer-mask').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('TrendModal emits close from the corner button and the mask', async () => {
    const wrapper = mount(TrendModal, { props: { trend } })
    await flushPromises()

    await wrapper.find('.dit-shell-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.find('.dit-modal-mask').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })
})
