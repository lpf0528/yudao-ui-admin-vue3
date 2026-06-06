/**
 * 销售订单状态枚举
 *
 * 与后端 ZcSalesOrderStatusEnum 保持一致，对应字典类型 zc_order_status
 * 注意：后端枚举序列化为小写字符串（如 CONFIRMED → 'confirmed'）
 */
export const ZcSalesOrderStatus = {
  /** 未确认：订单刚创建，尚未审核 */
  UNCONFIRMED: 'UNCONFIRMED',
  /** 已确认：订单已审核确认，进入生产流程 */
  CONFIRMED: 'CONFIRMED',
  /** 已打包：生产完成，已完成打包备货 */
  DABAO: 'DABAO',
  /** 已发货：货物已发出，等待客户签收 */
  FAHUO: 'FAHUO',
} as const

export type ZcSalesOrderStatusType = (typeof ZcSalesOrderStatus)[keyof typeof ZcSalesOrderStatus]
