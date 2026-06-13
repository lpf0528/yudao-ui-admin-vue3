<!--
  产品批次选择面板（内嵌版，非弹窗）
  左侧：产品列表，支持名称搜索；点击产品后在右侧加载对应批次
  右侧：批次列表，多选框；已加入过的批次置灰不可再选；
        若只选产品未勾选任何批次，也允许确认（仅携带产品信息）
  确认选择后通过 emit('confirm') 通知父组件添加到列表
-->
<template>
  <div class="batch-select-panel">
    <!-- 左右内容区 -->
    <div class="flex" style="height: 38vh; border: 1px solid #e4e7ed; border-radius: 4px; overflow: hidden">

      <!-- ========== 左侧：产品列表 ========== -->
      <div
        class="flex flex-col"
        style="width: 220px; flex-shrink: 0; border-right: 1px solid #e4e7ed; background: #fafafa"
      >
        <div class="px-8px pt-8px pb-6px" style="border-bottom: 1px solid #e4e7ed">
          <el-input v-model="productFilter" placeholder="搜索产品" clearable size="small">
            <template #prefix><Icon icon="ep:search" /></template>
          </el-input>
        </div>
        <div style="flex: 1; overflow-y: auto">
          <div
            v-for="item in filteredProductList"
            :key="item.id"
            class="px-10px py-7px text-sm cursor-pointer leading-snug"
            style="border-bottom: 1px solid #f0f0f0"
            :class="
              selectedProduct?.id === item.id
                ? 'bg-blue-500 text-white font-medium'
                : 'text-gray-700 hover:bg-blue-50'
            "
            @click="handleSelectProduct(item)"
          >
            <div class="font-medium truncate">{{ item.name }}</div>
            <div class="text-xs mt-1px" :class="selectedProduct?.id === item.id ? 'text-blue-100' : 'text-gray-400'">
              <span v-if="item.specValue">规格 {{ item.specValue }}</span>
              <span v-if="item.specValue && item.onePrice != null"> · </span>
              <span v-if="item.onePrice != null">¥{{ item.onePrice }}</span>
            </div>
          </div>
          <el-empty
            v-if="!filteredProductList.length && !loading"
            description="暂无产品"
            :image-size="40"
            class="py-16px"
          />
        </div>
      </div>

      <!-- ========== 右侧：批次列表 ========== -->
      <div class="flex flex-col flex-1 min-w-0 px-10px pt-8px">
        <!-- 筛选条件 -->
        <el-form :model="queryParams" :inline="true" class="mb-6px flex items-center" size="small">
          <el-form-item label="批号">
            <el-input
              v-model="queryParams.batchNo"
              placeholder="请输入批号"
              clearable
              class="!w-130px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="仓库">
            <el-select v-model="queryParams.warehouseId" placeholder="仓库" clearable class="!w-110px">
              <el-option v-for="item in warehouseList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="供应商">
            <el-select v-model="queryParams.supplierId" placeholder="供应商" clearable class="!w-110px">
              <el-option v-for="item in supplierList" :key="item.id" :label="item.shortName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" size="small">
              <Icon icon="ep:search" class="mr-4px" />搜索
            </el-button>
            <el-button @click="resetQuery" size="small">
              <Icon icon="ep:refresh" class="mr-4px" />重置
            </el-button>
          </el-form-item>
          <!-- 已选统计 + 确认按钮，紧贴筛选条件最右侧 -->
          <el-form-item class="!ml-auto !mr-0">
            <span class="text-sm text-gray-500 mr-8px">
              已选批次 <b class="text-blue-500">{{ selectedRows.length }}</b> 条
              <template v-if="!selectedRows.length && selectedProduct">
                &nbsp;·&nbsp;<span class="text-orange-500">仅选产品（无批次）</span>
              </template>
            </span>
            <el-button type="primary" size="small" :disabled="!canConfirm" @click="handleConfirm">
              <Icon icon="ep:check" class="mr-4px" />确认选择
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 未选产品时提示 -->
        <div v-if="!selectedProduct" class="flex-1 flex items-center justify-center">
          <el-empty description="请先在左侧选择产品" :image-size="60" />
        </div>

        <!-- 批次表格 -->
        <template v-else>
          <el-table
            ref="tableRef"
            v-loading="batchLoading"
            :data="batchList"
            :stripe="true"
            :show-overflow-tooltip="true"
            :max-height="tableMaxHeight"
            size="small"
            style="cursor: pointer"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            @row-dblclick="(row: BatchRow) => handleDblclick(row)"
          >
            <el-table-column type="selection" width="40" align="center" fixed="left" />
            <el-table-column label="批号" align="center" prop="batchNo" min-width="90px" />
            <el-table-column label="入库日期" align="center" prop="inboundDate" width="96px" />
            <el-table-column label="规格" align="center" prop="specValue" />
            <el-table-column label="版本" align="center" prop="versionName" />
            <el-table-column label="单价" align="center" prop="productPrice" />
            <el-table-column label="单位" align="center" prop="unitValue">
              <template #default="scope">
                <dict-tag :type="DICT_TYPE.ZC_PRODUCT_UNIT" :value="scope.row.unitValue" />
              </template>
            </el-table-column>
            <el-table-column label="剩余数量" align="center" prop="quantity" />
            <el-table-column label="仓库" align="center" prop="warehouseName" />
            <el-table-column label="供应商" align="center" prop="supplierName" />
          </el-table>
          <Pagination
            :total="batchTotal"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getBatchList"
          />
        </template>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { ProductApi, ProductSimpleVO } from '@/api/zc/product'
