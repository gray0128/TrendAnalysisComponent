# Task 11 Report: dosiv-v2 安装与 request 适配

## What you implemented

Package (`/Users/libo/Documents/gitlab/data-item-trend`):

- Modified `src/index.ts`：在已有 `tokens.css` 之外增加 `import './styles/panel.css'`，让 library build 打出样式。
- Modified `vite.config.ts`：`build.lib.cssFileName: 'style'`，产物为 `dist/style.css`，匹配 `package.json` 的 `"./style.css"` export。

Host (`/Users/libo/Documents/gitlab/dosiv-v2`):

- Modified `package.json`：`"data-item-trend": "file:../data-item-trend"`。
- Created `src/views/wgMyDevice/adapters/dataItemTrendRequest.ts`
  - 导出纯函数 `headersForUrl(url, token, userId)`（brief 原文）
  - `createDataItemTrendRequest()`：`axios({ url, method, data, headers })`，返回 `response.data`，走 vite proxy
  - token / userId 来自 `@/utils/local-storage` 的 `getToken` / `getUserId`
- Modified `src/main.ts`：`import DataItemTrend from 'data-item-trend'`、`import 'data-item-trend/style.css'`，在 `app.mount` 前 `app.use(DataItemTrend, { request: createDataItemTrendRequest() })`

未改 `openDdsatAnalyze`（Task 12）。未引入 ant-design-vue 用于本任务。

## What you tested and results

- 包：`npm run build` 产出 `dist/style.css`（11.51 kB）、`dist/index.js`、`dist/index.cjs`、`dist/index.d.ts`
- 宿主：`npm install` 后 `npm ls data-item-trend` → `data-item-trend@0.1.0 -> ./../data-item-trend`
- 宿主：`npm run lint:tsc` 通过（exit 0）
- 宿主：`npx eslint src/main.ts src/views/wgMyDevice/adapters/dataItemTrendRequest.ts` 通过
- 提交钩子：lint-staged typecheck + eslint --fix 通过

## TDD Evidence

本任务 brief 将单测改为安装验收（dosiv-v2 无 vitest，不引入 node --experimental-vm-modules）。

### RED

无失败测试。`headersForUrl` 按 brief 原文写入适配文件并导出；验收命令为 `npm ls data-item-trend`。

### GREEN

Command:

```bash
cd /Users/libo/Documents/gitlab/dosiv-v2 && npm ls data-item-trend && npm run lint:tsc
```

Output (abridged):

```
dosiv-v2@0.0.0 /Users/libo/Documents/gitlab/dosiv-v2
└── data-item-trend@0.1.0 -> ./../data-item-trend

> dosiv-v2@0.0.0 lint:tsc
> vue-tsc --noEmit -p tsconfig.app.json

EXIT:0
```

Covered:

1. file 依赖可解析
2. `headersForUrl` 已导出：`/api/threshold` → `token`；其它 → `x-token`；`/iehm-cloud/api/v1/busout` 另加 `Xplat-Token`；一律带 `userId`
3. 插件在 mount 前注入 `request`

## Files changed

Package:

- `src/index.ts`
- `vite.config.ts`

Host:

- `package.json`
- `package-lock.json`
- `src/main.ts`
- `src/views/wgMyDevice/adapters/dataItemTrendRequest.ts`

Report only (dosiv-v2，未提交):

- `.superpowers/sdd/task-11-report.md`

## Commit

- Package `44388e0` fix: emit package styles from index
- Host `6cee43b` feat: install data-item-trend and inject proxied request

## Self-review findings

- Completeness: 指定 Create/Modify 文件齐全；`app.use` 在 `mount` 前；样式走 `data-item-trend/style.css`；request 用裸 axios 而非 `dosisRequest` / `ddslpRequest`。
- 未替换诊断分析跳转。
- YAGNI：未合并 `init.headers`；未再包一层拦截器。
- 包 `dist/` 未提交；本地 `file:` 软链依赖已构建的 dist。

## Concerns

- 包仓库 `dist/` 未入库。新 clone 需在 `data-item-trend` 先 `npm run build`，否则宿主解析不到 `dist/index.js` / `style.css`。
- Vite 对混合 default/named export 有 `MIXED_EXPORTS` 警告；当前 ESM 默认导入拿到 `{ install }`，CJS 消费者可能要 `.default`。
- Interfaces 写 `/iehm-cloud` 同时设 `Xplat-Token`，实现按 brief 函数只对 `/iehm-cloud/api/v1/busout` 加该头。
- `headersForUrl` 无单测；空 token / 空 userId 仍会写入对应头。
- `axios` 返回 `response.data`；包内解析同时兼容 body 与 `{ data: body }`。
