### Task 10: 阈值开关、主题、外壳、插件导出

**Files:**
- Create: `src/styles/tokens.css`（从 dosiv-v2 `src/views/wgMyDevice/styles/tokens.css` 复制三套变量，选择器改为 `.dit-root` / `.dit-root[data-theme='…']`，不要用 `:root` 以免污染宿主）
- Create: `src/components/TrendDrawer.vue`
- Create: `src/components/TrendModal.vue`
- Modify: `src/components/TrendPanel.vue`（根节点 `class="dit-root"` `:data-theme="resolvedTheme"`）
- Modify: `src/plugin.ts`、`src/index.ts`
- Create: `tests/theme.test.ts`

**Interfaces:**
- Consumes: `Theme`、`THEMES`
- Produces: `resolveTheme(prop, htmlDataset): Theme`；未传且 html 不是三套之一时返回 `remote-blue`

- [ ] **Step 1: 写失败测试**

`resolveTheme(undefined, 'light') === 'light'`；`resolveTheme(undefined, 'foo') === 'remote-blue'`。开关从关到开后 `fetchEnabledThresholds` 调用 1 次；再关掉不增加调用。

- [ ] **Step 2–4: 实现**

`TrendDrawer`：右侧 `aside` + 遮罩，emit `close`。`TrendModal`：居中层。两者内部渲染 `TrendPanel` 并透传 props。

`index.ts` 导出组件、`install`、`resolveTheme`。

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add theme tokens, threshold toggle, and optional shells"
```

---

