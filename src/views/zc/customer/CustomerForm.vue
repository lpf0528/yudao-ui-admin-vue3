<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="简称" prop="shortName">
        <el-input v-model="formData.shortName" placeholder="请输入简称" />
      </el-form-item>
      <el-form-item label="全称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入全称" />
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input v-model="formData.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="固定地址" prop="address">
        <el-input v-model="formData.address" type="textarea" placeholder="请输入固定地址" />
      </el-form-item>
      <el-form-item label="送货地址" prop="deliveryAddress">
        <el-input v-model="formData.deliveryAddress" type="textarea" placeholder="请输入送货地址" />
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机" />
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile2">
        <el-input v-model="formData.mobile2" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="物流" prop="logisticId">
        <el-select v-model="formData.logisticId" placeholder="请选择物流">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联品牌" prop="brandId">
        <el-select v-model="formData.brandId" placeholder="请选择关联品牌">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="账户余额" prop="balance">
        <el-input v-model="formData.balance" placeholder="请输入账户余额" />
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
import { CustomerApi, Customer } from '@/api/zc/customer'

/** 客户资料 表单 */
defineOptions({ name: 'CustomerForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  shortName: undefined,
  name: undefined,
  contactName: undefined,
  address: undefined,
  deliveryAddress: undefined,
  mobile: undefined,
  mobile2: undefined,
  logisticId: undefined,
  brandId: undefined,
  balance: undefined,
  note: undefined,
})
const formRules = reactive({
  shortName: [{ required: true, message: '简称不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '全称不能为空', trigger: 'blur' }],
  contactName: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
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
      formData.value = await CustomerApi.getCustomer(id)
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
    const data = formData.value as unknown as Customer
    if (formType.value === 'create') {
      await CustomerApi.createCustomer(data)
      message.success(t('common.createSuccess'))
    } else {
      await CustomerApi.updateCustomer(data)
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
    shortName: undefined,
    name: undefined,
    contactName: undefined,
    address: undefined,
    deliveryAddress: undefined,
    mobile: undefined,
    mobile2: undefined,
    logisticId: undefined,
    brandId: undefined,
    balance: undefined,
    note: undefined,
  }
  formRef.value?.resetFields()
}
</script>