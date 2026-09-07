### Task 1: 脚手架与导出入口

**Files:**
- Create: `/Users/libo/Documents/gitlab/data-item-trend/package.json`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/vite.config.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/tsconfig.json`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/vitest.config.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/src/index.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/src/types.ts`
- Create: `/Users/libo/Documents/gitlab/data-item-trend/tests/types-smoke.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: `Theme`、`TrendItemIdentity`、`TrendLoadInput`、`PickerInput`、`TrendRequest`、`MAX_TREND_SERIES`

- [ ] **Step 1: 初始化仓库与 package.json**

```bash
mkdir -p /Users/libo/Documents/gitlab/data-item-trend
cd /Users/libo/Documents/gitlab/data-item-trend
git init
```

`package.json`：

```json
{
  "name": "data-item-trend",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.5.0"
  },
  "dependencies": {
    "echarts": "^6.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.8",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^26.1.0",
    "typescript": "~5.9.0",
    "vite": "^8.2.0",
    "vite-plugin-dts": "^4.5.0",
    "vitest": "^3.2.0",
    "vue": "^3.5.40"
  },
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: 写入 types.ts**

```ts
export type Theme = 'dark' | 'light' | 'remote-blue'

export const THEMES: readonly Theme[] = ['dark', 'light', 'remote-blue']
export const MAX_TREND_SERIES = 8
export const DEFAULT_WINDOW_MS = 2 * 60 * 60 * 1000
export const AGGREGATE_FUNC = 2
export const RESERVE_DECIMAL = 3

export interface TrendItemIdentity {
  deviceCode: string
  pointId: string
  kpiId: string
  displayName?: string
  pointName?: string
  unit?: string
}

export interface TrendLoadInput {
  items: TrendItemIdentity[]
  startTimeMs?: number
  endTimeMs?: number
}

export type PickerInput =
  | { type: 'device'; deviceCode: string; deviceName?: string }
  | { type: 'items'; items: TrendItemIdentity[] }

export interface TrendRequest {
  (url: string, init: { method?: 'GET' | 'POST'; data?: unknown; headers?: Record<string, string> }): Promise<unknown>
}

export interface PluginOptions {
  request: TrendRequest
}
```

`src/index.ts` 先只导出类型与常量：

```ts
export {
  THEMES, MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC, RESERVE_DECIMAL,
} from './types'
export type {
  Theme, TrendItemIdentity, TrendLoadInput, PickerInput, TrendRequest, PluginOptions,
} from './types'
```

- [ ] **Step 3: 写失败测试（常量存在）**

```ts
import { describe, expect, it } from 'vitest'
import { MAX_TREND_SERIES, DEFAULT_WINDOW_MS, AGGREGATE_FUNC } from '../src/types'

describe('package constants', () => {
  it('caps series at 8 and defaults window to 2 hours with max aggregate', () => {
    expect(MAX_TREND_SERIES).toBe(8)
    expect(DEFAULT_WINDOW_MS).toBe(2 * 60 * 60 * 1000)
    expect(AGGREGATE_FUNC).toBe(2)
  })
})
```

- [ ] **Step 4: 配置 vitest 并跑通**

`vitest.config.ts`：`environment: 'jsdom'`，`include: ['tests/**/*.test.ts']`。

Run: `cd /Users/libo/Documents/gitlab/data-item-trend && npm test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold data-item-trend package"
```

---

