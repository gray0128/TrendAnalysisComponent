import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TrendPicker from '../src/components/TrendPicker.vue'
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
  it('does not select a 9th item when 8 are already selected and shows cap message', async () => {
    const candidates = Array.from({ length: 9 }, (_, i) => item(i))
    const selected = candidates.slice(0, 8)
    const wrapper = mount(TrendPicker, {
      props: { candidates, selected },
    })

    const boxes = wrapper.findAll('input[type="checkbox"]')
    expect(boxes).toHaveLength(9)
    await boxes[8].setValue(true)

    expect(wrapper.emitted('update:selected')).toBeFalsy()
    expect((boxes[8].element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.text()).toContain('最多选择 8 个数据项')
  })

  it('does not show device filters unless grouped', () => {
    const wrapper = mount(TrendPicker, {
      props: { candidates: [item(0)], selected: [] },
    })
    expect(wrapper.find('.trend-picker__filters').exists()).toBe(false)
    expect(wrapper.find('.trend-picker__group').exists()).toBe(false)
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
})
