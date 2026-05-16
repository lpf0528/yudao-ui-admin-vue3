<template>
  <Dialog v-model="dialogVisible" width="900px">
    <template #title>选择商品</template>
    <!-- 筛选栏 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="-mb-15px mb-16px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="版本" prop="versionId">
        <el-select v-model="queryParams.versionId" placeholder="请选择版本" clearable class="!w-180px">
          <el-option v-for="item in versionList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 商品列表 -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 4px;">
      <span style="font-size: 12px; color: #f56c6c;">双击行确认选择</span>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      highlight-current-row
      border
      max-height="400"
      :row-style="{ cursor: 'pointer' }"
      @current-change="handleCurrentChange"
      @row-dblclick="confirmSelect"
      style="width: 100%"
    >
      <el-table-column label="名称" prop="name" min-width="140px" show-overflow-tooltip />
      <el-table-column label="版本" prop="versionName" min-width="100px" />
      <el-table-column label="规格" prop="specValue" min-width="80px" />
      <el-table-column label="进货价" prop="inboundPrice" min-width="90px" align="right" />
      <el-table-column label="一级销售价" prop="onePrice" min-width="100px" align="right" />
      <el-table-column label="供应商" prop="supplierName" min-width="120px" show-overflow-tooltip />
      <el-table-column label="备注" prop="note" min-width="120px" show-overflow-tooltip />
    </el-table>
    <div style="overflow: hidden;">
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
        class="!border-0"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ProductApi } from '@/api/zc/product'
import { ProductVersionApi, ProductVersionSimpleVO } from '@/api/zc/productversion'

defineOptions({ name: 'ProductPickerDialog' })

const emit = defineEmits<{ select: [product: any] }>()

const dialogVisible = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const currentRow = ref<any>(null)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  versionId: undefined as number | undefined,
})
const queryFormRef = ref()

const versionList = ref<ProductVersionSimpleVO[]>([])

const getList = async () => {
  loading.value = true
  try {
    const data = await ProductApi.getProductPage(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

const handleCurrentChange = (row: any) => {
  currentRow.value = row
}

const confirmSelect = (row: any) => {
  if (!row) return
  emit('select', row)
  dialogVisible.value = false
}

const open = async () => {
  dialogVisible.value = true
  currentRow.value = null
  Object.assign(queryParams, { pageNo: 1, name: undefined, versionId: undefined })

  if (versionList.value.length === 0) {
    versionList.value = await ProductVersionApi.getProductVersionSimpleList()
  }
  await getList()
}

defineExpose({ open })
</script>
