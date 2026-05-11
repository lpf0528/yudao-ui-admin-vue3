<template>
  <div class="pl-12px border-l-2 border-[var(--el-color-primary-light-5)]">
    <div class="mb-8px">
      <el-button type="primary" link @click="addRow">+ 用料行</el-button>
    </div>
    <el-table :data="elements" size="small" border>
      <el-table-column label="货号ID" width="100">
        <template #default="{ row }">
          <el-input-number v-model="row.productId" :min="0" controls-position="right" class="!w-full" />
        </template>
      </el-table-column>
      <el-table-column label="批次ID" width="100">
        <template #default="{ row }">
          <el-input-number v-model="row.batchId" :min="0" controls-position="right" class="!w-full" />
        </template>
      </el-table-column>
      <el-table-column label="单价" width="110">
        <template #default="{ row }">
          <el-input-number v-model="row.price" :min="0" :precision="2" class="!w-full" />
        </template>
      </el-table-column>
      <el-table-column label="数量" width="110">
        <template #default="{ row }">
          <el-input-number v-model="row.quantity" :min="0" :precision="4" class="!w-full" />
        </template>
      </el-table-column>
      <el-table-column label="单位" width="100">
        <template #default="{ row }">
          <el-input v-model="row.unitValue" placeholder="米/套等" />
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110">
        <template #default="{ row }">
          <el-input-number v-model="row.amount" :min="0" :precision="2" class="!w-full" />
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="120">
        <template #default="{ row }">
          <el-input v-model="row.note" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" fixed="right">
        <template #default="{ $index }">
          <el-button link type="danger" @click="removeRow($index)">删</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: 'ZcElementList' })

const elements = defineModel<any[]>({ default: () => [] })

const addRow = () => {
  elements.value.push({
    productId: undefined,
    batchId: undefined,
    price: undefined,
    quantity: undefined,
    unitValue: '',
    amount: undefined,
    note: ''
  })
}

const removeRow = (index: number) => {
  elements.value.splice(index, 1)
}
</script>
