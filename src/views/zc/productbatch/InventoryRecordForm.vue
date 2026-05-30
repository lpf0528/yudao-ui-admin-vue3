<!--
  库存盘点弹窗
  功能：对指定批次进行库存盘点，填写盘点后数量并提交盘点记录
  使用方：views/zc/productbatch/index.vue
-->
<template>
  <Dialog title="库存盘点" v-model="dialogVisible" width="480px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <!-- 只读展示：产品名称 -->
      <el-form-item label="产品">
        <el-input :value="productName" disabled />
      </el-form-item>
      <!-- 只读展示：批号 -->
      <el-form-item label="批号">
        <el-input :value="batchNo" disabled />
      </el-form-item>
      <!-- 只读展示：当前库存（当前剩余数量） -->
      <el-form-item label="当前库存">
        <el-input-number :model-value="formData.oldQuantity" disabled style="width: 100%" :controls="false" />
      </el-form-item>
      <!-- 盘点数量：必填，不能小于 0 -->
      <el-form-item label="盘点数量" prop="newQuantity">
        <el-input-number
          v-model="formData.newQuantity"
          :min="0"
          :precision="2"
          :controls="false"
          placeholder="请输入盘点数量"
          style="width: 100%"
        />
      </el-form-item>
      <!-- 只读展示：盈亏数量 = 盘点前 - 盘点后，正数盈余，负数亏损 -->
      <el-form-item label="盈亏数量">
        <el-input-number
          :model-value="profitLossQuantity"
          disabled
          style="width: 100%"
          :controls="false"
          :class="profitLossQuantity > 0 ? 'profit' : profitLossQuantity < 0 ? 'loss' : ''"
        />
      </el-form-item>
      <!-- 备注：选填 -->
      <el-form-item label="备注" prop="note">
        <el-input v-model="formData.note" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { InventoryRecordApi } from '@/api/zc/inventoryrecord'

defineOptions({ name: 'InventoryRecordForm' })

const emit = defineEmits(['success'])
const message = useMessage()

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
const formLoading = ref(false)

/** 只读展示字段，从父组件传入的批次行数据中解析 */
const productName = ref('')
const batchNo = ref('')

// ======================== 表单数据 ========================
const formData = reactive({
  productId: undefined as number | undefined,
  batchId: undefined as number | undefined,
  oldQuantity: undefined as number | undefined,
  newQuantity: undefined as number | undefined,
  note: '',
})

const formRules = {
  newQuantity: [
    { required: true, message: '盘点数量不能为空', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value !== undefined && value !== null && value < 0) {
          callback(new Error('盘点数量不能小于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

/** 盈亏数量：盘点数量 - 当前库存，盘点数量未填时显示 0 */
const profitLossQuantity = computed(() => {
  const old = formData.oldQuantity ?? 0
  const next = formData.newQuantity
  if (next === undefined || next === null) return 0
  return Number((next - old).toFixed(2))
})

const formRef = ref()

/**
 * 打开弹窗
 * @param row 产品批次行数据
 */
const open = (row: any) => {
  productName.value = row.productName ?? ''
  batchNo.value = row.batchNo ?? ''
  formData.productId = row.productId
  formData.batchId = row.id
  formData.oldQuantity = row.quantity
  formData.newQuantity = undefined
  formData.note = ''
  formRef.value?.clearValidate()
  dialogVisible.value = true
}
defineExpose({ open })

// ======================== 提交 ========================
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    await InventoryRecordApi.createInventoryRecord({
      productId: formData.productId,
      batchId: formData.batchId,
      oldQuantity: formData.oldQuantity,
      newQuantity: formData.newQuantity,
      note: formData.note,
    } as any)
    message.success('盘点记录提交成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>

<style>
/* 盈余：绿色 */
.profit .el-input-number__input,
.profit input { color: #67c23a !important; font-weight: 600; }
/* 亏损：红色 */
.loss .el-input-number__input,
.loss input { color: #f56c6c !important; font-weight: 600; }
</style>
