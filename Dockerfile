# =============================================================================
# Eagles & Eaglets Frontend Dockerfile
# =============================================================================
# This builds our React application for production.
# We use a multi-stage build:
#   1. Build stage: Install dependencies and build the app
#   2. Production stage: Serve the built files with Nginx
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: Build Stage
# -----------------------------------------------------------------------------
# Use Node.js to build our React application
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
# If these files don't change, Docker reuses the cached layer
COPY package*.json ./

# Install dependencies
# --legacy-peer-deps handles some peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build arguments - these can be passed during build time
# Example: docker build --build-arg VITE_API_URL=https://api.example.com .
ARG VITE_API_URL
ARG VITE_APP_NAME="Eagles & Eaglets"
ARG VITE_PAYSTACK_PUBLIC_KEY

# Set environment variables for the build
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

# Build the application for production
# This creates optimized static files in the /app/dist folder
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: Production Stage
# -----------------------------------------------------------------------------
# Use Nginx to serve our static files
# Nginx is a fast, efficient web server perfect for serving static content
FROM nginx:alpine as production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy our built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration as a template so envsubst can process it
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Create a non-root user for security
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Set default PORT in case it's not provided
ENV PORT=80

# Expose port (metadata only)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/ || exit 1

# Start Nginx using envsubst to apply runtime PORT, then daemon off
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

# -----------------------------------------------------------------------------
# STAGE 3: Development Stage (for local development with hot reload)
# -----------------------------------------------------------------------------
FROM node:20-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start development server with hot reload
# --host 0.0.0.0 makes it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
