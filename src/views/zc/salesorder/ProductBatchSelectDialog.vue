<!--
  产品批次选择弹窗（左右布局）
  左侧：产品列表（分页），支持按产品名称/版本筛选
  右侧：批次列表，根据左侧选中的产品加载对应批次
  点击"选择"或双击批次行后，将 productId / batchId / price 回填到传入的 material 对象。
-->
<template>
  <Dialog title="选择批次" v-model="dialogVisible" width="90%">
    <!-- 左右两列布局 -->
    <div class="flex gap-12px" style="height: 520px">
      <!-- ===== 左侧：产品选择 ===== -->
      <div class="flex flex-col border border-solid border-gray-200 rounded-4px p-12px" style="width: 380px; flex-shrink: 0">
        <div class="text-14px font-600 mb-8px text-gray-700">产品列表</div>

        <!-- 产品筛选 -->
        <div class="flex gap-8px mb-8px">
          <el-input
            v-model="productQueryParams.name"
            placeholder="产品名称"
            clearable
            size="small"
            class="flex-1"
            @keyup.enter="handleProductQuery"
            @clear="handleProductQuery"
          />
          <el-select
            v-model="productQueryParams.versionId"
            placeholder="产品版本"
            clearable
            size="small"
            class="flex-1"
            @change="handleProductQuery"
          >
            <el-option
              v-for="item in versionList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <el-button size="small" type="primary" @click="handleProductQuery">
            <Icon icon="ep:search" />
          </el-button>
        </div>

        <el-table
          v-loading="productLoading"
          :data="productList"
          :stripe="true"
          :show-overflow-tooltip="true"
          highlight-current-row
          style="cursor: pointer; flex: 1"
          size="small"
          @row-click="handleProductClick"
        >
          <el-table-column label="产品名称" prop="name" />
          <el-table-column label="版本" prop="versionName" width="90px" />
          <el-table-column label="供应商" prop="supplierName" width="90px" />
        </el-table>
        <Pagination
          :total="productTotal"
          v-model:page="productQueryParams.pageNo"
          v-model:limit="productQueryParams.pageSize"
          layout="prev, pager, next"
          @pagination="getProductList"
          class="mt-8px !p-0"
        />
      </div>

      <!-- ===== 右侧：批次选择 ===== -->
      <div class="flex flex-col border border-solid border-gray-200 rounded-4px p-12px flex-1 overflow-hidden">
        <div class="text-14px font-600 mb-8px text-gray-700">
          批次列表
          <span v-if="selectedProduct" class="ml-8px text-12px font-400 text-primary">
            — {{ selectedProduct.name }}
          </span>
          <span v-else class="ml-8px text-12px font-400 text-gray-400">（请先在左侧选择产品）</span>
        </div>
        <el-table
          v-loading="batchLoading"
          :data="batchList"
          :stripe="true"
          :show-overflow-tooltip="true"
          highlight-current-row
          style="cursor: pointer; flex: 1"
          size="small"
          @row-dblclick="handleSelect"
        >
          <el-table-column label="批号" prop="batchNo" width="120px" />
          <el-table-column label="入库日期" prop="inboundDate" width="100px" />
          <el-table-column label="规格" prop="spec" width="80px" />
          <el-table-column label="版本" prop="versionName" width="80px" />
          <el-table-column label="进货价" prop="inboundPrice" width="80px" />
          <el-table-column label="单价" prop="onePrice" width="80px" />
          <el-table-column label="剩余数量" prop="quantity" width="80px" />
          <el-table-column label="仓库" prop="warehouseName" width="90px" />
          <el-table-column label="供应商" prop="supplierName" width="90px" />
          <el-table-column label="备注" prop="note" />
          <el-table-column label="操作" align="center" width="70px" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleSelect(row)">选择</el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-if="batchTotal > 0"
          :total="batchTotal"
          v-model:page="batchQueryParams.pageNo"
          v-model:limit="batchQueryParams.pageSize"
          layout="prev, pager, next"
          @pagination="getBatchList"
          class="mt-8px !p-0"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { ProductApi, ProductPageVO } from '@/api/zc/product'
