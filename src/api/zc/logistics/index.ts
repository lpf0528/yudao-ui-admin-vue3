import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 物流公司信息 */
export interface Logistics {
          id: number; // 主键
          code?: string; // 编码
          name?: string; // 名称
          contactName: string; // 联系人
          mobile: string; // 电话
          address: string; // 地址
          note: string; // 备注
  }

// 物流公司 API
export const LogisticsApi = {
  // 查询物流公司分页
  getLogisticsPage: async (params: any) => {
    return await request.get({ url: `/zc/logistics/page`, params })
  },

  // 查询物流公司详情
  getLogistics: async (id: number) => {
    return await request.get({ url: `/zc/logistics/get?id=` + id })
  },

  // 新增物流公司
  createLogistics: async (data: Logistics) => {
    return await request.post({ url: `/zc/logistics/create`, data })
  },

  // 修改物流公司
  updateLogistics: async (data: Logistics) => {
    return await request.put({ url: `/zc/logistics/update`, data })
  },

  // 删除物流公司
  deleteLogistics: async (id: number) => {
    return await request.delete({ url: `/zc/logistics/delete?id=` + id })
  },

  /** 批量删除物流公司 */
  deleteLogisticsList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/logistics/delete-list?ids=${ids.join(',')}` })
  },

  // 导出物流公司 Excel
  exportLogistics: async (params) => {
    return await request.download({ url: `/zc/logistics/export-excel`, params })
  },

  // 查询物流公司简单列表
  getLogisticsSimpleList: async () => {
    return await request.get({ url: `/zc/logistics/simple-list` })
  },
}