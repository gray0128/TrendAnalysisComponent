import { createApp, reactive } from 'vue'
import TrendAnalysis from '../src/index'
import App from './App.vue'
import { mockRequest } from './mockRequest'
import { createLiveRequest } from './liveRequest'
import type { TrendRequest } from '../src/types'

export const debugAuth = reactive({
  mode: (localStorage.getItem('trend.debug.mode') || 'mock') as 'mock' | 'live',
  token: localStorage.getItem('trend.debug.token') || '',
  userId: localStorage.getItem('trend.debug.userId') || '',
})

const liveRequest = createLiveRequest(() => ({
  token: debugAuth.token,
  userId: debugAuth.userId,
}))

const request: TrendRequest = async (url, init) => {
  debugAuth.mode = (localStorage.getItem('trend.debug.mode') || debugAuth.mode) as 'mock' | 'live'
  debugAuth.token = localStorage.getItem('trend.debug.token') || debugAuth.token
  debugAuth.userId = localStorage.getItem('trend.debug.userId') || debugAuth.userId
  if (debugAuth.mode === 'live') return liveRequest(url, init)
  return mockRequest(url, init)
}

const app = createApp(App)
app.use(TrendAnalysis, { request })
app.mount('#app')
