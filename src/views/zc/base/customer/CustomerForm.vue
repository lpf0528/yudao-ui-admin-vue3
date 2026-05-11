<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="720px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="简称" prop="shortName">
            <el-input v-model="formData.shortName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="全称" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactName">
            <el-input v-model="formData.contactName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="formData.mobile" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="收货地址" prop="deliveryAddress">
            <el-input v-model="formData.deliveryAddress" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="formLoading">确 定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ZcCustomerApi, ZcCustomerVO } from '@/api/zc/base/customer'

defineOptions({ name: 'ZcCustomerForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()

const formData = ref<ZcCustomerVO>({})

const formRules = reactive({
  name: [{ required: true, message: '全称不能为空', trigger: 'blur' }]
})

const reset = () => {
  formData.value = {}
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  formType.value = type
  reset()
  dialogTitle.value = type === 'create' ? '新增客户' : '编辑客户'
  if (type === 'update' && id) {
    formLoading.value = true
    try {
      formData.value = await ZcCustomerApi.get(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submit = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await ZcCustomerApi.create(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await ZcCustomerApi.update(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
