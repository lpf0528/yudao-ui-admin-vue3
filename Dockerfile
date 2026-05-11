# =====================================================
# Stage 1: Build
# =====================================================
FROM node:20-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 安装 pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# 先复制依赖文件（提升缓存命中）
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# Node 内存优化
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 统一生产构建
RUN pnpm build && \
    echo "▶ 构建完成" && \
    ls -lh /app/dist && \
    test -f /app/dist/index.html || (echo "❌ 构建失败" && exit 1)

# =====================================================
# Stage 2: Runtime
# =====================================================
FROM nginx:1.27-alpine

# 拷贝前端产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝运行时 env 注入脚本
COPY docker/env.sh /docker-entrypoint.d/env.sh

# 赋予执行权限
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]