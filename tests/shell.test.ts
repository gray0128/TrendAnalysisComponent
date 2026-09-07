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

  it('emits close when Escape key is pressed', async () => {
    const drawerWrapper = mount(TrendDrawer, { props: { trend } })
    await flushPromises()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(drawerWrapper.emitted('close')).toHaveLength(1)
    drawerWrapper.unmount()

    const modalWrapper = mount(TrendModal, { props: { trend } })
    await flushPromises()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(modalWrapper.emitted('close')).toHaveLength(1)
    modalWrapper.unmount()
  })

  it('applies corresponding size classes on TrendModal', async () => {
    const defaultModal = mount(TrendModal, { props: { trend } })
    await flushPromises()
    expect(defaultModal.find('.dit-modal').classes()).toContain('dit-modal--1040x720')
    defaultModal.unmount()

    const wideModal = mount(TrendModal, { props: { trend, size: '1280*800' } })
    await flushPromises()
    expect(wideModal.find('.dit-modal').classes()).toContain('dit-modal--1280x800')
    wideModal.unmount()

    const fullModal = mount(TrendModal, { props: { trend, size: 'fullscreen' } })
    await flushPromises()
    expect(fullModal.find('.dit-modal').classes()).toContain('dit-modal--fullscreen')
    fullModal.unmount()
  })
})
