import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 工序节点配置信息 */
export interface ProcessNode {
          id: number; // 主键
          name?: string; // 工序名称，如：备料、裁剪、缝制、定型、质检、包装
          sort?: number; // 排序号，数字越小越靠前
          description: string; // 工序描述/操作说明
  }

// 工序节点配置 API
export const ProcessNodeApi = {
  // 查询工序节点配置分页
  getProcessNodePage: async (params: any) => {
    return await request.get({ url: `/zc/process-node/page`, params })
  },

  // 查询工序节点配置详情
  getProcessNode: async (id: number) => {
    return await request.get({ url: `/zc/process-node/get?id=` + id })
  },

  // 新增工序节点配置
  createProcessNode: async (data: ProcessNode) => {
    return await request.post({ url: `/zc/process-node/create`, data })
  },

  // 修改工序节点配置
  updateProcessNode: async (data: ProcessNode) => {
    return await request.put({ url: `/zc/process-node/update`, data })
  },

  // 删除工序节点配置
  deleteProcessNode: async (id: number) => {
    return await request.delete({ url: `/zc/process-node/delete?id=` + id })
  },

  /** 批量删除工序节点配置 */
  deleteProcessNodeList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/process-node/delete-list?ids=${ids.join(',')}` })
  },

  // 导出工序节点配置 Excel
  exportProcessNode: async (params) => {
    return await request.download({ url: `/zc/process-node/export-excel`, params })
  },
}