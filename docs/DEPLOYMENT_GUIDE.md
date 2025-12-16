# 🚀 Hướng Dẫn Deploy Chi Tiết - QuanhSS Travel Platform

**Kiến trúc**: CloudFront + S3 + GitHub Actions + Docker + EC2 + Aiven MySQL

---

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Yêu Cầu Chuẩn Bị](#yêu-cầu-chuẩn-bị)
3. [Database: Aiven MySQL](#database-aiven-mysql)
4. [Phase 1: Setup AWS Infrastructure](#phase-1-setup-aws-infrastructure)
5. [Phase 2: Setup CI/CD Pipeline](#phase-2-setup-cicd-pipeline)
6. [Phase 3: Deploy Backend](#phase-3-deploy-backend)
7. [Phase 4: Deploy Frontend](#phase-4-deploy-frontend)
8. [Phase 5: DNS & SSL Configuration](#phase-5-dns--ssl-configuration)
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
                            │ Domain (DNS) │  
                            │ Namecheap/   │
                            │ GoDaddy/etc  │
                            └──────┬───────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                              ▼
            ┌──────────────┐              ┌──────────────┐
            │  CloudFront  │              │  Nginx EC2   │
            │   (Frontend) │              │ (Public IP)  │
            └──────┬───────┘              └──────┬───────┘
                   │                              │
                   ▼                              ▼
            ┌──────────────┐         ┌────────────────────────┐
            │   S3 Bucket  │         │   Backend EC2 (Docker) │
            │ Static Files │         │  EC2-1  │  EC2-2       │
            └──────────────┘         │ (Public Subnet)        │
                                     └────────────┬───────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │ Aiven MySQL  │
                                          │   (Cloud)    │
                                          └──────────────┘
```

**Kiến trúc đơn giản hóa:**
- ✅ Tất cả EC2 đều ở **Public Subnet** → Không cần NAT Gateway
- ✅ Security Groups kiểm soát traffic → Vẫn an toàn
- ✅ Tiết kiệm ~$32/tháng (NAT Gateway cost)
- ✅ Nginx reverse proxy vẫn load balance giữa 2 backend

---

## ✅ Yêu Cầu Chuẩn Bị

### AWS Account
- Tài khoản AWS với quyền truy cập:
  - EC2, S3, CloudFront, ACM (Certificate Manager)
  - IAM (để tạo access keys)
  - **Không cần Route 53** - dùng DNS từ nhà cung cấp domain

### Domain (Đã có sẵn)
- Domain đã đăng ký ở nhà cung cấp bên thứ 3 (Namecheap, GoDaddy, etc.)
- Quyền truy cập vào DNS Management panel

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
| `SPRING_DATASOURCE_URL` | JDBC URL cho Aiven MySQL | `jdbc:mysql://mysql-xxx.aivencloud.com:10404/quanh` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `avnadmin` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `AVNS_xxxxx` |
| `JWT_SIGNER_KEY` | Secret key cho JWT | `random-32-char-string` |
| `AWS_S3_ACCESS_KEY_ID` | S3 Access Key | `AKIAXXXXXXXX` |
| `AWS_S3_SECRET_ACCESS_KEY` | S3 Secret Key | `xxxxxxxxxxxxxxx` |
| `AWS_S3_BUCKET_NAME` | S3 Bucket name | `quanhss-uploads` |
| `AWS_S3_REGION` | AWS Region | `ap-southeast-1` |
| `AWS_S3_ENDPOINT` | S3 Endpoint | `https://s3.ap-southeast-1.amazonaws.com` |
| `VITE_API_BASE_URL` | Frontend API URL | `https://api.yourdomain.com` |

---

## 🗄️ Database: Aiven MySQL (Dịch vụ đã có sẵn)

Bạn đang sử dụng **Aiven Cloud MySQL** - một managed database service. Đây là lựa chọn tốt vì:

### ✅ Ưu điểm của Aiven so với AWS RDS
- **Không cần setup trên AWS** - giảm phức tạp
- **Free tier** khá rộng rãi (1 node, 1GB RAM)
- **Cross-cloud** - có thể kết nối từ bất kỳ đâu
- **Automatic backups** đã được cấu hình

### 📝 Thông tin kết nối Aiven MySQL

```yaml
# Connection Details (Lưu vào GitHub Secrets)
Host: mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com
Port: 10404
Database: quanh
Username: avnadmin
Password: AVNS_lMHHQZnQlVaKNWFxbgP

# JDBC URL
jdbc:mysql://mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com:10404/quanh
```

### 🔒 Lưu ý Bảo mật

> ⚠️ **QUAN TRỌNG**: Không commit credentials vào code!
> Lưu tất cả thông tin này vào **GitHub Secrets** hoặc **Environment Variables**.

### 🛠️ Kiểm tra kết nối

```bash
# Test kết nối với MySQL CLI
mysql -h mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com \
      -P 10404 \
      -u avnadmin \
      -p \
      quanh

# Hoặc dùng Docker
docker run -it --rm mysql:8 mysql \
  -h mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com \
  -P 10404 \
  -u avnadmin \
  -pAVNS_lMHHQZnQlVaKNWFxbgP \
  quanh
```

### 📊 Aiven Console

Để quản lý database, truy cập:
- **URL**: https://console.aiven.io/
- Xem metrics, logs, backups tại đây

---

## 🔧 Phase 1: Setup AWS Infrastructure

> **Lưu ý**: 
> - Vì dùng Aiven MySQL, bạn **không cần tạo RDS** trên AWS
> - Tất cả EC2 đặt ở **Public Subnet** → Không cần NAT Gateway (tiết kiệm chi phí)
> - Security Groups sẽ kiểm soát traffic → Vẫn đảm bảo bảo mật

### 1.1 Tạo VPC (Simplified)

**Cách nhanh nhất - Dùng AWS Console:**
1. Vào **VPC Dashboard** → **Create VPC**
2. Chọn **"VPC and more"** (tự động tạo subnets, internet gateway)
3. Cấu hình:
   - Name: `quanhss-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - Number of AZs: `1` (tiết kiệm)
   - Number of public subnets: `1`
   - Number of private subnets: `0` ← **Quan trọng: Không cần private subnet**
   - NAT gateways: `None` ← **Tiết kiệm $32/tháng**
   - VPC endpoints: `None`
4. Click **Create VPC**

**Hoặc dùng CLI:**
```bash
# Tạo VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=quanhss-vpc}]'

# Lưu VPC ID
VPC_ID=vpc-xxxxxxxxx

# Tạo Public Subnet (cho tất cả EC2)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-southeast-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=quanhss-public-subnet}]'

# Lưu Subnet ID
SUBNET_ID=subnet-xxxxxxxxx

# Tạo Internet Gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=quanhss-igw}]'
IGW_ID=igw-xxxxxxxxx

# Attach Internet Gateway vào VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# Tạo Route Table cho public subnet
aws ec2 create-route-table --vpc-id $VPC_ID --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=quanhss-public-rt}]'
RT_ID=rtb-xxxxxxxxx

# Thêm route đến Internet Gateway
aws ec2 create-route --route-table-id $RT_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID

# Associate route table với subnet
aws ec2 associate-route-table --subnet-id $SUBNET_ID --route-table-id $RT_ID
```

### 1.2 Tạo Security Groups

#### Security Group cho Nginx EC2
```bash
aws ec2 create-security-group \
  --group-name quanhss-nginx-sg \
  --description "Security group for Nginx reverse proxy" \
  --vpc-id $VPC_ID

# Lưu SG ID
NGINX_SG=sg-xxxxxxxxx

# Inbound rules
aws ec2 authorize-security-group-ingress --group-id $NGINX_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $NGINX_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $NGINX_SG --protocol tcp --port 22 --cidr YOUR_IP/32
```

#### Security Group cho Backend EC2 (Public Subnet)
```bash
aws ec2 create-security-group \
  --group-name quanhss-backend-sg \
  --description "Security group for Backend EC2" \
  --vpc-id $VPC_ID

# Lưu SG ID
BACKEND_SG=sg-xxxxxxxxx

# Inbound rules
# Cho phép port 8080 từ Nginx SG (load balancing)
aws ec2 authorize-security-group-ingress --group-id $BACKEND_SG --protocol tcp --port 8080 --source-group $NGINX_SG

# Cho phép SSH từ IP của bạn (để deploy)
aws ec2 authorize-security-group-ingress --group-id $BACKEND_SG --protocol tcp --port 22 --cidr YOUR_IP/32

# Outbound: Mặc định allow all (cần để kết nối Aiven MySQL qua internet)
```

**Lưu ý bảo mật:**
- ✅ Backend chỉ nhận traffic port 8080 từ Nginx
- ✅ SSH chỉ từ IP của bạn
- ✅ Không expose port 8080 ra internet trực tiếp

### 1.3 Tạo S3 Buckets

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

### 1.4 Tạo EC2 Instances (Tất cả ở Public Subnet)

#### Backend EC2 (2 instances - Public Subnet)
```bash
# Launch 2 Backend EC2 instances
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids $BACKEND_SG \
  --subnet-id $SUBNET_ID \
  --associate-public-ip-address \
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
  --security-group-ids $NGINX_SG \
  --subnet-id $SUBNET_ID \
  --associate-public-ip-address \
  --count 1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=quanhss-nginx}]' \
  --user-data file://nginx-userdata.sh
```

**nginx-userdata.sh:**
```bash
#!/bin/bash
yum update -y
sudo yum install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 1.5 Cấu hình Nginx Reverse Proxy

SSH vào Nginx EC2:
```bash
ssh -i your-key.pem ec2-user@<NGINX_PUBLIC_IP>
```

**Lấy Private IP của Backend EC2s:**
```bash
# Từ AWS Console hoặc CLI
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=quanhss-backend" \
  --query 'Reservations[*].Instances[*].[PrivateIpAddress,InstanceId]' \
  --output table

# Ví dụ output:
# 10.0.1.10  i-xxxxxxxxx (Backend-1)
# 10.0.1.11  i-yyyyyyyyy (Backend-2)
```

Tạo file config `/etc/nginx/conf.d/api.conf`:
```nginx
upstream backend_servers {
    server 10.0.1.10:8080;  # Backend EC2-1 Private IP
    server 10.0.1.11:8080;  # Backend EC2-2 Private IP
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
| `DB_URL` | `jdbc:mysql://mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com:10404/quanh` |
| `DB_USERNAME` | `avnadmin` |
| `DB_PASSWORD` | Aiven password |
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

**Cách 1: SSH trực tiếp vào Backend EC2 (vì đã có Public IP)**
```bash
# SSH trực tiếp vào Backend EC2
ssh -i key.pem ec2-user@<BACKEND_EC2_PUBLIC_IP>

# Pull and run Docker
docker pull yourdockerhub/quanhss-backend:latest

docker run -d \
  --name quanhss-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com:10404/quanh" \
  -e SPRING_DATASOURCE_USERNAME="avnadmin" \
  -e SPRING_DATASOURCE_PASSWORD="AVNS_lMHHQZnQlVaKNWFxbgP" \
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
# Test từ Nginx EC2 (qua private IP)
ssh -i key.pem ec2-user@<NGINX_PUBLIC_IP>
curl http://<BACKEND_PRIVATE_IP>:8080/api/

# Hoặc test trực tiếp từ máy local (qua public IP - chỉ để test)
curl http://<BACKEND_PUBLIC_IP>:8080/api/

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

## 🌐 Phase 5: DNS & SSL Configuration

### 5.1 Cấu hình DNS tại nhà cung cấp Domain

**Bước 1: Lấy thông tin cần thiết từ AWS**

```bash
# 1. CloudFront Domain Name
# Vào CloudFront Console → Distributions → Copy "Distribution domain name"
# Ví dụ: d111111abcdef8.cloudfront.net

# 2. Nginx EC2 Public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=quanhss-nginx" \
  --query 'Reservations[*].Instances[*].PublicIpAddress' \
  --output text
# Ví dụ: 13.250.123.45
```

**Bước 2: Cấu hình DNS Records**

Đăng nhập vào **DNS Management** của nhà cung cấp domain (Namecheap, GoDaddy, etc.) và tạo các records:

#### Option A: Sử dụng CNAME (Khuyến nghị)

| Type | Host/Name | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| CNAME | `www` | `d111111abcdef8.cloudfront.net` | 300 |
| CNAME | `@` hoặc để trống | `www.yourdomain.com` | 300 |
| A | `api` | `13.250.123.45` (Nginx EC2 IP) | 300 |

#### Option B: Sử dụng A Record với ALIAS (nếu provider hỗ trợ)

| Type | Host/Name | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| ALIAS | `@` | `d111111abcdef8.cloudfront.net` | 300 |
| CNAME | `www` | `yourdomain.com` | 300 |
| A | `api` | `13.250.123.45` (Nginx EC2 IP) | 300 |

**Lưu ý theo từng nhà cung cấp:**

<details>
<summary><b>Namecheap</b></summary>

1. Đăng nhập Namecheap → Domain List
2. Click **Manage** bên cạnh domain
3. Tab **Advanced DNS**
4. Add New Record:
   - **CNAME Record**: Host = `www`, Value = CloudFront domain
   - **URL Redirect**: Host = `@`, Value = `http://www.yourdomain.com`
   - **A Record**: Host = `api`, Value = Nginx EC2 IP

</details>

<details>
<summary><b>GoDaddy</b></summary>

1. Đăng nhập GoDaddy → My Products → DNS
2. Click domain của bạn
3. Add Records:
   - **CNAME**: Name = `www`, Value = CloudFront domain
   - **Forwarding**: Forward `yourdomain.com` to `www.yourdomain.com`
   - **A**: Name = `api`, Value = Nginx EC2 IP

</details>

<details>
<summary><b>Cloudflare (nếu dùng)</b></summary>

1. Cloudflare Dashboard → DNS → Records
2. Add record:
   - **CNAME**: Name = `www`, Target = CloudFront domain, **Proxy status: DNS only** (tắt orange cloud)
   - **CNAME**: Name = `@`, Target = `www.yourdomain.com`
   - **A**: Name = `api`, IPv4 = Nginx EC2 IP

⚠️ **Quan trọng**: Phải tắt Cloudflare proxy (grey cloud) cho CloudFront CNAME!

</details>

**Bước 3: Verify DNS Propagation**

```bash
# Kiểm tra DNS đã propagate chưa
nslookup www.yourdomain.com
nslookup api.yourdomain.com

# Hoặc dùng online tool
# https://dnschecker.org
```

DNS có thể mất **5-30 phút** để propagate toàn cầu.

### 5.2 SSL Certificate (AWS Certificate Manager)

**Bước 1: Request Certificate**

1. Vào **AWS Certificate Manager (ACM)** → **Request certificate**
2. Certificate type: **Request a public certificate**
3. Domain names:
   ```
   yourdomain.com
   *.yourdomain.com
   ```
4. Validation method: **DNS validation** (khuyến nghị)
5. Click **Request**

**Bước 2: Validate Certificate qua DNS**

Sau khi request, ACM sẽ hiển thị CNAME records cần thêm:

```
Name: _abc123.yourdomain.com
Value: _xyz456.acm-validations.aws.
```

**Thêm CNAME record này vào DNS provider của bạn:**

- **Namecheap**: Advanced DNS → Add New Record → CNAME
- **GoDaddy**: DNS Management → Add → CNAME
- **Cloudflare**: DNS → Add record → CNAME

**Lưu ý:**
- Copy chính xác Name và Value từ ACM
- Bỏ domain root nếu provider tự động thêm (VD: chỉ nhập `_abc123` thay vì `_abc123.yourdomain.com`)
- TTL: 300 hoặc Auto

**Bước 3: Đợi Validation**

Validation thường mất **5-30 phút**. Kiểm tra status trong ACM Console.

✅ Khi status = **Issued**, certificate đã sẵn sàng!

**Bước 4: Attach Certificate vào CloudFront**

1. CloudFront → Distributions → Chọn distribution của bạn → **Edit**
2. **Alternate domain names (CNAMEs)**:
   ```
   yourdomain.com
   www.yourdomain.com
   ```
3. **Custom SSL certificate**: Chọn certificate vừa tạo
4. **Save changes**

⏳ CloudFront deployment mất ~10-15 phút.

### 5.3 Cấu hình SSL cho Nginx (Let's Encrypt)

**Option A: Sử dụng Certbot (Khuyến nghị - Free SSL)**

SSH vào Nginx EC2:
```bash
ssh -i key.pem ec2-user@<NGINX_PUBLIC_IP>

# Cài đặt Certbot
sudo yum install -y certbot python3-certbot-nginx

# Request SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Certbot sẽ hỏi:
# 1. Email: nhập email của bạn
# 2. Terms of Service: A (Agree)
# 3. Share email: N (No)
# 4. Redirect HTTP to HTTPS: 2 (Yes, redirect)

# Verify SSL
curl https://api.yourdomain.com
```

**Auto-renewal:**
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot tự động tạo cron job để renew
# Kiểm tra:
sudo systemctl status certbot-renew.timer
```

**Option B: Sử dụng AWS Certificate Manager + Application Load Balancer**

Nếu muốn dùng ACM cho API (tốn thêm tiền cho ALB ~$16/tháng):

1. Tạo Application Load Balancer
2. Target Group → Backend EC2 instances
3. Listener HTTPS:443 → Attach ACM certificate
4. Update DNS: `api.yourdomain.com` → ALB DNS name

💡 **Khuyến nghị**: Dùng Certbot (Option A) để tiết kiệm chi phí!

---

## 🔍 Troubleshooting

### Backend không kết nối được Aiven MySQL
```bash
# Kiểm tra kết nối từ EC2
telnet mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com 10404

# Nếu không kết nối được:
# 1. Kiểm tra Security Group - outbound rule phải allow traffic ra internet
# 2. Kiểm tra NAT Gateway nếu EC2 ở private subnet
# 3. Kiểm tra Aiven IP whitelist (nếu đã cấu hình)
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
| ~~RDS (MySQL)~~ | ~~db.t3.micro~~ | ~~$15~~ **FREE (Aiven)** |
| ~~NAT Gateway~~ | | ~~$32~~ **SAVED!** |
| S3 | 10 GB | ~$0.25 |
| CloudFront | 100 GB transfer | ~$10 |
| ~~Route 53~~ | ~~Hosted zone~~ | ~~$0.50~~ **FREE (External DNS)** |
| **Total** | | **~$48.75/month** |

**Tiết kiệm được:**
- ✅ Không dùng RDS → Dùng Aiven free tier: **-$15/tháng**
- ✅ Không cần NAT Gateway (EC2 ở public subnet): **-$32/tháng**
- 💰 **Tổng tiết kiệm: ~$47/tháng** so với kiến trúc full AWS!

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
