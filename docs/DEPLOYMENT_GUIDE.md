# 🚀 Hướng Dẫn Deploy Chi Tiết - QuanhSS Travel Platform

**Kiến trúc**: CloudFront + S3 + GitHub Actions + Docker + EC2 + RDS

---

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Yêu Cầu Chuẩn Bị](#yêu-cầu-chuẩn-bị)
3. [Phase 1: Setup AWS Infrastructure](#phase-1-setup-aws-infrastructure)
4. [Phase 2: Setup CI/CD Pipeline](#phase-2-setup-cicd-pipeline)
5. [Phase 3: Deploy Backend](#phase-3-deploy-backend)
6. [Phase 4: Deploy Frontend](#phase-4-deploy-frontend)
7. [Phase 5: DNS & SSL Configuration](#phase-5-dns--ssl-configuration)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │   Route 53   │  (DNS)
                            │  yourdomain  │
                            └──────┬───────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                              ▼
            ┌──────────────┐              ┌──────────────┐
            │  CloudFront  │              │  Nginx EC2   │
            │   (Frontend) │              │  (API Proxy) │
            └──────┬───────┘              └──────┬───────┘
                   │                              │
                   ▼                              ▼
            ┌──────────────┐         ┌────────────────────────┐
            │   S3 Bucket  │         │   Backend EC2 (Docker) │
            │ Static Files │         │   EC2-1    │   EC2-2   │
            └──────────────┘         └────────────┬───────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  Amazon RDS  │
                                          │    MySQL     │
                                          └──────────────┘
```

---

## ✅ Yêu Cầu Chuẩn Bị

### AWS Account
- Tài khoản AWS với quyền truy cập:
  - EC2, RDS, S3, CloudFront, Route 53
  - IAM (để tạo access keys)

### Domain
- Một domain đã mua (VD: `yourdomain.com`)
- Hoặc sử dụng subdomain của Route 53

### Tools cần cài đặt
```bash
# AWS CLI
# Windows: Download từ https://aws.amazon.com/cli/
aws --version

# Docker
docker --version

# Git
git --version
```

### Codebase Analysis - QuanhSS
```
📁 Project Structure
├── backend/                    # Spring Boot (Java 21)
│   ├── Dockerfile             ✅ Đã có
│   ├── pom.xml                # Maven build
│   └── src/main/resources/
│       ├── application.yaml   # Cấu hình (gitignored)
│       └── application-prod.yaml
│
├── frontend/                   # React + Vite
│   ├── Dockerfile             ✅ Đã có
│   ├── nginx.conf             ✅ Đã có
│   ├── package.json
│   └── .env.example
│
└── docker-compose.yml         ✅ Đã có
```

**Environment Variables cần chuẩn bị:**

| Variable | Description | Ví dụ |
|----------|-------------|-------|
| `SPRING_DATASOURCE_URL` | JDBC URL cho RDS | `jdbc:mysql://rds-endpoint:3306/quanhss` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `admin` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `securepassword123` |
| `JWT_SIGNER_KEY` | Secret key cho JWT | `random-32-char-string` |
| `AWS_S3_ACCESS_KEY_ID` | S3 Access Key | `AKIAXXXXXXXX` |
| `AWS_S3_SECRET_ACCESS_KEY` | S3 Secret Key | `xxxxxxxxxxxxxxx` |
| `AWS_S3_BUCKET_NAME` | S3 Bucket name | `quanhss-uploads` |
| `AWS_S3_REGION` | AWS Region | `ap-southeast-1` |
| `AWS_S3_ENDPOINT` | S3 Endpoint | `https://s3.ap-southeast-1.amazonaws.com` |
| `VITE_API_BASE_URL` | Frontend API URL | `https://api.yourdomain.com` |

---

## 🔧 Phase 1: Setup AWS Infrastructure

### 1.1 Tạo VPC (Virtual Private Cloud)

```bash
# Sử dụng AWS Console hoặc CLI

# Tạo VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=quanhss-vpc}]'

# Tạo Subnets
# Public Subnet (cho Nginx EC2)
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone ap-southeast-1a

# Private Subnet (cho Backend EC2, RDS)
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone ap-southeast-1a
```

**Hoặc dùng AWS Console:**
1. Vào VPC Dashboard → Create VPC
2. Chọn "VPC and more" để tự động tạo subnets, internet gateway

### 1.2 Tạo Security Groups

#### Security Group cho Nginx EC2 (Public)
```bash
aws ec2 create-security-group \
  --group-name quanhss-nginx-sg \
  --description "Security group for Nginx reverse proxy" \
  --vpc-id vpc-xxx

# Inbound rules
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 22 --cidr YOUR_IP/32
```

#### Security Group cho Backend EC2 (Private)
```bash
aws ec2 create-security-group \
  --group-name quanhss-backend-sg \
  --description "Security group for Backend" \
  --vpc-id vpc-xxx

# Chỉ cho phép từ Nginx SG
aws ec2 authorize-security-group-ingress --group-id sg-backend --protocol tcp --port 8080 --source-group sg-nginx
aws ec2 authorize-security-group-ingress --group-id sg-backend --protocol tcp --port 22 --source-group sg-nginx
```

#### Security Group cho RDS
```bash
aws ec2 create-security-group \
  --group-name quanhss-rds-sg \
  --description "Security group for RDS" \
  --vpc-id vpc-xxx

# Chỉ cho phép từ Backend SG
aws ec2 authorize-security-group-ingress --group-id sg-rds --protocol tcp --port 3306 --source-group sg-backend
```

### 1.3 Tạo Amazon RDS (MySQL)

**Qua AWS Console:**
1. RDS → Create database
2. Chọn **MySQL 8.0**
3. Template: **Free tier** (development) hoặc **Production**
4. Settings:
   - DB Instance Identifier: `quanhss-db`
   - Master username: `admin`
   - Master password: `[Strong password]`
5. Instance: `db.t3.micro` (Free tier) hoặc `db.t3.small`
6. Storage: 20 GB GP3
7. Connectivity:
   - VPC: `quanhss-vpc`
   - Subnet group: Private subnets
   - Public access: **No**
   - Security group: `quanhss-rds-sg`
8. Database name: `quanhss`

**Lưu lại RDS Endpoint:**
```
quanhss-db.xxxxxxxxx.ap-southeast-1.rds.amazonaws.com
```

### 1.4 Tạo S3 Buckets

#### Bucket cho Frontend Static Files
```bash
aws s3 mb s3://quanhss-frontend --region ap-southeast-1

# Enable static website hosting
aws s3 website s3://quanhss-frontend --index-document index.html --error-document index.html

# Bucket policy cho CloudFront access (sẽ thêm OAI sau)
```

#### Bucket cho User Uploads (Tours, QR Codes)
```bash
aws s3 mb s3://quanhss-uploads --region ap-southeast-1

# CORS Configuration cho uploads
aws s3api put-bucket-cors --bucket quanhss-uploads --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com", "http://localhost:5173"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'
```

### 1.5 Tạo EC2 Instances

#### Backend EC2 (2 instances)
```bash
# Launch EC2 với Amazon Linux 2023
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids sg-backend \
  --subnet-id subnet-private \
  --count 2 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=quanhss-backend}]' \
  --user-data file://backend-userdata.sh
```

**backend-userdata.sh:**
```bash
#!/bin/bash
yum update -y
yum install -y docker git

# Start Docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### Nginx EC2 (1 instance - Public Subnet)
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-nginx \
  --subnet-id subnet-public \
  --associate-public-ip-address \
  --count 1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=quanhss-nginx}]' \
  --user-data file://nginx-userdata.sh
```

**nginx-userdata.sh:**
```bash
#!/bin/bash
yum update -y
amazon-linux-extras install nginx1 -y
systemctl start nginx
systemctl enable nginx
```

### 1.6 Cấu hình Nginx Reverse Proxy

SSH vào Nginx EC2:
```bash
ssh -i your-key.pem ec2-user@<NGINX_PUBLIC_IP>
```

Tạo file config `/etc/nginx/conf.d/api.conf`:
```nginx
upstream backend_servers {
    server <BACKEND_EC2_1_PRIVATE_IP>:8080;
    server <BACKEND_EC2_2_PRIVATE_IP>:8080;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 1.7 Tạo CloudFront Distribution

1. CloudFront → Create Distribution
2. Origin:
   - Origin domain: `quanhss-frontend.s3.ap-southeast-1.amazonaws.com`
   - Origin access: **Origin Access Control (OAC)**
   - Create OAC → Sign requests
3. Default cache behavior:
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: **GET, HEAD**
   - Cache policy: **CachingOptimized**
4. Settings:
   - Alternate domain name (CNAME): `www.yourdomain.com`, `yourdomain.com`
   - Custom SSL certificate: Request từ ACM
5. Default root object: `index.html`

**Error Pages (cho SPA routing):**
- 403 → `/index.html` → 200
- 404 → `/index.html` → 200

---

## 🔄 Phase 2: Setup CI/CD Pipeline

### 2.1 Tạo GitHub Secrets

Vào GitHub Repository → Settings → Secrets and variables → Actions

Thêm các secrets:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | IAM User Access Key |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key |
| `AWS_REGION` | `ap-southeast-1` |
| `S3_BUCKET_FRONTEND` | `quanhss-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `EXXXXXXXXX` |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `EC2_HOST_1` | Backend EC2-1 Private IP |
| `EC2_HOST_2` | Backend EC2-2 Private IP |
| `NGINX_HOST` | Nginx EC2 Public IP |
| `SSH_PRIVATE_KEY` | Private key content |
| `DB_URL` | `jdbc:mysql://rds-endpoint:3306/quanhss` |
| `DB_USERNAME` | `admin` |
| `DB_PASSWORD` | RDS password |
| `JWT_SIGNER_KEY` | JWT secret key |
| `S3_ACCESS_KEY` | S3 Access Key |
| `S3_SECRET_KEY` | S3 Secret Key |
| `S3_BUCKET_UPLOADS` | `quanhss-uploads` |
| `S3_ENDPOINT` | `https://s3.ap-southeast-1.amazonaws.com` |

### 2.2 Tạo GitHub Actions Workflows

#### Backend Workflow: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:

env:
  DOCKER_IMAGE: ${{ secrets.DOCKER_USERNAME }}/quanhss-backend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build JAR
        working-directory: ./backend
        run: mvn clean package -DskipTests

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.DOCKER_IMAGE }}:latest
            ${{ env.DOCKER_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-ec2-1:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2-1
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.NGINX_HOST }}
          username: ec2-user
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # SSH tunnel to private EC2
            ssh -o StrictHostKeyChecking=no ec2-user@${{ secrets.EC2_HOST_1 }} << 'EOF'
              docker pull ${{ env.DOCKER_IMAGE }}:latest
              docker stop quanhss-backend || true
              docker rm quanhss-backend || true
              docker run -d \
                --name quanhss-backend \
                --restart unless-stopped \
                -p 8080:8080 \
                -e SPRING_DATASOURCE_URL="${{ secrets.DB_URL }}" \
                -e SPRING_DATASOURCE_USERNAME="${{ secrets.DB_USERNAME }}" \
                -e SPRING_DATASOURCE_PASSWORD="${{ secrets.DB_PASSWORD }}" \
                -e JWT_SIGNERKEY="${{ secrets.JWT_SIGNER_KEY }}" \
                -e AWS_S3_ACCESS_KEY_ID="${{ secrets.S3_ACCESS_KEY }}" \
                -e AWS_S3_SECRET_ACCESS_KEY="${{ secrets.S3_SECRET_KEY }}" \
                -e AWS_S3_BUCKET_NAME="${{ secrets.S3_BUCKET_UPLOADS }}" \
                -e AWS_S3_REGION="${{ secrets.AWS_REGION }}" \
                -e AWS_S3_ENDPOINT="${{ secrets.S3_ENDPOINT }}" \
                -e SPRING_PROFILES_ACTIVE=prod \
                ${{ env.DOCKER_IMAGE }}:latest
            EOF

  deploy-ec2-2:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2-2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.NGINX_HOST }}
          username: ec2-user
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            ssh -o StrictHostKeyChecking=no ec2-user@${{ secrets.EC2_HOST_2 }} << 'EOF'
              docker pull ${{ env.DOCKER_IMAGE }}:latest
              docker stop quanhss-backend || true
              docker rm quanhss-backend || true
              docker run -d \
                --name quanhss-backend \
                --restart unless-stopped \
                -p 8080:8080 \
                -e SPRING_DATASOURCE_URL="${{ secrets.DB_URL }}" \
                -e SPRING_DATASOURCE_USERNAME="${{ secrets.DB_USERNAME }}" \
                -e SPRING_DATASOURCE_PASSWORD="${{ secrets.DB_PASSWORD }}" \
                -e JWT_SIGNERKEY="${{ secrets.JWT_SIGNER_KEY }}" \
                -e AWS_S3_ACCESS_KEY_ID="${{ secrets.S3_ACCESS_KEY }}" \
                -e AWS_S3_SECRET_ACCESS_KEY="${{ secrets.S3_SECRET_KEY }}" \
                -e AWS_S3_BUCKET_NAME="${{ secrets.S3_BUCKET_UPLOADS }}" \
                -e AWS_S3_REGION="${{ secrets.AWS_REGION }}" \
                -e AWS_S3_ENDPOINT="${{ secrets.S3_ENDPOINT }}" \
                -e SPRING_PROFILES_ACTIVE=prod \
                ${{ env.DOCKER_IMAGE }}:latest
            EOF
```

#### Frontend Workflow: `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_BASE_URL: https://api.yourdomain.com

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Deploy to S3
        working-directory: ./frontend
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_FRONTEND }} \
            --delete \
            --cache-control "max-age=31536000,public" \
            --exclude "index.html" \
            --exclude "*.json"
          
          # Upload index.html and JSON files with no-cache
          aws s3 cp dist/index.html s3://${{ secrets.S3_BUCKET_FRONTEND }}/index.html \
            --cache-control "no-cache,no-store,must-revalidate"
          
          # Upload any JSON files (like manifest)
          find dist -name "*.json" -exec aws s3 cp {} s3://${{ secrets.S3_BUCKET_FRONTEND }}/ \
            --cache-control "no-cache" \;

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## 🖥️ Phase 3: Deploy Backend

