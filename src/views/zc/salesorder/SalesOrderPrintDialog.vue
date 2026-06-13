<!--
  销售单打印预览弹窗
  父组件通过 open(formData) 方法打开，支持打印（含打印机选择）及浏览器截图/另存为PDF
-->
<template>
  <el-dialog v-model="visible" width="860px" top="2vh" :close-on-click-modal="false">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-base font-semibold">销售单预览</span>
        <div class="flex items-center gap-16px mr-24px">
          <!-- 隐藏价格开关：启用后单价和金额全部显示为 *** -->
          <el-checkbox v-model="hidePrices" border size="small" style="color: #DC2626;">隐藏价格</el-checkbox>
          <el-tooltip content="打印 / 选择打印机 / 另存为PDF" placement="top">
            <el-button type="primary" @click="handlePrint">
              <Icon icon="ep:printer" class="mr-4px" />打印
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 预览区，模拟 A4 纸张效果 -->
    <div style="background: #e8e8e8; padding: 20px; max-height: 78vh; overflow-y: auto;">
      <div
        style="
          background: white;
          max-width: 780px;
          margin: 0 auto;
          padding: 32px 36px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          font-size: 13px;
          color: #1a1a1a;
          font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
        "
      >
        <!-- 标题区：居中显示 -->
        <div style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 6px; line-height: 1.2; margin-bottom: 20px;">
          {{ brandName ? brandName + ' ' : '' }}成品销售单
        </div>

        <!-- 订单头信息（无外边框，两列布局） -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px;">
          <tbody>
            <tr>
              <td style="padding: 4px 12px 4px 0; width: 50%; vertical-align: top;">
                <b>客户：</b>{{ customerName }}
              </td>
              <td style="padding: 4px 0 4px 12px; width: 50%; vertical-align: top;">
                <b>订单号：</b>{{ formData?.orderNo || '-' }}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 12px 4px 0; vertical-align: top;">
                <b>物流：</b>{{ logisticName }}
              </td>
              <td style="padding: 4px 0 4px 12px; vertical-align: top;">
                <b>创建人：</b>{{ (formData as any)?.creatorName || '-' }}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 12px 4px 0; vertical-align: top;">
                <b>交付日期：</b>{{ formData?.deliveryDate || '-' }}
              </td>
              <td style="padding: 4px 0 4px 12px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 4px 0; vertical-align: top;">
                <b>送货地址：</b>{{ formData?.deliveryAddress || '-' }}
              </td>
            </tr>
            <tr v-if="formData?.note">
              <td colspan="2" style="padding: 4px 0; vertical-align: top;">
                <b>备注：</b>{{ formData.note }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分隔线 -->
        <div style="border-top: 1px solid #ccc; margin: 12px 0 16px;"></div>

        <!-- 窗帘明细列表 -->
        <div
          v-for="(curtain, idx) in formData?.curtains"
          :key="idx"
          style="margin-bottom: 16px;"
        >
          <!-- 窗帘标题行 -->
          <div
            style="
              background: #EFF6FF;
              border: 1px solid #BFDBFE;
              border-left: 4px solid #3B82F6;
              padding: 8px 12px;
              font-weight: 600;
              font-size: 13px;
              line-height: 1.6;
            "
          >
            <span style="color: #1D4ED8;">窗帘 #{{ idx + 1 }}</span>
            &nbsp;|&nbsp;
            <span style="font-weight: 400;">款式：</span>{{ getCurtainName(curtain.curtainId) || (curtain as any).curtainName || '-' }}
            &nbsp;|&nbsp;
            <span style="font-weight: 400;">房间：</span>{{ curtain.room || '-' }}
            <template v-if="curtain.pleatRatioValue">
              &nbsp;|&nbsp;<span style="font-weight: 400;">褶倍：</span>{{ curtain.pleatRatioValue }}
            </template>
            <template v-if="curtain.pleatsDistance">
              &nbsp;|&nbsp;<span style="font-weight: 400;">褶距：</span>{{ curtain.pleatsDistance }}
            </template>
            <template v-if="curtain.discountRate != null">
              &nbsp;|&nbsp;<span style="font-weight: 400;">折扣率：</span>{{ curtain.discountRate }}
            </template>
            <template v-if="curtain.mountings?.length">
              &nbsp;|&nbsp;<span style="font-weight: 400;">配件：</span>{{ Array.isArray(curtain.mountings) ? curtain.mountings.join('、') : curtain.mountings }}
            </template>
            <span style="float: right; color: #DC2626; font-size: 14px;">
              金额：{{ hidePrices ? '***' : `¥${curtain.amount ?? '-'}` }}
            </span>
          </div>

          <!-- 窗帘备注 -->
          <div v-if="curtain.note" style="padding: 4px 12px; font-size: 12px; color: #4B5563; border: 1px solid #BFDBFE; border-top: none;">
            备注：{{ curtain.note }}
          </div>

          <!-- 结构和用料 -->
          <div
            v-for="(structure, sIdx) in curtain.structures"
            :key="sIdx"
            style="margin-left: 16px; margin-top: 6px;"
          >
            <!-- 结构描述行 -->
            <div style="background: #F9FAFB; border: 1px solid #D1D5DB; padding: 5px 10px; font-size: 12px; color: #374151;">
              <b>结构 #{{ sIdx + 1 }}：</b>{{ getStructureName(structure.structureId) || (structure as any).structureName || '-' }}
              <template v-if="structure.height != null">　高：{{ structure.height }}</template>
              <template v-if="structure.width != null">　宽：{{ structure.width }}</template>
              <template v-if="structure.leftCorner">　左转角：{{ structure.leftCorner }}</template>
              <template v-if="structure.rightCorner">　右转角：{{ structure.rightCorner }}</template>
              <template v-if="structure.pasteDirection">　粘贴方向：{{ getDictLabel(DICT_TYPE.ZC_PASTE_DIRECTION, structure.pasteDirection) }}</template>
              <template v-if="structure.openMethod">　打开方式：{{ getDictLabel(DICT_TYPE.ZC_OPEN_METHOD, structure.openMethod) }}</template>
              <template v-if="structure.processType">　加工类型：{{ getDictLabel(DICT_TYPE.ZC_PROCESS_TYPE, structure.processType) }}</template>
              <template v-if="structure.pleatsNum != null">　总褶数：{{ structure.pleatsNum }}</template>
              <template v-if="structure.pleatsDistance != null">　褶距：{{ structure.pleatsDistance }}</template>
              <template v-if="structure.skirtHeight != null">　裙摆高度：{{ structure.skirtHeight }}</template>
              <template v-if="(structure as any).installProcessName">
                　安装工艺：{{ (structure as any).installProcessName }}
              </template>
              <template v-if="structure.note">　备注：{{ structure.note }}</template>
            </div>

            <!-- 用料表格 -->
            <table
              v-if="(structure as any).materials?.length"
              style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 2px;"
            >
              <thead>
                <tr style="background: #F3F4F6;">
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: left; font-weight: 600;">组件类型</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: left; font-weight: 600;">货号</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: left; font-weight: 600;">批次</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right; font-weight: 600;">单价</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right; font-weight: 600;">用料</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right; font-weight: 600;">折扣率</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right; font-weight: 600;">小计</th>
                  <th style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: left; font-weight: 600;">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, mIdx) in (structure as any).materials" :key="mIdx">
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px;">{{ getElementName(material.elementId) || material.elementName || '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px;">{{ material.productName || '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px;">{{ material.batchNo || '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right;">{{ hidePrices ? '***' : (material.price ?? '-') }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right;">{{ material.quantity ?? '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right;">{{ material.discountRate ?? '-' }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px; text-align: right; font-weight: 600;">{{ hidePrices ? '***' : (material.amount ?? '-') }}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 4px 6px;">{{ material.note || '' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 无用料时提示 -->
            <div
              v-if="!(structure as any).materials?.length"
              style="padding: 4px 10px; font-size: 11px; color: #9CA3AF; border: 1px solid #D1D5DB; border-top: none;"
            >
              （无用料）
            </div>
          </div>
        </div>

        <!-- 金额汇总 -->
        <div style="border-top: 2px solid #333; margin-top: 20px; padding-top: 12px;">
          <div style="display: flex; justify-content: flex-end; gap: 32px; font-size: 13px; align-items: center;">
            <div v-if="formData?.freight">
              <b>运费：</b>{{ hidePrices ? '***' : `¥${formData.freight}` }}
            </div>
            <div v-if="formData?.discountAmount">
              <b>优惠金额：</b>
              <span style="color: #16A34A;">{{ hidePrices ? '***' : `-¥${formData.discountAmount}` }}</span>
            </div>
            <div style="font-size: 16px; font-weight: bold;">
              合计：<span style="color: #DC2626;">{{ hidePrices ? '***' : `¥${formData?.amount ?? 0}` }}</span>
            </div>
          </div>
        </div>

        <!-- 签名区域 -->
        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; color: #555;">
          <div>制单人：________________</div>
          <div>确认人：________________</div>
          <div>客户签字：________________</div>
        </div>

        <!-- 底部提示语 -->
        <div style="margin-top: 20px; font-size: 12px; color: #555; border-top: 1px solid #ddd; padding-top: 10px;">
          尊敬的客户：销售单确认后，布料一经裁剪后一概不予退换。
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import type { CustomerSimpleVO } from '@/api/zc/customer'
import type { BrandSimpleVO } from '@/api/zc/brand'
import type { LogisticsSimpleVO } from '@/api/zc/logistics'
import type { CurtainSimpleVO } from '@/api/zc/curtain'
import type { CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import type { CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'
import type { SalesOrder, SalesOrderCurtain, SalesOrderStructure, ZCSalesOrderMaterial } from '@/api/zc/salesorder'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

/** 销售单打印预览弹窗 */
defineOptions({ name: 'SalesOrderPrintDialog' })

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
/** 隐藏价格模式：开启后单价和金额全部显示为 *** */
const hidePrices = ref(false)

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

/** 物流显示名 */
const logisticName = computed(() => {
  if (!formData.value?.logisticId) return '-'
  return props.logisticsList.find((item) => item.id === formData.value!.logisticId)?.name || '-'
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

// ======================== 对外方法 ========================
/** 打开预览弹窗，传入当前表单数据 */
const open = async (data: FormDataType) => {
  formData.value = data
  visible.value = true
}

defineExpose({ open })

// ======================== 打印 ========================
/**
 * 在新窗口生成干净的销售单 HTML 并自动触发打印对话框。
 * 打印对话框内可选择实体打印机或"另存为 PDF"（等同截图）。
 */
const handlePrint = () => {
  if (!formData.value) return

  const fd = formData.value
  const cName = customerName.value
  const bName = brandName.value
  const lName = logisticName.value

  const thS = 'border:1px solid #D1D5DB;padding:4px 6px;font-weight:600;'
  const tdS = 'border:1px solid #D1D5DB;padding:4px 6px;'
  const infoTd = 'padding:4px 12px 4px 0;vertical-align:top;'
  /** 价格掩码辅助：隐藏价格模式下返回 *** */
  const mp = (val: any, prefix = '') => hidePrices.value ? '***' : `${prefix}${val ?? '-'}`

  // ---- 构建窗帘明细 HTML ----
  const curtainsHtml = (fd.curtains || []).map((curtain, idx) => {
    const ctnName = getCurtainName(curtain.curtainId) || (curtain as any).curtainName || '-'
    const mountingsStr = Array.isArray(curtain.mountings)
      ? curtain.mountings.join('、')
      : curtain.mountings || ''

    const structuresHtml = ((curtain as any).structures || []).map((structure: any, sIdx: number) => {
      const strName = getStructureName(structure.structureId) || structure.structureName || '-'
      const attrs = [
        structure.height != null ? `高：${structure.height}` : '',
        structure.width != null ? `宽：${structure.width}` : '',
        structure.leftCorner ? `左转角：${structure.leftCorner}` : '',
        structure.rightCorner ? `右转角：${structure.rightCorner}` : '',
        structure.pasteDirection ? `粘贴方向：${getDictLabel(DICT_TYPE.ZC_PASTE_DIRECTION, structure.pasteDirection)}` : '',
        structure.openMethod ? `打开方式：${getDictLabel(DICT_TYPE.ZC_OPEN_METHOD, structure.openMethod)}` : '',
        structure.processType ? `加工类型：${getDictLabel(DICT_TYPE.ZC_PROCESS_TYPE, structure.processType)}` : '',
        structure.pleatsNum != null ? `总褶数：${structure.pleatsNum}` : '',
        structure.pleatsDistance != null ? `褶距：${structure.pleatsDistance}` : '',
        structure.skirtHeight != null ? `裙摆高度：${structure.skirtHeight}` : '',
        structure.installProcessName ? `安装工艺：${structure.installProcessName}` : '',
        structure.note ? `备注：${structure.note}` : ''
      ].filter(Boolean).join('　')

      const mats: any[] = structure.materials || []
      const materialsHtml = mats.length
        ? `<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:2px;">
            <thead>
              <tr style="background:#F3F4F6;">
                <th style="${thS}text-align:left;">组件类型</th>
                <th style="${thS}text-align:left;">货号</th>
                <th style="${thS}text-align:left;">批次</th>
                <th style="${thS}text-align:right;">单价</th>
                <th style="${thS}text-align:right;">用料</th>
                <th style="${thS}text-align:right;">折扣率</th>
                <th style="${thS}text-align:right;">小计</th>
                <th style="${thS}text-align:left;">备注</th>
              </tr>
            </thead>
            <tbody>
              ${mats.map((m) => `
                <tr>
                  <td style="${tdS}">${getElementName(m.elementId) || m.elementName || '-'}</td>
                  <td style="${tdS}">${m.productName || '-'}</td>
                  <td style="${tdS}">${m.batchNo || '-'}</td>
                  <td style="${tdS}text-align:right;">${mp(m.price)}</td>
                  <td style="${tdS}text-align:right;">${m.quantity ?? '-'}</td>
                  <td style="${tdS}text-align:right;">${m.discountRate ?? '-'}</td>
                  <td style="${tdS}text-align:right;font-weight:600;">${mp(m.amount)}</td>
                  <td style="${tdS}">${m.note || ''}</td>
                </tr>`).join('')}
            </tbody>
          </table>`
        : `<div style="padding:4px 10px;font-size:11px;color:#9CA3AF;border:1px solid #D1D5DB;border-top:none;">（无用料）</div>`

      return `
        <div style="margin-left:16px;margin-top:6px;">
          <div style="background:#F9FAFB;border:1px solid #D1D5DB;padding:5px 10px;font-size:12px;color:#374151;">
            <b>结构 #${sIdx + 1}：</b>${strName}${attrs ? '　' + attrs : ''}
          </div>
          ${materialsHtml}
        </div>`
    }).join('')

    const noteRow = curtain.note
      ? `<div style="padding:4px 12px;font-size:12px;color:#4B5563;border:1px solid #BFDBFE;border-top:none;">备注：${curtain.note}</div>`
      : ''

    return `
      <div style="margin-bottom:16px;">
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-left:4px solid #3B82F6;padding:8px 12px;font-weight:600;font-size:13px;line-height:1.6;">
          <span style="color:#1D4ED8;">窗帘 #${idx + 1}</span>
          &nbsp;|&nbsp;<span style="font-weight:400;">款式：</span>${ctnName}
          &nbsp;|&nbsp;<span style="font-weight:400;">房间：</span>${curtain.room || '-'}
          ${curtain.pleatRatioValue != null ? `&nbsp;|&nbsp;<span style="font-weight:400;">褶倍：</span>${curtain.pleatRatioValue}` : ''}
          ${curtain.discountRate != null ? `&nbsp;|&nbsp;<span style="font-weight:400;">折扣率：</span>${curtain.discountRate}` : ''}
          ${mountingsStr ? `&nbsp;|&nbsp;<span style="font-weight:400;">配件：</span>${mountingsStr}` : ''}
          <span style="float:right;color:#DC2626;font-size:14px;">金额：${mp(curtain.amount, '¥')}</span>
        </div>
        ${noteRow}
        ${structuresHtml}
      </div>`
  }).join('')

  // ---- 金额汇总 ----
  const summaryHtml = `
    <div style="border-top:2px solid #333;margin-top:20px;padding-top:12px;">
      <div style="display:flex;justify-content:flex-end;gap:32px;font-size:13px;align-items:center;">
        ${fd.freight ? `<div><b>运费：</b>${mp(fd.freight, '¥')}</div>` : ''}
        ${fd.discountAmount ? `<div><b>优惠金额：</b><span style="color:#16A34A;">${hidePrices.value ? '***' : `-¥${fd.discountAmount}`}</span></div>` : ''}
        <div style="font-size:16px;font-weight:bold;">合计：<span style="color:#DC2626;">${mp(fd.amount ?? 0, '¥')}</span></div>
      </div>
    </div>`

  // ---- 组装完整 HTML ----
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bName ? bName + ' ' : ''}销售单 - ${fd.orderNo || ''}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; }
    body { margin: 0; padding: 20px; color: #1a1a1a; font-size: 13px; }
    b { font-weight: 600; }
  </style>
</head>
<body>
  <!-- 标题居中 -->
  <div style="text-align:center;font-size:24px;font-weight:bold;letter-spacing:6px;line-height:1.2;margin-bottom:20px;">
    ${bName ? bName + '&nbsp;' : ''}销售单
  </div>

  <!-- 订单头信息（无外边框） -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
    <tbody>
      <tr>
        <td style="${infoTd}width:50%;"><b>客户：</b>${cName}</td>
        <td style="padding:4px 0 4px 12px;vertical-align:top;width:50%;"><b>订单号：</b>${fd.orderNo || '-'}</td>
      </tr>
      <tr>
        <td style="${infoTd}"><b>物流：</b>${lName}</td>
        <td style="padding:4px 0 4px 12px;vertical-align:top;"><b>创建人：</b>${(fd as any).creatorName || '-'}</td>
      </tr>
      <tr>
        <td style="${infoTd}"><b>交付日期：</b>${fd.deliveryDate || '-'}</td>
        <td style="padding:4px 0 4px 12px;vertical-align:top;"></td>
      </tr>
      <tr>
        <td colspan="2" style="padding:4px 0;vertical-align:top;"><b>送货地址：</b>${fd.deliveryAddress || '-'}</td>
      </tr>
      ${fd.note ? `<tr><td colspan="2" style="padding:4px 0;vertical-align:top;"><b>备注：</b>${fd.note}</td></tr>` : ''}
    </tbody>
  </table>

  <div style="border-top:1px solid #ccc;margin:12px 0 16px;"></div>

  ${curtainsHtml}
  ${summaryHtml}

  <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:13px;color:#555;">
    <div>制单人：________________</div>
    <div>确认人：________________</div>
    <div>客户签字：________________</div>
  </div>

  <div style="margin-top:20px;font-size:12px;color:#555;border-top:1px solid #ddd;padding-top:10px;">
    尊敬的客户：销售单确认后，布料一经裁剪后一概不予退换。
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
  // 部分浏览器需等文档渲染完成才能调用 print
  setTimeout(() => {
    win.focus()
    win.print()
  }, 300)
}
</script>
