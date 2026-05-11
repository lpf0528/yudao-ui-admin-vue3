<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" inline>
      <el-form-item label="编码">
        <el-input v-model="queryParams.code" clearable class="!w-180px" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="queryParams.name" clearable class="!w-180px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['zc:progress-definition:create']">
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="编码" prop="code" width="120" />
      <el-table-column label="名称" prop="name" min-width="140" />
      <el-table-column label="类别" prop="progressKind" width="90" />
      <el-table-column label="排序" prop="sort" width="80" />
      <el-table-column label="状态" prop="status" width="80" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('update', row)" v-hasPermi="['zc:progress-definition:update']">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id)" v-hasPermi="['zc:progress-definition:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <Dialog :title="dialogTitle" v-model="dialogVisible" width="640px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-form-item label="编码" prop="code">
        <el-input v-model="formData.code" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="进度类别" prop="progressKind">
        <el-input-number v-model="formData.progressKind" :min="0" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input-number v-model="formData.status" :min="0" :max="1" controls-position="right" class="!w-full" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit" :loading="saveLoading">确定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ZcProgressDefinitionApi, ZcProgressDefinitionVO } from '@/api/zc/progress/definition'

defineOptions({ name: 'ZcProgressDefinition' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: undefined as string | undefined,
  name: undefined as string | undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const saveLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const formData = ref<ZcProgressDefinitionVO>({})

const rules = {
  code: [{ required: true, message: '编码必填', trigger: 'blur' }],
  name: [{ required: true, message: '名称必填', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const data = await ZcProgressDefinitionApi.getPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const openForm = (type: 'create' | 'update', row?: any) => {
  formType.value = type
  dialogTitle.value = type === 'create' ? '新建进度定义' : '编辑进度定义'
  formData.value = type === 'create' ? {} : { ...row }
  dialogVisible.value = true
}

const submit = async () => {
  await formRef.value?.validate()
  saveLoading.value = true
  try {
    if (formType.value === 'create') {
      await ZcProgressDefinitionApi.create(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await ZcProgressDefinitionApi.update(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    await getList()
  } finally {
    saveLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ZcProgressDefinitionApi.delete(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => getList())
</script>
