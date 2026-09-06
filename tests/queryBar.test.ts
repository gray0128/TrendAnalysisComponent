import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TrendQueryBar from '../src/components/TrendQueryBar.vue'

const HOUR = 60 * 60 * 1000

async function clickByText(wrapper: ReturnType<typeof mount>, text: string) {
  const btn = wrapper.findAll('button').find(b => b.text() === text)
  if (!btn) throw new Error(`button "${text}" not found`)
  await btn.trigger('click')
}

describe('TrendQueryBar', () => {
  it('emits 8-hour duration with unchanged end when clicking 8小时', async () => {
    const end = 1_700_000_000_000
    const start = end - 2 * HOUR
    const wrapper = mount(TrendQueryBar, {
      props: { startTimeMs: start, endTimeMs: end },
    })

    await clickByText(wrapper, '8小时')

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      startTimeMs: end - 8 * HOUR,
      endTimeMs: end,
    })
  })

  it('does not let 后移 push end past injected now', async () => {
    const now = 1_700_000_000_000
    const end = now - HOUR
    const start = now - 3 * HOUR
    const wrapper = mount(TrendQueryBar, {
      props: { startTimeMs: start, endTimeMs: end, now },
    })

    await clickByText(wrapper, '后移')

    const payload = wrapper.emitted('change')?.[0]?.[0] as {
      startTimeMs: number
      endTimeMs: number
    }
    expect(payload.endTimeMs).toBeLessThanOrEqual(now)
    expect(payload.endTimeMs).toBe(now)
  })
})
