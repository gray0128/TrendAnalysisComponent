import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { fileURLToPath, URL } from 'node:url'

/** 本地开发后端。切换环境只改这一处。 */
const PROXY_TARGET = 'http://10.26.105.180:5016'

function proxyAll(contexts: string[]) {
  return Object.fromEntries(
    contexts.map(context => [context, { target: PROXY_TARGET, changeOrigin: true }]),
  )
}

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [vue()],
      root: fileURLToPath(new URL('./playground', import.meta.url)),
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
      },
      server: {
        port: 5177,
        proxy: proxyAll([
          '/api/threshold',
          '/dosis',
          '/ddslp',
          '/iehm-cloud',
        ]),
      },
    }
  }

  return {
    plugins: [
      vue(),
      dts({ include: ['src'] }),
    ],
    build: {
      lib: {
        entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        name: 'DataItemTrend',
        fileName: 'index',
        cssFileName: 'style',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['vue', 'echarts'],
      },
    },
  }
})
