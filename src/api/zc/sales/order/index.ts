import request from '@/config/axios'

/** 与后端 ZcSalesOrderSaveReqVO 对齐（字段驼峰） */
export interface ZcSalesOrderSaveVO {
  id?: number
  customerId: number
  mobile?: string
  brandId?: number
  category?: string
  orderDate: string
  logisticId?: number
  receiver?: string
  deliveryAddress: string
  freight?: number
  types: string
  amount?: number
  deliveryDate?: string
  isExpedited?: boolean
  note?: string
  curtains?: ZcCurtainLineVO[]
  fabricLines?: ZcFabricLineVO[]
}

export interface ZcFabricLineVO {
  id?: number
  productId?: number
  batchId?: number
  quantity?: number
  price?: number
  amount?: number
  discountRate?: number
  note?: string
}

export interface ZcCurtainLineVO {
  id?: number
  curtainId?: number
  room?: string
  pleatRatioValue?: number
  discountRate?: number
  amount?: number
  image1?: string
  image2?: string
  mountings?: string
  note?: string
  structures?: ZcStructureVO[]
}

export interface ZcStructureVO {
  id?: number
  structureId?: number
  height?: number
  width?: number
  leftCorner?: string
  rightCorner?: string
  pasteDirection?: string
  installProcessId?: number
  openMethod?: string
  processType?: string
  /** 对应库字段 is_shaping */
  isShaping?: boolean
  pleatsNum?: number
  pleatsDistance?: number
  skirtHeight?: number
  note?: string
  elements?: ZcElementVO[]
}

export interface ZcElementVO {
  id?: number
  elementId?: number
  productId?: number
  batchId?: number
  price?: number
  quantity?: number
  /** 用料单位展示值，对应 unit_value */
  unitValue?: string
  discountRate?: number
  amount?: number
  note?: string
}

export const ZcSalesOrderApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/sales-order/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/sales-order/get?id=` + id })
  },
  create: async (data: ZcSalesOrderSaveVO) => {
    return await request.post({ url: `/zc/sales-order/create`, data })
  },
  update: async (data: ZcSalesOrderSaveVO) => {
    return await request.put({ url: `/zc/sales-order/update`, data })
  },
  delete: async (id: number) => {
    return await request.delete({ url: `/zc/sales-order/delete?id=` + id })
  },
  confirm: async (id: number) => {
    return await request.put({ url: `/zc/sales-order/confirm?id=` + id })
  },
  cancelConfirm: async (id: number) => {
    return await request.put({ url: `/zc/sales-order/cancel-confirm?id=` + id })
  }
}
