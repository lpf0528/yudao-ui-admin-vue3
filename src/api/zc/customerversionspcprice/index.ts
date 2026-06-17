import request from '@/config/axios'

/** 规格授权价明细项 */
export interface SpecPriceItem {
  versionId: number       // 产品版本编号
  spec: string            // 规格名称
  authorizedPrice: number // 授权销售价格
}

/** 客户版本规格授权价批量保存请求 VO */
export interface ZcCustomerVersionSpcPriceSaveReqVO {
  customerId: number        // 客户编号
  specPrices: SpecPriceItem[] // 规格授权价明细列表
}

/** 根据产品、客户、规格查询授权价响应 VO */
export interface ZcCustomerVersionSpecPriceGetRespVO {
  customerId: number      // 客户编号
  versionId: number       // 产品版本编号
  spec: string            // 规格名称
  authorizedPrice: number // 授权销售价格
}

/** 客户版本规格授权价响应 VO */
export interface ZcCustomerVersionSpcPriceRespVO {
  id: number              // 主键
  customerId: number      // 客户编号
  versionId: number       // 产品版本编号
  versionName: string     // 产品版本名称
  spec: string            // 规格名称
  inboundPrice?: number   // 进货价（来自版本规格配置）
  onePrice?: number       // 一级类销售价（来自版本规格配置）
  authorizedPrice: number // 授权销售价格
}

// 客户版本规格授权价 API
export const CustomerVersionSpcPriceApi = {
  // 查询客户版本规格授权价列表，对应后端：GET /zc/customer-version-spec-price/list
  getCustomerVersionSpcPriceList: async (customerId: number) => {
    return await request.get<ZcCustomerVersionSpcPriceRespVO[]>({
      url: `/zc/customer-version-spec-price/list`,
      params: { customerId },
    })
  },

  // 批量保存客户版本规格授权价（覆盖写），对应后端：POST /zc/customer-version-spec-price/batch-save
  batchSaveCustomerVersionSpcPrice: async (data: ZcCustomerVersionSpcPriceSaveReqVO) => {
    return await request.post({ url: `/zc/customer-version-spec-price/batch-save`, data })
  },

  // 根据产品ID、客户ID和规格查询客户版本规格授权价，对应后端：GET /zc/customer-version-spec-price/get
  getByProductAndCustomerAndSpec: async (params: {
    productId: number  // 产品编号
    customerId: number // 客户编号
    spec: string       // 规格名称
  }) => {
    return await request.get<ZcCustomerVersionSpecPriceGetRespVO>({
      url: `/zc/customer-version-spec-price/get`,
      params,
    })
  },
}
