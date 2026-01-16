# Multi-stage build for API Gateway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy api-gateway files
COPY api-gateway/package*.json ./api-gateway/

# Install dependencies
WORKDIR /app/api-gateway
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/api-gateway/node_modules ./api-gateway/node_modules
COPY --chown=nodejs:nodejs api-gateway/ ./api-gateway/

WORKDIR /app/api-gateway

# Switch to non-root user
USER nodejs

ENV NODE_ENV=production
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
