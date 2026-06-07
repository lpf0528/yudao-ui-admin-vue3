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
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['zc:workshop-user:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:workshop-user:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['zc:workshop-user:delete']"
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
      <el-table-column label="序号" align="center" type="index" width="60" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="状态" align="center" prop="status" />
      <!-- 工序节点：将 ID 列表映射为名称标签展示 -->
      <el-table-column label="工序节点" align="center" prop="nodeIds" min-width="180px">
        <template #default="{ row }">
          <el-tag
            v-for="nodeId in parseNodeIds(row.nodeIds)"
            :key="nodeId"
            class="mr-4px mb-2px"
            size="small"
          >
            {{ getNodeName(nodeId) }}
          </el-tag>
          <span v-if="!parseNodeIds(row.nodeIds).length" class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="creator" />
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
            v-hasPermi="['zc:workshop-user:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:workshop-user:delete']"
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
  <WorkshopUserForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { WorkshopUserApi, WorkshopUser } from '@/api/zc/workshopuser'
import { ProcessNodeApi, ProcessNodeSimpleVO } from '@/api/zc/processnode'
import WorkshopUserForm from './WorkshopUserForm.vue'

/** 车间员工 列表 */
defineOptions({ name: 'ZcWorkshopUser' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<WorkshopUser[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await WorkshopUserApi.getWorkshopUserPage(queryParams)
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
    await WorkshopUserApi.deleteWorkshopUser(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除车间员工 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await WorkshopUserApi.deleteWorkshopUserList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: WorkshopUser[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await WorkshopUserApi.exportWorkshopUser(queryParams)
    download.excel(data, '车间员工.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// ======================== 工序节点映射 ========================
/** 工序节点精简列表，用于将 ID 渲染为名称 */
const processNodeList = ref<ProcessNodeSimpleVO[]>([])

/** 将 nodeIds（可能为数组或 JSON 字符串）统一解析为 number[] */
const parseNodeIds = (nodeIds: any): number[] => {
  if (Array.isArray(nodeIds)) return nodeIds
  if (typeof nodeIds === 'string') {
    try { return JSON.parse(nodeIds) } catch { return [] }
  }
  return []
}

/** 根据工序节点 ID 查找名称，未找到时回退显示 ID */
const getNodeName = (id: number): string => {
  return processNodeList.value.find((n) => n.id === id)?.name ?? String(id)
}

/** 初始化 **/
onMounted(async () => {
  processNodeList.value = await ProcessNodeApi.getSimpleProcessNodeList({ group: 1 })
  getList()
})
</script>
