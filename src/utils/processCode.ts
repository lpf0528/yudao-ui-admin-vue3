/**
 * 工序编码工具：生成和验证加工单二维码编码
 * 格式：{orderNo}-C{curtainId三位}-S{structureId三位}-{校验位}
 * 示例：CP12026060800001-C001-S002-5
 */

/** 计算校验位（加权求和 mod 11 mod 10，结果为个位数） */
function calcCheckDigit(code: string): number {
  const chars = code.replace(/-/g, '')
  const sum = chars.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 2), 0)
  return (sum % 11) % 10
}

export interface ProcessCodeResult {
  orderNo: string
  curtainId: number
  structureId: number
}

/**
 * 验证完整编码，成功返回解析结果，失败返回 null
 * @param code 完整编码，如 'CP12026060800001-C001-S002-5'
 */
export function verifyProcessCode(code: string): ProcessCodeResult | null {
  const lastDash = code.lastIndexOf('-')
  if (lastDash === -1) return null
  const base = code.slice(0, lastDash)
  const check = Number(code.slice(lastDash + 1))
  if (Number.isNaN(check) || calcCheckDigit(base) !== check) return null

  const match = base.match(/^(.+)-C(\d+)-S(\d+)$/)
  if (!match) return null
  return {
    orderNo: match[1],
    curtainId: Number(match[2]),
    structureId: Number(match[3])
  }
}

/**
 * 生成工序编码（订单号 + 窗帘ID + 结构ID + 校验位）
 * @param orderNo     订单号，如 'CP12026060800001'
 * @param curtainId   窗帘序号
 * @param structureId 结构序号
 * @returns 完整编码，如 'CP12026060800001-C001-S002-5'
 */
export function genProcessCode(orderNo: string, curtainId: number, structureId: number): string {
  const base = `${orderNo}-C${String(curtainId).padStart(3, '0')}-S${String(structureId).padStart(3, '0')}`
  const check = calcCheckDigit(base)
  return `${base}-${check}`
}
