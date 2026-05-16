<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="批号" prop="batchNo">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="入库日期" prop="inboundDate">
        <el-date-picker
          v-model="queryParams.inboundDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="产品" prop="productId">
        <el-select
          v-model="queryParams.productId"
          placeholder="请选择产品"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in productList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseId">
        <el-select
          v-model="queryParams.warehouseId"
          placeholder="请选择仓库"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in warehouseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-select
          v-model="queryParams.supplierId"
          placeholder="请选择供应商"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in supplierList"
            :key="item.id"
            :label="item.shortName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['zc:product-batch:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:product-batch:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['zc:product-batch:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="批号" align="center" prop="batchNo" />
      <el-table-column label="入库日期" align="center" prop="inboundDate">
        <template #default="scope">{{ formatLocalDate(scope.row.inboundDate) }}</template>
      </el-table-column>
      <el-table-column label="产品" align="center" prop="productId">
        <template #default="scope">{{ productIdMap[scope.row.productId] }}</template>
      </el-table-column>
      <el-table-column label="入库数量" align="center" prop="inboundQuantity" />
      <el-table-column label="剩余数量" align="center" prop="quantity" />
      <el-table-column label="仓库" align="center" prop="warehouseId">
        <template #default="scope">{{ warehouseIdMap[scope.row.warehouseId] }}</template>
      </el-table-column>
      <el-table-column label="供应商" align="center" prop="supplierId">
        <template #default="scope">{{ supplierIdMap[scope.row.supplierId] }}</template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="note" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['zc:product-batch:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:product-batch:delete']"
          >
            删除
          </el-button>
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
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ProductBatchForm ref="formRef" :warehouseList="warehouseList" :supplierList="supplierList" :productList="productList" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { WarehouseApi, WarehouseSimpleVO } from '@/api/zc/warehouse'
import { SupplierApi, SupplierSimpleVO } from '@/api/zc/supplier'
import { ProductApi, ProductSimpleVO } from '@/api/zc/product'
import ProductBatchForm from './ProductBatchForm.vue'

/** 产品批次 列表 */
defineOptions({ name: 'ZcProductBatch' })

const formatLocalDate = (arr?: number[]) => {
  if (!Array.isArray(arr) || arr.length < 3) return ''
  const [y, m, d] = arr
  return `${String(y).slice(2)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProductBatch[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const warehouseList = ref<WarehouseSimpleVO[]>([]) // 仓库列表
const warehouseIdMap = computed(() =>
  Object.fromEntries(warehouseList.value.map((item) => [item.id, item.name]))
)
const supplierList = ref<SupplierSimpleVO[]>([]) // 供应商列表
const supplierIdMap = computed(() =>
  Object.fromEntries(supplierList.value.map((item) => [item.id, item.shortName]))
)
const productList = ref<ProductSimpleVO[]>([]) // 产品列表
const productIdMap = computed(() =>
  Object.fromEntries(productList.value.map((item) => [item.id, item.name]))
)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  batchNo: undefined,
  inboundDate: [],
  productId: undefined,
  warehouseId: undefined,
  supplierId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
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

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProductBatchApi.deleteProductBatch(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除产品批次 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductBatchApi.deleteProductBatchList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ProductBatch[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProductBatchApi.exportProductBatch(queryParams)
    download.excel(data, '产品批次.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  supplierList.value = await SupplierApi.getSupplierSimpleList()
  productList.value = await ProductApi.getProductSimpleList()
  await getList()
})
</script>