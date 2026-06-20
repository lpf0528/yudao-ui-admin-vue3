<!--
  客户搜索弹窗（公共组件）
  调用分页接口搜索客户，支持全称过滤和分页
  列表展示：全称、联系人、手机、送货地址、物流、品牌；支持打印发货联、编辑客户
  通过 open() 方法打开，选中行后 emit('select', customer) 通知调用方填充表单
  使用方：SalesOrderForm.vue / SalesOrderProductForm.vue / CollectionDialog.vue / index.vue
-->
<template>
  <el-dialog v-model="visible" title="搜索客户" width="960px" append-to-body>
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
      :show-overflow-tooltip="true"
      @row-click="handleRowClick"
      style="cursor: pointer"
    >
      <el-table-column label="全称" prop="name" min-width="120" />
      <el-table-column label="联系人" prop="contactName" min-width="80" />
      <el-table-column label="手机" prop="mobile" min-width="120" />
      <el-table-column label="送货地址" prop="deliveryAddress" min-width="160" />
      <el-table-column label="物流" prop="logisticName" min-width="90" />
      <el-table-column label="品牌" prop="brandName" min-width="90" />
      <el-table-column label="操作" align="center" min-width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click.stop="handlePrintShipping(row)">
            打印发货联
          </el-button>
          <el-button
            link
            type="primary"
            v-hasPermi="['zc:customer:update']"
            @click.stop="handleEdit(row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
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
  <!-- 客户编辑弹窗：复用客户资料模块表单 -->
  <CustomerForm
    ref="customerFormRef"
    :logistics-list="logisticsList"
    :brand-list="brandList"
    @success="fetchPage"
  />
  <!-- 客户发货联打印预览弹窗 -->
  <CustomerShippingPrintDialog ref="shippingPrintDialogRef" />
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { CustomerApi, type Customer } from '@/api/zc/customer'
import { BrandApi, type Brand } from '@/api/zc/brand'
import { LogisticsApi, type Logistics } from '@/api/zc/logistics'
import CustomerForm from '@/views/zc/customer/CustomerForm.vue'
import CustomerShippingPrintDialog from '@/views/zc/customer/CustomerShippingPrintDialog.vue'

/** 分页列表行：后端 page 接口在 Customer 基础上扩展品牌/物流名称 */
interface CustomerPageRow extends Customer {
  brandName?: string // 关联品牌名称
  logisticName?: string // 物流名称
}

/** 选中客户后通知调用方，传递完整的客户对象 */
const emit = defineEmits<{ (e: 'select', customer: CustomerPageRow): void }>()

// ======================== 弹窗状态 ========================
const visible = ref(false)
const loading = ref(false)
const list = ref<CustomerPageRow[]>([])
const total = ref(0)
const query = reactive({ name: '', pageNo: 1, pageSize: 10 })
/** 客户编辑表单所需的下拉数据（首次打开搜索弹窗时加载） */
const logisticsList = ref<Logistics[]>([])
const brandList = ref<Brand[]>([])
const baseDataLoaded = ref(false)
const customerFormRef = ref<InstanceType<typeof CustomerForm>>()
const shippingPrintDialogRef = ref<InstanceType<typeof CustomerShippingPrintDialog>>()

// ======================== 数据获取 ========================
/** 加载物流、品牌下拉（CustomerForm 依赖） */
const ensureBaseData = async () => {
  if (baseDataLoaded.value) return
  const [logistics, brands] = await Promise.all([
    LogisticsApi.getLogisticsSimpleList(),
    BrandApi.getBrandSimpleList()
  ])
  logisticsList.value = logistics as Logistics[]
  brandList.value = brands as Brand[]
  baseDataLoaded.value = true
}

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
const handleRowClick = (row: CustomerPageRow) => {
  emit('select', row)
  visible.value = false
}

/** 打开客户编辑弹窗；阻止冒泡，避免触发行选中 */
const handleEdit = (row: CustomerPageRow) => {
  customerFormRef.value?.open('update', row.id)
}

/** 打开客户发货联打印预览；阻止冒泡，避免触发行选中 */
const handlePrintShipping = (row: CustomerPageRow) => {
  shippingPrintDialogRef.value?.open(row)
}

/** 打开弹窗：可选传入初始搜索关键词，预填到弹窗搜索框并立即查询 */
const open = async (keyword = '') => {
  query.name = keyword.trim()
  query.pageNo = 1
  visible.value = true
  await ensureBaseData()
  fetchPage()
}

defineExpose({ open })
</script>
