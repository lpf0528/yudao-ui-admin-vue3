<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="90px"
      v-loading="formLoading"
    >
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="客户" prop="customerId">
            <el-input v-model="formData.customerId" placeholder="请输入客户" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入手机" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="品牌" prop="brandId">
            <el-input v-model="formData.brandId" placeholder="请输入品牌" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="下单日期" prop="orderDate">
            <el-date-picker
              v-model="formData.orderDate"
              type="date"
              value-format="x"
              placeholder="选择下单日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="物流" prop="logisticId">
            <el-input v-model="formData.logisticId" placeholder="请输入物流" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="收货人" prop="receiver">
            <el-input v-model="formData.receiver" placeholder="请输入收货人" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="送货地址" prop="deliveryAddress">
            <el-input v-model="formData.deliveryAddress" placeholder="请输入送货地址" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="运费" prop="freight">
            <el-input v-model="formData.freight" placeholder="请输入运费" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="优惠金额" prop="discountAmount">
            <el-input v-model="formData.discountAmount" placeholder="请输入优惠金额" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="总金额" prop="totalAmount">
            <el-input v-model="formData.totalAmount" placeholder="请输入总金额" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="交付日期" prop="deliveryDate">
            <el-date-picker
              v-model="formData.deliveryDate"
              type="date"
              value-format="x"
              placeholder="选择交付日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" placeholder="请输入备注" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-divider content-position="left">窗帘列表</el-divider>
    <el-button type="primary" link class="mb-8px" @click="addCurtain">+ 添加窗帘</el-button>
    <el-card
      v-for="(curtain, idx) in formData.curtains"
      :key="idx"
      class="mt-8px"
      shadow="never"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>窗帘 #{{ idx + 1 }}</span>
          <el-button link type="danger" @click="removeCurtain(idx)">删除</el-button>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="3">
          <el-form-item label="款式">
            <el-input v-model="curtain.curtainId" placeholder="请输入款式" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="房间">
            <el-input v-model="curtain.room" placeholder="请输入房间" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="褶倍快照">
            <el-input v-model="curtain.pleatRatioValue" placeholder="请输入褶倍快照" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="折扣率">
            <el-input v-model="curtain.discountRate" placeholder="请输入折扣率" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="应收金额">
            <el-input v-model="curtain.amount" placeholder="请输入应收金额" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="配件多选">
            <el-input v-model="curtain.mountings" placeholder="请输入配件多选" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="备注">
            <el-input v-model="curtain.note" placeholder="请输入备注" type="textarea" :rows="1" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="图片1">
            <UploadImg v-model="curtain.image1" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="图片2">
            <UploadImg v-model="curtain.image2" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">结构列表</el-divider>
      <el-button type="primary" link class="mb-8px" @click="addStructure(curtain)">+ 添加结构</el-button>
      <div
        v-for="(structure, sIdx) in curtain.structures"
        :key="sIdx"
        class="mt-8px border border-solid border-gray-200 rounded p-12px"
      >
        <div class="flex justify-between items-center mb-8px">
          <span class="text-sm font-medium text-gray-600">结构 #{{ sIdx + 1 }}</span>
          <el-button link type="danger" @click="removeStructure(curtain, sIdx)">删除</el-button>
        </div>
        <el-row :gutter="16">
          <el-col :span="3">
            <el-form-item label="结构">
              <el-input v-model="structure.structureId" placeholder="结构" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="高">
              <el-input v-model="structure.height" placeholder="高" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="宽">
              <el-input v-model="structure.width" placeholder="宽" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="左转角">
              <el-input v-model="structure.leftCorner" placeholder="左转角" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="右转角">
              <el-input v-model="structure.rightCorner" placeholder="右转角" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="粘贴方向">
              <el-input v-model="structure.pasteDirection" placeholder="粘贴方向" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="安装工艺">
              <el-input v-model="structure.installProcessId" placeholder="安装工艺" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="打开方式">
              <el-input v-model="structure.openMethod" placeholder="打开方式" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="加工类型">
              <el-input v-model="structure.processType" placeholder="加工类型" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="是否定型">
              <el-input v-model="structure.shaping" placeholder="是否定型" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="总褶数">
              <el-input v-model="structure.pleatsNum" placeholder="总褶数" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="褶距">
              <el-input v-model="structure.pleatsDistance" placeholder="褶距" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="裙摆高度">
              <el-input v-model="structure.skirtHeight" placeholder="裙摆高度" />
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="备注">
              <el-input v-model="structure.note" placeholder="备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { SalesOrderApi, SalesOrder, SalesOrderCurtainApi, SalesOrderCurtain, SalesOrderStructure } from '@/api/zc/salesorder'

