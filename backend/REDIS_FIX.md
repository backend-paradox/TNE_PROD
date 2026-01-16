# Redis Configuration Fix

## Problem
Redis container was failing because:
1. `REDIS_PASSWORD` environment variable might not be set
2. Health check was failing when password is not configured

## Solution
Updated Redis configuration to:
1. Make password optional - Redis works with or without password
2. Updated health check to handle both cases
3. Updated `REDIS_URL` format for services to work with optional password

## Environment Variable

In your `.env` file, you can either:

**Option 1: Without password (development)**
```env
# Leave REDIS_PASSWORD empty or unset
REDIS_PASSWORD=
```

**Option 2: With password (production recommended)**
```env
REDIS_PASSWORD=your_secure_password_here
```

## Testing Redis

```bash
# Check Redis logs
docker logs tne-redis-prod

# Test Redis connection (no password)
docker exec -it tne-redis-prod redis-cli ping

# Test Redis connection (with password)
docker exec -it tne-redis-prod redis-cli -a your_password ping
```

## Restart Services

After fixing, restart the containers:

```bash
docker compose -f docker-compose.production.yml restart redis
docker compose -f docker-compose.production.yml ps redis
```
