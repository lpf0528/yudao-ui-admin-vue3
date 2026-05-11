import request from '@/config/axios'

export interface ZcCollectionAllocVO {
  orderId: number
  payAmount: number
}

export interface ZcCollectionSaveVO {
  id?: number
  collectionDate: string
  /** 收款人系统用户 ID，对应 collectioner_id */
  collectionerId?: number
  customerId: number
  amount: number
  discountAmount?: number
  paymentId?: number
  image1?: string
  image2?: string
  note?: string
  allocs: ZcCollectionAllocVO[]
}

export const ZcCollectionApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/collection-record/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/collection-record/get?id=` + id })
  },
  create: async (data: ZcCollectionSaveVO) => {
    return await request.post({ url: `/zc/collection-record/create`, data })
  }
}
