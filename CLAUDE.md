# CLAUDE.md — yudao-ui-admin-vue3 前端项目指南

> 本文件为 Claude（AI 编程助手）提供前端项目的架构说明、目录结构、开发规范及代码注释要求，
> 帮助 Claude 在参与本项目时给出准确、符合规范的代码与建议。

---

## 项目概览

**yudao-ui-admin-vue3** 是芋道（ruoyi-vue-pro）的管理后台前端，基于 `vue-element-plus-admin` 二次开发。

| 维度 | 说明 |
|---|---|
| 框架 | Vue 3.3 + Vite 4 + TypeScript 5 |
| UI 组件库 | Element Plus 2.4 |
| 状态管理 | Pinia 2 |
| 路由 | Vue Router 4（动态路由，权限驱动） |
| 样式方案 | UnoCSS（原子化 CSS） + SCSS |
| 图标 | Iconify（在线图标库） |
| 国际化 | vue-i18n 9 |
| HTTP 请求 | Axios（二次封装） |
| 工具库 | VueUse 10 |
| 包管理器 | **pnpm**（强制，Node.js ≥ 16.18.0，pnpm ≥ 8.6.0） |
| 代码规范 | ESLint + Prettier + Stylelint |

对应后端项目：[ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)

---

## 目录结构

```
yudao-ui-admin-vue3/
├── build/vite/              # Vite 插件与构建相关配置
├── public/                  # 静态资源（favicon、初始化 loading 动画等）
├── src/
│   ├── api/                 # 接口请求层（按业务模块划分，与后端模块对应）
│   │   ├── system/          # 系统功能接口（user、role、menu、dept...）
│   │   ├── infra/           # 基础设施接口（codegen、job、file...）
│   │   ├── bpm/             # 工作流接口
│   │   ├── pay/             # 支付接口
│   │   ├── mall/            # 商城接口
│   │   ├── crm/             # CRM 接口
│   │   ├── erp/             # ERP 接口
│   │   ├── ai/              # AI 大模型接口
│   │   ├── member/          # 会员接口
│   │   ├── zc/              # 【自研】窗帘业务核心模块（salesorder、customer、product、curtain...）
│   │   └── mes/             # 【自研】制造执行系统接口（工单、工序、质检等）
│   ├── assets/              # 本地静态资源（图片、SVG、字体）
│   ├── components/          # 全局公共组件（已自动注册）
│   │   ├── Form/            # 表单组件（SchemaForm 动态表单）
│   │   ├── Table/           # 表格组件（SchemaTable 动态表格）
│   │   ├── Dialog/          # 弹窗组件
│   │   ├── Editor/          # 富文本编辑器（WangEditor 封装）
│   │   ├── Upload/          # 文件/图片上传组件
│   │   ├── Icon/            # 图标选择器
│   │   ├── DictTag/         # 字典标签渲染组件
│   │   └── ...              # 其他业务组件
│   ├── hooks/               # 可复用的 Composition API Hooks
│   │   ├── web/             # 业务 Hooks（useCrudSchemas、useTable、useForm...）
│   │   └── event/           # 事件相关 Hooks
│   ├── layout/              # 布局组件（侧边栏、顶栏、标签页等）
│   ├── locales/             # 国际化语言包（zh-CN、en）
│   ├── router/              # 路由配置与动态路由守卫
│   │   ├── index.ts         # 路由实例与全局前置守卫
│   │   └── modules/         # 静态路由（Login、404 等）
│   ├── store/               # Pinia 状态管理
│   │   └── modules/
│   │       ├── user.ts      # 用户信息（token、权限、角色）
│   │       ├── permission.ts# 动态路由权限
│   │       ├── app.ts       # 全局应用配置（主题、折叠等）
│   │       ├── dict.ts      # 字典数据缓存
│   │       └── tagsView.ts  # 标签页状态
│   ├── styles/              # 全局样式（element-plus 主题覆盖、公共样式）
│   ├── utils/               # 工具函数
│   │   ├── axios/           # Axios 实例与拦截器封装
│   │   ├── auth.ts          # Token 存取（LocalStorage）
│   │   ├── dict.ts          # 字典工具函数
│   │   ├── routerHelper.ts  # 动态路由生成辅助
│   │   └── ...
│   └── views/               # 页面视图（与路由一一对应）
│       ├── Login/           # 登录页
│       ├── system/          # 系统管理页面
│       ├── infra/           # 基础设施页面
│       ├── bpm/             # 工作流页面
│       ├── pay/             # 支付页面
│       ├── mall/            # 商城页面
│       ├── crm/             # CRM 页面
│       ├── erp/             # ERP 页面
│       ├── ai/              # AI 大模型页面
│       ├── member/          # 会员中心页面
│       ├── mp/              # 微信公众号页面
│       ├── report/          # 数据报表页面
│       ├── zc/              # 【自研】窗帘业务核心页面（salesorder、customer、product...）
│       └── mes/             # 【自研】制造执行系统页面（cal、dv、md、pro、qc、tm、wm...）
├── types/                   # 全局 TypeScript 类型声明
├── .env                     # 公共环境变量
├── .env.dev                 # 开发环境（代理到本地后端）
├── .env.prod                # 生产环境
├── .env.test                # 测试环境
├── vite.config.ts           # Vite 配置（别名、代理、插件）
├── tsconfig.json            # TypeScript 配置
├── uno.config.ts            # UnoCSS 配置
└── package.json             # 依赖与脚本
```

