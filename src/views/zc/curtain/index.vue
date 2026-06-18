<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    
      @submit.prevent
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
<!--        <el-button-->
<!--            type="danger"-->
<!--            plain-->
<!--            :disabled="isEmpty(checkedIds)"-->
<!--            @click="handleDeleteBatch"-->
<!--            v-hasPermi="['zc:curtain:delete']"-->
<!--        >-->
<!--          <Icon icon="ep:delete" class="mr-5px" /> 批量删除-->
<!--        </el-button>-->
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
        @expand-change="onExpandChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="expand">
        <template #default="scope">
          <div class="px-8 py-4 bg-slate-100 border-t border-slate-200">
            <div
              v-for="(row, index) in getRowStructures(scope.row.id)"
              :key="index"
              class="flex gap-2 items-start mb-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200"
            >
              <!-- 删除 + 序号 -->
              <div class="flex items-center gap-1 flex-shrink-0 pt-1">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  plain
                  size="small"
                  @click="removeRowStructure(scope.row.id, index)"
                />
                <span class="text-sm text-gray-600 flex-shrink-0">#{{ index + 1 }}</span>
              </div>
              <!-- 结构 + 属性 / 配件 -->
              <div class="flex-1">
                <div class="flex gap-2 items-center mb-1">
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
                  <span
                    v-if="getSelectedStructureAttributes(row.structureId).length"
                    class="text-xs text-gray-500 flex-shrink-0"
                  >结构属性：</span>
                  <el-tag
                    v-for="attr in getSelectedStructureAttributes(row.structureId)"
                    :key="attr"
                    class="mr-4px"
                    size="small"
                  >{{ getDictLabel(DICT_TYPE.ZC_STRUCTURE_ATTRIBUTES, attr) }}</el-tag>
                </div>
                <!-- 配件列表：每个配件单独一行，可指定一个产品；与上方属性列对齐 -->
                <div class="flex flex-col gap-1" style="padding-left: 168px">
                  <div
                    v-for="(el, eIdx) in row.elements"
                    :key="eIdx"
                    class="flex gap-2 items-center"
                  >
                    <el-select
                      v-model="el.elementId"
                      placeholder="请选择配件"
                      style="width: 200px; flex-shrink: 0"
                    >
                      <el-option
                        v-for="e in getAvailableElements(scope.row.id, index, eIdx)"
                        :key="e.id"
                        :label="e.name"
                        :value="e.id"
                      />
                    </el-select>
                    <!-- 双击打开产品选择弹窗；显示产品名称及规格 -->
                    <div class="flex items-center gap-1" style="width: 280px; flex-shrink: 0">
                      <el-input
                        :model-value="getProductDisplay(el.productId)"
                        readonly
                        placeholder="双击选择产品"
                        @dblclick="openProductDialog(scope.row.id, index, eIdx)"
                        style="cursor: pointer; flex: 1"
                      />
                      <el-button
                        v-if="el.productId"
                        :icon="Close"
                        circle
                        plain
                        size="small"
                        title="清除产品"
                        @click="el.productId = undefined"
                      />
                    </div>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      plain
                      size="small"
                      @click="removeRowElement(scope.row.id, index, eIdx)"
                    />
                  </div>
                  <div>
                    <el-button
                      type="primary"
                      plain
                      size="small"
                      :icon="Plus"
                      @click="addRowElement(scope.row.id, index)"
                    >
                      添加配件
                    </el-button>
                  </div>
                </div>
              </div>
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
      <el-table-column label="序号" align="center" type="index" width="60" />
      <el-table-column label="款式名称" align="center" prop="name" />
      <el-table-column label="褶倍" align="center" prop="pleatRatioValue" />
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
            结构/组件配置
          </el-button>
