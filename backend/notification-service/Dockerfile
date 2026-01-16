# ==============================================================================
# TNE Notification Service - Dockerfile
# ==============================================================================

FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# ==============================================================================
# Production image
# ==============================================================================
FROM node:18-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Set environment
ENV NODE_ENV=production
ENV PORT=3007

EXPOSE 3007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3007/health || exit 1

CMD ["node", "src/server.js"]
