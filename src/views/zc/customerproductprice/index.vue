<template>
  <!-- 搜索工作栏 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="customerQueryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="简称" prop="shortName">
        <el-input
          v-model="customerQueryParams.shortName"
          placeholder="请输入简称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="全称" prop="name">
        <el-input
          v-model="customerQueryParams.name"
          placeholder="请输入全称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="物流" prop="logisticId">
        <el-select
          v-model="customerQueryParams.logisticId"
          placeholder="请选择物流"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in logisticsList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联品牌" prop="brandId">
        <el-select
          v-model="customerQueryParams.brandId"
          placeholder="请选择关联品牌"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in brandList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 主内容区：左右分栏 -->
  <ContentWrap class="!p-0">
    <div class="split-layout">

      <!-- 左侧：客户列表 -->
      <div class="split-left">
        <div class="panel-header">
          <div class="panel-title">
            <Icon icon="ep:user-filled" class="panel-title-icon" />
            <span>客户列表</span>
          </div>
        </div>
        <div class="panel-body">
          <el-table
            v-loading="customerLoading"
            :data="customerList"
            :show-overflow-tooltip="true"
            highlight-current-row
            @current-change="handleCustomerSelect"
            :row-style="{ cursor: 'pointer' }"
            style="width: 100%"
          >
            <el-table-column label="简称" prop="shortName" min-width="80px" />
            <el-table-column label="全称" prop="name" min-width="120px" />
            <el-table-column label="联系人" prop="contactName" min-width="80px" />
          </el-table>
        </div>
        <div class="panel-footer">
          <Pagination
            :total="customerTotal"
            v-model:page="customerQueryParams.pageNo"
            v-model:limit="customerQueryParams.pageSize"
            @pagination="getCustomerList"
            layout="total, prev, pager, next"
          />
        </div>
      </div>

      <!-- 右侧：产品授权价 -->
      <div class="split-right">
        <template v-if="selectedCustomer">
          <div class="panel-header">
            <div class="panel-title">
              <Icon icon="ep:price-tag" class="panel-title-icon" />
              <span>{{ selectedCustomer.shortName || selectedCustomer.name }}</span>
              <el-tag type="primary" size="small" class="ml-8px">产品授权价</el-tag>
            </div>
            <el-button
              type="primary"
              plain
              size="small"
              @click="addPriceRow"
              v-hasPermi="['zc:customer-product-price:create']"
            >
              <Icon icon="ep:plus" class="mr-4px" /> 新增
            </el-button>
          </div>
          <div class="panel-body">
            <el-table v-loading="priceLoading" :data="priceList" border style="width: 100%">
              <el-table-column label="产品" prop="productName" min-width="200px">
                <template #default="{ row }">
                  <el-input
                    v-if="row._editing"
                    :model-value="row.productName"
                    readonly
                    placeholder="双击选择商品"
                    size="small"
                    style="cursor: pointer"
                    @dblclick="openProductPicker(row)"
                  >
                    <template #suffix>
                      <Icon
                        icon="ep:search"
                        style="cursor: pointer; color: var(--el-color-primary)"
                        @click.stop="openProductPicker(row)"
                      />
                    </template>
                  </el-input>
                  <span v-else>{{ row.productName || row.productId }}</span>
                </template>
              </el-table-column>
              <el-table-column label="授权价格" prop="authorizedPrice" min-width="160px">
                <template #default="{ row }">
                  <el-input
                    v-if="row._editing"
                    v-model="row.authorizedPrice"
                    placeholder="请输入授权价格"
                    size="small"
                  />
                  <span v-else>{{ row.authorizedPrice }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160px" align="center">
                <template #default="{ row, $index }">
                  <el-button
                    v-if="!row._editing"
                    link
                    type="primary"
                    @click="editPriceRow(row)"
                    v-hasPermi="['zc:customer-product-price:update']"
                  >编辑</el-button>
                  <el-button
                    v-if="row._editing"
                    link
                    type="warning"
                    @click="cancelEditRow(row, $index)"
                  >取消</el-button>
                  <el-button
                    link
                    type="danger"
                    @click="deletePriceRow(row, $index)"
                    v-hasPermi="['zc:customer-product-price:delete']"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="panel-footer panel-footer--right">
            <el-button type="primary" @click="saveAll" :loading="saveLoading">
              <Icon icon="ep:check" class="mr-5px" /> 保存
            </el-button>
          </div>
        </template>
        <div v-else class="empty-placeholder">
          <el-empty description="请从左侧选择客户查看授权价" :image-size="120" />
        </div>
      </div>

    </div>
  </ContentWrap>

  <!-- 商品选择弹窗 -->
  <ProductPickerDialog ref="pickerDialogRef" @select="handleProductSelect" />
</template>

<script setup lang="ts">
import { CustomerProductPriceApi, CustomerProductPrice } from '@/api/zc/customerproductprice'
import { CustomerApi, Customer } from '@/api/zc/customer'
import { LogisticsApi, Logistics } from '@/api/zc/logistics'
import { BrandApi, Brand } from '@/api/zc/brand'
import { ProductApi, ProductSimpleVO } from '@/api/zc/product'
import ProductPickerDialog from './ProductPickerDialog.vue'

/** 客户产品销售授权价 列表 */
defineOptions({ name: 'ZcCustomerProductPrice' })

const message = useMessage()
const { t } = useI18n()

// ===== 客户列表 =====
const customerLoading = ref(false)
const customerList = ref<Customer[]>([])
const customerTotal = ref(0)
const logisticsList = ref<Logistics[]>([])
const brandList = ref<Brand[]>([])
const customerQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  shortName: undefined,
  name: undefined,
  logisticId: undefined,
  brandId: undefined,
})
const queryFormRef = ref()

