<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%" top="3vh">
    <!-- 顶部操作栏 -->
    <div class="mb-12px flex items-center gap-8px border-b border-gray-200 pb-12px">
      <el-button type="primary" @click="handleSave" :loading="formLoading">
        <Icon icon="ep:finished" class="mr-4px" />保存
      </el-button>
      <!-- 确认订单按钮：仅对已保存的订单（有 id）显示 -->
      <el-button v-if="formData.id" type="success" @click="handleConfirm" :loading="formLoading">
        <Icon icon="ep:circle-check" class="mr-4px" />确认订单
      </el-button>
      <el-button type="warning" @click="handleExpedite" :disabled="!formData.id || formLoading">
        <Icon icon="ep:timer" class="mr-4px" />加急
      </el-button>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <!-- 第一行：订单号、客户、手机、下单日期 -->
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="订单号" prop="orderNo">
            <!-- 订单号由后端自动生成，前端只读展示，创建和编辑均不可修改 -->
            <el-input v-model="formData.orderNo" disabled placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="客户" prop="customerId">
            <el-select v-model="formData.customerId" clearable placeholder="请选择客户" class="w-1/1" @change="handleCustomerChange">
              <el-option
                v-for="item in props.customersList"
                :key="item.id"
                :label="`${item.shortName}/${item.contactName}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入手机" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="下单日期" prop="orderDate">
            <el-date-picker
              v-model="formData.orderDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择下单日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item label="品牌" prop="brandId">
            <el-select v-model="formData.brandId" clearable placeholder="请选择品牌" class="w-1/1">
              <el-option
                v-for="item in props.brandsList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行：物流、收货人、送货地址 -->
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="物流" prop="logisticId">
            <el-select v-model="formData.logisticId" clearable placeholder="请选择物流" class="w-1/1">
              <el-option
                v-for="item in props.logisticsList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
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
          <el-form-item label="交付日期" prop="deliveryDate">
            <el-date-picker
              v-model="formData.deliveryDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择交付日期"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行：运费、优惠金额、金额、账户余额 / 品牌、交付日期、备注 -->
      <el-row :gutter="16">
        <el-col :span="4">
          <el-form-item label="运费" prop="freight">
            <el-input-number v-model="formData.freight" placeholder="请输入运费" :controls="false" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="优惠金额" prop="discountAmount">
            <el-input-number v-model="formData.discountAmount" placeholder="请输入优惠金额" :controls="false" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="金额" prop="amount">
            <el-input v-model="formData.amount" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="账户余额">
            <span class="text-sm font-medium" :class="selectedCustomerBalance < 0 ? 'text-red-500' : 'text-gray-700'">
              {{ selectedCustomerBalance != null ? selectedCustomerBalance : '-' }}
            </span>
          </el-form-item>
        </el-col>


        <el-col :span="8">
          <el-form-item label="备注" prop="note">
            <el-input v-model="formData.note" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-divider content-position="left">窗帘列表</el-divider>
    <el-button type="primary" link class="mb-8px" @click="addCurtain">+ 添加窗帘</el-button>
    <div style="max-height: 65vh; overflow-y: auto; padding-right: 4px">
      <el-card
        v-for="(curtain, idx) in formData.curtains"
        :key="idx"
        class="mt-8px"
        shadow="never"
        :style="{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: curtainColors[idx % curtainColors.length] }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold">窗帘 #{{ idx + 1 }}</span>
            <el-button link type="danger" @click="removeCurtain(idx)">删除</el-button>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="3">
            <el-form-item label="款式">
              <el-select
                v-model="curtain.curtainId"
                clearable
                placeholder="请选择款式"
                class="w-1/1"
                @change="(val) => handleCurtainChange(curtain, val)"
              >
                <el-option
                  v-for="item in curtainList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="房间">
              <el-input v-model="curtain.room" placeholder="请输入房间" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="褶倍">
              <el-select v-model="curtain.pleatRatioValue" clearable placeholder="请选择褶倍" class="w-1/1">
                <el-option
                  v-for="item in pleatRatioList"
                  :key="item.id"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="褶距">
              <el-input-number v-model="curtain.pleatsDistance" placeholder="请输入褶距" :controls="false" class="!w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="折扣率">
              <el-input-number v-model="curtain.discountRate" placeholder="请输入折扣率" :controls="false" class="!w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="金额">
              <!-- 金额 = 所有结构用料小计之和 × 折扣率，自动计算，禁止手动编辑 -->
              <el-input-number v-model="curtain.amount" placeholder="金额" :controls="false" class="!w-full" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="备注">
              <el-input v-model="curtain.note" placeholder="请输入备注"  :rows="1" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="图片1">
              <UploadImg v-model="curtain.image1" width="90px" height="90px" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="图片2">
              <UploadImg v-model="curtain.image2" width="90px" height="90px" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="配件">
              <el-select v-model="curtain.mountings" multiple clearable placeholder="请选择配件" class="w-1/1">
                <el-option
                  v-for="dict in getStrDictOptions(DICT_TYPE.ZC_CURTAIN_MOUNTINGS)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">结构列表</el-divider>
        <div v-loading="curtain.templateLoading" element-loading-text="正在加载款式模板..." style="min-height: 60px">
        <el-button type="primary" link class="mb-8px" @click="addStructure(curtain)">+ 添加结构</el-button>
        <div
          v-for="(structure, sIdx) in curtain.structures"
          :key="sIdx"
          class="mt-8px border border-solid border-gray-200 rounded p-12px"
        >
          <div class="flex justify-between items-center mb-8px">
            <span class="text-sm font-semibold text-gray-700">结构 #{{ sIdx + 1 }}</span>
            <el-button link type="danger" @click="removeStructure(curtain, sIdx)">删除</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="3">
              <el-form-item label="结构">
                <el-select v-model="structure.structureId" clearable placeholder="请选择结构" class="w-1/1">
                  <el-option
                    v-for="item in curtainStructureList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label="高">
                <el-input-number v-model="structure.height" placeholder="高" :controls="false" class="!w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label="宽">
                <el-input-number v-model="structure.width" placeholder="宽" :controls="false" class="!w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'leftCorner')">
              <el-form-item label="左转角">
                <el-input v-model="structure.leftCorner" placeholder="左转角" />
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'rightCorner')">
              <el-form-item label="右转角">
                <el-input v-model="structure.rightCorner" placeholder="右转角" />
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'pasteDirection')">
              <el-form-item label="粘贴方向">
                <el-select v-model="structure.pasteDirection" clearable placeholder="请选择粘贴方向" class="w-1/1">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.ZC_PASTE_DIRECTION)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'installProcessId')">
              <el-form-item label="安装工艺">
                <el-select v-model="structure.installProcessId" clearable placeholder="请选择安装工艺" class="w-1/1">
                  <el-option
                    v-for="item in props.installProcessList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'openMethod')">
              <el-form-item label="打开方式">
                <el-select v-model="structure.openMethod" clearable placeholder="请选择打开方式" class="w-1/1">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.ZC_OPEN_METHOD)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'processType')">
              <el-form-item label="加工类型">
                <el-select v-model="structure.processType" clearable placeholder="请选择加工类型" class="w-1/1">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.ZC_PROCESS_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'isShaping')">
              <el-form-item label="是否定型">
                <el-input v-model="structure.isShaping" placeholder="是否定型" />
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'pleatsNum')">
              <el-form-item label="总褶数">
                <el-input-number v-model="structure.pleatsNum" placeholder="总褶数" :controls="false" class="!w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'pleatsDistance')">
              <el-form-item label="褶距">
                <el-input-number v-model="structure.pleatsDistance" placeholder="褶距" :controls="false" class="!w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="hasAttr(structure.structureId, 'skirtHeight')">
              <el-form-item label="裙摆高度">
                <el-input-number v-model="structure.skirtHeight" placeholder="裙摆高度" :controls="false" class="!w-full" />
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
              <span class="text-sm font-medium text-gray-600 mr-8px">用料列表</span>
              <el-button type="primary" link @click="addMaterial(structure)">+ 添加用料</el-button>
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
                  <el-select v-model="material.elementId" clearable placeholder="组件类型" size="small" class="w-1/1">
                    <el-option
                      v-for="item in curtainStructureElementList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-col>
                <el-col :span="3">
                  <!-- 显示产品名称，回车或双击打开批次选择弹窗 -->
                  <div @dblclick="batchSelectRef?.open(material, formData.customerId)">
                    <el-input
                      v-model="material.productName"
                      placeholder="货号(回车/双击选择)"
                      size="small"
                      class="!w-full"
                      readonly
                      @keyup.enter="batchSelectRef?.open(material, formData.customerId)"
                    />
                  </div>
                </el-col>
                <el-col :span="3">
                  <!-- 显示批次号，回车或双击打开批次选择弹窗 -->
                  <div @dblclick="batchSelectRef?.open(material, formData.customerId)">
                    <el-input
                      v-model="material.batchNo"
                      placeholder="批次(回车/双击选择)"
                      size="small"
                      class="!w-full"
                      readonly
                      @keyup.enter="batchSelectRef?.open(material, formData.customerId)"
                    />
                  </div>
                </el-col>
                <el-col :span="2">
                  <el-input-number v-model="material.price" placeholder="单价" size="small" :controls="false" class="!w-full" />
                </el-col>
                <el-col :span="2">
                  <el-input-number v-model="material.quantity" placeholder="用料" size="small" :controls="false" class="!w-full" />
                </el-col>
                <el-col :span="2">
                  <el-select v-model="material.unitValue" clearable placeholder="单位" size="small" class="w-1/1">
                    <el-option
                      v-for="dict in getStrDictOptions(DICT_TYPE.ZC_PRODUCT_UNIT)"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-col>
                <el-col :span="2">
                  <el-input-number v-model="material.discountRate" placeholder="折扣率" size="small" :controls="false" class="!w-full" />
                </el-col>
                <el-col :span="2">
                  <!-- 小计由单价×用料×折扣率自动计算，禁止手动编辑 -->
                  <el-input-number v-model="material.amount" placeholder="小计" size="small" :controls="false" class="!w-full" disabled />
                </el-col>
                <el-col :span="4">
                  <el-input v-model="material.note" placeholder="备注" size="small" />
                </el-col>
              </el-row>
            </template>
          </div>
        </div>
        </div>
      </el-card>
    </div>
    <!-- 批次选择弹窗 -->
    <ProductBatchSelectDialog ref="batchSelectRef" />
  </Dialog>
