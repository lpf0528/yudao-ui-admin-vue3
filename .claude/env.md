# 环境变量说明

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
