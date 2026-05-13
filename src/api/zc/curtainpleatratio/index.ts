import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 褶倍信息 */
export interface CurtainPleatRatio {
          id: number; // 主键
          value?: number; // 褶倍
          rank: number; // 排序
  }

// 褶倍 API
export const CurtainPleatRatioApi = {
  // 查询褶倍分页
  getCurtainPleatRatioPage: async (params: any) => {
    return await request.get({ url: `/zc/curtain-pleat-ratio/page`, params })
  },

  // 查询褶倍详情
  getCurtainPleatRatio: async (id: number) => {
    return await request.get({ url: `/zc/curtain-pleat-ratio/get?id=` + id })
  },

  // 新增褶倍
  createCurtainPleatRatio: async (data: CurtainPleatRatio) => {
    return await request.post({ url: `/zc/curtain-pleat-ratio/create`, data })
  },

  // 修改褶倍
  updateCurtainPleatRatio: async (data: CurtainPleatRatio) => {
    return await request.put({ url: `/zc/curtain-pleat-ratio/update`, data })
  },

  // 删除褶倍
  deleteCurtainPleatRatio: async (id: number) => {
    return await request.delete({ url: `/zc/curtain-pleat-ratio/delete?id=` + id })
  },

  /** 批量删除褶倍 */
  deleteCurtainPleatRatioList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain-pleat-ratio/delete-list?ids=${ids.join(',')}` })
  },

  // 导出褶倍 Excel
  exportCurtainPleatRatio: async (params) => {
    return await request.download({ url: `/zc/curtain-pleat-ratio/export-excel`, params })
  }
}