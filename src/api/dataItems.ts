import { mapAllDateList } from '../domain/mapDataItem'
import type { TrendItemIdentity } from '../types'
import { getTrendRequest } from './http'

const DATA_ITEM_URL = '/dosis/service/ISDV01/getKpiValueListByBusFilterDoGet'

export async function fetchDeviceDataItems(deviceCode: string): Promise<TrendItemIdentity[]> {
  const payload: any = await getTrendRequest()(DATA_ITEM_URL, {
    method: 'POST',
    data: { params: { deviceCode, dataItemLabel: null } },
  })
  const allDateList = payload?.data?.result?.AllDateList
    ?? payload?.result?.AllDateList
    ?? payload?.AllDateList
    ?? {}
  return mapAllDateList(allDateList, deviceCode)
}
