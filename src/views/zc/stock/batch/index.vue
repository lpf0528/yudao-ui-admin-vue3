<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" inline>
      <el-form-item label="批号">
        <el-input v-model="queryParams.batchNo" clearable class="!w-200px" />
      </el-form-item>
      <el-form-item label="货号ID">
        <el-input-number v-model="queryParams.productId" :min="0" controls-position="right" class="!w-200px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button type="primary" plain @click="openDialog" v-hasPermi="['zc:product-batch:create']">
          批次入库
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="批号" prop="batchNo" min-width="160" />
      <el-table-column label="货号ID" prop="productId" width="100" />
      <el-table-column label="入库数量" prop="inboundQuantity" width="110" />
      <el-table-column label="剩余" prop="quantity" width="110" />
      <el-table-column label="入库日期" prop="inboundDate" width="120" />
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <Dialog title="批次入库" v-model="dialogVisible" width="560px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="入库日期" prop="inboundDate">
        <el-date-picker v-model="formData.inboundDate" type="date" value-format="YYYY-MM-DD" class="!w-full" />
      </el-form-item>
      <el-form-item label="货号ID" prop="productId">
        <el-input-number v-model="formData.productId" :min="1" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="入库数量" prop="inboundQuantity">
        <el-input-number v-model="formData.inboundQuantity" :min="0" :precision="4" class="!w-full" />
      </el-form-item>
      <el-form-item label="仓库ID" prop="warehouseId">
        <el-input-number v-model="formData.warehouseId" :min="0" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="采购单ID" prop="purchaseOrderId">
        <el-input-number v-model="formData.purchaseOrderId" :min="0" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="formData.note" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit" :loading="saveLoading">确定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { ZcProductBatchApi, ZcProductBatchVO } from '@/api/zc/stock/batch'

defineOptions({ name: 'ZcProductBatch' })

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  batchNo: undefined as string | undefined,
  productId: undefined as number | undefined
})

const dialogVisible = ref(false)
const saveLoading = ref(false)
const formRef = ref()
const formData = ref<ZcProductBatchVO>({
  inboundDate: dayjs().format('YYYY-MM-DD'),
  productId: undefined as any,
  inboundQuantity: undefined as any
})

const rules = {
  inboundDate: [{ required: true, message: '必填', trigger: 'change' }],
  productId: [{ required: true, message: '必填', trigger: 'blur' }],
  inboundQuantity: [{ required: true, message: '必填', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const data = await ZcProductBatchApi.getPage(queryParams)
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
  formData.value = {
    inboundDate: dayjs().format('YYYY-MM-DD'),
    productId: undefined as any,
    inboundQuantity: undefined as any
  }
  dialogVisible.value = true
}

const submit = async () => {
  await formRef.value?.validate()
  saveLoading.value = true
  try {
    await ZcProductBatchApi.create(formData.value)
    message.success('入库成功')
    dialogVisible.value = false
    await getList()
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => getList())
</script>
