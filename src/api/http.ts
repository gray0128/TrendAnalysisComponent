import type { TrendRequest } from '../types'

const NOT_INSTALLED = 'data-item-trend: request is not installed'

let installed: TrendRequest | undefined

export function setTrendRequest(fn: TrendRequest | undefined): void {
  installed = fn
}

export function getTrendRequest(): TrendRequest {
  if (!installed) {
    throw new Error(NOT_INSTALLED)
  }
  return installed
}
