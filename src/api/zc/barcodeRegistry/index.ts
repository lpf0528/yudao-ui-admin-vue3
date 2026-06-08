import request from '@/config/axios'

/** 码注册创建请求 VO */
export interface BarcodeRegistryCreateReqVO {
  codeType: string   // 码类型，如 PROCESS_QR
  targetRoute: string // 扫码后跳转的路由路径
  codeContent: string // 二维码原始内容（JSON 格式字符串）
}

// 码注册 API
export const BarcodeRegistryApi = {
  // 生成并注册二维码，返回 codeId（UUID），对应后端：POST /zc/barcode-registry/create
  create: async (data: BarcodeRegistryCreateReqVO): Promise<string> => {
    return await request.post({ url: '/zc/barcode-registry/create', data })
  }
}
