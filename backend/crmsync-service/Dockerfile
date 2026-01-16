# Multi-stage build for CRMSync Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy crmsync-service files
COPY crmsync-service/package*.json ./crmsync-service/
COPY crmsync-service/prisma ./crmsync-service/prisma/

# Install dependencies
WORKDIR /app/crmsync-service
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/crmsync-service/node_modules ./crmsync-service/node_modules
COPY --chown=nodejs:nodejs crmsync-service/ ./crmsync-service/

WORKDIR /app/crmsync-service

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3011

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3011/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
