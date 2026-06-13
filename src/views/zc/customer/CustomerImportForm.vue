<!--
  客户资料 - Excel 导入弹窗
  功能：上传 xls/xlsx 文件批量导入客户，支持覆盖更新已有客户
  使用方：views/zc/customer/index.vue
-->
<template>
  <Dialog v-model="dialogVisible" title="客户导入" width="400">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的客户数据
          </div>
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { CustomerApi } from '@/api/zc/customer'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'

defineOptions({ name: 'CustomerImportForm' })

const message = useMessage()
const emits = defineEmits(['success'])

// ======================== 响应式状态 ========================
const dialogVisible = ref(false)
const formLoading = ref(false)
const uploadRef = ref()
const fileList = ref([]) // 待上传文件列表
const updateSupport = ref(false) // 是否覆盖更新已有客户
const uploadHeaders = ref() // 上传请求头（含 token 和租户 ID）

/** 导入接口地址，updateSupport 通过 query 参数传递 */
const importUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/zc/customer/import-excel'

// ======================== 弹窗控制 ========================
/** 打开弹窗，重置上传状态 */
const open = () => {
  dialogVisible.value = true
  updateSupport.value = false
  fileList.value = []
  resetForm()
}
defineExpose({ open })

// ======================== 表单提交 ========================
/** 点击确定：设置请求头后触发 el-upload 上传 */
const submitForm = async () => {
  if (fileList.value.length === 0) {
    message.error('请上传文件')
    return
  }
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

/** 上传成功回调：解析结果并展示摘要 */
const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    resetForm()
    return
  }
  const data = response.data
  let text = '新增成功数量：' + data.createShortNames.length + ';'
  for (const name of data.createShortNames) {
    text += '< ' + name + ' >'
  }
  text += ' 更新成功数量：' + data.updateShortNames.length + ';'
  for (const name of data.updateShortNames) {
    text += '< ' + name + ' >'
  }
  const failureCount = Object.keys(data.failureShortNames).length
  text += ' 导入失败数量：' + failureCount + ';'
  for (const name in data.failureShortNames) {
    text += '< ' + name + ': ' + data.failureShortNames[name] + ' >'
  }
  message.alert(text)
  formLoading.value = false
  dialogVisible.value = false
  emits('success')
}

/** 上传失败回调 */
const submitFormError = () => {
  message.error('上传失败，请重新上传！')
  formLoading.value = false
}

/** 超出文件数限制提示 */
const handleExceed = () => {
  message.error('最多只能上传一个文件！')
}

// ======================== 工具方法 ========================
/** 重置上传组件状态 */
const resetForm = async () => {
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

/** 下载导入模板 */
const importTemplate = async () => {
  const res = await CustomerApi.importTemplate()
  download.excel(res, '客户导入模板.xls')
}
</script>
