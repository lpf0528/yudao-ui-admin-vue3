<!--
  产品批次选择弹窗（左右布局 · 多选版）
  左侧：产品列表，支持名称搜索；点击产品后在右侧加载对应批次
  右侧：批次列表，首列多选框；已加入过的批次置灰不可再选；
        若只选了产品未勾选任何批次，也允许确认（仅携带产品信息）
  底部：确认（保持弹窗）/ 确认并关闭 按钮
-->
<template>
  <Dialog title="选择批次" v-model="dialogVisible" width="88%">
    <div
      class="flex"
      style="height: 58vh; border: 1px solid #e4e7ed; border-radius: 4px; overflow: hidden"
    >
      <!-- ========== 左侧：产品列表 ========== -->
      <div
        class="flex flex-col"
        style="width: 230px; flex-shrink: 0; border-right: 1px solid #e4e7ed; background: #fafafa"
      >
        <div class="px-8px pt-10px pb-8px" style="border-bottom: 1px solid #e4e7ed">
          <el-input v-model="productFilter" placeholder="搜索产品" clearable size="small">
            <template #prefix><Icon icon="ep:search" /></template>
          </el-input>
        </div>
        <div style="flex: 1; overflow-y: auto">
          <div
            v-for="item in filteredProductList"
            :key="item.id"
            class="px-10px py-8px text-sm cursor-pointer leading-snug"
            style="border-bottom: 1px solid #f0f0f0"
            :class="
              selectedProduct?.id === item.id
                ? 'bg-blue-500 text-white font-medium'
                : 'text-gray-700 hover:bg-blue-50'
            "
            @click="handleSelectProduct(item)"
          >
            {{ item.name }}
          </div>
          <el-empty
            v-if="!filteredProductList.length"
            description="暂无产品"
            :image-size="40"
            class="py-20px"
          />
        </div>
      </div>

      <!-- ========== 右侧：批次列表 ========== -->
      <div class="flex flex-col flex-1 min-w-0 px-12px pt-10px">
        <el-form :model="queryParams" :inline="true" class="mb-8px" size="small">
          <el-form-item label="批号">
            <el-input
              v-model="queryParams.batchNo"
              placeholder="请输入批号"
              clearable
              class="!w-140px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="仓库">
            <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable class="!w-130px">
              <el-option v-for="item in warehouseList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="供应商">
            <el-select v-model="queryParams.supplierId" placeholder="请选择供应商" clearable class="!w-130px">
              <el-option v-for="item in supplierList" :key="item.id" :label="item.shortName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">
              <Icon icon="ep:search" class="mr-4px" />搜索
            </el-button>
            <el-button @click="resetBatchQuery">
              <Icon icon="ep:refresh" class="mr-4px" />重置
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="!selectedProduct" class="flex-1 flex items-center justify-center">
          <el-empty description="请先在左侧选择产品" :image-size="80" />
        </div>

        <template v-else>
          <el-table
            ref="tableRef"
            v-loading="batchLoading"
            :data="batchList"
            :stripe="true"
            :show-overflow-tooltip="true"
            :max-height="batchTableMaxHeight"
            :row-class-name="getRowClassName"
            style="cursor: pointer"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            @row-dblclick="(row: ProductBatchRow) => handleDblclick(row)"
          >
            <!-- 多选列：已加入过的行不可选 -->
            <el-table-column
              type="selection"
              width="46"
              align="center"
              fixed="left"
              :selectable="isRowSelectable"
            />
            <el-table-column label="批号" align="center" prop="batchNo" min-width="100px" />
            <el-table-column label="入库日期" align="center" prop="inboundDate" width="100px" />
            <el-table-column label="规格" align="center" prop="specValue" />
            <el-table-column label="版本" align="center" prop="versionName" />
            <el-table-column label="进货价" align="center" prop="inboundPrice" />
            <el-table-column label="单价" align="center" prop="productPrice" />
            <el-table-column label="单位" align="center" prop="unitValue" />
            <el-table-column label="剩余数量" align="center" prop="quantity" />
            <el-table-column label="仓库" align="center" prop="warehouseName" />
            <el-table-column label="供应商" align="center" prop="supplierName" />
            <el-table-column label="备注" align="center" prop="note" />
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

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">
          已选批次 <b class="text-blue-500">{{ selectedRows.length }}</b> 条
          <template v-if="!selectedRows.length && selectedProduct">
            &nbsp;·&nbsp;<span class="text-orange-500">仅选产品（无批次）</span>
          </template>
        </span>
        <div class="flex gap-8px">
          <el-button @click="dialogVisible = false">取消</el-button>
          <!-- 有选中批次 或 仅选了产品 均可确认 -->
          <el-button
            type="primary"
            :disabled="!canConfirm"
            @click="handleConfirm"
          >
            确认
          </el-button>
          <el-button
            type="success"
            :disabled="!canConfirm"
            @click="handleConfirmAndClose()"
          >
            确认并关闭
          </el-button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { ProductApi, ProductSimpleVO } from '@/api/zc/product'
import { WarehouseApi, WarehouseSimpleVO } from '@/api/zc/warehouse'
import { SupplierApi, SupplierSimpleVO } from '@/api/zc/supplier'

