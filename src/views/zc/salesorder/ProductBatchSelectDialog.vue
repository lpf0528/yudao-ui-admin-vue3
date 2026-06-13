<!--
  产品批次选择弹窗
  通过 open(material) 打开，支持按批号/产品/仓库/供应商筛选；
  点击"选择"或双击行后，将 productId / batchId / price 回填到传入的 material 对象。
-->
<template>
  <Dialog title="选择批次" v-model="dialogVisible" width="80%">
    <!-- 搜索过滤区 -->
    <el-form :model="queryParams" :inline="true" class="mb-12px">
      <el-form-item label="批号">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批号"
          clearable
          class="!w-180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品">
        <el-select v-model="queryParams.productId" placeholder="请选择产品" clearable class="!w-180px">
          <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库">
        <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable class="!w-150px">
          <el-option v-for="item in warehouseList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="供应商">
        <el-select v-model="queryParams.supplierId" placeholder="请选择供应商" clearable class="!w-150px">
          <el-option v-for="item in supplierList" :key="item.id" :label="item.shortName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-4px" />搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-4px" />重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 批次列表：单击"选择"或双击行均可确认 -->
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      highlight-current-row
      style="cursor: pointer"
      @row-dblclick="handleSelect"
    >
      <el-table-column label="批号" align="center" prop="batchNo" />
      <el-table-column label="入库日期" align="center" prop="inboundDate" />
      <el-table-column label="产品" align="center" prop="productName" />
      <el-table-column label="规格" align="center" prop="specValue" />
      <el-table-column label="版本" align="center" prop="versionName" />
      <el-table-column label="进货价" align="center" prop="inboundPrice" />
      <el-table-column label="单价" align="center" prop="productPrice" />
      <el-table-column label="单位" align="center" prop="unitValue" />
      <el-table-column label="剩余数量" align="center" prop="quantity" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column label="备注" align="center" prop="note" />
      <el-table-column label="操作" align="center" width="80px" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleSelect(row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { ProductApi, ProductSimpleVO } from '@/api/zc/product'
import { WarehouseApi, WarehouseSimpleVO } from '@/api/zc/warehouse'
import { SupplierApi, SupplierSimpleVO } from '@/api/zc/supplier'
import { CustomerProductPriceApi } from '@/api/zc/customerproductprice'
import type { ZCSalesOrderMaterial } from '@/api/zc/salesorder'

/** 列表行补充后端返回的展示字段 */
interface ProductBatchRow extends ProductBatch {
  productName?: string   // 产品名称
  specValue?: string     // 规格
  versionName?: string   // 版本
  warehouseName?: string // 仓库名称
  supplierName?: string  // 供应商名称
  productPrice?: number  // 产品售价（回填到单价）
  unitValue?: string     // 单位
}

defineOptions({ name: 'ProductBatchSelectDialog' })

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
/** 当前正在编辑的用料行，选中后直接写入该对象 */
const currentMaterial = ref<ZCSalesOrderMaterial | null>(null)
/** 当前订单选中的客户 ID，有值时选批次后查询授权价 */
const currentCustomerId = ref<number | null>(null)

// ======================== 列表数据 ========================
const loading = ref(false)
const list = ref<ProductBatchRow[]>([])
const total = ref(0)

// ======================== 过滤选项（只在首次打开时加载） ========================
const productList = ref<ProductSimpleVO[]>([])
const warehouseList = ref<WarehouseSimpleVO[]>([])
const supplierList = ref<SupplierSimpleVO[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  batchNo: undefined as string | undefined,
  productId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
  supplierId: undefined as number | undefined
})

// ======================== 数据加载 ========================
const getList = async () => {
  loading.value = true
  try {
    const data = await ProductBatchApi.getProductBatchPage(queryParams)
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
  queryParams.batchNo = undefined
  queryParams.productId = undefined
  queryParams.warehouseId = undefined
  queryParams.supplierId = undefined
  handleQuery()
}

// ======================== 打开弹窗 ========================
/**
 * 打开批次选择弹窗
 * @param material   当前用料行对象，选中后直接回填
 * @param customerId 当前订单的客户 ID，有值时选批次后查询授权价
 */
const open = async (material: ZCSalesOrderMaterial, customerId?: number | null) => {
  currentMaterial.value = material
  currentCustomerId.value = customerId ?? null
  // 若用料已有货号，预填产品过滤以缩小范围
  queryParams.productId = material.productId ?? undefined
  queryParams.batchNo = undefined
  queryParams.warehouseId = undefined
  queryParams.supplierId = undefined
  queryParams.pageNo = 1
  dialogVisible.value = true
  // 懒加载下拉选项，只在第一次打开时请求
  if (!productList.value.length) {
    ;[productList.value, warehouseList.value, supplierList.value] = await Promise.all([
      ProductApi.getProductSimpleList(),
      WarehouseApi.getWarehouseSimpleList(),
      SupplierApi.getSupplierSimpleList()
    ])
  }
  await getList()
}
defineExpose({ open })

// ======================== 选中批次 ========================
/**
 * 单击"选择"或双击行：回填基础字段，若已选客户则查询授权价覆盖单价
 */
const handleSelect = async (row: ProductBatchRow) => {
  if (!currentMaterial.value) return
  currentMaterial.value.productId = row.productId
  currentMaterial.value.productName = row.productName
  currentMaterial.value.batchId = row.id
  currentMaterial.value.batchNo = row.batchNo
  currentMaterial.value.specValue = row.specValue
  currentMaterial.value.unitValue = row.unitValue
  // 先用 productPrice 初始化，若无则清空
  currentMaterial.value.price = row.productPrice ?? undefined

  // 已选客户且批次关联了产品时，查询该客户的授权价
  if (currentCustomerId.value && row.productId) {
    try {
      const priceInfo = await CustomerProductPriceApi.getByCustomerAndProduct(
        currentCustomerId.value,
        row.productId
      )
      if (priceInfo?.authorizedPrice != null) {
        currentMaterial.value.price = priceInfo.authorizedPrice
      }
    } catch {
      // 查询失败不影响已回填的其他字段，单价保持 productPrice 或空
    }
  }

  dialogVisible.value = false
}
</script>
