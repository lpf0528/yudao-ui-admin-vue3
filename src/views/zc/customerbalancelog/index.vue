<!--
  客户余额变动流水 - 列表页
  支持按客户、业务类型、创建时间等条件查询，支持导出
-->
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
      <el-form-item label="客户" prop="customerId">
        <el-select
          v-model="queryParams.customerId"
          placeholder="请选择客户"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in customerList"
            :key="item.id"
            :label="item.shortName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="bizType">
        <el-select
          v-model="queryParams.bizType"
          placeholder="请选择业务类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_CUSTOMER_BALANCE_BIZ_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联单据类型" prop="refType">
        <el-select
          v-model="queryParams.refType"
          placeholder="请选择单据类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_CUSTOMER_BALANCE_REF_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联单号" prop="refNo">
        <el-input
          v-model="queryParams.refNo"
          placeholder="请输入关联单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:customer-balance-log:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="客户" align="center" prop="customerId">
        <template #default="scope">{{ customerIdMap[scope.row.customerId] }}</template>
      </el-table-column>
      <el-table-column label="余额变动额" align="center" prop="changeAmount" />
      <el-table-column label="变动前余额" align="center" prop="balanceBefore" />
      <el-table-column label="变动后余额" align="center" prop="balanceAfter" />
      <el-table-column label="业务类型" align="center" prop="bizType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_CUSTOMER_BALANCE_BIZ_TYPE" :value="scope.row.bizType" />
        </template>
      </el-table-column>
      <el-table-column label="单据类型" align="center" prop="refType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_CUSTOMER_BALANCE_REF_TYPE" :value="scope.row.refType" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="关联单据" align="center" prop="refId" /> -->
      <el-table-column label="关联单号" align="center" prop="refNo" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CustomerBalanceLogApi, CustomerBalanceLog } from '@/api/zc/customerbalancelog'
import { CustomerApi, CustomerSimpleVO } from '@/api/zc/customer'

/** 客户余额变动流水 列表 */
defineOptions({ name: 'ZcCustomerBalanceLog' })

const message = useMessage() // 消息弹窗

// ======================== 响应式状态 ========================
const loading = ref(true) // 列表的加载中
const list = ref<CustomerBalanceLog[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const customerList = ref<CustomerSimpleVO[]>([]) // 客户列表
const customerIdMap = computed(() =>
  Object.fromEntries(customerList.value.map((item) => [item.id, item.shortName]))
)

/** 查询参数，与后端分页 VO 对应 */
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  customerId: undefined,
  changeAmount: undefined,
  balanceBefore: undefined,
  balanceAfter: undefined,
  bizType: undefined,
  refType: undefined,
  refId: undefined,
  refNo: undefined,
  remark: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// ======================== 数据获取 ========================
/** 查询分页列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CustomerBalanceLogApi.getCustomerBalanceLogPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// ======================== 事件处理 ========================
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

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CustomerBalanceLogApi.exportCustomerBalanceLog(queryParams)
    download.excel(data, '客户余额变动流水.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// ======================== 生命周期 ========================
onMounted(async () => {
  customerList.value = await CustomerApi.getCustomerSimpleList()
  await getList()
})
</script>
