# Multi-stage build for Group Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy group-service files
COPY group-service/package*.json ./group-service/
COPY group-service/prisma ./group-service/prisma/

# Install dependencies
WORKDIR /app/group-service
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
COPY --from=builder --chown=nodejs:nodejs /app/group-service/node_modules ./group-service/node_modules
COPY --chown=nodejs:nodejs group-service/ ./group-service/

WORKDIR /app/group-service

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3008/api/v1/health || exit 1

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
