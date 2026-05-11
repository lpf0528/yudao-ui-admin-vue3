# ============================================================
# Stage 1 — 构建阶段
# ============================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# Node 内存优化
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 统一生产构建
RUN pnpm build && \
    echo "▶ 构建完成" && \
    ls -lh /app/dist && \
    test -f /app/dist/index.html || (echo "❌ 构建失败" && exit 1)