import { ProductVersionApi, ProductVersionSimpleVO } from '@/api/zc/productversion'
import { CustomerVersionSpcPriceApi } from '@/api/zc/customerversionspcprice'
import type { ZCSalesOrderMaterial } from '@/api/zc/salesorder'

type ProductBatchRow = ProductBatch
type MaterialWithSpec = ZCSalesOrderMaterial & { spec?: string }

defineOptions({ name: 'ProductBatchSelectDialog' })

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
const currentMaterial = ref<ZCSalesOrderMaterial | null>(null)
const currentCustomerId = ref<number | null>(null)

// ======================== 左侧：产品列表 ========================
const productLoading = ref(false)
const productList = ref<ProductPageVO[]>([])
const productTotal = ref(0)
const selectedProduct = ref<ProductPageVO | null>(null)

const productQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  versionId: undefined as number | undefined
})

// ======================== 右侧：批次列表 ========================
const batchLoading = ref(false)
const batchList = ref<ProductBatchRow[]>([])
const batchTotal = ref(0)

const batchQueryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

// ======================== 下拉选项 ========================
const versionList = ref<ProductVersionSimpleVO[]>([])

// ======================== 数据加载 ========================
const getProductList = async () => {
  productLoading.value = true
  try {
    const data = await ProductApi.getProductPage(productQueryParams)
    productList.value = data.list
    productTotal.value = data.total
  } finally {
    productLoading.value = false
  }
}

const getBatchList = async () => {
  if (!selectedProduct.value) {
    batchList.value = []
    batchTotal.value = 0
    return
  }
  batchLoading.value = true
  try {
    const data = await ProductBatchApi.getProductBatchPage({
      ...batchQueryParams,
      productId: selectedProduct.value.id
    })
    batchList.value = data.list
    batchTotal.value = data.total
  } finally {
    batchLoading.value = false
  }
}

// ======================== 产品查询 / 重置 ========================
const handleProductQuery = () => {
  productQueryParams.pageNo = 1
  selectedProduct.value = null
  batchList.value = []
  batchTotal.value = 0
  getProductList()
}

// ======================== 左侧点击产品 ========================
const handleProductClick = (row: ProductPageVO) => {
  selectedProduct.value = row
  batchQueryParams.pageNo = 1
  getBatchList()
}

// ======================== 打开弹窗 ========================
const open = async (material: ZCSalesOrderMaterial, customerId?: number | null) => {
  currentMaterial.value = material
  currentCustomerId.value = customerId ?? null
  productQueryParams.name = undefined
  productQueryParams.versionId = undefined
  productQueryParams.pageNo = 1
  selectedProduct.value = null
  batchList.value = []
  batchTotal.value = 0
  dialogVisible.value = true

  // 懒加载版本下拉选项
  if (!versionList.value.length) {
    versionList.value = await ProductVersionApi.getProductVersionSimpleList()
  }

  await getProductList()

  // 若用料已关联产品，自动预选并加载对应批次
  if (material.productId) {
    const matched = productList.value.find((p) => p.id === material.productId)
    if (matched) {
      selectedProduct.value = matched
      await getBatchList()
    }
  }
}
defineExpose({ open })

// ======================== 选中批次 ========================
const handleSelect = async (row: ProductBatchRow) => {
  if (!currentMaterial.value) return
  currentMaterial.value.productId = row.productId
  currentMaterial.value.productName = row.productName
  currentMaterial.value.batchId = row.id
  currentMaterial.value.batchNo = row.batchNo
  ;(currentMaterial.value as MaterialWithSpec).spec = row.spec
  currentMaterial.value.unitValue = row.unitValue
  currentMaterial.value.price = row.onePrice ?? undefined

  if (currentCustomerId.value && row.productId && row.spec) {
    try {
      const priceInfo = await CustomerVersionSpcPriceApi.getByProductAndCustomerAndSpec({
        productId: row.productId,
        customerId: currentCustomerId.value,
        spec: row.spec
      })
      if (priceInfo?.authorizedPrice != null) {
        currentMaterial.value.price = priceInfo.authorizedPrice
      }
    } catch {
      // 查询失败不影响已回填的其他字段
    }
  }

  dialogVisible.value = false
}
</script>
