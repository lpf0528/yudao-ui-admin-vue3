import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品规格信息 */
export interface zcProductSpec {
          id: number; // 主键
          value?: string; // 规格值
          note: string; // 备注
  }

// 产品规格 API
export const zcProductSpecApi = {
  // 查询产品规格分页
  getzcProductSpecPage: async (params: any) => {
    return await request.get({ url: `/zc/zc-product-spec/page`, params })
  },

  // 查询产品规格详情
  getzcProductSpec: async (id: number) => {
    return await request.get({ url: `/zc/zc-product-spec/get?id=` + id })
  },

  // 新增产品规格
  createzcProductSpec: async (data: zcProductSpec) => {
    return await request.post({ url: `/zc/zc-product-spec/create`, data })
  },

  // 修改产品规格
  updatezcProductSpec: async (data: zcProductSpec) => {
    return await request.put({ url: `/zc/zc-product-spec/update`, data })
  },

  // 删除产品规格
  deletezcProductSpec: async (id: number) => {
    return await request.delete({ url: `/zc/zc-product-spec/delete?id=` + id })
  },

  /** 批量删除产品规格 */
  deletezcProductSpecList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/zc-product-spec/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品规格 Excel
  exportzcProductSpec: async (params) => {
    return await request.download({ url: `/zc/zc-product-spec/export-excel`, params })
  }
}