const getCustomerList = async () => {
  customerLoading.value = true
  try {
    const data = await CustomerApi.getCustomerPage(customerQueryParams)
    customerList.value = data.list
    customerTotal.value = data.total
  } finally {
    customerLoading.value = false
  }
}

const handleQuery = () => {
  customerQueryParams.pageNo = 1
  getCustomerList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

// ===== 客户选择 =====
const selectedCustomer = ref<Customer | null>(null)

const handleCustomerSelect = (row: Customer | null) => {
  if (!row) return
  selectedCustomer.value = row
  getPriceList()
}

// ===== 商品名称映射 =====
const productSimpleList = ref<ProductSimpleVO[]>([])
const productNameMap = computed<Record<number, string>>(() =>
  Object.fromEntries(productSimpleList.value.map((p) => [p.id, p.name]))
)


// ===== 产品授权价列表 =====
interface PriceRow {
  id?: number
  customerId?: number
  productId?: number
  productName?: string
  authorizedPrice?: number
  _editing: boolean
  _isNew: boolean
  _original?: { productId?: number; productName?: string; authorizedPrice?: number }
}

const priceLoading = ref(false)
const priceList = ref<PriceRow[]>([])
const saveLoading = ref(false)

const getPriceList = async () => {
  if (!selectedCustomer.value) return
  priceLoading.value = true
  try {
    const data = await CustomerProductPriceApi.getCustomerProductPricePage({
      pageNo: 1,
      pageSize: 100,
      customerId: selectedCustomer.value.id,
    })
    priceList.value = data.list.map((item: CustomerProductPrice) => ({
      ...item,
      productName: item.productId ? (productNameMap.value[item.productId] ?? String(item.productId)) : '',
      _editing: false,
      _isNew: false,
    }))
  } finally {
    priceLoading.value = false
  }
}

const addPriceRow = () => {
  priceList.value.push({
    id: undefined,
    customerId: selectedCustomer.value?.id,
    productId: undefined,
    productName: undefined,
    authorizedPrice: undefined,
    _editing: true,
    _isNew: true,
  })
}

const editPriceRow = (row: PriceRow) => {
  row._original = { productId: row.productId, productName: row.productName, authorizedPrice: row.authorizedPrice }
  row._editing = true
}

const cancelEditRow = (row: PriceRow, index: number) => {
  if (row._isNew) {
    priceList.value.splice(index, 1)
  } else {
    if (row._original) {
      row.productId = row._original.productId
      row.productName = row._original.productName
      row.authorizedPrice = row._original.authorizedPrice
    }
    row._editing = false
  }
}

// ===== 商品选择弹窗 =====
const pickerDialogRef = ref<InstanceType<typeof ProductPickerDialog>>()
const currentEditingRow = ref<PriceRow | null>(null)

const openProductPicker = (row: PriceRow) => {
  currentEditingRow.value = row
  pickerDialogRef.value?.open()
}

const handleProductSelect = (product: any) => {
  if (!currentEditingRow.value) return
  currentEditingRow.value.productId = product.id
  currentEditingRow.value.productName = product.name
}

const deletePriceRow = async (row: PriceRow, index: number) => {
  if (row._isNew) {
    priceList.value.splice(index, 1)
    return
  }
  try {
    await message.delConfirm()
    await CustomerProductPriceApi.deleteCustomerProductPrice(row.id!)
    message.success(t('common.delSuccess'))
    priceList.value.splice(index, 1)
  } catch {}
}

const saveAll = async () => {
  const dirtyRows = priceList.value.filter((row) => row._editing)
  if (dirtyRows.length === 0) {
    message.warning('没有需要保存的数据')
    return
  }

  saveLoading.value = true
  try {
    for (const row of dirtyRows) {
      const data: CustomerProductPrice = {
        id: row.id as number,
        customerId: row.customerId,
        productId: row.productId,
        authorizedPrice: row.authorizedPrice,
      }
      if (row._isNew) {
        await CustomerProductPriceApi.createCustomerProductPrice(data)
      } else {
        await CustomerProductPriceApi.updateCustomerProductPrice(data)
      }
    }
    message.success(t('common.updateSuccess'))
    await getPriceList()
  } finally {
    saveLoading.value = false
  }
}

onMounted(async () => {
  ;[logisticsList.value, brandList.value, productSimpleList.value] = await Promise.all([
    LogisticsApi.getLogisticsSimpleList(),
    BrandApi.getBrandSimpleList(),
    ProductApi.getProductSimpleList(),
  ])
  await getCustomerList()
})
</script>

<style scoped>
.split-layout {
  display: flex;
  min-height: 620px;
  height: calc(100vh - 240px);
}

.split-left {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-light);
}

.split-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  gap: 6px;
}

.panel-title-icon {
  color: var(--el-color-primary);
  font-size: 15px;
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: 12px 16px;
}

.panel-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-light);
  padding: 4px 8px;
}

.panel-footer--right {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
}

.empty-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

