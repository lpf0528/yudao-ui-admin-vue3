import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 仓库简要信息
 * 接口：GET /zc/warehouse/simple-list
 * 返回：{ id: number, name: string }[]
 */
export interface WarehouseSimpleVO {
  id: number
  name: string
}

/** 仓库信息 */
export interface Warehouse {
          id: number; // 主键
          name?: string; // 仓库名称
          managerId: number; // 负责人
          note: string; // 备注
  }

// 仓库 API
export const WarehouseApi = {
  // 查询仓库分页
  getWarehousePage: async (params: any) => {
    return await request.get({ url: `/zc/warehouse/page`, params })
  },

  // 查询仓库详情
  getWarehouse: async (id: number) => {
    return await request.get({ url: `/zc/warehouse/get?id=` + id })
  },

  // 新增仓库
  createWarehouse: async (data: Warehouse) => {
    return await request.post({ url: `/zc/warehouse/create`, data })
  },

  // 修改仓库
  updateWarehouse: async (data: Warehouse) => {
    return await request.put({ url: `/zc/warehouse/update`, data })
  },

  // 删除仓库
  deleteWarehouse: async (id: number) => {
    return await request.delete({ url: `/zc/warehouse/delete?id=` + id })
  },

  /** 批量删除仓库 */
  deleteWarehouseList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/warehouse/delete-list?ids=${ids.join(',')}` })
  },

  // 导出仓库 Excel
  exportWarehouse: async (params) => {
    return await request.download({ url: `/zc/warehouse/export-excel`, params })
  },

  // 查询仓库简单列表
  getWarehouseSimpleList: async () => {
    return await request.get<WarehouseSimpleVO[]>({ url: `/zc/warehouse/simple-list` })
  },
}