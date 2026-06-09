<!--
  收支账单 - 列表页
  支持按单号、付款时间、财务人员、客户、收款方式查询，可进行删除操作
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
      <el-form-item label="单号" prop="billNo">
        <el-input
          v-model="queryParams.billNo"
          placeholder="请输入单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="付款时间" prop="billDate">
        <el-date-picker
          v-model="queryParams.billDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
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
            v-for="item in customerList"
            :key="item.id"
            :label="item.shortName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收款方式" prop="billMethodId">
        <el-select
          v-model="queryParams.billMethodId"
          placeholder="请选择收款方式"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in billMethodsList"
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

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="单号" align="center" prop="billNo" />
      <el-table-column label="付款时间" align="center" prop="billDate" />
      <el-table-column label="客户" align="center" prop="customerId">
        <template #default="scope">{{ customerIdMap[scope.row.customerId] }}</template>
      </el-table-column>
      <el-table-column label="优惠金额" align="center" prop="discountAmount" />
      <el-table-column label="实收金额 " align="center" prop="actualAmount" />
      <el-table-column label="收款方式" align="center" prop="billMethodId">
        <template #default="scope">{{ billMethodIdMap[scope.row.billMethodId] }}</template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="note" />
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
import { BillsApi, Bills } from '@/api/zc/bills'
import { BillMethodsApi, BillMethodsSimpleVO } from '@/api/zc/bill_methods'
import { CustomerApi, CustomerSimpleVO } from '@/api/zc/customer'

/** 收支账单 列表 */
defineOptions({ name: 'ZcBills' })

// ======================== 响应式状态 ========================
const loading = ref(true) // 列表的加载中
const list = ref<Bills[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  billNo: undefined,
  billDate: [],

  customerId: undefined,
  billMethodId: undefined
})
const queryFormRef = ref() // 搜索的表单
const billMethodsList = ref<BillMethodsSimpleVO[]>([]) // 收款方式列表
const billMethodIdMap = computed(() =>
  Object.fromEntries(billMethodsList.value.map((item) => [item.id, item.name]))
)
const customerList = ref<CustomerSimpleVO[]>([]) // 客户列表
const customerIdMap = computed(() =>
  Object.fromEntries(customerList.value.map((item) => [item.id, item.shortName]))
)

// ======================== 数据获取 ========================
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await BillsApi.getBillsPage(queryParams)
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

// ======================== 生命周期 ========================
onMounted(async () => {
  billMethodsList.value = await BillMethodsApi.getBillMethodsSimpleList()
  customerList.value = await CustomerApi.getCustomerSimpleList()
  await getList()
})
</script>
