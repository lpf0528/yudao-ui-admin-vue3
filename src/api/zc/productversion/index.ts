import request from '@/config/axios'

/** 产品版本规格精简信息（simple-list 响应内嵌） */
export interface ProductVersionSpecSimpleVO {
  id: number            // 规格主键
  versionId: number     // 所属版本ID
  spec: string          // 规格名称
  inboundPrice?: number // 进货价
  onePrice?: number     // 一级类销售价
  note?: string         // 备注
  createTime?: string   // 创建时间
}

/** 版本规格分页列表响应 VO（包含版本名称） */
export interface ZcProductVersionSpcSimpleRespVO {
  id: number            // 主键
  versionId: number     // 版本编号
  versionName: string   // 版本名称
  spec: string          // 规格
  inboundPrice?: number // 进货价
  onePrice?: number     // 一级类销售价
  note?: string         // 备注
}

/** 产品版本简要信息（用于下拉选择及字段回显）
 * 接口：GET /zc/product-version/simple-list
 */
export interface ProductVersionSimpleVO {
  id: number
  name: string
  unitValue: string                          // 单位
  categoryId: number                         // 类别ID
  supplierId: number                         // 供应商ID
  specConfs?: ProductVersionSpecSimpleVO[]   // 规格信息列表
}

/** 产品版本规格信息 */
export interface ZcProductVersionSpcSaveReqVO {
  id?: number // 主键
  versionId: number // 版本ID
  spec: string // 规格
  inboundPrice?: number // 进货价
  onePrice?: number // 一级类销售价
  note?: string // 备注
}

/** 产品版本规格响应信息 */
export interface ZcProductVersionSpcRespVO {
  id: number // 主键
  versionId: number // 版本ID
  spec: string // 规格
  inboundPrice?: number // 进货价
  onePrice?: number // 一级类销售价
  note?: string // 备注
  createTime?: string // 创建时间
}

/** 产品版本信息 */
export interface ZcProductVersionSaveReqVO {
  id?: number // 主键
  name: string // 版本名称
  unitValue?: string // 单位
  categoryId?: number // 类别ID
  classify: string // 分类
  supplierId?: number // 供应商
  note?: string // 备注
  specConfs?: ZcProductVersionSpcSaveReqVO[] // 规格信息列表
}

/** 产品版本响应信息 */
export interface ZcProductVersionRespVO {
  id: number // 主键
  name: string // 版本名称
  unitValue?: string // 单位
  categoryId?: number // 类别ID
  classify: string // 分类
  supplierId?: number // 供应商
  note?: string // 备注
  specConfs?: ZcProductVersionSpcRespVO[] // 规格信息列表
  categoryValue?: string // 类别名称
  supplierName?: string // 供应商名称
  createTime?: string // 创建时间
}

// 产品版本 API
export const ProductVersionApi = {
  // 查询产品版本分页
  getProductVersionPage: async (params: any) => {
    return await request.get({ url: `/zc/product-version/page`, params })
  },

  // 查询产品版本详情
  getProductVersion: async (id: number) => {
    return await request.get({ url: `/zc/product-version/get?id=` + id })
  },

  // 新增产品版本
  createProductVersion: async (data: ZcProductVersionSaveReqVO) => {
    return await request.post({ url: `/zc/product-version/create`, data })
  },

  // 修改产品版本
  updateProductVersion: async (data: ZcProductVersionSaveReqVO) => {
    return await request.put({ url: `/zc/product-version/update`, data })
  },

  // 删除产品版本
  deleteProductVersion: async (id: number) => {
    return await request.delete({ url: `/zc/product-version/delete?id=` + id })
  },

  /** 批量删除产品版本 */
  deleteProductVersionList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/product-version/delete-list?ids=${ids.join(',')}` })
  },

  // 导出产品版本 Excel
  exportProductVersion: async (params) => {
    return await request.download({ url: `/zc/product-version/export-excel`, params })
  },

  // 查询产品版本简单列表
  getProductVersionSimpleList: async () => {
    return await request.get<ProductVersionSimpleVO[]>({ url: `/zc/product-version/simple-list` })
  },

  // 查询版本规格分页列表（含版本名称），对应后端：GET /zc/product-version/spec/list
  getProductVersionSpecPage: async (params: {
    pageNo: number
    pageSize: number
    versionId?: number
    spec?: string
  }) => {
    return await request.get<{ list: ZcProductVersionSpcSimpleRespVO[]; total: number }>({
      url: `/zc/product-version/spec/list`,
      params,
    })
  },
}