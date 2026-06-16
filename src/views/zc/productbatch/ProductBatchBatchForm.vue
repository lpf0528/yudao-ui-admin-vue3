<template>
  <Dialog title="批量新增批次" v-model="dialogVisible" width="1000px">
    <!-- 公共信息头 -->
    <el-card shadow="never" class="mb-16px">
      <el-form
        ref="headerFormRef"
        :model="headerForm"
        :rules="headerRules"
        label-width="80px"
        v-loading="formLoading"
        inline
      >
        <el-form-item label="入库日期" prop="inboundDate">
          <el-date-picker
            v-model="headerForm.inboundDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择入库日期"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="headerForm.warehouseId" clearable placeholder="请选择仓库" style="width: 160px">
            <el-option
              v-for="item in props.warehouseList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="headerForm.supplierId" clearable placeholder="请选择供应商" style="width: 180px">
            <el-option
              v-for="item in props.supplierList"
              :key="item.id"
              :label="item.shortName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品明细表格 -->
    <el-table :data="rows" border stripe>
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="产品版本" min-width="180">
        <template #default="{ $index }">
          <el-select
            v-model="rows[$index].versionId"
            clearable
            filterable
            placeholder="请选择产品版本"
            style="width: 100%"
            @change="(val) => onVersionChange(val, $index)"
          >
            <el-option
              v-for="item in versionList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="产品" min-width="180">
        <template #default="{ $index }">
          <el-select
            v-model="rows[$index].productId"
            clearable
            filterable
            placeholder="请选择产品"
            style="width: 100%"
            @change="(val) => onProductChange(val, $index)"
          >
            <el-option
              v-for="item in getFilteredProducts($index)"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="规格" width="150">
        <template #default="{ $index }">
          <el-select
            v-model="rows[$index].spec"
            :disabled="!getRowSpecs($index).length"
            placeholder="请选择规格"
            style="width: 100%"
            @change="(val) => onSpecChange(val, $index)"
          >
            <el-option
              v-for="spec in getRowSpecs($index)"
              :key="spec.spec"
              :label="spec.spec"
              :value="spec.spec"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="进货价" width="130">
        <template #default="{ $index }">
          <el-input-number
            v-model="rows[$index].inboundPrice"
            :precision="2"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </template>
      </el-table-column>
      <el-table-column label="入库数量" width="130">
        <template #default="{ $index }">
          <el-input-number
            v-model="rows[$index].inboundQuantity"
            :precision="2"
            :min="0"
            controls-position="right"
            style="width: 100%"
            @change="(val) => onInboundQuantityChange(val, $index)"
          />
        </template>
      </el-table-column>
      <el-table-column label="剩余数量" width="130">
        <template #default="{ $index }">
          <el-input-number
            v-model="rows[$index].quantity"
            :precision="2"
            :min="0"
            controls-position="right"
            style="width: 100%"
            disabled
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="140">
        <template #default="{ $index }">
          <el-input v-model="rows[$index].note" placeholder="备注" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center" fixed="right">
        <template #default="{ $index }">
          <el-button type="danger" link @click="removeRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button class="mt-10px w-full" @click="addRow">
      <Icon icon="ep:plus" class="mr-5px" /> 添加一行
    </el-button>

    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { ProductSimpleVO } from '@/api/zc/product'
import { WarehouseSimpleVO } from '@/api/zc/warehouse'
import { SupplierSimpleVO } from '@/api/zc/supplier'
import {
  ProductVersionApi,
  ProductVersionSimpleVO,
  ProductVersionSpecSimpleVO
} from '@/api/zc/productversion'

defineOptions({ name: 'ProductBatchBatchForm' })

const props = defineProps<{
  productList: ProductSimpleVO[]
  warehouseList: WarehouseSimpleVO[]
  supplierList: SupplierSimpleVO[]
}>()

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const headerFormRef = ref()

/** 产品版本精简列表，用于行内版本下拉 */
const versionList = ref<ProductVersionSimpleVO[]>([])

const headerForm = ref({
  inboundDate: new Date().toISOString().slice(0, 10),
  warehouseId: undefined as number | undefined,
  supplierId: undefined as number | undefined
})

const headerRules = {
  inboundDate: [{ required: true, message: '入库日期不能为空', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'change' }],
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }]
}

interface BatchRow {
  versionId: number | undefined  // 产品版本ID
  productId: number | undefined
  inboundPrice: number | undefined
  inboundQuantity: number | undefined
  quantity: number | undefined
  note: string | undefined
  spec: string | undefined
}

const createEmptyRow = (): BatchRow => ({
  versionId: undefined,
  productId: undefined,
  inboundPrice: undefined,
  inboundQuantity: undefined,
  quantity: undefined,
  note: undefined,
  spec: undefined
})

