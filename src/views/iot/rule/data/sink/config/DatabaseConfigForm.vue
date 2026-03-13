<template>
  <el-form-item label="JDBC 地址" prop="config.jdbcUrl">
    <el-input
      v-model="config.jdbcUrl"
      placeholder="请输入JDBC连接地址，如：jdbc:mysql://localhost:3306/iot_data"
    />
  </el-form-item>
  <el-form-item label="用户名" prop="config.username">
    <el-input v-model="config.username" placeholder="请输入数据库用户名" />
  </el-form-item>
  <el-form-item label="密码" prop="config.password">
    <el-input v-model="config.password" placeholder="请输入数据库密码" show-password type="password" />
  </el-form-item>
  <el-form-item label="目标表名" prop="config.tableName">
    <el-input v-model="config.tableName" placeholder="请输入目标表名，如：iot_device_message_sink" />
  </el-form-item>
</template>
<script lang="ts" setup>
import { DatabaseConfig, IotDataSinkTypeEnum } from '@/api/iot/rule/data/sink'
import { useVModel } from '@vueuse/core'
import { isEmpty } from '@/utils/is'

defineOptions({ name: 'DatabaseConfigForm' })

const props = defineProps<{
  modelValue: any
}>()
const emit = defineEmits(['update:modelValue'])
const config = useVModel(props, 'modelValue', emit) as Ref<DatabaseConfig>

/** 组件初始化 */
onMounted(() => {
  if (!isEmpty(config.value)) {
    return
  }
  config.value = {
    type: IotDataSinkTypeEnum.DATABASE + '', // 序列化成对应类型时使用
    jdbcUrl: '',
    username: '',
    password: '',
    tableName: ''
  }
})
</script>
