<!--
  首页 - 已确认订单按客户统计
  功能：按确认时间范围汇总各客户订单数、金额、已收/未收金额，以表格展示明细
  使用方：views/Home/Index.vue
-->
<template>
  <el-card shadow="never">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-8px">
        <span class="text-16px font-medium">已确认订单统计（按客户）</span>
        <div class="flex flex-wrap items-center gap-8px">
          <el-radio-group v-model="timeRangeType" @change="handleTimeRangeTypeChange">
            <el-radio-button
              v-for="item in timeRangeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="customTimes"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
            class="!w-260px"
            @change="handleCustomDateChange"
          />
        </div>
      </div>
    </template>

    <!-- KPI 汇总卡片（带图标） -->
    <div class="stat-cards mb-16px">
      <div v-for="item in summaryCards" :key="item.label" class="stat-card">
        <div class="stat-card__icon" :style="{ background: item.gradient }">
          <Icon :icon="item.icon" :size="26" />
        </div>
        <div class="min-w-0">
          <div class="stat-card__label">{{ item.label }}</div>
          <CountTo
            :end-val="item.value"
            :decimals="item.decimals"
            :duration="1200"
            class="stat-card__value"
            :style="{ color: item.color }"
          />
        </div>
      </div>
    </div>

    <!-- 客户明细表格（前端分页，默认每页 10 条） -->
    <el-table
      v-loading="loading"
      :data="paginatedList"
      stripe
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column label="排名" align="center" width="70">
        <template #default="{ $index }">{{ (pageNo - 1) * pageSize + $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="180" />
      <el-table-column label="订单数" align="center" prop="orderCount" min-width="100" />
      <el-table-column label="订单金额" align="center" prop="totalAmount" min-width="120">
        <template #default="{ row }">{{ formatAmount(row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="已收金额" align="center" prop="totalAmountReceived" min-width="120">
        <template #default="{ row }">{{ formatAmount(row.totalAmountReceived) }}</template>
      </el-table-column>
      <el-table-column label="未收金额" align="center" prop="unpaidAmount" min-width="120">
        <template #default="{ row }">
          <span :class="{ 'text-red-500': row.unpaidAmount > 0 }">
            {{ formatAmount(row.unpaidAmount) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="list.length"
      v-model:page="pageNo"
      v-model:limit="pageSize"
    />
  </el-card>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { TableColumnCtx } from 'element-plus'
import {
  SalesOrderApi,
  type ZcSalesOrderCustomerStatisticsRespVO
} from '@/api/zc/salesorder'
import { getDateRange } from '@/utils/formatTime'

defineOptions({ name: 'HomeSalesOrderStatistics' })

/** 时间范围快捷选项枚举 */
enum TimeRangeTypeEnum {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  LAST_MONTH = 'lastMonth',
  CUSTOM = 'custom'
}

/** 快捷时间范围选项 */
const timeRangeOptions = [
  { label: '当天', value: TimeRangeTypeEnum.TODAY },
  { label: '当周', value: TimeRangeTypeEnum.WEEK },
  { label: '当月', value: TimeRangeTypeEnum.MONTH },
  { label: '上个月', value: TimeRangeTypeEnum.LAST_MONTH }
]

// ======================== 响应式状态 ========================
const loading = ref(false)
const timeRangeType = ref<TimeRangeTypeEnum>(TimeRangeTypeEnum.TODAY)
/** 自定义时间范围，与 el-date-picker 双向绑定 */
const customTimes = ref<[string, string]>(getDateRange(dayjs(), dayjs()))
const list = ref<ZcSalesOrderCustomerStatisticsRespVO[]>([])
/** 前端分页参数 */
const pageNo = ref(1)
const pageSize = ref(10)

/** 当前页表格数据 */
const paginatedList = computed(() => {
  const start = (pageNo.value - 1) * pageSize.value
  return list.value.slice(start, start + pageSize.value)
})

/** KPI 汇总：由列表数据聚合得出 */
const summary = computed(() => {
  const totalOrderCount = list.value.reduce((sum, item) => sum + (item.orderCount || 0), 0)
  const totalAmount = list.value.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  const totalAmountReceived = list.value.reduce(
    (sum, item) => sum + (item.totalAmountReceived || 0),
    0
  )
  const unpaidAmount = list.value.reduce((sum, item) => sum + (item.unpaidAmount || 0), 0)
  return {
    totalOrderCount,
    totalAmount,
    totalAmountReceived,
    unpaidAmount,
    customerCount: list.value.length
  }
})

/** KPI 卡片配置 */
const summaryCards = computed(() => [
  {
    label: '订单总数',
    value: summary.value.totalOrderCount,
    decimals: 0,
    icon: 'ep:document',
    color: '#409eff',
    gradient: 'linear-gradient(135deg, #409eff, #66b1ff)'
  },
  {
    label: '订单总金额',
    value: summary.value.totalAmount,
    decimals: 2,
    icon: 'ep:wallet',
    color: '#67c23a',
    gradient: 'linear-gradient(135deg, #67c23a, #85ce61)'
  },
  {
    label: '已收金额',
    value: summary.value.totalAmountReceived,
    decimals: 2,
    icon: 'ep:circle-check',
    color: '#13c2c2',
    gradient: 'linear-gradient(135deg, #13c2c2, #36cfc9)'
  },
  {
    label: '未收金额',
    value: summary.value.unpaidAmount,
    decimals: 2,
    icon: 'ep:warning',
    color: '#f56c6c',
    gradient: 'linear-gradient(135deg, #f56c6c, #f89898)'
  },
  {
    label: '客户数',
    value: summary.value.customerCount,
    decimals: 0,
    icon: 'ep:user',
    color: '#e6a23c',
    gradient: 'linear-gradient(135deg, #e6a23c, #ebb563)'
  }
])

// ======================== 生命周期 ========================
onMounted(() => {
  loadData()
})

// ======================== 数据获取 ========================
/** 根据快捷选项计算确认时间范围 */
const resolveConfirmTimeRange = (type: TimeRangeTypeEnum): [string, string] => {
  const now = dayjs()
  switch (type) {
    case TimeRangeTypeEnum.WEEK:
      return getDateRange(now.startOf('week'), now.endOf('week'))
    case TimeRangeTypeEnum.MONTH:
      return getDateRange(now.startOf('month'), now.endOf('month'))
    case TimeRangeTypeEnum.LAST_MONTH: {
      const lastMonth = now.subtract(1, 'month')
      return getDateRange(lastMonth.startOf('month'), lastMonth.endOf('month'))
    }
    case TimeRangeTypeEnum.CUSTOM:
      return customTimes.value
    case TimeRangeTypeEnum.TODAY:
    default:
      return getDateRange(now, now)
  }
}

/** 加载按客户统计数据 */
const loadData = async () => {
  loading.value = true
  try {
    const confirmTime = resolveConfirmTimeRange(timeRangeType.value)
    list.value = await SalesOrderApi.getCustomerStatistics(confirmTime)
    pageNo.value = 1
  } finally {
    loading.value = false
  }
}

// ======================== 事件处理 ========================
/** 快捷时间范围切换：同步日期选择器并刷新数据 */
const handleTimeRangeTypeChange = () => {
  if (timeRangeType.value !== TimeRangeTypeEnum.CUSTOM) {
    customTimes.value = resolveConfirmTimeRange(timeRangeType.value)
  }
  loadData()
}

/** 自定义日期范围变更：切换为自定义模式并刷新数据 */
const handleCustomDateChange = (value: [string, string] | null) => {
  if (!value || value.length !== 2) {
    return
  }
  timeRangeType.value = TimeRangeTypeEnum.CUSTOM
  customTimes.value = value
  loadData()
}

/** 表格合计行 */
const getSummaries = (param: { columns: TableColumnCtx<ZcSalesOrderCustomerStatisticsRespVO>[] }) => {
  const { columns } = param
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (index === 1) {
      sums[index] = `${summary.value.customerCount} 个客户`
      return
    }
    if (column.property === 'orderCount') {
      sums[index] = String(summary.value.totalOrderCount)
      return
    }
    if (column.property === 'totalAmount') {
      sums[index] = formatAmount(summary.value.totalAmount)
      return
    }
    if (column.property === 'totalAmountReceived') {
      sums[index] = formatAmount(summary.value.totalAmountReceived)
      return
    }
    if (column.property === 'unpaidAmount') {
      sums[index] = formatAmount(summary.value.unpaidAmount)
      return
    }
    sums[index] = ''
  })
  return sums
}

/** 金额格式化，保留两位小数 */
const formatAmount = (amount: number | undefined) => {
  if (amount == null) {
    return '-'
  }
  return amount.toFixed(2)
}
</script>

<style lang="scss" scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    color: #fff;
  }

  &__label {
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
  }
}
</style>
