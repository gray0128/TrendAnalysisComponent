# Task 3 Report: 数据项映射与信号过滤

## What you implemented

- Created `src/domain/mapDataItem.ts` with:
  - `mapKpiRowToIdentity(row, deviceCode, pointNo): TrendItemIdentity | null` — `signal === true` returns `null`
  - `mapAllDateList(allDateList, deviceCode): TrendItemIdentity[]` — flattens `AllDateList` point groups and drops nulls
- `kpiId` precedence: `collectKpiId` if present; else non-pure-digit `kpiId`; else `kpiCode`; else `String(row.kpiId ?? row.kpiCode ?? '')`
- Field mapping: `pointId` ← `row.pointNo ?? pointNo`; `displayName` ← `row.dataItemDisplayName ?? row.kpiId`; `pointName` / `unit` left `undefined`
- Created `tests/mapDataItem.test.ts`
- Did **not** re-export from `src/index.ts` (brief did not require it)

## What you tested and results

- `npm test` (vitest run) against mapDataItem + existing suites
- Final result: **5 test files passed, 9 tests passed**

## TDD Evidence

### RED

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 FAIL  tests/mapDataItem.test.ts [ tests/mapDataItem.test.ts ]
Error: Failed to resolve import "../src/domain/mapDataItem" from "tests/mapDataItem.test.ts". Does the file exist?
 Test Files  1 failed | 4 passed (5)
      Tests  7 passed (7)
EXIT:1
```

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/data-item-trend && npm test
```

Output (abridged):

```
 ✓ tests/mapDataItem.test.ts (2 tests) 2ms
 ✓ tests/types-smoke.test.ts (1 test) 1ms
 ✓ tests/identity.test.ts (1 test) 1ms
 ✓ tests/limits.test.ts (1 test) 1ms
 ✓ tests/time.test.ts (4 tests) 2ms
 Test Files  5 passed (5)
      Tests  9 passed (9)
EXIT:0
```

## Files changed

Created in `/Users/libo/Documents/gitlab/data-item-trend`:

- `src/domain/mapDataItem.ts`
- `tests/mapDataItem.test.ts`

Report only (dosiv-v2):

- `.superpowers/sdd/task-3-report.md`

## Commit

- `cc05ba9` feat: map device KPI rows and drop signal items

## Self-review findings

- Completeness: both Create files present; produces list covered (`mapKpiRowToIdentity`, `mapAllDateList`).
- Brief test locked verbatim; added collectKpiId-over-numeric-kpiId case as required.
- Signal filter is strict (`=== true`); non-boolean truthy values are kept.
- YAGNI: no index re-exports, no `pointName`/`unit` host mapping (test locks `undefined`), no extra row type.
- Commit used explicit paths (not `git add .`).

## Concerns

- Pure-digit `kpiId` without `collectKpiId` falls through to `kpiCode`, then to the digit string itself; only the collect-priority path is locked by tests.
- `displayName` uses raw `row.kpiId` as fallback (may be a number) rather than the resolved `kpiId`; matches brief expression, not host `String(...)`.
- `pointName` / `unit` are always `undefined` even when the host row carries them; intentional per brief expected object.
