import request from '@/config/axios'

/** 员工工序节点绑定 - 保存请求 VO */
export interface UserProcessNodeSaveReqVO {
  userId: number      // 员工用户 ID
  nodeIds: number[]   // 绑定的工序节点 ID 列表（覆盖式，传空则清除所有绑定）
}

/** 工序节点响应 VO */
export interface ZcProcessNodeRespVO {
  id: number          // 主键
  name: string        // 工序名称，如：备料、裁剪、缝制、定型、质检、包装
  sort: number        // 排序号，数字越小越靠前
  description: string // 工序描述/操作说明
  creator: string     // 创建者
  createTime: string  // 创建时间
}

/** 员工工序节点绑定 API */
export const UserProcessNodeApi = {
  /**
   * 保存员工工序节点绑定（覆盖式）
   * 对应后端：POST /zc/user-process-node/save
   *
   * @param data 员工 ID + 工序节点 ID 列表
   * @returns 操作是否成功
   */
  saveUserProcessNode: async (data: UserProcessNodeSaveReqVO) => {
    return await request.post<boolean>({ url: `/zc/user-process-node/save`, data })
  },

  /**
   * 查询员工已绑定的工序节点列表
   * 对应后端：GET /zc/user-process-node/list
   *
   * @param userId 员工用户 ID
   * @returns 已绑定的工序节点对象数组
   */
  getUserProcessNodeList: async (userId: number) => {
    return await request.get<ZcProcessNodeRespVO[]>({ url: `/zc/user-process-node/list`, params: { userId } })
  }
}