</template>

<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { SalesOrderApi, SalesOrder, SalesOrderCurtain, SalesOrderStructure, ZCSalesOrderMaterial, SalesOrderDetailCurtain } from '@/api/zc/salesorder'
import { CustomerSimpleVO } from '@/api/zc/customer'
import { BrandSimpleVO } from '@/api/zc/brand'
import { LogisticsSimpleVO } from '@/api/zc/logistics'
import { CurtainApi, CurtainSimpleVO } from '@/api/zc/curtain'
import { CurtainPleatRatioApi, CurtainPleatRatioSimpleVO } from '@/api/zc/curtainpleatratio'
import { CurtainStructureApi, CurtainStructureSimpleVO } from '@/api/zc/curtainstructure'
import { CurtainStructureElementApi, CurtainStructureElementSimpleVO } from '@/api/zc/curtainstructureelement'
import { CurtainInstallProcessSimpleVO } from '@/api/zc/curtaininstallprocess'
import ProductBatchSelectDialog from './ProductBatchSelectDialog.vue'

/** 销售订单 表单 */
defineOptions({ name: 'SalesOrderForm' })

const props = defineProps<{ customersList: CustomerSimpleVO[]; brandsList: BrandSimpleVO[]; logisticsList: LogisticsSimpleVO[]; installProcessList: CurtainInstallProcessSimpleVO[] }>()

