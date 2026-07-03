<!--
  销售订单 - 工序记录弹窗
  功能：按订单→窗帘行→结构行→用料明细分层展示工序时间线
  使用方：views/zc/salesorder/index.vue
-->
<template>
  <el-dialog v-model="dialogVisible" title="工序记录" width="720px" destroy-on-close>
    <div v-loading="loading" class="min-h-80px">
      <el-empty v-if="!loading && !hasProcessRecords" description="暂无工序记录" />

      <div v-else class="flex flex-col gap-4">
        <!-- 订单级记录 -->
        <section v-if="timeline?.orderRecords?.length" class="process-section">
          <div class="process-section__title">
            <Icon icon="ep:document" class="mr-1" />
            订单级
          </div>
          <ProcessRecordTimeline :records="timeline!.orderRecords!" />
        </section>

        <!-- 窗帘行分组 -->
        <section
          v-for="curtain in timeline?.curtains"
          :key="curtain.curtainId"
          class="process-section"
        >
          <div class="process-section__title">
            <Icon icon="ep:house" class="mr-1" />
            <span>{{ curtain.curtainName || '窗帘' }}</span>
            <span v-if="curtain.room" class="text-gray-500 font-normal"> · {{ curtain.room }}</span>
          </div>

          <!-- 窗帘级记录 -->
          <ProcessRecordTimeline
            v-if="curtain.records?.length"
            :records="curtain.records"
            class="mb-3"
          />

          <!-- 结构行分组 -->
          <div
            v-for="structure in curtain.structures"
            :key="structure.structureId"
            class="process-subsection"
          >
            <div class="process-subsection__title">
              <Icon icon="ep:grid" class="mr-1" />
              {{ structure.structureName || `结构 #${structure.structureId}` }}
            </div>

            <!-- 结构级记录 -->
            <ProcessRecordTimeline
              v-if="structure.records?.length"
              :records="structure.records"
              class="mb-3"
            />

            <!-- 用料明细分组 -->
            <div
              v-for="element in structure.elements"
              :key="element.elementId"
              class="process-element"
            >
              <div class="process-element__title">
                <Icon icon="ep:box" class="mr-1" />
                {{ element.elementName || `用料 #${element.elementId}` }}
              </div>
              <ProcessRecordTimeline v-if="element.records?.length" :records="element.records" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { formatDate } from '@/utils/formatTime'
import {
  OrderProcessRecordApi,
  type ZcOrderProcessRecordRespVO,
  type ZcOrderProcessRecordTimelineRespVO
} from '@/api/zc/salesorder'
import ProcessRecordTimeline from './ProcessRecordTimeline.vue'

defineOptions({ name: 'SalesOrderProcessRecordDialog' })

const message = useMessage()

// ======================== 响应式状态 ========================
const dialogVisible = ref(false)
const loading = ref(false)
const timeline = ref<ZcOrderProcessRecordTimelineRespVO | null>(null)

/** 是否存在任意层级的工序记录 */
const hasProcessRecords = computed(() => {
  const data = timeline.value
  if (!data) return false
  if (data.orderRecords?.length) return true
  return data.curtains?.some(
    (curtain) =>
      !!curtain.records?.length ||
      curtain.structures?.some(
        (structure) =>
          !!structure.records?.length ||
          structure.elements?.some((element) => !!element.records?.length)
      )
  )
})

// ======================== 对外方法 ========================
/**
 * 打开工序记录弹窗
 * @param orderId 销售订单 ID
 */
const open = async (orderId: number) => {
  dialogVisible.value = true
  loading.value = true
  timeline.value = null
  try {
    // 含系统节点（裁剪、打包、发货）与手工配置节点
    timeline.value = await OrderProcessRecordApi.getOrderProcessRecordList({
      orderId,
      groups: '0,1'
    })
  } catch (e) {
    message.error('获取工序记录失败')
    console.error('[工序记录]', e)
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.process-section {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.process-section__title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.process-subsection {
  padding: 10px 12px;
  margin-top: 8px;
  margin-left: 8px;
  border-left: 3px solid var(--el-color-primary-light-5);
  background: var(--el-fill-color-light);
  border-radius: 0 6px 6px 0;
}

.process-subsection__title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.process-element {
  padding: 8px 10px;
  margin-top: 8px;
  margin-left: 8px;
  border-left: 2px solid var(--el-border-color);
  border-radius: 0 4px 4px 0;
}

.process-element__title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
</style>
