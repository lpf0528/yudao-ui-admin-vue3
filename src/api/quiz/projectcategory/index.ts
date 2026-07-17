import request from '@/config/axios'

/** 项目分类信息 */
export interface ProjectCategory {
          id: number; // 项目分类编号
          name?: string; // 分类名称
          picUrl: string; // 图标地址
          status?: number; // 状态
          sort: number; // 排序
  }

// 项目分类 API
export const ProjectCategoryApi = {
  // 查询项目分类分页
  getProjectCategoryPage: async (params: any) => {
    return await request.get({ url: `/quiz/project-category/page`, params })
  },

  // 查询项目分类详情
  getProjectCategory: async (id: number) => {
    return await request.get({ url: `/quiz/project-category/get?id=` + id })
  },

  // 新增项目分类
  createProjectCategory: async (data: ProjectCategory) => {
    return await request.post({ url: `/quiz/project-category/create`, data })
  },

  // 修改项目分类
  updateProjectCategory: async (data: ProjectCategory) => {
    return await request.put({ url: `/quiz/project-category/update`, data })
  },

  // 删除项目分类
  deleteProjectCategory: async (id: number) => {
    return await request.delete({ url: `/quiz/project-category/delete?id=` + id })
  },

  /** 批量删除项目分类 */
  deleteProjectCategoryList: async (ids: number[]) => {
    return await request.delete({ url: `/quiz/project-category/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目分类 Excel
  exportProjectCategory: async (params) => {
    return await request.download({ url: `/quiz/project-category/export-excel`, params })
  }
}
