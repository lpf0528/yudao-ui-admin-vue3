<!--
  面料单 新增/修改弹窗
  表单顶部（操作栏 + 基础信息三行）与成品单（SalesOrderForm.vue）保持一致
  底部为面料批次列表（货号 / 批次 / 匹数 / 数量 / 单位 / 单价 / 金额 / 备注）
  通过 open(type, id?) 方法打开，成功后 emit('success') 通知父组件刷新列表
-->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%" top="3vh" :close-on-click-modal="false">
    <!-- 顶部操作栏（与成品单一致） -->
    <div class="mb-12px flex items-center gap-8px border-b border-gray-200 pb-12px">
      <el-button type="primary" @click="handleSave" :loading="formLoading">
        <Icon icon="ep:finished" class="mr-4px" />保存
      </el-button>
      <!-- 确认订单按钮：订单已保存且未确认时显示 -->
      <el-button
        v-if="formData.id && formData.status !== ZcSalesOrderStatus.CONFIRMED"
        type="success"
        @click="handleConfirm"
        :loading="formLoading"
      >
        <Icon icon="ep:circle-check" class="mr-4px" />确认订单
      </el-button>
      <!-- 取消确认按钮：订单已确认时显示 -->
      <el-button
        v-if="formData.id && formData.status === ZcSalesOrderStatus.CONFIRMED"
        type="danger"
        @click="handleCancelConfirm"
        :loading="formLoading"
      >
        <Icon icon="ep:circle-close" class="mr-4px" />取消确认
      </el-button>
      <!-- 加急按钮：订单已保存且未加急时显示 -->
      <el-button
        v-if="formData.id && !formData.isExpedited"
        type="warning"
        @click="handleExpedite"
        :loading="formLoading"
      >
        <Icon icon="ep:timer" class="mr-4px" />加急
      </el-button>
      <!-- 销售单预览打印：订单已保存时可打印 -->
      <el-button v-if="formData.id" type="info" @click="handlePrint">
        <Icon icon="ep:printer" class="mr-4px" />销售单
      </el-button>
      <!-- 面料加工单预览打印：订单已保存时可打印 -->
      <el-button v-if="formData.id" type="info" plain @click="handlePrintProcessing">
        <Icon icon="ep:document" class="mr-4px" />加工单
      </el-button>
      <!-- 发货联按钮：订单已保存时显示，打印发货联（品牌+收货信息） -->
      <el-button v-if="formData.id" type="success" plain @click="handlePrintShipping">
        <Icon icon="ep:van" class="mr-4px" />发货联
      </el-button>
    </div>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="68px" v-loading="formLoading">
      <!-- 第一行：flex 流式布局，数字为各字段宽度比例 -->
      <div class="flex gap-x-8px">
        <!-- 订单号 2：较窄，后端自动生成 -->
        <el-form-item label="订单号" prop="orderNo" style="flex: 2.5; min-width: 0">
          <el-input v-model="formData.orderNo" disabled placeholder="" class="w-full" />
        </el-form-item>
        <!-- 客户 3：需展示姓名/联系人，稍宽 -->
        <el-form-item label="客户" prop="customerId" style="flex: 2.5; min-width: 0">
          <div class="flex items-center w-full gap-4px">
            <el-input
              v-model="customerInput"
              placeholder="输入客户名称后回车搜索"
              clearable
              class="flex-1"
              @keyup.enter="handleOpenCustomerSearch"
              @clear="handleClearCustomer"
            />
            <el-button :icon="SearchIcon" circle size="small" @click="handleOpenCustomerSearch" title="搜索客户" />
          </div>
        </el-form-item>
        <!-- 手机 2 -->
        <el-form-item label="手机" prop="mobile" style="flex: 2.5; min-width: 0">
          <el-input v-model="formData.mobile" placeholder="请输入手机" class="w-full" />
        </el-form-item>
        <!-- 下单日期 2 -->
        <el-form-item label="下单日期" prop="orderDate" style="flex: 2.5; min-width: 0">
          <el-date-picker v-model="formData.orderDate" type="date" value-format="YYYY-MM-DD" placeholder="选择下单日期" class="!w-full" :clearable="false" />
        </el-form-item>
        <!-- 品牌 2 -->
        <el-form-item label="品牌" prop="brandId" style="flex: 2.5; min-width: 0">
          <el-select v-model="formData.brandId" clearable filterable placeholder="请选择品牌" class="w-full">
            <el-option v-for="item in props.brandsList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <!-- 物流 2 -->
        <el-form-item label="物流" prop="logisticId" style="flex: 2.5; min-width: 0">
          <el-select v-model="formData.logisticId" clearable filterable placeholder="请选择物流" class="w-full">
            <el-option v-for="item in props.logisticsList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <!-- 收货人 2 -->
        <el-form-item label="收货人" prop="receiver" style="flex: 2.2; min-width: 0">
          <el-input v-model="formData.receiver" placeholder="请输入收货人" class="w-full" />
        </el-form-item>
        <!-- 交付日期 2 -->
        <el-form-item label="交付日期" prop="deliveryDate" style="flex: 2.5; min-width: 0">
          <el-date-picker v-model="formData.deliveryDate" type="date" value-format="YYYY-MM-DD" placeholder="选择交付日期" class="!w-full" />
        </el-form-item>

      </div>

      <!-- 第二行 -->
      <div class="flex gap-x-8px">
        <!-- 送货地址 3：地址文字较长，适当加宽 -->
        <el-form-item label="送货地址" prop="deliveryAddress" style="flex: 4; min-width: 0">
          <el-input v-model="formData.deliveryAddress" placeholder="请输入送货地址" class="w-full" />
        </el-form-item>
        <!-- 运费 2 -->
        <el-form-item label="运费" prop="freight" style="flex: 2; min-width: 0">
          <el-input-number v-model="formData.freight" placeholder="请输入运费" :controls="false" class="!w-full" />
        </el-form-item>
        <!-- 优惠金额 2 -->
        <el-form-item label="优惠金额" prop="discountAmount" style="flex: 2; min-width: 0">
          <el-input-number v-model="formData.discountAmount" placeholder="请输入优惠金额" :controls="false" class="!w-full" />
        </el-form-item>
        <!-- 金额 2 -->
        <el-form-item label="金额" prop="amount" style="flex: 2; min-width: 0">
          <el-input v-model="formData.amount" disabled class="w-full" />
        </el-form-item>
        <!-- 账户余额 2 -->
        <el-form-item label="账户余额" style="flex: 2; min-width: 0">
          <span
            class="text-sm font-medium"
            :class="
              selectedCustomerBalance == null
                ? 'text-gray-700'
                : selectedCustomerBalance < 0
                  ? 'text-red-500'
                  : selectedCustomerBalance > 0
                    ? 'text-green-500'
                    : 'text-gray-700'
            "
          >
            {{ selectedCustomerBalance != null ? selectedCustomerBalance : '-' }}
          </span>
        </el-form-item>
        <!-- 备注 6：剩余空间较多，撑满 -->
        <el-form-item label="备注" prop="note" style="flex: 6; min-width: 0">
          <el-input v-model="formData.note" placeholder="请输入备注" class="w-full" />
        </el-form-item>
      </div>
    </el-form>

    <!-- 面料批次列表 -->
    <el-divider content-position="left">面料列表</el-divider>
    <div style="height: 200px; overflow-y: auto; padding-right: 4px">
      <template v-if="formData.batchs.length > 0">
        <!-- 列表标题行 -->
        <el-row :gutter="12" class="text-xs text-gray-700 font-semibold mb-4px px-4px">
          <el-col :span="1" />
          <el-col :span="5">货号</el-col>
          <el-col :span="3">规格</el-col>
          <el-col :span="4">批次</el-col>
          <el-col :span="3">用料</el-col>
          <el-col :span="3">单价</el-col>
          <el-col :span="3">金额</el-col>
          <el-col :span="2">备注</el-col>
        </el-row>
        <!-- 批次数据行 -->
        <el-row
          v-for="(batch, idx) in formData.batchs"
          :key="idx"
          :gutter="12"
          class="mb-4px items-center rounded bg-blue-50 px-2px py-4px"
        >
          <el-col :span="1" class="flex justify-center">
            <el-button link type="danger" size="small" @click="removeBatch(idx)">
              <Icon icon="ep:delete" />
            </el-button>
          </el-col>
          <!-- 货号（由面板回填，只读展示） -->
          <el-col :span="5">
            <el-input
              v-model="batch.productName"
              placeholder="货号"
              size="small"
              class="!w-full"
              readonly
            />
          </el-col>
          <!-- 规格：有批次时只读展示；仅选产品时可从版本规格列表中下拉选择 -->
          <el-col :span="3">
            <el-select
              v-if="!batch.batchId && batch.specConfs && batch.specConfs.length > 0"
              v-model="batch.spec"
              placeholder="规格"
              size="small"
              class="!w-full"
              clearable
            >
              <el-option
                v-for="sc in batch.specConfs"
                :key="sc.spec"
                :label="sc.spec"
                :value="sc.spec"
              />
            </el-select>
            <el-input
              v-else
              v-model="batch.spec"
              placeholder="规格"
              size="small"
              class="!w-full"
              :readonly="!!batch.batchId"
            />
          </el-col>
          <!-- 批次号（由面板回填，只读展示） -->
          <el-col :span="4">
            <el-input
              v-model="batch.batchNo"
              placeholder="批次"
              size="small"
              class="!w-full"
              readonly
            />
          </el-col>
          <el-col :span="3">
            <el-input-number
              v-model="batch.quantity"
              placeholder="用料"
              size="small"
              :controls="false"
              class="!w-full"
            />
          </el-col>
          <el-col :span="3">
            <el-input-number
              v-model="batch.price"
              placeholder="单价"
              size="small"
              :controls="false"
              class="!w-full"
            />
          </el-col>
          <!-- 金额由数量 × 单价自动计算，禁止手动编辑 -->
          <el-col :span="3">
            <el-input-number
              v-model="batch.amount"
              placeholder="金额"
              size="small"
              :controls="false"
              class="!w-full"
              disabled
            />
          </el-col>
          <el-col :span="2">
            <el-input v-model="batch.note" placeholder="备注" size="small" />
          </el-col>
        </el-row>
      </template>
      <el-empty
        v-else
        description="暂无面料数据，请在下方选择面料"
        :image-size="60"
        class="py-16px"
      />
    </div>

    <!-- 面料选择面板（内嵌，确认后直接追加到上方列表） -->
    <el-divider content-position="left">选择面料</el-divider>
    <ProductBatchSelectPanel @confirm="handleBatchConfirm" />

    <!-- 面料单打印预览弹窗 -->
    <SalesOrderProductPrintDialog
      ref="printDialogRef"
      :customers-list="customersListForPrint"
      :brands-list="props.brandsList"
      :logistics-list="props.logisticsList"
    />
    <!-- 面料加工单打印预览弹窗 -->
    <SalesOrderProductProcessingPrintDialog
      ref="processingPrintDialogRef"
      :customers-list="customersListForPrint"
      :brands-list="props.brandsList"
      :logistics-list="props.logisticsList"
    />
    <!-- 发货联打印预览弹窗 -->
    <SalesOrderProductShippingDialog
      ref="shippingDialogRef"
      :customers-list="customersListForPrint"
      :brands-list="props.brandsList"
      :logistics-list="props.logisticsList"
    />
    <!-- 客户搜索弹窗 -->
    <CustomerSearchDialog ref="customerSearchDialogRef" @select="handleSelectCustomerFromSearch" />
  </Dialog>
