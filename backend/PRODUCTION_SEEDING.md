# Production Database Seeding Guide

Complete guide for seeding tour packages, CineTrip packages, and reviews in production.

## Quick Start

### Option 1: Via Docker Exec (Recommended for Production)

```bash
cd ~/TNE_PROD/backend

# Method 1: Run seeding scripts directly via package-service container (if running)
docker exec -it package-service-prod node src/utils/seed.js
docker exec -it package-service-prod node src/utils/seedTourReviews.js
docker exec -it package-service-prod node src/utils/seedReviews.js

# Method 2: Run via npm scripts
docker exec -it package-service-prod npm run seed
```

### Option 2: Via API Endpoints (If Package Service is Running)

```bash
# Make sure package-service is running and accessible
curl -X POST http://localhost:5000/api/v1/seed/all

# Or seed individually:
curl -X POST http://localhost:5000/api/v1/seed/tour-packages
curl -X POST http://localhost:5000/api/v1/seed/cinetrip-packages
curl -X POST http://localhost:5000/api/v1/seed/tour-reviews
curl -X POST http://localhost:5000/api/v1/seed/cinetrip-reviews
```

### Option 3: Standalone Script (Direct Database Connection)

```bash
cd ~/TNE_PROD/backend/package-service

# Set DATABASE_URL in .env or environment
export DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# Run seeding scripts
node src/utils/seed.js
node src/utils/seedTourReviews.js
node src/utils/seedReviews.js
```

## Prerequisites

1. **Database is running and accessible**
   ```bash
   docker ps | grep postgres
   ```

2. **Database migrations are applied**
   ```bash
   cd ~/TNE_PROD/backend/package-service
   docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "\dt"
   ```

3. **Prisma Client is generated**
   ```bash
   cd ~/TNE_PROD/backend/package-service
   npx prisma generate
   ```

4. **DATABASE_URL is set correctly**
   ```bash
   # Check in .env file or docker-compose
   grep DATABASE_URL ~/TNE_PROD/backend/.env
   ```

## Step-by-Step Production Seeding

### Step 1: Verify Database Connection

```bash
# Test database connection
cd ~/TNE_PROD/backend/package-service
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "SELECT 1;"
```

### Step 2: Run Prisma Migrations (If Not Done)

```bash
cd ~/TNE_PROD/backend/package-service

# Generate Prisma Client
npx prisma generate

# Apply migrations to production database
npx prisma migrate deploy
```

### Step 3: Seed Tour Packages (27 packages)

```bash
cd ~/TNE_PROD/backend/package-service

# Via npm script
npm run seed

# Or directly
node src/utils/seed.js
```

**Expected Output:**
```
✅ Seeded 27 tour packages
✅ Seeded 12 CineTrip packages
```

### Step 4: Seed Tour Reviews (5-10 reviews per package = 135-270 reviews)

```bash
cd ~/TNE_PROD/backend/package-service

node src/utils/seedTourReviews.js
```

**Expected Output:**
```
✅ Seeded reviews for all tour packages
Total reviews: 135-270 (5-10 per package)
```

### Step 5: Seed CineTrip Reviews (5-10 reviews per package = 60-120 reviews)

```bash
cd ~/TNE_PROD/backend/package-service

node src/utils/seedReviews.js
```

**Expected Output:**
```
✅ Seeded reviews for all CineTrip packages
Total reviews: 60-120 (5-10 per package)
```

### Step 6: Verify Seeded Data

```bash
# Check tour packages count
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "SELECT COUNT(*) FROM tour_packages;"

# Check CineTrip packages count
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "SELECT COUNT(*) FROM cinetrip_packages;"

# Check tour reviews count
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "SELECT COUNT(*) FROM tour_reviews;"

# Check CineTrip reviews count
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "SELECT COUNT(*) FROM cinetrip_reviews;"
```

**Expected Counts:**
- Tour Packages: 27
- CineTrip Packages: 12
- Tour Reviews: 135-270
- CineTrip Reviews: 60-120

## Automated Seeding Script

Create a script for one-command seeding:

