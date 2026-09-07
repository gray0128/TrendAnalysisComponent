import { afterEach, describe, expect, it } from 'vitest'
import { getTrendRequest, setTrendRequest } from '../src/api/http'
import { fetchDeviceDataItems } from '../src/api/dataItems'
import { fetchAggregateTrend } from '../src/api/trend'
import { fetchEnabledThresholds } from '../src/api/thresholds'
import { install } from '../src/plugin'

afterEach(() => {
  setTrendRequest(undefined)
})

describe('injected request client', () => {
  it('throws when request is not installed', async () => {
    await expect(
      fetchAggregateTrend({ deviceCode: 'D', pointId: '01', kpiId: 'k' }, 1, 2),
    ).rejects.toThrow('data-item-trend: request is not installed')
  })

  it('install stores request for later calls', () => {
    const request = async () => ({ code: 200, data: null })
    install({}, { request })
    expect(getTrendRequest()).toBe(request)
  })

  it('posts busout body without params wrapper', async () => {
    const calls: unknown[] = []
    setTrendRequest(async (url, init) => {
      calls.push({ url, init })
      return { code: 200, data: null }
    })
    await fetchAggregateTrend(
      { deviceCode: 'D', pointId: '01', kpiId: 'k' },
      1,
      2,
    )
    expect(calls[0]).toMatchObject({
      url: '/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition',
      init: {
        method: 'POST',
        data: {
          startTimeMS: 1,
          endTimeMS: 2,
          aggregateFunc: 2,
          reserveDecimal: 3,
          deviceCode: 'D',
          pointId: '01',
          kpiId: 'k',
        },
      },
    })
  })

  it('posts data-item list body with params wrapper', async () => {
    const calls: unknown[] = []
    setTrendRequest(async (url, init) => {
      calls.push({ url, init })
      return {
        code: 200,
        result: {
          AllDateList: {
            '01': [
              { kpiId: 'k', dataItemDisplayName: 'n', signal: false, pointNo: '01' },
              { kpiId: 'WAVE', signal: true, pointNo: '01' },
            ],
          },
        },
      }
    })
    const list = await fetchDeviceDataItems('D')
    expect(calls[0]).toMatchObject({
      url: '/dosis/service/ISDV01/getKpiValueListByBusFilterDoGet',
      init: {
        method: 'POST',
        data: { params: { deviceCode: 'D', dataItemLabel: null } },
      },
    })
    expect(list).toEqual([
      { deviceCode: 'D', pointId: '01', kpiId: 'k', displayName: 'n', pointName: undefined, unit: undefined },
    ])
  })

  it('posts threshold tags with dots not asterisks', async () => {
    const calls: unknown[] = []
    setTrendRequest(async (url, init) => {
      calls.push({ url, init })
      return {
        code: 200,
        result: [{ tag: 'D.01.k', enabled: '1', severity: 3, refValue1: 60 }],
      }
    })
    const marks = await fetchEnabledThresholds([
      { deviceCode: 'D', pointId: '01', kpiId: 'k' },
    ])
    expect(calls[0]).toMatchObject({
      url: '/api/threshold/customized/getThresholdListByCondition',
      init: {
        method: 'POST',
        data: { tags: ['D.01.k'] },
      },
    })
    expect(marks).toEqual([
      { itemKey: 'D*01*k', level: '危险', y: 60, label: '危险', triple: 'D·01·k', condition: '' },
    ])
  })
})
