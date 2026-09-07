import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TrendPicker from '../src/components/TrendPicker.vue'
import { MAX_TREND_SERIES } from '../src/types'
import type { TrendItemIdentity } from '../src/types'

function item(i: number): TrendItemIdentity {
  return {
    deviceCode: 'DEV',
    pointId: '01',
    kpiId: `KPI_${i}`,
    displayName: `数据项${i}`,
  }
}

describe('TrendPicker', () => {
  it('does not select another item when the cap is already reached and shows cap message', async () => {
    const candidates = Array.from({ length: MAX_TREND_SERIES + 1 }, (_, i) => item(i))
    const selected = candidates.slice(0, MAX_TREND_SERIES)
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected },
    })

    const boxes = wrapper.findAll('input[type="checkbox"]')
    expect(boxes).toHaveLength(MAX_TREND_SERIES + 1)
    await boxes[MAX_TREND_SERIES].setValue(true)

    expect(wrapper.emitted('update:selected')).toBeFalsy()
    expect((boxes[MAX_TREND_SERIES].element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.text()).toContain(`最多选择 ${MAX_TREND_SERIES} 个数据项`)
  })

  it('does not show device filters unless grouped', () => {
    const wrapper = mount(TrendPicker, {
      props: { candidates: [item(0)], selected: [] },
    })
    expect(wrapper.find('.trend-picker__filters').exists()).toBe(false)
    expect(wrapper.find('.trend-picker__group').exists()).toBe(false)
    expect(wrapper.find('.trend-picker__aggregates').exists()).toBe(false)
    expect(wrapper.find('.trend-picker__reset').exists()).toBe(false)
  })

  it('groups device candidates by point and filters by the four query fields', async () => {
    const candidates: TrendItemIdentity[] = [
      { deviceCode: 'DEV', pointId: '01', pointName: '电机', kpiId: 'RMS', displayName: '速度RMS' },
      { deviceCode: 'DEV', pointId: '01', pointName: '电机', kpiId: 'PEAK', displayName: '速度峰值' },
      { deviceCode: 'DEV', pointId: '02', pointName: '轴承', kpiId: 'TEMP', displayName: '温度' },
    ]
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected: [], grouped: true },
    })

    expect(wrapper.find('.trend-picker__filters').text()).toContain('测点编号')
    expect(wrapper.find('.trend-picker__filters').text()).toContain('测点名称')
    expect(wrapper.find('.trend-picker__filters').text()).toContain('数据项')
    expect(wrapper.find('.trend-picker__filters').text()).toContain('数据项展示名称')
    expect(wrapper.findAll('.trend-picker__group')).toHaveLength(2)
    expect(wrapper.findAll('.trend-picker__group-title').map(n => n.text())).toEqual([
      '01 电机',
      '02 轴承',
    ])
    expect(wrapper.findAll('.trend-picker__items')).toHaveLength(2)
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(3)

    const filterInputs = wrapper.findAll('.trend-picker__filters input')
    await filterInputs[0].setValue('02')
    expect(wrapper.findAll('.trend-picker__group')).toHaveLength(1)
    expect(wrapper.find('.trend-picker__group-title').text()).toBe('02 轴承')
    expect(wrapper.text()).toContain('温度')
    expect(wrapper.text()).not.toContain('速度RMS')

    await filterInputs[0].setValue('')
    await filterInputs[2].setValue('rms')
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('速度RMS')
  })

  it('sorts grouped points by pointId ascending', () => {
    const candidates: TrendItemIdentity[] = [
      { deviceCode: 'DEV', pointId: '10', pointName: '风机负荷端3V', kpiId: 'RMS', displayName: '低频加速度总值' },
      { deviceCode: 'DEV', pointId: '02', pointName: '电机自由端1H', kpiId: 'RMS', displayName: '低频加速度总值' },
      { deviceCode: 'DEV', pointId: '11', pointName: '风机自由端4H', kpiId: 'RMS', displayName: '低频加速度总值' },
    ]
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected: [], grouped: true },
    })
    expect(wrapper.findAll('.trend-picker__group-title').map(n => n.text())).toEqual([
      '02 电机自由端1H',
      '10 风机负荷端3V',
      '11 风机自由端4H',
    ])
  })

  it('aggregates grouped candidates by display name and replaces selection on click', async () => {
    const candidates: TrendItemIdentity[] = [
      { deviceCode: 'DEV', pointId: '01', pointName: '电机', kpiId: 'RMS', displayName: '速度RMS' },
      { deviceCode: 'DEV', pointId: '02', pointName: '轴承', kpiId: 'VEL', displayName: '速度RMS' },
      { deviceCode: 'DEV', pointId: '02', pointName: '轴承', kpiId: 'TEMP', displayName: '温度' },
    ]
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected: [candidates[2]!], grouped: true },
    })

    const chips = wrapper.findAll('.trend-picker__aggregate')
    expect(chips.map(n => n.text())).toEqual(['速度RMS（2）', '温度（1）'])

    await chips[0]!.trigger('click')
    expect(wrapper.emitted('update:selected')![0]![0]).toEqual([candidates[0], candidates[1]])
  })

  it('caps display-name aggregate click at MAX_TREND_SERIES', async () => {
    const candidates = Array.from({ length: MAX_TREND_SERIES + 2 }, (_, i) => ({
      deviceCode: 'DEV',
      pointId: String(i).padStart(2, '0'),
      kpiId: `KPI_${i}`,
      displayName: '速度RMS',
    }))
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected: [candidates[0]!], grouped: true },
    })

    await wrapper.get('.trend-picker__aggregate').trigger('click')
    const emitted = wrapper.emitted('update:selected')![0]![0] as TrendItemIdentity[]
    expect(emitted).toEqual(candidates.slice(0, MAX_TREND_SERIES))
    expect(wrapper.text()).toContain(`最多选择 ${MAX_TREND_SERIES} 个数据项`)
  })

  it('clears all selected items when reset is clicked', async () => {
    const candidates = [item(0), item(1)]
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected: candidates, grouped: true },
    })
    await wrapper.get('.trend-picker__reset').trigger('click')
    expect(wrapper.emitted('update:selected')![0]![0]).toEqual([])
  })

  it('does not emit reset when nothing is selected', async () => {
    const wrapper = mount(TrendPicker, {
      props: { candidates: [item(0)], selected: [], grouped: true },
    })
    expect(wrapper.get('.trend-picker__reset').attributes('disabled')).toBeDefined()
    await wrapper.get('.trend-picker__reset').trigger('click')
    expect(wrapper.emitted('update:selected')).toBeFalsy()
  })
})
