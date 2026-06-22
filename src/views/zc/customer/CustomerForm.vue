<!--
  客户资料 - 新增/修改弹窗
  功能：提供客户信息的表单录入，物流支持从列表选择或手动输入
  使用方：views/zc/customer/index.vue
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
      <el-form-item label="全称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入全称" />
      </el-form-item>
      <el-form-item label="简称" prop="shortName">
        <el-input v-model="formData.shortName" placeholder="请输入简称" />
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input v-model="formData.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <!-- <el-form-item label="固定地址" prop="address">
        <el-input v-model="formData.address" type="textarea" placeholder="请输入固定地址" />
      </el-form-item> -->
      <el-form-item label="送货地址" prop="deliveryAddress">
        <el-input v-model="formData.deliveryAddress" type="textarea" placeholder="请输入送货地址" />
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机" />
      </el-form-item>
      <!-- <el-form-item label="联系电话" prop="mobile2">
        <el-input v-model="formData.mobile2" placeholder="请输入联系电话" />
      </el-form-item> -->
      <!-- 物流：支持从列表选择或手输；未匹配到列表项时 logisticId 为空，仅传 logisticName -->
      <el-form-item label="物流" prop="logisticName">
        <el-autocomplete
          v-model="formData.logisticName"
          :fetch-suggestions="fetchLogisticSuggestions"
          clearable
          placeholder="请输入或选择物流"
          class="w-1/1"
          value-key="name"
          @select="handleLogisticSelect"
          @blur="syncLogisticIdByName"
        />
      </el-form-item>
      <el-form-item label="关联品牌" prop="brandId">
        <el-select v-model="formData.brandId" clearable placeholder="请选择关联品牌" class="w-1/1">
          <el-option
            v-for="item in props.brandList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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
// ======================== 导入与声明 ========================
import { CustomerApi, Customer } from '@/api/zc/customer'
import { Logistics } from '@/api/zc/logistics'
import { Brand } from '@/api/zc/brand'

/** 客户资料 表单 */
defineOptions({ name: 'CustomerForm' })

// ======================== Props / Emits ========================
const props = defineProps<{ logisticsList: Logistics[]; brandList: Brand[] }>()

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// ======================== 响应式状态 ========================
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  shortName: undefined,
  name: undefined,
  contactName: undefined,
  address: undefined,
  deliveryAddress: undefined,
  mobile: undefined,
  mobile2: undefined,
  logisticId: undefined as number | undefined,
  logisticName: undefined as string | undefined,
  brandId: undefined,
  note: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: '全称不能为空', trigger: 'blur' }],
  contactName: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

// ======================== 物流输入 ========================
/** 物流自动完成：按名称过滤已有物流公司 */
const fetchLogisticSuggestions = (queryString: string, cb: (results: Logistics[]) => void) => {
  const keyword = queryString.trim().toLowerCase()
  const list = keyword
    ? props.logisticsList.filter((item) => item.name?.toLowerCase().includes(keyword))
    : props.logisticsList
  cb(list)
}

/** 从下拉选中物流：同时回填 ID 与名称 */
const handleLogisticSelect = (item: Logistics) => {
  formData.value.logisticName = item.name
  formData.value.logisticId = item.id
}

/** 失焦时按名称精确匹配物流 ID；未匹配则清空 logisticId，仅保留手输名称 */
const syncLogisticIdByName = () => {
  const name = formData.value.logisticName?.trim()
  if (!name) {
    formData.value.logisticName = undefined
    formData.value.logisticId = undefined
    return
  }
  formData.value.logisticName = name
  formData.value.logisticId = props.logisticsList.find((item) => item.name === name)?.id
}

/** 提交前解析物流：名称精确匹配列表则带 ID，否则仅传 logisticName */
const resolveLogisticForSubmit = (logisticName?: string) => {
  const name = logisticName?.trim()
  if (!name) {
    return { logisticId: undefined, logisticName: undefined }
  }
  const matched = props.logisticsList.find((item) => item.name === name)
  return {
    logisticId: matched?.id,
    logisticName: name
  }
}

/** 详情仅有 logisticId 时，从物流列表回填展示名称 */
const syncLogisticNameFromId = () => {
  if (!formData.value.logisticName && formData.value.logisticId) {
    formData.value.logisticName =
      props.logisticsList.find((item) => item.id === formData.value.logisticId)?.name ?? ''
  }
}

// ======================== 事件处理 ========================
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
      formData.value = await CustomerApi.getCustomer(id)
      syncLogisticNameFromId()
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
    const { logisticId, logisticName } = resolveLogisticForSubmit(formData.value.logisticName)
    const data = {
      ...formData.value,
      logisticId,
      logisticName
    } as unknown as Customer
    if (formType.value === 'create') {
      await CustomerApi.createCustomer(data)
      message.success(t('common.createSuccess'))
    } else {
      await CustomerApi.updateCustomer(data)
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
    shortName: undefined,
    name: undefined,
    contactName: undefined,
    address: undefined,
    deliveryAddress: undefined,
    mobile: undefined,
    mobile2: undefined,
    logisticId: undefined,
    logisticName: undefined,
    brandId: undefined,
    note: undefined,
  }
  formRef.value?.resetFields()
}
</script>
