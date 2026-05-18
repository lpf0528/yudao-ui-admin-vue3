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
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="客户" prop="customerId">
        <el-select
          v-model="queryParams.customerId"
          placeholder="请选择客户"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in customersList"
            :key="item.id"
            :label="`${item.shortName}/${item.contactName}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单日期" prop="orderDate">
        <el-date-picker
          v-model="queryParams.orderDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="交付日期" prop="deliveryDate">
        <el-date-picker
          v-model="queryParams.deliveryDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="结算状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择结算状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_ORDER_PAY_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择订单状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_ORDER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="请选择订单类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_ORDER_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否加急" prop="isExpedited">
        <el-select
          v-model="queryParams.isExpedited"
          placeholder="请选择是否加急"
          clearable
          class="!w-240px"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" prop="brandId">
        <el-select
          v-model="queryParams.brandId"
          placeholder="请选择品牌"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in brandsList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="版本" prop="versionId">
        <el-select
          v-model="queryParams.versionId"
          placeholder="请选择版本"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in productVersionList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品" prop="productId">
        <el-select
          v-model="queryParams.productId"
          placeholder="请选择产品"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in productsList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['zc:sales-order:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:sales-order:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['zc:sales-order:delete']"
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
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="客户" align="center" prop="customerId">
        <template #default="scope">{{ customerIdMap[scope.row.customerId] }}</template>
      </el-table-column>
      <el-table-column label="手机" align="center" prop="mobile" />
      <el-table-column label="品牌" align="center" prop="brandId">
        <template #default="scope">{{ brandIdMap[scope.row.brandId] }}</template>
      </el-table-column>
      <el-table-column label="下单日期" align="center" prop="orderDate" :formatter="dateFormatter" width="120px" />
      <el-table-column label="物流" align="center" prop="logisticId">
        <template #default="scope">{{ logisticIdMap[scope.row.logisticId] }}</template>
      </el-table-column>
      <el-table-column label="收货人" align="center" prop="receiver" />
      <el-table-column label="送货地址" align="center" prop="deliveryAddress" />
      <el-table-column label="运费" align="center" prop="freight" />
      <el-table-column label="订单类型" align="center" prop="types">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_ORDER_TYPE" :value="scope.row.types" />
        </template>
      </el-table-column>
      <el-table-column label="优惠金额" align="center" prop="discountAmount" />
      <el-table-column label="总金额" align="center" prop="totalAmount" />
      <el-table-column label="订单金额" align="center" prop="amount" />
      <el-table-column label="已收金额" align="center" prop="amountReceived" />
      <el-table-column label="交付日期" align="center" prop="deliveryDate" :formatter="dateFormatter" width="120px" />
      <el-table-column label="结算状态" align="center" prop="payStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_ORDER_PAY_STATUS" :value="scope.row.payStatus" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_ORDER_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="确认时间"
        align="center"
        prop="confirmTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="是否加急" align="center" prop="isExpedited">
        <template #default="scope">
          <el-tag :type="scope.row.isExpedited ? 'danger' : 'info'" size="small">
            {{ scope.row.isExpedited ? '是' : '否' }}
          </el-tag>
        </template>
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
            v-hasPermi="['zc:sales-order:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:sales-order:delete']"
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
  <SalesOrderForm ref="formRef" :customersList="customersList" :brandsList="brandsList" :logisticsList="logisticsList" @success="getList" />
</template>

<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { SalesOrderApi, SalesOrder } from '@/api/zc/salesorder'
import { CustomerApi, CustomerSimpleVO } from '@/api/zc/customer'
import { BrandApi, BrandSimpleVO } from '@/api/zc/brand'
import { LogisticsApi, LogisticsSimpleVO } from '@/api/zc/logistics'
import { ProductVersionApi, ProductVersionSimpleVO } from '@/api/zc/productversion'
import { ProductApi, ProductSimpleVO } from '@/api/zc/product'
import SalesOrderForm from './SalesOrderForm.vue'

/** 销售订单 列表 */
defineOptions({ name: 'ZcSalesOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<SalesOrder[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const customersList = ref<CustomerSimpleVO[]>([]) // 客户列表
const brandsList = ref<BrandSimpleVO[]>([]) // 品牌列表
const logisticsList = ref<LogisticsSimpleVO[]>([]) // 物流列表
const productVersionList = ref<ProductVersionSimpleVO[]>([]) // 产品版本列表
const productsList = ref<ProductSimpleVO[]>([]) // 产品列表
const customerIdMap = computed(() =>
  Object.fromEntries(customersList.value.map((item) => [item.id, `${item.shortName}/${item.contactName}`]))
)
const brandIdMap = computed(() =>
  Object.fromEntries(brandsList.value.map((item) => [item.id, item.name]))
)
const logisticIdMap = computed(() =>
  Object.fromEntries(logisticsList.value.map((item) => [item.id, item.name]))
)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  customerId: undefined,
  mobile: undefined,
  brandId: undefined,
  orderDate: [],
  logisticId: undefined,
  receiver: undefined,
  deliveryAddress: undefined,
  freight: undefined,
  types: undefined,
  deliveryDate: [],
  payStatus: undefined,
  status: undefined,
  confirmTime: [],
  isExpedited: undefined,
  note: undefined,
  createTime: [],
  versionId: undefined,
  productId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 版本变化时重新加载产品列表，并清空已选产品 */
watch(
  () => queryParams.versionId,
  async (versionId) => {
    queryParams.productId = undefined
    productsList.value = await ProductApi.getProductSimpleList(versionId)
  }
)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SalesOrderApi.getSalesOrderPage(queryParams)
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
    await SalesOrderApi.deleteSalesOrder(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除销售订单 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await SalesOrderApi.deleteSalesOrderList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: SalesOrder[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await SalesOrderApi.exportSalesOrder(queryParams)
    download.excel(data, '销售订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  ;[customersList.value, brandsList.value, logisticsList.value, productVersionList.value, productsList.value] = await Promise.all([
    CustomerApi.getCustomerSimpleList(),
    BrandApi.getBrandSimpleList(),
    LogisticsApi.getLogisticsSimpleList(),
    ProductVersionApi.getProductVersionSimpleList(),
    ProductApi.getProductSimpleList(),
  ])
  await getList()
})
</script>
