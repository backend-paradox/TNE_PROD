# Zookeeper Health Check Fix

## Problem
Zookeeper health check was failing because:
1. `nc` command might need timeout flag
2. Zookeeper needs more time to start (start_period was too short)
3. The health check command might not be available in the container

## Solution
Updated Zookeeper configuration:
1. Added `-w 1` timeout to `nc` command
2. Increased `start_period` to 60s (Zookeeper can take time to initialize)
3. Health check will retry properly

## Alternative Health Check

If the health check still fails, you can use this alternative:

```yaml
healthcheck:
  test: ["CMD-SHELL", "nc -z localhost 2181 || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

Or disable health check temporarily for Zookeeper (not recommended for production):

```yaml
# Remove healthcheck section if needed for testing
```

## Testing Zookeeper

```bash
# Check Zookeeper logs
docker logs tne-zookeeper-prod

# Test Zookeeper connection
docker exec -it tne-zookeeper-prod nc localhost 2181
# Then type: ruok
# Should respond: imok

# Check container status
docker compose -f docker-compose.production.yml ps zookeeper
```

## Restart Services

After fixing, restart Zookeeper:

```bash
docker compose -f docker-compose.production.yml restart zookeeper
docker compose -f docker-compose.production.yml ps zookeeper
```
