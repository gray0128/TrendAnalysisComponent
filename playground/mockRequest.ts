import type { TrendRequest } from '../src/types'

const DATA_ITEM_URL = '/dosis/service/ISDV01/getKpiValueListByBusFilterDoGet'
const TREND_URL = '/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition'
const THRESHOLD_URL = '/api/threshold/customized/getThresholdListByCondition'

const MOCK_DEVICE = 'MOCKDEV01'

const kpiRows = [
  { pointNo: '01', pointName: '测点01', kpiId: 'RMS', dataItemDisplayName: '速度有效值', signal: false, unit: 'mm/s' },
  { pointNo: '01', pointName: '测点01', kpiId: 'PEAK', dataItemDisplayName: '速度峰值', signal: false, unit: 'mm/s' },
  { pointNo: '01', pointName: '测点01', kpiId: 'WAVE', dataItemDisplayName: '波形', signal: true, unit: 'wave' },
  { pointNo: '02', pointName: '测点02', kpiId: 'TEMP', dataItemDisplayName: '表面温度', signal: false, unit: '℃' },
]

function mockDataItems(deviceCode: string) {
  return {
    code: 200,
    result: {
      AllDateList: {
        '01': kpiRows.filter(row => row.pointNo === '01').map(row => ({ ...row, pointNo: '01' })),
        '02': kpiRows.filter(row => row.pointNo === '02').map(row => ({ ...row, pointNo: '02' })),
      },
    },
    deviceCode,
  }
}

function mockTrend(data: any) {
  const start = Number(data?.startTimeMS) || Date.now() - 2 * 60 * 60 * 1000
  const end = Number(data?.endTimeMS) || Date.now()
  const count = 48
  const span = Math.max(end - start, 1000)
  const timestamps: string[] = []
  const values: number[] = []
  const seed = String(data?.kpiId ?? 'RMS').length
  for (let i = 0; i < count; i++) {
    const ms = start + (span * i) / (count - 1)
    timestamps.push(String(Math.round(ms * 1e6)))
    values.push(Number((30 + seed * 2 + Math.sin(i / 3) * 12 + (i % 7)).toFixed(3)))
  }
  return {
    code: 200,
    data: {
      timestamps,
      values: [values],
    },
  }
}

function mockThresholds(data: any) {
  const tags: string[] = Array.isArray(data?.tags) ? data.tags : []
  const rows = tags.map(tag => {
    const [deviceCode, pointId, kpiId] = tag.split('.')
    return {
      tag,
      deviceCode,
      pointId,
      kpiId,
      enabled: '1',
      severity: kpiId === 'TEMP' ? 2 : 3,
      ruleCondition: kpiId === 'TEMP' ? '07' : '03',
      refValue1: kpiId === 'TEMP' ? 10 : 45,
      refValue2: kpiId === 'TEMP' ? 60 : undefined,
      message: kpiId === 'TEMP' ? '介于' : `${kpiId} 大于阈值`,
    }
  })
  return { code: 200, result: rows }
}

export const mockRequest: TrendRequest = async (url, init) => {
  if (url === DATA_ITEM_URL) {
    const deviceCode = String((init.data as any)?.params?.deviceCode ?? MOCK_DEVICE)
    return mockDataItems(deviceCode)
  }
  if (url === TREND_URL) return mockTrend(init.data)
  if (url === THRESHOLD_URL) return mockThresholds(init.data)
  return { code: 404, message: `mock 未覆盖 ${url}` }
}

export const mockSeedItem = {
  deviceCode: MOCK_DEVICE,
  pointId: '01',
  kpiId: 'RMS',
  displayName: '速度有效值',
  pointName: '测点01',
  unit: 'mm/s',
}
