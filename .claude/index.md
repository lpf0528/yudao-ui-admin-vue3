# CLAUDE 前端项目指南

> 本文件为 Claude（AI 编程助手）提供前端项目的架构说明、目录结构、开发规范及代码注释要求，帮助 Claude 在参与本项目时给出准确、符合规范的代码与建议。

## 文档目录

| 文件 | 内容 |
|---|---|
| [overview.md](overview.md) | 项目概览、技术栈速查 |
| [directory.md](directory.md) | 目录结构说明 |
| [coding-rules.md](coding-rules.md) | 开发规范（命名、Vue、TypeScript） |
| [comment-rules.md](comment-rules.md) | 代码注释规范 |
| [patterns.md](patterns.md) | 常用开发模式（标准页面/表单结构） |
| [permissions.md](permissions.md) | 权限控制（按钮级、动态路由） |
| [dict.md](dict.md) | 字典使用方法 |
| [env.md](env.md) | 环境变量说明 |
| [commands.md](commands.md) | 常用命令 |

## 快速导航

### 新增业务页面流程
1. 定义 API 类型 → `src/api/{模块}/types.ts`
2. 实现 API 函数 → `src/api/{模块}/index.ts`
3. 创建页面目录 → `src/views/{模块}/{功能}/`
4. 实现列表页 → `index.vue`
5. 实现表单弹窗 → `{Name}Form.vue`
6. 在路由中注册

### 核心规范速查

| 规范 | 要求 |
|---|---|
| 脚本 | 必须使用 `<script setup lang="ts">` |
| 路径 | 使用 `@/` 别名，禁止 `../../` |
| 权限按钮 | 必须加 `v-hasPermi` 指令 |
| 字典 | 使用 `<DictTag>` 和 `getIntDictOptions()` |
| 弹窗 | 通过 `defineExpose({ open })` 暴露方法 |
