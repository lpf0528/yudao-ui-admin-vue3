<!--
  面料加工单打印预览弹窗
  所有批次在单页以表格形式展示（货号 / 规格 / 批次 / 用料 / 备注），不显示单价和金额
  父组件通过 open(formData) 方法打开，支持打印（含打印机选择）及浏览器截图/另存为PDF
-->
<template>
  <el-dialog v-model="visible" width="860px" top="2vh" :close-on-click-modal="false">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-base font-semibold">面料加工单预览</span>
        <div class="flex gap-8px mr-24px">
          <el-tooltip content="打印 / 选择打印机 / 另存为PDF" placement="top">
            <el-button type="primary" @click="handlePrint">
              <Icon icon="ep:printer" class="mr-4px" />打印
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 预览区：宽70mm × 高100mm（比例 70:100，屏幕等比放大） -->
    <div style="background: #e8e8e8; padding: 20px; max-height: 78vh; overflow-y: auto;">
      <div
        style="
          background: white;
          width: 420px;
          height: 600px;
          margin: 0 auto;
          padding: 6px 14px 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          font-size: 15px;
          color: #1a1a1a;
          font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
          overflow: hidden;
          box-sizing: border-box;
        "
      >
        <!-- 抬头：左侧标题+信息，右侧二维码 -->
        <div style="display: flex; align-items: flex-start; margin-bottom: 4px;">
          <div style="flex: 1; min-width: 0;">
            <div style="text-align: center; font-size: 21px; letter-spacing: 3px; line-height: 1.3; margin-bottom: 3px;">
              {{ brandName ? brandName + ' ' : '' }}加工单
            </div>
            <div style="padding: 2px 0; font-size: 13px;">订单号：{{ formData?.orderNo || '-' }}</div>
            <div style="padding: 2px 0; font-size: 13px;">客户：{{ customerName }}</div>
            <div style="padding: 2px 0; font-size: 13px;">房间：</div>
          </div>
          <!-- 右侧二维码 -->
          <div style="flex-shrink: 0; padding-left: 6px; text-align: center;">
            <template v-if="orderQrCode">
              <img :src="orderQrCode.url" width="96" height="96" style="display: block; margin: 0 auto;" />
            </template>
            <div
              v-else
              style="width: 96px; height: 96px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 11px;"
            >二维码</div>
          </div>
        </div>

        <!-- 分隔线 -->
        <div style="border-top: 1px solid #ccc; margin: 4px 0 6px;"></div>

        <!-- 面料批次明细表格（不含单价和金额） -->
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #F3F4F6;">
              <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: center;">序号</th>
              <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">货号</th>
              <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">规格</th>
              <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: right;">用料</th>
              <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(batch, idx) in formData?.batchs?.filter((b) => b.elementIsPrint !== false)" :key="idx">
              <td style="border: 1px solid #4B5563; padding: 3px 5px; text-align: center;">{{ idx + 1 }}</td>
              <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ batch.productName || '-' }}</td>
              <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ batch.specValue || '-' }}</td>
              <td style="border: 1px solid #4B5563; padding: 3px 5px; text-align: right;">{{ batch.quantity ?? '-' }}</td>
              <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ batch.note || '' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 订单备注放最后一行 -->
        <div
          v-if="formData?.note"
          style="margin-top: 4px; padding: 3px 8px; font-size: 13px; border: 1px solid #D1D5DB; background: #FFFBEB;"
        >
          <span style="color: #6B7280;">备注：</span>{{ formData.note }}
        </div>

      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { BarcodeRegistryApi } from '@/api/zc/barcodeRegistry'
import type { CustomerSimpleVO } from '@/api/zc/customer'
import type { BrandSimpleVO } from '@/api/zc/brand'
import type { LogisticsSimpleVO } from '@/api/zc/logistics'

/** 面料加工单打印预览弹窗（单页表格，不含单价和金额） */
defineOptions({ name: 'SalesOrderProductProcessingPrintDialog' })

// ======================== 类型定义 ========================
interface BatchRow {
  productName?: string
  specValue?: string  // 产品规格
  batchNo?: string
  quantity?: number
  note?: string
  elementIsPrint?: boolean  // false 时不显示、不打印
}

interface FormDataType {
  id?: number
  orderNo?: string
  customerId?: number
  brandId?: number
  logisticId?: number
  deliveryDate?: string
  deliveryAddress?: string
  note?: string
  batchs: BatchRow[]
}

// ======================== Props ========================
const props = defineProps<{
  customersList: CustomerSimpleVO[]
  brandsList: BrandSimpleVO[]
  logisticsList: LogisticsSimpleVO[]
}>()

// ======================== 响应式状态 ========================
const visible = ref(false)
const formData = ref<FormDataType | null>(null)
/** 整单二维码信息 */
const orderQrCode = ref<{ url: string; code: string } | null>(null)

