import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘结构部位信息 */
export interface CurtainStructure {
          id: number; // 主键
          name?: string; // 部位名称
          type?: string; // 帘头/帘身/飘窗垫/其他
          note: string; // 备注
  }

// 窗帘结构部位 API
export const CurtainStructureApi = {
  // 查询窗帘结构部位分页
  getCurtainStructurePage: async (params: any) => {
    return await request.get({ url: `/zc/curtain-structure/page`, params })
  },

  // 查询窗帘结构部位详情
  getCurtainStructure: async (id: number) => {
    return await request.get({ url: `/zc/curtain-structure/get?id=` + id })
  },

  // 新增窗帘结构部位
  createCurtainStructure: async (data: CurtainStructure) => {
    return await request.post({ url: `/zc/curtain-structure/create`, data })
  },

  // 修改窗帘结构部位
  updateCurtainStructure: async (data: CurtainStructure) => {
    return await request.put({ url: `/zc/curtain-structure/update`, data })
  },

  // 删除窗帘结构部位
  deleteCurtainStructure: async (id: number) => {
    return await request.delete({ url: `/zc/curtain-structure/delete?id=` + id })
  },

  /** 批量删除窗帘结构部位 */
  deleteCurtainStructureList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain-structure/delete-list?ids=${ids.join(',')}` })
  },

  // 导出窗帘结构部位 Excel
  exportCurtainStructure: async (params) => {
    return await request.download({ url: `/zc/curtain-structure/export-excel`, params })
  }
}