</template>

<script setup lang="ts">
import { Search as SearchIcon } from '@element-plus/icons-vue'
import { SalesOrderApi, SalesOrderType, SalesOrderDetailCurtain } from '@/api/zc/salesorder'
import { ZcSalesOrderStatus } from '@/enums/zc/salesOrder'
import { CustomerApi, type Customer, type CustomerSimpleVO } from '@/api/zc/customer'
import { ProductVersionSpecSimpleVO } from '@/api/zc/productversion'
import CustomerSearchDialog from './CustomerSearchDialog.vue'
import { BrandSimpleVO } from '@/api/zc/brand'
import { LogisticsSimpleVO } from '@/api/zc/logistics'
import { CustomerVersionSpcPriceApi } from '@/api/zc/customerversionspcprice'
import ProductBatchSelectPanel, { type BatchConfirmItem } from './ProductBatchSelectPanel.vue'
import SalesOrderProductPrintDialog from './SalesOrderProductPrintDialog.vue'
import SalesOrderProductProcessingPrintDialog from './SalesOrderProductProcessingPrintDialog.vue'
import SalesOrderProductShippingDialog from './SalesOrderProductShippingDialog.vue'

/** 面料单 表单 */
defineOptions({ name: 'SalesOrderProductForm' })

const props = defineProps<{
  brandsList: BrandSimpleVO[]
  logisticsList: LogisticsSimpleVO[]
}>()

