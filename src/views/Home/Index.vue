<template>
  <div>
    <el-card shadow="never">
      <el-skeleton :loading="loading" animated>
        <el-row :gutter="16" justify="space-between">
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex items-center">
              <el-avatar :src="avatar" :size="70" class="mr-16px">
                <img src="@/assets/imgs/avatar.gif" alt="" />
              </el-avatar>
              <div>
                <div class="text-20px">
                  {{ t('workplace.welcome') }} {{ username }} {{ t('workplace.happyDay') }}
                </div>
                <div class="mt-10px text-14px text-gray-500">
                  {{ t('workplace.toady') }}，20℃ - 32℃！
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-skeleton>
    </el-card>
  </div>

  <!-- 快捷入口：独占一整行 -->
  <el-row class="mt-8px" :gutter="8">
    <el-col :span="24" class="mb-8px">
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-16px font-medium">{{ t('workplace.shortcutOperation') }}</span>
          </div>
        </template>
        <el-skeleton :loading="loading" animated>
          <el-row :gutter="16">
            <el-col
              v-for="item in shortcut"
              :key="`shortcut-${item.name}`"
              :xl="4" :lg="4" :md="8" :sm="8" :xs="12"
              class="mb-8px"
            >
              <div
                class="flex flex-col items-center justify-center py-36px cursor-pointer rounded-8px hover:bg-gray-50 transition-all"
                @click="handleShortcutClick(item.url)"
              >
                <Icon :icon="item.icon" :size="72" :style="{ color: item.color }" class="mb-16px" />
                <span class="text-24px text-gray-700">{{ item.name }}</span>
              </div>
            </el-col>
          </el-row>
        </el-skeleton>
      </el-card>
    </el-col>
  </el-row>

  <!-- 图表区域 -->
  <el-row class="mt-8px" :gutter="8">
    <el-col :span="24" class="mb-8px">
      <el-card shadow="never">
        <el-skeleton :loading="loading" animated>
          <el-row :gutter="20" justify="space-between">
            <el-col :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
              <el-card shadow="hover" class="mb-8px">
                <el-skeleton :loading="loading" animated>
                  <Echart :options="pieOptionsData" :height="280" />
                </el-skeleton>
              </el-card>
            </el-col>
            <el-col :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
              <el-card shadow="hover" class="mb-8px">
                <el-skeleton :loading="loading" animated>
                  <Echart :options="barOptionsData" :height="280" />
                </el-skeleton>
              </el-card>
            </el-col>
          </el-row>
        </el-skeleton>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { useUserStore } from '@/store/modules/user'
import type { Shortcut } from './types'
import { pieOptions, barOptions } from './echarts-data'
import { useRouter } from 'vue-router'

defineOptions({ name: 'Index' })

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
// const { setWatermark } = useWatermark()
const loading = ref(true)
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
// 获取快捷入口
let shortcut = reactive<Shortcut[]>([])

const getShortcut = async () => {
  const data = [
    {
      name: '首页',
      icon: 'ion:home-outline',
      url: '/',
      color: '#1fdaca'
    },
    {
      name: '商城中心',
      icon: 'ep:shop',
      url: '/mall/home',
      color: '#ff6b6b'
    },
    {
      name: 'AI 大模型',
      icon: 'tabler:ai',
      url: '/ai/chat',
      color: '#7c3aed'
    },
    {
      name: 'ERP 系统',
      icon: 'simple-icons:erpnext',
      url: '/erp/home',
      color: '#3fb27f'
    },
    {
      name: 'CRM 系统',
      icon: 'simple-icons:civicrm',
      url: '/crm/backlog',
      color: '#4daf1bc9'
    },
    {
      name: 'IoT 物联网',
      icon: 'fa-solid:hdd',
      url: '/iot/home',
      color: '#1a73e8'
    }
  ]
  shortcut = Object.assign(shortcut, data)
}

// 用户来源
const getUserAccessSource = async () => {
  const data = [
    { value: 335, name: 'analysis.directAccess' },
    { value: 310, name: 'analysis.mailMarketing' },
    { value: 234, name: 'analysis.allianceAdvertising' },
    { value: 135, name: 'analysis.videoAdvertising' },
    { value: 1548, name: 'analysis.searchEngines' }
  ]
  set(
    pieOptionsData,
    'legend.data',
    data.map((v) => t(v.name))
  )
  pieOptionsData!.series![0].data = data.map((v) => {
    return {
      name: t(v.name),
      value: v.value
    }
  })
}
const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

// 周活跃量
const getWeeklyUserActivity = async () => {
  const data = [
    { value: 13253, name: 'analysis.monday' },
    { value: 34235, name: 'analysis.tuesday' },
    { value: 26321, name: 'analysis.wednesday' },
    { value: 12340, name: 'analysis.thursday' },
    { value: 24643, name: 'analysis.friday' },
    { value: 1322, name: 'analysis.saturday' },
    { value: 1324, name: 'analysis.sunday' }
  ]
  set(
    barOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(barOptionsData, 'series', [
    {
      name: t('analysis.activeQuantity'),
      data: data.map((v) => v.value),
      type: 'bar'
    }
  ])
}

const getAllApi = async () => {
  await Promise.all([getShortcut(), getUserAccessSource(), getWeeklyUserActivity()])
  loading.value = false
}

const handleShortcutClick = (url: string) => {
  router.push(url)
}

getAllApi()
</script>
