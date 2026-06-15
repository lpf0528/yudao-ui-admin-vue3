# 代码注释规范

**本项目要求所有新增与修改的代码都必须包含必要的注释**。

## 1. 组件文件顶部注释

每个 `.vue` 文件顶部需写明组件职责：

```vue
<!--
  用户管理 - 新增/修改弹窗
  功能：提供用户信息的表单录入，支持新增和编辑两种模式
  使用方：views/system/user/index.vue
-->
<template>
  ...
</template>
```

## 2. `<script setup>` 内的分区注释

使用分区注释将逻辑分块，提升可读性：

```vue
<script setup lang="ts">
// ======================== 导入与声明 ========================
import { getUserPage, deleteUser } from '@/api/system/user'

// ======================== Props / Emits ========================
const props = defineProps<{
  deptId?: number // 部门 ID，用于按部门过滤用户列表
}>()

// ======================== 响应式状态 ========================
const queryParams = reactive<UserPageReqVO>({...})

// ======================== 生命周期 ========================
onMounted(() => { getList() })

// ======================== 数据获取 ========================
const getList = async () => {...}

// ======================== 事件处理 ========================
const handleQuery = () => {...}
</script>
```

## 3. API 文件注释

**`zc` / `mes` 等自研模块**统一使用命名空间对象模式，类型与函数写在同一 `index.ts`：

```ts
// api/zc/customer/index.ts
import request from '@/config/axios'

/** 客户简要信息（用于下拉选择） */
export interface CustomerSimpleVO {
  id: number
  shortName: string   // 简称
}

export const CustomerApi = {
  // 查询客户分页列表，对应后端：GET /zc/customer/page
  getCustomerPage: async (params: any) => {
    return await request.get({ url: `/zc/customer/page`, params })
  }
}
```

**系统内置模块**（`system`、`infra` 等）保持原有独立函数导出风格，类型写在 `types.ts`。

## 4. 类型定义注释

`types.ts` 中每个接口字段都需要注释：

```ts
/** 用户信息（响应 VO） */
export interface UserVO {
  id: number           // 用户 ID
  username: string     // 登录账号
  status: number       // 状态：0-禁用，1-启用
}
```

## 5. Store 注释

Pinia Store 中每个 state、getter、action 都需要说明：

```ts
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    /** 当前登录用户的 access token */
    token: getToken() || '',
    /** 用户基本信息 */
    userInfo: null,
  }),
  getters: {
    /** 是否已登录 */
    isLogin: (state) => !!state.token
  },
  actions: {
    /** 登录并获取 token */
    async login(loginForm: LoginReqVO) {...}
  }
})
```

## 6. 复杂逻辑内联注释

对非直觉性的处理逻辑，必须添加解释"为什么"的注释。

## 7. 注释的禁忌

- ❌ 不写无意义的重复注释：`// 获取用户列表` 对应 `getUserList()` 毫无价值
- ❌ 不提交注释掉的死代码，应直接删除
- ❌ 不用中英混杂的拼音注释
- ✅ 说明"为什么"（业务决策、非直觉性设计），而非"是什么"
