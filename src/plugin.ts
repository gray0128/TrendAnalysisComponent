import { setTrendRequest } from './api/http'
import type { PluginOptions } from './types'

export function install(
  _app: { provide?: Function } | unknown,
  options: PluginOptions,
): void {
  setTrendRequest(options.request)
}

export default { install }