const emit = defineEmits(['success', 'open-sales-order-form'])

const { t } = useI18n()
const message = useMessage()

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
/** 当前选中客户的账户余额，选择客户时自动同步 */
const selectedCustomerBalance = ref<number | null>(null)
/** 客户输入框展示文本：搜索前为用户输入，选中后为「简称/联系人」 */
const customerInput = ref('')
/** 当前选中客户信息，供打印弹窗展示客户名称 */
const selectedCustomerInfo = ref<CustomerSimpleVO | null>(null)
const customersListForPrint = computed(() => (selectedCustomerInfo.value ? [selectedCustomerInfo.value] : []))

// ======================== 批次行内部类型 ========================
/**
 * 与 ZCSalesOrderMaterial 兼容字段（productId/batchId/productName/batchNo/unitValue/price），
 * 以便直接传给 ProductBatchSelectDialog 回填；提交时映射为 product_id / batch_id（后端约定）
 */
interface BatchRow {
  id?: number              // 用料明细行 ID（更新时回传，新增行为 undefined）
  curtainRowId?: number    // 窗帘行 ID（更新时回传，新增行为 undefined）
  structureRowId?: number  // 结构行 ID（更新时回传，新增行为 undefined）
  productId?: number       // 产品 ID
  productName?: string     // 货号名称（展示用）
  spec?: string       // 产品规格
  specConfs?: ProductVersionSpecSimpleVO[]  // 当前版本的可选规格列表，仅选产品时用于渲染下拉
  batchId?: number         // 批次 ID
  batchNo?: string         // 批次号（展示用）
  price?: number           // 单价
  quantity?: number        // 数量
  amount?: number          // 金额（数量 × 单价，自动计算）
  note?: string            // 备注
}

