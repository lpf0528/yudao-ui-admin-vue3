<!--
  面料单 新增/修改弹窗
  表单顶部（操作栏 + 基础信息三行）与成品单（SalesOrderForm.vue）保持一致
  底部为面料批次列表（货号 / 批次 / 匹数 / 数量 / 单位 / 单价 / 金额 / 备注）
  通过 open(type, id?) 方法打开，成功后 emit('success') 通知父组件刷新列表
-->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%" top="3vh">
    <!-- 顶部操作栏（与成品单一致） -->
    <div class="mb-12px flex items-center gap-8px border-b border-gray-200 pb-12px">
      <el-button type="primary" @click="handleSave" :loading="formLoading">
        <Icon icon="ep:finished" class="mr-4px" />保存
      </el-button>
      <!-- 确认订单按钮：订单已保存且未确认时显示 -->
      <el-button
        v-if="formData.id && formData.status !== 'confirmed'"
        type="success"
        @click="handleConfirm"
        :loading="formLoading"
      >
        <Icon icon="ep:circle-check" class="mr-4px" />确认订单
      </el-button>
      <!-- 取消确认按钮：订单已确认时显示 -->
      <el-button
        v-if="formData.id && formData.status === 'confirmed'"
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
    </div>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" v-loading="formLoading">
      <!-- 第一行：订单号、客户、手机、下单日期、品牌 -->
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="订单号" prop="orderNo">
            <!-- 订单号由后端自动生成，前端只读展示 -->
            <el-input v-model="formData.orderNo" disabled placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="客户" prop="customerId">
            <el-select
              v-model="formData.customerId"
              clearable
              placeholder="请选择客户"
              class="w-1/1"
              @change="handleCustomerChange"
            >
              <el-option
                v-for="item in props.customersList"
                :key="item.id"
                :label="`${item.shortName}/${item.contactName}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入手机" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="下单日期" prop="orderDate">
            <el-date-picker
              v-model="formData.orderDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择下单日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="品牌" prop="brandId">
            <el-select v-model="formData.brandId" clearable placeholder="请选择品牌" class="w-1/1">
              <el-option
                v-for="item in props.brandsList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行：物流、收货人、送货地址、交付日期 -->
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="物流" prop="logisticId">
            <el-select v-model="formData.logisticId" clearable placeholder="请选择物流" class="w-1/1">
              <el-option
                v-for="item in props.logisticsList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="收货人" prop="receiver">
            <el-input v-model="formData.receiver" placeholder="请输入收货人" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="送货地址" prop="deliveryAddress">
            <el-input v-model="formData.deliveryAddress" placeholder="请输入送货地址" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="交付日期" prop="deliveryDate">
            <el-date-picker
              v-model="formData.deliveryDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择交付日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行：运费、优惠金额、金额、账户余额、备注 -->
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="运费" prop="freight">
            <el-input-number
              v-model="formData.freight"
              placeholder="请输入运费"
              :controls="false"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="优惠金额" prop="discountAmount">
            <el-input-number
              v-model="formData.discountAmount"
              placeholder="请输入优惠金额"
              :controls="false"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="金额" prop="amount">
            <el-input v-model="formData.amount" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="账户余额">
            <span
              class="text-sm font-medium"
              :class="(selectedCustomerBalance ?? 0) < 0 ? 'text-red-500' : 'text-gray-700'"
            >
              {{ selectedCustomerBalance != null ? selectedCustomerBalance : '-' }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 面料批次列表 -->
    <el-divider content-position="left">面料列表</el-divider>
    <el-button type="primary" link class="mb-8px" @click="openBatchDialog">+ 添加面料</el-button>
    <div style="max-height: 50vh; overflow-y: auto; padding-right: 4px">
      <template v-if="formData.batchs.length > 0">
        <!-- 列表标题行 -->
        <el-row :gutter="12" class="text-xs text-gray-700 font-semibold mb-4px px-4px">
          <el-col :span="1" />
          <el-col :span="4">货号</el-col>
          <el-col :span="4">批次</el-col>
          <el-col :span="2">匹数</el-col>
          <el-col :span="2">数量</el-col>
          <el-col :span="2">单位</el-col>
          <el-col :span="3">单价</el-col>
          <el-col :span="3">金额</el-col>
          <el-col :span="3">备注</el-col>
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
          <!-- 货号（由弹窗回填，只读展示） -->
          <el-col :span="4">
            <el-input
              v-model="batch.productName"
              placeholder="货号"
              size="small"
              class="!w-full"
              readonly
            />
          </el-col>
          <!-- 批次号（由弹窗回填，只读展示） -->
          <el-col :span="4">
            <el-input
              v-model="batch.batchNo"
              placeholder="批次"
              size="small"
              class="!w-full"
              readonly
            />
          </el-col>
          <el-col :span="2">
            <el-input-number
              v-model="batch.pishu"
              placeholder="匹数"
              size="small"
              :controls="false"
              class="!w-full"
            />
          </el-col>
          <el-col :span="2">
            <el-input-number
              v-model="batch.quantity"
              placeholder="数量"
              size="small"
              :controls="false"
              class="!w-full"
            />
          </el-col>
          <el-col :span="2">
            <el-select v-model="batch.unitValue" clearable placeholder="单位" size="small" class="w-1/1">
              <el-option
                v-for="dict in getStrDictOptions(DICT_TYPE.ZC_PRODUCT_UNIT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
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
          <!-- 金额由匹数 × 单价自动计算，禁止手动编辑 -->
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
          <el-col :span="3">
            <el-input v-model="batch.note" placeholder="备注" size="small" />
          </el-col>
        </el-row>
      </template>
      <el-empty
        v-else
        description="暂无面料数据，请点击上方按钮添加"
        :image-size="60"
        class="py-16px"
      />
    </div>

    <!-- 批次选择弹窗（多选版） -->
    <ProductBatchSelectDialog ref="batchSelectRef" @confirm="handleBatchConfirm" />
  </Dialog>
</template>

<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { SalesOrderProductApi } from '@/api/zc/salesorder'
import { CustomerSimpleVO } from '@/api/zc/customer'
import { BrandSimpleVO } from '@/api/zc/brand'
import { LogisticsSimpleVO } from '@/api/zc/logistics'
import { CustomerProductPriceApi } from '@/api/zc/customerproductprice'
import ProductBatchSelectDialog, { type BatchConfirmItem } from './ProductBatchSelectDialog2.vue'

/** 面料单 表单 */
defineOptions({ name: 'SalesOrderProductForm' })

const props = defineProps<{
  customersList: CustomerSimpleVO[]
  brandsList: BrandSimpleVO[]
  logisticsList: LogisticsSimpleVO[]
}>()

const emit = defineEmits(['success'])

const { t } = useI18n()
const message = useMessage()

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
/** 当前选中客户的账户余额，选择客户时自动同步 */
const selectedCustomerBalance = ref<number | null>(null)

// ======================== 批次行内部类型 ========================
/**
 * 与 ZCSalesOrderMaterial 兼容字段（productId/batchId/productName/batchNo/unitValue/price），
 * 以便直接传给 ProductBatchSelectDialog 回填；提交时映射为 product_id / batch_id（后端约定）
 */
interface BatchRow {
  productId?: number    // 产品 ID → 提交为 product_id
  productName?: string  // 货号名称（展示用）
  batchId?: number      // 批次 ID → 提交为 batch_id
  batchNo?: string      // 批次号（展示用）
  unitValue?: string    // 计量单位
  price?: number        // 单价
  pishu?: number        // 匹数
  quantity?: number     // 数量
  amount?: number       // 金额（匹数 × 单价，自动计算）
  note?: string         // 备注
}

// ======================== 表单数据 ========================
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
  types: 'mianLiao',
  discountAmount: undefined as number | undefined,
  amount: undefined as any,
  deliveryDate: undefined as string | undefined,
  payStatus: undefined as string | undefined,
  status: undefined as string | undefined,
  isExpedited: undefined as boolean | undefined,
  note: undefined as string | undefined,
  batchs: [] as BatchRow[],
})

