# ============================================================
# Stage 1 — 构建阶段
# ============================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# 优先复制依赖声明文件，充分利用 Docker 层缓存
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


# ============================================================
# Stage 2 — 运行阶段
# ============================================================
FROM nginx:1.27-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

# BACKEND_HOST 对应 docker-compose 中后端服务的 service 名称
# 构建时可通过 --build-arg BACKEND_HOST=xxx 覆盖，默认 "server"
ARG BACKEND_HOST=server
ENV BACKEND_HOST=${BACKEND_HOST}

# 使用模板文件，启动时由 envsubst 将 ${BACKEND_HOST} 替换为实际值
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

# envsubst 渲染模板 → 写入 conf.d → 启动 Nginx
CMD ["/bin/sh", "-c", \
     "envsubst '${BACKEND_HOST}' < /etc/nginx/templates/default.conf.template \
      > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]