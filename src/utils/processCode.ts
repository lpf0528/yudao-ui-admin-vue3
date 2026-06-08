/**
 * 工序编码工具：生成和验证加工单二维码编码
 * 格式：{orderNo}-{ST|CU}{id三位}-{校验位}
 * 示例：CP12026060800001-ST001-7
 */

/** 计算校验位（加权求和 mod 11 mod 10，结果为个位数） */
function calcCheckDigit(code: string): number {
  const chars = code.replace(/-/g, '')
  const sum = chars.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 2), 0)
  return (sum % 11) % 10
}

export interface ProcessCodeResult {
  orderNo: string
  type: 'ST' | 'CU'
  id: number
}

/**
 * 验证完整编码，成功返回解析结果，失败返回 null
 * @param code 完整编码，如 'CP12026060800001-ST001-7'
 */
export function verifyProcessCode(code: string): ProcessCodeResult | null {
  const lastDash = code.lastIndexOf('-')
  if (lastDash === -1) return null
  const base = code.slice(0, lastDash)
  const check = Number(code.slice(lastDash + 1))
  if (Number.isNaN(check) || calcCheckDigit(base) !== check) return null

  const match = base.match(/^(.+)-(ST|CU)(\d+)$/)
  if (!match) return null
  return {
    orderNo: match[1],
    type: match[2] as 'ST' | 'CU',
    id: Number(match[3])
  }
}

/**
 * 生成工序编码（订单号 + 类型ID + 校验位）
 * @param orderNo 订单号，如 'CP12026060800001'
 * @param type    类型前缀：'ST'（结构）| 'CU'（窗帘）
 * @param id      序号
 * @returns 完整编码，如 'CP12026060800001-ST001-7'
 */
export function genProcessCode(orderNo: string, type: 'ST' | 'CU', id: number): string {
  const base = `${orderNo}-${type}${String(id).padStart(3, '0')}`
  const check = calcCheckDigit(base)
  return `${base}-${check}`
}
