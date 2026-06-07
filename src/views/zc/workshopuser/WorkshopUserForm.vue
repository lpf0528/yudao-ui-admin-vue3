<!--
  车间员工 - 新增/编辑弹窗
  功能：提供车间员工信息的表单录入，支持新增和编辑两种模式，
        包含工序节点多选，与后端 /zc/process-node/simple-list 联动
  使用方：views/zc/workshopuser/index.vue
-->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 名称 -->
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <!-- 状态：0=禁用，1=启用 -->
      <el-form-item label="状态" prop="status">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <!-- 工序节点：复选框组，来源于 /zc/process-node/simple-list -->
      <el-form-item label="工序节点" prop="nodeIds">
        <el-checkbox-group v-model="formData.nodeIds">
          <el-checkbox
            v-for="node in processNodeList"
            :key="node.id"
            :label="node.id"
          >
            {{ node.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { WorkshopUserApi, WorkshopUser } from '@/api/zc/workshopuser'
import { ProcessNodeApi, ProcessNodeSimpleVO } from '@/api/zc/processnode'

/** 车间员工 表单 */
defineOptions({ name: 'WorkshopUserForm' })

const { t } = useI18n()
const message = useMessage()

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false) // 弹窗是否展示
const dialogTitle = ref('')      // 弹窗标题
const formLoading = ref(false)   // 数据加载 & 提交按钮禁用
const formType = ref('')         // create=新增；update=修改

// ======================== 工序节点下拉数据 ========================
/** 工序节点精简列表，用于多选下拉 */
const processNodeList = ref<ProcessNodeSimpleVO[]>([])

// ======================== 表单 ========================
const formRef = ref()
const formData = ref<{
  id?: number
  name?: string
  status: number
  nodeIds: number[]
}>({
  id: undefined,
  name: undefined,
  status: 1,    // 默认启用
  nodeIds: []
})

const formRules = reactive({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
})

// ======================== 打开弹窗 ========================
/**
 * 打开弹窗
 * @param type  操作类型：create=新增，update=编辑
 * @param id    记录 ID（编辑时传入）
 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  // 并行加载工序节点列表（仅首次加载，后续复用缓存）
  if (processNodeList.value.length === 0) {
    processNodeList.value = await ProcessNodeApi.getSimpleProcessNodeList({ group: 1 })
  }

  if (id) {
    formLoading.value = true
    try {
      const data = await WorkshopUserApi.getWorkshopUser(id)
      // 后端 nodeIds 可能以 JSON 字符串形式返回，需兼容解析
      const rawNodeIds = data.nodeIds
      formData.value = {
        ...data,
        nodeIds: Array.isArray(rawNodeIds)
          ? rawNodeIds
          : typeof rawNodeIds === 'string'
            ? JSON.parse(rawNodeIds)
            : []
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

// ======================== 提交表单 ========================
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as WorkshopUser
    if (formType.value === 'create') {
      await WorkshopUserApi.createWorkshopUser(data)
      message.success(t('common.createSuccess'))
    } else {
      await WorkshopUserApi.updateWorkshopUser(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// ======================== 重置表单 ========================
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    status: 1,
    nodeIds: []
  }
  formRef.value?.resetFields()
}
</script>
