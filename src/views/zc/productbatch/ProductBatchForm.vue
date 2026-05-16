<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="入库日期" prop="inboundDate">
        <el-date-picker
          v-model="formData.inboundDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择入库日期"
        />
      </el-form-item>
      <el-form-item label="产品" prop="productId">
        <el-select v-model="formData.productId" clearable placeholder="请选择产品" class="w-1/1">
          <el-option
            v-for="item in props.productList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="进货价" prop="inboundPrice">
        <el-input-number v-model="formData.inboundPrice" :precision="2" :min="0" placeholder="请输入进货价" controls-position="right" />
      </el-form-item>
      <el-form-item label="入库数量" prop="inboundQuantity">
        <el-input-number v-model="formData.inboundQuantity" :precision="2" :min="0" placeholder="请输入入库数量" controls-position="right" @change="onInboundQuantityChange" />
      </el-form-item>
      <el-form-item label="剩余数量" prop="quantity">
        <el-input-number v-model="formData.quantity" :precision="2" :min="0" placeholder="请输入剩余数量" controls-position="right" disabled />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseId">
        <el-select v-model="formData.warehouseId" clearable placeholder="请选择仓库" class="w-1/1">
          <el-option
            v-for="item in props.warehouseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-select v-model="formData.supplierId" clearable placeholder="请选择供应商" class="w-1/1">
          <el-option
            v-for="item in props.supplierList"
            :key="item.id"
            :label="item.shortName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="formData.note" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ProductBatchApi, ProductBatch } from '@/api/zc/productbatch'
import { ProductSimpleVO } from '@/api/zc/product'
import { WarehouseSimpleVO } from '@/api/zc/warehouse'
import { SupplierSimpleVO } from '@/api/zc/supplier'

/** 产品批次 表单 */
defineOptions({ name: 'ProductBatchForm' })

const props = defineProps<{
  productList: ProductSimpleVO[]
  warehouseList: WarehouseSimpleVO[]
  supplierList: SupplierSimpleVO[]
}>()

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('新增产品批次') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formData = ref({
  inboundDate: new Date().toISOString().slice(0, 10),
  productId: undefined,
  inboundPrice: undefined,
  inboundQuantity: undefined,
  quantity: undefined,
  warehouseId: undefined,
  supplierId: undefined,
  note: undefined
})
const formRules = reactive({
  inboundDate: [{ required: true, message: '入库日期不能为空', trigger: 'blur' }],
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  inboundQuantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }]
})

/** 入库数量变化时同步剩余数量 */
const onInboundQuantityChange = (val: number | undefined) => {
  formData.value.quantity = val as any
}
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProductBatch
    await ProductBatchApi.createProductBatch(data)
    message.success(t('common.createSuccess'))
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    inboundDate: new Date().toISOString().slice(0, 10),
    productId: undefined,
    inboundPrice: undefined,
    inboundQuantity: undefined,
    quantity: undefined,
    warehouseId: undefined,
    supplierId: undefined,
    note: undefined
  }
  formRef.value?.resetFields()
}
</script>
