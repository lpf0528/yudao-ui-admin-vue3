import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘结构组件信息 */
export interface CurtainStructureElement {
          id: number; // 主键
          name?: string; // 组件名称
          note: string; // 备注
  }

// 窗帘结构组件 API
export const CurtainStructureElementApi = {
  // 查询窗帘结构组件分页
  getCurtainStructureElementPage: async (params: any) => {
    return await request.get({ url: `/zc/curtain-structure-element/page`, params })
  },

  // 查询窗帘结构组件详情
  getCurtainStructureElement: async (id: number) => {
    return await request.get({ url: `/zc/curtain-structure-element/get?id=` + id })
  },

  // 新增窗帘结构组件
  createCurtainStructureElement: async (data: CurtainStructureElement) => {
    return await request.post({ url: `/zc/curtain-structure-element/create`, data })
  },

  // 修改窗帘结构组件
  updateCurtainStructureElement: async (data: CurtainStructureElement) => {
    return await request.put({ url: `/zc/curtain-structure-element/update`, data })
  },

  // 删除窗帘结构组件
  deleteCurtainStructureElement: async (id: number) => {
    return await request.delete({ url: `/zc/curtain-structure-element/delete?id=` + id })
  },

  /** 批量删除窗帘结构组件 */
  deleteCurtainStructureElementList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain-structure-element/delete-list?ids=${ids.join(',')}` })
  },

  // 导出窗帘结构组件 Excel
  exportCurtainStructureElement: async (params) => {
    return await request.download({ url: `/zc/curtain-structure-element/export-excel`, params })
  }
}