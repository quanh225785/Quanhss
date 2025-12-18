# 🚀 Hướng Dẫn Deploy Chi Tiết - QuanhSS Travel Platform

**Kiến trúc**: CloudFront + S3 + GitHub Actions + Docker + EC2 + Aiven MySQL
- LÚC BUILD, NHỚ ĐỂ Ý DOCKERFILE XÓA HẾT CÁC YAML CÓ SECRET

- Lúc ssh vào backend, phải ssh thông qua nginx, nhưng nginx không có key, nên phải setup để jump


# Cấu hình cho Nginx (Bastion Host)
Host bastion
    HostName 54.255.219.226
    User ec2-user
    IdentityFile C:\Users\LynG\Downloads\backend.pem

# Cấu hình cho Backend (Đi qua Bastion)
Host backend
    HostName 10.0.13.12
    User ec2-user
    IdentityFile C:\Users\LynG\Downloads\backend.pem
    ProxyJump bastion
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
9. [🔒 Security Best Practices](#security-best-practices)

---

## 🔒 QUAN TRỌNG: Bảo Mật Secrets

### ⚠️ CẢNH BÁO: Nếu đã push secrets lên Git

Nếu `application.yaml` hoặc file chứa credentials đã được push lên Git (dù là private repo), bạn **BẮT BUỘC** phải:

#### 1. Rotate (đổi) TẤT CẢ credentials bị lộ

| Secret | Cách đổi |
|--------|----------|
| **Aiven MySQL password** | [Aiven Console](https://console.aiven.io/) → Service → Users → Reset password |
| **JWT Signer Key** | Generate key mới: `openssl rand -base64 32` |
| **AWS S3 Access Keys** | AWS IAM → Users → Security credentials → Create new access key → Deactivate old |
| **Email password** | Đổi password trong email provider |
| **Vietmap API Key** | Vietmap Dashboard → Generate new key |

#### 2. Xóa file khỏi Git history (Khuyến nghị)

```bash
# Option 1: Dùng BFG Repo-Cleaner (nhanh nhất)
# Download: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files application.yaml

# Option 2: Dùng git filter-repo
pip install git-filter-repo
git filter-repo --path backend/src/main/resources/application.yaml --invert-paths

# Force push sau khi xóa (⚠️ coordinate với team!)
git push origin --force --all
git push origin --force --tags
```

#### 3. Verify file đã được gitignore

```bash
# Kiểm tra .gitignore đã có
cat backend/.gitignore | grep application.yaml

# Output expected:
# application.yaml

# Kiểm tra file không còn được track
git ls-files | grep application.yaml
# Output should be EMPTY
```

### ✅ Cách đúng: Sử dụng Environment Variables

**KHÔNG BAO GIỜ** commit secrets vào code. Thay vào đó:

```yaml
# application.yaml (KHÔNG chứa secrets)
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}

jwt:
  signerKey: ${JWT_SIGNERKEY}

aws:
  s3:
    access-key-id: ${AWS_S3_ACCESS_KEY_ID}
    secret-access-key: ${AWS_S3_SECRET_ACCESS_KEY}
```

Secrets được truyền qua:
- **Local development**: File `.env` (đã gitignore)
- **CI/CD**: GitHub Secrets
- **Production**: Docker environment variables

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
            │ S3 Website   │              │  Nginx EC2   │
            │ (Frontend)   │              │ (API Proxy)  │
            └──────────────┘              └──────┬───────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │   Backend EC2 (Docker) │
                                  │  EC2-1  │  EC2-2       │
                                  │ (Public Subnet)        │
                                  └────────────┬───────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ Aiven MySQL  │
                                       │   (Cloud)    │
                                       └──────────────┘
```

**Kiến trúc đơn giản hóa (không CloudFront):**
- ✅ Frontend: **S3 Static Website Hosting** (trực tiếp, không CDN)
- ✅ Backend: Nginx load balancing giữa 2 EC2
- ✅ Tất cả EC2 ở **Public Subnet** → Không cần NAT Gateway
- ✅ Tiết kiệm thêm ~$10/tháng (không dùng CloudFront)

---

## ✅ Yêu Cầu Chuẩn Bị

### AWS Account
- Tài khoản AWS với quyền truy cập:
  - EC2, S3
  - IAM (để tạo access keys)
  - **Không cần Route 53** - dùng DNS từ nhà cung cấp domain
  - **Không cần CloudFront** - dùng S3 Static Website Hosting

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

#### Bucket cho Frontend (Static Website Hosting)
```bash
# Tạo bucket (tên bucket phải unique toàn cầu)
aws s3 mb s3://quanhss-frontend-YOURNAME --region ap-southeast-1

# Enable static website hosting
aws s3 website s3://quanhss-frontend-YOURNAME \
  --index-document index.html \
  --error-document index.html

# Disable Block Public Access (cần thiết cho static website)
aws s3api put-public-access-block \
  --bucket quanhss-frontend-YOURNAME \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Bucket Policy - cho phép public read
aws s3api put-bucket-policy --bucket quanhss-frontend-YOURNAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::quanhss-frontend-YOURNAME/*"
    }
  ]
}'
```

**Lưu lại S3 Website Endpoint:**
```
http://quanhss-frontend-YOURNAME.s3-website-ap-southeast-1.amazonaws.com
```

⚠️ **Lưu ý**: S3 Static Website Hosting chỉ hỗ trợ HTTP, không HTTPS. 
Nếu cần HTTPS cho frontend, có thể dùng **Cloudflare** phía trước (free tier có SSL).

#### Bucket cho User Uploads (Tours, QR Codes)
```bash
aws s3 mb s3://quanhss-uploads --region ap-southeast-1

# CORS Configuration cho uploads
aws s3api put-bucket-cors --bucket quanhss-uploads --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
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
    server 10.0.1.10:8080;  # Backend EC2-1 Private IP Nhớ thay bằng private IP của backend 1 
    server 10.0.1.11:8080;  # Backend EC2-2 Private IP Nhớ thay bằng private IP của backend 2
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
sudo systemctl start nginx
```

**Test Nginx:**
```bash
# Từ bên ngoài
curl http://<NGINX_PUBLIC_IP>/

# Expected: 502 Bad Gateway (vì chưa có backend)
```

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
| `S3_BUCKET_FRONTEND` | `quanhss-frontend-YOURNAME` (tên bucket S3) |
| `VITE_API_BASE_URL` | `http://api.yourdomain.com` hoặc `http://<NGINX_IP>` |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `EC2_HOST_1` | Backend EC2-1 Public IP |
| `EC2_HOST_2` | Backend EC2-2 Public IP |
| `SSH_PRIVATE_KEY` | Private key content (toàn bộ file .pem) |
| `DB_URL` | `jdbc:mysql://mysql-xxx.aivencloud.com:10404/quanh` |
| `DB_USERNAME` | `avnadmin` |
| `DB_PASSWORD` | Aiven password |
| `JWT_SIGNER_KEY` | JWT secret key (32+ chars) |
| `S3_ACCESS_KEY` | S3 Access Key (cho uploads) |
| `S3_SECRET_KEY` | S3 Secret Key |
| `S3_BUCKET_UPLOADS` | `quanhss-uploads` |
| `S3_ENDPOINT` | `https://s3.ap-southeast-1.amazonaws.com` |
| `NGINX_HOST` | Nginx EC2 Public IP (bastion host) |
| `MAIL_EMAIL` | `forgot.pass.bid@gmail.com` (email gửi OTP) |
| `MAIL_PASSWORD` | `xsiq grfy wyil myzp` (Gmail App Password) |
| `VIETMAP_API_KEY` | `ec4b6f6a60186d81c08db7c3beeed4abafcd2fc367c9f746` |

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
    environment: Deploy # Chỉ định môi trường của github actions
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
    environment: Deploy # Chỉ định môi trường của github actions
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
    environment: Deploy # Chỉ định môi trường của github actions
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
name: 🌐 Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  S3_BUCKET: ${{ secrets.S3_BUCKET_FRONTEND }}
  AWS_REGION: ${{ secrets.AWS_REGION }}

jobs:
  build-and-deploy:
    name: 🚀 Build & Deploy to S3
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json

      - name: 📥 Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: 🧪 Run Lint
        working-directory: ./frontend
        run: npm run lint || true

      - name: 🏗️ Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - name: 🔑 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: 📤 Deploy to S3
        working-directory: ./frontend
        run: |
          # Sync all files to S3
          aws s3 sync dist/ s3://${{ env.S3_BUCKET }} \
            --delete \
            --cache-control "max-age=31536000,public" \
            --exclude "index.html" \
            --exclude "*.json"
          
          # Upload index.html with no-cache (for SPA routing)
          aws s3 cp dist/index.html s3://${{ env.S3_BUCKET }}/index.html \
            --cache-control "no-cache,no-store,must-revalidate" \
            --content-type "text/html"
          
          # Upload any JSON files with short cache
          find dist -name "*.json" -type f | while read file; do
            aws s3 cp "$file" s3://${{ env.S3_BUCKET }}/$(basename "$file") \
              --cache-control "max-age=3600"
          done

      - name: ✅ Deployment Summary
        run: |
          echo "## 🌐 Frontend Deployment Complete!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "🔗 **S3 Website URL**: http://${{ env.S3_BUCKET }}.s3-website-${{ env.AWS_REGION }}.amazonaws.com" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Commit**: ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Branch**: ${{ github.ref_name }}" >> $GITHUB_STEP_SUMMARY

```

---

## 🖥️ Phase 3: Deploy Backend

### 3.1 Chuẩn bị application-prod.yaml

Cập nhật `backend/src/main/resources/application-prod.yaml`:

```yaml
server:
  port: 8080
  servlet:
    context-path: /api
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

mailServer:
  host: ${MAIL_HOST:smtp.gmail.com}
  port: ${MAIL_PORT:587}
  email: ${MAIL_EMAIL}
  password: ${MAIL_PASSWORD}
  protocol: ${MAIL_PROTOCOL:smtp}
  isSSL: ${MAIL_SSL:false}

vietmap:
  api:
    key: ${VIETMAP_API_KEY}
    base-url: ${VIETMAP_BASE_URL:https://maps.vietmap.vn/api}

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

# Tạo .env.production (dùng HTTP cho API nếu chưa có SSL)
echo "VITE_API_BASE_URL=http://api.yourdomain.com" > .env.production

# Hoặc nếu dùng IP trực tiếp
echo "VITE_API_BASE_URL=http://<NGINX_PUBLIC_IP>" > .env.production

# Build
npm run build
```

### 4.2 Upload lên S3

```bash
# Sync static files lên S3 (thay YOURNAME bằng tên bucket thực tế)
aws s3 sync dist/ s3://quanhss-frontend-YOURNAME --delete

# Verify
aws s3 ls s3://quanhss-frontend-YOURNAME/
```

### 4.3 Test Frontend

Truy cập S3 Website Endpoint:
```
http://quanhss-frontend-YOURNAME.s3-website-ap-southeast-1.amazonaws.com
```

✅ Nếu thấy app hoạt động = **Thành công!**

---

## 🌐 Phase 5: DNS & SSL Configuration

### 5.1 Cấu hình DNS tại nhà cung cấp Domain

**Bước 1: Lấy thông tin cần thiết**

```bash
# 1. S3 Website Endpoint (Frontend)
# Format: http://BUCKET-NAME.s3-website-REGION.amazonaws.com
# Ví dụ: http://quanhss-frontend-YOURNAME.s3-website-ap-southeast-1.amazonaws.com

# 2. Nginx EC2 Public IP (API)
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=quanhss-nginx" \
  --query 'Reservations[*].Instances[*].PublicIpAddress' \
  --output text
# Ví dụ: 13.250.123.45
```

**Bước 2: Cấu hình DNS Records**

Đăng nhập vào **DNS Management** của nhà cung cấp domain:

| Type | Host/Name | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| CNAME | `www` | `quanhss-frontend-YOURNAME.s3-website-ap-southeast-1.amazonaws.com` | 300 |
| A | `api` | `13.250.123.45` (Nginx EC2 IP) | 300 |

**Lưu ý:**
- ⚠️ Root domain (`@`) không thể dùng CNAME. Dùng URL Redirect tới `www`
- ⚠️ S3 Website chỉ hỗ trợ HTTP. Xem bên dưới về SSL options

**Hướng dẫn theo nhà cung cấp: Nói thế thui chứ dùng CloudFlare + CloudFront cho nhàn**

<b>Cloudflare (Khuyến nghị - FREE SSL!)</b>

Dùng Cloudflare để có **HTTPS miễn phí** cho cả frontend và API:

1. Chuyển nameserver của domain sang Cloudflare
2. Cloudflare Dashboard → DNS → Add records:
   - **CNAME**: Name = `www`, Target = S3 website endpoint, **Proxy: ON** (orange cloud)
   - **A**: Name = `api`, IPv4 = Nginx EC2 IP, **Proxy: ON**
3. SSL/TLS → Overview → Chọn **Strict**, phải để strict, nếu không nó và CloudFront không hoạt động được, cứ đẩy nhau qua lại giữa https và http => Multiple request error, nó cứ load đi load lại

⚠️ **Quan trọng**: Khi dùng Strict mode, Nginx PHẢI có SSL certificate! Xem bước 5.2 bên dưới.

✅ Cloudflare sẽ cung cấp HTTPS miễn phí!

### 5.2 Setup SSL cho Nginx (Bắt buộc với Cloudflare Strict)

Vì Cloudflare Strict mode yêu cầu HTTPS từ Cloudflare đến origin server, bạn cần cài SSL cho Nginx.

**Bước 1: Tạo Cloudflare Origin Certificate**

1. **Cloudflare Dashboard** → Domain của bạn → **SSL/TLS** → **Origin Server**
2. Click **Create Certificate**
3. Cấu hình:
   - Private key type: **RSA (2048)**
   - Hostnames: `api.yourdomain.com`, `*.yourdomain.com`
   - Certificate Validity: **15 years**
4. Click **Create**
5. **Copy cả 2**: Origin Certificate và Private Key (lưu lại vì chỉ hiển thị 1 lần!)

**Bước 2: Cài Certificate lên Nginx**

SSH vào Nginx EC2:

```bash
# Tạo thư mục chứa certificate
sudo mkdir -p /etc/nginx/ssl

# Paste Origin Certificate
sudo nano /etc/nginx/ssl/cloudflare-origin.pem
# Paste nội dung Origin Certificate vào, Ctrl+O để save, Ctrl+X để thoát

# Paste Private Key  
sudo nano /etc/nginx/ssl/cloudflare-origin.key
# Paste nội dung Private Key vào, Ctrl+O để save, Ctrl+X để thoát

# Set permissions
sudo chmod 600 /etc/nginx/ssl/*
```

**Bước 3: Cấu hình Nginx HTTPS**

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

Thay toàn bộ nội dung bằng:

```nginx
upstream backend_servers {
    server 10.0.13.12:8080;   # Backend EC2-1 Private IP
    server 10.0.5.106:8080;   # Backend EC2-2 Private IP
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/nginx/ssl/cloudflare-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # WebSocket endpoint
    location /api/ws {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Regular API endpoints
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
    }
}
```

**Bước 4: Mở port 443 trên Security Group**

AWS Console → EC2 → Security Groups → `quanhss-nginx-sg`:

| Type | Port | Source |
|------|------|--------|
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| SSH | 22 | Your IP |

**Bước 5: Restart Nginx**

```bash
sudo nginx -t
sudo systemctl restart nginx
```

**Bước 6: Test SSL**

```bash
# Test từ local
curl -X OPTIONS "https://api.yourdomain.com/api/auth/token" \
  -H "Origin: https://www.yourdomain.com" \
  -v

# Expected: HTTP 200/204 với CORS headers
```


**Bước 3: Verify DNS Propagation**

```bash
# Kiểm tra DNS đã propagate chưa
nslookup www.yourdomain.com
nslookup api.yourdomain.com

# Hoặc dùng online tool
# https://dnschecker.org
```

DNS có thể mất **5-30 phút** để propagate toàn cầu.

### 5.2 Setup CloudFront

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

1. Vào AWS CloudFront: Tạo một Distribution mới.
2. Origin Domain: Chọn bucket quanh-frontend.s3... của bạn.
3. Alternate domain name (CNAME): Điền www.linhng148.id.vn.
4. 
- Custom SSL certificate: Request một chứng chỉ ACM cho www.linhng148.id.vn (miễn phí) và chọn vào đó.
- Khi tạo SSL từ đấy, nó sẽ ra CNAME có Name và Value, Name bỏ cái đít cho đến www thôi, value thì copy nguyên, sau đó cho name và value đó vào Cloudflare DNS.
5. Đợi 5-10 phút để CloudFront validate SSL.

6. 
- Quay lại Cloudflare DNS:
- Sửa record www.
- Thay đổi giá trị từ S3 endpoint thành d12345xxxx.cloudfront.net.
- Bật đám mây màu cam (Proxied).


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

### S3 Frontend 403/404 Error
```bash
# Kiểm tra S3 bucket policy (phải public read)
aws s3api get-bucket-policy --bucket quanhss-frontend-YOURNAME

# Kiểm tra static website hosting đã enable
aws s3api get-bucket-website --bucket quanhss-frontend-YOURNAME

# Kiểm tra index.html tồn tại
aws s3 ls s3://quanhss-frontend-YOURNAME/index.html
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
| ~~CloudFront~~ | ~~100 GB transfer~~ | ~~$10~~ **SAVED!** |
| ~~Route 53~~ | ~~Hosted zone~~ | ~~$0.50~~ **FREE (External DNS)** |
| **Total** | | **~$38.25/month** |

**Tiết kiệm được:**
- ✅ Không dùng RDS → Dùng Aiven free tier: **-$15/tháng**
- ✅ Không cần NAT Gateway (EC2 ở public subnet): **-$32/tháng**
- ✅ Không dùng CloudFront (S3 static hosting): **-$10/tháng**
- 💰 **Tổng tiết kiệm: ~$58/tháng** so với kiến trúc full AWS!

*Note: Giá tham khảo, có thể thay đổi.*

---

## ✅ Checklist Deploy

- [ ] VPC và Public Subnet đã tạo
- [ ] Security Groups đã cấu hình đúng
- [ ] Aiven MySQL accessible
- [ ] S3 buckets đã tạo với static website hosting
- [ ] S3 bucket policy cho phép public read
- [ ] EC2 instances đang chạy
- [ ] Docker đã cài trên Backend EC2s
- [ ] Nginx đã cấu hình reverse proxy
- [ ] DNS records đã thêm (CNAME cho frontend, A cho API)
- [ ] SSL cho API (Certbot hoặc Cloudflare)
- [ ] GitHub Actions secrets đã thêm
- [ ] CI/CD workflows đã tạo
- [ ] Test API endpoint hoạt động
- [ ] Test Frontend load thành công
- [ ] Test full flow: Login → Booking → etc.

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Docker container logs: `docker logs quanhss-backend`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. S3 bucket policy và permissions
4. Browser DevTools → Network tab

**Author**: QuanhSS Team  
**Updated**: 2025-12-17
