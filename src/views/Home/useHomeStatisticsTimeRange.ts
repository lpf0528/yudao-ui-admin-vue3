import dayjs from 'dayjs'
import { getDateRange } from '@/utils/formatTime'

/** 首页统计时间范围快捷选项枚举 */
export enum HomeStatisticsTimeRangeTypeEnum {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  WEEK = 'week',
  MONTH = 'month',
  LAST_MONTH = 'lastMonth',
  CUSTOM = 'custom'
}

/** 快捷时间范围选项 */
export const homeStatisticsTimeRangeOptions = [
  { label: '当天', value: HomeStatisticsTimeRangeTypeEnum.TODAY },
  { label: '昨日', value: HomeStatisticsTimeRangeTypeEnum.YESTERDAY },
  { label: '当周', value: HomeStatisticsTimeRangeTypeEnum.WEEK },
  { label: '当月', value: HomeStatisticsTimeRangeTypeEnum.MONTH },
  { label: '上个月', value: HomeStatisticsTimeRangeTypeEnum.LAST_MONTH }
]

/**
 * 首页统计共用时间范围筛选
 * 供订单统计、用料统计等模块统一使用，避免各组件重复维护时间逻辑
 */
export const useHomeStatisticsTimeRange = () => {
  const timeRangeType = ref<HomeStatisticsTimeRangeTypeEnum>(
    HomeStatisticsTimeRangeTypeEnum.TODAY
  )
  /** 自定义时间范围，与 el-date-picker 双向绑定 */
  const customTimes = ref<[string, string]>(getDateRange(dayjs(), dayjs()))

  /** 根据快捷选项计算确认时间范围 */
  const resolveConfirmTimeRange = (
    type: HomeStatisticsTimeRangeTypeEnum
  ): [string, string] => {
    const now = dayjs()
    switch (type) {
      case HomeStatisticsTimeRangeTypeEnum.YESTERDAY: {
        const yesterday = now.subtract(1, 'day')
        return getDateRange(yesterday, yesterday)
      }
      case HomeStatisticsTimeRangeTypeEnum.WEEK:
        return getDateRange(now.startOf('week'), now.endOf('week'))
      case HomeStatisticsTimeRangeTypeEnum.MONTH:
        return getDateRange(now.startOf('month'), now.endOf('month'))
      case HomeStatisticsTimeRangeTypeEnum.LAST_MONTH: {
        const lastMonth = now.subtract(1, 'month')
        return getDateRange(lastMonth.startOf('month'), lastMonth.endOf('month'))
      }
      case HomeStatisticsTimeRangeTypeEnum.CUSTOM:
        return customTimes.value
      case HomeStatisticsTimeRangeTypeEnum.TODAY:
      default:
        return getDateRange(now, now)
    }
  }

  /** 当前生效的确认时间范围，传给各统计子组件 */
  const confirmTime = computed<[string, string]>(() =>
    resolveConfirmTimeRange(timeRangeType.value)
  )

  /** 快捷时间范围切换：同步日期选择器 */
  const handleTimeRangeTypeChange = () => {
    if (timeRangeType.value !== HomeStatisticsTimeRangeTypeEnum.CUSTOM) {
      customTimes.value = resolveConfirmTimeRange(timeRangeType.value)
    }
  }

  /** 自定义日期范围变更：切换为自定义模式 */
  const handleCustomDateChange = (value: [string, string] | null) => {
    if (!value || value.length !== 2) {
      return
    }
    timeRangeType.value = HomeStatisticsTimeRangeTypeEnum.CUSTOM
    customTimes.value = value
  }

  return {
    timeRangeType,
    customTimes,
    confirmTime,
    handleTimeRangeTypeChange,
    handleCustomDateChange
  }
}
