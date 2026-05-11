import request from '@/config/axios'

export interface ZcProductBatchVO {
  id?: number
  batchNo?: string
  purchaseOrderId?: number
  inboundDate: string
  productId: number
  inboundQuantity: number
  warehouseId?: number
  supplierId?: number
  note?: string
}

export const ZcProductBatchApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/product-batch/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/product-batch/get?id=` + id })
  },
  create: async (data: ZcProductBatchVO) => {
    return await request.post({ url: `/zc/product-batch/create`, data })
  },
  deduct: async (batchId: number, quantity: number) => {
    return await request.post({ url: `/zc/product-batch/deduct`, data: { batchId, quantity } })
  }
}
