import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘系列信息 */
export interface CurtainSeries {
          id: number; // 主键
          name?: string; // 系列名称
          category?: number; // 0窗帘 1软装 2罗马帘 3百叶帘
          note: string; // 备注
  }

// 窗帘系列 API
export const CurtainSeriesApi = {
  // 查询窗帘系列分页
  getCurtainSeriesPage: async (params: any) => {
    return await request.get({ url: `/zc/curtain-series/page`, params })
  },

  // 查询窗帘系列详情
  getCurtainSeries: async (id: number) => {
    return await request.get({ url: `/zc/curtain-series/get?id=` + id })
  },

  // 新增窗帘系列
  createCurtainSeries: async (data: CurtainSeries) => {
    return await request.post({ url: `/zc/curtain-series/create`, data })
  },

  // 修改窗帘系列
  updateCurtainSeries: async (data: CurtainSeries) => {
    return await request.put({ url: `/zc/curtain-series/update`, data })
  },

  // 删除窗帘系列
  deleteCurtainSeries: async (id: number) => {
    return await request.delete({ url: `/zc/curtain-series/delete?id=` + id })
  },

  /** 批量删除窗帘系列 */
  deleteCurtainSeriesList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain-series/delete-list?ids=${ids.join(',')}` })
  },

  // 导出窗帘系列 Excel
  exportCurtainSeries: async (params) => {
    return await request.download({ url: `/zc/curtain-series/export-excel`, params })
  }
}