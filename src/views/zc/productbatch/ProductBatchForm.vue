<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="批号" prop="batchNo">
        <el-input v-model="formData.batchNo" placeholder="请输入批号" />
      </el-form-item>
      <el-form-item label="入库日期" prop="inboundDate">
        <el-date-picker
          v-model="formData.inboundDate"
          type="date"
          value-format="x"
          placeholder="选择入库日期"
        />
      </el-form-item>
      <el-form-item label="产品" prop="productId">
        <el-input v-model="formData.productId" placeholder="请输入产品" />
      </el-form-item>
      <el-form-item label="进货价" prop="inboundPrice">
        <el-input v-model="formData.inboundPrice" placeholder="请输入进货价" />
      </el-form-item>
      <el-form-item label="入库数量" prop="inboundQuantity">
        <el-input v-model="formData.inboundQuantity" placeholder="请输入入库数量" />
      </el-form-item>
      <el-form-item label="剩余数量" prop="quantity">
        <el-input v-model="formData.quantity" placeholder="请输入剩余数量" />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseId">
        <el-input v-model="formData.warehouseId" placeholder="请输入仓库" />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-input v-model="formData.supplierId" placeholder="请输入供应商" />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="formData.note" placeholder="请输入备注" />
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

/** 产品批次 表单 */
defineOptions({ name: 'ProductBatchForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  batchNo: undefined,
  inboundDate: undefined,
  productId: undefined,
  inboundPrice: undefined,
  inboundQuantity: undefined,
  quantity: undefined,
  warehouseId: undefined,
  supplierId: undefined,
  note: undefined
})
const formRules = reactive({
  batchNo: [{ required: true, message: '批号不能为空', trigger: 'blur' }],
  inboundDate: [{ required: true, message: '入库日期不能为空', trigger: 'blur' }],
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  inboundQuantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }],
  quantity: [{ required: true, message: '剩余数量不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProductBatchApi.getProductBatch(id)
    } finally {
      formLoading.value = false
    }
  }
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
    if (formType.value === 'create') {
      await ProductBatchApi.createProductBatch(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductBatchApi.updateProductBatch(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    batchNo: undefined,
    inboundDate: undefined,
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