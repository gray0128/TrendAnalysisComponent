import { describe, expect, it } from 'vitest'
import { mockRequest, mockSeedItem } from '../playground/mockRequest'

describe('mockRequest', () => {
  it('returns non-signal KPI rows for the device list API', async () => {
    const payload: any = await mockRequest('/dosis/service/ISDV01/getKpiValueListByBusFilterDoGet', {
      method: 'POST',
      data: { params: { deviceCode: mockSeedItem.deviceCode, dataItemLabel: null } },
    })
    const rows = payload.result.AllDateList['01']
    expect(rows.some((row: any) => row.signal === true)).toBe(true)
    expect(rows.some((row: any) => row.kpiId === 'RMS' && row.signal === false)).toBe(true)
  })

  it('returns timestamps and values for the aggregate API', async () => {
    const payload: any = await mockRequest(
      '/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition',
      {
        method: 'POST',
        data: { startTimeMS: 1, endTimeMS: 1000, deviceCode: 'D', pointId: '01', kpiId: 'RMS' },
      },
    )
    expect(payload.data.timestamps.length).toBe(48)
    expect(payload.data.values[0]).toHaveLength(48)
  })
})
