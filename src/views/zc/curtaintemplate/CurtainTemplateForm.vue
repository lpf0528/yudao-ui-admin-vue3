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
        <el-select v-model="formData.curtainId" clearable placeholder="请选择款式" class="w-1/1">
          <el-option
            v-for="item in props.curtainList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="结构/配件" prop="structures">
        <div class="w-full">
          <div
            v-for="(row, index) in formData.structures"
            :key="index"
            class="flex gap-2 mb-2 items-center"
          >
            <el-select
              v-model="row.structureId"
              placeholder="请选择结构"
              style="width: 160px; flex-shrink: 0"
              @change="onStructureChange(index)"
            >
              <el-option
                v-for="s in getAvailableStructures(index)"
                :key="s.id"
                :label="s.name"
                :value="s.id"
              />
            </el-select>
            <el-select
              v-model="row.elementIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="5"
              placeholder="请选择配件"
              style="flex: 1"
            >
              <el-option
                v-for="e in props.elementList"
                :key="e.id"
                :label="e.name"
                :value="e.id"
              />
            </el-select>
            <el-button type="danger" :icon="Delete" circle plain @click="removeStructure(index)" />
          </div>
          <el-button type="primary" plain :icon="Plus" @click="addStructure">添加结构</el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { CurtainTemplateApi, CurtainTemplate } from '@/api/zc/curtaintemplate'
import { CurtainSimpleVO } from '@/api/zc/curtain'
import { CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import { CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'

/** 窗帘模板 表单 */
defineOptions({ name: 'CurtainTemplateForm' })

interface StructureRow {
  structureId: number | undefined
  elementIds: number[]
}

const props = defineProps<{
  curtainList: CurtainSimpleVO[]
  structureList: CurtainStructureSimpleVO[]
  elementList: CurtainStructureElementSimpleVO[]
}>()

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<{ id: number | undefined; curtainId: number | undefined; structures: StructureRow[] }>({
  id: undefined,
  curtainId: undefined,
  structures: []
})
const validateStructures = (_: any, __: any, callback: (e?: Error) => void) => {
  const rows = formData.value.structures
  if (rows.length === 0) return callback(new Error('至少添加一个结构'))
  if (rows.some(r => r.structureId === undefined)) return callback(new Error('结构不能为空'))
  callback()
}
const formRules = reactive({
  curtainId: [{ required: true, message: '款式不能为空', trigger: 'change' }],
  structures: [{ validator: validateStructures, trigger: 'change' }]
})
const formRef = ref()

/** 返回当前行可选的结构列表（排除其他行已选结构） */
const getAvailableStructures = (index: number) => {
  const usedIds = new Set(
    formData.value.structures
      .filter((_, i) => i !== index)
      .map(row => row.structureId)
      .filter(id => id !== undefined)
  )
  return props.structureList.filter(s => !usedIds.has(s.id))
}

/** 结构变更时清空该行已选配件并重新校验 */
const onStructureChange = (index: number) => {
  formData.value.structures[index].elementIds = []
  formRef.value?.validateField('structures')
}

const addStructure = () => {
  formData.value.structures.push({ structureId: undefined, elementIds: [] })
  formRef.value?.validateField('structures')
}

const removeStructure = (index: number) => {
  formData.value.structures.splice(index, 1)
  formRef.value?.validateField('structures')
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      const data = await CurtainTemplateApi.getCurtainTemplate(id)
      formData.value = {
        id: data.id,
        curtainId: data.curtainId,
        structures: (data.structures || []) as StructureRow[]
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
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
    structures: []
  }
  formRef.value?.resetFields()
}
</script>
