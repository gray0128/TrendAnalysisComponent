import type { TrendItemIdentity } from '../types'

export function itemKey(item: TrendItemIdentity): string {
  return `${item.deviceCode}*${item.pointId}*${item.kpiId}`
}

export function itemTriple(item: TrendItemIdentity): string {
  return [
    item.deviceCode,
    item.pointName || item.pointId,
    item.displayName || item.kpiId,
  ].filter(part => part !== '').join('·')
}