---

## 技术栈速查

| 框架 / 工具 | 用途 | 版本 |
|---|---|---|
| Vue 3 | 核心框架（`<script setup>` + Composition API） | 3.3.x |
| Vite | 构建工具 | 4.5.x |
| TypeScript | 类型系统 | 5.2.x |
| Element Plus | UI 组件库 | 2.4.x |
| Pinia | 状态管理（替代 Vuex） | 2.1.x |
| Vue Router 4 | 路由（支持动态路由） | 4.2.x |
| VueUse | Composition API 工具集 | 10.6.x |
| vue-i18n | 国际化 | 9.6.x |
| UnoCSS | 原子化 CSS | 0.57.x |
| Iconify | 图标库（支持所有主流图标集） | 3.1.x |
| WangEditor | 富文本编辑器 | 5.1.x |
| Axios | HTTP 请求（项目已封装） | - |
| ESLint + Prettier | 代码质量与格式化 | - |
| Stylelint | CSS/SCSS 规范检查 | - |

---

## 开发规范

### 文件命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 页面组件 | `PascalCase` 目录 + `index.vue` | `views/system/user/index.vue` |
| 子组件 | `PascalCase.vue` | `UserForm.vue`、`UserDetail.vue` |
| API 文件 | `camelCase.ts` | `api/system/user/index.ts` |
| Hook 文件 | `use` 前缀 + `camelCase` | `useUserForm.ts` |
| Store 模块 | `camelCase.ts` | `store/modules/user.ts` |
| 工具函数 | `camelCase.ts` | `utils/dict.ts` |
| 类型定义 | `PascalCase` 或 `camelCase.d.ts` | `types/global.d.ts` |

### Vue 组件规范

- **统一使用 `<script setup lang="ts">`**，不使用 Options API
- Props 必须使用 `defineProps<{}>()` 泛型形式，并标注类型
- Emits 必须使用 `defineEmits<{}>()` 明确声明事件
- 模板中优先使用 UnoCSS 原子类，避免内联 `style`
- 组件内部 `ref` 命名以对应含义命名，避免全用 `ref1`、`ref2`

### TypeScript 规范

- **尽量避免 `any`**，优先使用 `unknown` 或具体类型；查询参数类型复杂时可酌情使用
- 后端返回的数据模型在 `api/xxx/index.ts` 中 export，`zc`、`mes` 等自研模块类型与函数写在同一文件
- 枚举值优先使用 `const enum`，避免运行时开销

### 路径别名

项目配置了以下别名，使用时以 `@` 开头，**禁止使用相对路径 `../../`**：

```ts
// vite.config.ts 中已配置
'@'  →  src/
```

---

## 代码注释规范（重要）

**本项目要求所有新增与修改的代码都必须包含必要的注释**，以下为具体规范：

### 1. 组件文件顶部注释

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

### 2. `<script setup>` 内的分区注释

使用分区注释将逻辑分块，提升可读性：

