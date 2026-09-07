import type { TrendRequest } from '../src/types'

export function headersForUrl(url: string, token: string, userId: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (userId) headers.userId = userId
  if (url.startsWith('/api/threshold')) {
    if (token) headers.token = token
  }
  else if (token) {
    headers['x-token'] = token
  }
  if (url.startsWith('/iehm-cloud/api/v1/busout') && token) {
    headers['Xplat-Token'] = token
  }
  return headers
}

export function createLiveRequest(getAuth: () => { token: string; userId: string }): TrendRequest {
  return async (url, init) => {
    const { token, userId } = getAuth()
    const response = await fetch(url, {
      method: init.method ?? 'POST',
      headers: { ...headersForUrl(url, token, userId), ...init.headers },
      body: init.data != null ? JSON.stringify(init.data) : undefined,
    })
    return response.json()
  }
}
