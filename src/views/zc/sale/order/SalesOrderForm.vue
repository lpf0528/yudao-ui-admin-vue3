<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1180px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
      :disabled="formType === 'detail'"
    >
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="订单号">
            <el-input disabled placeholder="保存自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户" prop="customerId">
            <el-input-number v-model="formData.customerId" :min="1" controls-position="right" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="下单日期" prop="orderDate">
            <el-date-picker v-model="formData.orderDate" type="date" value-format="YYYY-MM-DD" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="订单类型" prop="types">
            <el-radio-group v-model="formData.types">
              <el-radio label="curtain">成品帘</el-radio>
              <el-radio label="fabric">面料单</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="送货地址" prop="deliveryAddress">
            <el-input v-model="formData.deliveryAddress" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="订单金额" prop="amount">
            <el-input-number v-model="formData.amount" :min="0" :precision="2" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>

      <template v-if="formData.types === 'curtain'">
        <el-divider content-position="left">窗帘明细</el-divider>
        <CurtainLineList v-model="formData.curtains" />
      </template>
      <template v-else>
        <el-divider content-position="left">面料明细</el-divider>
        <el-button type="primary" link class="mb-8px" @click="addFabricLine">+ 面料行</el-button>
        <el-table :data="formData.fabricLines" border size="small">
          <el-table-column label="货号ID" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.productId" :min="0" controls-position="right" class="!w-full" />
            </template>
          </el-table-column>
          <el-table-column label="批次ID" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.batchId" :min="0" controls-position="right" class="!w-full" />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="0" :precision="4" class="!w-full" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" class="!w-full" />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.amount" :min="0" :precision="2" class="!w-full" />
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.note" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" @click="removeFabricLine($index)">删</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="formLoading" v-if="formType !== 'detail'">
        确 定
      </el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { ZcSalesOrderApi, ZcSalesOrderSaveVO } from '@/api/zc/sales/order'
import CurtainLineList from './components/CurtainLineList.vue'

defineOptions({ name: 'ZcSalesOrderForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update' | 'detail'>('create')
const formRef = ref()

const emptyForm = (): ZcSalesOrderSaveVO => ({
  customerId: undefined as any,
  orderDate: dayjs().format('YYYY-MM-DD'),
  deliveryAddress: '',
  types: 'curtain',
  amount: undefined,
  note: '',
  curtains: [],
  fabricLines: []
})

const formData = ref<ZcSalesOrderSaveVO>(emptyForm())

const formRules = reactive({
  customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
  orderDate: [{ required: true, message: '下单日期不能为空', trigger: 'change' }],
  deliveryAddress: [{ required: true, message: '送货地址不能为空', trigger: 'blur' }],
  types: [{ required: true, message: '订单类型不能为空', trigger: 'change' }]
})

const reset = () => {
  formData.value = emptyForm()
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update' | 'detail', id?: number) => {
  dialogVisible.value = true
  formType.value = type
  reset()
  dialogTitle.value =
    type === 'create' ? '新建销售订单' : type === 'update' ? '编辑销售订单' : '销售订单详情'
  if ((type === 'update' || type === 'detail') && id) {
    formLoading.value = true
    try {
      const data = await ZcSalesOrderApi.get(id)
      formData.value = {
        id: data.id,
        customerId: data.customerId,
        mobile: data.mobile,
        brandId: data.brandId,
        category: data.category,
        orderDate: data.orderDate,
        logisticId: data.logisticId,
        receiver: data.receiver,
        deliveryAddress: data.deliveryAddress,
        freight: data.freight,
        types: data.types,
        amount: data.amount,
        deliveryDate: data.deliveryDate,
        isExpedited: data.isExpedited,
        note: data.note,
        curtains: data.curtains || [],
        fabricLines: data.fabricLines || []
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])

const addFabricLine = () => {
  if (!formData.value.fabricLines) formData.value.fabricLines = []
  formData.value.fabricLines.push({
    productId: undefined,
    batchId: undefined,
    quantity: undefined,
    price: undefined,
    amount: undefined,
    note: ''
  })
}

const removeFabricLine = (index: number) => {
  formData.value.fabricLines!.splice(index, 1)
}

watch(
  () => formData.value.types,
  (v) => {
    if (v === 'fabric' && (!formData.value.fabricLines || formData.value.fabricLines.length === 0)) {
      addFabricLine()
    }
  }
)

const submit = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    const payload = { ...formData.value }
    if (payload.types === 'curtain') {
      payload.fabricLines = []
    } else {
      payload.curtains = []
    }
    if (formType.value === 'create') {
      await ZcSalesOrderApi.create(payload)
      message.success(t('common.createSuccess'))
    } else {
      await ZcSalesOrderApi.update(payload)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
