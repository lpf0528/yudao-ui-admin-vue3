import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 客户简要信息
 * 接口：GET /zc/customer/simple-list
 * 返回：{ id, shortName, name, mobile, brandId, logisticId, contactName, deliveryAddress, balance }[]
 */
export interface CustomerSimpleVO {
  id: number
  shortName: string
  name: string
  mobile: string
  brandId: number
  logisticId: number
  contactName: string
  deliveryAddress: string
  balance: number
}

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
          logisticId?: number; // 物流 ID（匹配列表时有值，自定义名称时为空）
          logisticName?: string; // 物流名称（可手输；logisticId 为空时后端按名称查找或创建）
          brandId: number; // 关联品牌
          balance: number; // 账户余额
          note: string; // 备注
  }

/** 客户余额流水（订单确认扣减）响应 VO */
export interface ZcCustomerBalanceLogRespVO {
  id: number // 主键
  customerId: number // 客户 ID
  customerShortName?: string // 客户简称
  changeAmount?: number // 余额变动额
  balanceBefore?: number // 变动前余额
  balanceAfter?: number // 变动后余额
  bizType?: string // 业务类型
  refType?: string // 关联单据类型
  refId?: number // 关联单据主键
  refNo?: string // 关联单号快照
  remark?: string // 备注
  createTime?: string // 创建时间
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

  // 查询客户简单列表
  getCustomerSimpleList: async () => {
    return await request.get<CustomerSimpleVO[]>({ url: `/zc/customer/simple-list` })
  },

  // 下载客户导入模板
  importTemplate: async () => {
    return await request.download({ url: `/zc/customer/get-import-template` })
  },

  /** 获得客户订单确认扣减的最新余额流水，对应后端：GET /zc/customer/balance-log/latest-order-confirm */
  getLatestOrderConfirmBalanceLog: async (params: { customerId: number; refId: number }) => {
    return await request.get<ZcCustomerBalanceLogRespVO>({
      url: `/zc/customer/balance-log/latest-order-confirm`,
      params
    })
  },
}