// ======================== 计算属性 ========================
/** 客户显示名 */
const customerName = computed(() => {
  if (!formData.value?.customerId) return '-'
  const c = props.customersList.find((item) => item.id === formData.value!.customerId)
  return c ? `${c.shortName}/${c.contactName}` : '-'
})

/** 品牌显示名（用于标题） */
const brandName = computed(() => {
  if (!formData.value?.brandId) return ''
  return props.brandsList.find((item) => item.id === formData.value!.brandId)?.name || ''
})

// ======================== 对外方法 ========================
/** 打开预览弹窗，传入当前表单数据，并为整单注册生成二维码 */
const open = async (data: FormDataType) => {
  formData.value = data
  visible.value = true
  orderQrCode.value = null
  const codeId = await BarcodeRegistryApi.create({
    codeType: 'ORDER_QR',
    targetRoute: '/pages-curtain/order/fabric-detail/index',
    codeContent: JSON.stringify({ orderId: data.id })
  })
  const url = await QRCode.toDataURL(codeId, { width: 120, margin: 1 })
  orderQrCode.value = { url, code: codeId }
}

defineExpose({ open })

// ======================== 打印 ========================
/**
 * 在新窗口生成干净的面料加工单 HTML 并自动触发打印对话框。
 * 单页 （100mm × 120mm），所有批次以表格展示，不含单价和金额。
 * 字体通过 Vite 静态资源导入后转 base64 内嵌，开发和生产均有效。
 */
const handlePrint = async () => {
  if (!formData.value) return

  const fd = formData.value
  const cName = customerName.value
  const bName = brandName.value

  const thS = 'border:1px solid #4B5563;padding:3px 5px;'
  const tdS = 'border:1px solid #4B5563;padding:3px 5px;'

  const batchRowsHtml = (fd.batchs || []).filter((b) => b.elementIsPrint !== false).map((b, idx) => `
    <tr>
      <td style="${tdS}text-align:center;">${idx + 1}</td>
      <td style="${tdS}">${b.productName || '-'}</td>
      <td style="${tdS}">${b.specValue || '-'}</td>
      <td style="${tdS}text-align:right;">${b.quantity ?? '-'}</td>
      <td style="${tdS}">${b.note || ''}</td>
    </tr>`).join('')

  const qrHtml = orderQrCode.value
    ? `<img src="${orderQrCode.value.url}" width="96" height="96" style="display:block;margin:0 auto;" />`
    : `<div style="width:96px;height:96px;border:1px dashed #bbb;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:9px;">二维码</div>`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bName ? bName + ' ' : ''}加工单 - ${fd.orderNo || ''}</title>
  <style>
    @page { size: 100mm 120mm; margin: 0mm; }
    html, body { margin: 0; padding: 0; }
    * { box-sizing: border-box; font-family: 'SimHei', '黑体', 'Microsoft YaHei', '微软雅黑', sans-serif; font-weight: normal; }
    body { color: #1a1a1a; font-size: 13pt; line-height: 1.6; }
    b, strong { font-weight: normal; }
    .page { page-break-after: always; page-break-inside: avoid; overflow: hidden; padding: 0.75mm 3mm 3mm; width: 100mm; height: 120mm; box-sizing: border-box; }
    .page:last-child { page-break-after: auto; }
  </style>
</head>
<body>
<div class="page">
  <div style="display:flex;align-items:flex-start;margin-bottom:4px;">
    <div style="flex:1;min-width:0;">
      <div style="font-size:20pt;letter-spacing:3px;text-align:center;margin-bottom:3px;">
        ${bName ? bName + '&nbsp;' : ''}加工单
      </div>
      <div style="padding:1px 0;font-size:11pt;">订单号：${fd.orderNo || '-'}</div>
      <div style="padding:1px 0;font-size:11pt;">客户：${cName}</div>
      <div style="padding:1px 0;font-size:11pt;">房间：</div>
    </div>
    <div style="width:117px;flex-shrink:0;padding-left:5px;text-align:center;min-height:120px;">${qrHtml}</div>
  </div>
  <div style="border-top:1px solid #ccc;margin:3px 0 4px;"></div>
  <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-top:2px;">
    <thead>
      <tr style="background:#F3F4F6;">
        <th style="${thS}text-align:center;">序号</th>
        <th style="${thS}text-align:left;">货号</th>
        <th style="${thS}text-align:left;">规格</th>
        <th style="${thS}text-align:right;">用料</th>
        <th style="${thS}text-align:left;">备注</th>
      </tr>
    </thead>
    <tbody>${batchRowsHtml}</tbody>
  </table>
  ${fd.note ? `<div style="margin-top:3px;padding:2px 8px;font-size:11pt;border:1px solid #D1D5DB;background:#FFFBEB;"><span style="color:#6B7280;">备注：</span>${fd.note}</div>` : ''}
</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=800')
  if (!win) {
    ElMessage.warning('浏览器阻止了弹窗，请允许弹窗后重试')
    return
  }
  win.document.write(html)
  win.document.close()
  setTimeout(() => {
    win.focus()
    win.print()
  }, 300)
}
</script>
