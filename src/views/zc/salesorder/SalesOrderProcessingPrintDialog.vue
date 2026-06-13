<!--
  加工单打印预览弹窗
  每个窗帘下的每个结构单独生成一页，页面尺寸 宽100mm × 高120mm
  所有页面共用相同的订单抬头，用于生产加工单打印
  父组件通过 open(formData) 方法打开
-->
<template>
  <el-dialog v-model="visible" width="860px" top="2vh" :close-on-click-modal="false">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-base font-semibold">加工单预览</span>
        <div class="flex gap-8px mr-24px">
          <el-tooltip content="打印 / 选择打印机 / 另存为PDF" placement="top">
            <el-button type="primary" @click="handlePrint">
              <Icon icon="ep:printer" class="mr-4px" />打印
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 预览区：每个结构一页，宽100mm × 高120mm（比例 100:120） -->
    <div style="background: #e8e8e8; padding: 20px; max-height: 78vh; overflow-y: auto;">
      <template v-if="formData?.curtains?.length">
        <template v-for="(curtain, cIdx) in formData.curtains" :key="cIdx">
          <div
            v-for="(structure, sIdx) in curtain.structures"
            :key="sIdx"
            style="
              background: white;
              width: 600px;
              height: 720px;
              margin: 0 auto 20px;
              padding: 3px 14px 12px;
              box-shadow: 0 2px 12px rgba(0,0,0,0.2);
              font-size: 17px;
              color: #1a1a1a;
              font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
              overflow: hidden;
              box-sizing: border-box;
            "
          >
            <!-- 抬头（所有页相同，不含物流和地址） -->
            <div style="display: flex; align-items: flex-start; margin-bottom: 5px;">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 23px; letter-spacing: 3px; text-align: center; margin-bottom: 4px;">
                  {{ brandName ? brandName + ' ' : '' }}加工单
                </div>
                <div style="padding: 2px 0; font-size: 13px;">订单号：{{ formData?.orderNo || '-' }}</div>
                <div style="padding: 2px 0; font-size: 13px;">客户：{{ customerName }}&nbsp;&nbsp;交付：{{ formData?.deliveryDate || '-' }}</div>
                <div v-if="formData?.note" style="padding: 2px 0; font-size: 13px;">备注：{{ formData.note }}</div>
              </div>
              <div style="width: 82px; flex-shrink: 0; padding-left: 6px; text-align: center; min-height: 80px;">
                <template v-if="structureQrCodes[`${cIdx}-${sIdx}`]">
                  <img :src="structureQrCodes[`${cIdx}-${sIdx}`].url" width="72" height="72" style="display: block; margin: 0 auto;" />
                </template>
                <div
                  v-else
                  style="width: 72px; height: 72px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 13px;"
                >二维码</div>
              </div>
            </div>

            <!-- 分隔线 -->
            <div style="border-top: 1px solid #ccc; margin: 3px 0 5px;"></div>

            <!-- 窗帘信息 - 单行展示套数、房间、备注 -->
            <div style="border: 3px solid #1D4ED8; background: #EFF6FF; padding: 4px 8px; margin-bottom: 4px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 12px; color: #1D4ED8; white-space: nowrap;">第{{ cIdx + 1 }}-{{ sIdx + 1 }}套/共{{ formData!.curtains.length }}套</span>
              <span style="font-size: 12px; white-space: nowrap;"><span style="font-size: 10px; color: #6B7280;">房间：</span>{{ curtain.room || '-' }}</span>
            </div>

            <!-- 结构信息 - 4列表格 -->
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #111827; background: #F9FAFB; color: #374151; margin-bottom: 4px; font-size: 14px;">
              <tr>
                <td colspan="4" style="border: 1px solid #4B5563; padding: 3px 8px;">
                  结构 #{{ sIdx + 1 }}：{{ getStructureName(structure.structureId) || (structure as any).structureName || '-' }}
                  <span v-if="(structure as any).note" style="color: #6B7280; font-size: 12px; margin-left: 8px;">{{ (structure as any).note }}</span>
                </td>
              </tr>
              <tr v-for="(row, rowIdx) in chunkAttrs(structure, 4)" :key="rowIdx">
                <td v-for="(cell, cellIdx) in row" :key="cellIdx" :colspan="cell?.colspan || 1" style="border: 1px solid #4B5563; padding: 4px 6px; width: 25%; vertical-align: middle;">
                  <template v-if="cell">
                    <span v-if="!cell.noLabel" style="font-size: 10px; color: #6B7280; white-space: nowrap;">{{ cell.label }}：</span><span :style="cell.smallValue ? 'font-size: 14px; font-weight: bold' : 'font-size: 16px; font-weight: bold'">{{ cell.value }}</span>
                  </template>
                </td>
              </tr>
            </table>

            <!-- 用料表 -->
            <table
              v-if="(structure as any).materials?.length"
              style="width: 100%; border-collapse: collapse; font-size: 14px;"
            >
              <thead>
                <tr style="background: #F3F4F6;">
                  <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">组件类型</th>
                  <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">货号</th>
                  <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">规格</th>
                  <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: right;">用料</th>
                  <th style="border: 1px solid #4B5563; padding: 3px 5px; text-align: left;">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, mIdx) in (structure as any).materials" :key="mIdx">
                  <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ getElementName(material.elementId) || material.elementName || '-' }}</td>
                  <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ material.productName || '-' }}</td>
                  <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ material.specValue || '-' }}</td>
                  <td style="border: 1px solid #4B5563; padding: 3px 5px; text-align: right;">{{ material.quantity ?? '-' }}</td>
                  <td style="border: 1px solid #4B5563; padding: 3px 5px;">{{ material.note || '' }}</td>
                </tr>
              </tbody>
            </table>
            <div
              v-if="!(structure as any).materials?.length"
              style="padding: 3px 8px; color: #9CA3AF; border: 1px solid #D1D5DB;"
            >
              （无用料）
            </div>
            <!-- 款式备注放最下方 -->
            <div
              v-if="curtain.note"
              style="margin-top: 4px; padding: 3px 8px; font-size: 14px; border: 1px solid #D1D5DB; background: #FFFBEB;"
            >
              <span style="color: #6B7280;">款式备注：</span>{{ curtain.note }}
            </div>
          </div>
        </template>
      </template>

      <!-- 空状态 -->
      <div v-else style="text-align: center; padding: 40px; color: #9CA3AF; background: white; margin: 0 auto; width: 500px;">
        暂无数据
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { BarcodeRegistryApi } from '@/api/zc/barcodeRegistry'
import { getDictLabel, DICT_TYPE } from '@/utils/dict'
import type { CustomerSimpleVO } from '@/api/zc/customer'
import type { BrandSimpleVO } from '@/api/zc/brand'
import type { LogisticsSimpleVO } from '@/api/zc/logistics'
import type { CurtainSimpleVO } from '@/api/zc/curtain'
import type { CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import type { CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'
import type { SalesOrder, SalesOrderCurtain, SalesOrderStructure, ZCSalesOrderMaterial } from '@/api/zc/salesorder'

/** 加工单打印预览弹窗（每个结构单独一页，宽100mm × 高120mm） */
defineOptions({ name: 'SalesOrderProcessingPrintDialog' })

// ======================== 类型定义 ========================
type StructureWithMaterials = SalesOrderStructure & { materials: ZCSalesOrderMaterial[] }
type CurtainWithStructures = SalesOrderCurtain & { structures: StructureWithMaterials[] }
type FormDataType = SalesOrder & { curtains: CurtainWithStructures[] }

// ======================== Props ========================
const props = defineProps<{
  customersList: CustomerSimpleVO[]
  brandsList: BrandSimpleVO[]
  logisticsList: LogisticsSimpleVO[]
  curtainList: CurtainSimpleVO[]
  curtainStructureList: CurtainStructureSimpleVO[]
  elementList: CurtainStructureElementSimpleVO[]
}>()

// ======================== 响应式状态 ========================
const visible = ref(false)
const formData = ref<FormDataType | null>(null)
/** 每个结构的二维码信息，key 为 `${curtainIdx}-${structureIdx}` */
const structureQrCodes = ref<Record<string, { url: string; code: string }>>({})

// ======================== 计算属性 ========================
const customerName = computed(() => {
  if (!formData.value?.customerId) return '-'
  const c = props.customersList.find((item) => item.id === formData.value!.customerId)
  return c ? `${c.shortName}/${c.contactName}` : '-'
})

const brandName = computed(() => {
  if (!formData.value?.brandId) return ''
  return props.brandsList.find((item) => item.id === formData.value!.brandId)?.name || ''
})

// ======================== 查找辅助函数 ========================
const getCurtainName = (id?: number): string => {
  if (!id) return ''
  return props.curtainList.find((item) => item.id === id)?.name || ''
}

const getStructureName = (id?: number): string => {
  if (!id) return ''
  return props.curtainStructureList.find((item) => item.id === id)?.name || ''
}

const getElementName = (id?: number): string => {
  if (!id) return ''
  return props.elementList.find((item) => item.id === id)?.name || ''
}

type StructureAttr = { label: string; value: string; colspan?: number; smallValue?: boolean; rowBreakBefore?: boolean; noLabel?: boolean }

/** 将结构的属性字段收集为 label/value 列表，供模板 3 列网格和打印 3 列表格共用 */
const getStructureAttrs = (structure: any): StructureAttr[] => {
  const attrs: StructureAttr[] = []
  if (structure.width != null && structure.height != null) {
    attrs.push({ label: '', value: `${structure.width}*${structure.height}`, noLabel: true })
  } else if (structure.width != null) {
    attrs.push({ label: '宽', value: `${structure.width}` })
  } else if (structure.height != null) {
    attrs.push({ label: '高', value: `${structure.height}` })
  }
  if (structure.pasteDirection) attrs.push({ label: '粘贴方向', value: getDictLabel(DICT_TYPE.ZC_PASTE_DIRECTION, structure.pasteDirection) || structure.pasteDirection, colspan: 2 })
  const shapingPart = structure.isShaping === true ? '定型' : ''
  const openMethodPart = structure.openMethod ? (getDictLabel(DICT_TYPE.ZC_OPEN_METHOD, structure.openMethod) || structure.openMethod) : ''
  const shapingOpenValue = [shapingPart, openMethodPart].filter(Boolean).join(' ')
  if (shapingOpenValue) attrs.push({ label: '', value: shapingOpenValue, noLabel: true })
  if (structure.pleatsNum != null) attrs.push({ label: '褶数', value: String(structure.pleatsNum) })
  if (structure.pleatsDistance != null) attrs.push({ label: '褶距', value: String(structure.pleatsDistance) })
  if (structure.skirtHeight != null) attrs.push({ label: '裙摆', value: String(structure.skirtHeight) })
  // 加工和安装工艺强制另起最后一行，并排展示
  if (structure.processType) attrs.push({ label: '加工方式', value: String(getDictLabel(DICT_TYPE.ZC_PROCESS_TYPE, structure.processType) || structure.processType).slice(0, 2), smallValue: true, rowBreakBefore: true })
  if (structure.installProcessName) attrs.push({ label: '安装工艺', value: structure.installProcessName, colspan: 3 })
  return attrs
}

/** 将 attrs 数组按 cols 列分组（支持 colspan/rowBreakBefore），不足补 null，供模板表格行渲染 */
const chunkAttrs = (structure: any, cols: number) => {
  const attrs = getStructureAttrs(structure)
  const rows: (StructureAttr | null)[][] = []
  let currentRow: (StructureAttr | null)[] = []
  let used = 0
  for (const attr of attrs) {
    const span = attr.colspan || 1
    // rowBreakBefore：强制将当前行补全后换行
    if (attr.rowBreakBefore && currentRow.length > 0) {
      const remaining = cols - used
      for (let i = 0; i < remaining; i++) currentRow.push(null)
      rows.push(currentRow)
      currentRow = []
      used = 0
    }
    if (used + span > cols) {
      const remaining = cols - used
      for (let i = 0; i < remaining; i++) currentRow.push(null)
      rows.push(currentRow)
      currentRow = []
      used = 0
    }
    currentRow.push(attr)
    used += span
    if (used >= cols) {
      rows.push(currentRow)
      currentRow = []
      used = 0
    }
  }
  if (currentRow.length > 0) {
    const remaining = cols - used
    for (let i = 0; i < remaining; i++) currentRow.push(null)
    rows.push(currentRow)
  }
  return rows
}

// ======================== 对外方法 ========================
/** 打开预览弹窗，传入当前表单数据，并为每个结构生成独立二维码 */
const open = async (data: FormDataType) => {
  formData.value = data
  visible.value = true
  structureQrCodes.value = {}
  for (const [cIdx, curtain] of (data.curtains || []).entries()) {
    for (const [sIdx, structure] of ((curtain as any).structures || []).entries()) {
      const codeContent = JSON.stringify({
        orderId: data.id,
        orderNo: data.orderNo,
        curtainId: curtain.id ?? cIdx + 1,
        structureId: structure.id ?? sIdx + 1
      })
      const codeId = await BarcodeRegistryApi.create({
        codeType: 'ORDER_QR',
        targetRoute: '/pages-curtain/order/curtain-order-detail/curtain-item/index',
        codeContent
      })
      const url = await QRCode.toDataURL(codeId, { width: 120, margin: 1 })
      structureQrCodes.value[`${cIdx}-${sIdx}`] = { url, code: codeId }
    }
  }
}

defineExpose({ open })

// ======================== 打印 ========================
/**
 * 在新窗口生成加工单 HTML，每个结构单独一页（100mm × 70mm），自动触发打印对话框。
 * 抬头含品牌、客户、订单号、交付日期；结构属性以 3 列表格展示。
 */
const handlePrint = async () => {
  if (!formData.value) return

  // 将字体文件转为 base64 内嵌，避免新窗口无法访问本地资源
  const fontBase64 = await (async () => {
    const url = new URL('/src/assets/fonts/font.ttf', import.meta.url).href
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let bin = ''
    bytes.forEach((b) => (bin += String.fromCharCode(b)))
    return btoa(bin)
  })()

  const fd = formData.value
  const cName = customerName.value
  const bName = brandName.value

  const thS = 'border:1px solid #4B5563;padding:3px 5px;'
  const tdS = 'border:1px solid #4B5563;padding:3px 5px;'

  /** 根据结构索引生成抬头 HTML（含各自二维码） */
  const buildHeaderHtml = (cIdx: number, sIdx: number) => {
    const qrEntry = structureQrCodes.value[`${cIdx}-${sIdx}`]
    const qrImg = qrEntry
      ? `<img src="${qrEntry.url}" width="72" height="72" style="display:block;margin:0 auto;" />`
      : `<div style="width:72px;height:72px;border:1px dashed #bbb;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:11px;">二维码</div>`
    return `
      <div style="display:flex;align-items:flex-start;margin-bottom:4px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:20pt;letter-spacing:3px;text-align:center;margin-bottom:3px;">
            ${bName ? bName + '&nbsp;' : ''}加工单
          </div>
          <div style="padding:1px 0;font-size:11pt;">订单号：${fd.orderNo || '-'}</div>
          <div style="padding:1px 0;font-size:11pt;">客户：${cName}&nbsp;&nbsp;交付：${fd.deliveryDate || '-'}</div>
          ${fd.note ? `<div style="padding:1px 0;font-size:11pt;">备注：${fd.note}</div>` : ''}
        </div>
        <div style="width:78px;flex-shrink:0;padding-left:5px;text-align:center;min-height:80px;">${qrImg}</div>
      </div>
      <div style="border-top:1px solid #ccc;margin:3px 0 4px;"></div>
    `
  }

  // 遍历每个窗帘下的每个结构，生成独立页面
  const pages: string[] = []
  for (const [cIdx, curtain] of (fd.curtains || []).entries()) {
    const ctnName = getCurtainName(curtain.curtainId) || (curtain as any).curtainName || '-'
    for (const [sIdx, structure] of ((curtain as any).structures || []).entries()) {
      // 窗帘标题行（依赖 sIdx，必须在内层循环里构建）
      const lC = 'font-size:8pt;color:#6B7280;white-space:nowrap;'
      const curtainHeaderHtml = `
        <div style="border:3px solid #1D4ED8;background:#EFF6FF;padding:4px 8px;margin-bottom:3px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
          <span style="font-size:10pt;color:#1D4ED8;white-space:nowrap;">第${cIdx + 1}-${sIdx + 1}套/共${fd.curtains.length}套</span>
          <span style="font-size:10pt;white-space:nowrap;"><span style="${lC}">房间：</span>${curtain.room || '-'}</span>
          ${curtain.note ? `<span style="font-size:10pt;"><span style="${lC}">备注：</span>${curtain.note}</span>` : ''}
        </div>
      `
      const strName = getStructureName(structure.structureId) || structure.structureName || '-'

      // 结构属性转为 4 列表格，使用 chunkAttrs 正确处理 colspan/rowBreakBefore
      const attrRows = chunkAttrs(structure, 4)
      const sC = 'border:1px solid #4B5563;padding:4px 5px;width:25%;vertical-align:middle;'
      const lS = 'font-size:8pt;color:#6B7280;white-space:nowrap;'
      const vS = 'font-size:14pt;'

      const structureHtml = `
        <table style="width:100%;border-collapse:collapse;border:2px solid #111827;background:#F9FAFB;color:#374151;margin-bottom:3px;font-size:12pt;">
          <tr><td colspan="4" style="border:1px solid #4B5563;padding:3px 8px;">结构 #${sIdx + 1}：${strName}${structure.note ? `<span style="color:#6B7280;font-size:10pt;margin-left:8px;">${structure.note}</span>` : ''}</td></tr>
          ${attrRows.map((row) => `<tr>${row.map((cell) => `<td colspan="${cell?.colspan || 1}" style="${sC}">${cell ? `${cell.noLabel ? '' : `<span style="${lS}">${cell.label}：</span>`}<span style="${cell.smallValue ? 'font-size:11pt;font-weight:bold;' : vS + 'font-weight:bold;'}">${cell.value}</span>` : ''}</td>`).join('')}</tr>`).join('')}
        </table>
      `

      const mats: any[] = structure.materials || []
      const materialsHtml = mats.length
        ? `<table style="width:100%;border-collapse:collapse;font-size:11pt;margin-top:2px;">
            <thead>
              <tr style="background:#F3F4F6;">
                <th style="${thS}text-align:left;">组件类型</th>
                <th style="${thS}text-align:left;">货号</th>
                <th style="${thS}text-align:left;">规格</th>
                <th style="${thS}text-align:right;">用料</th>
                <th style="${thS}text-align:left;">备注</th>
              </tr>
            </thead>
            <tbody>
              ${mats
                .map(
                  (m) => `
                <tr>
                  <td style="${tdS}">${getElementName(m.elementId) || m.elementName || '-'}</td>
                  <td style="${tdS}">${m.productName || '-'}</td>
                  <td style="${tdS}">${m.specValue || '-'}</td>
                  <td style="${tdS}text-align:right;">${m.quantity ?? '-'}</td>
                  <td style="${tdS}">${m.note || ''}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>`
        : `<div style="padding:2px 8px;font-size:11pt;color:#9CA3AF;border:1px solid #D1D5DB;">（无用料）</div>`

      const noteHtml = (curtain as any).note ? `<div style="margin-top:3px;padding:2px 8px;font-size:12pt;border:1px solid #D1D5DB;background:#FFFBEB;"><span style="color:#6B7280;">款式备注：</span>${(curtain as any).note}</div>` : ''
      pages.push(`<div class="page">${buildHeaderHtml(cIdx, sIdx)}${curtainHeaderHtml}${structureHtml}${materialsHtml}${noteHtml}</div>`)
    }
  }

  // 组装完整 HTML，页面尺寸 宽100mm × 高120mm
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bName ? bName + ' ' : ''}加工单 - ${fd.orderNo || ''}</title>
  <style>
    @font-face { font-family: 'PrintFont'; src: url('data:font/truetype;base64,${fontBase64}') format('truetype'); }
    @page { size: 100mm 120mm; margin: 0; }
    * { box-sizing: border-box; font-family: 'PrintFont', 'Microsoft YaHei', sans-serif; font-weight: normal; }
    body { margin: 0; padding: 0; color: #1a1a1a; font-size: 13pt; line-height: 1.6; }
    b, strong { font-weight: normal; }
    .page { page-break-after: always; overflow: hidden; padding: 0.75mm 3mm 3mm; width: 100mm; box-sizing: border-box; }
    .page:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  ${pages.join('')}
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