### 3.1 Chuẩn bị application-prod.yaml

Cập nhật `backend/src/main/resources/application-prod.yaml`:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

jwt:
  signerKey: ${JWT_SIGNERKEY}
  valid-duration: 7200
  refreshable-duration: 72000

aws:
  s3:
    access-key-id: ${AWS_S3_ACCESS_KEY_ID}
    secret-access-key: ${AWS_S3_SECRET_ACCESS_KEY}
    bucket-name: ${AWS_S3_BUCKET_NAME}
    region: ${AWS_S3_REGION}
    endpoint: ${AWS_S3_ENDPOINT}

server:
  port: 8080

logging:
  level:
    root: INFO
    com.devteria: INFO
```

### 3.2 Deploy thủ công lần đầu

SSH vào Backend EC2 qua Nginx (bastion):
```bash
# SSH to Nginx first
ssh -i key.pem ec2-user@<NGINX_PUBLIC_IP>

# From Nginx, SSH to Backend
ssh ec2-user@<BACKEND_PRIVATE_IP>

# Pull and run Docker
docker pull yourdockerhub/quanhss-backend:latest

docker run -d \
  --name quanhss-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://quanhss-db.xxx.rds.amazonaws.com:3306/quanhss" \
  -e SPRING_DATASOURCE_USERNAME="admin" \
  -e SPRING_DATASOURCE_PASSWORD="yourpassword" \
  -e JWT_SIGNERKEY="your-32-char-secret-key" \
  -e AWS_S3_ACCESS_KEY_ID="AKIAXXXX" \
  -e AWS_S3_SECRET_ACCESS_KEY="xxxxx" \
  -e AWS_S3_BUCKET_NAME="quanhss-uploads" \
  -e AWS_S3_REGION="ap-southeast-1" \
  -e AWS_S3_ENDPOINT="https://s3.ap-southeast-1.amazonaws.com" \
  -e SPRING_PROFILES_ACTIVE="prod" \
  yourdockerhub/quanhss-backend:latest

