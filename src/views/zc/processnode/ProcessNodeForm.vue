<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="工序名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入工序名称" />
      </el-form-item>
      <el-form-item label="工序描述/操作说明" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入工序描述/操作说明" />
      </el-form-item>
      <el-form-item label="关联组件" prop="elementIds">
        <el-select
          v-model="formData.elementIds"
          multiple
          clearable
          placeholder="请选择关联组件"
          class="w-1/1"
        >
          <el-option
            v-for="item in elementList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
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
import { ProcessNodeApi, ProcessNode } from '@/api/zc/processnode'
import { CurtainStructureElementApi, CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'

/** 工序节点配置 表单 */
defineOptions({ name: 'ProcessNodeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  description: undefined,
  elementIds: [],
})
const formRules = reactive({
  name: [{ required: true, message: '工序名称不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const elementList = ref<CurtainStructureElementSimpleVO[]>([]) // 窗帘结构组件精简列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 获取关联组件下拉选项
  elementList.value = await CurtainStructureElementApi.getCurtainStructureElementSimpleList()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProcessNodeApi.getProcessNode(id)
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
  // 提交请求fix
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProcessNode
    if (formType.value === 'create') {
      await ProcessNodeApi.createProcessNode(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProcessNodeApi.updateProcessNode(data)
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
    name: undefined,
    description: undefined,
    elementIds: [],
  }
  formRef.value?.resetFields()
}
</script>
