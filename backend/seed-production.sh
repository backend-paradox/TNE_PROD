#!/bin/bash

# ============================================================================
# TNE Platform - Production Database Seeding Script
# ============================================================================
# This script seeds the production database with:
#   - 27 Tour Packages
#   - 12 CineTrip Packages
#   - 135-270 Tour Reviews (5-10 per package)
#   - 60-120 CineTrip Reviews (5-10 per package)
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Production Database Seeding${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PACKAGE_SERVICE_DIR="$SCRIPT_DIR/package-service"

# Check if package-service directory exists
if [ ! -d "$PACKAGE_SERVICE_DIR" ]; then
    echo -e "${RED}Error: package-service directory not found${NC}"
    echo "Expected: $PACKAGE_SERVICE_DIR"
    exit 1
fi

cd "$PACKAGE_SERVICE_DIR"

# Check if .env file exists in backend directory
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${GREEN}Loading environment variables from $SCRIPT_DIR/.env${NC}"
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | grep -v '^$' | xargs)
else
    echo -e "${YELLOW}Warning: .env file not found in $SCRIPT_DIR${NC}"
    echo "Make sure DATABASE_URL is set in your environment"
fi

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it in .env file or export it:"
    echo "  export DATABASE_URL='postgresql://user:password@host:5432/dbname'"
    exit 1
fi

echo -e "${GREEN}Database URL: ${DATABASE_URL%%@*}@***${NC}"
echo ""

# Step 1: Generate Prisma Client
echo -e "${BLUE}Step 1: Generating Prisma Client...${NC}"
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo ""

# Step 2: Apply Prisma Migrations
echo -e "${BLUE}Step 2: Applying Prisma Migrations...${NC}"
if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️  Migration deployment had issues (this might be okay if migrations are already applied)${NC}"
fi

echo ""

# Step 3: Seed Tour and CineTrip Packages
echo -e "${BLUE}Step 3: Seeding Tour and CineTrip Packages...${NC}"
echo "This will seed:"
echo "  - 27 Tour Packages"
echo "  - 12 CineTrip Packages"
echo ""

if npm run seed; then
    echo -e "${GREEN}✅ Packages seeded successfully${NC}"
else
    echo -e "${RED}❌ Failed to seed packages${NC}"
    exit 1
fi

echo ""

# Step 4: Seed Tour Reviews
echo -e "${BLUE}Step 4: Seeding Tour Reviews...${NC}"
echo "This will seed 5-10 reviews per tour package (135-270 total)"
echo ""

if node src/utils/seedTourReviews.js; then
    echo -e "${GREEN}✅ Tour reviews seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Tour reviews seeding had issues (continuing anyway)${NC}"
fi

echo ""

# Step 5: Seed CineTrip Reviews
echo -e "${BLUE}Step 5: Seeding CineTrip Reviews...${NC}"
echo "This will seed 5-10 reviews per CineTrip package (60-120 total)"
echo ""

if node src/utils/seedReviews.js; then
    echo -e "${GREEN}✅ CineTrip reviews seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  CineTrip reviews seeding had issues (continuing anyway)${NC}"
fi

echo ""

# Step 6: Verify Seeded Data
echo -e "${BLUE}Step 6: Verifying Seeded Data...${NC}"
echo ""

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

# Try to get counts from database
if command -v docker &> /dev/null && docker ps | grep -q postgres; then
    echo "Querying database via Docker..."
    docker exec -it tne-postgres-prod psql -U ${DB_USER:-postgres} -d ${DB_NAME:-tne_production} <<SQL 2>/dev/null || true
SELECT 
  (SELECT COUNT(*) FROM tour_packages) as tour_packages,
  (SELECT COUNT(*) FROM cinetrip_packages) as cinetrip_packages,
  (SELECT COUNT(*) FROM tour_reviews) as tour_reviews,
  (SELECT COUNT(*) FROM cinetrip_reviews) as cinetrip_reviews;
SQL
else
    echo -e "${YELLOW}Note: Could not verify via Docker. Please verify manually:${NC}"
    echo "  docker exec -it tne-postgres-prod psql -U postgres -d tne_production -c 'SELECT COUNT(*) FROM tour_packages;'"
fi

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}Seeding Complete!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify data: npx prisma studio (in package-service directory)"
echo "2. Test API: curl http://localhost:5000/api/v1/tour-packages"
echo "3. Check frontend: Browse packages at your frontend URL"
echo ""
