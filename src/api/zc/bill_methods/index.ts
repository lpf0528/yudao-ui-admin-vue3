import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/**
 * 收款方式精简信息（用于下拉选择）
 * 接口：GET /zc/bill-methods/simple-list
 * 返回：{ id: number, name: string }[]
 */
export interface BillMethodsSimpleVO {
  id: number   // 主键
  name: string // 名称
}

/** 收款方式信息 */
export interface BillMethods {
          id: number; // 主键
          name?: string; // 名称
          cardNo: string; // 卡号
          note: string; // 备注
  }

// 收款方式 API
export const BillMethodsApi = {
  // 查询收款方式分页
  getBillMethodsPage: async (params: any) => {
    return await request.get({ url: `/zc/bill-methods/page`, params })
  },

  // 查询收款方式详情
  getBillMethods: async (id: number) => {
    return await request.get({ url: `/zc/bill-methods/get?id=` + id })
  },

  // 新增收款方式
  createBillMethods: async (data: BillMethods) => {
    return await request.post({ url: `/zc/bill-methods/create`, data })
  },

  // 修改收款方式
  updateBillMethods: async (data: BillMethods) => {
    return await request.put({ url: `/zc/bill-methods/update`, data })
  },

  // 导出收款方式 Excel
  exportBillMethods: async (params) => {
    return await request.download({ url: `/zc/bill-methods/export-excel`, params })
  },

  // 查询收款方式精简列表，用于下拉选择
  getBillMethodsSimpleList: async () => {
    return await request.get<BillMethodsSimpleVO[]>({ url: `/zc/bill-methods/simple-list` })
  }
}
