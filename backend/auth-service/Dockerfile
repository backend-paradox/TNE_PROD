# Multi-stage build for Auth Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy auth-service files
COPY auth-service/package*.json ./auth-service/
COPY auth-service/prisma ./auth-service/prisma/
COPY auth-service/src ./auth-service/src/

# Install dependencies
WORKDIR /app/auth-service
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
COPY --from=builder --chown=nodejs:nodejs /app/auth-service/node_modules ./auth-service/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/auth-service/src ./auth-service/src
COPY --from=builder --chown=nodejs:nodejs /app/auth-service/prisma ./auth-service/prisma

WORKDIR /app/auth-service

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
