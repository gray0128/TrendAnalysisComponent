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
import TrendChart from '../src/components/TrendChart.vue'
import TrendPicker from '../src/components/TrendPicker.vue'
import { MAX_TREND_SERIES } from '../src/types'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(r => {
    resolve = r
  })
  return { promise, resolve }
}

function seriesData(wrapper: ReturnType<typeof mount>) {
  const option = wrapper.findComponent(TrendChart).props('option') as {
    series: { data: [number, number | null][] }[]
  }
  return option.series.map(s => s.data)
}

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

  it('still fetches the trend item when device picker kpiIds differ', async () => {
    const trendItem: TrendItemIdentity = {
      deviceCode: 'DEV',
      pointId: '01',
      kpiId: '12345',
      displayName: '速度',
    }
    vi.mocked(fetchDeviceDataItems).mockResolvedValue([
      { deviceCode: 'DEV', pointId: '01', kpiId: 'VEL_RMS', displayName: '速度有效值' },
    ])

    const wrapper = mount(TrendPanel, {
      props: {
        trend: { items: [trendItem] },
        picker: { type: 'device', deviceCode: 'DEV' },
      },
    })
    await flushPromises()

    expect(fetchAggregateTrend).toHaveBeenCalledTimes(1)
    expect(fetchAggregateTrend).toHaveBeenCalledWith(
      trendItem,
      expect.any(Number),
      expect.any(Number),
    )
    const boxes = wrapper.findAll('.dit-picker input[type="checkbox"]')
    expect(boxes).toHaveLength(1)
    expect((boxes[0].element as HTMLInputElement).checked).toBe(false)
  })

  it('still fetches the trend item when fetchDeviceDataItems rejects', async () => {
    const trendItem = item(0)
    vi.mocked(fetchDeviceDataItems).mockRejectedValue(new Error('picker fail'))

    const wrapper = mount(TrendPanel, {
      props: {
        trend: { items: [trendItem] },
        picker: { type: 'device', deviceCode: 'DEV' },
      },
    })
    await flushPromises()

    expect(fetchAggregateTrend).toHaveBeenCalledTimes(1)
    expect(fetchAggregateTrend).toHaveBeenCalledWith(
      trendItem,
      expect.any(Number),
      expect.any(Number),
    )
    expect(wrapper.text()).toContain('数据项列表加载失败')
  })

  it('does not request thresholds by default', async () => {
    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('阈值线')
    expect(fetchEnabledThresholds).not.toHaveBeenCalled()
  })

  it('fetches at most 8 series when 9 trend.items are given without a picker', async () => {
    const items = Array.from({ length: 9 }, (_, i) => item(i))
    const wrapper = mount(TrendPanel, {
      props: { trend: { items } },
    })
    await flushPromises()

    expect(fetchAggregateTrend).toHaveBeenCalledTimes(MAX_TREND_SERIES)
    expect(wrapper.text()).toContain('最多加载 8 个数据项，其余未加载')
  })

  it('fetches at most 8 series when selected somehow exceeds the cap', async () => {
    const nine = Array.from({ length: 9 }, (_, i) => item(i))
    const wrapper = mount(TrendPanel, {
      props: {
        trend: { items: nine.slice(0, 8) },
        picker: { type: 'items', items: nine },
      },
    })
    await flushPromises()
    vi.mocked(fetchAggregateTrend).mockClear()

    wrapper.findComponent(TrendPicker).vm.$emit('update:selected', nine)
    await flushPromises()

    expect(fetchAggregateTrend).toHaveBeenCalledTimes(MAX_TREND_SERIES)
    const checked = wrapper
      .findAll('.dit-picker input[type="checkbox"]')
      .filter(box => (box.element as HTMLInputElement).checked)
    expect(checked).toHaveLength(MAX_TREND_SERIES)
    expect(wrapper.text()).toContain('最多加载 8 个数据项，其余未加载')
  })

  it('ignores a stale trend response after a newer query', async () => {
    const first = deferred<unknown>()
    vi.mocked(fetchAggregateTrend)
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValue({
        code: 200,
        data: { timestamps: [1_000_000], values: [[1]] },
      })

    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(fetchAggregateTrend).toHaveBeenCalledTimes(1)

    const queryBtn = wrapper.findAll('button').find(b => b.text() === '查询')
    expect(queryBtn).toBeTruthy()
    await queryBtn!.trigger('click')
    await flushPromises()
    expect(fetchAggregateTrend).toHaveBeenCalledTimes(2)
    expect(seriesData(wrapper)).toEqual([[[1, 1]]])

    first.resolve({
      code: 200,
      data: { timestamps: [2_000_000], values: [[99]] },
    })
    await flushPromises()
    expect(seriesData(wrapper)).toEqual([[[1, 1]]])
  })

  it('clears threshold cache on empty selection so the same items fetch again', async () => {
    const list = [item(0)]
    const wrapper = mount(TrendPanel, {
      props: {
        trend: { items: list },
        picker: { type: 'items', items: list },
      },
    })
    await flushPromises()

    await wrapper.find('.dit-threshold input').setValue(true)
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(1)

    wrapper.findComponent(TrendPicker).vm.$emit('update:selected', [])
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(1)

    wrapper.findComponent(TrendPicker).vm.$emit('update:selected', list)
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(2)
  })

  it('rebuilds the trend option when fetchEnabledThresholds rejects', async () => {
    vi.mocked(fetchAggregateTrend).mockResolvedValue({
      code: 200,
      data: { timestamps: [1_000_000], values: [[10]] },
    })
    vi.mocked(fetchEnabledThresholds).mockRejectedValue(new Error('threshold fail'))

    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(seriesData(wrapper)).toEqual([[[1, 10]]])

    await wrapper.find('.dit-threshold input').setValue(true)
    await flushPromises()
    expect(seriesData(wrapper)).toEqual([[[1, 10]]])
  })
})
