import request from '@/config/axios'

/** 成品订单-用料明细信息 */
export interface ZCSalesOrderMaterial {
  id: number // 主键
  orderId?: number // 销售单
  orderNo?: string // 销售单号
  customerId?: number // 客户编号
  customerName?: string // 客户名称
  orderStructureId?: number // 结构行
  elementId: number // 组件类型
  elementName?: string // 组件类型名称
  productId?: number // 货号
  productName?: string // 产品名称
  versionId?: number // 产品版本编号
  batchId: number // 批次
  batchNo?: string // 批次号
  spec?: string // 规格
  price: number // 单价
  quantity: number // 用料
  unitValue: string // 单位
  discountRate: number // 折扣率
  amount: number // 小计
  note: string // 备注
  status?: string // 配料状态：NOT_PEILIAO=未配料，HAVE_PEILIAO=已配料
  cutQuantity?: number // 裁剪数量
  createTime?: string // 创建时间
  updateTime?: string // 更新时间
}

/** 用料明细分页响应（含用料合计、金额合计） */
export interface ZCSalesOrderMaterialPageRespVO {
  total: number // 总量
  list: ZCSalesOrderMaterial[] // 数据
  totalQuantity: number // 用料合计（当前筛选条件下全量求和）
  totalAmount: number // 金额合计（当前筛选条件下全量求和）
}

// 成品订单-用料明细 API
export const ZCSalesOrderMaterialApi = {
  // 查询成品订单-用料明细分页（含用料合计、金额合计），对应后端：GET /zc/sales-order-material/page
  getZCSalesOrderMaterialPage: async (params: any) => {
    return await request.get({ url: `/zc/sales-order-material/page`, params })
  },

  // 查询成品订单-用料明细详情，对应后端：GET /zc/sales-order-material/get
  getZCSalesOrderMaterial: async (id: number) => {
    return await request.get({ url: `/zc/sales-order-material/get?id=` + id })
  },

  // 导出成品订单-用料明细 Excel，对应后端：GET /zc/sales-order-material/export-excel
  exportZCSalesOrderMaterial: async (params) => {
    return await request.download({ url: `/zc/sales-order-material/export-excel`, params })
  }
}
