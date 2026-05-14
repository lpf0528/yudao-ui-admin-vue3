import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 品牌信息 */
export interface Brand {
          id: number; // 主键
          name?: string; // 名称
          logo: string; // Logo URL
          mobile: string; // 电话
          address: string; // 地址
          note: string; // 备注
  }

// 品牌 API
export const BrandApi = {
  // 查询品牌分页
  getBrandPage: async (params: any) => {
    return await request.get({ url: `/zc/brand/page`, params })
  },

  // 查询品牌详情
  getBrand: async (id: number) => {
    return await request.get({ url: `/zc/brand/get?id=` + id })
  },

  // 新增品牌
  createBrand: async (data: Brand) => {
    return await request.post({ url: `/zc/brand/create`, data })
  },

  // 修改品牌
  updateBrand: async (data: Brand) => {
    return await request.put({ url: `/zc/brand/update`, data })
  },

  // 删除品牌
  deleteBrand: async (id: number) => {
    return await request.delete({ url: `/zc/brand/delete?id=` + id })
  },

  /** 批量删除品牌 */
  deleteBrandList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/brand/delete-list?ids=${ids.join(',')}` })
  },

  // 导出品牌 Excel
  exportBrand: async (params) => {
    return await request.download({ url: `/zc/brand/export-excel`, params })
  },
}