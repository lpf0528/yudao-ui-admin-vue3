import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘模板信息 */
export interface CurtainTemplate {
          id: number; // 主键
          curtainId?: number; // 款式
          structureId?: number; // 结构
          elementId?: number; // 配件
          unitId: number; // 单位
  }

// 窗帘模板 API
export const CurtainTemplateApi = {
  // 查询窗帘模板分页
  getCurtainTemplatePage: async (params: any) => {
    return await request.get({ url: `/zc/curtain-template/page`, params })
  },

  // 查询窗帘模板详情
  getCurtainTemplate: async (id: number) => {
    return await request.get({ url: `/zc/curtain-template/get?id=` + id })
  },

  // 新增窗帘模板
  createCurtainTemplate: async (data: CurtainTemplate) => {
    return await request.post({ url: `/zc/curtain-template/create`, data })
  },

  // 修改窗帘模板
  updateCurtainTemplate: async (data: CurtainTemplate) => {
    return await request.put({ url: `/zc/curtain-template/update`, data })
  },

  // 删除窗帘模板
  deleteCurtainTemplate: async (id: number) => {
    return await request.delete({ url: `/zc/curtain-template/delete?id=` + id })
  },

  /** 批量删除窗帘模板 */
  deleteCurtainTemplateList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain-template/delete-list?ids=${ids.join(',')}` })
  },

  // 导出窗帘模板 Excel
  exportCurtainTemplate: async (params) => {
    return await request.download({ url: `/zc/curtain-template/export-excel`, params })
  }
}