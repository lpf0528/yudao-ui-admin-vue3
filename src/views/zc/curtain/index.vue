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
      <el-form-item label="款式名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入款式名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['zc:curtain:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:curtain:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['zc:curtain:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        ref="tableRef"
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="expand">
        <template #default="scope">
          <div class="px-8 py-3 bg-gray-50">
            <div
              v-for="(row, index) in getRowStructures(scope.row.id)"
              :key="index"
              class="flex gap-2 mb-2 items-center"
            >
              <el-select
                v-model="row.structureId"
                placeholder="请选择结构"
                style="width: 160px; flex-shrink: 0"
                @change="onRowStructureChange(scope.row.id, index)"
              >
                <el-option
                  v-for="s in getAvailableStructures(scope.row.id, index)"
                  :key="s.id"
                  :label="s.name"
                  :value="s.id"
                />
              </el-select>
              <el-select
                v-model="row.elementIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="5"
                placeholder="请选择配件"
                style="flex: 1"
              >
                <el-option
                  v-for="e in elementList"
                  :key="e.id"
                  :label="e.name"
                  :value="e.id"
                />
              </el-select>
              <el-button
                type="danger"
                :icon="Delete"
                circle
                plain
                @click="removeRowStructure(scope.row.id, index)"
              />
            </div>
            <div class="flex gap-2 mt-1">
              <el-button type="primary" plain :icon="Plus" @click="addRowStructure(scope.row.id)">
                添加结构
              </el-button>
              <el-button type="primary" @click="saveTemplate(scope.row.id)">保存</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="款式名称" align="center" prop="name" />
      <el-table-column label="默认褶倍" align="center" prop="pleatRatioValue" />
      <el-table-column label="褶距" align="center" prop="pleatsDistance" />
      <el-table-column label="备注" align="center" prop="note" />
      <el-table-column label="创建者" align="center" prop="creator" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="150px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['zc:curtain:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="toggleExpand(scope.row)"
          >
            配置模板
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:curtain:delete']"
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
  <CurtainForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CurtainApi, Curtain } from '@/api/zc/curtain'
import { CurtainTemplateApi, CurtainTemplate } from '@/api/zc/curtaintemplate'
import { CurtainStructureApi, CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import { CurtainStructureElementApi, CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'
import CurtainForm from './CurtainForm.vue'

/** 窗帘 列表 */
defineOptions({ name: 'ZcCurtain' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<Curtain[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined
})
const queryFormRef = ref()
const exportLoading = ref(false)
const tableRef = ref()

/** 结构/配件下拉数据 */
const structureList = ref<CurtainStructureSimpleVO[]>([])
const elementList = ref<CurtainStructureElementSimpleVO[]>([])

interface StructureRow {
  structureId: number | undefined
  elementIds: number[]
}

/** 每行的结构配置，key 为 curtainId */
const rowStructures = reactive<Record<number, StructureRow[]>>({})

const getRowStructures = (curtainId: number): StructureRow[] => {
  if (!rowStructures[curtainId]) rowStructures[curtainId] = []
  return rowStructures[curtainId]
}

const getAvailableStructures = (curtainId: number, index: number) => {
  const usedIds = new Set(
    (rowStructures[curtainId] || [])
      .filter((_, i) => i !== index)
      .map((r) => r.structureId)
      .filter((id) => id !== undefined)
  )
  return structureList.value.filter((s) => !usedIds.has(s.id))
}

const onRowStructureChange = (curtainId: number, index: number) => {
  rowStructures[curtainId][index].elementIds = []
}

const addRowStructure = (curtainId: number) => {
  getRowStructures(curtainId).push({ structureId: undefined, elementIds: [] })
}

const removeRowStructure = (curtainId: number, index: number) => {
  rowStructures[curtainId].splice(index, 1)
}

/** 保存模板 */
const saveTemplate = async (curtainId: number) => {
  const structures = rowStructures[curtainId] || []
  if (structures.length === 0) {
    message.warning('至少添加一个结构')
    return
  }
  if (structures.some((r) => r.structureId === undefined)) {
    message.warning('结构不能为空')
    return
  }
  await CurtainTemplateApi.createCurtainTemplate({ curtainId, structures } as unknown as CurtainTemplate)
  message.success('配置成功')
}

/** 切换行展开，同时懒加载下拉数据 */
const toggleExpand = async (row: Curtain) => {
  if (structureList.value.length === 0) {
    ;[structureList.value, elementList.value] = await Promise.all([
      CurtainStructureApi.getCurtainStructureSimpleList(),
      CurtainStructureElementApi.getCurtainStructureElementSimpleList()
    ])
  }
  tableRef.value?.toggleRowExpansion(row)
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CurtainApi.getCurtainPage(queryParams)
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
    await message.delConfirm()
    await CurtainApi.deleteCurtain(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 批量删除窗帘 */
const handleDeleteBatch = async () => {
  try {
    await message.delConfirm()
    await CurtainApi.deleteCurtainList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Curtain[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CurtainApi.exportCurtain(queryParams)
    download.excel(data, '窗帘.xls')
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
