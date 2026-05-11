import request from '@/config/axios'

export interface ZcWarehouseVO {
  id?: number
  name?: string
  managerId?: number
  note?: string
}

export const ZcWarehouseApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/warehouse/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/warehouse/get?id=` + id })
  },
  create: async (data: ZcWarehouseVO) => {
    return await request.post({ url: `/zc/warehouse/create`, data })
  },
  update: async (data: ZcWarehouseVO) => {
    return await request.put({ url: `/zc/warehouse/update`, data })
  },
  delete: async (id: number) => {
    return await request.delete({ url: `/zc/warehouse/delete?id=` + id })
  }
}
