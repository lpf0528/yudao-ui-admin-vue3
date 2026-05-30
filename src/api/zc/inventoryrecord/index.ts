import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 盘点记录信息 */
export interface InventoryRecord {
          id: number; // 主键
          productId?: number; // 货号
          batchId?: number; // 批次
          oldQuantity?: number; // 盘点前数量
          newQuantity?: number; // 盘点后数量
          note: string; // 备注
  }

// 盘点记录 API
export const InventoryRecordApi = {
  // 查询盘点记录分页
  getInventoryRecordPage: async (params: any) => {
    return await request.get({ url: `/zc/inventory-record/page`, params })
  },

  // 新增盘点记录
  createInventoryRecord: async (data: InventoryRecord) => {
    return await request.post({ url: `/zc/inventory-record/create`, data })
  },
  
  // 导出盘点记录 Excel
  exportInventoryRecord: async (params) => {
    return await request.download({ url: `/zc/inventory-record/export-excel`, params })
  }
}