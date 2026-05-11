# ============================================================
# Stage 1 — 构建阶段
# ============================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# Node 内存优化 1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 统一生产构建
RUN pnpm build:prod && \
    echo "▶ 构建完成" && \
    ls -lh /app/dist-prod && \
    test -f /app/dist-prod/index.html || (echo "❌ 构建失败" && exit 1)

# ============================================================
# Stage 2 — 运行阶段
# ============================================================
FROM nginx:1.27-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist-prod /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]




# docker run -d --name yudao-ui -p 80:80 eatsleeprun/yudao-ui-admin-vue3:latest