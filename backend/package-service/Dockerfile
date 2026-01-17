# Multi-stage build for Package Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy package-service files
COPY package-service/package*.json ./package-service/
COPY package-service/prisma ./package-service/prisma/
COPY package-service/src ./package-service/src/

# Install dependencies
WORKDIR /app/package-service
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl

# Create symlink for Prisma's OpenSSL requirement (libssl.so.1.1 -> libssl.so.3)
RUN ln -s /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 || true && \
    ln -s /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1 || true

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/package-service/node_modules ./package-service/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package-service/src ./package-service/src
COPY --from=builder --chown=nodejs:nodejs /app/package-service/prisma ./package-service/prisma

WORKDIR /app/package-service

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3012

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3012/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
