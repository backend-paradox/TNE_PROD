# Multi-stage build for Chat Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy chat-service files
COPY chat-service/package*.json ./chat-service/
COPY chat-service/prisma ./chat-service/prisma/
COPY chat-service/src ./chat-service/src/

# Install dependencies
WORKDIR /app/chat-service
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
COPY --from=builder --chown=nodejs:nodejs /app/chat-service/node_modules ./chat-service/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/chat-service/src ./chat-service/src
COPY --from=builder --chown=nodejs:nodejs /app/chat-service/prisma ./chat-service/prisma

WORKDIR /app/chat-service

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3009

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3009/api/v1/health || exit 1

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