<!--          <el-button-->
<!--            link-->
<!--            type="danger"-->
<!--            @click="handleDelete(scope.row.id)"-->
<!--            v-hasPermi="['zc:curtain:delete']"-->
<!--          >-->
<!--            删除-->
<!--          </el-button>-->
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

  <!-- 产品选择弹窗：双击产品输入框触发，支持版本/名称筛选+分页，单击行即选中 -->
  <el-dialog
    v-model="productDialogVisible"
    title="选择产品"
    width="900px"
    append-to-body
    destroy-on-close
    align-center
  >
    <!-- 筛选条件 -->
    <el-form :inline="true" class="mb-8px">
      <el-form-item label="名称">
        <el-input
          v-model="productDialogQuery.name"
          placeholder="请输入产品名称"
          clearable
          style="width: 200px"
          @keyup.enter="searchProductDialog"
        />
      </el-form-item>
      <el-form-item label="版本">
        <el-select
          v-model="productDialogQuery.versionId"
          placeholder="请选择版本"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="v in productVersionList"
            :key="v.id"
            :label="v.name"
            :value="v.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchProductDialog">
          <Icon icon="ep:search" class="mr-4px" /> 搜索
        </el-button>
        <el-button @click="resetProductDialog">
          <Icon icon="ep:refresh" class="mr-4px" /> 重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 产品列表：单击行选中 -->
    <el-table
      v-loading="productDialogLoading"
      :data="productDialogList"
      height="260"
      highlight-current-row
      @row-click="onProductSelect"
      style="cursor: pointer"
    >
      <el-table-column label="产品名称" prop="name" min-width="180" show-overflow-tooltip />
      <el-table-column label="版本" prop="versionName" width="130" show-overflow-tooltip />
      <el-table-column label="规格" prop="specValue" min-width="150" show-overflow-tooltip />
      <el-table-column label="进货价" prop="inboundPrice" width="100" align="right" />
      <el-table-column label="一级销售价" prop="onePrice" width="110" align="right" />
      <el-table-column label="供应商" prop="supplierName" width="130" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="productDialogTotal"
      v-model:page="productDialogQuery.pageNo"
      v-model:limit="productDialogQuery.pageSize"
      @pagination="loadProductDialogPage"
      class="mt-8px"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { Delete, Plus, Close } from '@element-plus/icons-vue'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CurtainApi, Curtain, CurtainTemplate } from '@/api/zc/curtain'
