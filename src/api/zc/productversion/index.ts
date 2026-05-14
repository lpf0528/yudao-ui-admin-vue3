import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品版本信息 */
export interface ProductVersion {
          id: number; // 主键
          name?: string; // 版本名称
          unitValue: string; // 单位（字典）
          specId: number; // 规格ID
          specValue: string; // 规格值
          categoryId: number; // 类别ID
          categoryValue: string; // 物料类别
          sellingPriceType: string; // 出货价类型
          inboundPrice: number; // 进货价
          classify: number; // 分类
          supplierId: number; // 供应商
          note: string; // 备注
  }

// 产品版本 API
export const ProductVersionApi = {
  // 查询产品版本分页
  getProductVersionPage: async (params: any) => {
    return await request.get({ url: `/zc/product-version/page`, params })
  },

  // 查询产品版本详情
  getProductVersion: async (id: number) => {
    return await request.get({ url: `/zc/product-version/get?id=` + id })
  },

  // 新增产品版本
  createProductVersion: async (data: ProductVersion) => {
    return await request.post({ url: `/zc/product-version/create`, data })
  },

  // 修改产品版本
  updateProductVersion: async (data: ProductVersion) => {
    return await request.put({ url: `/zc/product-version/update`, data })
  },

  // 删除产品版本
  deleteProductVersion: async (id: number) => {
    return await request.delete({ url: `/zc/product-version/delete?id=` + id })
  },

  /** 批量删除产品版本 */
  deleteProductVersionList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product-version/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品版本 Excel
  exportProductVersion: async (params) => {
    return await request.download({ url: `/zc/product-version/export-excel`, params })
  },
}