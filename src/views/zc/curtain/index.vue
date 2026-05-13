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
      <el-form-item label="系列" prop="seriesId">
        <el-input
          v-model="queryParams.seriesId"
          placeholder="请输入系列"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="粘贴方向" prop="pasteDirection">
        <el-select
          v-model="queryParams.pasteDirection"
          placeholder="请选择粘贴方向"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.PASTE_DIRECTION)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="打开方式" prop="openMethod">
        <el-select
          v-model="queryParams.openMethod"
          placeholder="请选择打开方式"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.OPEN_METHOD)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="默认安装工艺" prop="installProcessId">
        <el-select
          v-model="queryParams.installProcessId"
          placeholder="请选择默认安装工艺"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="加工类型" prop="processType">
        <el-select
          v-model="queryParams.processType"
          placeholder="请选择加工类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.PROCESS_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="默认褶倍" prop="pleatRatioValue">
        <el-input
          v-model="queryParams.pleatRatioValue"
          placeholder="请输入默认褶倍"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="褶距" prop="pleatsDistance">
        <el-input
          v-model="queryParams.pleatsDistance"
          placeholder="请输入褶距"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input
          v-model="queryParams.note"
          placeholder="请输入备注"
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
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="款式名称" align="center" prop="name" />
      <el-table-column label="系列" align="center" prop="seriesId" />
      <el-table-column label="粘贴方向" align="center" prop="pasteDirection">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PASTE_DIRECTION" :value="scope.row.pasteDirection" />
        </template>
      </el-table-column>
      <el-table-column label="打开方式" align="center" prop="openMethod">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.OPEN_METHOD" :value="scope.row.openMethod" />
        </template>
      </el-table-column>
      <el-table-column label="默认安装工艺" align="center" prop="installProcessId" />
      <el-table-column label="加工类型" align="center" prop="processType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PROCESS_TYPE" :value="scope.row.processType" />
        </template>
      </el-table-column>
      <el-table-column label="默认褶倍" align="center" prop="pleatRatioValue" />
      <el-table-column label="褶距" align="center" prop="pleatsDistance" />
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
            v-hasPermi="['zc:curtain:update']"
          >
            编辑
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
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CurtainApi, Curtain } from '@/api/zc/curtain'
import CurtainForm from './CurtainForm.vue'

/** 窗帘 列表 */
defineOptions({ name: 'Curtain' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Curtain[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  seriesId: undefined,
  pasteDirection: undefined,
  openMethod: undefined,
  installProcessId: undefined,
  processType: undefined,
  pleatRatioValue: undefined,
  pleatsDistance: undefined,
  note: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

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
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CurtainApi.deleteCurtain(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除窗帘 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await CurtainApi.deleteCurtainList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Curtain[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
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
