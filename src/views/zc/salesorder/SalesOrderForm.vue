<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%" top="3vh">
    <!-- 顶部操作栏 -->
    <div class="mb-12px flex items-center gap-8px border-b border-gray-200 pb-12px">
      <el-button type="primary" @click="handleSave" :loading="formLoading">
        <Icon icon="ep:finished" class="mr-4px" />保存
      </el-button>
      <el-button type="success" @click="handleConfirm" :disabled="!formData.id || formLoading">
        <Icon icon="ep:circle-check" class="mr-4px" />确认订单
      </el-button>
      <el-button type="warning" @click="handleExpedite" :disabled="!formData.id || formLoading">
        <Icon icon="ep:timer" class="mr-4px" />加急
      </el-button>
      <el-button type="danger" @click="handleAudit" :disabled="!formData.id || formLoading">
        <Icon icon="ep:check" class="mr-4px" />审核
      </el-button>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <!-- 基本信息 -->
      <div class="mb-6px text-sm font-medium text-gray-500">基本信息</div>
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
          <el-form-item label="物流" prop="logisticId">
            <el-input v-model="formData.logisticId" placeholder="请输入物流" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="收货人" prop="receiver">
            <el-input v-model="formData.receiver" placeholder="请输入收货人" />
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
      </el-row>

      <!-- 配送 & 金额 -->
      <div class="mb-6px mt-4px text-sm font-medium text-gray-500">配送 &amp; 金额</div>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="送货地址" prop="deliveryAddress">
            <el-input v-model="formData.deliveryAddress" placeholder="请输入送货地址" />
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
      </el-row>

      <!-- 备注 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" placeholder="请输入备注" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-divider content-position="left">窗帘列表</el-divider>
    <el-button type="primary" link class="mb-8px" @click="addCurtain">+ 添加窗帘</el-button>
    <div style="max-height: 50vh; overflow-y: auto; padding-right: 4px">
      <el-card
        v-for="(curtain, idx) in formData.curtains"
        :key="idx"
        class="mt-8px"
        shadow="never"
        :style="{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: curtainColors[idx % curtainColors.length] }"
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

          <div class="mt-4px pl-4px">
            <div class="flex items-center mb-2px">
              <span class="text-xs text-gray-500 mr-8px">用料列表</span>
              <el-button type="primary" link size="small" @click="addMaterial(structure)">+ 添加用料</el-button>
            </div>
            <template v-if="structure.materials.length > 0">
              <el-row :gutter="12" class="text-xs text-gray-700 font-semibold mb-2px px-4px">
                <el-col :span="1" />
                <el-col :span="3">组件类型</el-col>
                <el-col :span="3">货号</el-col>
                <el-col :span="3">批次</el-col>
                <el-col :span="2">单价</el-col>
                <el-col :span="2">用料</el-col>
                <el-col :span="2">单位</el-col>
                <el-col :span="2">折扣率</el-col>
                <el-col :span="2">小计</el-col>
                <el-col :span="4">备注</el-col>
              </el-row>
              <el-row
                v-for="(material, mIdx) in structure.materials"
                :key="mIdx"
                :gutter="12"
                class="mb-2px items-center rounded bg-blue-50 px-2px py-2px"
              >
                <el-col :span="1" class="flex justify-center">
                  <el-button link type="danger" size="small" @click="removeMaterial(structure, mIdx)">
                    <Icon icon="ep:delete" />
                  </el-button>
                </el-col>
                <el-col :span="3">
                  <el-input v-model="material.elementId" placeholder="组件类型" size="small" />
                </el-col>
                <el-col :span="3">
                  <el-input v-model="material.productId" placeholder="货号" size="small" />
                </el-col>
                <el-col :span="3">
                  <el-input v-model="material.batchId" placeholder="批次" size="small" />
                </el-col>
                <el-col :span="2">
                  <el-input v-model="material.price" placeholder="单价" size="small" />
                </el-col>
                <el-col :span="2">
                  <el-input v-model="material.quantity" placeholder="用料" size="small" />
                </el-col>
                <el-col :span="2">
                  <el-input v-model="material.unitValue" placeholder="单位" size="small" />
                </el-col>
                <el-col :span="2">
                  <el-input v-model="material.discountRate" placeholder="折扣率" size="small" />
                </el-col>
                <el-col :span="2">
                  <el-input v-model="material.amount" placeholder="小计" size="small" />
                </el-col>
                <el-col :span="4">
                  <el-input v-model="material.note" placeholder="备注" size="small" />
                </el-col>
              </el-row>
            </template>
          </div>
        </div>
      </el-card>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { SalesOrderApi, SalesOrder, SalesOrderCurtain, SalesOrderStructure, ZCSalesOrderMaterial } from '@/api/zc/salesorder'

/** 销售订单 表单 */
defineOptions({ name: 'SalesOrderForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
type StructureWithMaterials = SalesOrderStructure & { materials: ZCSalesOrderMaterial[] }
type CurtainWithStructures = SalesOrderCurtain & { structures: StructureWithMaterials[] }

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

const formRef = ref()
const curtainColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#1ABC9C', '#E67E22']

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
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

const addStructure = (curtain: CurtainWithStructures) => {
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
    note: undefined,
    materials: []
  })
}

const removeStructure = (curtain: CurtainWithStructures, index: number) => {
  curtain.structures.splice(index, 1)
}

const addMaterial = (structure: StructureWithMaterials) => {
  structure.materials.push({
    elementId: undefined,
    productId: undefined,
    batchId: undefined,
    price: undefined,
    quantity: undefined,
    unitValue: undefined,
    discountRate: undefined,
    amount: undefined,
    note: undefined
  })
}

const removeMaterial = (structure: StructureWithMaterials, index: number) => {
  structure.materials.splice(index, 1)
}

defineExpose({ open })

const emit = defineEmits(['success'])

const handleSave = async () => {
  await submitForm()
}

const handleConfirm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    formData.value.status = 'confirmed'
    formData.value.confirmTime = new Date().getTime() as any
    await SalesOrderApi.updateSalesOrder(formData.value as unknown as SalesOrder)
    message.success('确认订单成功')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleExpedite = async () => {
  formLoading.value = true
  try {
    formData.value.isExpedited = true
    await SalesOrderApi.updateSalesOrder(formData.value as unknown as SalesOrder)
    message.success('设置加急成功')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleAudit = async () => {
  formLoading.value = true
  try {
    formData.value.status = 'audited'
    await SalesOrderApi.updateSalesOrder(formData.value as unknown as SalesOrder)
    message.success('审核成功')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as SalesOrder
    console.log('[销售订单] 提交表单数据：', JSON.parse(JSON.stringify(formData.value)))
    if (formType.value === 'create') {
      await SalesOrderApi.createSalesOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await SalesOrderApi.updateSalesOrder(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

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
