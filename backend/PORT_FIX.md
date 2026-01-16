# Port 80 Conflict Fix

## Problem
Both Nginx (host) and Frontend container are trying to use port 80, causing a conflict.

## Solution

The frontend container should NOT expose port 80 directly. Instead:
1. Frontend container runs nginx on port 80 **inside** the container
2. Host nginx proxies to the frontend container via Docker network
3. Host nginx handles SSL and external access on port 80/443

## Changes Made

### 1. Updated docker-compose.production.yml
- Changed `ports:` to `expose:` for frontend
- Frontend is now only accessible via Docker network, not directly on host port 80

### 2. Nginx Configuration

You need to update your host nginx to proxy to the frontend container.

## Quick Fix Steps

### Step 1: Stop current containers
```bash
cd ~/TNE_PROD/backend
docker compose -f docker-compose.production.yml down
```

### Step 2: Find Frontend Container IP
After starting containers, get the frontend container IP:
```bash
# Start containers first
docker compose -f docker-compose.production.yml up -d

# Get frontend container IP
docker inspect tne-frontend-prod | grep IPAddress
# Or use container name directly if on same network
```

### Step 3: Update Nginx Config

Edit your nginx config:
```bash
sudo nano /etc/nginx/sites-available/tne-platform
```

Use this configuration:

```nginx
# Get frontend container IP first:
# docker inspect tne-frontend-prod | grep IPAddress

upstream frontend_backend {
    # Option 1: Use container IP (replace with actual IP from docker inspect)
    server 172.17.0.X:80;
    
    # Option 2: If using docker network bridge, use container name
    # This requires nginx to be on the same docker network
    # server tne-frontend-prod:80;
}

upstream api_gateway {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://frontend_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Step 4: Alternative - Use Docker Network (Recommended)

Better approach: Connect nginx to Docker network so it can use container names:

1. **Find Docker network name:**
```bash
docker network ls
# Look for network created by docker-compose (usually tne_prod_tne-external)
```

2. **Update nginx config to use container name:**
```nginx
upstream frontend_backend {
    server tne-frontend-prod:80;  # Container name
}
```

3. **Connect nginx to docker network (if not already):**
```bash
# Find network name
docker network ls | grep tne

# Connect nginx container/process to network
# If nginx is in docker:
docker network connect tne_prod_tne-external nginx-container

# If nginx is on host, you may need to use host network mode or
# run nginx in a container connected to the same network
```

### Step 5: Test and Reload
```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify frontend is accessible
curl -I https://yourdomain.com
```

## Architecture

```
Internet → Host Nginx (port 80/443) → Frontend Container (port 80 internal)
                                    → API Gateway Container (port 5000)
```

- Host nginx handles SSL termination
- Host nginx proxies to containers via Docker network
- Containers don't expose ports directly to host (except API Gateway for internal access)

## Troubleshooting

### Can't connect to frontend container
```bash
# Check if frontend container is running
docker ps | grep frontend

# Check container IP
docker inspect tne-frontend-prod | grep IPAddress

# Test connection from host
curl http://<container-ip>:80
```

### Nginx can't resolve container name
- Make sure nginx is on the same Docker network
- Or use container IP instead of container name
- Check network: `docker network inspect <network-name>`

### Port 80 still in use
```bash
# Check what's using port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Stop conflicting service
sudo systemctl stop <service-name>
```