# Check logs
docker logs -f quanhss-backend
```

### 3.3 Kiểm tra Backend
```bash
# Từ Nginx EC2
curl http://<BACKEND_PRIVATE_IP>:8080/identity/auth/token

# Response should be 401 or proper error (not connection refused)
```

---

## 🌐 Phase 4: Deploy Frontend

### 4.1 Build Frontend với Production Config

```bash
cd frontend

# Tạo .env.production
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# Build
npm run build
```

### 4.2 Upload lên S3

```bash
# Sync static files
aws s3 sync dist/ s3://quanhss-frontend --delete

# Set permissions (nếu không dùng OAC)
aws s3api put-bucket-policy --bucket quanhss-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::quanhss-frontend/*"
    }
  ]
}'
```

### 4.3 Cấu hình CloudFront S3 Bucket Policy (OAC)

Sau khi tạo CloudFront với OAC, cập nhật S3 Bucket Policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::quanhss-frontend/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/DISTRIBUTION_ID"
                }
            }
        }
    ]
}
```

---

## 🔐 Phase 5: DNS & SSL Configuration

### 5.1 Route 53 Setup

1. Route 53 → Hosted zones → Create hosted zone
2. Domain name: `yourdomain.com`
3. Tạo các records:

| Name | Type | Value |
|------|------|-------|
| `yourdomain.com` | A | Alias to CloudFront |
| `www.yourdomain.com` | A | Alias to CloudFront |
| `api.yourdomain.com` | A | Nginx EC2 Public IP |

### 5.2 SSL Certificate (ACM)

1. ACM → Request certificate
2. Domain names:
   - `yourdomain.com`
   - `*.yourdomain.com`
3. Validation method: DNS validation
4. Thêm CNAME records vào Route 53 (AWS có thể tự động)

### 5.3 Cấu hình SSL cho Nginx

Cài Certbot trên Nginx EC2:
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Hoặc sử dụng ACM + ALB (khuyến nghị cho production).

---

## 🔍 Troubleshooting

### Backend không kết nối được RDS
```bash
# Check Security Group
# RDS SG phải allow inbound từ Backend SG trên port 3306

# Test connection từ Backend EC2
telnet <RDS_ENDPOINT> 3306
```

### CloudFront 403/404 Error
```bash
# Kiểm tra S3 bucket policy
# Kiểm tra CloudFront OAC configuration
# Kiểm tra index.html tồn tại
```

### CORS Error trên Frontend
```bash
# Kiểm tra Nginx CORS headers
# Kiểm tra backend CORS config
# S3 CORS configuration
```

### Docker container crash
```bash
docker logs quanhss-backend
docker inspect quanhss-backend
```

---

## 📊 Monitoring (Khuyến nghị thêm)

1. **CloudWatch Logs**: Thu thập logs từ EC2
2. **CloudWatch Alarms**: Alert khi CPU > 80%, Memory high
3. **RDS Performance Insights**: Monitor database
4. **X-Ray**: Distributed tracing

---

## 💰 Ước tính chi phí (ap-southeast-1)

| Service | Spec | Monthly Cost (USD) |
|---------|------|-------------------|
| EC2 (Nginx) | t3.micro | ~$8 |
| EC2 (Backend x2) | t3.small | ~$30 |
| RDS (MySQL) | db.t3.micro | ~$15 |
| S3 | 10 GB | ~$0.25 |
| CloudFront | 100 GB transfer | ~$10 |
| Route 53 | Hosted zone | ~$0.50 |
| **Total** | | **~$64/month** |

*Note: Giá tham khảo, có thể thay đổi.*

---

## ✅ Checklist Deploy

- [ ] VPC và Subnets đã tạo
- [ ] Security Groups đã cấu hình đúng
- [ ] RDS đang chạy và accessible
- [ ] S3 buckets đã tạo với policies đúng
- [ ] EC2 instances đang chạy
- [ ] Docker đã cài trên Backend EC2s
- [ ] Nginx đã cấu hình reverse proxy
- [ ] CloudFront distribution đã tạo
- [ ] Route 53 records đã thêm
- [ ] SSL certificates đã issue
- [ ] GitHub Actions secrets đã thêm
- [ ] CI/CD workflows đã tạo
- [ ] Test API endpoint hoạt động
- [ ] Test Frontend load thành công
- [ ] Test full flow: Login → Booking → etc.

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. CloudWatch Logs
2. Docker container logs
3. Nginx access/error logs
4. Browser DevTools → Network tab

**Author**: QuanhSS Team  
**Updated**: 2025-12-15
