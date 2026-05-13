<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="款式" prop="curtainId">
        <el-select v-model="formData.curtainId" placeholder="请选择款式">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="结构" prop="structureId">
        <el-select v-model="formData.structureId" placeholder="请选择结构">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="配件" prop="elementId">
        <el-select v-model="formData.elementId" placeholder="请选择配件">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="单位" prop="unitId">
        <el-select v-model="formData.unitId" placeholder="请选择单位">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { CurtainTemplateApi, CurtainTemplate } from '@/api/zc/curtaintemplate'

/** 窗帘模板 表单 */
defineOptions({ name: 'CurtainTemplateForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  curtainId: undefined,
  structureId: undefined,
  elementId: undefined,
  unitId: undefined
})
const formRules = reactive({
  curtainId: [{ required: true, message: '款式不能为空', trigger: 'change' }],
  structureId: [{ required: true, message: '结构不能为空', trigger: 'change' }],
  elementId: [{ required: true, message: '配件不能为空', trigger: 'change' }]
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
      formData.value = await CurtainTemplateApi.getCurtainTemplate(id)
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
    const data = formData.value as unknown as CurtainTemplate
    if (formType.value === 'create') {
      await CurtainTemplateApi.createCurtainTemplate(data)
      message.success(t('common.createSuccess'))
    } else {
      await CurtainTemplateApi.updateCurtainTemplate(data)
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
    curtainId: undefined,
    structureId: undefined,
    elementId: undefined,
    unitId: undefined
  }
  formRef.value?.resetFields()
}
</script>