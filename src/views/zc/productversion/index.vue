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
      <el-form-item label="版本名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入版本名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="单位（字典）" prop="unitValue">
        <el-input
          v-model="queryParams.unitValue"
          placeholder="请输入单位（字典）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="规格ID" prop="specId">
        <el-input
          v-model="queryParams.specId"
          placeholder="请输入规格ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类别ID" prop="categoryId">
        <el-input
          v-model="queryParams.categoryId"
          placeholder="请输入类别ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="出货价类型" prop="sellingPriceType">
        <el-select
          v-model="queryParams.sellingPriceType"
          placeholder="请选择出货价类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_SELLING_PRICE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="进货价" prop="inboundPrice">
        <el-input
          v-model="queryParams.inboundPrice"
          placeholder="请输入进货价"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分类" prop="classify">
        <el-input
          v-model="queryParams.classify"
          placeholder="请输入分类"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-input
          v-model="queryParams.supplierId"
          placeholder="请输入供应商"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建者" prop="creator">
        <el-input
          v-model="queryParams.creator"
          placeholder="请输入创建者"
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
          v-hasPermi="['zc:product-version:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['zc:product-version:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['zc:product-version:delete']"
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
      <el-table-column label="版本名称" align="center" prop="name" />
      <el-table-column label="单位（字典）" align="center" prop="unitValue">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_PRODUCT_UNIT" :value="scope.row.unitValue" />
        </template>
      </el-table-column>
      <el-table-column label="规格值" align="center" prop="specValue" />
      <el-table-column label="物料类别" align="center" prop="categoryValue" />
      <el-table-column label="出货价类型" align="center" prop="sellingPriceType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_SELLING_PRICE_TYPE" :value="scope.row.sellingPriceType" />
        </template>
      </el-table-column>
      <el-table-column label="进货价" align="center" prop="inboundPrice" />
      <el-table-column label="分类" align="center" prop="classify">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ZC_PRODUCT_CLASSIFY" :value="scope.row.classify" />
        </template>
      </el-table-column>
      <el-table-column label="供应商" align="center" prop="supplierId" />
      <el-table-column label="备注" align="center" prop="note" />
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
            v-hasPermi="['zc:product-version:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['zc:product-version:delete']"
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
  <ProductVersionForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ProductVersionApi, ProductVersion } from '@/api/zc/productversion'
import ProductVersionForm from './ProductVersionForm.vue'

/** 产品版本 列表 */
defineOptions({ name: 'ZcProductVersion' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProductVersion[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  unitValue: undefined,
  specId: undefined,
  categoryId: undefined,
  sellingPriceType: undefined,
  inboundPrice: [],
  classify: undefined,
  supplierId: undefined,
  creator: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProductVersionApi.getProductVersionPage(queryParams)
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
    await ProductVersionApi.deleteProductVersion(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除产品版本 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductVersionApi.deleteProductVersionList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ProductVersion[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProductVersionApi.exportProductVersion(queryParams)
    download.excel(data, '产品版本.xls')
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
