<!--
  销售订单 - 新增收款弹窗
  功能：选择客户后，自动加载该客户未结清/部分结清且已确认的订单，填写收款信息后提交
  使用方：views/zc/salesorder/index.vue
-->
<template>
  <Dialog title="新增收款" v-model="dialogVisible" width="70%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- ======================== 基本信息 ======================== -->
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="选择客户" prop="customerId">
            <el-select
              v-model="formData.customerId"
              placeholder="请选择客户"
              clearable
              filterable
              class="!w-full"
              @change="handleCustomerChange"
            >
              <el-option
                v-for="item in customersList"
                :key="item.id"
                :label="`${item.shortName}/${item.contactName}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="收款日期" prop="collectionDate">
            <el-date-picker
              v-model="formData.collectionDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择收款日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="收支方式" prop="paymentId">
            <el-select
              v-model="formData.paymentId"
              placeholder="请选择收支方式"
              clearable
              class="!w-full"
            >
              <el-option
                v-for="item in billMethodsList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="优惠金额" prop="discountAmount">
            <el-input-number
              v-model="formData.discountAmount"
              :min="0"
              :precision="2"
              placeholder="请输入优惠金额"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="实收金额" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :min="0"
              :precision="2"
              placeholder="请输入实收金额"
              class="!w-full"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" placeholder="请输入备注" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="附件1">
            <UploadImg v-model="formData.image1" width="90px" height="90px" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="附件2">
            <UploadImg v-model="formData.image2" width="90px" height="90px" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- ======================== 订单分摊 ======================== -->
      <el-divider content-position="left">分摊到订单（已确认、未结清）</el-divider>
      <div v-if="!formData.customerId" class="text-center text-gray-400 py-20px text-sm">
        请先选择客户以加载相关订单
      </div>
      <div v-else-if="ordersLoading" class="text-center py-20px">
        <el-text type="info">加载订单中...</el-text>
      </div>
      <div v-else-if="orderList.length === 0" class="text-center text-gray-400 py-20px text-sm">
        该客户暂无未结清的已确认订单
      </div>
      <el-table v-else :data="orderList" size="small" border>
        <el-table-column label="订单号" prop="orderNo" min-width="140" />
        <el-table-column label="下单日期" prop="orderDate" width="110">
          <template #default="{ row }">{{ formatDate(row.orderDate) }}</template>
        </el-table-column>
        <el-table-column label="订单金额" prop="amount" width="110" align="right" />
        <el-table-column label="已收金额" prop="amountReceived" width="110" align="right" />
        <el-table-column label="结算状态" prop="payStatus" width="100" align="center">
          <template #default="{ row }">
            <dict-tag :type="DICT_TYPE.ZC_ORDER_PAY_STATUS" :value="row.payStatus" />
          </template>
        </el-table-column>
        <el-table-column label="本次收款" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="allocMap[row.id]"
              :min="0"
              :precision="2"
              size="small"
              class="!w-full"
              @change="syncAllocs"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submitForm">确认</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { DICT_TYPE } from '@/utils/dict'
import { ZcCollectionApi, ZcCollectionSaveVO } from '@/api/zc/finance/collection'
import { SalesOrderApi, SalesOrder } from '@/api/zc/salesorder'
import { BillMethodsApi, BillMethods } from '@/api/zc/bill_methods'
import type { CustomerSimpleVO } from '@/api/zc/customer'
import { UploadImg } from '@/components/UploadFile'

// ======================== Props / Emits ========================
const props = defineProps<{
  customersList: CustomerSimpleVO[]
}>()
const emit = defineEmits(['success'])

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
const formLoading = ref(false)
const submitLoading = ref(false)

// ======================== 表单数据 ========================
const formRef = ref()
const formData = reactive<ZcCollectionSaveVO>({
  collectionDate: dayjs().format('YYYY-MM-DD'),
  customerId: undefined as unknown as number,
  amount: undefined as unknown as number,
  discountAmount: 0,
  paymentId: undefined,
  image1: undefined,
  image2: undefined,
  note: undefined,
  allocs: []
})

const formRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  collectionDate: [{ required: true, message: '请选择收款日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入实收金额', trigger: 'blur' }]
}

// ======================== 订单列表 ========================
/** 该客户可分摊的订单列表 */
const orderList = ref<SalesOrder[]>([])
const ordersLoading = ref(false)
/** 每条订单对应的本次收款金额，key 为 orderId */
const allocMap = reactive<Record<number, number | undefined>>({})

/** 客户切换时重新加载订单 */
const handleCustomerChange = async (customerId: number | undefined) => {
  orderList.value = []
  Object.keys(allocMap).forEach((k) => delete allocMap[Number(k)])
  formData.allocs = []
  if (!customerId) return

  ordersLoading.value = true
  try {
    const data = await SalesOrderApi.getSalesOrderPage({
      pageNo: 1,
      pageSize: 100,
      customerId,
      payStatus: ['unpaid', 'partialpaid'],
      isConfirm: true
    })
    orderList.value = data.list ?? []
  } finally {
    ordersLoading.value = false
  }
}

/** 将 allocMap 同步回 formData.allocs */
const syncAllocs = () => {
  formData.allocs = Object.entries(allocMap)
    .filter(([, v]) => v != null && v > 0)
    .map(([k, v]) => ({ orderId: Number(k), payAmount: v as number }))
}

// ======================== 收支方式 ========================
const billMethodsList = ref<BillMethods[]>([])


const loadBillMethods = async () => {
  const data = await BillMethodsApi.getBillMethodsPage({ pageNo: 1, pageSize: 200 })
  billMethodsList.value = data.list ?? []
}

// ======================== 工具函数 ========================
const formatDate = (val: string | number | undefined) => {
  if (!val) return ''
  return dayjs(val).format('YYYY-MM-DD')
}

// ======================== 弹窗控制 ========================
/** 打开弹窗，由父组件调用 */
const open = async () => {
  dialogVisible.value = true
  formLoading.value = true
  try {
    // 重置表单（image 字段用空字符串触发 UploadFile 内部清空）
    Object.assign(formData, {
      collectionDate: dayjs().format('YYYY-MM-DD'),
      customerId: undefined,
      amount: undefined,
      discountAmount: 0,
      paymentId: undefined,
      image1: '',
      image2: '',
      note: undefined,
      allocs: []
    })
    orderList.value = []
    Object.keys(allocMap).forEach((k) => delete allocMap[Number(k)])
    formRef.value?.resetFields()
    await loadBillMethods()
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

// ======================== 提交 ========================
const message = useMessage()

const submitForm = async () => {
  await formRef.value?.validate()
  syncAllocs()
  submitLoading.value = true
  try {
    await ZcCollectionApi.create(formData)
    message.success('收款单创建成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    submitLoading.value = false
  }
}
</script>
