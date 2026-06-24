<!--
  销售订单发货联打印预览弹窗
  功能：复用加工单的页面布局与打印尺寸，展示订单发货信息并支持打印
  使用方：views/zc/salesorder/SalesOrderForm.vue、views/zc/salesorder/SalesOrderProductForm.vue
-->
<template>
  <el-dialog v-model="visible" width="860px" top="2vh" :close-on-click-modal="false">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-base font-semibold">发货联预览</span>
        <div class="flex items-center gap-8px mr-24px">
          <el-radio-group v-model="mergeStructureShipping" size="small">
            <el-radio-button :label="false">按结构发货</el-radio-button>
            <el-radio-button :label="true">合并结构发货</el-radio-button>
          </el-radio-group>
          <el-tooltip content="打印 / 选择打印机 / 另存为PDF" placement="top">
            <el-button type="primary" @click="handlePrint">
              <Icon icon="ep:printer" class="mr-4px" />打印
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 预览区：与打印完全同尺寸（100mm × 120mm） -->
    <div style="background: #e8e8e8; padding: 20px; max-height: 78vh; overflow-y: auto;">
      <template v-if="shippingPages.length">
        <div
          v-for="page in shippingPages"
          :key="page.pageKey"
          style="
            background: white;
            width: 100mm;
            height: 120mm;
            margin: 0 auto 20px;
            padding: 5.2mm 3mm 3mm;
            box-shadow: 0 2px 12px rgba(0,0,0,0.2);
            font-size: 13pt;
            line-height: 1.6;
            color: #1a1a1a;
            font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
            overflow: hidden;
            box-sizing: border-box;
          "
        >
          <!-- 抬头：左侧标题+结构关键信息，右侧二维码 -->
          <div style="display: flex; align-items: flex-start; margin-bottom: 3px;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 18px; letter-spacing: 2px; text-align: center; margin-bottom: 1px; line-height: 1.3; font-weight: 700;">
                {{ brandName ? brandName + ' ' : '' }}发货联
              </div>
              <div style="padding: 1px 0; font-size: 14px; color: #111; font-weight: 700;">订单号：{{ formData?.orderNo || '-' }}</div>
              <div style="padding: 2px 0; font-size: 15px; color: #111; font-weight: 700;">{{ page.setNoText }}</div>
              <div style="padding: 2px 0; font-size: 15px; color: #111; font-weight: 700;">房间：{{ page.room }}</div>
            </div>
            <div style="width: 100px; flex-shrink: 0; padding-left: 6px; text-align: center;">
              <template v-if="structureQrCodes[page.pageKey]">
                <img :src="structureQrCodes[page.pageKey].url" width="88" height="88" style="display: block; margin: 0 auto;" />
              </template>
              <div
                v-else
                style="width: 88px; height: 88px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 12px;"
              >二维码</div>
            </div>
          </div>

          <!-- 分隔线 -->
          <div style="border-top: 1px solid #ccc; margin: 3px 0 5px;"></div>

          <table style="width: 100%; border-collapse: collapse; border: 2px solid #111827; background: #F9FAFB; color: #374151; margin-bottom: 8px; font-size: 14px;">
            <tbody>
              <tr>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; width: 28%; color: #111; font-size: 16px; font-weight: 700;">收货人</td>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; font-weight: bold;">{{ formData?.receiver || '-' }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; color: #111; font-size: 16px; font-weight: 700;">联系电话</td>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; font-weight: bold;">{{ formData?.mobile || '-' }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; color: #111; font-size: 16px; font-weight: 700;">物流方式</td>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; font-weight: bold;">{{ logisticsName }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; color: #111; font-size: 16px; font-weight: 700; vertical-align: top;">收货地址</td>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; font-weight: bold; word-break: break-all;">{{ formData?.deliveryAddress || '-' }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; color: #111; font-size: 16px; font-weight: 700; vertical-align: top;">结构信息</td>
                <td style="border: 1px solid #4B5563; padding: 6px 8px; font-weight: bold; word-break: break-all;">
                  <div
                    v-for="(structureInfo, structureIdx) in page.structureInfos"
                    :key="`${page.pageKey}-${structureIdx}`"
                    style="line-height: 1.5;"
                  >
                    {{ structureInfo.structureName }} | 备注：{{ structureInfo.structureNote }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="formData?.note"
            style="margin-top: 4px; padding: 6px 8px; font-size: 14px; border: 1px solid #D1D5DB; background: #FFFBEB;"
          >
            <span style="color: #111; font-weight: 700; font-size: 15px;">订单备注：</span>{{ formData.note }}
          </div>

          <!-- 发货信息确认联：放在页面最后 -->
          <div style="border: 3px solid #1D4ED8; background: #EFF6FF; padding: 4px 8px; margin-top: 8px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 14px; color: #111; font-weight: 700; white-space: nowrap;">发货信息确认联</span>
            <span style="font-size: 14px; white-space: nowrap; color: #111; font-weight: 700;"><span style="font-size: 12px; color: #111; font-weight: 700;">打印日期：</span>{{ printDate }}</span>
          </div>
        </div>
      </template>

      <div v-else style="text-align: center; padding: 40px; color: #9CA3AF; background: white; margin: 0 auto; width: 500px;">
        暂无结构数据
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import QRCode from 'qrcode'
import { BarcodeRegistryApi } from '@/api/zc/barcodeRegistry'
import type { CustomerSimpleVO } from '@/api/zc/customer'
import type { BrandSimpleVO } from '@/api/zc/brand'
import type { LogisticsSimpleVO } from '@/api/zc/logistics'
import type { SalesOrder } from '@/api/zc/salesorder'

/** 销售订单发货联打印预览弹窗 */
defineOptions({ name: 'SalesOrderShippingDialog' })

// ======================== Props ========================
const props = defineProps<{
  customersList: CustomerSimpleVO[]
  brandsList: BrandSimpleVO[]
  logisticsList: LogisticsSimpleVO[]
}>()

// ======================== 响应式状态 ========================
const visible = ref(false)
const formData = ref<SalesOrder | null>(null)
/** 是否合并同一窗帘下的结构到一张发货联 */
const mergeStructureShipping = ref(false)
/** 每个结构页的二维码信息，key 为 `${curtainIdx}-${structureIdx}` */
const structureQrCodes = ref<Record<string, { url: string; code: string }>>({})

// ======================== 计算属性 ========================
const brandName = computed(() => {
  if (!formData.value?.brandId) return ''
  return props.brandsList.find((item) => item.id === formData.value!.brandId)?.name || ''
})

const logisticsName = computed(() => {
  if (formData.value?.logisticName) return formData.value.logisticName
  if (!formData.value?.logisticId) return '-'
  return props.logisticsList.find((item) => item.id === formData.value!.logisticId)?.name || '-'
})

const printDate = computed(() => formatDate(new Date()))

type StructureInfoItem = {
  structureId: number | null
  structureName: string
  structureNote: string
}

type ShippingPageItem = {
  pageKey: string
  curtainIdx: number
  totalCurtains: number
  curtainId: number | null
  structureId: number | null
  structureIds: number[]
  setNoText: string
  room: string
  structureInfos: StructureInfoItem[]
}

/** 结构发货页：支持按结构逐页或按窗帘合并结构 */
const shippingPages = computed<ShippingPageItem[]>(() => {
  const curtains = (formData.value as (SalesOrder & { curtains?: any[] }) | null)?.curtains || []
  const pages: ShippingPageItem[] = []
  curtains.forEach((curtain, curtainIdx) => {
    const structures = curtain?.structures || []
    const structureInfos: StructureInfoItem[] = structures.map((structure: any) => ({
      structureId: typeof structure?.id === 'number' ? structure.id : null,
      structureName: structure?.structureName || '-',
      structureNote: structure?.note || '-'
    }))
    if (mergeStructureShipping.value) {
      if (!structureInfos.length) return
      pages.push({
        pageKey: `curtain-${curtainIdx}`,
        curtainIdx,
        totalCurtains: curtains.length,
        curtainId: typeof curtain?.id === 'number' ? curtain.id : null,
        structureId: null,
        structureIds: structureInfos.filter((item) => item.structureId !== null).map((item) => item.structureId as number),
        setNoText: `第${curtainIdx + 1}套/共${curtains.length}套`,
        room: curtain?.room || '-',
        structureInfos
      })
      return
    }

    structureInfos.forEach((structureInfo, structureIdx) => {
      pages.push({
        pageKey: `${curtainIdx}-${structureIdx}`,
        curtainIdx,
        totalCurtains: curtains.length,
        curtainId: typeof curtain?.id === 'number' ? curtain.id : null,
        structureId: structureInfo.structureId,
        structureIds: structureInfo.structureId !== null ? [structureInfo.structureId] : [],
        setNoText: `第${curtainIdx + 1}-${structureIdx + 1}套/共${curtains.length}套`,
        room: curtain?.room || '-',
        structureInfos: [structureInfo]
      })
    })
  })
  return pages
})

// ======================== 工具函数 ========================
/** 统一输出 yyyy-MM-dd，避免不同浏览器本地化差异 */
const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** 根据当前发货模式重新生成二维码 */
const generateStructureQrCodes = async (data: SalesOrder) => {
  structureQrCodes.value = {}
  for (const page of shippingPages.value) {
    const codeContent = JSON.stringify({
      orderId: data.id ?? null,
      customerId: data.customerId ?? null,
      curtainId: page.curtainId,
      structureId: page.structureId,
      structureIds: page.structureIds
    })
    const codeId = await BarcodeRegistryApi.create({
      codeType: 'ORDER_CURTAIN_SHIP_QR',
      targetRoute: '/pages-curtain/ship/index',
      codeContent
    })
    const url = await QRCode.toDataURL(codeId, { width: 150, margin: 1 })
    structureQrCodes.value[page.pageKey] = { url, code: codeId }
  }
}

// ======================== 对外方法 ========================
/**
 * 打开预览弹窗，注册并生成发货二维码
 * 二维码内容保留订单维度信息，便于后续按单追溯发货记录
 */
const open = async (data: SalesOrder) => {
  mergeStructureShipping.value = false
  formData.value = data
  visible.value = true
  await generateStructureQrCodes(data)
}

defineExpose({ open })

watch(mergeStructureShipping, async () => {
  if (!visible.value || !formData.value) return
  await generateStructureQrCodes(formData.value)
})

// ======================== 打印 ========================
/** 在新窗口生成发货联 HTML，尺寸与加工单保持一致（100mm × 120mm） */
const handlePrint = () => {
  if (!formData.value) return
  const data = formData.value
  const pagesHtml = shippingPages.value
    .map(
      (page) => {
        const qrEntry = structureQrCodes.value[page.pageKey]
        const structureInfoHtml = page.structureInfos
          .map((item) => `${item.structureName} | 备注：${item.structureNote}`)
          .join('<br/>')
        const qrHtml = qrEntry
          ? `<img src="${qrEntry.url}" width="88" height="88" style="display:block;margin:0 auto;" />`
          : `<div style="width:88px;height:88px;border:1px dashed #bbb;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:10px;">二维码</div>`
        return `
  <div class="page">
    <div style="display:flex;align-items:flex-start;margin-bottom:2px;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:18pt;letter-spacing:2px;text-align:center;margin-bottom:1px;line-height:1.3;font-weight:700;">${brandName.value ? brandName.value + '&nbsp;' : ''}发货联</div>
        <div style="padding:1px 0;font-size:12pt;color:#111;font-weight:700;">订单号：${data.orderNo || '-'}</div>
        <div style="padding:1px 0;font-size:13pt;color:#111;font-weight:700;">${page.setNoText}</div>
        <div style="padding:1px 0;font-size:13pt;color:#111;font-weight:700;">房间：${page.room}</div>
      </div>
      <div style="width:96px;flex-shrink:0;padding-left:5px;text-align:center;">${qrHtml}</div>
    </div>
    <div style="border-top:1px solid #ccc;margin:3px 0 4px;"></div>
    <table style="width:100%;border-collapse:collapse;border:2px solid #111827;background:#F9FAFB;color:#374151;font-size:11pt;">
      <tbody>
        <tr><td style="border:1px solid #4B5563;padding:5px 7px;width:30%;color:#111;font-size:12pt;font-weight:700;">收货人</td><td style="border:1px solid #4B5563;padding:5px 7px;font-weight:bold;">${data.receiver || '-'}</td></tr>
        <tr><td style="border:1px solid #4B5563;padding:5px 7px;color:#111;font-size:12pt;font-weight:700;">联系电话</td><td style="border:1px solid #4B5563;padding:5px 7px;font-weight:bold;">${data.mobile || '-'}</td></tr>
        <tr><td style="border:1px solid #4B5563;padding:5px 7px;color:#111;font-size:12pt;font-weight:700;">物流方式</td><td style="border:1px solid #4B5563;padding:5px 7px;font-weight:bold;">${logisticsName.value}</td></tr>
        <tr><td style="border:1px solid #4B5563;padding:5px 7px;color:#111;font-size:12pt;font-weight:700;vertical-align:top;">收货地址</td><td style="border:1px solid #4B5563;padding:5px 7px;font-weight:bold;word-break:break-all;">${data.deliveryAddress || '-'}</td></tr>
        <tr><td style="border:1px solid #4B5563;padding:5px 7px;color:#111;font-size:12pt;font-weight:700;vertical-align:top;">结构信息</td><td style="border:1px solid #4B5563;padding:5px 7px;font-weight:bold;word-break:break-all;line-height:1.5;">${structureInfoHtml}</td></tr>
      </tbody>
    </table>
    ${data.note ? `<div style="margin-top:4px;padding:4px 8px;font-size:11pt;border:1px solid #D1D5DB;background:#FFFBEB;"><span style="color:#111;font-weight:700;font-size:12pt;">订单备注：</span>${data.note}</div>` : ''}
    <div style="border:3px solid #1D4ED8;background:#EFF6FF;padding:4px 8px;margin-top:4px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12pt;color:#111;font-weight:700;white-space:nowrap;">发货信息确认联</span>
      <span style="font-size:12pt;white-space:nowrap;color:#111;font-weight:700;"><span style="font-size:10pt;color:#111;font-weight:700;">打印日期：</span>${printDate.value}</span>
    </div>
  </div>`
      }
    )
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${brandName.value ? brandName.value + ' ' : ''}发货联 - ${data.orderNo || ''}</title>
  <style>
    @page { size: 100mm 120mm; margin: 0mm; }
    html, body { margin: 0; padding: 0; }
    * { box-sizing: border-box; font-family: 'SimHei', '黑体', 'Microsoft YaHei', '微软雅黑', sans-serif; font-weight: normal; }
    body { color: #1a1a1a; font-size: 13pt; line-height: 1.6; }
    b, strong { font-weight: normal; }
    .page { page-break-after: always; page-break-inside: avoid; overflow: hidden; padding: 5.2mm 3mm 3mm; width: 100mm; height: 120mm; box-sizing: border-box; }
    .page:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  ${pagesHtml || '<div class="page"><div style="padding:8mm;text-align:center;color:#9CA3AF;">暂无结构数据</div></div>'}
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
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