const rows = ref<BatchRow[]>([createEmptyRow()])

const addRow = () => rows.value.push(createEmptyRow())

const removeRow = (index: number) => {
  if (rows.value.length === 1) return
  rows.value.splice(index, 1)
}

/**
 * 获取某行对应的规格列表
 * 优先从已选版本的 specConfs 中取；若无版本则从产品列表中取
 */
const getRowSpecs = (index: number): ProductVersionSpecSimpleVO[] => {
  const row = rows.value[index]
  if (row.versionId) {
    const version = versionList.value.find((v) => v.id === row.versionId)
    return version?.specConfs ?? []
  }
  // 兼容未选版本时从产品列表取规格（保持原有逻辑）
  if (row.productId) {
    const product = props.productList.find((p) => p.id === row.productId)
    return (product?.specs ?? []).map((s) => ({ id: 0, versionId: 0, spec: s }))
  }
  return []
}

/**
 * 按当前行已选版本过滤产品列表
 * 未选版本时展示全部产品
 */
const getFilteredProducts = (index: number) => {
  const versionId = rows.value[index].versionId
  if (!versionId) return props.productList
  return props.productList.filter((p) => p.versionId === versionId)
}

/** 版本切换：清空已选产品、规格和价格，若仅有一个规格则自动选中 */
const onVersionChange = (id: number | undefined, index: number) => {
  const version = versionList.value.find((v) => v.id === id)
  const specs = version?.specConfs ?? []
  // 版本变化时重置产品选择，避免产品与版本不匹配
  rows.value[index].productId = undefined
  rows.value[index].spec = specs.length === 1 ? specs[0].spec : undefined
  rows.value[index].inboundPrice = specs.length === 1 ? (specs[0].inboundPrice ?? undefined) : undefined
}

/** 规格切换：自动填入对应进货价 */
const onSpecChange = (specValue: string | undefined, index: number) => {
  const row = rows.value[index]
  if (!specValue || !row.versionId) return
  const version = versionList.value.find((v) => v.id === row.versionId)
  const specConf = version?.specConfs?.find((s) => s.spec === specValue)
  if (specConf) {
    row.inboundPrice = specConf.inboundPrice ?? undefined
  }
}

const onProductChange = (id: number | undefined, index: number) => {
  const row = rows.value[index]
  const product = props.productList.find((item) => item.id === id)

  // 未选版本时，根据产品的 versionId 自动选中对应版本
  if (!row.versionId && product?.versionId) {
    row.versionId = product.versionId
  }

  // 版本确定后，从版本的 specConfs 中取规格；若仅一个则自动选中并填充进货价
  const version = versionList.value.find((v) => v.id === row.versionId)
  const specConfs = version?.specConfs ?? []
  if (specConfs.length === 1) {
    row.spec = specConfs[0].spec
    row.inboundPrice = specConfs[0].inboundPrice ?? undefined
  } else {
    row.spec = undefined
    row.inboundPrice = undefined
  }
}

const onInboundQuantityChange = (val: number | undefined, index: number) => {
  rows.value[index].quantity = val
}

const open = async () => {
  dialogVisible.value = true
  headerForm.value = {
    inboundDate: new Date().toISOString().slice(0, 10),
    warehouseId: undefined,
    supplierId: undefined
  }
  rows.value = [createEmptyRow()]
  headerFormRef.value?.resetFields()
  // 加载产品版本精简列表（供行内版本下拉使用）
  versionList.value = await ProductVersionApi.getProductVersionSimpleList()
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  await headerFormRef.value.validate()
  // 验证每行数据
  for (const [index, row] of rows.value.entries()) {
    if (!row.productId || row.inboundQuantity == null) {
      message.warning('请完整填写每行的产品和入库数量')
      return
    }
    // 如果当前行有可选规格，必须选择规格
    const specs = getRowSpecs(index)
    if (specs.length > 0 && !row.spec) {
      message.warning(`第${index + 1}行：请选择规格`)
      return
    }
  }
  formLoading.value = true
  try {
    const payloadList = rows.value.map((row) => ({
      inboundDate: headerForm.value.inboundDate,
      warehouseId: headerForm.value.warehouseId!,
      supplierId: headerForm.value.supplierId!,
      versionId: row.versionId,
      productId: row.productId,
      inboundPrice: row.inboundPrice ?? 0,
      inboundQuantity: row.inboundQuantity,
      quantity: row.quantity ?? row.inboundQuantity,
      note: row.note ?? '',
      spec: row.spec ?? ''
    })) as unknown as ProductBatch[]
    console.log('[批量新增批次] 提交报文:', JSON.stringify(payloadList, null, 2))
    await ProductBatchApi.createProductBatchList(payloadList)
    message.success(t('common.createSuccess'))
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
