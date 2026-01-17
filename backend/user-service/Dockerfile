# Multi-stage build for User Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy user-service files
COPY user-service/package*.json ./user-service/
COPY user-service/prisma ./user-service/prisma/
COPY user-service/src ./user-service/src/

# Install dependencies
WORKDIR /app/user-service
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
COPY --from=builder --chown=nodejs:nodejs /app/user-service/node_modules ./user-service/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/user-service/src ./user-service/src
COPY --from=builder --chown=nodejs:nodejs /app/user-service/prisma ./user-service/prisma

WORKDIR /app/user-service

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