/** 销售订单 表单 */
defineOptions({ name: 'SalesOrderForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
type CurtainWithStructures = SalesOrderCurtain & { structures: SalesOrderStructure[] }

const formData = ref<SalesOrder & { curtains: CurtainWithStructures[] }>({
  id: undefined,
  orderNo: undefined,
  customerId: undefined,
  mobile: undefined,
  brandId: undefined,
  orderDate: undefined,
  logisticId: undefined,
  receiver: undefined,
  deliveryAddress: undefined,
  freight: undefined,
  types: undefined,
  discountAmount: undefined,
  totalAmount: undefined,
  deliveryDate: undefined,
  payStatus: undefined,
  status: undefined,
  confirmTime: undefined,
  isExpedited: undefined,
  note: undefined,
  curtains: []
})
const formRules = reactive({
  orderNo: [{ required: true, message: '订单号不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
  orderDate: [{ required: true, message: '下单日期不能为空', trigger: 'blur' }],
  deliveryAddress: [{ required: true, message: '送货地址不能为空', trigger: 'blur' }],
  freight: [{ required: true, message: '运费不能为空', trigger: 'blur' }],
  types: [{ required: true, message: '订单类型不能为空', trigger: 'blur' }],
  discountAmount: [{ required: true, message: '优惠金额不能为空', trigger: 'blur' }],
  totalAmount: [{ required: true, message: '总金额不能为空', trigger: 'blur' }],
  payStatus: [{ required: true, message: '结算状态不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  isExpedited: [{ required: true, message: '是否加急不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

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
      const order = await SalesOrderApi.getSalesOrder(id)
      const curtains = await SalesOrderCurtainApi.getSalesOrderCurtainList(id)
      formData.value = { ...order, curtains: curtains || [] }
    } finally {
      formLoading.value = false
    }
  }
}

const addCurtain = () => {
  formData.value.curtains.push({
    orderId: formData.value.id,
    curtainId: undefined,
    room: undefined,
    pleatRatioValue: undefined,
    discountRate: undefined,
    amount: undefined,
    image1: undefined,
    image2: undefined,
    mountings: undefined,
    note: undefined,
    structures: []
  })
}

const removeCurtain = (index: number) => {
  formData.value.curtains.splice(index, 1)
}

const addStructure = (curtain: SalesOrderCurtain & { structures: SalesOrderStructure[] }) => {
  curtain.structures.push({
    structureId: undefined,
    height: undefined,
    width: undefined,
    leftCorner: undefined,
    rightCorner: undefined,
    pasteDirection: undefined,
    installProcessId: undefined,
    openMethod: undefined,
    processType: undefined,
    shaping: undefined,
    pleatsNum: undefined,
    pleatsDistance: undefined,
    skirtHeight: undefined,
    note: undefined
  })
}

const removeStructure = (
  curtain: SalesOrderCurtain & { structures: SalesOrderStructure[] },
  index: number
) => {
  curtain.structures.splice(index, 1)
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
    const data = formData.value as unknown as SalesOrder
    if (formType.value === 'create') {
      await SalesOrderApi.createSalesOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await SalesOrderApi.updateSalesOrder(data)
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
    orderNo: undefined,
    customerId: undefined,
    mobile: undefined,
    brandId: undefined,
    orderDate: undefined,
    logisticId: undefined,
    receiver: undefined,
    deliveryAddress: undefined,
    freight: undefined,
    types: undefined,
    discountAmount: undefined,
    totalAmount: undefined,
    deliveryDate: undefined,
    payStatus: undefined,
    status: undefined,
    confirmTime: undefined,
    isExpedited: undefined,
    note: undefined,
    curtains: []
  }
  formRef.value?.resetFields()
}
</script>
