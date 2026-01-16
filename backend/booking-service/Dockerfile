FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init

COPY --from=builder /app /app

EXPOSE 3004
CMD ["dumb-init", "node", "src/index.js"]
