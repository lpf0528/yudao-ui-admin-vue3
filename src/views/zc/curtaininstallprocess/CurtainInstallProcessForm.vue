<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="工艺名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入工艺名称" />
      </el-form-item>
      <el-form-item label="关联工序" prop="nodeIds">
        <el-checkbox-group v-model="formData.nodeIds">
          <el-checkbox
            v-for="node in processNodeList"
            :key="node.id"
            :label="node.id"
          >
            <span class="inline-block w-[8em]">{{ node.name }}</span>
          </el-checkbox>
        </el-checkbox-group>
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
import { CurtainInstallProcessApi, CurtainInstallProcess } from '@/api/zc/curtaininstallprocess'
import { ProcessNodeApi, ProcessNodeSimpleVO } from '@/api/zc/processnode'

/** 安装工艺 表单 */
defineOptions({ name: 'CurtainInstallProcessForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  note: undefined,
  nodeIds: [] as number[]  // 关联工序节点 ID 列表
})
const formRules = reactive({
  name: [{ required: true, message: '工艺名称不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 工序节点精简列表，用于多选下拉 */
const processNodeList = ref<ProcessNodeSimpleVO[]>([])

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载工序节点选项
  if (!processNodeList.value.length) {
    processNodeList.value = await ProcessNodeApi.getSimpleProcessNodeList()
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CurtainInstallProcessApi.getCurtainInstallProcess(id)
      formData.value = { ...data, nodeIds: Array.isArray(data.nodeIds) ? data.nodeIds : [] }
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
    const data = formData.value as unknown as CurtainInstallProcess
    if (formType.value === 'create') {
      await CurtainInstallProcessApi.createCurtainInstallProcess(data)
      message.success(t('common.createSuccess'))
    } else {
      await CurtainInstallProcessApi.updateCurtainInstallProcess(data)
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
    note: undefined,
    nodeIds: []
  }
  formRef.value?.resetFields()
}
</script>