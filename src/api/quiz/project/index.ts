import request from '@/config/axios'

/** 项目信息 */
export interface Project {
          id: number; // 项目ID
          name?: string; // 名称
          picUrl?: string; // 封面图片地址
          introduction: string; // 简介
          status?: number; // 状态
          recommendHot?: boolean; // 是否热门(小程序)
          recommendBanner?: boolean; // 是否轮播图(小程序)
  }

// 项目 API
export const ProjectApi = {
  // 查询项目分页
  getProjectPage: async (params: any) => {
    return await request.get({ url: `/quiz/project/page`, params })
  },

  // 查询项目详情
  getProject: async (id: number) => {
    return await request.get({ url: `/quiz/project/get?id=` + id })
  },

  // 新增项目
  createProject: async (data: Project) => {
    return await request.post({ url: `/quiz/project/create`, data })
  },

  // 修改项目
  updateProject: async (data: Project) => {
    return await request.put({ url: `/quiz/project/update`, data })
  },

  // 删除项目
  deleteProject: async (id: number) => {
    return await request.delete({ url: `/quiz/project/delete?id=` + id })
  },

  /** 批量删除项目 */
  deleteProjectList: async (ids: number[]) => {
    return await request.delete({ url: `/quiz/project/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目 Excel
  exportProject: async (params) => {
    return await request.download({ url: `/quiz/project/export-excel`, params })
  }
}
