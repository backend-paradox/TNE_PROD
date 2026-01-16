# backend/api-gateway/Dockerfile
FROM node:18-alpine

WORKDIR /app

# install deps first for caching
COPY package*.json ./
RUN npm ci --only=production

# copy app
COPY . .

# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
  && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
