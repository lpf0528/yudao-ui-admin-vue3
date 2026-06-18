<!--
  用户列表 - 工序节点用户选择
  功能：展示系统用户分页列表，支持按用户名、手机号、状态筛选
-->
<template>
  <ContentWrap>
    <!-- 搜索区域 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px"
      @submit.prevent
    >
      <el-form-item label="用户名称" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
		   oninput="value=value.replace(/[^\d]/g,'')"
		   maxlength="11"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-200px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" />搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" />重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 数据表格 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" style="width: 100%">
      <el-table-column label="用户编号" prop="id" min-width="80" align="center" />
      <el-table-column label="用户昵称" prop="nickname" min-width="120" />
      <el-table-column label="部门" prop="deptName" min-width="120" />
      <el-table-column label="手机号码" prop="mobile" min-width="130" />
      <el-table-column label="工作节点" prop="processNodeNames" min-width="180">
        <template #default="{ row }">
          <el-tag
            v-for="name in row.processNodeNames"
            :key="name"
            class="mr-4px mb-4px"
            size="small"
          >{{ name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" min-width="90" align="center">
        <template #default="{ row }">
          <DictTag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" min-width="120" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openNodeConfig(row)">工序节点配置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 工序节点配置弹窗 -->
  <UserProcessNodeConfigDialog ref="nodeConfigDialogRef" />
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { getUserPage } from '@/api/system/user'
import type { UserVO } from '@/api/system/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserProcessNodeConfigDialog from './UserProcessNodeConfigDialog.vue'

defineOptions({ name: 'ZcUserProcessNode' })

// ======================== 响应式状态 ========================
const loading = ref(false)       // 表格加载状态
const total = ref(0)             // 总记录数
const list = ref<UserVO[]>([])   // 用户列表数据

/** 查询参数，对应后端 /system/user/page 接口入参 */
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined as string | undefined,
  mobile: undefined as string | undefined,
  status: undefined as number | undefined
})

const queryFormRef = ref() // 搜索表单 ref

// ======================== 生命周期 ========================
onMounted(() => {
  getList()
})

// ======================== 数据获取 ========================
/** 查询用户分页列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getUserPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// ======================== 事件处理 ========================
const nodeConfigDialogRef = ref<InstanceType<typeof UserProcessNodeConfigDialog>>()

/** 打开工序节点配置弹窗 */
const openNodeConfig = (user: UserVO) => {
  nodeConfigDialogRef.value?.open(user)
}

/** 搜索：重置页码后重新查询 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置搜索表单 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}
</script>
