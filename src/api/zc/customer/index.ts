import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 客户资料信息 */
export interface Customer {
          id: number; // 主键
          shortName?: string; // 简称
          name?: string; // 全称
          contactName?: string; // 联系人
          address: string; // 固定地址
          deliveryAddress: string; // 送货地址
          mobile: string; // 手机
          mobile2: string; // 联系电话
          logisticId: number; // 物流
          brandId: number; // 关联品牌
          balance: number; // 账户余额
          note: string; // 备注
  }

// 客户资料 API
export const CustomerApi = {
  // 查询客户资料分页
  getCustomerPage: async (params: any) => {
    return await request.get({ url: `/zc/customer/page`, params })
  },

  // 查询客户资料详情
  getCustomer: async (id: number) => {
    return await request.get({ url: `/zc/customer/get?id=` + id })
  },

  // 新增客户资料
  createCustomer: async (data: Customer) => {
    return await request.post({ url: `/zc/customer/create`, data })
  },

  // 修改客户资料
  updateCustomer: async (data: Customer) => {
    return await request.put({ url: `/zc/customer/update`, data })
  },

  // 删除客户资料
  deleteCustomer: async (id: number) => {
    return await request.delete({ url: `/zc/customer/delete?id=` + id })
  },

  /** 批量删除客户资料 */
  deleteCustomerList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/customer/delete-list?ids=${ids.join(',')}` })
  },

  // 导出客户资料 Excel
  exportCustomer: async (params) => {
    return await request.download({ url: `/zc/customer/export-excel`, params })
  },
}