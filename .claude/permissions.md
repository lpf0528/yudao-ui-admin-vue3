# 权限控制

## 按钮权限指令

使用 `v-hasPermi` 指令控制按钮级权限，权限标识与后端 `@PreAuthorize` 中保持一致：

```vue
<!-- 单个权限 -->
<el-button v-hasPermi="['system:user:create']">新增用户</el-button>

<!-- 多个权限（满足其一即可） -->
<el-button v-hasPermi="['system:user:update', 'system:user:admin']">编辑</el-button>
```

## 角色权限指令

```vue
<!-- 仅超级管理员可见 -->
<div v-hasRole="['super_admin']">超管专区</div>
```

## 动态路由权限

路由基于后端菜单动态生成，无需在前端 `router/` 中维护业务路由。流程：

1. 用户登录 → 获取 token
2. 路由守卫调用 `permissionStore.generateRoutes()` → 拉取当前用户菜单
3. 将菜单转换为 `RouteRecordRaw[]` 并通过 `router.addRoute()` 动态注册
