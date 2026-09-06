import type { TrendItemIdentity } from '../types'

function resolveKpiId(row: any): string {
  if (row.collectKpiId != null) {
    return String(row.collectKpiId)
  }
  if (row.kpiId != null) {
    const kpiIdStr = String(row.kpiId)
    if (!/^\d+$/.test(kpiIdStr)) {
      return kpiIdStr
    }
  }
  if (row.kpiCode != null) {
    return String(row.kpiCode)
  }
  return String(row.kpiId ?? row.kpiCode ?? '')
}

export function mapKpiRowToIdentity(
  row: any,
  deviceCode: string,
  pointNo: string,
): TrendItemIdentity | null {
  if (row?.signal === true) return null
  return {
    deviceCode,
    pointId: row.pointNo ?? pointNo,
    kpiId: resolveKpiId(row),
    displayName: row.dataItemDisplayName ?? row.kpiId,
    pointName: undefined,
    unit: undefined,
  }
}

export function mapAllDateList(
  allDateList: Record<string, any[] | undefined>,
  deviceCode: string,
): TrendItemIdentity[] {
  const result: TrendItemIdentity[] = []
  for (const pointNo of Object.keys(allDateList ?? {})) {
    const rows = Array.isArray(allDateList[pointNo]) ? allDateList[pointNo]! : []
    for (const row of rows) {
      const identity = mapKpiRowToIdentity(row, deviceCode, pointNo)
      if (identity) result.push(identity)
    }
  }
  return result
}