```vue
<script setup lang="ts">
// ======================== 导入与声明 ========================
import { getUserPage, deleteUser } from '@/api/system/user'
import type { UserVO, UserPageReqVO } from '@/api/system/user/types'

// ======================== Props / Emits ========================
const props = defineProps<{
  deptId?: number // 部门 ID，用于按部门过滤用户列表
}>()

// ======================== 响应式状态 ========================
/** 查询参数，与后端 UserPageReqVO 对应 */
const queryParams = reactive<UserPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  username: '',
  mobile: '',
  status: undefined,
  deptId: props.deptId
})

/** 用户列表数据 */
const userList = ref<UserVO[]>([])
/** 总记录数，用于分页组件 */
const total = ref(0)
/** 表格加载状态 */
const loading = ref(false)

// ======================== 生命周期 ========================
onMounted(() => {
  getList()
})

// ======================== 数据获取 ========================
/** 查询用户分页列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getUserPage(queryParams)
    userList.value = data.list
    total.value = data.total
  } finally {
    // 无论成功或失败都要关闭 loading，避免界面卡死
    loading.value = false
  }
}

// ======================== 事件处理 ========================
/** 搜索按钮点击：重置页码后重新查询 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置搜索表单并重新查询 */
const resetQuery = () => {
  queryParams.username = ''
  queryParams.mobile = ''
  queryParams.status = undefined
  handleQuery()
}

/** 删除用户 */
const handleDelete = async (id: number) => {
  // 二次确认，防止误操作
  await message.delConfirm()
  await deleteUser(id)
  message.success('删除成功')
  // 删除后刷新列表
  getList()
}
</script>
```

### 3. API 文件注释

**`zc` / `mes` 等自研模块**统一使用命名空间对象模式，类型接口与函数写在同一 `index.ts`：

```ts
// api/zc/customer/index.ts

import request from '@/config/axios'

/** 客户简要信息（用于下拉选择） */
export interface CustomerSimpleVO {
  id: number
  shortName: string   // 简称
  name: string        // 全称
  mobile: string      // 手机
}

/** 客户详细信息 */
export interface Customer {
  id?: number
  shortName?: string  // 简称
  name?: string       // 全称
  contactName?: string // 联系人
  mobile: string      // 手机
  balance: number     // 账户余额
  note: string        // 备注
}

// 客户资料 API
export const CustomerApi = {
  // 查询客户分页列表，对应后端：GET /zc/customer/page
  getCustomerPage: async (params: any) => {
    return await request.get({ url: `/zc/customer/page`, params })
  },
  // 查询客户详情，对应后端：GET /zc/customer/get
  getCustomer: async (id: number) => {
    return await request.get({ url: `/zc/customer/get?id=` + id })
  },
  // 新增客户，对应后端：POST /zc/customer/create
  createCustomer: async (data: Customer) => {
    return await request.post({ url: `/zc/customer/create`, data })
  },
  // 修改客户，对应后端：PUT /zc/customer/update
  updateCustomer: async (data: Customer) => {
    return await request.put({ url: `/zc/customer/update`, data })
  },
  // 删除客户，对应后端：DELETE /zc/customer/delete
  deleteCustomer: async (id: number) => {
    return await request.delete({ url: `/zc/customer/delete?id=` + id })
  }
}
```

**系统内置模块**（`system`、`infra` 等框架自带模块）保持原有独立函数导出风格，类型写在 `types.ts`。

### 4. 类型定义注释

`types.ts` 中每个接口字段都需要注释：

```ts
// api/system/user/types.ts

/** 用户信息（响应 VO） */
export interface UserVO {
  id: number           // 用户 ID
  username: string     // 登录账号
  nickname: string     // 昵称
  email: string        // 邮箱
  mobile: string       // 手机号
  sex: number          // 性别：0-未知，1-男，2-女
  avatar: string       // 头像 URL
  status: number       // 状态：0-禁用，1-启用
  deptId: number       // 所属部门 ID
  postIds: number[]    // 岗位 ID 列表（多选）
  remark: string       // 备注
  createTime: string   // 创建时间（ISO 格式字符串）
}

/** 用户分页查询请求参数 */
export interface UserPageReqVO {
  pageNo: number          // 页码，从 1 开始
  pageSize: number        // 每页条数
  username?: string       // 用户名（模糊匹配）
  mobile?: string         // 手机号（模糊匹配）
  status?: number         // 状态筛选，不传则查全部
  deptId?: number         // 部门 ID，不传则查全部
  beginTime?: string      // 创建时间起始（yyyy-MM-dd）
  endTime?: string        // 创建时间结束（yyyy-MM-dd）
}
```

