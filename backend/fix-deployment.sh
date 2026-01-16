#!/bin/bash

# ============================================================================
# TNE Platform - Deployment Fix Script
# Fixes shared module error and port 80 conflict
# ============================================================================

set -e  # Exit on error

echo "=========================================="
echo "TNE Platform - Deployment Fix"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}Error: docker-compose.production.yml not found${NC}"
    echo "Please run this script from the backend directory:"
    echo "  cd ~/TNE_PROD/backend"
    echo "  ./fix-deployment.sh"
    exit 1
fi

echo -e "${GREEN}Step 1: Stopping existing containers...${NC}"
docker compose -f docker-compose.production.yml down

echo ""
echo -e "${GREEN}Step 2: Checking for port 80 conflict...${NC}"
if sudo lsof -i :80 > /dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Port 80 is in use${NC}"
    echo "This is expected if nginx is running on the host."
    echo "The frontend container will now use an internal port only."
    echo ""
fi

echo -e "${GREEN}Step 3: Rebuilding Docker images (this fixes shared module error)...${NC}"
echo "This may take several minutes..."
docker compose -f docker-compose.production.yml build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Check the errors above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 4: Starting services...${NC}"
docker compose -f docker-compose.production.yml up -d

echo ""
echo -e "${GREEN}Step 5: Waiting for services to start...${NC}"
sleep 10

echo ""
echo -e "${GREEN}Step 6: Checking service status...${NC}"
docker compose -f docker-compose.production.yml ps

echo ""
echo -e "${GREEN}Step 7: Getting frontend container IP for nginx config...${NC}"
FRONTEND_IP=$(docker inspect tne-frontend-prod 2>/dev/null | grep -A 1 "IPAddress" | grep -v "SecondaryIPAddresses" | grep -oP '(?<="IPAddress": ")[^"]*' | head -1)

if [ -z "$FRONTEND_IP" ]; then
    echo -e "${YELLOW}Could not get frontend IP automatically.${NC}"
    echo "Run this manually: docker inspect tne-frontend-prod | grep IPAddress"
else
    echo -e "${GREEN}Frontend container IP: ${FRONTEND_IP}${NC}"
    echo ""
    echo "Update your nginx config with this IP:"
    echo "  upstream frontend_backend {"
    echo "      server ${FRONTEND_IP}:80;"
    echo "  }"
fi

echo ""
echo -e "${GREEN}Step 8: Checking service health...${NC}"

# Check API Gateway
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✓ API Gateway is healthy${NC}"
else
    echo -e "${RED}✗ API Gateway is not responding${NC}"
fi

# Check Auth Service
if curl -s http://localhost:3001/api/v1/health > /dev/null; then
    echo -e "${GREEN}✓ Auth Service is healthy${NC}"
else
    echo -e "${RED}✗ Auth Service is not responding${NC}"
    echo "  Check logs: docker compose -f docker-compose.production.yml logs auth-service"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Fix Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update nginx config to proxy to frontend container (see PORT_FIX.md)"
echo "2. Test services:"
echo "   docker compose -f docker-compose.production.yml logs -f"
echo ""
echo "View logs:"
echo "   docker compose -f docker-compose.production.yml logs <service-name>"
echo ""