const selectedCustomerBalance = ref<number | null>(null)

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const handleCustomerChange = (customerId: number) => {
  const customer = props.customersList.find((item) => item.id === customerId)
  if (!customer) {
    selectedCustomerBalance.value = null
    return
  }
  formData.value.mobile = customer.mobile
  formData.value.brandId = customer.brandId
  formData.value.logisticId = customer.logisticId
  formData.value.receiver = customer.contactName
  formData.value.deliveryAddress = customer.deliveryAddress
  selectedCustomerBalance.value = customer.balance
}

const curtainList = ref<CurtainSimpleVO[]>([])
const pleatRatioList = ref<CurtainPleatRatioSimpleVO[]>([])
const curtainStructureList = ref<CurtainStructureSimpleVO[]>([])
const curtainStructureElementList = ref<CurtainStructureElementSimpleVO[]>([])
const hasAttr = (structureId: number | undefined, attr: string) => {
  if (!structureId) return false
  const found = curtainStructureList.value.find((s) => s.id === structureId)
  return found ? found.attributes.includes(attr) : false
}

const handleCurtainChange = async (curtain: CurtainWithStructures, curtainId: number) => {
  const selected = curtainList.value.find((item) => item.id === curtainId)
  if (selected) {
    curtain.pleatRatioValue = selected.pleatRatioValue as any
    curtain.pleatsDistance = selected.pleatsDistance as any
  }
  if (!curtainId) {
    curtain.structures = []
    return
  }
  curtain.templateLoading = true
  try {
    const template = await CurtainApi.getCurtainTemplateByCurtainId(curtainId)
    if (template?.structures?.length) {
      curtain.structures = template.structures.map((tmpl) => ({
        structureId: tmpl.structureId,
        height: undefined,
        width: undefined,
        leftCorner: undefined,
        rightCorner: undefined,
        pasteDirection: undefined,
        installProcessId: undefined,
        openMethod: undefined,
        processType: undefined,
        isShaping: undefined,
        pleatsNum: undefined,
        pleatsDistance: undefined,
        skirtHeight: undefined,
        note: undefined,
        materials: tmpl.elementIds.map((elem) => ({
          elementId: elem.elementId,
          productId: undefined,
          batchId: undefined,
          price: undefined,
          quantity: undefined,
          unitValue: undefined,
          discountRate: undefined,
          amount: undefined,
          note: undefined
        }))
      }))
    }
  } catch (_) {
  } finally {
    curtain.templateLoading = false
  }
}

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
type StructureWithMaterials = SalesOrderStructure & { materials: ZCSalesOrderMaterial[] }
type CurtainWithStructures = SalesOrderCurtain & { structures: StructureWithMaterials[]; templateLoading?: boolean }

