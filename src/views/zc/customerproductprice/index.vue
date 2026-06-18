<template>
  <!-- 主内容区：左右分栏 -->
  <ContentWrap class="!p-0">
    <div class="split-layout">

      <!-- 左侧：客户列表（上）+ 产品选择（下） -->
      <div class="split-left">

        <!-- 客户列表 -->
        <div class="customer-section">
          <div class="panel-header">
            <div class="panel-title">
              <Icon icon="ep:user-filled" class="panel-title-icon" />
              <span>客户列表</span>
            </div>
            <el-input
              v-model="customerQueryParams.shortName"
              placeholder="搜索简称"
              clearable
              size="small"
              class="!w-160px"
              @keyup.enter="handleQuery"
              @clear="handleQuery"
            >
              <template #suffix>
                <Icon icon="ep:search" style="cursor:pointer" @click="handleQuery" />
              </template>
            </el-input>
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
              <el-table-column type="index" label="序号" width="50px" align="center" />
              <el-table-column label="简称" prop="shortName" min-width="80px" />
              <el-table-column label="联系人" prop="contactName" min-width="70px" />
              <el-table-column label="手机号" prop="mobile" min-width="110px" />
              <el-table-column label="物流" prop="logisticName" min-width="80px" />
              <el-table-column label="送货地址" prop="deliveryAddress" min-width="100px" />
              <el-table-column label="关联品牌" prop="brandName" min-width="80px" />
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

        <!-- 版本规格选择器（始终显示，双击产品直接添加到右侧授权价列表） -->
        <div class="picker-section">
          <div class="panel-header">
            <div class="panel-title">
              <Icon icon="ep:goods" class="panel-title-icon" />
              <span>选择版本规格</span>
              <el-tag type="warning" size="small" class="ml-8px">双击添加授权价</el-tag>
            </div>
          </div>
          <div class="panel-body">
            <el-form
              :model="pickerQueryParams"
              ref="pickerFormRef"
              :inline="true"
              class="-mb-15px mb-8px"
            >
              <el-form-item label="规格" prop="spec">
                <el-input
                  v-model="pickerQueryParams.spec"
                  placeholder="请输入规格名称"
                  clearable
                  @keyup.enter="handlePickerQuery"
                  class="!w-200px"
                />
              </el-form-item>
              <el-form-item label="版本" prop="versionId">
                <el-select
                  v-model="pickerQueryParams.versionId"
                  placeholder="请选择版本"
                  clearable
                  class="!w-160px"
                >
                  <el-option
                    v-for="item in pickerVersionList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button @click="handlePickerQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
                <el-button @click="resetPickerQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
              </el-form-item>
            </el-form>
            <el-table
              v-loading="pickerLoading"
              :data="pickerList"
              highlight-current-row
              border
              max-height="400"
              :row-class-name="getPickerRowClass"
              @row-dblclick="confirmPickerSelect"
              style="width: 100%"
            >
              <el-table-column label="版本" prop="versionName" min-width="120px" show-overflow-tooltip />
              <el-table-column label="规格" prop="spec" min-width="120px" show-overflow-tooltip />
              <el-table-column label="进货价" prop="inboundPrice" min-width="90px" align="right" />
              <el-table-column label="一级销售价" prop="onePrice" min-width="100px" align="right" />
              <el-table-column label="备注" prop="note" min-width="120px" show-overflow-tooltip />
            </el-table>
            <Pagination
              :total="pickerTotal"
              v-model:page="pickerQueryParams.pageNo"
              v-model:limit="pickerQueryParams.pageSize"
              @pagination="getPickerList"
              layout="total, prev, pager, next"
            />
          </div>
        </div>

      </div>

      <!-- 右侧：版本规格授权价 -->
      <div class="split-right">
        <template v-if="selectedCustomer">
          <div class="panel-header">
            <div class="panel-title">
              <Icon icon="ep:price-tag" class="panel-title-icon" />
              <span>{{ selectedCustomer.shortName || selectedCustomer.name }}</span>
              <el-tag type="primary" size="small" class="ml-8px">版本规格授权价</el-tag>
            </div>
            <el-button type="primary" size="small" @click="saveAll" :loading="saveLoading">
              <Icon icon="ep:check" class="mr-5px" /> 保存
            </el-button>
          </div>
          <div class="panel-body">
            <el-table v-loading="priceLoading" :data="priceList" border style="width: 100%">
              <el-table-column label="版本规格" prop="productName" min-width="200px" show-overflow-tooltip />
              <el-table-column label="一级销售价" prop="onePrice" min-width="120px" align="right" />
              <el-table-column label="授权价格" prop="authorizedPrice" min-width="160px">
                <template #default="{ row }">
                  <!-- 授权价格始终可直接编辑，无需切换编辑状态 -->
                  <el-input-number
                    v-model="row.authorizedPrice"
                    :precision="2"
                    :step="0.01"
                    :min="0"
                    :controls="false"
                    placeholder="请输入授权价格"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80px" align="center">
                <template #default="{ row, $index }">
                  <el-button
                    link
                    type="danger"
                    @click="deletePriceRow(row, $index)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
        <div v-else class="empty-placeholder">
          <el-empty :image-size="120">
            <template #description>
              <span class="empty-tip">请从左侧选择客户查看授权价</span>
            </template>
          </el-empty>
        </div>
      </div>

    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { CustomerApi, Customer } from '@/api/zc/customer'
