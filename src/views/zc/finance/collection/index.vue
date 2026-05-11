<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" inline label-width="80px">
      <el-form-item label="客户ID" prop="customerId">
        <el-input-number v-model="queryParams.customerId" :min="0" controls-position="right" class="!w-220px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button type="primary" plain @click="openDialog" v-hasPermi="['zc:collection:create']">
          <Icon icon="ep:plus" class="mr-5px" />新建收款
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="收款单号" prop="collectionNo" min-width="160" />
      <el-table-column label="客户ID" prop="customerId" width="100" />
      <el-table-column label="金额" prop="amount" width="120" />
      <el-table-column label="日期" prop="collectionDate" width="120" />
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <Dialog title="新建收款单" v-model="dialogVisible" width="640px">
    <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="100px">
      <el-form-item label="客户ID" prop="customerId">
        <el-input-number v-model="dialogForm.customerId" :min="1" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="收款日期" prop="collectionDate">
        <el-date-picker v-model="dialogForm.collectionDate" type="date" value-format="YYYY-MM-DD" class="!w-full" />
      </el-form-item>
      <el-form-item label="收款总额" prop="amount">
        <el-input-number v-model="dialogForm.amount" :min="0" :precision="2" class="!w-full" />
      </el-form-item>
      <el-form-item label="减免" prop="discountAmount">
        <el-input-number v-model="dialogForm.discountAmount" :min="0" :precision="2" class="!w-full" />
      </el-form-item>
      <el-form-item label="收款人ID" prop="collectionerId">
        <el-input-number v-model="dialogForm.collectionerId" :min="1" controls-position="right" class="!w-full" placeholder="系统用户 ID，可空" />
      </el-form-item>
      <el-divider>分摊到订单</el-divider>
      <el-button type="primary" link @click="addAlloc">+ 分摊行</el-button>
      <el-table :data="dialogForm.allocs" size="small" class="mt-8px">
        <el-table-column label="订单ID">
          <template #default="{ row }">
            <el-input-number v-model="row.orderId" :min="1" controls-position="right" class="!w-full" />
          </template>
        </el-table-column>
        <el-table-column label="金额">
          <template #default="{ row }">
            <el-input-number v-model="row.payAmount" :min="0" :precision="2" class="!w-full" />
          </template>
        </el-table-column>
        <el-table-column width="70">
          <template #default="{ $index }">
            <el-button link type="danger" @click="dialogForm.allocs.splice($index, 1)">删</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitDialog" :loading="submitLoading">确定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { ZcCollectionApi, ZcCollectionSaveVO } from '@/api/zc/finance/collection'

defineOptions({ name: 'ZcCollection' })

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  customerId: undefined as number | undefined
})

const dialogVisible = ref(false)
const submitLoading = ref(false)
const dialogFormRef = ref()

const dialogForm = reactive<ZcCollectionSaveVO>({
  collectionDate: dayjs().format('YYYY-MM-DD'),
  customerId: undefined as any,
  amount: undefined as any,
  discountAmount: 0,
  collectionerId: undefined,
  allocs: [{ orderId: undefined as any, payAmount: undefined as any }]
})

const dialogRules = {
  customerId: [{ required: true, message: '客户必填', trigger: 'blur' }],
  collectionDate: [{ required: true, message: '日期必填', trigger: 'change' }],
  amount: [{ required: true, message: '金额必填', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const data = await ZcCollectionApi.getPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const openDialog = () => {
  dialogVisible.value = true
  dialogForm.collectionDate = dayjs().format('YYYY-MM-DD')
  dialogForm.customerId = undefined as any
  dialogForm.amount = undefined as any
  dialogForm.discountAmount = 0
  dialogForm.collectionerId = undefined
  dialogForm.allocs = [{ orderId: undefined as any, payAmount: undefined as any }]
}

const addAlloc = () => {
  dialogForm.allocs.push({ orderId: undefined as any, payAmount: undefined as any })
}

const submitDialog = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    await ZcCollectionApi.create(dialogForm)
    message.success('收款单已创建')
    dialogVisible.value = false
    await getList()
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => getList())
</script>
