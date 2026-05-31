<!--
  工序节点配置弹窗
  功能：为指定员工配置绑定的工序节点，支持多选，保存时覆盖原有绑定
  使用方：views/zc/userprocessnode/index.vue
-->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
    <div v-loading="dialogLoading">
      <!-- 员工信息提示 -->
      <div class="mb-16px text-sm text-gray-500">
        为员工 <span class="font-bold text-gray-800">{{ currentUser?.nickname }}</span> 配置工序节点
      </div>

      <!-- 工序节点多选列表 -->
      <el-checkbox-group v-model="selectedNodeIds" class="flex flex-col gap-8px">
        <el-checkbox
          v-for="node in processNodeList"
          :key="node.id"
          :value="node.id"
          :label="node.id"
        >
          {{ node.name }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- 无数据提示 -->
      <el-empty v-if="!dialogLoading && processNodeList.length === 0" description="暂无工序节点数据" />
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确认</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { UserProcessNodeApi } from '@/api/zc/userprocessnode'
import type { ZcProcessNodeRespVO } from '@/api/zc/userprocessnode'
import { ProcessNodeApi } from '@/api/zc/processnode'
import type { ProcessNodeSimpleVO } from '@/api/zc/processnode'
import type { UserVO } from '@/api/system/user'

/** 配置成功后通知父组件刷新列表 */
const emit = defineEmits(['success'])

const message = useMessage()

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)
const dialogTitle = ref('工序节点配置')
const dialogLoading = ref(false)
const submitLoading = ref(false)

// ======================== 数据状态 ========================
const currentUser = ref<UserVO>()
const processNodeList = ref<ProcessNodeSimpleVO[]>([])  // 精简节点列表，用于渲染复选框
const selectedNodeIds = ref<number[]>([])               // 已选中的工序节点 ID

/**
 * 打开弹窗并加载数据
 * @param user 当前操作的员工信息
 */
const open = async (user: UserVO) => {
  dialogVisible.value = true
  currentUser.value = user
  selectedNodeIds.value = []
  dialogLoading.value = true

  try {
    // 并行获取精简工序节点列表和该员工已绑定的节点列表
    const [simpleList, boundNodes] = await Promise.all([
      ProcessNodeApi.getSimpleProcessNodeList(),
      UserProcessNodeApi.getUserProcessNodeList(user.id)
    ])
    processNodeList.value = simpleList ?? []
    // 从已绑定的节点对象中提取 ID，用于回显复选框选中状态
    selectedNodeIds.value = (boundNodes as ZcProcessNodeRespVO[]).map((n) => n.id)
  } finally {
    dialogLoading.value = false
  }
}
defineExpose({ open })

// ======================== 事件处理 ========================
/** 提交保存工序节点绑定 */
const handleSubmit = async () => {
  if (!currentUser.value) return
  submitLoading.value = true
  try {
    await UserProcessNodeApi.saveUserProcessNode({
      userId: currentUser.value.id,
      nodeIds: selectedNodeIds.value
    })
    message.success('配置成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    submitLoading.value = false
  }
}
</script>
