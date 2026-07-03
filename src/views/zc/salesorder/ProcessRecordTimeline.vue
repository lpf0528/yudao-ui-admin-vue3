<!--
  销售订单 - 工序记录时间线
  功能：渲染单条工序记录列表（同节点多条记录以列表展示）
  使用方：SalesOrderProcessRecordDialog.vue
-->
<template>
  <el-timeline class="process-record-timeline">
    <el-timeline-item
      v-for="record in records"
      :key="record.id"
      :timestamp="formatProcessRecordTime(record.createTime)"
      placement="top"
      :type="record.status === 2 ? 'danger' : 'success'"
    >
      <el-card shadow="never" class="!border-gray-200">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <el-tag :type="record.status === 2 ? 'danger' : 'success'" size="small">
            {{ record.status === 2 ? '已撤销' : '已完成' }}
          </el-tag>
          <span class="font-bold">{{ record.nodeName }}</span>
          <el-tag v-if="record.nodeGroup === 0" type="info" size="small" effect="plain">系统</el-tag>
        </div>
        <div class="text-sm text-gray-600">
          <span>主操作：{{ record.masterName || '-' }}</span>
          <span v-if="record.assistantName" class="ml-3">副操作：{{ record.assistantName }}</span>
        </div>
        <div v-if="record.note" class="text-sm text-gray-500 mt-1">备注：{{ record.note }}</div>
        <div v-if="record.imageUrls?.length" class="mt-2 flex gap-2 flex-wrap">
          <el-image
            v-for="(url, idx) in record.imageUrls"
            :key="idx"
            :src="url"
            :preview-src-list="record.imageUrls"
            :initial-index="idx"
            fit="cover"
            class="w-60px h-60px rounded-4px"
          />
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup lang="ts">
// ======================== 导入与声明 ========================
import { formatDate } from '@/utils/formatTime'
import type { ZcOrderProcessRecordRespVO } from '@/api/zc/salesorder'

defineOptions({ name: 'ProcessRecordTimeline' })

// ======================== Props ========================
defineProps<{
  records: ZcOrderProcessRecordRespVO[]
}>()

// ======================== 工具方法 ========================
/** 格式化工序记录时间为 YYYY-MM-DD HH:mm:ss */
const formatProcessRecordTime = (time?: string) => {
  return time ? formatDate(new Date(time), 'YYYY-MM-DD HH:mm:ss') : ''
}
</script>

<style scoped lang="scss">
.process-record-timeline {
  padding-left: 4px;

  :deep(.el-timeline-item__wrapper) {
    padding-left: 20px;
  }
}
</style>
