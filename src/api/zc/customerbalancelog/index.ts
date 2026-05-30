import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 客户余额变动流水信息 */
export interface CustomerBalanceLog {
          id: number; // 主键
          customerId?: number; // 客户
          changeAmount?: number; // 余额变动额
          balanceBefore?: number; // 变动前余额
          balanceAfter?: number; // 变动后余额
          bizType?: string; // 业务类型
          refType: string; // 关联单据类型
          refId: number; // 关联单据主键
          refNo: string; // 关联单号快照
          remark: string; // 备注
  }

// 客户余额变动流水 API
export const CustomerBalanceLogApi = {
  // 查询客户余额变动流水分页
  getCustomerBalanceLogPage: async (params: any) => {
    return await request.get({ url: `/zc/customer-balance-log/page`, params })
  },
  // 导出客户余额变动流水 Excel
  exportCustomerBalanceLog: async (params) => {
    return await request.download({ url: `/zc/customer-balance-log/export-excel`, params })
  },
}
