<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="单号" prop="billNo">
        <el-input v-model="formData.billNo" placeholder="请输入单号" />
      </el-form-item>
      <el-form-item label="付款时间" prop="billDate">
        <el-date-picker
          v-model="formData.billDate"
          type="date"
          value-format="x"
          placeholder="选择付款时间"
        />
      </el-form-item>
      <el-form-item label="财务人员" prop="billUserId">
        <el-input v-model="formData.billUserId" placeholder="请输入财务人员" />
      </el-form-item>
      <el-form-item label="客户" prop="customerId">
        <el-input v-model="formData.customerId" placeholder="请输入客户" />
      </el-form-item>
      <el-form-item label="优惠金额" prop="discountAmount">
        <el-input v-model="formData.discountAmount" placeholder="请输入优惠金额" />
      </el-form-item>
      <el-form-item label="实收金额 " prop="actualAmount">
        <el-input v-model="formData.actualAmount" placeholder="请输入实收金额 " />
      </el-form-item>
      <el-form-item label="收支方式" prop="billMethodId">
        <el-input v-model="formData.billMethodId" placeholder="请输入收支方式" />
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
import { BillsApi, Bills } from '@/api/zc/bills'

/** 收支账单 表单 */
defineOptions({ name: 'BillsForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  billNo: undefined,
  billDate: undefined,
  billUserId: undefined,
  customerId: undefined,
  discountAmount: undefined,
  actualAmount: undefined,
  billMethodId: undefined,
  note: undefined
})
const formRules = reactive({
  billNo: [{ required: true, message: '单号不能为空', trigger: 'blur' }],
  billDate: [{ required: true, message: '付款时间不能为空', trigger: 'blur' }],
  billUserId: [{ required: true, message: '财务人员不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
  actualAmount: [{ required: true, message: '实收金额 不能为空', trigger: 'blur' }],
  billMethodId: [{ required: true, message: '收支方式不能为空', trigger: 'blur' }]
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
      formData.value = await BillsApi.getBills(id)
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
    const data = formData.value as unknown as Bills
    if (formType.value === 'create') {
      await BillsApi.createBills(data)
      message.success(t('common.createSuccess'))
    } else {
      await BillsApi.updateBills(data)
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
    billNo: undefined,
    billDate: undefined,
    billUserId: undefined,
    customerId: undefined,
    discountAmount: undefined,
    actualAmount: undefined,
    billMethodId: undefined,
    note: undefined
  }
  formRef.value?.resetFields()
}
</script>