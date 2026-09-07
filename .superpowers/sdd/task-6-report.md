# Task 6 Report: 注入 request 与三条 API

## What you implemented

- Created `src/api/http.ts` with `setTrendRequest(fn)` / `getTrendRequest()`
- Created `src/api/dataItems.ts` with `fetchDeviceDataItems(deviceCode)`
- Created `src/api/trend.ts` with `fetchAggregateTrend(item, startTimeMs, endTimeMs)`
- Created `src/api/thresholds.ts` with `fetchEnabledThresholds(items)`
- Created `src/plugin.ts` with `install(app, { request })` calling `setTrendRequest`
- Created `tests/api.test.ts`
- Uninstalled request throws `data-item-trend: request is not installed`
- Paths (verbatim):
  - `/dosis/service/ISDV01/getKpiValueListByBusFilterDoGet`
  - `/iehm-cloud/api/v1/busout/timeSeriesService/getAutoAggregateDataListByCondition`
  - `/api/threshold/customized/getThresholdListByCondition`
- Bodies:
  - data-item list: `{ params: { deviceCode, dataItemLabel: null } }`
  - busout: unwrapped `{ startTimeMS, endTimeMS, aggregateFunc, reserveDecimal, deviceCode, pointId, kpiId }` using `AGGREGATE_FUNC` / `RESERVE_DECIMAL`
  - threshold: `{ tags: ['deviceCode.pointId.kpiId'] }` (dots, not asterisks)
- `fetchDeviceDataItems` maps `AllDateList` via `mapAllDateList`
- `fetchEnabledThresholds` maps rows via `mapThresholdRows`, grouping by tag / `deviceCode.pointId.kpiId|kpiCode`
- Did **not** re-export from `src/index.ts` (brief did not require it)

## What you tested and results

- `npm test` (vitest run) against api + existing suites
- Final result: **8 test files passed, 23 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 FAIL  tests/api.test.ts [ tests/api.test.ts ]
Error: Failed to resolve import "../src/api/http" from "tests/api.test.ts". Does the file exist?
 Test Files  1 failed | 7 passed (8)
      Tests  18 passed (18)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/api.test.ts (5 tests) 4ms
 ✓ tests/chartOption.test.ts (4 tests) 3ms
 ✓ tests/mapThreshold.test.ts (5 tests) 3ms
 ✓ tests/time.test.ts (4 tests) 2ms
 ✓ tests/mapDataItem.test.ts (2 tests) 2ms
 ✓ tests/limits.test.ts (1 test) 2ms
 ✓ tests/types-smoke.test.ts (1 test) 1ms
 ✓ tests/identity.test.ts (1 test) 1ms
 Test Files  8 passed (8)
      Tests  23 passed (23)
EXIT:0
```

## Files changed

Created in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/api/http.ts`
- `src/api/dataItems.ts`
- `src/api/trend.ts`
- `src/api/thresholds.ts`
- `src/plugin.ts`
- `tests/api.test.ts`

Report only (dosiv-v2):

- `.superpowers/sdd/task-6-report.md`

## Commit

- `9436fcd` feat: add injected request client for three trend APIs

## Self-review findings

- Completeness: all six Create files present; produces list covered.
- Brief busout test locked verbatim; added data-item params body, threshold dots tags, uninstalled throw, and install → setTrendRequest.
- Mapping tests lock `mapAllDateList` (drops `signal: true`) and `mapThresholdRows` (enabled danger mark).
- `install` types `app` as `{ provide?: Function } | unknown`; does not call `provide`.
- YAGNI: no index re-exports, no per-item threshold requests, no axios/token headers.
- Commit used explicit paths (not `git add .`).

## Concerns

- `setTrendRequest` accepts `undefined` so tests can uninstall; public produce list only mentioned `setTrendRequest(fn)`.
- `AllDateList` extraction covers `data.result` / `result` / top-level; other wrappers would map to empty list.
- Threshold row grouping requires `tag` or `deviceCode.pointId.kpiId|kpiCode`; unidentified rows are dropped when multiple items are requested.
- `fetchAggregateTrend` returns the raw payload; parsing stays in `parseAggregateData`.
