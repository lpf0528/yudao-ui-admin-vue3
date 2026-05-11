<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" inline>
      <el-form-item label="采购单号">
        <el-input v-model="queryParams.purchaseNo" clearable class="!w-200px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['zc:purchase-order:create']">
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="采购单号" prop="purchaseNo" min-width="160" />
      <el-table-column label="入库日期" prop="inboundDate" width="120" />
      <el-table-column label="审核" prop="auditStatus" width="80">
        <template #default="{ row }">{{ row.auditStatus === 1 ? '已审' : '未审' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('update', row.id)" v-hasPermi="['zc:purchase-order:update']">
            编辑
          </el-button>
          <el-button
            link
            type="success"
            @click="handleAudit(row.id)"
            v-if="row.auditStatus !== 1"
            v-hasPermi="['zc:purchase-order:audit']"
          >
            审核
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id)" v-hasPermi="['zc:purchase-order:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <Dialog :title="dialogTitle" v-model="dialogVisible" width="560px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="入库日期" prop="inboundDate">
        <el-date-picker v-model="formData.inboundDate" type="date" value-format="YYYY-MM-DD" class="!w-full" />
      </el-form-item>
      <el-form-item label="供应商ID" prop="supplierId">
        <el-input-number v-model="formData.supplierId" :min="0" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="formData.note" type="textarea" :rows="2" />
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
import { ZcPurchaseOrderApi, ZcPurchaseOrderVO } from '@/api/zc/stock/purchase'

defineOptions({ name: 'ZcPurchaseOrder' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  purchaseNo: undefined as string | undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const saveLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const formData = ref<ZcPurchaseOrderVO>({
  inboundDate: dayjs().format('YYYY-MM-DD')
})

const rules = {
  inboundDate: [{ required: true, message: '必填', trigger: 'change' }]
}

const getList = async () => {
  loading.value = true
  try {
    const data = await ZcPurchaseOrderApi.getPage(queryParams)
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

const openForm = async (type: 'create' | 'update', id?: number) => {
  formType.value = type
  dialogTitle.value = type === 'create' ? '新建采购单' : '编辑采购单'
  formData.value = { inboundDate: dayjs().format('YYYY-MM-DD') }
  if (type === 'update' && id) {
    formData.value = await ZcPurchaseOrderApi.get(id)
  }
  dialogVisible.value = true
}

const submit = async () => {
  await formRef.value?.validate()
  saveLoading.value = true
  try {
    if (formType.value === 'create') {
      await ZcPurchaseOrderApi.create(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await ZcPurchaseOrderApi.update(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    await getList()
  } finally {
    saveLoading.value = false
  }
}

const handleAudit = async (id: number) => {
  await ZcPurchaseOrderApi.audit(id)
  message.success('已审核')
  await getList()
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ZcPurchaseOrderApi.delete(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => getList())
</script>