```bash
# Create seeding script
cat > ~/TNE_PROD/backend/seed-production.sh << 'EOF'
#!/bin/bash

set -e

echo "=========================================="
echo "Production Database Seeding"
echo "=========================================="
echo ""

cd ~/TNE_PROD/backend/package-service

# Set DATABASE_URL from environment
if [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Applying Prisma Migrations..."
npx prisma migrate deploy

echo ""
echo "Step 3: Seeding Tour and CineTrip Packages..."
npm run seed

echo ""
echo "Step 4: Seeding Tour Reviews..."
node src/utils/seedTourReviews.js

echo ""
echo "Step 5: Seeding CineTrip Reviews..."
node src/utils/seedReviews.js

echo ""
echo "=========================================="
echo "Seeding Complete!"
echo "=========================================="
echo ""
echo "Verification:"
docker exec -it tne-postgres-prod psql -U postgres -d tne_production <<SQL
SELECT 
  (SELECT COUNT(*) FROM tour_packages) as tour_packages,
  (SELECT COUNT(*) FROM cinetrip_packages) as cinetrip_packages,
  (SELECT COUNT(*) FROM tour_reviews) as tour_reviews,
  (SELECT COUNT(*) FROM cinetrip_reviews) as cinetrip_reviews;
SQL

EOF

chmod +x ~/TNE_PROD/backend/seed-production.sh

# Run the script
~/TNE_PROD/backend/seed-production.sh
```

## Data Being Seeded

### Tour Packages (27 packages)
1. Kashmir Paradise Tour - ₹34,999
2. Goa Beach Bliss - ₹18,999
3. Goa Honeymoon Special - ₹35,999
4. Goa Family Fun - ₹24,999
5. Manali Adventure - ₹22,999
6. Kerala Backwaters - ₹32,999
7. Royal Rajasthan - ₹38,999
8. Andaman Island Hopping - ₹42,999
9. Shimla Manali Combo - ₹26,999
10. ... and 17 more

### CineTrip Packages (12 packages)
1. CinemaTrip Experience - ₹45,999
2. Pre-Wedding Shoot - ₹35,999
3. Honeymoon Movie - ₹55,999
4. Family Trip Movie - ₹52,999
5. Anniversary Celebration - ₹39,999
6. Birthday Celebration - ₹25,999
7. Yacht Experiences - ₹75,999
8. Corporate Film Trip - ₹65,999
9. ... and 4 more

### Reviews
- **Tour Reviews:** 135-270 reviews (5-10 per tour package)
- **CineTrip Reviews:** 60-120 reviews (5-10 per CineTrip package)

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
cd ~/TNE_PROD/backend/package-service
npm install
npx prisma generate
```

### Issue: "Database connection failed"

**Solution:**
1. Check DATABASE_URL in `.env` file
2. Verify postgres container is running: `docker ps | grep postgres`
3. Test connection: `docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "SELECT 1;"`

### Issue: "Table does not exist"

**Solution:**
```bash
cd ~/TNE_PROD/backend/package-service
npx prisma migrate deploy
```

### Issue: "Error: P2002 - Unique constraint violation"

**Solution:** Data already exists. To reseed:
```sql
-- WARNING: This will delete all existing data!
TRUNCATE TABLE tour_packages CASCADE;
TRUNCATE TABLE cinetrip_packages CASCADE;
TRUNCATE TABLE tour_reviews CASCADE;
TRUNCATE TABLE cinetrip_reviews CASCADE;
```

Then rerun the seed scripts.

### Issue: Seed script runs but no data appears

**Solution:**
1. Check if scripts are running against correct database
2. Verify DATABASE_URL points to production database
3. Check for errors in script output
4. Verify tables exist: `npx prisma studio` or check via psql

## Verification via API

After seeding, verify via API (if package-service is running):

```bash
# Get all tour packages
curl http://localhost:5000/api/v1/tour-packages

# Get all CineTrip packages
curl http://localhost:5000/api/v1/cinetrip-packages

# Get package details
curl http://localhost:5000/api/v1/tour-packages/kashmir-paradise-tour
```

## Verification via Prisma Studio

```bash
cd ~/TNE_PROD/backend/package-service

# Open Prisma Studio (browser UI)
npx prisma studio

# Or access via port (if forwarded)
# http://localhost:5555
```

## Quick Reference Commands

```bash
# Complete seeding (all in one)
cd ~/TNE_PROD/backend/package-service && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run seed && \
node src/utils/seedTourReviews.js && \
node src/utils/seedReviews.js

# Verify data
docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c "
SELECT 
  (SELECT COUNT(*) FROM tour_packages) as tour_packages,
  (SELECT COUNT(*) FROM cinetrip_packages) as cinetrip_packages,
  (SELECT COUNT(*) FROM tour_reviews) as tour_reviews,
  (SELECT COUNT(*) FROM cinetrip_reviews) as cinetrip_reviews;
"
```

---

**Note:** All seed scripts are idempotent - they can be run multiple times safely. Existing records will be skipped.