### 5. Store 注释

Pinia Store 中每个 state、getter、action 都需要说明：

```ts
// store/modules/user.ts

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    /** 当前登录用户的 access token，存于 LocalStorage */
    token: getToken() || '',
    /** 用户基本信息（昵称、头像等），登录成功后从接口获取 */
    userInfo: null,
    /** 用户拥有的角色编码列表，用于前端页面级权限控制 */
    roles: [],
    /** 用户拥有的权限标识列表（如 system:user:create），用于按钮级权限 */
    permissions: []
  }),

  getters: {
    /** 是否已登录：token 不为空则视为已登录 */
    isLogin: (state) => !!state.token
  },

  actions: {
    /**
     * 登录并获取 token
     * @param loginForm 登录表单（用户名+密码 或 手机号+验证码）
     */
    async login(loginForm: LoginReqVO) {
      const { data } = await loginApi(loginForm)
      // 将 token 持久化到 LocalStorage，供 Axios 拦截器自动携带
      setToken(data.accessToken)
      this.token = data.accessToken
    },

    /**
     * 获取当前用户信息及权限
     * 通常在路由守卫中、token 有效时调用一次
     */
    async getInfo() {
      const { data } = await getInfoApi()
      this.userInfo = data.user
      this.roles = data.roles
      this.permissions = data.permissions
    }
  }
})
```

### 6. 复杂逻辑内联注释

对非直觉性的处理逻辑，必须添加解释"为什么"的注释：

```ts
// 动态路由生成示例
const generateRoutes = (menus: RouteVO[]): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = []

  for (const menu of menus) {
    // 目录类型（type=0）只渲染为 layout 容器，不对应真实页面
    if (menu.type === MenuTypeEnum.DIR) {
      routes.push({
        path: menu.path,
        component: Layout,
        // 目录不显示 redirect，由第一个子菜单决定跳转目标
        children: generateRoutes(menu.children ?? [])
      })
      continue
    }

    // 外链（isExt=true）在新标签页打开，无需渲染 Vue 组件
    if (menu.isExt) {
      routes.push({ path: menu.path, component: () => null })
      continue
    }

    // 使用 Vite 的 import.meta.glob 动态导入页面组件
    // 注意：glob 的路径必须是字面量字符串，不能用变量拼接
    const pageModules = import.meta.glob('../views/**/*.vue')
    const component = pageModules[`../views/${menu.component}.vue`]
    routes.push({
      path: menu.path,
      component,
      meta: {
        title: menu.name,
        icon: menu.icon,
        // noCache=true 时不会被 <keep-alive> 缓存，适用于详情页等不需要缓存的场景
        noCache: !menu.keepAlive,
        affix: menu.affix === 1
      }
    })
  }

  return routes
}
```

### 7. 注释的禁忌

- ❌ 不写无意义的重复注释：`// 获取用户列表` 对应 `getUserList()` 毫无价值
- ❌ 不提交注释掉的死代码，应直接删除
- ❌ 不用中英混杂的拼音注释（如 `// get yonghu list`）
- ✅ 说明"为什么"（业务决策、非直觉性设计），而非"是什么"

---

## 常用开发模式

### 新增一个业务页面的标准流程

1. **定义 API 类型** → `src/api/{模块}/types.ts`，写好接口字段注释
2. **实现 API 函数** → `src/api/{模块}/index.ts`，每个函数加注释
3. **创建页面目录** → `src/views/{模块}/{功能}/`
4. **实现列表页** → `index.vue`（分页查询 + 表格 + 操作列）
5. **实现表单弹窗** → `{Name}Form.vue`（新增/编辑复用同一组件）
6. **在路由中注册** → 后端菜单管理中配置，或修改 `src/router/modules/` 中的静态路由

### 标准列表页结构（`index.vue`）

