import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 车间员工信息 */
export interface WorkshopUser {
  id: number;         // 主键
  name?: string;      // 名称
  status?: number;    // 状态
  nodeIds?: number[]; // 绑定的工序节点 ID 列表
}

// 车间员工 API
export const WorkshopUserApi = {
  // 查询车间员工分页
  getWorkshopUserPage: async (params: any) => {
    return await request.get({ url: `/zc/workshop-user/page`, params })
  },

  // 查询车间员工详情
  getWorkshopUser: async (id: number) => {
    return await request.get({ url: `/zc/workshop-user/get?id=` + id })
  },

  // 新增车间员工
  createWorkshopUser: async (data: WorkshopUser) => {
    return await request.post({ url: `/zc/workshop-user/create`, data })
  },

  // 修改车间员工
  updateWorkshopUser: async (data: WorkshopUser) => {
    return await request.put({ url: `/zc/workshop-user/update`, data })
  },

  // 删除车间员工
  deleteWorkshopUser: async (id: number) => {
    return await request.delete({ url: `/zc/workshop-user/delete?id=` + id })
  },

  /** 批量删除车间员工 */
  deleteWorkshopUserList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/workshop-user/delete-list?ids=${ids.join(',')}` })
  },

  // 导出车间员工 Excel
  exportWorkshopUser: async (params) => {
    return await request.download({ url: `/zc/workshop-user/export-excel`, params })
  },
}
