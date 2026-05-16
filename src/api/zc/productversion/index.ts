import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品版本简要信息
 * 接口：GET /zc/product-version/simple-list
 * 返回：{ id: number, name: string }[]
 */
export interface ProductVersionSimpleVO {
  id: number
  name: string
}

/** 产品版本信息 */
export interface ProductVersion {
          id: number; // 主键
          name?: string; // 版本名称
          unitValue: string; // 单位
          categoryId: number; // 类别ID
          sellingPriceType?: string; // 出货价类型
          inboundPrice: number; // 进货价
          onePrice: number; // 一级类销售价
          classify?: number; // 分类
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

  // 查询产品版本简单列表
  getProductVersionSimpleList: async () => {
    return await request.get<ProductVersionSimpleVO[]>({ url: `/zc/product-version/simple-list` })
  },
}