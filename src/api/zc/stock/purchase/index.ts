import request from '@/config/axios'

export interface ZcPurchaseOrderVO {
  id?: number
  inboundDate: string
  supplierId?: number
  inboundType?: string
  operatorId?: number
  poNo?: string
  note?: string
}

export const ZcPurchaseOrderApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/purchase-order/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/purchase-order/get?id=` + id })
  },
  create: async (data: ZcPurchaseOrderVO) => {
    return await request.post({ url: `/zc/purchase-order/create`, data })
  },
  update: async (data: ZcPurchaseOrderVO) => {
    return await request.put({ url: `/zc/purchase-order/update`, data })
  },
  delete: async (id: number) => {
    return await request.delete({ url: `/zc/purchase-order/delete?id=` + id })
  },
  audit: async (id: number) => {
    return await request.put({ url: `/zc/purchase-order/audit?id=` + id })
  }
}
