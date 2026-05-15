<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="版本名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入版本名称" />
      </el-form-item>
      <el-form-item label="单位（字典）" prop="unitValue">
        <el-input v-model="formData.unitValue" placeholder="请输入单位（字典）" />
      </el-form-item>
      <el-form-item label="规格ID" prop="specId">
        <el-input v-model="formData.specId" placeholder="请输入规格ID" />
      </el-form-item>
      <el-form-item label="规格值" prop="specValue">
        <el-input v-model="formData.specValue" placeholder="请输入规格值" />
      </el-form-item>
      <el-form-item label="类别" prop="categoryId">
        <el-select v-model="formData.categoryId" clearable placeholder="请选择类别" class="w-1/1"
          @change="handleCategoryChange"
          @clear="handleCategoryChange(undefined)"
        >
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出货价类型" prop="sellingPriceType">
        <el-select v-model="formData.sellingPriceType" placeholder="请选择出货价类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.ZC_SELLING_PRICE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="进货价" prop="inboundPrice">
        <el-input v-model="formData.inboundPrice" placeholder="请输入进货价" />
      </el-form-item>
      <el-form-item label="分类" prop="classify">
        <el-select v-model="formData.classify" clearable placeholder="请选择分类">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ZC_PRODUCT_CLASSIFY)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-input v-model="formData.supplierId" placeholder="请输入供应商" />
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
import { getStrDictOptions, getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProductVersionApi, ProductVersion } from '@/api/zc/productversion'
import { ProductCategoryApi, ProductCategorySimpleVO } from '@/api/zc/productcategory'

/** 产品版本 表单 */
defineOptions({ name: 'ProductVersionForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const categoryList = ref<ProductCategorySimpleVO[]>([]) // 类别列表
const formData = ref({
  id: undefined,
  name: undefined,
  unitValue: undefined,
  specId: undefined,
  specValue: undefined,
  categoryId: undefined,
  categoryValue: undefined,
  sellingPriceType: undefined,
  inboundPrice: undefined,
  classify: undefined,
  supplierId: undefined,
  note: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: '版本名称不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 类别
  categoryList.value = await ProductCategoryApi.getProductCategorySimpleList()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProductVersionApi.getProductVersion(id)
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
    const data = formData.value as unknown as ProductVersion
    if (formType.value === 'create') {
      await ProductVersionApi.createProductVersion(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductVersionApi.updateProductVersion(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 选择类别时同步更新 categoryValue */
const handleCategoryChange = (val: number | undefined) => {
  const item = categoryList.value.find((i) => i.id === val)
  ;(formData.value as any).categoryValue = item?.value
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    unitValue: undefined,
    specId: undefined,
    specValue: undefined,
    categoryId: undefined,
    categoryValue: undefined,
    sellingPriceType: undefined,
    inboundPrice: undefined,
    classify: undefined,
    supplierId: undefined,
    note: undefined,
  }
  formRef.value?.resetFields()
}
</script>
