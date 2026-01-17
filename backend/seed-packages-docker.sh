#!/bin/bash

set -e

echo "========================================"
echo "Seeding Packages via Docker"
echo "========================================"
echo ""

cd ~/TNE_PROD/backend

docker run --rm -it \
  --network tne-internal \
  -v $(pwd)/package-service:/app \
  -w /app \
  -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/tne_main" \
  node:18-alpine sh -c "
    echo 'Installing dependencies...'
    npm install --silent
    echo ''
    echo 'Generating Prisma Client...'
    npx prisma generate
    echo ''
    echo 'Running migrations...'
    npx prisma migrate deploy || true
    echo ''
    echo 'Seeding packages...'
    npm run seed
  "

echo ""
echo "Verifying..."
docker exec tne-postgres-prod psql -U postgres -d tne_main -c "
SELECT 
  (SELECT COUNT(*) FROM tour_packages) as tour_packages,
  (SELECT COUNT(*) FROM cinetrip_packages) as cinetrip_packages;
"

echo ""
echo "Complete!"
