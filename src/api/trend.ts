import { AGGREGATE_FUNC, RESERVE_DECIMAL } from '../types'
import type { TrendItemIdentity } from '../types'
import { getTrendRequest } from './http'

const TREND_URL = '/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition'

export async function fetchAggregateTrend(
  item: TrendItemIdentity,
  startTimeMs: number,
  endTimeMs: number,
): Promise<unknown> {
  return getTrendRequest()(TREND_URL, {
    method: 'POST',
    data: {
      startTimeMS: startTimeMs,
      endTimeMS: endTimeMs,
      aggregateFunc: AGGREGATE_FUNC,
      reserveDecimal: RESERVE_DECIMAL,
      deviceCode: item.deviceCode,
      pointId: item.pointId,
      kpiId: item.kpiId,
    },
  })
}
