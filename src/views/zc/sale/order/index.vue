<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" inline label-width="90px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" clearable class="!w-220px" />
      </el-form-item>
      <el-form-item label="客户ID" prop="customerId">
        <el-input-number v-model="queryParams.customerId" :min="0" controls-position="right" class="!w-220px" />
      </el-form-item>
      <el-form-item label="类型" prop="types">
        <el-select v-model="queryParams.types" clearable placeholder="全部" class="!w-160px">
          <el-option label="成品帘" value="curtain" />
          <el-option label="面料单" value="fabric" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['zc:sales-order:create']">
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="订单号" prop="orderNo" min-width="160" />
      <el-table-column label="客户ID" prop="customerId" width="100" />
      <el-table-column label="类型" prop="types" width="100" />
      <el-table-column label="金额" prop="amount" width="110" />
      <el-table-column label="收款" prop="payStatus" width="100" />
      <el-table-column label="确认" prop="confirmStatus" width="100" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link @click="openForm('detail', row.id)" v-hasPermi="['zc:sales-order:query']">
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', row.id)"
            v-hasPermi="['zc:sales-order:update']"
          >
            编辑
          </el-button>
          <el-button link type="success" @click="handleConfirm(row.id)" v-hasPermi="['zc:sales-order:confirm']">
            确认
          </el-button>
          <el-button link type="warning" @click="handleCancelConfirm(row.id)" v-hasPermi="['zc:sales-order:confirm']">
            取消确认
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id)" v-hasPermi="['zc:sales-order:delete']">
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
  <SalesOrderForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { ZcSalesOrderApi } from '@/api/zc/sales/order'
import SalesOrderForm from './SalesOrderForm.vue'

defineOptions({ name: 'ZcSalesOrder' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined as string | undefined,
  customerId: undefined as number | undefined,
  types: undefined as string | undefined
})
const formRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await ZcSalesOrderApi.getPage(queryParams)
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

const resetQuery = () => {
  queryParams.orderNo = undefined
  queryParams.customerId = undefined
  queryParams.types = undefined
  handleQuery()
}

const openForm = (type: 'create' | 'update' | 'detail', id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ZcSalesOrderApi.delete(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleConfirm = async (id: number) => {
  await ZcSalesOrderApi.confirm(id)
  message.success('已确认')
  await getList()
}

const handleCancelConfirm = async (id: number) => {
  await ZcSalesOrderApi.cancelConfirm(id)
  message.success('已取消确认')
  await getList()
}

onMounted(() => getList())
</script>