const formData = ref(getInitFormData())

const formRules = {
  customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
  orderDate: [{ required: true, message: '下单日期不能为空', trigger: 'blur' }],
}

const formRef = ref()
const batchSelectRef = ref<InstanceType<typeof ProductBatchSelectDialog>>()

/** 打开批次多选弹窗，并传入已加入表单的批次 ID，避免重复选择 */
const openBatchDialog = () => {
  const existingIds = formData.value.batchs
    .map((b) => b.batchId)
    .filter((id): id is number => id != null)
  batchSelectRef.value?.open(existingIds)
}

// ======================== 客户选择 ========================
/** 选择客户后自动回填手机、品牌、物流、收货人、送货地址，并同步账户余额 */
const handleCustomerChange = (customerId: number) => {
  const customer = props.customersList.find((item) => item.id === customerId)
  if (!customer) {
    selectedCustomerBalance.value = null
    return
  }
  formData.value.mobile = customer.mobile
  formData.value.brandId = customer.brandId
  formData.value.logisticId = customer.logisticId
  formData.value.receiver = customer.contactName
  formData.value.deliveryAddress = customer.deliveryAddress
  selectedCustomerBalance.value = customer.balance
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
      let price = row.productPrice ?? undefined
      if (customerId && row.productId) {
        try {
          const priceInfo = await CustomerProductPriceApi.getByCustomerAndProduct(
            customerId,
            row.productId
          )
          if (priceInfo?.authorizedPrice != null) price = priceInfo.authorizedPrice
        } catch {
          // 查询失败保持 productPrice
        }
      }
      return {
        productId: row.productId,
        productName: row.productName,
        batchId: row.batchId,   // 仅选产品时为 undefined
        batchNo: row.batchNo,
        unitValue: row.unitValue,
        price,
        pishu: undefined,
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
 * 1. 批次行金额 = 匹数 × 单价，保留两位小数
 * 2. 订单金额 = 所有批次行金额之和 + 运费 - 优惠金额，保留两位小数
 */
watch(
  () => formData.value,
  (form) => {
    let batchTotal = 0
    form.batchs.forEach((batch) => {
      batch.amount =
        batch.pishu != null || batch.price != null
          ? round2((batch.pishu ?? 0) * (batch.price ?? 0))
          : undefined
      batchTotal += batch.amount ?? 0
    })
    form.amount = round2(batchTotal + (form.freight ?? 0) - (form.discountAmount ?? 0)) as any
  },
  { deep: true }
)

// ======================== 弹窗控制 ========================
/** 打开弹窗；编辑模式下从接口加载数据并回填批次列表 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增面料单' : '编辑面料单'
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      const data = await SalesOrderProductApi.getSalesOrderProduct(id)
      formData.value = {
        ...data,
        // 后端返回 snake_case 字段，映射为前端 camelCase 以便与批次选择弹窗兼容
        batchs: (data.batchs ?? []).map((b: any) => ({
          productId: b.product_id,
          productName: b.productName,
          batchId: b.batch_id,
          batchNo: b.batchNo,
          unitValue: b.unitValue,
          price: b.price,
          pishu: b.pishu,
          quantity: b.quantity,
          amount: b.amount,
          note: b.note,
        })),
      }
      if (data?.customerId) {
        const customer = props.customersList.find((item) => item.id === data.customerId)
        selectedCustomerBalance.value = customer?.balance ?? null
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const resetForm = () => {
  formData.value = getInitFormData()
  selectedCustomerBalance.value = null
  formRef.value?.resetFields()
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
    // 将前端 camelCase 批次行映射为后端约定的 snake_case 字段
    const payload = {
      ...formData.value,
      batchs: formData.value.batchs.map((b) => ({
        product_id: b.productId,
        batch_id: b.batchId,
        pishu: b.pishu,
        quantity: b.quantity,
        price: b.price,
        amount: b.amount,
      })),
    }
    if (formType.value === 'create') {
      await SalesOrderProductApi.createSalesOrderProduct(payload as any)
      message.success(t('common.createSuccess'))
    } else {
      await SalesOrderProductApi.updateSalesOrderProduct(payload as any)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// ======================== 确认 / 取消确认 / 加急 ========================
const handleConfirm = async () => {
  formLoading.value = true
  try {
    await SalesOrderProductApi.confirmSalesOrderProduct(formData.value.id!)
    message.success('确认订单成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleCancelConfirm = async () => {
  formLoading.value = true
  try {
    await SalesOrderProductApi.cancelConfirmSalesOrderProduct(formData.value.id!)
    message.success('取消确认成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleExpedite = async () => {
  formLoading.value = true
  try {
    await SalesOrderProductApi.expeditedSalesOrderProduct(formData.value.id!)
    message.success('设置加急成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