import {
  ProductVersionApi,
  ProductVersionSimpleVO,
  ZcProductVersionSpcSimpleRespVO,
} from '@/api/zc/productversion'
import {
  CustomerVersionSpcPriceApi,
  ZcCustomerVersionSpcPriceRespVO,
} from '@/api/zc/customerversionspcprice'

/** 客户产品销售授权价 列表 */
defineOptions({ name: 'ZcCustomerProductPrice' })

const message = useMessage()
const { t } = useI18n()

// ===== 客户列表 =====
const customerLoading = ref(false)
const customerList = ref<Customer[]>([])
const customerTotal = ref(0)
const customerQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  shortName: undefined as string | undefined,
})

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
  selectedCustomer.value = null
  priceList.value = []
  getCustomerList()
}

const resetQuery = () => {
  customerQueryParams.shortName = undefined
  handleQuery()
}

// ===== 客户选择 =====
const selectedCustomer = ref<Customer | null>(null)

const handleCustomerSelect = (row: Customer | null) => {
  if (!row) return
  selectedCustomer.value = row
  getPriceList()
}

// ===== 规格映射（显示名 + 一级销售价），key 为规格 id =====
// 规格显示名 = "版本名称 规格"，加载全量数据供右侧价格列表回显使用
const specSimpleList = ref<ZcProductVersionSpcSimpleRespVO[]>([])
const specNameMap = computed<Record<number, string>>(() =>
  Object.fromEntries(
    specSimpleList.value.map((s) => [s.id, `${s.versionName} ${s.spec}`.trim()])
  )
)
const specOnePriceMap = computed<Record<number, number | undefined>>(() =>
  Object.fromEntries(specSimpleList.value.map((s) => [s.id, s.onePrice]))
)

// ===== 版本规格授权价列表 =====
interface PriceRow {
  id?: number
  customerId?: number
  productId?: number      // 规格 id，用于选择器去重判断
  versionId?: number      // 版本编号，提交批量保存时使用
  spec?: string           // 规格名称，提交批量保存时使用
  productName?: string    // 显示名 = "版本名称 规格"
  onePrice?: number       // 一级类销售价，仅展示
  authorizedPrice?: number
  _isNew: boolean
}

const priceLoading = ref(false)
const priceList = ref<PriceRow[]>([])
const saveLoading = ref(false)

const getPriceList = async () => {
  if (!selectedCustomer.value) return
  priceLoading.value = true
  try {
    const list = await CustomerVersionSpcPriceApi.getCustomerVersionSpcPriceList(
      selectedCustomer.value.id!
    )
    priceList.value = (list ?? []).map((item: ZcCustomerVersionSpcPriceRespVO) => ({
      id: item.id,
      customerId: item.customerId,
      versionId: item.versionId,
      spec: item.spec,
      productName: `${item.versionName} ${item.spec}`.trim(),
      onePrice: item.onePrice,
      authorizedPrice: item.authorizedPrice,
      _isNew: false,
    }))
  } finally {
    priceLoading.value = false
  }
}

const deletePriceRow = async (_row: PriceRow, index: number) => {
  // 覆盖写语义：删除仅移除本地行，保存时后端将按 customerId+versionId 全量覆盖
  try {
    await message.delConfirm()
    priceList.value.splice(index, 1)
  } catch {}
}

