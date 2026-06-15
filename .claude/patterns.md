# 常用开发模式

## 新增一个业务页面的标准流程

1. **定义 API 类型** → `src/api/{模块}/types.ts`，写好接口字段注释
2. **实现 API 函数** → `src/api/{模块}/index.ts`，每个函数加注释
3. **创建页面目录** → `src/views/{模块}/{功能}/`
4. **实现列表页** → `index.vue`（分页查询 + 表格 + 操作列）
5. **实现表单弹窗** → `{Name}Form.vue`（新增/编辑复用同一组件）
6. **在路由中注册** → 后端菜单管理中配置，或修改 `src/router/modules/` 中的静态路由

## 标准列表页结构（`index.vue`）

```vue
<!--
  {模块} - {功能}列表页
  支持按{字段}查询，可进行新增、编辑、删除操作
-->
<template>
  <ContentWrap>
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" /> 重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb-8px">
      <el-col :span="1.5">
        <el-button
          type="primary" plain
          @click="openForm('create')"
          v-hasPermi="['{module}:{resource}:create']"
        >
          <Icon icon="ep:plus" /> 新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" prop="id" width="80" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('update', row.id)" v-hasPermi="['{module}:{resource}:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)" v-hasPermi="['{module}:{resource}:delete']">删除</el-button>
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

  <!-- 新增/编辑弹窗 -->
  <ExampleForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getExamplePage, deleteExample } from '@/api/{module}/example'
import type { ExampleVO, ExamplePageReqVO } from '@/api/{module}/example/types'
import ExampleForm from './ExampleForm.vue'

const loading = ref(false)
const total = ref(0)
const list = ref<ExampleVO[]>([])

const queryParams = reactive<ExamplePageReqVO>({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

onMounted(() => getList())

const getList = async () => {
  loading.value = true
  try {
    const data = await getExamplePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const formRef = ref<InstanceType<typeof ExampleForm>>()
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value?.open(type, id)
}

const handleDelete = async (id: number) => {
  await message.delConfirm()
  await deleteExample(id)
  message.success('删除成功')
  getList()
}
</script>
```

## 标准表单弹窗（`XxxForm.vue`）

```vue
<!--
  {功能} 新增/编辑弹窗
  通过 open(type, id?) 方法控制显示，成功后 emit('success') 通知父组件刷新列表
-->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="formLoading" @click="submitForm">确认</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')

const formRef = ref()
const formData = reactive<Partial<ExampleVO>>({ name: '' })
const formRules = {
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增' : '编辑'
  formType.value = type
  formRef.value?.resetFields()

  if (id) {
    formLoading.value = true
    try {
      const data = await getExample(id)
      Object.assign(formData, data)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const submitForm = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await createExample(formData)
      message.success('新增成功')
    } else {
      await updateExample(formData)
      message.success('修改成功')
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
```
