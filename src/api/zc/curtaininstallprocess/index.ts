import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 安装工艺信息 */
export interface CurtainInstallProcess {
          id: number; // 主键
          name?: string; // 工艺名称
          note: string; // 备注
  }

// 安装工艺 API
export const CurtainInstallProcessApi = {
  // 查询安装工艺分页
  getCurtainInstallProcessPage: async (params: any) => {
    return await request.get({ url: `/zc/curtain-install-process/page`, params })
  },

  // 查询安装工艺详情
  getCurtainInstallProcess: async (id: number) => {
    return await request.get({ url: `/zc/curtain-install-process/get?id=` + id })
  },

  // 新增安装工艺
  createCurtainInstallProcess: async (data: CurtainInstallProcess) => {
    return await request.post({ url: `/zc/curtain-install-process/create`, data })
  },

  // 修改安装工艺
  updateCurtainInstallProcess: async (data: CurtainInstallProcess) => {
    return await request.put({ url: `/zc/curtain-install-process/update`, data })
  },

  // 删除安装工艺
  deleteCurtainInstallProcess: async (id: number) => {
    return await request.delete({ url: `/zc/curtain-install-process/delete?id=` + id })
  },

  /** 批量删除安装工艺 */
  deleteCurtainInstallProcessList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/curtain-install-process/delete-list?ids=${ids.join(',')}` })
  },

  // 导出安装工艺 Excel
  exportCurtainInstallProcess: async (params) => {
    return await request.download({ url: `/zc/curtain-install-process/export-excel`, params })
  }
}