import { WarehouseApi, WarehouseSimpleVO } from '@/api/zc/warehouse'
import { SupplierApi, SupplierSimpleVO } from '@/api/zc/supplier'

interface BatchRow extends ProductBatch {
  productName?: string
  specValue?: string
  versionName?: string
  warehouseName?: string
  supplierName?: string
  productPrice?: number
  unitValue?: string
}

/** 向父组件传递的确认项：有批次或仅产品两种情形 */
export interface BatchConfirmItem {
  batchId?: number      // 批次 ID；仅选产品时为 undefined
  productId?: number
  productName?: string
  specValue?: string    // 产品规格
  batchNo?: string
  unitValue?: string
  productPrice?: number
  onePrice?: number     // 产品一级销售价，用于回填单价
}

defineOptions({ name: 'ProductBatchSelectPanel' })


const emit = defineEmits<{
  (e: 'confirm', rows: BatchConfirmItem[]): void
}>()

const message = useMessage()

// ======================== 左侧：产品列表 ========================
const loading = ref(false)
const productList = ref<ProductSimpleVO[]>([])
const selectedProduct = ref<ProductSimpleVO | null>(null)
const productFilter = ref('')

const filteredProductList = computed(() => {
  if (!productFilter.value) return productList.value
  const kw = productFilter.value.toLowerCase()
  return productList.value.filter((p) => p.name.toLowerCase().includes(kw))
})

const handleSelectProduct = async (product: ProductSimpleVO) => {
  selectedProduct.value = product
  tableRef.value?.clearSelection()
  queryParams.batchNo = undefined
  queryParams.warehouseId = undefined
  queryParams.supplierId = undefined
  queryParams.pageNo = 1
  await getBatchList()
}

// ======================== 右侧：批次列表 ========================
const tableRef = ref()
const batchLoading = ref(false)
const batchList = ref<BatchRow[]>([])
const batchTotal = ref(0)
const selectedRows = ref<BatchRow[]>([])

/** 表格高度 = 面板(38vh) - 筛选行(约46px) - 分页(约42px) */
const tableMaxHeight = 'calc(38vh - 96px)'

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  batchNo: undefined as string | undefined,
  warehouseId: undefined as number | undefined,
  supplierId: undefined as number | undefined,
})

const getBatchList = async () => {
  if (!selectedProduct.value) return
  batchLoading.value = true
  try {
    const data = await ProductBatchApi.getProductBatchPage({
      ...queryParams,
      productId: selectedProduct.value.id,
    })
    batchList.value = data.list
    batchTotal.value = data.total
  } finally {
    batchLoading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getBatchList()
}

const resetQuery = () => {
  queryParams.batchNo = undefined
  queryParams.warehouseId = undefined
  queryParams.supplierId = undefined
  handleQuery()
}

const handleSelectionChange = (rows: BatchRow[]) => {
  selectedRows.value = rows
}

/** 点击行切换勾选 */
const handleRowClick = (row: BatchRow) => {
  tableRef.value?.toggleRowSelection(row)
}

/** 双击行直接确认该行 */
const handleDblclick = (row: BatchRow) => {
  emit('confirm', [rowToItem(row)])
  tableRef.value?.clearSelection()
  message.success('已添加 1 条批次')
}

// ======================== 下拉数据 ========================
const warehouseList = ref<WarehouseSimpleVO[]>([])
const supplierList = ref<SupplierSimpleVO[]>([])

// ======================== 初始化 ========================
onMounted(async () => {
  loading.value = true
  try {
    ;[productList.value, warehouseList.value, supplierList.value] = await Promise.all([
      ProductApi.getProductSimpleList(),
      WarehouseApi.getWarehouseSimpleList(),
      SupplierApi.getSupplierSimpleList(),
    ])
  } finally {
    loading.value = false
  }
})

// ======================== 确认逻辑 ========================
const canConfirm = computed(() => selectedRows.value.length > 0 || !!selectedProduct.value)

const rowToItem = (r: BatchRow): BatchConfirmItem => ({
  batchId: r.id,
  productId: r.productId,
  productName: r.productName,
  specValue: r.specValue,
  batchNo: r.batchNo,
  unitValue: r.unitValue,
  productPrice: r.productPrice,
})

const buildItems = (): BatchConfirmItem[] => {
  if (selectedRows.value.length > 0) return selectedRows.value.map(rowToItem)
  if (selectedProduct.value) {
    return [{ productId: selectedProduct.value.id, productName: selectedProduct.value.name }]
  }
  return []
}

const handleConfirm = () => {
  const items = buildItems()
  if (!items.length) return
  emit('confirm', items)
  const n = selectedRows.value.length
  message.success(n > 0 ? `已添加 ${n} 条批次` : '已添加产品（无批次）')
  tableRef.value?.clearSelection()
}
</script>

<style scoped>
</style>