// ======================== 表单数据 ========================
/** 从品牌列表中取默认品牌 ID：优先 isDefault=true 的，否则取第一个 */
const getDefaultBrandId = () => {
  const list = props.brandsList
  if (!list?.length) return undefined
  return (list.find((b) => b.isDefault) ?? list[0]).id
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getInitFormData = () => ({
  id: undefined as number | undefined,
  orderNo: undefined as string | undefined,
  customerId: undefined as number | undefined,
  mobile: undefined as string | undefined,
  brandId: undefined as number | undefined,
  orderDate: todayStr() as any,
  logisticId: undefined as number | undefined,
  receiver: undefined as string | undefined,
  deliveryAddress: undefined as string | undefined,
  freight: undefined as number | undefined,
  types: SalesOrderType.FABRIC,
  discountAmount: undefined as number | undefined,
  amount: undefined as any,
  deliveryDate: (() => { const d = new Date(); d.setDate(d.getDate() + 6); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })() as string | undefined,
  payStatus: undefined as string | undefined,
  status: undefined as string | undefined,
  isExpedited: undefined as boolean | undefined,
  note: undefined as string | undefined,
  batchs: [] as BatchRow[],
})

const formData = ref(getInitFormData())

const formRules = {
  customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
  mobile: [{ required: true, message: '手机不能为空', trigger: 'blur' }],
  logisticId: [{ required: true, message: '物流不能为空', trigger: 'blur' }],
  receiver: [{ required: true, message: '收货人不能为空', trigger: 'blur' }],
  deliveryAddress: [{ required: true, message: '送货地址不能为空', trigger: 'blur' }],
}

const formRef = ref()
const printDialogRef = ref<InstanceType<typeof SalesOrderProductPrintDialog>>()
const processingPrintDialogRef = ref<InstanceType<typeof SalesOrderProductProcessingPrintDialog>>()
const shippingDialogRef = ref<InstanceType<typeof SalesOrderProductShippingDialog>>()


// ======================== 客户搜索弹窗 ========================
const customerSearchDialogRef = ref<InstanceType<typeof CustomerSearchDialog>>()

/** 将客户详情转为打印弹窗所需的简要结构 */
const toCustomerSimpleVO = (customer: Customer): CustomerSimpleVO => ({
  id: customer.id,
  shortName: customer.shortName ?? '',
  name: customer.name ?? '',
  mobile: customer.mobile,
  brandId: customer.brandId,
  logisticId: customer.logisticId,
  contactName: customer.contactName ?? '',
  deliveryAddress: customer.deliveryAddress,
  balance: customer.balance
})

/** 回车或点击搜索图标：打开客户搜索弹窗 */
const handleOpenCustomerSearch = () => {
  customerSearchDialogRef.value?.open(customerInput.value)
}

/** 清空客户输入时同步清除已选客户 */
const handleClearCustomer = () => {
  formData.value.customerId = undefined
  selectedCustomerInfo.value = null
  selectedCustomerBalance.value = null
}

/** 编辑时根据 customerId 回填输入框与余额（不再依赖 simple-list） */
const syncCustomerDisplay = async (customerId: number) => {
  try {
    const customer = await CustomerApi.getCustomer(customerId)
    customerInput.value = `${customer.shortName ?? ''}/${customer.contactName ?? ''}`
    selectedCustomerInfo.value = toCustomerSimpleVO(customer)
    selectedCustomerBalance.value = customer.balance
  } catch {
    customerInput.value = ''
    selectedCustomerInfo.value = null
    selectedCustomerBalance.value = null
  }
}

/** 将客户信息回填到表单，并更新已选面料授权价 */
const applyCustomerToForm = async (customer: Customer) => {
  formData.value.customerId = customer.id
  formData.value.mobile = customer.mobile
  formData.value.brandId = customer.brandId ?? getDefaultBrandId()
  formData.value.logisticId = customer.logisticId
  formData.value.receiver = customer.contactName
  formData.value.deliveryAddress = customer.deliveryAddress
  selectedCustomerBalance.value = customer.balance
  const batchs = formData.value.batchs
  if (!batchs.length) return
  await Promise.all(
    batchs.map(async (batch) => {
      if (!batch.productId || !batch.spec) return
      try {
        const priceInfo = await CustomerVersionSpcPriceApi.getByProductAndCustomerAndSpec({
          productId: batch.productId!,
          customerId: customer.id,
          spec: batch.spec
        })
        if (priceInfo?.authorizedPrice != null) batch.price = priceInfo.authorizedPrice
      } catch {}
    })
  )
}

/** 客户搜索弹窗选中回调：直接使用接口返回的完整数据填充表单 */
const handleSelectCustomerFromSearch = async (customer: Customer) => {
  customerInput.value = `${customer.shortName ?? ''}/${customer.contactName ?? ''}`
  selectedCustomerInfo.value = toCustomerSimpleVO(customer)
  await applyCustomerToForm(customer)
}

// ======================== 批次列表操作 ========================
const removeBatch = (index: number) => {
  formData.value.batchs.splice(index, 1)
}

/**
 * 批次弹窗确认回调：将选中项批量追加到面料列表
 * 支持两种情形：有批次（batchId 有值）/ 仅选产品（batchId 为 undefined）
 * 若当前有客户，并发查询各产品的授权价并覆盖单价
 */
const handleBatchConfirm = async (rows: BatchConfirmItem[]) => {
  const customerId = formData.value.customerId
  const newBatchs = await Promise.all(
    rows.map(async (row) => {
      let price = row.onePrice ?? undefined
      if (customerId && row.productId && row.spec) {
        try {
          const priceInfo = await CustomerVersionSpcPriceApi.getByProductAndCustomerAndSpec({
            productId: row.productId,
            customerId,
            spec: row.spec
          })
          if (priceInfo?.authorizedPrice != null) price = priceInfo.authorizedPrice
        } catch {
          // 查询失败保持默认单价
        }
      }
      // 仅选产品（无批次）时携带规格列表；若只有一个规格则自动选中
      const specConfs = row.batchId ? undefined : (row.specConfs ?? undefined)
      const autoSpec = !row.batchId && specConfs?.length === 1 ? specConfs[0].spec : row.spec
      return {
        productId: row.productId,
        productName: row.productName,
        spec: autoSpec,
        specConfs,
        batchId: row.batchId,   // 仅选产品时为 undefined
        batchNo: row.batchNo,
        price,
        quantity: undefined,
        amount: undefined,
        note: undefined,
      } as BatchRow
    })
  )
  formData.value.batchs.push(...newBatchs)
}

// ======================== 金额自动计算 ========================
const round2 = (val: number) => Math.round(val * 100) / 100

/**
 * 监听整个表单变化，自动计算：
 * 1. 批次行金额 = 数量 × 单价，保留两位小数
 * 2. 订单金额 = 所有批次行金额之和 + 运费 - 优惠金额，保留两位小数
 */
watch(
  () => formData.value,
  (form) => {
    let batchTotal = 0
    form.batchs.forEach((batch) => {
      batch.amount =
        batch.quantity != null || batch.price != null
          ? round2((batch.quantity ?? 0) * (batch.price ?? 0))
          : undefined
      batchTotal += batch.amount ?? 0
    })
    form.amount = round2(batchTotal + (form.freight ?? 0) - (form.discountAmount ?? 0)) as any
  },
  { deep: true }
)

// ======================== 弹窗控制 ========================

/**
 * 将后端返回的 curtains 三层结构映射为面料批次行列表。
 * 面料单每个 curtain 固定对应 structures[0].materials[0]，需同时保存三层 id
 * 以便整单更新时后端能做 UPDATE/INSERT/DELETE 三路 merge。
 */
const mapCurtainsToBatchRows = (curtains: SalesOrderDetailCurtain[]): BatchRow[] =>
  curtains.map((c) => {
    const s = c.structures?.[0]
    const m = s?.materials?.[0] ?? {}
    return {
      curtainRowId: c.id,      // 窗帘行 ID，更新时必须回传
      structureRowId: s?.id,   // 结构行 ID，更新时必须回传
      id: m.id,                // 用料明细行 ID，更新时必须回传
      productId: m.productId,
      productName: m.productName,
      spec: m.spec,
      batchId: m.batchId,
      batchNo: m.batchNo,
      price: m.price,
      quantity: m.quantity,
      amount: m.amount,
      note: m.note,
    }
  })

/** 打开弹窗；编辑模式下从接口加载数据并回填批次列表 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增面料单' : '编辑面料单'
  formType.value = type
  resetForm()
  // 新建时自动选中默认品牌
  if (type === 'create') {
    formData.value.brandId = getDefaultBrandId()
  }
  if (id) {
    formLoading.value = true
    try {
      const data = await SalesOrderApi.getSalesOrderDetail(id)
      formData.value = {
        ...data,
        batchs: mapCurtainsToBatchRows(data.curtains ?? []),
      } as any
      if (data?.customerId) {
        await syncCustomerDisplay(data.customerId)
      }
    } finally {
      formLoading.value = false
    }
  }
  await nextTick()
  syncSavedSnapshot()
}
defineExpose({ open })

const resetForm = () => {
  formData.value = getInitFormData()
  customerInput.value = ''
  selectedCustomerInfo.value = null
  selectedCustomerBalance.value = null
  formRef.value?.resetFields()
}

/** 组装面料单提交/脏检查用的 payload（与 fabric 接口字段对齐） */
const buildSubmitPayload = () => {
  const form = formData.value
  const batchTotal = form.batchs.reduce((sum, b) => sum + (b.amount ?? 0), 0)
  return {
    id: form.id,
    customerId: form.customerId,
    mobile: form.mobile,
    brandId: form.brandId,
    orderDate: form.orderDate,
    deliveryDate: form.deliveryDate,
    logisticId: form.logisticId,
    receiver: form.receiver,
    deliveryAddress: form.deliveryAddress,
    freight: form.freight,
    discountAmount: form.discountAmount,
    totalAmount: round2(batchTotal + (form.freight ?? 0)),
    amount: form.amount,
    note: form.note,
    curtains: form.batchs.map((b) => ({
      id: b.curtainRowId,
      amount: b.amount,
      note: b.note,
      structures: [{
        id: b.structureRowId,
        materials: [{
          id: b.id,
          productId: b.productId,
          batchId: b.batchId,
          spec: b.spec,
          price: b.price,
          quantity: b.quantity,
          amount: b.amount,
          note: b.note
        }]
      }]
    }))
  }
}

/** 上次保存/加载时的表单快照，用于检测是否有未保存修改 */
const savedFormSnapshot = ref('')

const syncSavedSnapshot = () => {
  savedFormSnapshot.value = JSON.stringify(buildSubmitPayload())
}

const isFormDirty = () => savedFormSnapshot.value !== JSON.stringify(buildSubmitPayload())

/** 非保存类操作前校验：有未保存修改则提醒用户先保存 */
const ensureSavedBeforeAction = (): boolean => {
  if (isFormDirty()) {
    message.warning('订单信息已修改，请先保存')
    return false
  }
  return true
}

// ======================== 提交 ========================
const handleSave = () => submitForm()

const submitForm = async () => {
  await formRef.value.validate()
  if (!formData.value.batchs || formData.value.batchs.length === 0) {
    message.warning('请至少添加一条面料数据')
    return
  }
  formLoading.value = true
  try {
    const fabricPayload = buildSubmitPayload()
    if (formType.value === 'create') {
      const { id: _omit, ...createPayload } = fabricPayload
      const newId = await SalesOrderApi.createSalesOrderFabric(createPayload)
      message.success(t('common.createSuccess'))
      // 创建成功后立即拉取详情，回填后端生成的字段（订单号、三层 ID 等），并切换为编辑模式
      const detail = await SalesOrderApi.getSalesOrderDetail(newId)
      formData.value = {
        ...detail,
        batchs: mapCurtainsToBatchRows(detail.curtains ?? []),
      } as any
      formType.value = 'update'
      dialogTitle.value = '编辑面料单'
    } else {
      await SalesOrderApi.updateSalesOrderFabric(fabricPayload)
      message.success(t('common.updateSuccess'))
    }
    emit('success')
    await nextTick()
    syncSavedSnapshot()
  } finally {
    formLoading.value = false
  }
}

// ======================== 确认 / 取消确认 / 加急 ========================
const handleConfirm = async () => {
  if (!ensureSavedBeforeAction()) return
  formLoading.value = true
  try {
    await SalesOrderApi.confirmSalesOrder(formData.value.id!)
    formData.value.status = ZcSalesOrderStatus.CONFIRMED
    message.success('确认订单成功')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleCancelConfirm = async () => {
  if (!ensureSavedBeforeAction()) return
  formLoading.value = true
  try {
    await SalesOrderApi.cancelConfirmSalesOrder(formData.value.id!)
    formData.value.status = ZcSalesOrderStatus.UNCONFIRMED
    message.success('取消确认成功')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleExpedite = async () => {
  if (!ensureSavedBeforeAction()) return
  formLoading.value = true
  try {
    await SalesOrderApi.expeditedSalesOrder(formData.value.id!)
    message.success('设置加急成功')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// ======================== 打印 ========================
/** 打开面料单销售单打印预览弹窗 */
const handlePrint = () => {
  if (!ensureSavedBeforeAction()) return
  printDialogRef.value?.open(formData.value as any)
}

/** 打开面料加工单打印预览弹窗 */
const handlePrintProcessing = () => {
  if (!ensureSavedBeforeAction()) return
  processingPrintDialogRef.value?.open(formData.value as any)
}

/** 打开发货联打印预览弹窗 */
const handlePrintShipping = () => {
  if (!ensureSavedBeforeAction()) return
  shippingDialogRef.value?.open(formData.value as any)
}
</script>

<style scoped>
/* flex 流式布局中防止 label 因列宽过窄换行；:deep() 穿透 Element Plus 内部 DOM */
:deep(.el-form-item__label) { white-space: nowrap; }
</style>
