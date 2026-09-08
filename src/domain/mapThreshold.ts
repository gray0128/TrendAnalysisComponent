import { itemKey, itemTriple } from './identity'
import type { TrendItemIdentity } from '../types'

export interface ThresholdMark {
  itemKey: string
  level: '危险' | '警告' | '注意'
  y: number
  label: string
  triple: string
  condition: string
}

/** 与 dosiv-v2 设备详情数据看板 THRESHOLD_CONDITION_LABELS 一致 */
const CONDITION_LABELS: Record<string, string> = {
  '01': '等于',
  '02': '不等于',
  '03': '大于',
  '04': '大于等于',
  '05': '小于',
  '06': '小于等于',
  '07': '介于',
  '08': '介于',
  '09': '上下限',
  '10': '上下限',
}

const OPEN_RANGE_CODES = new Set(['08', '10'])
const TWO_VALUE_CODES = new Set(['07', '08', '09', '10'])

function parseNumericValue(val: unknown): number | null {
  if (val == null || val === '') return null
  if (typeof val === 'number' && Number.isFinite(val)) return val
  const str = String(val).trim()
  if (!str || /^[-—–]+$/.test(str)) return null
  const match = str.match(/^[-+]?\d+(\.\d+)?/)
  if (match) {
    const num = Number(match[0])
    return Number.isFinite(num) ? num : null
  }
  const directNum = Number(str)
  return Number.isFinite(directNum) ? directNum : null
}

function isEnabled(row: any): boolean {
  return row?.enabled === '1' || row?.enabled === 1
}

function levelOf(row: any): ThresholdMark['level'] {
  const severity = Number(row?.severity)
  if (severity >= 4) return '危险'
  if (severity === 3) return '警告'
  return '注意'
}

function conditionCode(row: any): string {
  const raw = String(row?.ruleCondition ?? '').trim()
  return /^\d{1,2}$/.test(raw) ? raw.padStart(2, '0') : raw
}

function isTwoValue(row: any): boolean {
  const code = conditionCode(row)
  if (TWO_VALUE_CODES.has(code)) return true
  const texts = [row?.condition, row?.message, row?.ruleDesc, row?.title]
  return texts.some(t => {
    const s = String(t ?? '')
    return s.includes('介于') || s.includes('上下限')
  })
}

function formatRange(name: string, open: boolean, x: number | null, y: number | null): string {
  const openB = open ? '(' : '['
  const closeB = open ? ')' : ']'
  return `${name}${openB}${x == null ? 'X' : x},${y == null ? 'Y' : y}${closeB}`
}

function formatCondition(row: any, x: number | null, y: number | null): string {
  const code = conditionCode(row)
  const label = CONDITION_LABELS[code]
  if (label && TWO_VALUE_CODES.has(code)) {
    return formatRange(label, OPEN_RANGE_CODES.has(code), x, y)
  }
  if (label && x != null) return `${label} ${x}`
  const text = String(row?.message ?? row?.ruleDesc ?? row?.title ?? row?.condition ?? '').trim()
  if (text && (text.includes('介于') || text.includes('上下限'))) {
    return formatRange(text.includes('上下限') ? '上下限' : '介于', text.includes('('), x, y)
  }
  if (text && x != null) return `${text} ${x}`
  return label ?? ''
}

function pushMark(
  marks: ThresholdMark[],
  key: string,
  level: ThresholdMark['level'],
  rawY: unknown,
  triple: string,
  condition: string,
): void {
  const y = parseNumericValue(rawY)
  if (y == null) return
  marks.push({ itemKey: key, level, y, label: level, triple, condition })
}

export function mapThresholdRows(rows: any[] | undefined, item: TrendItemIdentity): ThresholdMark[] {
  const key = itemKey(item)
  const triple = itemTriple(item)
  const marks: ThresholdMark[] = []
  for (const row of rows ?? []) {
    if (!isEnabled(row)) continue
    const level = levelOf(row)
    if (isTwoValue(row)) {
      const x = parseNumericValue(row.refValue1)
      const y = parseNumericValue(row.refValue2)
      const condition = formatCondition(row, x, y)
      pushMark(marks, key, level, row.refValue1, triple, condition)
      pushMark(marks, key, level, row.refValue2, triple, condition)
    } else {
      const x = parseNumericValue(row.refValue1)
      const condition = formatCondition(row, x, null)
      pushMark(marks, key, level, row.refValue1, triple, condition)
    }
  }
  return marks
}
