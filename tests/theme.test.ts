import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { TrendItemIdentity } from '../src/types'

const echartsMocks = vi.hoisted(() => ({
  setOption: vi.fn(),
  dispose: vi.fn(),
}))

vi.mock('echarts', () => ({
  init: () => ({
    setOption: echartsMocks.setOption,
    dispose: echartsMocks.dispose,
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
import * as chartOptionMod from '../src/domain/chartOption'
import TrendPanel from '../src/components/TrendPanel.vue'
import TrendChart from '../src/components/TrendChart.vue'

function item(i: number): TrendItemIdentity {
  return {
    deviceCode: 'DEV',
    pointId: '01',
    kpiId: `KPI_${i}`,
    displayName: `数据项${i}`,
  }
}

function panelOption(wrapper: ReturnType<typeof mount>) {
  return wrapper.findComponent(TrendChart).props('option') as {
    color?: string[]
    series: Array<{ markLine?: { data?: unknown[] } }>
  }
}

function markLineData(option: { series: Array<{ markLine?: { data?: unknown[] } }> }) {
  return option.series.flatMap(s => s.markLine?.data ?? [])
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
    echartsMocks.setOption.mockReset()
    vi.mocked(fetchDeviceDataItems).mockResolvedValue([])
    vi.mocked(fetchAggregateTrend).mockResolvedValue({ code: 200, data: null })
    vi.mocked(fetchEnabledThresholds).mockResolvedValue([])
  })

  it('fetches enabled thresholds once when toggled on, not again when toggled off', async () => {
    vi.mocked(fetchEnabledThresholds).mockResolvedValue([
      { itemKey: 'DEV*01*KPI_0', level: '危险', y: 100, label: '危险' },
    ])
    const buildSpy = vi.spyOn(chartOptionMod, 'buildChartOption')
    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    expect(fetchEnabledThresholds).not.toHaveBeenCalled()

    const checkbox = wrapper.find('.dit-threshold input')
    await checkbox.setValue(true)
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(1)
    expect(markLineData(panelOption(wrapper)).length).toBeGreaterThan(0)

    await checkbox.setValue(false)
    await flushPromises()
    expect(fetchEnabledThresholds).toHaveBeenCalledTimes(1)
    expect(buildSpy.mock.calls.at(-1)?.[0].showThresholds).toBe(false)
    expect(markLineData(panelOption(wrapper))).toEqual([])
    expect(echartsMocks.setOption.mock.calls.at(-1)?.[1]).toEqual({ notMerge: true })
  })
})

describe('theme tokens', () => {
  beforeEach(() => {
    vi.mocked(fetchDeviceDataItems).mockReset()
    vi.mocked(fetchAggregateTrend).mockReset()
    vi.mocked(fetchEnabledThresholds).mockReset()
    vi.mocked(fetchDeviceDataItems).mockResolvedValue([])
    vi.mocked(fetchAggregateTrend).mockResolvedValue({
      code: 200,
      data: { timestamps: [1_000_000], values: [[10]] },
    })
    vi.mocked(fetchEnabledThresholds).mockResolvedValue([
      { itemKey: 'DEV*01*KPI_0', level: '危险', y: 100, label: '危险' },
    ])
  })

  it('passes computed CSS vars from .dit-root as themeTokens', async () => {
    const original = window.getComputedStyle.bind(window)
    vi.spyOn(window, 'getComputedStyle').mockImplementation((elt, pseudo) => {
      const el = elt as Element
      if (el?.classList?.contains('dit-root')) {
        return new Proxy(original(elt, pseudo), {
          get(target, prop, receiver) {
            if (prop === 'getPropertyValue') {
              return (name: string) => ({
                '--danger': '#ff0000',
                '--warning': '#ffa500',
                '--notice': '#0000ff',
                '--chart-series-1': '#111111',
                '--chart-series-2': '#222222',
                '--chart-series-3': '#333333',
                '--chart-series-4': '#444444',
              }[name] ?? target.getPropertyValue(name))
            }
            return Reflect.get(target, prop, receiver)
          },
        })
      }
      return original(elt, pseudo)
    })

    const buildSpy = vi.spyOn(chartOptionMod, 'buildChartOption')
    const wrapper = mount(TrendPanel, {
      props: { trend: { items: [item(0)] } },
    })
    await flushPromises()
    await wrapper.find('.dit-threshold input').setValue(true)
    await flushPromises()

    expect(buildSpy.mock.calls.at(-1)?.[0].themeTokens).toEqual({
      danger: '#ff0000',
      warning: '#ffa500',
      notice: '#0000ff',
      series: ['#111111', '#222222', '#333333', '#444444'],
    })
    const option = panelOption(wrapper)
    expect(option.color).toEqual(['#111111', '#222222', '#333333', '#444444'])
    expect((option.series[0].markLine?.data as Array<{ lineStyle: { color: string } }>)[0].lineStyle.color).toBe('#ff0000')
  })
})

describe('TrendChart setOption', () => {
  beforeEach(() => {
    echartsMocks.setOption.mockReset()
  })

  it('uses notMerge so hidden markLine is dropped', async () => {
    const wrapper = mount(TrendChart, {
      props: {
        option: {
          series: [{ type: 'line', markLine: { data: [{ yAxis: 1 }] } }],
        },
      },
    })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({
      option: { series: [{ type: 'line' }] },
    })
    const last = echartsMocks.setOption.mock.calls.at(-1)
    expect(last?.[0]).toEqual({ series: [{ type: 'line' }] })
    expect(last?.[1]).toEqual({ notMerge: true })
  })
})
