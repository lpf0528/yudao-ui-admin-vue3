<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="货号" prop="productId">
        <el-input v-model="formData.productId" placeholder="请输入货号" />
      </el-form-item>
      <el-form-item label="批次" prop="batchId">
        <el-input v-model="formData.batchId" placeholder="请输入批次" />
      </el-form-item>
      <el-form-item label="盘点前数量" prop="oldQuantity">
        <el-input v-model="formData.oldQuantity" placeholder="请输入盘点前数量" />
      </el-form-item>
      <el-form-item label="盘点后数量" prop="newQuantity">
        <el-input v-model="formData.newQuantity" placeholder="请输入盘点后数量" />
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
import { InventoryRecordApi, InventoryRecord } from '@/api/zc/inventoryrecord'

/** 盘点记录 表单 */
defineOptions({ name: 'InventoryRecordForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  productId: undefined,
  batchId: undefined,
  oldQuantity: undefined,
  newQuantity: undefined,
  note: undefined
})
const formRules = reactive({
  productId: [{ required: true, message: '货号不能为空', trigger: 'blur' }],
  batchId: [{ required: true, message: '批次不能为空', trigger: 'blur' }],
  oldQuantity: [{ required: true, message: '盘点前数量不能为空', trigger: 'blur' }],
  newQuantity: [{ required: true, message: '盘点后数量不能为空', trigger: 'blur' }]
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
      formData.value = await InventoryRecordApi.getInventoryRecord(id)
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
    const data = formData.value as unknown as InventoryRecord
    if (formType.value === 'create') {
      await InventoryRecordApi.createInventoryRecord(data)
      message.success(t('common.createSuccess'))
    } else {
      await InventoryRecordApi.updateInventoryRecord(data)
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
    productId: undefined,
    batchId: undefined,
    oldQuantity: undefined,
    newQuantity: undefined,
    note: undefined
  }
  formRef.value?.resetFields()
}
</script>