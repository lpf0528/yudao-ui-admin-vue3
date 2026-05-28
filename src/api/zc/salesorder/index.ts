import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘用料（结构下的组件用料） */
export interface ZCSalesOrderMaterial {
  id?: number               // 主键
  orderId?: number          // 所属订单 ID
  orderStructureId?: number // 所属订单结构 ID
  elementId?: number        // 组件类型 ID
  productId?: number        // 货号（产品 ID）
  batchId?: number          // 批次 ID
  price?: number            // 单价
  quantity?: number         // 用料数量
  unitValue?: string        // 计量单位（展示值）
  discountRate?: number     // 折扣率
  amount?: number           // 小计金额
  note?: string             // 备注
  // —— 仅展示用（后端返回，前端不回传）
  elementName?: string      // 组件类型名称
  productName?: string      // 货号名称
  batchNo?: string          // 批次号
}

/** 窗帘行信息 */
export interface SalesOrderCurtain {
  id?: number
  orderId?: number
  curtainId?: number
  room?: string
  pleatRatioValue?: string | number
  pleatsDistance?: number
  discountRate?: number
  amount?: number
  image1?: string
  image2?: string
  /** 配件，前端用数组；后端可能返回 JSON 字符串，需手动 parse */
  mountings?: string[]
  note?: string
  /** 仅展示用 */
  curtainName?: string
}
/** 窗帘结构信息 */
export interface SalesOrderStructure {
  id?: number
  orderId?: number
  orderCurtainId?: number
  structureId?: number
  height?: number
  width?: number
  leftCorner?: string
  rightCorner?: string
  pasteDirection?: string
  installProcessId?: number
  openMethod?: string
  processType?: string
  /** 对应库字段 is_shaping，与后端保持驼峰命名 */
  isShaping?: boolean
  pleatsNum?: number
  pleatsDistance?: number
  skirtHeight?: number
  note?: string
  /** 仅展示用 */
  structureName?: string
  installProcessName?: string
}

/** 销售订单信息 */
export interface SalesOrder {
  id?: number                          // 主键
  orderNo?: string                     // 订单号
  customerId?: number                  // 客户 ID
  mobile?: string                      // 手机
  brandId?: number                     // 品牌
  orderDate?: string | Dayjs           // 下单日期
  logisticId?: number                  // 物流
  receiver?: string                    // 收货人
  deliveryAddress?: string             // 送货地址
  freight?: number                     // 运费
  types?: string                       // 订单类型
  discountAmount?: number              // 优惠金额
  totalAmount?: number                 // 总金额
  amount?: number                      // 实际应收金额（总金额 - 优惠）
  amountReceived?: number              // 已收金额
  deliveryDate?: string | Dayjs        // 交付日期
  payStatus?: string                   // 结算状态
  status?: string                      // 状态
  confirmTime?: string | Dayjs | number// 确认时间
  isExpedited?: boolean                // 是否加急
  note?: string                        // 备注
  // —— 仅展示用
  customerName?: string
  logisticName?: string
  creatorName?: string
  createTime?: number
}

/** 销售订单详情：窗帘 → 结构 → 用料 三层嵌套 */
export interface SalesOrderDetailCurtain extends SalesOrderCurtain {
  structures?: (SalesOrderStructure & { materials?: ZCSalesOrderMaterial[] })[]
}

