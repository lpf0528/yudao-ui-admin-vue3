<!--
  面料加工单打印预览弹窗
  所有批次在单页以表格形式展示（货号 / 批次 / 用料 / 备注），不显示单价和金额
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

    <!-- 预览区：宽70mm × 高100mm（比例 70:100） -->
    <div style="background: #e8e8e8; padding: 20px; max-height: 78vh; overflow-y: auto;">
      <div
        style="
          background: white;
          width: 420px;
          height: 600px;
          margin: 0 auto;
          padding: 12px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          font-size: 12px;
          color: #1a1a1a;
          font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
          overflow: hidden;
          box-sizing: border-box;
        "
      >
        <!-- 标题居中独立行 -->
        <div style="text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 3px; line-height: 1.2; margin-bottom: 6px;">
          {{ brandName ? brandName + ' ' : '' }}面料加工单
        </div>

        <!-- 订单头信息：左侧字段多行 + 右上角二维码 -->
        <div style="display: flex; align-items: flex-start;">
          <div style="flex: 1; min-width: 0;">
            <div style="padding: 2px 0;"><b>客户：</b>{{ customerName }}</div>
            <div style="padding: 2px 0;"><b>订单号：</b>{{ formData?.orderNo || '-' }}</div>
            <div style="padding: 2px 0;"><b>交付日期：</b>{{ formData?.deliveryDate || '-' }}</div>
            <div v-if="formData?.note" style="padding: 2px 0;"><b>备注：</b>{{ formData.note }}</div>
          </div>
          <!-- 右上角二维码 -->
          <div style="flex-shrink: 0; padding-left: 6px; text-align: center;">
            <template v-if="orderQrCode">
              <img :src="orderQrCode.url" width="56" height="56" style="display: block; margin: 0 auto;" />
              <div style="font-size: 9px; word-break: break-all; margin-top: 2px; line-height: 1.2; max-width: 56px;">
                {{ orderQrCode.code }}
              </div>
            </template>
            <div
              v-else
              style="width: 56px; height: 56px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 10px;"
            >二维码</div>
          </div>
        </div>

        <!-- 分隔线 -->
        <div style="border-top: 1px solid #ccc; margin: 4px 0 8px;"></div>

        <!-- 面料批次明细表格（不含单价和金额） -->
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #F3F4F6;">
              <th style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: left; font-weight: 600;">序号</th>
              <th style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: left; font-weight: 600;">货号</th>
              <th style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: left; font-weight: 600;">批次</th>
              <th style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: right; font-weight: 600;">用料</th>
              <th style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: left; font-weight: 600;">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(batch, idx) in formData?.batchs" :key="idx">
              <td style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: center;">{{ idx + 1 }}</td>
              <td style="border: 1px solid #D1D5DB; padding: 3px 4px;">{{ batch.productName || '-' }}</td>
              <td style="border: 1px solid #D1D5DB; padding: 3px 4px;">{{ batch.batchNo || '-' }}</td>
              <td style="border: 1px solid #D1D5DB; padding: 3px 4px; text-align: right;">{{ batch.quantity ?? '-' }}</td>
              <td style="border: 1px solid #D1D5DB; padding: 3px 4px;">{{ batch.note || '' }}</td>
            </tr>
          </tbody>
        </table>

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
  batchNo?: string
  quantity?: number
  note?: string
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
/** 整单二维码信息（url = data URL，code = 注册后的 codeId 文本） */
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
    codeContent: JSON.stringify({ id: data.id })
  })
  const url = await QRCode.toDataURL(codeId, { width: 80, margin: 1 })
  orderQrCode.value = { url, code: codeId }
}

defineExpose({ open })

// ======================== 打印 ========================
/**
 * 在新窗口生成干净的面料加工单 HTML 并自动触发打印对话框。
 * 单页 A4，所有批次以表格展示，不含单价和金额。
 */
const handlePrint = () => {
  if (!formData.value) return

  const fd = formData.value
  const cName = customerName.value
  const bName = brandName.value

  const thS = 'border:1px solid #D1D5DB;padding:3px 4px;font-weight:600;'
  const tdS = 'border:1px solid #D1D5DB;padding:3px 4px;'
  const infoTd = 'padding:2px 5px 2px 0;vertical-align:top;'

  const batchRowsHtml = (fd.batchs || []).map((b, idx) => `
    <tr>
      <td style="${tdS}text-align:center;">${idx + 1}</td>
      <td style="${tdS}">${b.productName || '-'}</td>
      <td style="${tdS}">${b.batchNo || '-'}</td>
      <td style="${tdS}text-align:right;">${b.quantity ?? '-'}</td>
      <td style="${tdS}">${b.note || ''}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bName ? bName + ' ' : ''}面料加工单 - ${fd.orderNo || ''}</title>
  <style>
    @page { size: 70mm 100mm; margin: 3mm; }
    * { box-sizing: border-box; font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #1a1a1a; font-size: 9pt; }
    b { font-weight: 600; }
  </style>
</head>
<body>
  <div style="text-align:center;font-size:15pt;font-weight:bold;letter-spacing:3px;line-height:1.2;margin-bottom:4px;">
    ${bName ? bName + '&nbsp;' : ''}面料加工单
  </div>
  <div style="display:flex;align-items:flex-start;">
    <div style="flex:1;min-width:0;">
      <div style="padding:2px 0;"><b>客户：</b>${cName}</div>
      <div style="padding:2px 0;"><b>订单号：</b>${fd.orderNo || '-'}</div>
      <div style="padding:2px 0;"><b>交付日期：</b>${fd.deliveryDate || '-'}</div>
      ${fd.note ? `<div style="padding:2px 0;"><b>备注：</b>${fd.note}</div>` : ''}
    </div>
    <div style="flex-shrink:0;padding-left:6px;text-align:center;">
      ${orderQrCode.value
        ? `<img src="${orderQrCode.value.url}" width="56" height="56" style="display:block;margin:0 auto;" />
           <div style="font-size:7pt;word-break:break-all;margin-top:2px;line-height:1.2;max-width:56px;">${orderQrCode.value.code}</div>`
        : `<div style="width:56px;height:56px;border:1px dashed #bbb;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:8px;">二维码</div>`
      }
    </div>
  </div>
  <div style="border-top:1px solid #ccc;margin:4px 0 6px;"></div>
  <table style="width:100%;border-collapse:collapse;font-size:9pt;">
    <thead>
      <tr style="background:#F3F4F6;">
        <th style="${thS}text-align:center;">序号</th>
        <th style="${thS}text-align:left;">货号</th>
        <th style="${thS}text-align:left;">批次</th>
        <th style="${thS}text-align:right;">用料</th>
        <th style="${thS}text-align:left;">备注</th>
      </tr>
    </thead>
    <tbody>${batchRowsHtml}</tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=800')
  if (!win) {
    ElMessage.warning('浏览器阻止了弹窗，请允许弹窗后重试')
    return
  }
  win.document.write(html)
  win.document.close()
  // 部分浏览器需等文档渲染完成才能调用 print
  setTimeout(() => {
    win.focus()
    win.print()
  }, 300)
}
</script>
