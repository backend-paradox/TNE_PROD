# AWS Deployment Guide for TNE Platform

This guide will help you deploy the TNE Platform to AWS EC2.

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS recommended)
- Docker and Docker Compose installed
- Domain name (optional, for production)
- SSL certificate (optional, for HTTPS)

## Step 1: Setup EC2 Instance

### 1.1 Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu Server 22.04 LTS
3. Select instance type (t3.medium or larger recommended)
4. Configure security group:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (5000) - For API Gateway (optional, if not using reverse proxy)
5. Launch instance and save your key pair

### 1.2 Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.3 Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

Reconnect to your instance.

## Step 2: Clone and Setup Project

### 2.1 Clone Repository

```bash
cd ~
git clone <your-repo-url> TNE_PROD
cd TNE_PROD/backend
```

### 2.2 Create Environment File

Create a `.env` file in the `backend` directory:

```bash
nano .env
```

Add the following configuration (replace with your actual values):

```env
# Database Configuration
DB_NAME=tne_production
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# JWT Secrets (Generate strong secrets - at least 64 characters)
JWT_SECRET=your_jwt_secret_here_min_64_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_64_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION_DAYS=7

# Frontend URL
FRONTEND_URL=https://yourdomain.com,http://yourdomain.com
VITE_API_URL=https://yourdomain.com/api

# SMTP Configuration (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Trip & Event <noreply@tripandevent.com>"

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Twilio Configuration (SMS - Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Firebase Configuration (Push Notifications - Optional)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Redis Password
REDIS_PASSWORD=your_redis_password

# Service Ports
GATEWAY_PORT=5000
FRONTEND_PORT=80
FRONTEND_SSL_PORT=443

# Logging
LOG_LEVEL=info
NODE_ENV=production

# Gateway Settings
UPSTREAM_TIMEOUT_MS=30000
UPSTREAM_RETRY=3
CIRCUIT_ERROR_THRESHOLD=50
CIRCUIT_RESET_TIMEOUT_MS=30000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.3 Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 64 | tr -d '\n' > jwt_secret.txt
openssl rand -base64 64 | tr -d '\n' > jwt_refresh_secret.txt

# Generate Redis password
openssl rand -base64 32 | tr -d '\n' > redis_password.txt

# View generated secrets
cat jwt_secret.txt
cat jwt_refresh_secret.txt
cat redis_password.txt
```

Copy these values into your `.env` file.

## Step 3: Build and Start Services

### 3.1 Build Docker Images

```bash
cd ~/TNE_PROD/backend

# Build all services
docker compose -f docker-compose.production.yml build
```

### 3.2 Start Services

```bash
# Start all services
docker compose -f docker-compose.production.yml up -d

# Check service status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

### 3.3 Verify Services

```bash
# Check health endpoints
curl http://localhost:5000/health  # API Gateway
curl http://localhost:3001/api/v1/health  # Auth Service
curl http://localhost:3002/health  # User Service
```

## Step 4: Setup Reverse Proxy (Nginx)

### 4.1 Install Nginx

```bash
sudo apt install nginx -y
```

### 4.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/tne-platform
```

Add the following configuration:

```nginx
# Get frontend container IP (run this first to find the IP)
# docker inspect tne-frontend-prod | grep IPAddress

# Or use container name if docker network allows
upstream frontend {
    server 172.17.0.1:80;  # Change to your frontend container IP
    # Alternative: server tne-frontend-prod:80; (if using docker network)
}

upstream api_gateway {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend - proxy to frontend container
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Chat Service
    location /socket.io {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Important:** After starting containers, find the frontend container IP:
```bash
docker inspect tne-frontend-prod | grep IPAddress
# Or use container name in docker network
# Update the upstream frontend server IP in nginx config
```

### 4.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/tne-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

## Step 6: Database Migrations

### 6.1 Run Prisma Migrations

```bash
# Auth Service
cd ~/TNE_PROD/backend/auth-service
docker compose -f ../docker-compose.production.yml exec auth-service npx prisma migrate deploy

# User Service
cd ~/TNE_PROD/backend/user-service
docker compose -f ../docker-compose.production.yml exec user-service npx prisma migrate deploy

# Repeat for other services that use Prisma
```

## Step 7: Monitoring and Maintenance

### 7.1 View Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f auth-service
```

### 7.2 Restart Services

```bash
# Restart all
docker compose -f docker-compose.production.yml restart

# Restart specific service
docker compose -f docker-compose.production.yml restart auth-service
```

### 7.3 Update Services

```bash
cd ~/TNE_PROD/backend

# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

## Step 8: Backup Strategy

### 8.1 Database Backup

```bash
# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f ~/TNE_PROD/backend/docker-compose.production.yml exec -T postgres pg_dump -U postgres tne_production > $BACKUP_DIR/db_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-db.sh") | crontab -
```

## Troubleshooting

### Service Won't Start

1. Check logs: `docker compose -f docker-compose.production.yml logs <service-name>`
2. Verify environment variables: `docker compose -f docker-compose.production.yml config`
3. Check database connection: `docker compose -f docker-compose.production.yml exec postgres psql -U postgres -c "SELECT 1;"`

### Shared Module Error

If you see "Cannot find module '../../../shared/src/config/env'":
1. Ensure build context is set to `.` (backend directory)
2. Verify shared directory is copied in Dockerfile
3. Rebuild images: `docker compose -f docker-compose.production.yml build --no-cache`

### Database Connection Issues

1. Verify database is running: `docker compose -f docker-compose.production.yml ps postgres`
2. Check DATABASE_URL in .env file
3. Test connection: `docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d tne_production`

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secrets (64+ characters)
- [ ] Set up firewall rules (only necessary ports open)
- [ ] Configured SSL/TLS certificates
- [ ] Set up regular database backups
- [ ] Enabled log rotation
- [ ] Configured rate limiting
- [ ] Set up monitoring and alerts
- [ ] Restricted SSH access to specific IPs
- [ ] Updated all dependencies

## Support

For issues, check:
- Service logs: `docker compose logs <service>`
- Health endpoints: `curl http://localhost:<port>/health`
- Docker status: `docker ps`

---

*Last Updated: January 2025*
