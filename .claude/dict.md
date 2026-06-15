# 字典使用

项目封装了字典数据的统一处理，使用 `DICT_TYPE` 常量引用字典类型：

```vue
<template>
  <!-- 字典下拉选择 -->
  <el-select v-model="formData.status">
    <el-option
      v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    />
  </el-select>

  <!-- 字典标签展示（带颜色） -->
  <DictTag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
</script>
```
