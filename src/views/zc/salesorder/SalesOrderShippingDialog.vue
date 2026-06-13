<!--
  发货联打印预览弹窗
  抬头：品牌名称 + 发货联；内容：订单号、客户名称、物流、收货人、电话、收货地址、打印日期
  父组件通过 open(formData) 方法打开
-->
<template>
  <el-dialog v-model="visible" width="660px" top="6vh" :close-on-click-modal="false">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-base font-semibold">发货联预览</span>
        <div class="flex gap-8px mr-24px">
          <el-button type="primary" @click="handlePrint">
            <Icon icon="ep:printer" class="mr-4px" />打印
          </el-button>
        </div>
      </div>
    </template>

    <!-- 预览区：单张发货联 -->
    <div style="background: #e8e8e8; padding: 20px; display: flex; justify-content: center;">
      <div
        style="
          background: white;
          width: 600px;
          padding: 24px 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
          font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
          color: #1a1a1a;
          box-sizing: border-box;
          border: 1px solid #ddd;
        "
      >
        <!-- 抬头：品牌 + 发货联 -->
        <div style="text-align: center; margin-bottom: 28px; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px;">
          <div style="font-size: 30px; font-weight: 800; letter-spacing: 3px;">
            {{ brandName ? brandName + ' ' : '' }}发货联
          </div>
        </div>

        <!-- 信息列表 -->
        <table style="width: 100%; border-collapse: collapse; font-size: 21px; line-height: 2;">
          <tbody>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px; width: 120px;">订单号</td>
              <td style="font-weight: 600;">{{ slipData.orderNo || '-' }}</td>
            </tr>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px;">客户名称</td>
              <td style="font-weight: 600;">{{ slipData.customerName }}</td>
            </tr>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px;">物流</td>
              <td style="font-weight: 600;">{{ slipData.logisticsName || '-' }}</td>
            </tr>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px;">收货人</td>
              <td style="font-weight: 600;">{{ slipData.receiver || '-' }}</td>
            </tr>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px;">电话</td>
              <td style="font-weight: 600;">{{ slipData.mobile || '-' }}</td>
            </tr>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px; vertical-align: top; padding-top: 4px;">收货地址</td>
              <td style="font-weight: 600; word-break: break-all;">{{ slipData.deliveryAddress || '-' }}</td>
            </tr>
            <tr>
              <td style="color: #666; white-space: nowrap; padding-right: 16px;">打印日期</td>
              <td style="font-weight: 600;">{{ slipData.printDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import type { CustomerSimpleVO } from '@/api/zc/customer'
import type { BrandSimpleVO } from '@/api/zc/brand'
import type { LogisticsSimpleVO } from '@/api/zc/logistics'
import type { SalesOrder } from '@/api/zc/salesorder'

/** 发货联打印预览弹窗 */
defineOptions({ name: 'SalesOrderShippingDialog' })

// ======================== Props ========================
const props = defineProps<{
  customersList: CustomerSimpleVO[]
  brandsList: BrandSimpleVO[]
  logisticsList: LogisticsSimpleVO[]
}>()

// ======================== 类型定义 ========================
interface SlipData {
  orderNo: string
  customerName: string
  logisticsName: string
  receiver: string
  mobile: string
  deliveryAddress: string
  printDate: string
}

// ======================== 响应式状态 ========================
const visible = ref(false)
const brandName = ref('')
const slipData = ref<SlipData>({
  orderNo: '',
  customerName: '',
  logisticsName: '',
  receiver: '',
  mobile: '',
  deliveryAddress: '',
  printDate: ''
})

// ======================== 辅助函数 ========================
const todayStr = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ======================== 对外方法 ========================
/** 打开预览弹窗，传入当前表单数据 */
const open = (data: SalesOrder) => {
  const customer = props.customersList.find((item) => item.id === data.customerId)
  const brand = props.brandsList.find((item) => item.id === data.brandId)
  const logistics = props.logisticsList.find((item) => item.id === data.logisticId)

  brandName.value = brand?.name || ''
  slipData.value = {
    orderNo: (data.orderNo as string) || '',
    customerName: customer ? (customer.shortName || customer.name || '') : '-',
    logisticsName: logistics?.name || '-',
    receiver: (data.receiver as string) || '',
    mobile: (data.mobile as string) || '',
    deliveryAddress: (data.deliveryAddress as string) || '',
    printDate: todayStr()
  }
  visible.value = true
}

defineExpose({ open })

// ======================== 打印 ========================
/** 在新窗口生成发货联 HTML 并触发打印对话框 */
const handlePrint = () => {
  const d = slipData.value
  const bName = brandName.value

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bName ? bName + ' ' : ''}发货联 - ${d.orderNo}</title>
  <style>
    @page { size: A5; margin: 12mm; }
    * { box-sizing: border-box; font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #1a1a1a; font-size: 20pt; }
    .header {
      text-align: center;
      border-bottom: 2pt solid #1a1a1a;
      padding-bottom: 10pt;
      margin-bottom: 18pt;
    }
    .header-title {
      font-size: 33pt;
      font-weight: 800;
      letter-spacing: 4pt;
    }
    table { width: 100%; border-collapse: collapse; font-size: 20pt; line-height: 2.2; }
    td.lbl { color: #555; white-space: nowrap; padding-right: 18pt; width: 105pt; }
    td.val { font-weight: 600; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">${bName ? bName + '　' : ''}发货联</div>
  </div>
  <table>
    <tbody>
      <tr><td class="lbl">订单号</td><td class="val">${d.orderNo || '-'}</td></tr>
      <tr><td class="lbl">客户名称</td><td class="val">${d.customerName}</td></tr>
      <tr><td class="lbl">物流</td><td class="val">${d.logisticsName || '-'}</td></tr>
      <tr><td class="lbl">收货人</td><td class="val">${d.receiver || '-'}</td></tr>
      <tr><td class="lbl">电话</td><td class="val">${d.mobile || '-'}</td></tr>
      <tr><td class="lbl" style="vertical-align:top;padding-top:3pt;">收货地址</td><td class="val">${d.deliveryAddress || '-'}</td></tr>
      <tr><td class="lbl">打印日期</td><td class="val">${d.printDate}</td></tr>
    </tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank', 'width=700,height=600')
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