/** 批次列表行（补充后端返回的展示字段） */
export interface ProductBatchRow extends ProductBatch {
  productName?: string
  specValue?: string
  versionName?: string
  warehouseName?: string
  supplierName?: string
  productPrice?: number
  unitValue?: string
}

/** 向父组件传递的确认项（批次或仅产品两种情形） */
export interface BatchConfirmItem {
  batchId?: number      // 批次 ID；仅选产品时为 undefined
  productId?: number
  productName?: string
  batchNo?: string
  unitValue?: string
  productPrice?: number
}

defineOptions({ name: 'ProductBatchSelectDialog2' })

const emit = defineEmits<{
  (e: 'confirm', rows: BatchConfirmItem[]): void
}>()

const message = useMessage()

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
/** 调用方传入的已加入批次 ID，这些行在表格中置灰、不可再选 */
const existingBatchIds = ref<number[]>([])

// ======================== 左侧：产品列表 ========================
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
const batchList = ref<ProductBatchRow[]>([])
const batchTotal = ref(0)
const selectedRows = ref<ProductBatchRow[]>([])

const batchTableMaxHeight = 'calc(58vh - 110px)'

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

const resetBatchQuery = () => {
  queryParams.batchNo = undefined
  queryParams.warehouseId = undefined
  queryParams.supplierId = undefined
  handleQuery()
}

/** 该行是否可选：已加入过的批次不可再选 */
const isRowSelectable = (row: ProductBatchRow) => !existingBatchIds.value.includes(row.id)

/** 已加入过的行添加置灰样式 */
const getRowClassName = ({ row }: { row: ProductBatchRow }) =>
  existingBatchIds.value.includes(row.id) ? 'batch-row-disabled' : ''

const handleSelectionChange = (rows: ProductBatchRow[]) => {
  selectedRows.value = rows
}

/** 点击行：已加入的行忽略；其余切换勾选状态 */
const handleRowClick = (row: ProductBatchRow) => {
  if (existingBatchIds.value.includes(row.id)) return
  tableRef.value?.toggleRowSelection(row)
}

/** 双击行：已加入的行忽略；否则仅确认该行并关闭 */
const handleDblclick = (row: ProductBatchRow) => {
  if (existingBatchIds.value.includes(row.id)) return
  emit('confirm', [rowToItem(row)])
  dialogVisible.value = false
}

// ======================== 辅助下拉数据（懒加载） ========================
const warehouseList = ref<WarehouseSimpleVO[]>([])
const supplierList = ref<SupplierSimpleVO[]>([])

// ======================== 打开弹窗 ========================
/**
 * 打开批次选择弹窗
 * @param alreadySelectedIds 已加入表单的批次 ID 列表，这些行将置灰不可再选
 */
const open = async (alreadySelectedIds: number[] = []) => {
  existingBatchIds.value = alreadySelectedIds

  productFilter.value = ''
  selectedProduct.value = null
  batchList.value = []
  batchTotal.value = 0
  selectedRows.value = []
  queryParams.batchNo = undefined
  queryParams.warehouseId = undefined
  queryParams.supplierId = undefined
  queryParams.pageNo = 1

  dialogVisible.value = true

  if (!productList.value.length) {
    ;[productList.value, warehouseList.value, supplierList.value] = await Promise.all([
      ProductApi.getProductSimpleList(),
      WarehouseApi.getWarehouseSimpleList(),
      SupplierApi.getSupplierSimpleList(),
    ])
  }
}
defineExpose({ open })

// ======================== 确认逻辑 ========================
/** 有勾选批次 或 仅选中了产品，均可触发确认 */
const canConfirm = computed(() => selectedRows.value.length > 0 || !!selectedProduct.value)

const rowToItem = (r: ProductBatchRow): BatchConfirmItem => ({
  batchId: r.id,
  productId: r.productId,
  productName: r.productName,
  batchNo: r.batchNo,
  unitValue: r.unitValue,
  productPrice: r.productPrice,
})

/** 构建本次要确认的列表：有批次用批次，无批次用产品兜底 */
const buildItems = (): BatchConfirmItem[] => {
  if (selectedRows.value.length > 0) {
    return selectedRows.value.map(rowToItem)
  }
  if (selectedProduct.value) {
    return [{ productId: selectedProduct.value.id, productName: selectedProduct.value.name }]
  }
  return []
}

/** 确认：发出事件，弹窗保持打开，清空勾选方便继续选 */
const handleConfirm = () => {
  const items = buildItems()
  if (!items.length) return
  emit('confirm', items)
  const hasBatch = selectedRows.value.length > 0
  message.success(hasBatch ? `已添加 ${items.length} 条批次` : '已添加产品（无批次）')
  tableRef.value?.clearSelection()
}

/** 确认并关闭：发出事件后关闭弹窗 */
const handleConfirmAndClose = () => {
  const items = buildItems()
  if (!items.length) return
  emit('confirm', items)
  dialogVisible.value = false
}
</script>

<style scoped>
/* 已加入过的批次行：置灰 + 禁用光标 */
:deep(.batch-row-disabled) {
  opacity: 0.45;
  cursor: not-allowed !important;
}
:deep(.batch-row-disabled .el-checkbox__input) {
  pointer-events: none;
}
</style>
