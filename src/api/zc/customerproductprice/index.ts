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

  /**
   * 按客户 + 产品查询授权价
   * 对应后端：GET /zc/customer-product-price/get?customer_id=X&product_id=Y
   *
   * @param customerId 客户 ID
   * @param productId  产品 ID
   * @returns CustomerProductPrice 或 null（未配置时后端返回空）
   */
  getByCustomerAndProduct: async (customerId: number, productId: number) => {
    return await request.get<CustomerProductPrice | null>({
      url: `/zc/customer-product-price/get`,
      params: { customer_id: customerId, product_id: productId }
    })
  },

  // 批量保存客户产品销售授权价
  createBatchCustomerProductPrice: async (data: CustomerProductPrice[]) => {
    return await request.post({ url: `/zc/customer-product-price/create-batch`, data })
  },

}
