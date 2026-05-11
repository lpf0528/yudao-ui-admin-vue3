<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" inline label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="仓库名称" clearable class="!w-240px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['zc:warehouse:create']">
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="编号" prop="id" width="80" />
      <el-table-column label="名称" prop="name" min-width="140" />
      <el-table-column label="负责人ID" prop="managerId" width="100" />
      <el-table-column label="备注" prop="note" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('update', row.id)" v-hasPermi="['zc:warehouse:update']">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id)" v-hasPermi="['zc:warehouse:delete']">
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
  <WarehouseForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { ZcWarehouseApi } from '@/api/zc/base/warehouse'
import WarehouseForm from './WarehouseForm.vue'

defineOptions({ name: 'ZcWarehouse' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined
})
const formRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await ZcWarehouseApi.getPage(queryParams)
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
  queryParams.name = undefined
  handleQuery()
}

const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ZcWarehouseApi.delete(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => getList())
</script>
