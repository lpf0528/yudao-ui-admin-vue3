import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘信息 */
export interface Curtain {
          id: number; // 主键
          name?: string; // 款式名称
          seriesId?: number; // 系列
          pasteDirection: string; // 粘贴方向
          openMethod: string; // 打开方式
          installProcessId: number; // 默认安装工艺
          processType: string; // 加工类型
          pleatRatioValue: number; // 默认褶倍
          pleatsDistance: number; // 褶距
          note: string; // 备注
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
  }
}