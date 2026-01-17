# Multi-stage build for Notification Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy notification-service files
COPY notification-service/package*.json ./notification-service/
COPY notification-service/prisma ./notification-service/prisma/
COPY notification-service/src ./notification-service/src/

# Install dependencies
WORKDIR /app/notification-service
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and wget for health checks
RUN apk add --no-cache dumb-init wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/notification-service/node_modules ./notification-service/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/notification-service/src ./notification-service/src
COPY --from=builder --chown=nodejs:nodejs /app/notification-service/prisma ./notification-service/prisma

WORKDIR /app/notification-service

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3007/health || exit 1

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
