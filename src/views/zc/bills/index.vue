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
      <!-- <el-form-item label="财务人员" prop="billUserId">
        <el-input
          v-model="queryParams.billUserId"
          placeholder="请输入财务人员"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <el-form-item label="客户" prop="customerId">
        <el-select
          v-model="queryParams.customerId"
          placeholder="请选择客户"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="item in customersList"
            :key="item.id"
            :label="item.shortName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收支方式" prop="billMethodId">
        <el-select
          v-model="queryParams.billMethodId"
          placeholder="请选择收支方式"
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
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:bills:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
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
        @expand-change="handleExpandChange"
    >
      <el-table-column type="expand" width="40">
        <template #default="{ row }">
          <div class="px-40px py-10px">
            <div v-if="orderItemsLoading[row.id]" class="text-center py-10px text-gray-400 text-sm">
              加载中...
            </div>
            <template v-else>
              <div
                v-if="!orderItemsCache[row.id] || orderItemsCache[row.id].length === 0"
                class="text-center py-10px text-gray-400 text-sm"
              >
                暂无订单分摊明细
              </div>
              <el-table
                v-else
                :data="orderItemsCache[row.id]"
                size="small"
                border
              >
                <el-table-column label="订单号" prop="orderNo" min-width="160" />
                <el-table-column label="本次分摊金额" prop="allocatedAmount" align="right" width="130" />
                <el-table-column label="备注" prop="note" min-width="120" />
              </el-table>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="单号" align="center" prop="billNo" />
      <el-table-column label="付款时间" align="center" prop="billDate" :formatter="dateFormatter2" width="110" />
      <el-table-column label="客户" align="center" prop="customerName" />
      <el-table-column label="优惠金额" align="center" prop="discountAmount" />
      <el-table-column label="实收金额" align="center" prop="actualAmount" />
      <el-table-column label="收支方式" align="center" prop="billMethodName" />
      <el-table-column label="备注" align="center" prop="note" />
      <el-table-column label="操作" align="center" min-width="80px">
        <template #default="scope">
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:bills:delete']"
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

</template>

<script setup lang="ts">
import download from '@/utils/download'
import { dateFormatter2 } from '@/utils/formatTime'
import { BillsApi, Bills, BillOrderItem } from '@/api/zc/bills'
import { CustomerApi, CustomerSimpleVO } from '@/api/zc/customer'
import { BillMethodsApi, BillMethodsSimpleVO } from '@/api/zc/bill_methods'

/** 收支账单 列表 */
defineOptions({ name: 'ZcBills' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Bills[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  billNo: undefined,
  billDate: [],
  billUserId: undefined,
  customerId: undefined,
  billMethodId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// ======================== 展开行：订单分摊明细 ========================
/** key 为 billId，避免重复请求 */
const orderItemsCache = reactive<Record<number, BillOrderItem[]>>({})
const orderItemsLoading = reactive<Record<number, boolean>>({})

const handleExpandChange = async (row: Bills, expandedRows: Bills[]) => {
  const isExpanding = expandedRows.some((r) => r.id === row.id)
  if (!isExpanding || orderItemsCache[row.id] !== undefined) return
  orderItemsLoading[row.id] = true
  try {
    orderItemsCache[row.id] = await BillsApi.getOrderItems(row.id)
  } finally {
    orderItemsLoading[row.id] = false
  }
}

/** 客户精简列表（用于搜索栏下拉） */
const customersList = ref<CustomerSimpleVO[]>([])
/** 收支方式精简列表（用于搜索栏下拉） */
const billMethodsList = ref<BillMethodsSimpleVO[]>([])

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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await BillsApi.deleteBills(id)
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
    const data = await BillsApi.exportBills(queryParams)
    download.excel(data, '收支账单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  customersList.value = await CustomerApi.getCustomerSimpleList()
  billMethodsList.value = await BillMethodsApi.getBillMethodsSimpleList()
  await getList()
})
</script>