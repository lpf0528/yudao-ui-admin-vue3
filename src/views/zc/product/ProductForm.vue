<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="版本" prop="versionId">
        <el-select v-model="formData.versionId" clearable placeholder="请选择版本" class="w-1/1">
          <el-option
            v-for="item in props.versionList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="进货价" prop="inboundPrice">
        <el-input v-model="formData.inboundPrice" placeholder="请输入进货价" />
      </el-form-item>
      <el-form-item label="规格" prop="specId">
        <el-select v-model="formData.specId" clearable placeholder="请选择规格" class="w-1/1">
          <el-option
            v-for="item in props.specList"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="一级销售价" prop="onePrice">
        <!-- 版本出货价类型为统一价时自动填入且不可修改 -->
        <el-input
          v-model="formData.onePrice"
          placeholder="请输入一级销售价"
          :disabled="isOnePriceFixed"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-select v-model="formData.supplierId" clearable placeholder="请选择供应商" class="w-1/1">
          <el-option
            v-for="item in props.supplierList"
            :key="item.id"
            :label="item.shortName"
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
import { ProductApi, Product } from '@/api/zc/product'
import { ProductVersionSimpleVO } from '@/api/zc/productversion'
import { ProductSpecSimpleVO } from '@/api/zc/productspec'
import { SupplierSimpleVO } from '@/api/zc/supplier'

/** 产品 表单 */
defineOptions({ name: 'ProductForm' })

const props = defineProps<{
  versionList: ProductVersionSimpleVO[]
  specList: ProductSpecSimpleVO[]
  supplierList: SupplierSimpleVO[]
}>()

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

// ======================== 表单 ========================
const formData = ref({
  id: undefined,
  name: undefined,
  versionId: undefined,
  inboundPrice: undefined,
  specId: undefined,
  onePrice: undefined,
  supplierId: undefined,
  note: undefined
})
// 型号价时一级销售价必填，统一价时由版本自动填入无需校验
const formRules = computed(() => ({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  versionId: [{ required: true, message: '版本不能为空', trigger: 'blur' }],
  onePrice: isOnePriceFixed.value
    ? []
    : [{ required: true, message: '一级销售价不能为空', trigger: 'blur' }]
}))
const formRef = ref() // 表单 Ref

/** 当前选中版本是否为统一价（fixed_price），若是则一级销售价只读且自动填入 */
const isOnePriceFixed = ref(false)
/** 编辑回填数据时跳过 watch 的清空逻辑，避免覆盖接口返回的 onePrice */
const skipVersionWatch = ref(false)

/** 监听版本选择变化，自动回显进货价、供应商、一级销售价 */
watch(
  () => formData.value.versionId,
  (versionId) => {
    if (skipVersionWatch.value) return
    if (!versionId) {
      isOnePriceFixed.value = false
      return
    }
    const version = props.versionList.find((v) => v.id === versionId)
    if (!version) return

    formData.value.inboundPrice = version.inboundPrice as any
    formData.value.supplierId = version.supplierId as any

    if (version.sellingPriceType === 'fixed_price') {
      // 统一价：自动填入一级销售价且不允许修改
      isOnePriceFixed.value = true
      formData.value.onePrice = version.onePrice as any
    } else {
      // 型号价：清空一级销售价，由用户手动填写
      isOnePriceFixed.value = false
      formData.value.onePrice = undefined as any
    }
  }
)

// ======================== 弹窗操作 ========================
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
      // 先暂停 watch，避免赋值 versionId 时触发清空 onePrice 的逻辑
      skipVersionWatch.value = true
      formData.value = await ProductApi.getProduct(id)
      await nextTick()
      skipVersionWatch.value = false
      // 编辑模式下根据已有版本判断一级销售价是否只读
      const version = props.versionList.find((v) => v.id === formData.value.versionId)
      isOnePriceFixed.value = version?.sellingPriceType === 'fixed_price'
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// ======================== 提交 ========================
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Product
    if (formType.value === 'create') {
      await ProductApi.createProduct(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductApi.updateProduct(data)
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
    versionId: undefined,
    inboundPrice: undefined,
    specId: undefined,
    onePrice: undefined,
    supplierId: undefined,
    note: undefined
  }
  isOnePriceFixed.value = false
  formRef.value?.resetFields()
}
</script>