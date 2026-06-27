<!--
  首页 - 订单用料统计
  功能：按确认时间范围、产品规格汇总用料数量，以柱状图展示
  使用方：views/Home/Index.vue
-->
<template>
  <el-card shadow="never">
    <template #header>
      <span class="text-16px font-medium">订单用料统计</span>
    </template>

    <el-skeleton :loading="loading" animated>
      <el-empty v-if="!loading && list.length === 0" description="暂无统计数据" />
      <Echart v-else :options="barOptions" :height="chartHeight" />
    </el-skeleton>
  </el-card>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import {
  SalesOrderApi,
  type ZcSalesOrderMaterialProductStatisticsRespVO
} from '@/api/zc/salesorder'

defineOptions({ name: 'HomeMaterialStatistics' })

// ======================== Props ========================
/** 确认时间范围，由父组件 Index.vue 统一筛选后传入 */
const props = defineProps<{
  confirmTime: [string, string]
}>()

// ======================== 响应式状态 ========================
const loading = ref(false)
const list = ref<ZcSalesOrderMaterialProductStatisticsRespVO[]>([])

/** 图表高度：数据较多时适当加高 */
const chartHeight = computed(() => {
  const count = list.value.length
  if (count <= 8) return 360
  if (count <= 15) return 420
  return 480
})

/** 产品规格展示标签 */
const buildProductLabel = (item: ZcSalesOrderMaterialProductStatisticsRespVO) => {
  const name = item.productName || `货号#${item.productId}`
  return item.spec ? `${name} / ${item.spec}` : name
}

/** 柱状图配置 */
const barOptions = computed<EChartsOption>(() => {
  const sortedList = [...list.value].sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
  const labels = sortedList.map(buildProductLabel)
  const needDataZoom = sortedList.length > 10

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = Array.isArray(params) ? params[0] : params
        const item = sortedList[param.dataIndex]
        if (!item) return ''
        return [
          `产品：${item.productName || '-'}`,
          `规格：${item.spec || '-'}`,
          `数量：${formatQuantity(item.quantity)} ${item.unitValue || ''}`
        ].join('<br/>')
      }
    },
    grid: {
      left: 20,
      right: 20,
      top: 40,
      bottom: needDataZoom ? 80 : 50,
      containLabel: true
    },
    dataZoom: needDataZoom
      ? [
          {
            type: 'slider',
            xAxisIndex: 0,
            start: 0,
            end: Math.min(100, Math.round((10 / sortedList.length) * 100))
          }
        ]
      : undefined,
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        interval: 0,
        rotate: labels.length > 6 ? 30 : 0,
        width: 100,
        overflow: 'truncate'
      }
    },
    yAxis: {
      type: 'value',
      name: '用料数量'
    },
    series: [
      {
        name: '用料数量',
        type: 'bar',
        data: sortedList.map((item) => item.quantity || 0),
        barMaxWidth: 48,
        itemStyle: {
          color: '#409eff',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
})

// ======================== 数据获取 ========================
const loadData = async () => {
  loading.value = true
  try {
    list.value = await SalesOrderApi.getMaterialProductStatistics(props.confirmTime)
  } finally {
    loading.value = false
  }
}

// 父组件时间范围变更时同步刷新
watch(() => props.confirmTime, loadData, { immediate: true, deep: true })

// ======================== 事件处理 ========================

const formatQuantity = (quantity: number | undefined) => {
  if (quantity == null) {
    return '-'
  }
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2)
}
</script>
