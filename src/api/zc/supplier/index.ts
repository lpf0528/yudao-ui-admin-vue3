import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 供应商信息 */
export interface Supplier {
          id: number; // 主键
          shortName?: string; // 简称
          name?: string; // 全称
          note: string; // 备注
  }

// 供应商 API
export const SupplierApi = {
  // 查询供应商分页
  getSupplierPage: async (params: any) => {
    return await request.get({ url: `/zc/supplier/page`, params })
  },

  // 查询供应商详情
  getSupplier: async (id: number) => {
    return await request.get({ url: `/zc/supplier/get?id=` + id })
  },

  // 新增供应商
  createSupplier: async (data: Supplier) => {
    return await request.post({ url: `/zc/supplier/create`, data })
  },

  // 修改供应商
  updateSupplier: async (data: Supplier) => {
    return await request.put({ url: `/zc/supplier/update`, data })
  },

  // 删除供应商
  deleteSupplier: async (id: number) => {
    return await request.delete({ url: `/zc/supplier/delete?id=` + id })
  },

  /** 批量删除供应商 */
  deleteSupplierList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/supplier/delete-list?ids=${ids.join(',')}` })
  },

  // 导出供应商 Excel
  exportSupplier: async (params) => {
    return await request.download({ url: `/zc/supplier/export-excel`, params })
  }
}