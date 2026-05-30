import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘简要信息
 * 接口：GET /zc/curtain/simple-list
 * 返回：{ id: number, name: string, pleatRatioValue: number | null, pleatsDistance: number | null }[]
 */
export interface CurtainSimpleVO {
  id: number
  name: string
  pleatRatioValue: number | null
  pleatsDistance: number | null
}

/** 窗帘信息 */
export interface Curtain {
          id: number; // 主键
          name?: string; // 款式名称
          pleatRatioValue: number; // 默认褶倍
          pleatsDistance: number; // 褶距
          note: string; // 备注
  }

/** 窗帘模板 - 配件项
 * elementId 必填；productId 可空（未指定产品时）
 */
export interface CurtainTemplateElement {
  elementId: number
  productId?: number | null
}

/** 窗帘模板 - 结构项
 * structureId 必填；elements 为配件列表，每个配件可对应一个产品
 */
export interface CurtainTemplateStructure {
  structureId: number
  elements: CurtainTemplateElement[]
}

/** 窗帘模板信息 */
export interface CurtainTemplate {
  curtainId: number
  structures: CurtainTemplateStructure[]
}
// 窗帘 API
export const CurtainApi = {
  // 查询窗帘分页
  getCurtainPage: async (params: any) => {
    return await request.get({ url: `/zc/curtain/page`, params })
  },

  // 查询窗帘详情
  getCurtain: async (id: number) => {
    return await request.get({ url: `/zc/curtain/get?id=` + id })
  },

  // 新增窗帘
  createCurtain: async (data: Curtain) => {
    return await request.post({ url: `/zc/curtain/create`, data })
  },

  // 修改窗帘
  updateCurtain: async (data: Curtain) => {
    return await request.put({ url: `/zc/curtain/update`, data })
  },

  // 删除窗帘
  deleteCurtain: async (id: number) => {
    return await request.delete({ url: `/zc/curtain/delete?id=` + id })
  },

  /** 批量删除窗帘 */
  deleteCurtainList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain/delete-list?ids=${ids.join(',')}` })
  },

  // 导出窗帘 Excel
  exportCurtain: async (params) => {
    return await request.download({ url: `/zc/curtain/export-excel`, params })
  },

  // 查询窗帘简单列表
  getCurtainSimpleList: async () => {
    return await request.get<CurtainSimpleVO[]>({ url: `/zc/curtain/simple-list` })
  },

  // 新增窗帘模板
  createCurtainTemplate: async (data: CurtainTemplate) => {
    return await request.post({ url: `/zc/curtain-template/create`, data })
  },

  // 根据 curtainId 查询模板
  getCurtainTemplateByCurtainId: async (curtainId: number) => {
    return await request.get<CurtainTemplate>({ url: `/zc/curtain-template/get?curtainId=` + curtainId })
  }
}
