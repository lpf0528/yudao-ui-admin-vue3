import request from '@/config/axios'

export interface ZcProgressDefinitionVO {
  id?: number
  code?: string
  name?: string
  progressKind?: number
  phaseGroup?: string
  sort?: number
  isMilestone?: boolean
  allowRepeat?: boolean
  status?: number
  remark?: string
}

export const ZcProgressDefinitionApi = {
  getPage: async (params: any) => {
    return await request.get({ url: `/zc/progress-definition/page`, params })
  },
  get: async (id: number) => {
    return await request.get({ url: `/zc/progress-definition/get?id=` + id })
  },
  create: async (data: ZcProgressDefinitionVO) => {
    return await request.post({ url: `/zc/progress-definition/create`, data })
  },
  update: async (data: ZcProgressDefinitionVO) => {
    return await request.put({ url: `/zc/progress-definition/update`, data })
  },
  delete: async (id: number) => {
    return await request.delete({ url: `/zc/progress-definition/delete?id=` + id })
  }
}
