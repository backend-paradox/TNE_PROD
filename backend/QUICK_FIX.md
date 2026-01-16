# Quick Fix for Shared Module Error and Port 80 Conflict

## Problems
1. **Shared Module Error:**
```
Error: Cannot find module '../../../shared/src/config/env'
```

2. **Port 80 Conflict:**
Frontend container and host nginx both trying to use port 80

## Solution

The issue is that Dockerfiles need to copy the `shared` directory and the build context needs to be set to the backend directory.

### Already Fixed:
✅ All Dockerfiles have been updated to include shared directory
✅ docker-compose.production.yml has been updated with correct build context

### Quick Fix Script (Recommended):

```bash
cd ~/TNE_PROD/backend
chmod +x fix-deployment.sh
./fix-deployment.sh
```

### Manual Fix Steps:

1. **Stop all running containers:**
```bash
cd ~/TNE_PROD/backend
docker compose -f docker-compose.production.yml down
```

2. **Rebuild all images (this fixes the shared module issue):**
```bash
docker compose -f docker-compose.production.yml build --no-cache
```

3. **Start services:**
```bash
docker compose -f docker-compose.production.yml up -d
```

4. **Get frontend container IP for nginx:**
```bash
docker inspect tne-frontend-prod | grep IPAddress
```

5. **Update nginx config** (see PORT_FIX.md for details):
   - Frontend container no longer exposes port 80 directly
   - Nginx should proxy to frontend container IP:80

6. **Verify services are running:**
```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs auth-service
```

### What Was Changed:

1. **All Dockerfiles** now:
   - Copy the `shared/` directory in the build stage
   - Use multi-stage builds for better optimization
   - Include proper health checks
   - Run as non-root user for security

2. **docker-compose.production.yml** now:
   - Uses build context `.` (backend directory) instead of individual service directories
   - This allows Dockerfiles to access the `shared/` directory

### Testing:

```bash
# Check if auth-service can start
docker compose -f docker-compose.production.yml logs auth-service

# Test health endpoint
curl http://localhost:3001/api/v1/health

# If successful, you should see:
# {"status":"ok","service":"auth-service"}
```

### If Still Having Issues:

1. **Check build context:**
```bash
# Verify you're in the backend directory
pwd  # Should show: ~/TNE_PROD/backend

# Verify shared directory exists
ls -la shared/
```

2. **Clean everything and rebuild:**
```bash
docker compose -f docker-compose.production.yml down -v
docker system prune -a -f
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d
```

3. **Check specific service logs:**
```bash
docker compose -f docker-compose.production.yml logs auth-service
docker compose -f docker-compose.production.yml logs user-service
```

---

**Note:** The build context change means you must run `docker compose` commands from the `backend/` directory, not from individual service directories.
