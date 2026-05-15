import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 货号档案信息 */
export interface Product {
          id: number; // 主键
          name?: string; // 产品名称
          versionId: number; // 版本
          inboundPrice: number; // 进货价
          aPrice: number; // A 类销售价
          supplierId: number; // 供应商
          purchaseType: number; // 采购类型
          note: string; // 备注
  }

// 货号档案 API
export const ProductApi = {
  // 查询货号档案分页
  getProductPage: async (params: any) => {
    return await request.get({ url: `/zc/product/page`, params })
  },

  // 查询货号档案详情
  getProduct: async (id: number) => {
    return await request.get({ url: `/zc/product/get?id=` + id })
  },

  // 新增货号档案
  createProduct: async (data: Product) => {
    return await request.post({ url: `/zc/product/create`, data })
  },

  // 修改货号档案
  updateProduct: async (data: Product) => {
    return await request.put({ url: `/zc/product/update`, data })
  },

  // 删除货号档案
  deleteProduct: async (id: number) => {
    return await request.delete({ url: `/zc/product/delete?id=` + id })
  },

  /** 批量删除货号档案 */
  deleteProductList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product/delete-list?ids=${ids.join(',')}` })
  },

  // 导出货号档案 Excel
  exportProduct: async (params) => {
    return await request.download({ url: `/zc/product/export-excel`, params })
  }
}