```vue
<!--
  {模块} - {功能}列表页
  支持按{字段}查询，可进行新增、编辑、删除操作
-->
<template>
  <ContentWrap>
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" /> 重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb-8px">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['{module}:{resource}:create']"
        >
          <Icon icon="ep:plus" /> 新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" prop="id" width="80" />
      <el-table-column label="名称" prop="name" />
      <!-- 创建时间：使用全局过滤器格式化 -->
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button
            link type="primary"
            @click="openForm('update', row.id)"
            v-hasPermi="['{module}:{resource}:update']"
          >编辑</el-button>
          <el-button
            link type="danger"
            @click="handleDelete(row.id)"
            v-hasPermi="['{module}:{resource}:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <ExampleForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
// ======================== 导入 ========================
import { getExamplePage, deleteExample } from '@/api/{module}/example'
import type { ExampleVO, ExamplePageReqVO } from '@/api/{module}/example/types'
import ExampleForm from './ExampleForm.vue'
import { dateFormatter } from '@/utils/formatTime'

defineOptions({ name: '{Module}Example' }) // 设置组件名，用于 keep-alive 缓存匹配

// ======================== 响应式状态 ========================
const loading = ref(false)      // 表格加载状态
const total = ref(0)            // 总记录数
const list = ref<ExampleVO[]>([]) // 列表数据

/** 查询参数，与后端分页 VO 对应 */
const queryParams = reactive<ExamplePageReqVO>({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

// ======================== 生命周期 ========================
onMounted(() => getList())

// ======================== 数据操作 ========================
/** 加载分页列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getExamplePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.pageNo = 1; getList() }
const resetQuery = () => { /* 重置 queryParams 各字段 */; handleQuery() }

/** 打开新增或编辑弹窗 */
const formRef = ref<InstanceType<typeof ExampleForm>>()
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value?.open(type, id)
}

/** 删除记录 */
const handleDelete = async (id: number) => {
  await message.delConfirm() // 二次确认
  await deleteExample(id)
  message.success('删除成功')
  getList()
}
</script>
```

### 标准表单弹窗（`XxxForm.vue`）

```vue
<!--
  {功能} 新增/编辑弹窗
  通过 open(type, id?) 方法控制显示，成功后 emit('success') 通知父组件刷新列表
-->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="formLoading" @click="submitForm">确认</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { createExample, updateExample, getExample } from '@/api/{module}/example'
import type { ExampleVO } from '@/api/{module}/example/types'

/** 通知父组件刷新列表 */
const emit = defineEmits(['success'])

// ======================== 弹窗状态 ========================
const dialogVisible = ref(false)    // 弹窗是否可见
const dialogTitle = ref('')         // 弹窗标题（新增/编辑）
const formLoading = ref(false)      // 提交按钮 loading
const formType = ref<'create' | 'update'>('create') // 当前操作类型

// ======================== 表单 ========================
const formRef = ref()
/** 表单数据，与后端 CreateReqVO/UpdateReqVO 字段保持一致 */
const formData = reactive<Partial<ExampleVO>>({ name: '' })
const formRules = {
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
}

/**
 * 打开弹窗
 * @param type  操作类型：create=新增，update=编辑
 * @param id    记录 ID（编辑时传入）
 */
const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增' : '编辑'
  formType.value = type
  // 重置表单，避免上次数据残留
  formRef.value?.resetFields()

  if (id) {
    // 编辑模式：从接口获取最新数据（不用列表中的数据，避免数据过期问题）
    formLoading.value = true
    try {
      const data = await getExample(id)
      Object.assign(formData, data)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 暴露给父组件调用

/** 提交表单 */
const submitForm = async () => {
  await formRef.value?.validate() // 触发表单校验
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await createExample(formData)
      message.success('新增成功')
    } else {
      await updateExample(formData)
      message.success('修改成功')
    }
    dialogVisible.value = false
    emit('success') // 通知父组件刷新
  } finally {
    formLoading.value = false
  }
}
</script>
```

---

## 权限控制

### 按钮权限指令

使用 `v-hasPermi` 指令控制按钮级权限，权限标识与后端 `@PreAuthorize` 中保持一致：

