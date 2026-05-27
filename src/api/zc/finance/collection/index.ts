import request from '@/config/axios'

/** 收款订单分摊明细 */
export interface ZcBillOrderItemReqVO {
  orderId: number        // 订单 ID
  allocatedAmount: number // 本次分摊金额
}

/** 管理后台 - 收支账单新增/修改 Request VO */
export interface ZcBillsSaveReqVO {
  id?: number                          // 主键（更新时传入）
  billDate: string                     // 收款日期（YYYY-MM-DD）
  customerId?: number                  // 客户 ID
  discountAmount?: number              // 优惠金额
  actualAmount: number                 // 实收金额
  billMethodId: number                 // 收支方式 ID
  note?: string                        // 备注
  attachments?: string[]               // 账单附件 URL 列表
  orderItems: ZcBillOrderItemReqVO[]   // 收款订单分摊明细
}

export const ZcBillsApi = {
  /**
   * 创建收支账单
   * 对应后端：POST /zc/bills/create
   *
   * @param data 收支账单数据
   * @returns 新账单 ID
   */
  create: async (data: ZcBillsSaveReqVO) => {
    return await request.post({ url: `/zc/bills/create`, data })
  }
}
// 在 src/api/zc/finance/collection/index.ts 里加
// export const ZcCollectionApi = useZcCollectionApi();
// export const ZcCollectionSaveVO = useZcCollectionSaveVO();