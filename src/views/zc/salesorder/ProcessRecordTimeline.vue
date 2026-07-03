<!--
  销售订单 - 工序记录横向流程
  功能：同层级工序记录横向排列，展示为「操作人 "状态" 工序名」
  使用方：SalesOrderProcessRecordDialog.vue
-->
<template>
  <div class="process-record-flow">
    <template v-for="(record, index) in records" :key="record.id">
      <div v-if="index > 0" class="process-record-flow__arrow" aria-hidden="true">
        <Icon icon="ep:right" :size="16" />
      </div>

      <el-popover placement="bottom" :width="280" trigger="hover">
        <template #reference>
          <div
            class="process-record-item"
            :class="{
              'process-record-item--revoked': record.status === 2,
              'process-record-item--system': record.nodeGroup === 0
            }"
          >
            <span class="process-record-item__operator">{{ record.masterName || '-' }}</span>
            <span
              class="process-record-item__status"
              :class="record.status === 2 ? 'is-revoked' : 'is-done'"
            >
              "{{ getStatusLabel(record.status) }}"
            </span>
            <span class="process-record-item__node">{{ record.nodeName }}</span>
            <el-tag
              v-if="record.nodeGroup === 0"
              type="info"
              size="small"
              effect="plain"
              class="process-record-item__tag"
            >
              系统
            </el-tag>
          </div>
        </template>
        <div class="text-sm text-gray-500 mb-2">
          {{ formatProcessRecordTime(record.createTime) }}
        </div>
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
        <div
          v-if="!record.note && !record.imageUrls?.length && !record.assistantName"
          class="text-sm text-gray-400"
        >
          暂无更多详情
        </div>
      </el-popover>
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

/** 状态文案：1=完成，2=撤销 */
const getStatusLabel = (status: number) => {
  return status === 2 ? '撤销' : '完成'
}
</script>

<style scoped lang="scss">
.process-record-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  overflow-x: auto;
}

.process-record-flow__arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
}

.process-record-item {
  display: inline-flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  line-height: 1.4;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-blank);
  cursor: default;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }

  &--revoked {
    border-color: var(--el-color-danger-light-5);
    background: var(--el-color-danger-light-9);
  }

  &--system {
    border-style: dashed;
  }
}

.process-record-item__operator {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.process-record-item__status {
  font-weight: 500;

  &.is-done {
    color: var(--el-color-success);
  }

  &.is-revoked {
    color: var(--el-color-danger);
  }
}

.process-record-item__node {
  color: var(--el-text-color-regular);
}

.process-record-item__tag {
  margin-left: 2px;
}
</style>
