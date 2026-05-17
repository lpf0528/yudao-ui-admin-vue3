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
      <el-form-item label="款式" prop="curtainId">
        <el-select
          v-model="queryParams.curtainId"
          placeholder="请选择款式"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in curtainList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="结构" prop="structureId">
        <el-select
          v-model="queryParams.structureId"
          placeholder="请选择结构"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in structureList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配件" prop="elementId">
        <el-select
          v-model="queryParams.elementId"
          placeholder="请选择配件"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in elementList"
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
          v-hasPermi="['zc:curtain-template:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:curtain-template:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['zc:curtain-template:delete']"
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
      <el-table-column label="款式" align="center" prop="curtainId">
        <template #default="scope">{{ curtainIdMap[scope.row.curtainId] }}</template>
      </el-table-column>
      <el-table-column label="结构" align="center" prop="structureId">
        <template #default="scope">{{ structureIdMap[scope.row.structureId] }}</template>
      </el-table-column>
      <el-table-column label="配件" align="center" prop="elementId">
        <template #default="scope">{{ elementIdMap[scope.row.elementId] }}</template>
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
            v-hasPermi="['zc:curtain-template:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:curtain-template:delete']"
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
  <CurtainTemplateForm
    ref="formRef"
    :curtainList="curtainList"
    :structureList="structureList"
    :elementList="elementList"
    @success="getList"
  />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CurtainTemplateApi, CurtainTemplate } from '@/api/zc/curtaintemplate'
import { CurtainApi, CurtainSimpleVO } from '@/api/zc/curtain'
import { CurtainStructureApi, CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import { CurtainStructureElementApi, CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'
import CurtainTemplateForm from './CurtainTemplateForm.vue'

/** 窗帘模板 列表 */
defineOptions({ name: 'ZcCurtainTemplate' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CurtainTemplate[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const curtainList = ref<CurtainSimpleVO[]>([]) // 款式列表
const structureList = ref<CurtainStructureSimpleVO[]>([]) // 结构列表
const elementList = ref<CurtainStructureElementSimpleVO[]>([]) // 配件列表
const curtainIdMap = computed(() =>
  Object.fromEntries(curtainList.value.map((item) => [item.id, item.name]))
)
const structureIdMap = computed(() =>
  Object.fromEntries(structureList.value.map((item) => [item.id, item.name]))
)
const elementIdMap = computed(() =>
  Object.fromEntries(elementList.value.map((item) => [item.id, item.name]))
)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  curtainId: undefined,
  structureId: undefined,
  elementId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CurtainTemplateApi.getCurtainTemplatePage(queryParams)
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
    await CurtainTemplateApi.deleteCurtainTemplate(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除窗帘模板 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await CurtainTemplateApi.deleteCurtainTemplateList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: CurtainTemplate[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CurtainTemplateApi.exportCurtainTemplate(queryParams)
    download.excel(data, '窗帘模板.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  curtainList.value = await CurtainApi.getCurtainSimpleList()
  structureList.value = await CurtainStructureApi.getCurtainStructureSimpleList()
  elementList.value = await CurtainStructureElementApi.getCurtainStructureElementSimpleList()
  await getList()
})
</script>