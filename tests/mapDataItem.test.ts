import { describe, expect, it } from 'vitest'
import { mapAllDateList, mapKpiRowToIdentity } from '../src/domain/mapDataItem'

describe('mapDataItem', () => {
  it('drops signal rows and keeps collect identity', () => {
    const list = mapAllDateList({
      '01': [
        { kpiId: 'RMS', dataItemDisplayName: '速度有效值', signal: false, pointNo: '01', pointName: '测点01' },
        { kpiId: 'WAVE', signal: true, pointNo: '01', pointName: '测点01' },
      ],
    }, 'DEV01')
    expect(list).toEqual([
      { deviceCode: 'DEV01', pointId: '01', kpiId: 'RMS', displayName: '速度有效值', pointName: '测点01', unit: undefined },
    ])
  })

  it('prefers collectKpiId over numeric kpiId', () => {
    const identity = mapKpiRowToIdentity(
      { kpiId: '12345', collectKpiId: 'VEL_RMS', dataItemDisplayName: '速度', signal: false, pointNo: '02' },
      'DEV01',
      '02',
    )
    expect(identity).toEqual({
      deviceCode: 'DEV01',
      pointId: '02',
      kpiId: 'VEL_RMS',
      displayName: '速度',
      pointName: undefined,
      unit: undefined,
    })
  })
})
