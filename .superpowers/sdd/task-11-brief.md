### Task 11: dosiv-v2 安装与 request 适配

**Files:**
- Modify: `/Users/libo/Documents/gitlab/dosiv-v2/package.json`
- Create: `/Users/libo/Documents/gitlab/dosiv-v2/src/views/wgMyDevice/adapters/dataItemTrendRequest.ts`
- Modify: `/Users/libo/Documents/gitlab/dosiv-v2/src/main.ts`

**Interfaces:**
- Consumes: 包的 `install` / `TrendRequest`
- Produces: 按 URL 前缀选头：`/iehm-cloud` → `x-token` 且同时设 `Xplat-Token`；`/api/threshold` → `token`；`/dosis` → `x-token`。一律带 `userId`。

- [ ] **Step 1: 写失败测试（若 dosiv-v2 无 vitest，用最小 node 脚本或把适配函数写成纯函数并在包外用现有 eslint 无测试则改为本任务在 data-item-trend 增加 `tests/hostHeaders.test.ts` 复制同一纯函数）**

将选头逻辑做成纯函数 `headersForUrl(url, token, userId)` 放在适配文件并导出，测试写在包的 `tests/hostHeaders.test.ts` 中复制断言（或抽到包的 `src/api/headers.ts` 仅作文档）。**选定：纯函数放 dosiv-v2 适配文件，测试放包内一份相同实现的单测不现实。改为在 dosiv-v2 适配文件顶部导出 `headersForUrl`，本任务用 node --experimental-vm-modules 不引入。验收改为手动：`npm ls data-item-trend` 能解析 file 依赖。**

实现 `headersForUrl`：

```ts
export function headersForUrl(url: string, token: string, userId: string): Record<string, string> {
  const headers: Record<string, string> = { userId }
  if (url.startsWith('/api/threshold')) headers.token = token
  else headers['x-token'] = token
  if (url.startsWith('/iehm-cloud/api/v1/busout')) headers['Xplat-Token'] = token
  return headers
}
```

- [ ] **Step 2: package.json 增加** `"data-item-trend": "file:../data-item-trend"`，执行 `npm install`。

- [ ] **Step 3: main.ts 在 `app.mount` 前：**

```ts
import DataItemTrend from 'data-item-trend'
import 'data-item-trend/style.css'
import { createDataItemTrendRequest } from '@/views/wgMyDevice/adapters/dataItemTrendRequest'

app.use(DataItemTrend, { request: createDataItemTrendRequest() })
```

`createDataItemTrendRequest` 用现有 axios 或三个已有实例（`dosisRequest` / `ddslpRequest` 不直接用，统一 `axios({ url, method, data, headers })` 走 vite proxy）。

- [ ] **Step 4: `npm run lint:tsc` 通过**

- [ ] **Step 5: Commit（dosiv-v2）**

```bash
git add package.json package-lock.json src/main.ts src/views/wgMyDevice/adapters/dataItemTrendRequest.ts
git commit -m "feat: install data-item-trend and inject proxied request"
```

---