const saveAll = async () => {
  if (priceList.value.length === 0) {
    message.warning('授权价列表为空，无需保存')
    return
  }
  // 校验所有行必须填写了授权价格
  const invalidRows = priceList.value.filter(
    (row) => !row.versionId || !row.spec || row.authorizedPrice == null
  )
  if (invalidRows.length > 0) {
    message.warning('存在未填写授权价格的行，请补全后再保存')
    return
  }
  // 校验授权价列表中不存在重复的版本+规格组合
  const versionSpecKeys = priceList.value.map((row) => buildVersionSpecKey(row.versionId, row.spec))
  if (new Set(versionSpecKeys).size !== versionSpecKeys.length) {
    message.warning('授权价列表中存在重复的版本规格，请删除重复项后再保存')
    return
  }
  saveLoading.value = true
  try {
    // 覆盖写：先删除该客户所有旧记录，再全量插入
    await CustomerVersionSpcPriceApi.batchSaveCustomerVersionSpcPrice({
      customerId: selectedCustomer.value!.id!,
      specPrices: priceList.value.map((row) => ({
        versionId: row.versionId!,
        spec: row.spec!,
        authorizedPrice: row.authorizedPrice!,
      })),
    })
    message.success(t('common.updateSuccess'))
    // 保存后刷新列表，消除编辑状态
    await getPriceList()
  } finally {
    saveLoading.value = false
  }
}

// ===== 左侧产品选择器 =====
const pickerLoading = ref(false)
const pickerList = ref<any[]>([])
const pickerTotal = ref(0)
const pickerQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  spec: undefined as string | undefined,
  versionId: undefined as number | undefined,
})
const pickerFormRef = ref()
const pickerVersionList = ref<ProductVersionSimpleVO[]>([])

/** 生成版本+规格唯一键，授权价列表以 versionId+spec 作为业务唯一标识 */
const buildVersionSpecKey = (versionId?: number, spec?: string) =>
  versionId != null && spec ? `${versionId}::${spec}` : ''

/** 授权价列表中已存在的版本+规格组合（含未保存的新行） */
const priceVersionSpecKeys = computed(
  () =>
    new Set(
      priceList.value
        .map((row) => buildVersionSpecKey(row.versionId, row.spec))
        .filter(Boolean)
    )
)

/** 判断选择器行是否已在授权价列表中 */
const isPickerRowDisabled = (row: { versionId?: number; spec?: string }) =>
  priceVersionSpecKeys.value.has(buildVersionSpecKey(row.versionId, row.spec))

const getPickerList = async () => {
  pickerLoading.value = true
  try {
    const data = await ProductVersionApi.getProductVersionSpecPage(pickerQueryParams)
    pickerList.value = data.list
    pickerTotal.value = data.total
  } finally {
    pickerLoading.value = false
  }
}

const handlePickerQuery = () => {
  pickerQueryParams.pageNo = 1
  getPickerList()
}

const resetPickerQuery = () => {
  pickerFormRef.value?.resetFields()
  handlePickerQuery()
}

const getPickerRowClass = ({ row }: { row: any }) =>
  isPickerRowDisabled(row) ? 'row-disabled' : ''

/** 双击产品行 → 直接在右侧授权价列表追加一行（编辑状态等待填写价格） */
const confirmPickerSelect = (row: any) => {
  if (!selectedCustomer.value) {
    message.warning('请先从左上方选择客户')
    return
  }
  if (isPickerRowDisabled(row)) {
    message.warning('该版本规格已存在授权价，不可重复选择')
    return
  }
  priceList.value.push({
    id: undefined,
    customerId: selectedCustomer.value.id,
    productId: row.id,       // 规格 id，用于选择器去重
    versionId: row.versionId,
    spec: row.spec,
    productName: `${row.versionName || ''} ${row.spec || ''}`.trim(),
    onePrice: row.onePrice,
    authorizedPrice: undefined,
    _isNew: true,
  })
}

onMounted(async () => {
  // 预加载版本简单列表（用于选择器筛选版本下拉）
  // 预加载全量规格（pageSize=500）用于右侧价格列表回显规格名称
  const [, specPage] = await Promise.all([
    ProductVersionApi.getProductVersionSimpleList().then((list) => {
      pickerVersionList.value = list
    }),
    ProductVersionApi.getProductVersionSpecPage({ pageNo: 1, pageSize: 10 }),
  ])
  specSimpleList.value = specPage.list
  await Promise.all([getCustomerList(), getPickerList()])
})
</script>

<style scoped>
.split-layout {
  display: flex;
  min-height: 620px;
  height: calc(100vh - 145px);
}

/* 左侧：上下分为客户列表 + 产品选择器 */
.split-left {
  width: 800px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-light);
}

/* 客户列表区域，占左侧 1/2 高度 */
.customer-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 产品选择器区域，占左侧 1/2 高度 */
.picker-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--el-border-color);
  overflow: hidden;
}

/* 右侧：授权价表格 */
.split-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
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

.empty-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-tip {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>

<!-- 产品选择器禁用行样式（非 scoped，覆盖 el-table 内部 tr） -->
<style>
.row-disabled {
  color: #c0c4cc !important;
  cursor: not-allowed !important;
  background-color: #f5f7fa !important;
}
.row-disabled:hover > td {
  background-color: #f5f7fa !important;
}
</style>
