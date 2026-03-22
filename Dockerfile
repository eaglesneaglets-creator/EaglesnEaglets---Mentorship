# =============================================================================
# Eagles & Eaglets Frontend Dockerfile
# =============================================================================
# We use a multi-stage build:
#   1. builder stage: Install dependencies and build the React app
#   2. development stage: Local dev with hot reload (vite dev server)
#   3. production stage: Serve built files with Nginx (last = default stage)
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Builder Stage
# -----------------------------------------------------------------------------
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# Build arguments passed at build time (e.g. from railway.json buildArgs)
ARG VITE_API_URL
ARG VITE_APP_NAME="Eagles & Eaglets"
ARG VITE_PAYSTACK_PUBLIC_KEY

ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: Development Stage (local dev with hot reload)
# -----------------------------------------------------------------------------
FROM node:20-alpine as development

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -----------------------------------------------------------------------------
# STAGE 3: Production Stage (default — must be last)
# -----------------------------------------------------------------------------
FROM nginx:alpine as production

RUN apk add --no-cache curl

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf.template

RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

ENV PORT=80

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/health || exit 1

CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
