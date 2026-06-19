import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 车间员工信息 */
export interface WorkshopUser {
  id: number;         // 主键
  name?: string;      // 名称
  status?: number;    // 状态：1-开启，0-关闭
}

/** 车间员工状态：1=开启，0=关闭（与 COMMON_STATUS 约定相反） */
export const WorkshopUserStatusEnum = {
  ENABLE: 1,
  DISABLE: 0
} as const

/** 状态下拉选项，用于列表筛选 */
export const WORKSHOP_USER_STATUS_OPTIONS = [
  { label: '开启', value: WorkshopUserStatusEnum.ENABLE },
  { label: '关闭', value: WorkshopUserStatusEnum.DISABLE }
] as const

/** 状态值 → 展示文案 */
export const WORKSHOP_USER_STATUS_LABEL_MAP: Record<number, string> = Object.fromEntries(
  WORKSHOP_USER_STATUS_OPTIONS.map((item) => [item.value, item.label])
)

/** 将状态值翻译为展示文案 */
export const getWorkshopUserStatusLabel = (status?: number | string | null) => {
  const value = Number(status)
  return WORKSHOP_USER_STATUS_LABEL_MAP[value] ?? '-'
}

/** 状态标签颜色：开启=success，关闭=info */
export const getWorkshopUserStatusTagType = (status?: number | string | null): 'success' | 'info' => {
  return Number(status) === WorkshopUserStatusEnum.ENABLE ? 'success' : 'info'
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
