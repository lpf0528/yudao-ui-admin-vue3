import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 收支账单信息 */
export interface Bills {
          id: number; // 主键
          billNo: string; // 单号
          billDate?: string | Dayjs; // 付款时间
          billUserId?: number; // 财务人员
          customerId?: number; // 客户
          discountAmount: number; // 优惠金额
          actualAmount?: number; // 实收金额 
          billMethodId?: number; // 收支方式
          note: string; // 备注
  }

// 收支账单 API
export const BillsApi = {
  // 查询收支账单分页
  getBillsPage: async (params: any) => {
    return await request.get({ url: `/zc/bills/page`, params })
  },

  // 查询收支账单详情
  getBills: async (id: number) => {
    return await request.get({ url: `/zc/bills/get?id=` + id })
  },

  // 新增收支账单
  createBills: async (data: Bills) => {
    return await request.post({ url: `/zc/bills/create`, data })
  },

  // 修改收支账单
  updateBills: async (data: Bills) => {
    return await request.put({ url: `/zc/bills/update`, data })
  },

  // 删除收支账单
  deleteBills: async (id: number) => {
    return await request.delete({ url: `/zc/bills/delete?id=` + id })
  },

  /** 批量删除收支账单 */
  deleteBillsList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/bills/delete-list?ids=${ids.join(',')}` })
  },

  // 导出收支账单 Excel
  exportBills: async (params) => {
    return await request.download({ url: `/zc/bills/export-excel`, params })
  }
}