const getInitFormData = (): SalesOrder & { curtains: CurtainWithStructures[] } => ({
  id: undefined,
  orderNo: undefined,
  customerId: undefined,
  mobile: undefined,
  brandId: undefined,
  orderDate: todayStr() as any,
  logisticId: undefined,
  receiver: undefined,
  deliveryAddress: undefined,
  freight: undefined,
  types: 'chengpin',
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

const formData = ref(getInitFormData())

const formRules = {
  customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
  orderDate: [{ required: true, message: '下单日期不能为空', trigger: 'blur' }],
  deliveryAddress: [{ required: true, message: '送货地址不能为空', trigger: 'blur' }],
  types: [{ required: true, message: '订单类型不能为空', trigger: 'blur' }],
  payStatus: [{ required: true, message: '结算状态不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  isExpedited: [{ required: true, message: '是否加急不能为空', trigger: 'blur' }]
}

const formRef = ref()
const batchSelectRef = ref<InstanceType<typeof ProductBatchSelectDialog>>()
const curtainColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#1ABC9C', '#E67E22']

/**
 * mountings 后端以 JSON 字符串存储（如 "[\"加铅块\"]"），
 * 前端 el-select multiple 需要 string[]，做一次安全 parse
 */
const parseMountings = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw !== 'string' || !raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 将后端 detail 接口返回的 curtains 转换为表单内部结构：
 * - mountings: JSON 字符串 → string[]
 * - 补充 templateLoading 等仅前端使用的内部字段
 */
const transformDetailCurtains = (
  details: SalesOrderDetailCurtain[] | undefined
): CurtainWithStructures[] => {
  if (!details?.length) return []
  return details.map((c) => ({
    id: c.id,
    orderId: c.orderId,
    curtainId: c.curtainId,
    room: c.room,
    pleatRatioValue: c.pleatRatioValue,
    pleatsDistance: c.pleatsDistance,
    discountRate: c.discountRate,
    amount: c.amount,
    image1: c.image1,
    image2: c.image2,
    mountings: parseMountings(c.mountings),
    note: c.note,
    curtainName: c.curtainName,
    templateLoading: false,
    structures: (c.structures ?? []).map((s) => ({
      id: s.id,
      orderId: s.orderId,
      orderCurtainId: s.orderCurtainId,
      structureId: s.structureId,
      height: s.height,
      width: s.width,
      leftCorner: s.leftCorner,
      rightCorner: s.rightCorner,
      pasteDirection: s.pasteDirection,
      installProcessId: s.installProcessId,
      openMethod: s.openMethod,
      processType: s.processType,
      isShaping: s.isShaping,
      pleatsNum: s.pleatsNum,
      pleatsDistance: s.pleatsDistance,
      skirtHeight: s.skirtHeight,
      note: s.note,
      structureName: s.structureName,
      installProcessName: s.installProcessName,
      materials: (s.materials ?? []).map((m) => ({ ...m }))
    }))
  }))
}

/** 挂载时一次性加载不常变动的基础配置数据 */
onMounted(async () => {
  ;[
    curtainList.value,
    pleatRatioList.value,
    curtainStructureList.value,
    curtainStructureElementList.value
  ] = await Promise.all([
    CurtainApi.getCurtainSimpleList(),
    CurtainPleatRatioApi.getCurtainPleatRatioSimpleList(),
    CurtainStructureApi.getCurtainStructureSimpleList(),
    CurtainStructureElementApi.getCurtainStructureElementSimpleList()
  ])
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 编辑模式：并发拉取订单基础信息 + 三层明细，回填到表单
  if (id) {
    formLoading.value = true
    try {
      const [order, details] = await Promise.all([
        SalesOrderApi.getSalesOrder(id),
        SalesOrderApi.getSalesOrderDetail(id)
      ])
      formData.value = {
        ...(order as SalesOrder),
        curtains: transformDetailCurtains(details)
      }
      // 同步客户余额展示（编辑模式下也需要显示）
      if (order?.customerId) {
        const customer = props.customersList.find((item) => item.id === order.customerId)
        selectedCustomerBalance.value = customer?.balance ?? null
      }
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
    pleatsDistance: undefined,
    discountRate: undefined,
    amount: undefined,
    image1: undefined,
    image2: undefined,
    mountings: undefined,
    note: undefined,
    structures: [],
    templateLoading: false
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
    isShaping: undefined,
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

/** 四舍五入保留两位小数 */
const round2 = (val: number) => Math.round(val * 100) / 100

/**
 * 监听整个表单变化，自动计算：
 * 1. 用料小计 = 单价 × 用料 × 折扣率（折扣率无值时默认 1），保留两位小数
 * 2. 窗帘金额 = 所有结构中用料小计之和 × 窗帘折扣率，保留两位小数
 * 3. 订单金额 = 所有窗帘金额之和 + 运费 - 优惠金额，保留两位小数
 */
watch(
  () => formData.value,
  (form) => {
    let orderTotal = 0
    form.curtains.forEach((curtain) => {
      let curtainTotal = 0
      curtain.structures.forEach((structure) => {
        structure.materials.forEach((material) => {
          // 单价或用料有值时才计算，避免全空时显示 0
          material.amount =
            material.price != null || material.quantity != null
              ? round2((material.price ?? 0) * (material.quantity ?? 0) * (material.discountRate ?? 1))
              : undefined
          curtainTotal += material.amount ?? 0
        })
      })
      // 窗帘金额 = 所有用料小计之和 × 窗帘折扣率
      curtain.amount = curtainTotal > 0 ? round2(curtainTotal * (curtain.discountRate ?? 1)) : undefined
      orderTotal += curtain.amount ?? 0
    })
    // 订单金额 = 所有窗帘金额之和 + 运费 - 优惠金额
    form.amount = round2(orderTotal + (form.freight ?? 0) - (form.discountAmount ?? 0)) as any
  },
  { deep: true }
)

defineExpose({ open })

const emit = defineEmits(['success'])

const handleSave = async () => {
  await submitForm()
}

const handleConfirm = async () => {
  formLoading.value = true
  try {
    // 调用专用确认接口，后端负责状态流转（unconfirmed → confirmed）并扣减客户余额
    await SalesOrderApi.confirmSalesOrder(formData.value.id!)
    message.success('确认订单成功')
    dialogVisible.value = false
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


const submitForm = async () => {
  await formRef.value.validate()
  // 至少需要一个窗帘才能保存
  if (!formData.value.curtains || formData.value.curtains.length === 0) {
    message.warning('请至少添加一个窗帘')
    return
  }
  // 每个窗帘明细必须选择窗帘（curtainId 不能为空）
  const emptyCurtainIndex = formData.value.curtains.findIndex((c) => !c.curtainId)
  if (emptyCurtainIndex !== -1) {
    message.warning(`第 ${emptyCurtainIndex + 1} 个窗帘明细未选择窗帘，请先选择窗帘`)
    return
  }
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
  formData.value = getInitFormData()
  selectedCustomerBalance.value = null
  formRef.value?.resetFields()
}
</script>
