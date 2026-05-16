import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 产品批次信息 */
export interface ProductBatch {
          id: number; // 主键
          batchNo?: string; // 批号
          inboundDate?: string | Dayjs; // 入库日期
          productId?: number; // 产品
          inboundPrice: number; // 进货价
          inboundQuantity?: number; // 入库数量
          quantity?: number; // 剩余数量
          warehouseId: number; // 仓库
          supplierId: number; // 供应商
          note: string; // 备注
  }

// 产品批次 API
export const ProductBatchApi = {
  // 查询产品批次分页
  getProductBatchPage: async (params: any) => {
    return await request.get({ url: `/zc/product-batch/page`, params })
  },

  // 查询产品批次详情
  getProductBatch: async (id: number) => {
    return await request.get({ url: `/zc/product-batch/get?id=` + id })
  },

  // 新增产品批次
  createProductBatch: async (data: ProductBatch) => {
    return await request.post({ url: `/zc/product-batch/create`, data })
  },

  // 批量新增产品批次
  createProductBatchList: async (data: ProductBatch[]) => {
    return await request.post({ url: `/zc/product-batch/create-batch`, data })
  },

  // 修改产品批次
  updateProductBatch: async (data: ProductBatch) => {
    return await request.put({ url: `/zc/product-batch/update`, data })
  },

  // 删除产品批次
  deleteProductBatch: async (id: number) => {
    return await request.delete({ url: `/zc/product-batch/delete?id=` + id })
  },

  /** 批量删除产品批次 */
  deleteProductBatchList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product-batch/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品批次 Excel
  exportProductBatch: async (params) => {
    return await request.download({ url: `/zc/product-batch/export-excel`, params })
  }
}