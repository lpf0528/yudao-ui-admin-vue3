<!--
  加工单打印预览弹窗
  每个窗帘下的每个结构单独生成一页，页面尺寸 100mm × 70mm
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

    <!-- 预览区：每个结构一页，比例 100:70 -->
    <div style="background: #e8e8e8; padding: 20px; max-height: 78vh; overflow-y: auto;">
      <template v-if="formData?.curtains?.length">
        <template v-for="(curtain, cIdx) in formData.curtains" :key="cIdx">
          <div
            v-for="(structure, sIdx) in curtain.structures"
            :key="sIdx"
            style="
              background: white;
              width: 420px;
              height: 600px;
              margin: 0 auto 20px;
              padding: 12px 14px;
              box-shadow: 0 2px 12px rgba(0,0,0,0.2);
              font-size: 15px;
              color: #1a1a1a;
              font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
              overflow: hidden;
              box-sizing: border-box;
            "
          >
            <!-- 抬头（所有页相同，不含物流和地址） -->
            <div style="display: flex; align-items: flex-start; margin-bottom: 5px;">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 20px; font-weight: bold; letter-spacing: 3px; text-align: center; margin-bottom: 4px;">
                  {{ brandName ? brandName + ' ' : '' }}加工单
                </div>
                <div style="padding: 2px 0; font-weight: bold;"><b>订单号：</b>{{ formData?.orderNo || '-' }}</div>
                <div style="padding: 2px 0; font-weight: bold;"><b>客户：</b>{{ customerName }}</div>
                <div style="padding: 2px 0; font-weight: bold;"><b>交付：</b>{{ formData?.deliveryDate || '-' }}</div>
                <div v-if="formData?.note" style="padding: 2px 0; font-weight: bold;"><b>备注：</b>{{ formData.note }}</div>
              </div>
              <div style="width: 70px; flex-shrink: 0; padding-left: 6px; text-align: center;">
                <template v-if="structureQrCodes[`${cIdx}-${sIdx}`]">
                  <img :src="structureQrCodes[`${cIdx}-${sIdx}`].url" width="56" height="56" style="display: block; margin: 0 auto;" />
                  <div style="font-size: 9px; word-break: break-all; margin-top: 2px; line-height: 1.2;">
                    {{ structureQrCodes[`${cIdx}-${sIdx}`].code }}
                  </div>
                </template>
                <div
                  v-else
                  style="width: 56px; height: 56px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 11px;"
                >二维码</div>
              </div>
            </div>

            <!-- 分隔线 -->
            <div style="border-top: 1px solid #ccc; margin: 3px 0 5px;"></div>

            <!-- 窗帘信息 -->
            <div
              style="
                background: #EFF6FF;
                border: 1px solid #BFDBFE;
                border-left: 3px solid #3B82F6;
                padding: 4px 8px;
                font-weight: 600;
                line-height: 1.5;
                margin-bottom: 4px;
              "
            >
              <span style="color: #1D4ED8;">第{{ cIdx + 1 }}-{{ sIdx + 1 }}套/共{{ formData!.curtains.length }}套</span>
              &nbsp;|&nbsp;<span style="font-weight: 400;">款式：</span>{{ getCurtainName(curtain.curtainId) || (curtain as any).curtainName || '-' }}
              &nbsp;|&nbsp;<span style="font-weight: 400;">房间：</span>{{ curtain.room || '-' }}
              <template v-if="curtain.pleatRatioValue">&nbsp;|&nbsp;<span style="font-weight: 400;">褶倍：</span>{{ curtain.pleatRatioValue }}</template>
              <template v-if="curtain.pleatsDistance">&nbsp;|&nbsp;<span style="font-weight: 400;">褶距：</span>{{ curtain.pleatsDistance }}</template>
              <template v-if="curtain.mountings?.length">
                &nbsp;|&nbsp;<span style="font-weight: 400;">配件：</span>{{ Array.isArray(curtain.mountings) ? curtain.mountings.join('、') : curtain.mountings }}
              </template>
            </div>
            <div
              v-if="curtain.note"
              style="padding: 2px 8px; color: #4B5563; border: 1px solid #BFDBFE; border-top: none; margin-bottom: 4px;"
            >
              备注：{{ curtain.note }}
            </div>

            <!-- 结构信息：标题行 + 3列属性网格 -->
            <div
              style="
                background: #F9FAFB;
                border: 1px solid #D1D5DB;
                padding: 5px 10px;
                color: #374151;
                margin-bottom: 4px;
              "
            >
              <div style="font-weight: 600; margin-bottom: 4px;">
                结构 #{{ sIdx + 1 }}：{{ getStructureName(structure.structureId) || (structure as any).structureName || '-' }}
              </div>
              <div
                v-if="getStructureAttrs(structure).length"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 8px;"
              >
                <div v-for="(attr, i) in getStructureAttrs(structure)" :key="i">
                  <div style="font-weight: 600;">{{ attr.label }}：</div>
                  <div>{{ attr.value }}</div>
                </div>
              </div>
            </div>

            <!-- 用料表 -->
            <table
              v-if="(structure as any).materials?.length"
              style="width: 100%; border-collapse: collapse;"
            >
              <thead>
                <tr style="background: #F3F4F6;">
                  <th style="border: 1px solid #D1D5DB; padding: 3px 5px; text-align: left; font-weight: 600;">组件类型</th>
                  <th style="border: 1px solid #D1D5DB; padding: 3px 5px; text-align: left; font-weight: 600;">货号</th>
                  <th style="border: 1px solid #D1D5DB; padding: 3px 5px; text-align: right; font-weight: 600;">用料</th>
                  <th style="border: 1px solid #D1D5DB; padding: 3px 5px; text-align: left; font-weight: 600;">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, mIdx) in (structure as any).materials" :key="mIdx">
                  <td style="border: 1px solid #D1D5DB; padding: 3px 5px;">{{ getElementName(material.elementId) || material.elementName || '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 3px 5px;">{{ material.productName || '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 3px 5px; text-align: right;">{{ material.quantity ?? '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 3px 5px;">{{ material.note || '' }}</td>
                </tr>
              </tbody>
            </table>
            <div
              v-if="!(structure as any).materials?.length"
              style="padding: 3px 8px; color: #9CA3AF; border: 1px solid #D1D5DB;"
            >
              （无用料）
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

/** 加工单打印预览弹窗（每个结构单独一页，100mm × 70mm） */
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

/** 将结构的属性字段收集为 label/value 列表，供模板 3 列网格和打印 3 列表格共用 */
const getStructureAttrs = (structure: any): { label: string; value: string }[] => {
  const attrs: { label: string; value: string }[] = []
  if (structure.height != null && structure.width != null) {
    attrs.push({ label: '高*宽', value: `${structure.height} * ${structure.width}m` })
  } else {
    if (structure.height != null) attrs.push({ label: '高', value: String(structure.height) })
    if (structure.width != null) attrs.push({ label: '宽', value: String(structure.width) })
  }
  if (structure.leftCorner) attrs.push({ label: '左转角', value: structure.leftCorner })
  if (structure.rightCorner) attrs.push({ label: '右转角', value: structure.rightCorner })
  if (structure.pasteDirection) attrs.push({ label: '粘贴方向', value: getDictLabel(DICT_TYPE.ZC_PASTE_DIRECTION, structure.pasteDirection) || structure.pasteDirection })
  if (structure.openMethod) attrs.push({ label: '打开方式', value: getDictLabel(DICT_TYPE.ZC_OPEN_METHOD, structure.openMethod) || structure.openMethod })
  if (structure.processType) attrs.push({ label: '加工类型', value: getDictLabel(DICT_TYPE.ZC_PROCESS_TYPE, structure.processType) || structure.processType })
  if (structure.pleatsNum != null) attrs.push({ label: '总褶数', value: String(structure.pleatsNum) })
  if (structure.pleatsDistance != null) attrs.push({ label: '褶距', value: String(structure.pleatsDistance) })
  if (structure.skirtHeight != null) attrs.push({ label: '裙摆高度', value: String(structure.skirtHeight) })
  if (structure.installProcessName) attrs.push({ label: '安装工艺', value: structure.installProcessName })
  if (structure.note) attrs.push({ label: '备注', value: structure.note })
  return attrs
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
         orderNo: data.orderNo,
        curtainId: curtain.id ?? cIdx + 1,
        structureId: structure.id ?? sIdx + 1
      })
      const codeId = await BarcodeRegistryApi.create({
        codeType: 'PROCESS_QR',
        targetRoute: '/pages-curtain/process-node/index',
        codeContent
      })
      const url = await QRCode.toDataURL(codeId, { width: 80, margin: 1 })
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
const handlePrint = () => {
  if (!formData.value) return

  const fd = formData.value
  const cName = customerName.value
  const bName = brandName.value

  const thS = 'border:1px solid #D1D5DB;padding:3px 5px;font-weight:600;'
  const tdS = 'border:1px solid #D1D5DB;padding:3px 5px;'

  /** 根据结构索引生成抬头 HTML（含各自二维码） */
  const buildHeaderHtml = (cIdx: number, sIdx: number) => {
    const qrEntry = structureQrCodes.value[`${cIdx}-${sIdx}`]
    const qrImg = qrEntry
      ? `<img src="${qrEntry.url}" width="56" height="56" style="display:block;margin:0 auto;" />
         <div style="font-size:7pt;word-break:break-all;margin-top:2px;line-height:1.2;text-align:center;">${qrEntry.code}</div>`
      : `<div style="width:56px;height:56px;border:1px dashed #bbb;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:9px;">二维码</div>`
    return `
      <div style="display:flex;align-items:flex-start;margin-bottom:4px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:17pt;font-weight:bold;letter-spacing:3px;text-align:center;margin-bottom:3px;">
            ${bName ? bName + '&nbsp;' : ''}加工单
          </div>
          <div style="padding:1px 0;font-size:11pt;font-weight:bold;"><b>订单号：</b>${fd.orderNo || '-'}</div>
          <div style="padding:1px 0;font-size:11pt;font-weight:bold;"><b>客户：</b>${cName}</div>
          <div style="padding:1px 0;font-size:11pt;font-weight:bold;"><b>交付：</b>${fd.deliveryDate || '-'}</div>
          ${fd.note ? `<div style="padding:1px 0;font-size:11pt;font-weight:bold;"><b>备注：</b>${fd.note}</div>` : ''}
        </div>
        <div style="width:60px;flex-shrink:0;padding-left:5px;text-align:center;">${qrImg}</div>
      </div>
      <div style="border-top:1px solid #ccc;margin:3px 0 4px;"></div>
    `
  }

  // 遍历每个窗帘下的每个结构，生成独立页面
  const pages: string[] = []
  for (const [cIdx, curtain] of (fd.curtains || []).entries()) {
    const ctnName = getCurtainName(curtain.curtainId) || (curtain as any).curtainName || '-'
    const mountingsStr = Array.isArray(curtain.mountings)
      ? curtain.mountings.join('、')
      : curtain.mountings || ''

    // 窗帘标题行
    const curtainHeaderHtml = `
      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-left:3px solid #3B82F6;padding:4px 8px;font-weight:600;font-size:11pt;line-height:1.5;margin-bottom:3px;">
        <span style="color:#1D4ED8;">第${cIdx + 1}-${sIdx + 1}套/共${fd.curtains.length}套</span>
        &nbsp;|&nbsp;<span style="font-weight:400;">款式：</span>${ctnName}
        &nbsp;|&nbsp;<span style="font-weight:400;">房间：</span>${curtain.room || '-'}
        ${curtain.pleatRatioValue != null ? `&nbsp;|&nbsp;<span style="font-weight:400;">褶倍：</span>${curtain.pleatRatioValue}` : ''}
        ${(curtain as any).pleatsDistance != null ? `&nbsp;|&nbsp;<span style="font-weight:400;">褶距：</span>${(curtain as any).pleatsDistance}` : ''}
        ${mountingsStr ? `&nbsp;|&nbsp;<span style="font-weight:400;">配件：</span>${mountingsStr}` : ''}
      </div>
      ${curtain.note ? `<div style="padding:2px 8px;font-size:10pt;color:#4B5563;border:1px solid #BFDBFE;border-top:none;margin-bottom:3px;">备注：${curtain.note}</div>` : ''}
    `

    for (const [sIdx, structure] of ((curtain as any).structures || []).entries()) {
      const strName = getStructureName(structure.structureId) || structure.structureName || '-'

      // 结构属性转为 3 列表格
      const attrsArr = getStructureAttrs(structure)
      let attrsGridHtml = ''
      if (attrsArr.length) {
        const rows: ({ label: string; value: string } | null)[][] = []
        for (let i = 0; i < attrsArr.length; i += 3) {
          const cells = attrsArr.slice(i, i + 3) as ({ label: string; value: string } | null)[]
          while (cells.length < 3) cells.push(null)
          rows.push(cells)
        }
        attrsGridHtml = `
          <table style="width:100%;border-collapse:collapse;margin-top:3px;font-size:10.5pt;">
            ${rows
              .map(
                (row) =>
                  `<tr>${row
                    .map(
                      (cell) =>
                        `<td style="width:33.3%;padding:1px 4px;vertical-align:top;">${cell ? `<b>${cell.label}：</b>${cell.value}` : ''}</td>`
                    )
                    .join('')}</tr>`
              )
              .join('')}
          </table>`
      }

      const structureHtml = `
        <div style="background:#F9FAFB;border:1px solid #D1D5DB;padding:4px 8px;color:#374151;margin-bottom:3px;">
          <div style="font-weight:600;font-size:11pt;margin-bottom:3px;">结构 #${sIdx + 1}：${strName}</div>
          ${attrsGridHtml}
        </div>
      `

      const mats: any[] = structure.materials || []
      const materialsHtml = mats.length
        ? `<table style="width:100%;border-collapse:collapse;font-size:10.5pt;margin-top:2px;">
            <thead>
              <tr style="background:#F3F4F6;">
                <th style="${thS}text-align:left;">组件类型</th>
                <th style="${thS}text-align:left;">货号</th>
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
                  <td style="${tdS}text-align:right;">${m.quantity ?? '-'}</td>
                  <td style="${tdS}">${m.note || ''}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>`
        : `<div style="padding:2px 8px;font-size:10pt;color:#9CA3AF;border:1px solid #D1D5DB;">（无用料）</div>`

      pages.push(`<div class="page">${buildHeaderHtml(cIdx, sIdx)}${curtainHeaderHtml}${structureHtml}${materialsHtml}</div>`)
    }
  }

  // 组装完整 HTML，页面尺寸 100mm × 70mm
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bName ? bName + ' ' : ''}加工单 - ${fd.orderNo || ''}</title>
  <style>
    @page { size: 70mm 100mm; margin: 3mm; }
    * { box-sizing: border-box; font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #1a1a1a; font-size: 11pt; }
    b { font-weight: 600; }
    .page { page-break-after: always; overflow: hidden; }
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
