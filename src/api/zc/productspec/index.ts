import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品规格信息 */
export interface ProductSpec {
          id: number; // 主键
          value?: string; // 规格值
          note: string; // 备注
  }

/** 产品规格简单信息（用于下拉） */
export interface ProductSpecSimpleVO {
  id: number
  value: string
}

// 产品规格 API
export const ProductSpecApi = {
  // 查询产品规格分页
  getProductSpecPage: async (params: any) => {
    return await request.get({ url: `/zc/product-spec/page`, params })
  },

  // 查询产品规格详情
  getProductSpec: async (id: number) => {
    return await request.get({ url: `/zc/product-spec/get?id=` + id })
  },

  // 新增产品规格
  createProductSpec: async (data: ProductSpec) => {
    return await request.post({ url: `/zc/product-spec/create`, data })
  },

  // 修改产品规格
  updateProductSpec: async (data: ProductSpec) => {
    return await request.put({ url: `/zc/product-spec/update`, data })
  },

  // 删除产品规格
  deleteProductSpec: async (id: number) => {
    return await request.delete({ url: `/zc/product-spec/delete?id=` + id })
  },

  /** 批量删除产品规格 */
  deleteProductSpecList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product-spec/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品规格 Excel
  exportProductSpec: async (params) => {
    return await request.download({ url: `/zc/product-spec/export-excel`, params })
  },

  // 获取产品规格简单列表（用于下拉）
  getProductSpecSimpleList: async () => {
    return await request.get<ProductSpecSimpleVO[]>({ url: `/zc/product-spec/simple-list` })
  },
}
