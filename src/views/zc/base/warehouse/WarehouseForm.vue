<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="仓库名称" />
      </el-form-item>
      <el-form-item label="负责人" prop="managerId">
        <el-input-number v-model="formData.managerId" :min="0" class="!w-1/1" controls-position="right" />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="formData.note" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="formLoading">确 定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ZcWarehouseApi, ZcWarehouseVO } from '@/api/zc/base/warehouse'

defineOptions({ name: 'ZcWarehouseForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()

const formData = ref<ZcWarehouseVO>({
  id: undefined,
  name: '',
  managerId: undefined,
  note: ''
})

const formRules = reactive({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
})

const reset = () => {
  formData.value = { id: undefined, name: '', managerId: undefined, note: '' }
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  formType.value = type
  reset()
  dialogTitle.value = type === 'create' ? '新增仓库' : '编辑仓库'
  if (type === 'update' && id) {
    formLoading.value = true
    try {
      formData.value = await ZcWarehouseApi.get(id)
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
      await ZcWarehouseApi.create(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await ZcWarehouseApi.update(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
