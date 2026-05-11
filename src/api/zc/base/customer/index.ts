import request from '@/config/axios'

export interface ZcCustomerVO {
  id?: number
  shortName?: string
  name?: string
  contactName?: string
  address?: string
  province?: string
  city?: string
  district?: string
  deliveryAddress?: string
  mobile?: string
  mobile2?: string
  logisticId?: number
  brandId?: number
  note?: string
  balance?: number
}

export const ZcCustomerApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/customer/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/customer/get?id=` + id })
  },
  create: async (data: ZcCustomerVO) => {
    return await request.post({ url: `/zc/customer/create`, data })
  },
  update: async (data: ZcCustomerVO) => {
    return await request.put({ url: `/zc/customer/update`, data })
  },
  delete: async (id: number) => {
    return await request.delete({ url: `/zc/customer/delete?id=` + id })
  }
}
