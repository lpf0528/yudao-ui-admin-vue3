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
      <el-form-item label="简称" prop="shortName">
        <el-input
          v-model="queryParams.shortName"
          placeholder="请输入简称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="全称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入全称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="物流" prop="logisticId">
        <el-select
          v-model="queryParams.logisticId"
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
          v-model="queryParams.brandId"
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
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['zc:customer:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="warning"
          plain
          @click="handleImport"
          v-hasPermi="['zc:customer:import']"
        >
          <Icon icon="ep:upload" class="mr-5px" /> 导入
        </el-button>
        <el-button
          type="info"
          plain
          @click="handleDownloadTemplate"
          v-hasPermi="['zc:customer:import']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 下载模板
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:customer:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
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
    >
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="简称" align="center" prop="shortName" />
      <el-table-column label="全称" align="center" prop="name" />
      <el-table-column label="联系人" align="center" prop="contactName" />
      <!-- <el-table-column label="固定地址" align="center" prop="address" /> -->
      <el-table-column label="送货地址" align="center" prop="deliveryAddress" />
      <el-table-column label="手机" align="center" prop="mobile" />
      <!-- <el-table-column label="联系电话" align="center" prop="mobile2" /> -->
      <el-table-column label="物流" align="center" prop="logisticName" />
      <el-table-column label="关联品牌" align="center" prop="brandName" />
      <el-table-column label="账户余额" align="center" prop="balance" />
      <el-table-column label="备注" align="center" prop="note" />
      <!-- <el-table-column label="创建者" align="center" prop="creator" /> -->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button link type="primary" @click="handlePrintShipping(scope.row)">
            打印发货联
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['zc:customer:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:customer:delete']"
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
  <CustomerForm ref="formRef" :logisticsList="logisticsList" :brandList="brandList" @success="getList" />
  <!-- 导入弹窗 -->
  <CustomerImportForm ref="importFormRef" @success="getList" />
  <!-- 客户发货联打印弹窗 -->
  <CustomerShippingPrintDialog ref="shippingPrintDialogRef" />
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CustomerApi, Customer } from '@/api/zc/customer'
import { LogisticsApi, Logistics } from '@/api/zc/logistics'
import { BrandApi, Brand } from '@/api/zc/brand'
import CustomerForm from './CustomerForm.vue'
import CustomerImportForm from './CustomerImportForm.vue'
import CustomerShippingPrintDialog from './CustomerShippingPrintDialog.vue'

/** 客户资料 列表 */
defineOptions({ name: 'ZcCustomer' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Customer[]>([]) // 列表的数据
const logisticsList = ref<Logistics[]>([]) // 物流列表
const brandList = ref<Brand[]>([]) // 品牌列表
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  shortName: undefined,
  name: undefined,
  logisticId: undefined,
  brandId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CustomerApi.getCustomerPage(queryParams)
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

/** 打印客户发货联 */
const shippingPrintDialogRef = ref<InstanceType<typeof CustomerShippingPrintDialog>>()
const handlePrintShipping = (row: Customer) => {
  shippingPrintDialogRef.value?.open(row)
}

/** 导入按钮操作 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 下载客户导入模板 */
const handleDownloadTemplate = async () => {
  const res = await CustomerApi.importTemplate()
  download.excel(res, '客户导入模板.xls')
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CustomerApi.deleteCustomer(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CustomerApi.exportCustomer(queryParams)
    download.excel(data, '客户资料.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  ;[logisticsList.value, brandList.value] = await Promise.all([
    LogisticsApi.getLogisticsSimpleList(),
    BrandApi.getBrandSimpleList(),
  ])
  await getList()
})
</script>