```vue
<!-- 单个权限 -->
<el-button v-hasPermi="['system:user:create']">新增用户</el-button>

<!-- 多个权限（满足其一即可） -->
<el-button v-hasPermi="['system:user:update', 'system:user:admin']">编辑</el-button>
```

### 角色权限指令

```vue
<!-- 仅超级管理员可见 -->
<div v-hasRole="['super_admin']">超管专区</div>
```

### 动态路由权限

路由基于后端菜单动态生成，无需在前端 `router/` 中维护业务路由。流程：
1. 用户登录 → 获取 token
2. 路由守卫调用 `permissionStore.generateRoutes()` → 拉取当前用户菜单
3. 将菜单转换为 `RouteRecordRaw[]` 并通过 `router.addRoute()` 动态注册

---

## 字典使用

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

---

## 环境变量说明

| 变量名 | 说明 |
|---|---|
| `VITE_BASE_URL` | 后端 API 基础路径（如 `/admin-api`） |
| `VITE_API_BASE_PATH` | Vite 开发代理前缀 |
| `VITE_API_URL` | 后端真实地址（代理目标，仅开发环境） |
| `VITE_APP_TITLE` | 浏览器标签页标题 |
| `VITE_TENANT_ENABLE` | 是否启用多租户模式（`true`/`false`） |

本地开发修改 `.env.local`（已加入 `.gitignore`，不会提交）：

```env
# .env.local 示例（本地开发）
VITE_API_URL=http://localhost:48080
```

---

## 常用命令

```bash
# 安装依赖（必须使用 pnpm）
pnpm install

# 启动开发服务器（代理到 localhost:48080 后端）
pnpm dev

# 生产构建
pnpm build:prod

# 测试环境构建
pnpm build:test

# 代码格式检查
pnpm lint

# 代码格式修复
pnpm lint:fix
```

---

## 推荐 VS Code 插件

| 插件 | 作用 |
|---|---|
| **Vue - Official** | Vue 3 + TypeScript 语法支持（必装） |
| **UnoCSS** | UnoCSS 类名智能提示 |
| **Iconify IntelliSense** | 图标名预览与搜索 |
| **i18n Ally** | 国际化 key 智能提示与内联预览 |
| **ESLint** | 实时代码检查 |
| **Prettier** | 保存时自动格式化 |
| **Stylelint** | CSS/SCSS 规范检查 |
| **DotENV** | `.env` 文件语法高亮 |

---

## 参考资料

- **官方文档**：https://doc.iocoder.cn/
- **快速启动**：https://doc.iocoder.cn/quick-start/
- **演示环境**：http://dashboard-vue3.yudao.iocoder.cn
- **后端仓库**：https://github.com/YunaiV/ruoyi-vue-pro
- **Element Plus 文档**：https://element-plus.org/zh-CN/
- **VueUse 文档**：https://vueuse.org/
- **UnoCSS 文档**：https://uno.antfu.me/

---

## 给 Claude 的附加说明

1. **组件注释必须完整**：生成任何 `.vue` 文件时，必须包含顶部组件说明注释、`<script setup>` 内分区注释、复杂逻辑内联注释，不得省略
2. **严格使用 `<script setup lang="ts">`**：不接受 Options API，不接受无 TypeScript 的写法
3. **尽量避免 `any`**：优先定义具体类型；查询参数等复杂场景可酌情使用 `any`
4. **路径使用 `@` 别名**：所有跨目录导入必须以 `@/` 开头，禁止相对路径 `../../`
5. **权限按钮必须加指令**：涉及新增、编辑、删除的按钮，必须加 `v-hasPermi` 指令
6. **API 模式按模块区分**：`zc`、`mes` 等自研模块使用命名空间对象模式（`export const XxxApi = { ... }`），类型与函数写在同一 `index.ts`；系统内置模块保持独立函数导出 + `types.ts` 分离
7. **字典使用统一工具**：展示字典值用 `<DictTag>`，表单下拉用 `getIntDictOptions()` / `getStrDictOptions()`，不要硬编码字典值
8. **表单弹窗用 `defineExpose`**：弹窗组件通过 `open()` 方法被父组件调用，需 `defineExpose({ open })`
9. **多租户相关代码须提醒**：若修改涉及租户切换（如登录逻辑、请求头 `tenant-id`），需明确提示开发者确认影响范围