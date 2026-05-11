<template>
  <div class="mt-12px">
    <el-button type="success" link @click="addStructure">+ 结构行</el-button>
    <el-card v-for="(st, idx) in structures" :key="idx" class="mt-8px" shadow="never">
      <template #header>
        <span>结构 #{{ idx + 1 }}</span>
      </template>
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="宽">
            <el-input-number v-model="st.width" :min="0" :precision="4" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="高">
            <el-input-number v-model="st.height" :min="0" :precision="4" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="结构ID">
            <el-input-number v-model="st.structureId" :min="0" controls-position="right" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="定型">
            <el-switch v-model="st.isShaping" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button link type="danger" @click="removeStructure(idx)">删除结构</el-button>
        </el-col>
      </el-row>
      <ElementList v-model="st.elements" />
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import ElementList from './ElementList.vue'

defineOptions({ name: 'ZcStructureList' })

const structures = defineModel<any[]>({ default: () => [] })

const addStructure = () => {
  structures.value.push({
    structureId: undefined,
    height: undefined,
    width: undefined,
    isShaping: false,
    elements: []
  })
}

const removeStructure = (index: number) => {
  structures.value.splice(index, 1)
}
</script>
