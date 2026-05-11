<template>
  <div>
    <el-button type="primary" @click="addCurtain">+ 成品窗帘行</el-button>
    <el-card v-for="(line, idx) in curtains" :key="idx" class="mt-12px">
      <template #header>
        <div class="flex justify-between items-center">
          <span>窗帘 #{{ idx + 1 }}</span>
          <el-button link type="danger" @click="removeCurtain(idx)">删除</el-button>
        </div>
      </template>
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="房间">
            <el-input v-model="line.room" placeholder="房间" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="款式ID">
            <el-input-number v-model="line.curtainId" :min="0" controls-position="right" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="金额">
            <el-input-number v-model="line.amount" :min="0" :precision="2" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="line.note" type="textarea" :rows="1" />
          </el-form-item>
        </el-col>
      </el-row>
      <StructureList v-model="line.structures" />
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import StructureList from './StructureList.vue'

defineOptions({ name: 'ZcCurtainLineList' })

const curtains = defineModel<any[]>({ default: () => [] })

const addCurtain = () => {
  curtains.value.push({
    room: '',
    curtainId: undefined,
    amount: undefined,
    note: '',
    structures: []
  })
}

const removeCurtain = (index: number) => {
  curtains.value.splice(index, 1)
}
</script>
