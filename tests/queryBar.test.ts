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
  it('emits 8-hour duration with unchanged end when selecting 8小时', async () => {
    const end = 1_700_000_000_000
    const start = end - 2 * HOUR
    const wrapper = mount(TrendQueryBar, {
      props: { startTimeMs: start, endTimeMs: end },
    })

    await wrapper.find('.trend-query-bar__shortcut').setValue('8h')

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      startTimeMs: end - 8 * HOUR,
      endTimeMs: end,
    })
    expect(wrapper.emitted('query')).toHaveLength(1)
  })

  it('pads shift option labels to a shared numeric width', () => {
    const wrapper = mount(TrendQueryBar, {
      props: { startTimeMs: 1, endTimeMs: 2 },
    })
    const labels = wrapper.findAll('.trend-query-bar__shift option').map(n => n.element.textContent)
    expect(labels[0]).toBe('\u20075分钟')
    expect(labels).toContain('10分钟')
    expect(labels).toContain('\u20072小时')
    expect(labels).toContain('24小时')
  })

  it('places shift controls after 查询', () => {
    const wrapper = mount(TrendQueryBar, {
      props: { startTimeMs: 1, endTimeMs: 2 },
    })
    const html = wrapper.find('.trend-query-bar').html()
    expect(html.indexOf('查询')).toBeGreaterThan(-1)
    expect(html.indexOf('查询')).toBeLessThan(html.indexOf('前移'))
    expect(html.indexOf('前移')).toBeLessThan(html.indexOf('后移'))
    expect(wrapper.find('.trend-query-bar__query').exists()).toBe(true)
    expect(wrapper.find('.trend-query-bar__shift').exists()).toBe(true)
  })

  it('disables 后移 when the window already ends at now', async () => {
    const now = 1_700_000_000_000
    const wrapper = mount(TrendQueryBar, {
      props: { startTimeMs: now - 2 * HOUR, endTimeMs: now, now },
    })
    const forward = wrapper.findAll('button').find(b => b.text() === '后移')
    const back = wrapper.findAll('button').find(b => b.text() === '前移')
    expect(forward!.attributes('disabled')).toBeDefined()
    expect(back!.attributes('disabled')).toBeUndefined()
    await forward!.trigger('click')
    expect(wrapper.emitted('change')).toBeFalsy()
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
