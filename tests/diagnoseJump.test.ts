import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildMultiDiagnoseUrl,
  buildSingleDiagnoseUrl,
  DEVICE_KPI_STORAGE_KEY,
  DIAGNOSE_MESSAGES,
  MAX_DIAGNOSE_ITEMS,
  openDiagnoseWindow,
  planDiagnoseJump,
  toDeviceKpi,
  writeDeviceKpi,
} from '../src/domain/diagnoseJump'
import type { TrendItemIdentity } from '../src/types'

function item(deviceCode: string, i: number): TrendItemIdentity {
  return {
    deviceCode,
    pointId: `0${i}`,
    kpiId: `KPI_${i}`,
    displayName: `数据项${i}`,
    pointName: `测点${i}`,
  }
}

describe('planDiagnoseJump', () => {
  it('rejects empty and cross-device selections', () => {
    expect(planDiagnoseJump([])).toEqual({ ok: false, reason: 'empty' })
    expect(planDiagnoseJump([item('A', 1), item('B', 2)])).toEqual({ ok: false, reason: 'cross-device' })
  })

  it('uses single mode for one item and caps multi at 5', () => {
    const one = item('DEV', 1)
    expect(planDiagnoseJump([one])).toEqual({ ok: true, mode: 'single', item: one })
    const many = Array.from({ length: 6 }, (_, i) => item('DEV', i))
    const plan = planDiagnoseJump(many)
    expect(plan).toMatchObject({ ok: true, mode: 'multi', deviceCode: 'DEV', capped: true })
    if (plan.ok && plan.mode === 'multi') {
      expect(plan.items).toHaveLength(MAX_DIAGNOSE_ITEMS)
    }
  })
})

describe('diagnose URLs and deviceKpi', () => {
  it('builds a triple URL for a single item', () => {
    expect(buildSingleDiagnoseUrl('/ddsat/', item('DEV01', 1), 10, 20)).toBe(
      '/ddsat/?deviceCode=DEV01&pointId=01&collectKpiId=KPI_1&st=10&et=20&origin=pms',
    )
  })

  it('builds a device-only URL for multiple items', () => {
    expect(buildMultiDiagnoseUrl('/ddsat/', 'DEV01')).toBe('/ddsat/?deviceCode=DEV01')
  })

  it('writes sessionStorage.deviceKpi without calling an API', () => {
    const items = [item('DEV', 1), item('DEV', 2)]
    const json = writeDeviceKpi(items)
    expect(JSON.parse(json)).toEqual(toDeviceKpi(items))
    expect(sessionStorage.getItem(DEVICE_KPI_STORAGE_KEY)).toBe(json)
  })
})

describe('openDiagnoseWindow', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it('opens a new tab and copies deviceKpi into the new window storage', () => {
    const store: Record<string, string> = {}
    const win = {
      sessionStorage: {
        setItem: (key: string, value: string) => {
          store[key] = value
        },
      },
    }
    vi.stubGlobal('open', vi.fn(() => win))
    openDiagnoseWindow('/ddsat/?deviceCode=DEV', '[{"deviceCode":"DEV"}]')
    expect(window.open).toHaveBeenCalledWith('/ddsat/?deviceCode=DEV', '_blank')
    expect(store[DEVICE_KPI_STORAGE_KEY]).toBe('[{"deviceCode":"DEV"}]')
    expect(sessionStorage.getItem(DEVICE_KPI_STORAGE_KEY)).toBe('[{"deviceCode":"DEV"}]')
  })
})

describe('DIAGNOSE_MESSAGES', () => {
  it('has user-facing copy for empty and cross-device', () => {
    expect(DIAGNOSE_MESSAGES.empty).toContain('勾选')
    expect(DIAGNOSE_MESSAGES.crossDevice).toContain('同一设备')
  })
})
