import { mapThresholdRows } from '../domain/mapThreshold'
import type { ThresholdMark } from '../domain/mapThreshold'
import type { TrendItemIdentity } from '../types'
import { getTrendRequest } from './http'

const THRESHOLD_URL = '/api/threshold/customized/getThresholdListByCondition'

function itemTag(item: TrendItemIdentity): string {
  return `${item.deviceCode}.${item.pointId}.${item.kpiId}`
}

function extractRows(payload: any): any[] {
  const result = payload?.data?.result ?? payload?.result ?? payload?.data
  if (Array.isArray(result)) return result
  if (Array.isArray(payload)) return payload
  return []
}

function rowTag(row: any): string {
  if (row?.tag != null) return String(row.tag)
  return `${row?.deviceCode ?? ''}.${row?.pointId ?? ''}.${row?.kpiId ?? row?.kpiCode ?? ''}`
}

export async function fetchEnabledThresholds(items: TrendItemIdentity[]): Promise<ThresholdMark[]> {
  const tags = items.map(itemTag)
  const payload = await getTrendRequest()(THRESHOLD_URL, {
    method: 'POST',
    data: { tags },
  })
  const rows = extractRows(payload)
  return items.flatMap(item => {
    const tag = itemTag(item)
    return mapThresholdRows(rows.filter(row => rowTag(row) === tag), item)
  })
}
