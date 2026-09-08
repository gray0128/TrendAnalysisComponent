import type { TrendItemIdentity } from '../types'

export const MAX_DIAGNOSE_ITEMS = 5
export const DEVICE_KPI_STORAGE_KEY = 'deviceKpi'

export const DIAGNOSE_MESSAGES = {
  empty: '请先勾选数据项',
  crossDevice: '请选择同一设备的数据项后再跳转诊断分析',
  capped: '最多跳转 5 个数据项，已取前 5 个',
} as const

export type DiagnosePlan =
  | { ok: true; mode: 'single'; item: TrendItemIdentity }
  | { ok: true; mode: 'multi'; deviceCode: string; items: TrendItemIdentity[]; capped: boolean }
  | { ok: false; reason: 'empty' | 'cross-device' }

export function planDiagnoseJump(items: TrendItemIdentity[]): DiagnosePlan {
  if (items.length === 0) return { ok: false, reason: 'empty' }
  const devices = new Set(items.map(item => item.deviceCode))
  if (devices.size > 1) return { ok: false, reason: 'cross-device' }
  if (items.length === 1) return { ok: true, mode: 'single', item: items[0]! }
  const capped = items.length > MAX_DIAGNOSE_ITEMS
  return {
    ok: true,
    mode: 'multi',
    deviceCode: items[0]!.deviceCode,
    items: items.slice(0, MAX_DIAGNOSE_ITEMS),
    capped,
  }
}

export function toDeviceKpi(
  items: TrendItemIdentity[],
  startTimeMs?: number,
  endTimeMs?: number,
) {
  return items.map(item => ({
    deviceCode: item.deviceCode,
    pointId: item.pointId,
    pointNo: item.pointId,
    pointName: item.pointName ?? '',
    kpiId: item.kpiId,
    collectKpiId: item.kpiId,
    kpiName: item.displayName || item.kpiId,
    dataItemDisplayName: item.displayName || item.kpiId,
    startTime: startTimeMs,
    endTime: endTimeMs,
  }))
}

function cleanBaseUrl(baseUrl: string): string {
  return (baseUrl.split('#')[0] || '').trim().replace(/\/+$/, '')
}

export function buildDiagnoseUrl(
  baseUrl: string,
  params: Record<string, string>,
): string {
  const trimmed = baseUrl.trim() || '/'
  const abs = /^https?:\/\//i.test(trimmed)
  const normalized = /[?#]/.test(trimmed) || trimmed.endsWith('/') ? trimmed : `${trimmed}/`
  const url = abs ? new URL(normalized) : new URL(normalized, 'http://diagnose.local')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  if (abs) return url.toString()
  return `${url.pathname}${url.search}${url.hash}`
}

export function buildSingleDiagnoseUrl(
  baseUrl: string,
  item: TrendItemIdentity,
  startTimeMs: number,
  endTimeMs: number,
): string {
  return buildDiagnoseUrl(cleanBaseUrl(baseUrl), {
    origin: 'pms',
    deviceCode: item.deviceCode,
    pointId: item.pointId,
    collectKpiId: item.kpiId,
    st: String(startTimeMs),
    et: String(endTimeMs),
  })
}

export function buildMultiDiagnoseUrl(baseUrl: string, deviceCode: string): string {
  return buildDiagnoseUrl(cleanBaseUrl(baseUrl), {
    origin: 'pms',
    deviceCode,
  })
}

export function writeDeviceKpi(
  items: TrendItemIdentity[],
  startTimeMs?: number,
  endTimeMs?: number,
): string {
  const json = JSON.stringify(toDeviceKpi(items, startTimeMs, endTimeMs))
  sessionStorage.setItem(DEVICE_KPI_STORAGE_KEY, json)
  return json
}

export function openDiagnoseWindow(url: string, deviceKpiJson?: string): void {
  if (deviceKpiJson != null) {
    sessionStorage.setItem(DEVICE_KPI_STORAGE_KEY, deviceKpiJson)
  }
  const win = window.open(url, '_blank')
  if (deviceKpiJson && win) {
    try {
      win.sessionStorage.setItem(DEVICE_KPI_STORAGE_KEY, deviceKpiJson)
    } catch {
      // 跨源时无法写入新窗口，落地页若同源可读 opener 写入的值
    }
  }
}
