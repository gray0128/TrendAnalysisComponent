import type { TrendItemIdentity } from '../types'

export function itemKey(item: TrendItemIdentity): string {
  return `${item.deviceCode}*${item.pointId}*${item.kpiId}`
}