// 销售订单 API
export const SalesOrderApi = {
  // 查询销售订单分页
  getSalesOrderPage: async (params: any) => {
    return await request.get({ url: `/zc/sales-order/page`, params })
  },

  // 查询销售订单详情
  getSalesOrder: async (id: number) => {
    return await request.get({ url: `/zc/sales-order/get?id=` + id })
  },

  /**
   * 查询销售订单的全量明细（窗帘 → 结构 → 用料 三层嵌套）
   * 对应后端：GET /zc/sales-order/detail?orderId=xxx
   */
  getSalesOrderDetail: async (orderId: number): Promise<SalesOrderDetailCurtain[]> => {
    return await request.get({ url: `/zc/sales-order/detail`, params: { orderId } })
  },

  // 新增销售订单
  createSalesOrder: async (data: SalesOrder) => {
    return await request.post({ url: `/zc/sales-order/create`, data })
  },

  // 修改销售订单
  updateSalesOrder: async (data: SalesOrder) => {
    return await request.put({ url: `/zc/sales-order/update`, data })
  },

  // 删除销售订单
  deleteSalesOrder: async (id: number) => {
    return await request.delete({ url: `/zc/sales-order/delete?id=` + id })
  },

  /** 批量删除销售订单 */
  deleteSalesOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/sales-order/delete-list?ids=${ids.join(',')}` })
  },

  /**
   * 确认销售订单（状态 unconfirmed → confirmed，扣减客户余额）
   * 对应后端：PUT /zc/sales-order/confirm?id=xxx
   *
   * @param id 销售订单 ID
   * @returns 是否成功
   */
  confirmSalesOrder: async (id: number) => {
    return await request.put({ url: `/zc/sales-order/confirm`, params: { id } })
  },

  /**
   * 取消确认销售订单（状态 confirmed → unconfirmed，退回客户余额）
   * 对应后端：PUT /zc/sales-order/cancel-confirm?id=xxx
   *
   * @param id 销售订单 ID
   * @returns 是否成功
   */
  cancelConfirmSalesOrder: async (id: number) => {
    return await request.put({ url: `/zc/sales-order/cancel-confirm`, params: { id } })
  },

  /**
   * 标记销售订单为加急
   * 对应后端：PUT /zc/sales-order/expedited?orderId=xxx
   *
   * @param orderId 销售订单 ID
   * @returns 是否成功
   */
  expeditedSalesOrder: async (orderId: number) => {
    return await request.put({ url: `/zc/sales-order/expedited`, params: { orderId } })
  },

  // 导出销售订单 Excel
  exportSalesOrder: async (params) => {
    return await request.download({ url: `/zc/sales-order/export-excel`, params })
  },

  /**
   * 导出销售订单 PDF（含全量明细：窗帘行→结构行→用料明细）
   * 对应后端：GET /zc/sales-order/export-pdf
   *
   * @param id 销售订单 ID
   * @returns PDF 文件 Blob
   */
  exportSalesOrderPdf: async (id: number): Promise<Blob> => {
    return await request.download({ url: `/zc/sales-order/export-pdf`, params: { id } })
  }
}

// ======================== 面料单 ========================

/** 面料单 - 批次行提交结构（与后端字段名一致） */
export interface SalesOrderProductBatch {
  productId?: number    // 产品 ID
  batchId?: number      // 批次 ID
  quantity?: number     // 数量
  price?: number        // 单价
  amount?: number       // 金额
  note?: string         // 备注
}

/** 面料单提交/响应数据结构 */
export interface SalesOrderProductVO {
  id?: number
  orderNo?: string
  customerId?: number
  mobile?: string
  brandId?: number
  orderDate?: string
  logisticId?: number
  receiver?: string
  deliveryAddress?: string
  freight?: number
  types?: string
  discountAmount?: number
  amount?: number
  deliveryDate?: string
  payStatus?: string
  status?: string
  confirmTime?: string | number
  isExpedited?: boolean
  note?: string
  batchs: SalesOrderProductBatch[]
  customerName?: string
  logisticName?: string
}

export const SalesOrderProductApi = {
  /**
   * 查询面料单详情（含批次列表）
   * 对应后端：GET /zc/sales-order-product/get?id=xxx
   */
  getSalesOrderProduct: async (id: number) => {
    return await request.get({ url: `/zc/sales-order-product/get?id=` + id })
  },

  /**
   * 新增面料单
   * 对应后端：POST /zc/sales-order-product/create
   */
  createSalesOrderProduct: async (data: SalesOrderProductVO) => {
    return await request.post({ url: `/zc/sales-order-product/create`, data })
  },

  /**
   * 修改面料单
   * 对应后端：PUT /zc/sales-order-product/update
   */
  updateSalesOrderProduct: async (data: SalesOrderProductVO) => {
    return await request.put({ url: `/zc/sales-order-product/update`, data })
  },

  /**
   * 确认面料单（状态 unconfirmed → confirmed）
   * 对应后端：PUT /zc/sales-order-product/confirm?id=xxx
   */
  confirmSalesOrderProduct: async (id: number) => {
    return await request.put({ url: `/zc/sales-order-product/confirm`, params: { id } })
  },

  /**
   * 取消确认面料单
   * 对应后端：PUT /zc/sales-order-product/cancel-confirm?id=xxx
   */
  cancelConfirmSalesOrderProduct: async (id: number) => {
    return await request.put({ url: `/zc/sales-order-product/cancel-confirm`, params: { id } })
  },

  /**
   * 标记面料单为加急
   * 对应后端：PUT /zc/sales-order-product/expedited?orderId=xxx
   */
  expeditedSalesOrderProduct: async (orderId: number) => {
    return await request.put({ url: `/zc/sales-order-product/expedited`, params: { orderId } })
  },
}
