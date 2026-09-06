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
})
