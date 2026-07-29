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
      <el-form-item label="销售单" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入销售单"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="结构行" prop="orderStructureId">
        <el-input
          v-model="queryParams.orderStructureId"
          placeholder="请输入结构行"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
          v-hasPermi="['zc:ZC-sales-order-material:export']"
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
    >
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="销售单号" align="center" prop="orderNo" min-width="120px" />
      <el-table-column label="结构行" align="center" prop="orderStructureId" />
      <el-table-column label="组件类型" align="center" prop="elementId" />
      <el-table-column label="货号" align="center" prop="productId" />
      <el-table-column label="产品名称" align="center" prop="productName" min-width="120px" />
      <el-table-column label="产品版本分类" align="center" prop="classify">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_PRODUCT_CLASSIFY" :value="scope.row.classify" />
        </template>
      </el-table-column>
      <el-table-column label="批次号" align="center" prop="batchNo" min-width="120px" />
      <el-table-column label="规格" align="center" prop="spec" />
      <el-table-column label="单价" align="center" prop="price" />
      <el-table-column label="用料" align="center" prop="quantity" />
      <el-table-column label="单位" align="center" prop="unitValue" />
      <el-table-column label="折扣率" align="center" prop="discountRate" />
      <el-table-column label="小计" align="center" prop="amount" />
      <el-table-column label="裁剪数量" align="center" prop="cutQuantity" />
      <el-table-column label="配料状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'HAVE_PEILIAO' ? 'success' : 'info'">
            {{ scope.row.status === 'HAVE_PEILIAO' ? '已配料' : '未配料' }}
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
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
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
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { DICT_TYPE } from '@/utils/dict'
import { ZCSalesOrderMaterialApi, ZCSalesOrderMaterial } from '@/api/zc/salesorder/material'

/** 成品订单-用料明细 列表 */
defineOptions({ name: 'ZCSalesOrderMaterial' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ZCSalesOrderMaterial[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  orderStructureId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ZCSalesOrderMaterialApi.getZCSalesOrderMaterialPage(queryParams)
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

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ZCSalesOrderMaterialApi.exportZCSalesOrderMaterial(queryParams)
    download.excel(data, '成品订单-用料明细.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>