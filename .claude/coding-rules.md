# 开发规范

## 文件命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 页面组件 | `PascalCase` 目录 + `index.vue` | `views/system/user/index.vue` |
| 子组件 | `PascalCase.vue` | `UserForm.vue`、`UserDetail.vue` |
| API 文件 | `camelCase.ts` | `api/system/user/index.ts` |
| Hook 文件 | `use` 前缀 + `camelCase` | `useUserForm.ts` |
| Store 模块 | `camelCase.ts` | `store/modules/user.ts` |
| 工具函数 | `camelCase.ts` | `utils/dict.ts` |
| 类型定义 | `PascalCase` 或 `camelCase.d.ts` | `types/global.d.ts` |

## Vue 组件规范

- **统一使用 `<script setup lang="ts">`**，不使用 Options API
- Props 必须使用 `defineProps<{}>()` 泛型形式，并标注类型
- Emits 必须使用 `defineEmits<{}>()` 明确声明事件
- 模板中优先使用 UnoCSS 原子类，避免内联 `style`
- 组件内部 `ref` 命名以对应含义命名，避免全用 `ref1`、`ref2`

## TypeScript 规范

- **尽量避免 `any`**，优先使用 `unknown` 或具体类型；查询参数类型复杂时可酌情使用
- 后端返回的数据模型在 `api/xxx/index.ts` 中 export，`zc`、`mes` 等自研模块类型与函数写在同一文件
- 枚举值优先使用 `const enum`，避免运行时开销

## 路径别名

项目配置了以下别名，使用时以 `@` 开头，**禁止使用相对路径 `../../`**：

```ts
// vite.config.ts 中已配置
'@'  →  src/
```