import { CurtainStructureApi, CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import { CurtainStructureElementApi, CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'
import { ProductApi, ProductSimpleVO, ProductPageVO } from '@/api/zc/product'
import { ProductVersionApi, ProductVersionSimpleVO } from '@/api/zc/productversion'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
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

/** 结构/配件/产品下拉数据 */
const structureList = ref<CurtainStructureSimpleVO[]>([])
const elementList = ref<CurtainStructureElementSimpleVO[]>([])
/** simple-list 仅用于 getProductDisplay 回显，不用于弹窗列表 */
const productList = ref<ProductSimpleVO[]>([])
const productVersionList = ref<ProductVersionSimpleVO[]>([])

/** 单个配件行：一个配件 + 可选的产品 */
interface ElementRow {
  elementId: number | undefined
  productId: number | undefined
}

/** 单个结构行：一个结构 + 多个配件项 */
interface StructureRow {
  structureId: number | undefined
  elements: ElementRow[]
}

/** 每行的结构配置，key 为 curtainId */
const rowStructures = reactive<Record<number, StructureRow[]>>({})
/** 已加载过模板的 curtainId 集合，防止重复请求 */
const loadedCurtainIds = new Set<number>()

const getRowStructures = (curtainId: number): StructureRow[] => {
  if (!rowStructures[curtainId]) rowStructures[curtainId] = []
  return rowStructures[curtainId]
}

/** 同一窗帘下结构不能重复，过滤掉已被其他行选中的结构 */
const getAvailableStructures = (curtainId: number, index: number) => {
  const usedIds = new Set(
    (rowStructures[curtainId] || [])
      .filter((_, i) => i !== index)
      .map((r) => r.structureId)
      .filter((id) => id !== undefined)
  )
  return structureList.value.filter((s) => !usedIds.has(s.id))
}

/** 切换结构时清空已选配件，避免上次配置的配件残留到新结构上 */
const onRowStructureChange = (curtainId: number, index: number) => {
  rowStructures[curtainId][index].elements = []
}

const getSelectedStructureAttributes = (structureId: number | undefined): string[] => {
  if (!structureId) return []
  return structureList.value.find((s) => s.id === structureId)?.attributes || []
}

const addRowStructure = (curtainId: number) => {
  getRowStructures(curtainId).push({ structureId: undefined, elements: [] })
}

const removeRowStructure = (curtainId: number, index: number) => {
  rowStructures[curtainId].splice(index, 1)
}

/** 同一结构内同一配件不可重复选择，过滤掉已被其他配件行选中的配件 */
const getAvailableElements = (curtainId: number, structureIdx: number, elementIdx: number) => {
  const elements = rowStructures[curtainId]?.[structureIdx]?.elements || []
  const usedIds = new Set(
    elements
      .filter((_, i) => i !== elementIdx)
      .map((e) => e.elementId)
      .filter((id) => id !== undefined)
  )
  return elementList.value.filter((e) => !usedIds.has(e.id))
}

/** 新增配件行（默认空） */
const addRowElement = (curtainId: number, structureIdx: number) => {
  const row = rowStructures[curtainId]?.[structureIdx]
  if (!row) return
  row.elements.push({ elementId: undefined, productId: undefined })
}

/** 删除配件行 */
const removeRowElement = (curtainId: number, structureIdx: number, elementIdx: number) => {
  rowStructures[curtainId]?.[structureIdx]?.elements.splice(elementIdx, 1)
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
  // 配件行中若已添加但未选择配件，提示用户补全（productId 允许为空）
  if (structures.some((r) => r.elements.some((e) => e.elementId === undefined))) {
    message.warning('配件不能为空')
    return
  }
  // 组装为后端要求的 { structureId, elements: [{ elementId, productId }] } 格式
  const payload: CurtainTemplate = {
    curtainId,
    structures: structures.map((s) => ({
      structureId: s.structureId as number,
      elements: s.elements.map((e) => ({
        elementId: e.elementId as number,
        productId: e.productId ?? null
      }))
    }))
  }
  await CurtainApi.createCurtainTemplate(payload)
  message.success('配置成功')
}

/** 加载指定 curtainId 的模板配置，返回是否成功 */
const loadTemplate = async (curtainId: number): Promise<boolean> => {
  if (loadedCurtainIds.has(curtainId)) return true
  loadedCurtainIds.add(curtainId)
  const loader = ElLoading.service({ target: tableRef.value?.$el, text: '配置加载中...' })
  try {
    const data = await CurtainApi.getCurtainTemplateByCurtainId(curtainId)
    rowStructures[curtainId] = data?.structures?.length
      ? data.structures.map((s) => ({
          structureId: s.structureId,
          elements:
            s.elements?.map((e) => ({
              elementId: e.elementId,
              productId: e.productId ?? undefined
            })) ?? []
        }))
      : []
    return true
  } catch {
    loadedCurtainIds.delete(curtainId)
    rowStructures[curtainId] = []
    message.error('配置加载失败，请重试')
    return false
  } finally {
    loader.close()
  }
}

/** 左侧展开图标点击：先收起，加载成功后再展开 */
const onExpandChange = async (row: Curtain, expandedRows: Curtain[]) => {
  const isExpanding = expandedRows.some((r) => r.id === row.id)
  if (!isExpanding || loadedCurtainIds.has(row.id!)) return
  tableRef.value?.toggleRowExpansion(row, false)
  const ok = await loadTemplate(row.id!)
  if (ok) tableRef.value?.toggleRowExpansion(row, true)
}

/** 操作列"结构/组件配置"按钮：加载成功后展开 */
const toggleExpand = async (row: Curtain) => {
  if (loadedCurtainIds.has(row.id!)) {
    tableRef.value?.toggleRowExpansion(row)
    return
  }
  const ok = await loadTemplate(row.id!)
  if (ok) tableRef.value?.toggleRowExpansion(row, true)
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

// ======================== 产品选择弹窗 ========================
const productDialogVisible = ref(false)
const productDialogLoading = ref(false)
const productDialogList = ref<ProductPageVO[]>([])
const productDialogTotal = ref(0)
const productDialogQuery = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  versionId: undefined as number | undefined
})
/** 当前正在编辑的配件位置，用于弹窗选中后回写 */
const productDialogTarget = ref<{
  curtainId: number
  structureIdx: number
  elementIdx: number
} | null>(null)

/** 加载弹窗内分页产品列表 */
const loadProductDialogPage = async () => {
  productDialogLoading.value = true
  try {
    const data = await ProductApi.getProductPage(productDialogQuery)
    productDialogList.value = data.list
    productDialogTotal.value = data.total
  } finally {
    productDialogLoading.value = false
  }
}

const searchProductDialog = () => {
  productDialogQuery.pageNo = 1
  loadProductDialogPage()
}

const resetProductDialog = () => {
  productDialogQuery.name = ''
  productDialogQuery.versionId = undefined
  productDialogQuery.pageNo = 1
  loadProductDialogPage()
}

/** 输入框回显文本：产品名 + 规格（若有），数据来自 simple-list */
const getProductDisplay = (productId: number | undefined): string => {
  if (!productId) return ''
  const p = productList.value.find((item) => item.id === productId)
  if (!p) return ''
  return p.specValue ? `${p.name}  [${p.specValue}]` : p.name
}

/** 打开产品选择弹窗，重置查询并请求第一页 */
const openProductDialog = (curtainId: number, structureIdx: number, elementIdx: number) => {
  productDialogTarget.value = { curtainId, structureIdx, elementIdx }
  productDialogQuery.pageNo = 1
  productDialogQuery.name = ''
  productDialogQuery.versionId = undefined
  productDialogVisible.value = true
  loadProductDialogPage()
}

/** 点击产品行：写入 productId 并关闭弹窗 */
const onProductSelect = (product: ProductPageVO) => {
  if (!productDialogTarget.value) return
  const { curtainId, structureIdx, elementIdx } = productDialogTarget.value
  rowStructures[curtainId][structureIdx].elements[elementIdx].productId = product.id
  productDialogVisible.value = false
}

/** 初始化：并行加载结构、配件、产品简表（用于回显）、版本（用于弹窗筛选） **/
onMounted(async () => {
  ;[structureList.value, elementList.value, productList.value, productVersionList.value] =
    await Promise.all([
      CurtainStructureApi.getCurtainStructureSimpleList(),
      CurtainStructureElementApi.getCurtainStructureElementSimpleList(),
      ProductApi.getProductSimpleList(),
      ProductVersionApi.getProductVersionSimpleList()
    ])
  getList()
})
</script>
