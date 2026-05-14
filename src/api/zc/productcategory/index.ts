import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品类别信息 */
export interface ProductCategory {
          id: number; // 主键
          value?: string; // 类别名称
          note: string; // 备注
  }

// 产品类别 API
export const ProductCategoryApi = {
  // 查询产品类别分页
  getProductCategoryPage: async (params: any) => {
    return await request.get({ url: `/zc/product-category/page`, params })
  },

  // 查询产品类别详情
  getProductCategory: async (id: number) => {
    return await request.get({ url: `/zc/product-category/get?id=` + id })
  },

  // 新增产品类别
  createProductCategory: async (data: ProductCategory) => {
    return await request.post({ url: `/zc/product-category/create`, data })
  },

  // 修改产品类别
  updateProductCategory: async (data: ProductCategory) => {
    return await request.put({ url: `/zc/product-category/update`, data })
  },

  // 删除产品类别
  deleteProductCategory: async (id: number) => {
    return await request.delete({ url: `/zc/product-category/delete?id=` + id })
  },

  /** 批量删除产品类别 */
  deleteProductCategoryList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product-category/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品类别 Excel
  exportProductCategory: async (params) => {
    return await request.download({ url: `/zc/product-category/export-excel`, params })
  }
}