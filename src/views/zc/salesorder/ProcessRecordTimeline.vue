<!--
  销售订单 - 工序记录横向流程
  功能：同层级工序记录横向排列，箭头依次连接
  使用方：SalesOrderProcessRecordDialog.vue
-->
<template>
  <div class="process-record-flow">
    <template v-for="(record, index) in records" :key="record.id">
      <div v-if="index > 0" class="process-record-flow__arrow" aria-hidden="true">
        <Icon icon="ep:right" :size="18" />
      </div>

      <el-popover
        v-if="hasDetail(record)"
        placement="bottom"
        :width="280"
        trigger="hover"
      >
        <template #reference>
          <div
            class="process-record-card"
            :class="{
              'process-record-card--revoked': record.status === 2,
              'process-record-card--system': record.nodeGroup === 0
            }"
          >
            <div class="process-record-card__header">
              <el-tag :type="record.status === 2 ? 'danger' : 'success'" size="small">
                {{ record.status === 2 ? '已撤销' : '已完成' }}
              </el-tag>
              <el-tag v-if="record.nodeGroup === 0" type="info" size="small" effect="plain">系统</el-tag>
            </div>
            <div class="process-record-card__node">{{ record.nodeName }}</div>
            <div class="process-record-card__time">{{ formatProcessRecordTime(record.createTime) }}</div>
            <div class="process-record-card__operator">{{ record.masterName || '-' }}</div>
          </div>
        </template>
        <div class="text-sm text-gray-600">
          <span>主操作：{{ record.masterName || '-' }}</span>
          <span v-if="record.assistantName" class="ml-3">副操作：{{ record.assistantName }}</span>
        </div>
        <div v-if="record.note" class="text-sm text-gray-500 mt-2">备注：{{ record.note }}</div>
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
      </el-popover>

      <div
        v-else
        class="process-record-card"
        :class="{
          'process-record-card--revoked': record.status === 2,
          'process-record-card--system': record.nodeGroup === 0
        }"
      >
        <div class="process-record-card__header">
          <el-tag :type="record.status === 2 ? 'danger' : 'success'" size="small">
            {{ record.status === 2 ? '已撤销' : '已完成' }}
          </el-tag>
          <el-tag v-if="record.nodeGroup === 0" type="info" size="small" effect="plain">系统</el-tag>
        </div>
        <div class="process-record-card__node">{{ record.nodeName }}</div>
        <div class="process-record-card__time">{{ formatProcessRecordTime(record.createTime) }}</div>
        <div class="process-record-card__operator">{{ record.masterName || '-' }}</div>
      </div>
    </template>
  </div>
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

/** 格式化工序记录时间为 YYYY-MM-DD HH:mm:ss */
const formatProcessRecordTime = (time?: string) => {
  return time ? formatDate(new Date(time), 'YYYY-MM-DD HH:mm:ss') : ''
}

/** 是否有备注、副操作或图片等扩展信息 */
const hasDetail = (record: ZcOrderProcessRecordRespVO) => {
  return !!record.note || !!record.imageUrls?.length || !!record.assistantName
}
</script>

<style scoped lang="scss">
.process-record-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  overflow-x: auto;
}

.process-record-flow__arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  color: var(--el-text-color-placeholder);
}

.process-record-card {
  flex-shrink: 0;
  min-width: 120px;
  max-width: 160px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  cursor: default;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }

  &--revoked {
    border-color: var(--el-color-danger-light-5);
    background: var(--el-color-danger-light-9);
  }

  &--system {
    border-style: dashed;
  }
}

.process-record-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.process-record-card__node {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.process-record-card__time {
  margin-bottom: 2px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

.process-record-card__operator {
  font-size: 12px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
