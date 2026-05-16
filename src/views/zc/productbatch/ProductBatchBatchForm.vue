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
              v-for="item in props.productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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
  productId: number | undefined
  inboundPrice: number | undefined
  inboundQuantity: number | undefined
  quantity: number | undefined
  note: string | undefined
}

const createEmptyRow = (): BatchRow => ({
  productId: undefined,
  inboundPrice: undefined,
  inboundQuantity: undefined,
  quantity: undefined,
  note: undefined
})

const rows = ref<BatchRow[]>([createEmptyRow()])

const addRow = () => rows.value.push(createEmptyRow())

const removeRow = (index: number) => {
  if (rows.value.length === 1) return
  rows.value.splice(index, 1)
}

const onProductChange = (id: number | undefined, index: number) => {
  const product = props.productList.find((item) => item.id === id)
  rows.value[index].inboundPrice = product?.inboundPrice ?? undefined
}

const onInboundQuantityChange = (val: number | undefined, index: number) => {
  rows.value[index].quantity = val
}

const open = () => {
  dialogVisible.value = true
  headerForm.value = {
    inboundDate: new Date().toISOString().slice(0, 10),
    warehouseId: undefined,
    supplierId: undefined
  }
  rows.value = [createEmptyRow()]
  headerFormRef.value?.resetFields()
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  await headerFormRef.value.validate()
  const invalidRow = rows.value.find((r) => !r.productId || r.inboundQuantity == null)
  if (invalidRow) {
    message.warning('请完整填写每行的产品和入库数量')
    return
  }
  formLoading.value = true
  try {
    const payloadList = rows.value.map((row) => ({
      inboundDate: headerForm.value.inboundDate,
      warehouseId: headerForm.value.warehouseId!,
      supplierId: headerForm.value.supplierId!,
      productId: row.productId,
      inboundPrice: row.inboundPrice ?? 0,
      inboundQuantity: row.inboundQuantity,
      quantity: row.quantity ?? row.inboundQuantity,
      note: row.note ?? ''
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
