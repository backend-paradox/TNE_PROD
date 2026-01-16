# Docker-Based Database Seeding

Since `package-service` is not in docker-compose.production.yml, here are ways to seed data using Docker.

## Option 1: Run Scripts in a Temporary Container

Create a temporary container to run seeding scripts:

```bash
cd ~/TNE_PROD/backend

# Build package-service image (one-time setup)
docker build -t tne-package-service -f package-service/Dockerfile \
  --build-arg DATABASE_URL="postgresql://postgres:password@tne-postgres-prod:5432/tne_production" \
  package-service/

# Or use node image directly
docker run --rm -it \
  --network backend_tne-internal \
  -v "$(pwd)/package-service:/app" \
  -w /app \
  -e DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@tne-postgres-prod:5432/${DB_NAME}" \
  node:20-alpine \
  sh -c "npm install && npx prisma generate && npm run seed"
```

## Option 2: Execute in Postgres Container (SQL-based seeding)

If you have SQL seed files:

```bash
# Copy seed SQL to postgres container
docker cp package-service/seed.sql tne-postgres-prod:/tmp/

# Execute SQL
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -f /tmp/seed.sql
```

## Option 3: Add Package Service to Docker Compose (Recommended)

Add package-service to docker-compose.production.yml temporarily for seeding:

```yaml
package-service:
  build:
    context: .
    dockerfile: package-service/Dockerfile
  container_name: tne-package-prod
  restart: "no"  # Don't auto-restart
  environment:
    NODE_ENV: production
    PORT: 3012
    DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - tne-internal
  command: node src/utils/seed.js && node src/utils/seedTourReviews.js && node src/utils/seedReviews.js
```

Then run:
```bash
docker compose -f docker-compose.production.yml up package-service
```

## Option 4: Use Existing Node Container (If Any)

If you have any Node.js container running, you can install dependencies and run scripts:

```bash
# Install dependencies in a running container
docker exec -it <node-container> sh -c "cd /app && npm install @prisma/client prisma"

# Run seed scripts
docker exec -it <node-container> sh -c "cd /app && node seed.js"
```

## Quick Docker Seeding Command

```bash
cd ~/TNE_PROD/backend

# One-liner to seed via Docker
docker run --rm -it \
  --network backend_tne-internal \
  -v "$(pwd)/package-service:/app" \
  -w /app \
  -e DATABASE_URL="postgresql://${DB_USER:-postgres}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-tne_production}" \
  node:20-alpine sh -c "
    apk add --no-cache python3 make g++ && \
    npm install && \
    npx prisma generate && \
    npm run seed && \
    node src/utils/seedTourReviews.js && \
    node src/utils/seedReviews.js
  "
```

## Recommended Approach

For production, the **standalone script** (`seed-production.sh`) is the most reliable:

1. It runs directly on the server
2. Has full access to filesystem and database
3. No Docker networking complications
4. Easier to debug and verify

Run it as:
```bash
cd ~/TNE_PROD/backend
chmod +x seed-production.sh
./seed-production.sh
```
