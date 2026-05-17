import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 窗帘行信息 */
export interface SalesOrderCurtain {
  id?: number
  orderId?: number
  curtainId?: number
  room?: string
  pleatRatioValue?: string
  pleatsDistance?: number
  discountRate?: number
  amount?: number
  image1?: string
  image2?: string
  mountings?: string
  note?: string
}
/** 窗帘结构信息 */
export interface SalesOrderStructure {
  id?: number
  orderId?: number
  orderCurtainId?: number
  structureId?: number
  height?: number
  width?: number
  leftCorner?: number
  rightCorner?: number
  pasteDirection?: string
  installProcessId?: number
  openMethod?: string
  processType?: string
  shaping?: string
  pleatsNum?: number
  pleatsDistance?: number
  skirtHeight?: number
  note?: string
}

/** 销售订单信息 */
export interface SalesOrder {
          id: number; // 主键
          orderNo: string; // 订单号
          customerId?: number; // 客户
          mobile: string; // 手机
          brandId: number; // 品牌
          orderDate?: string | Dayjs; // 下单日期
          logisticId: number; // 物流
          receiver: string; // 收货人
          deliveryAddress?: string; // 送货地址
          freight?: number; // 运费
          types: string; // 订单类型
          discountAmount?: number; // 优惠金额
          totalAmount?: number; // 总金额
          deliveryDate: string | Dayjs; // 交付日期
          payStatus?: string; // 结算状态
          status?: string; // 状态
          confirmTime: string | Dayjs; // 确认时间
          isExpedited?: boolean; // 是否加急
          note: string; // 备注
  }

// 销售订单 API
export const SalesOrderApi = {
  // 查询销售订单分页
  getSalesOrderPage: async (params: any) => {
    return await request.get({ url: `/zc/sales-order/page`, params })
  },

  // 查询销售订单详情
  getSalesOrder: async (id: number) => {
    return await request.get({ url: `/zc/sales-order/get?id=` + id })
  },

  // 新增销售订单
  createSalesOrder: async (data: SalesOrder) => {
    return await request.post({ url: `/zc/sales-order/create`, data })
  },

  // 修改销售订单
  updateSalesOrder: async (data: SalesOrder) => {
    return await request.put({ url: `/zc/sales-order/update`, data })
  },

  // 删除销售订单
  deleteSalesOrder: async (id: number) => {
    return await request.delete({ url: `/zc/sales-order/delete?id=` + id })
  },

  /** 批量删除销售订单 */
  deleteSalesOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/zc/sales-order/delete-list?ids=${ids.join(',')}` })
  },

  // 导出销售订单 Excel
  exportSalesOrder: async (params) => {
    return await request.download({ url: `/zc/sales-order/export-excel`, params })
  }
}
