<!--
  客户搜索弹窗（公共组件）
  调用分页接口搜索客户，支持全称过滤和分页
  通过 open() 方法打开，选中行后 emit('select', customer) 通知调用方填充表单
  使用方：SalesOrderForm.vue / SalesOrderProductForm.vue / CollectionDialog.vue / index.vue
-->
<template>
  <el-dialog v-model="visible" title="搜索客户" width="620px" append-to-body>
    <div class="flex gap-8px mb-12px">
      <el-input
        v-model="query.name"
        placeholder="输入全称搜索"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      height="360px"
      highlight-current-row
      @row-click="handleRowClick"
      style="cursor: pointer"
    >
      <el-table-column label="简称" prop="shortName" width="120" />
      <el-table-column label="全称" prop="name" />
      <el-table-column label="联系人" prop="contactName" width="90" />
      <el-table-column label="手机" prop="mobile" width="130" />
    </el-table>
    <el-pagination
      class="mt-12px justify-end"
      v-model:current-page="query.pageNo"
      v-model:page-size="query.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchPage"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { CustomerApi } from '@/api/zc/customer'

/** 选中客户后通知调用方，传递完整的客户对象 */
const emit = defineEmits<{ (e: 'select', customer: any): void }>()

// ======================== 弹窗状态 ========================
const visible = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const query = reactive({ name: '', pageNo: 1, pageSize: 10 })

// ======================== 数据获取 ========================
const fetchPage = async () => {
  loading.value = true
  try {
    const data = await CustomerApi.getCustomerPage(query)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// ======================== 事件处理 ========================
/** 搜索按钮 / 回车：重置为第 1 页后重新查询 */
const handleSearch = () => {
  query.pageNo = 1
  fetchPage()
}

/** 点击行：emit 选中客户并关闭弹窗 */
const handleRowClick = (row: any) => {
  emit('select', row)
  visible.value = false
}

/** 打开弹窗：可选传入初始搜索关键词，预填到弹窗搜索框并立即查询 */
const open = (keyword = '') => {
  query.name = keyword.trim()
  query.pageNo = 1
  visible.value = true
  fetchPage()
}

defineExpose({ open })
</script>
