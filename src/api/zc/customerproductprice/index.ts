import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 客户产品销售授权价信息 */
export interface CustomerProductPrice {
          id: number; // 主键
          customerId?: number; // 客户
          productId?: number; // 产品
          authorizedPrice?: number; // 授权价格
  }

// 客户产品销售授权价 API
export const CustomerProductPriceApi = {
  // 查询客户产品销售授权价分页
  getCustomerProductPricePage: async (params: any) => {
    return await request.get({ url: `/zc/customer-product-price/page`, params })
  },

  // 查询客户产品销售授权价详情
  getCustomerProductPrice: async (id: number) => {
    return await request.get({ url: `/zc/customer-product-price/get?id=` + id })
  },

  // 新增客户产品销售授权价
  createCustomerProductPrice: async (data: CustomerProductPrice) => {
    return await request.post({ url: `/zc/customer-product-price/create`, data })
  },

  // 修改客户产品销售授权价
  updateCustomerProductPrice: async (data: CustomerProductPrice) => {
    return await request.put({ url: `/zc/customer-product-price/update`, data })
  },

  // 删除客户产品销售授权价
  deleteCustomerProductPrice: async (id: number) => {
    return await request.delete({ url: `/zc/customer-product-price/delete?id=` + id })
  },

  /** 批量删除客户产品销售授权价 */
  deleteCustomerProductPriceList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/customer-product-price/delete-list?ids=${ids.join(',')}` })
  },

  // 导出客户产品销售授权价 Excel
  exportCustomerProductPrice: async (params) => {
    return await request.download({ url: `/zc/customer-product-price/export-excel`, params })
  }
}