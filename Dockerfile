# =====================================================
# Stage 1: 构建阶段
# =====================================================
FROM node:20-alpine AS builder

# 安装构建依赖（部分原生模块需要）
RUN apk add --no-cache python3 make g++

# 安装 pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# 先复制依赖文件，利用 Docker 层缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .

ARG BUILD_MODE=prod
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 该项目构建产物目录为 dist-{mode}，如 dist-prod、dist-dev
RUN pnpm build:${BUILD_MODE} && \
    echo "▶ 产物目录：" && ls -lh /app/dist-${BUILD_MODE} && \
    test -f /app/dist-${BUILD_MODE}/index.html || (echo "❌ 构建失败" && exit 1)

# =====================================================
# Stage 2: 运行阶段
# =====================================================
FROM nginx:1.27-alpine

ARG BUILD_MODE=prod

COPY --from=builder /app/dist-${BUILD_MODE} /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]