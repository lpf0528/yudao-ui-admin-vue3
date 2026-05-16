import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品信息 */
export interface Product {
          id: number; // 主键
          name?: string; // 名称
          versionId?: number; // 版本
          inboundPrice: number; // 进货价
          specId: number; // 规格
          onePrice: number; // 一级销售价
          supplierId: number; // 供应商
          note: string; // 备注
  }

// 产品 API
export const ProductApi = {
  // 查询产品分页
  getProductPage: async (params: any) => {
    return await request.get({ url: `/zc/product/page`, params })
  },

  // 查询产品详情
  getProduct: async (id: number) => {
    return await request.get({ url: `/zc/product/get?id=` + id })
  },

  // 新增产品
  createProduct: async (data: Product) => {
    return await request.post({ url: `/zc/product/create`, data })
  },

  // 修改产品
  updateProduct: async (data: Product) => {
    return await request.put({ url: `/zc/product/update`, data })
  },

  // 删除产品
  deleteProduct: async (id: number) => {
    return await request.delete({ url: `/zc/product/delete?id=` + id })
  },

  /** 批量删除产品 */
  deleteProductList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品 Excel
  exportProduct: async (params) => {
    return await request.download({ url: `/zc/product/export-excel`, params })
  }
}