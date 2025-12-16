# 🔄 Hướng Dẫn Setup CI/CD với GitHub Actions

**Dự án**: QuanhSS Travel Platform  
**CI/CD Tool**: GitHub Actions  
**Registry**: Docker Hub / GitHub Container Registry (GHCR)

---

## 📋 Mục Lục

1. [Tổng Quan CI/CD Pipeline](#tổng-quan-cicd-pipeline)
2. [Bước 1: Chuẩn Bị GitHub Repository](#bước-1-chuẩn-bị-github-repository)
3. [Bước 2: Tạo Docker Hub Account](#bước-2-tạo-docker-hub-account)
4. [Bước 3: Cấu Hình GitHub Secrets](#bước-3-cấu-hình-github-secrets)
5. [Bước 4: Tạo Workflow Files](#bước-4-tạo-workflow-files)
6. [Bước 5: Cấu Hình EC2 cho SSH Deploy](#bước-5-cấu-hình-ec2-cho-ssh-deploy)
7. [Bước 6: Test Pipeline](#bước-6-test-pipeline)
8. [Bước 7: Monitoring & Notifications](#bước-7-monitoring--notifications)

---

## 📊 Tổng Quan CI/CD Pipeline

### Backend Pipeline Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Trigger   │───▶│  Build JAR  │───▶│ Build Docker│───▶│ Push Image  │
│  (Push to   │    │  (Maven)    │    │   Image     │    │ (Docker Hub)│
│   main)     │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                   ┌─────────────┐    ┌─────────────┐           │
                   │  Health     │◀───│ SSH Deploy  │◀──────────┘
                   │   Check     │    │ to EC2      │
                   └─────────────┘    └─────────────┘
```

### Frontend Pipeline Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Trigger   │───▶│ npm install │───▶│  npm build  │───▶│  Upload to  │
│  (Push to   │    │             │    │             │    │     S3      │
│   main)     │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
                                      ┌─────────────┐           │
                                      │ Invalidate  │◀──────────┘
                                      │ CloudFront  │
                                      └─────────────┘
```

---

## 🚀 Bước 1: Chuẩn Bị GitHub Repository

### 1.1 Đảm bảo cấu trúc thư mục đúng

```
quanhss/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
├── backend/
│   ├── Dockerfile          ✅ Đã có
│   ├── pom.xml
│   └── src/
├── frontend/
│   ├── Dockerfile          ✅ Đã có (cho local Docker)
│   ├── package.json
│   └── src/
└── docker-compose.yml
```

### 1.2 Kiểm tra files cần thiết

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml và download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy jar file từ build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🐳 Bước 2: Tạo Docker Hub Account

### 2.1 Đăng ký Docker Hub

1. Truy cập https://hub.docker.com/signup
2. Tạo account với username (VD: `quanhss`)
3. Verify email

### 2.2 Tạo Access Token

1. Đăng nhập Docker Hub
2. Vào **Account Settings** → **Security**
3. Click **New Access Token**
4. Đặt tên: `github-actions-quanhss`
5. Access permissions: **Read, Write, Delete**
6. **Copy token ngay** (chỉ hiển thị 1 lần!)

### 2.3 Tạo Repository trên Docker Hub

1. Click **Create Repository**
2. Tên: `quanhss-backend`
3. Visibility: **Public** (hoặc Private nếu muốn)

---

## 🔐 Bước 3: Cấu Hình GitHub Secrets

### 3.1 Truy cập Settings

1. Vào GitHub Repository của bạn
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 3.2 Thêm các Secrets cần thiết

#### Docker Registry Secrets
| Secret Name | Mô tả | Ví dụ giá trị |
|-------------|-------|---------------|
| `DOCKER_USERNAME` | Docker Hub username | `quanhss` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxxxx` |

#### AWS Secrets
| Secret Name | Mô tả | Ví dụ giá trị |
|-------------|-------|---------------|
| `AWS_ACCESS_KEY_ID` | IAM Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key | `wJalrXUtnFEMI/K7MDENG/xxx` |
| `AWS_REGION` | AWS Region | `ap-southeast-1` |

#### S3 & CloudFront Secrets
| Secret Name | Mô tả | Ví dụ giá trị |
|-------------|-------|---------------|
| `S3_BUCKET_FRONTEND` | S3 bucket cho frontend | `quanhss-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront Distribution ID | `E1XXXXXXXXXX` |

#### EC2 SSH Secrets
| Secret Name | Mô tả | Ví dụ giá trị |
|-------------|-------|---------------|
| `EC2_HOST` | EC2 public IP (Nginx/Bastion) | `13.250.xxx.xxx` |
| `EC2_BACKEND_HOST_1` | Backend EC2-1 private IP | `10.0.2.10` |
| `EC2_BACKEND_HOST_2` | Backend EC2-2 private IP | `10.0.2.11` |
| `EC2_USERNAME` | SSH username | `ec2-user` |
| `SSH_PRIVATE_KEY` | Toàn bộ nội dung private key | Xem bên dưới |

#### Application Secrets (Database - Aiven MySQL)
| Secret Name | Mô tả | Ví dụ giá trị |
|-------------|-------|---------------|
| `DB_URL` | JDBC URL cho Aiven MySQL | `jdbc:mysql://mysql-192be37d-vietlinh1482004-83dd.g.aivencloud.com:10404/quanh` |
| `DB_USERNAME` | Database username | `avnadmin` |
| `DB_PASSWORD` | Database password | `AVNS_lMHHQZnQlVaKNWFxbgP` |
| `JWT_SIGNER_KEY` | JWT Secret (32+ chars) | `your-super-secret-jwt-key-32chars!!` |
| `S3_ACCESS_KEY` | S3 Access Key (cho uploads) | `AKIAXXXXXXXX` |
| `S3_SECRET_KEY` | S3 Secret Key | `xxxxxxxxx` |
| `S3_BUCKET_UPLOADS` | S3 bucket cho uploads | `quanhss-uploads` |
| `S3_ENDPOINT` | S3 Endpoint | `https://s3.ap-southeast-1.amazonaws.com` |

### 3.3 Cách lấy SSH Private Key

```bash
# Trên máy local, mở file .pem key
cat ~/.ssh/your-ec2-key.pem
```

Copy **toàn bộ nội dung** bao gồm:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

Paste vào GitHub Secret `SSH_PRIVATE_KEY`.

### 3.4 Tạo IAM User cho GitHub Actions

1. AWS Console → IAM → Users → Create User
2. User name: `github-actions-deploy`
3. Attach policies:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - Custom policy cho EC2 (nếu cần)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::quanhss-frontend",
        "arn:aws:s3:::quanhss-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Create access key → Download credentials

---

## 📝 Bước 4: Tạo Workflow Files

### 4.1 Tạo thư mục workflows

```bash
mkdir -p .github/workflows
```

### 4.2 Backend Workflow

Tạo file `.github/workflows/deploy-backend.yml`:

```yaml
name: 🚀 Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:  # Cho phép chạy thủ công

env:
  DOCKER_IMAGE: ${{ secrets.DOCKER_USERNAME }}/quanhss-backend
  JAVA_VERSION: '21'

jobs:
  # ========================================
  # Job 1: Build & Test
  # ========================================
  build:
    name: 🔨 Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: ☕ Setup JDK ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: maven

      - name: 🧪 Run Tests
        working-directory: ./backend
        run: mvn test

      - name: 📦 Build JAR
        working-directory: ./backend
        run: mvn clean package -DskipTests

      - name: 📤 Upload JAR artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: backend/target/*.jar
          retention-days: 1

  # ========================================
  # Job 2: Build & Push Docker Image
  # ========================================
  docker:
    name: 🐳 Build & Push Docker
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔑 Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: 📋 Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=raw,value=latest
            type=sha,prefix=
            type=raw,value={{date 'YYYYMMDD-HHmmss'}}

      - name: 🏗️ Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64

  # ========================================
  # Job 3: Deploy to EC2
  # ========================================
  deploy:
    name: 🚀 Deploy to EC2
    runs-on: ubuntu-latest
    needs: docker
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        server: [1, 2]
      max-parallel: 1  # Rolling deployment - deploy lần lượt
    
    steps:
      - name: 🔐 Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.EC2_HOST }} >> ~/.ssh/known_hosts

      - name: 🚀 Deploy to Backend Server ${{ matrix.server }}
        run: |
          # Xác định host dựa trên matrix
          if [ "${{ matrix.server }}" == "1" ]; then
            BACKEND_HOST="${{ secrets.EC2_BACKEND_HOST_1 }}"
          else
            BACKEND_HOST="${{ secrets.EC2_BACKEND_HOST_2 }}"
          fi
          
          # SSH qua bastion (Nginx) tới backend
          ssh -o StrictHostKeyChecking=no \
              -o ProxyCommand="ssh -W %h:%p ${{ secrets.EC2_USERNAME }}@${{ secrets.EC2_HOST }}" \
              ${{ secrets.EC2_USERNAME }}@$BACKEND_HOST << 'ENDSSH'
          
          echo "🛑 Stopping old container..."
          docker stop quanhss-backend || true
          docker rm quanhss-backend || true
          
          echo "🔄 Pulling latest image..."
          docker pull ${{ env.DOCKER_IMAGE }}:latest
          
          echo "🚀 Starting new container..."
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
          
          echo "⏳ Waiting for container to be healthy..."
          sleep 10
          
          echo "✅ Container status:"
          docker ps --filter name=quanhss-backend
          
          ENDSSH

      - name: ❤️ Health Check
        run: |
          if [ "${{ matrix.server }}" == "1" ]; then
            BACKEND_HOST="${{ secrets.EC2_BACKEND_HOST_1 }}"
          else
            BACKEND_HOST="${{ secrets.EC2_BACKEND_HOST_2 }}"
          fi
          
          # Health check qua bastion
          ssh -o StrictHostKeyChecking=no ${{ secrets.EC2_USERNAME }}@${{ secrets.EC2_HOST }} \
            "curl -sf http://$BACKEND_HOST:8080/actuator/health || echo 'Warning: Health check failed'"

  # ========================================
  # Job 4: Notify
  # ========================================
  notify:
    name: 📢 Notify
    runs-on: ubuntu-latest
    needs: [build, docker, deploy]
    if: always()
    
    steps:
      - name: 📊 Deployment Summary
        run: |
          echo "## 🚀 Deployment Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Job | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-----|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Build | ${{ needs.build.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Docker | ${{ needs.docker.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Deploy | ${{ needs.deploy.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Commit:** ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Branch:** ${{ github.ref_name }}" >> $GITHUB_STEP_SUMMARY
```

### 4.3 Frontend Workflow

Tạo file `.github/workflows/deploy-frontend.yml`:

```yaml
name: 🌐 Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  # ========================================
  # Job 1: Build
  # ========================================
  build:
    name: 🔨 Build Frontend
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
        run: npm run lint || true  # Don't fail on lint warnings

      - name: 🏗️ Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_BASE_URL: https://api.yourdomain.com  # Thay đổi domain của bạn

      - name: 📤 Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 1

  # ========================================
  # Job 2: Deploy to S3
  # ========================================
  deploy:
    name: 🚀 Deploy to S3 + CloudFront
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: 📥 Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: frontend-dist
          path: dist

      - name: 🔑 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: 📤 Sync to S3 (Static Assets)
        run: |
          # Upload static assets với cache lâu
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_FRONTEND }} \
            --delete \
            --cache-control "max-age=31536000,public" \
            --exclude "index.html" \
            --exclude "*.json" \
            --exclude "*.txt"

      - name: 📤 Upload index.html (No Cache)
        run: |
          # Upload index.html không cache
          aws s3 cp dist/index.html s3://${{ secrets.S3_BUCKET_FRONTEND }}/index.html \
            --cache-control "no-cache,no-store,must-revalidate" \
            --content-type "text/html"

      - name: 📤 Upload JSON/TXT files
        run: |
          # Upload manifest và các file config
          for file in dist/*.json dist/*.txt; do
            if [ -f "$file" ]; then
              aws s3 cp "$file" s3://${{ secrets.S3_BUCKET_FRONTEND }}/ \
                --cache-control "no-cache"
            fi
          done

      - name: 🔄 Invalidate CloudFront Cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: ✅ Deployment Complete
        run: |
          echo "## 🌐 Frontend Deployment Complete!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "🔗 **URL:** https://yourdomain.com" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**CloudFront invalidation created** - Changes may take 5-10 minutes to propagate globally." >> $GITHUB_STEP_SUMMARY

  # ========================================
  # Job 3: Lighthouse Audit (Optional)
  # ========================================
  lighthouse:
    name: 🔍 Lighthouse Audit
    runs-on: ubuntu-latest
    needs: deploy
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    continue-on-error: true  # Don't fail the workflow
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔦 Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://yourdomain.com
          uploadArtifacts: true
```

### 4.4 Workflow chỉ chạy Test (Pull Request)

Tạo file `.github/workflows/test.yml`:

```yaml
name: 🧪 Run Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
    name: 🧪 Backend Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Run Tests
        working-directory: ./backend
        run: mvn test

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/target/site/jacoco
          fail_ci_if_error: false

  frontend-test:
    name: 🧪 Frontend Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run Lint
        working-directory: ./frontend
        run: npm run lint

      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_BASE_URL: http://localhost:8080
```

---

## 🖥️ Bước 5: Cấu Hình EC2 cho SSH Deploy

### 5.1 Cấu hình SSH trên Nginx EC2 (Bastion)

SSH vào Nginx EC2:
```bash
ssh -i your-key.pem ec2-user@<NGINX_PUBLIC_IP>
```

Thêm key để có thể SSH tới Backend EC2s:
```bash
# Copy private key content vào
cat > ~/.ssh/backend-key.pem << 'EOF'
-----BEGIN RSA PRIVATE KEY-----
... (paste key content) ...
-----END RSA PRIVATE KEY-----
EOF

chmod 600 ~/.ssh/backend-key.pem

# Cấu hình SSH config
cat >> ~/.ssh/config << 'EOF'
Host backend-1
    HostName 10.0.2.10
    User ec2-user
    IdentityFile ~/.ssh/backend-key.pem
    StrictHostKeyChecking no

Host backend-2
    HostName 10.0.2.11
    User ec2-user
    IdentityFile ~/.ssh/backend-key.pem
    StrictHostKeyChecking no
EOF
```

### 5.2 Cài đặt Docker trên Backend EC2s

SSH tới mỗi Backend EC2 (qua Nginx):
```bash
# Từ Nginx
ssh backend-1
```

Cài Docker:
```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Logout và login lại để apply group
exit
ssh backend-1

# Verify
docker --version
docker ps
```

### 5.3 Setup Docker Login trên EC2

```bash
# Login Docker Hub để pull private images (nếu cần)
docker login -u yourusername -p yourtoken
```

---

## ✅ Bước 6: Test Pipeline

### 6.1 Test Backend Pipeline

```bash
# Tạo commit trong backend
cd backend
echo "// test" >> src/main/java/com/devteria/identityservice/IdentityServiceApplication.java

git add .
git commit -m "test: trigger backend deploy"
git push origin main
```

Kiểm tra:
1. Vào GitHub → Actions
2. Xem workflow "Deploy Backend" chạy
3. Verify mỗi job: Build → Docker → Deploy

### 6.2 Test Frontend Pipeline

```bash
# Tạo commit trong frontend
cd frontend
echo "// test" >> src/main.jsx

git add .
git commit -m "test: trigger frontend deploy"
git push origin main
```

### 6.3 Manual Trigger

1. GitHub → Actions → Chọn workflow
2. Click **Run workflow** → Chọn branch → **Run**

---

## 📊 Bước 7: Monitoring & Notifications

### 7.1 Thêm Slack Notification (Optional)

Thêm vào cuối mỗi workflow:

```yaml
  notify-slack:
    name: 📢 Slack Notification
    runs-on: ubuntu-latest
    needs: [deploy]
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author,action,eventName,workflow
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 7.2 GitHub Repository Rules

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Select: `build` from test workflow

### 7.3 Tạo Status Badge

Thêm vào `README.md`:

```markdown
![Backend Deploy](https://github.com/yourusername/quanhss/actions/workflows/deploy-backend.yml/badge.svg)
![Frontend Deploy](https://github.com/yourusername/quanhss/actions/workflows/deploy-frontend.yml/badge.svg)
```

---

## 🔧 Troubleshooting

### Pipeline fails at Docker push
```
Error: denied: requested access to the resource is denied
```
**Fix**: Kiểm tra `DOCKER_USERNAME` và `DOCKER_PASSWORD` secrets.

### SSH connection timeout
```
Error: ssh: connect to host xxx port 22: Connection timed out
```
**Fix**: 
- Kiểm tra Security Group có allow port 22
- Kiểm tra EC2 đang chạy
- Kiểm tra IP đúng

### S3 access denied
```
An error occurred (AccessDenied)
```
**Fix**: Kiểm tra IAM policy cho user.

### Container không start
```bash
# SSH vào EC2, kiểm tra logs
docker logs quanhss-backend
```

---

## 📁 File Structure Final

```
.github/
└── workflows/
    ├── deploy-backend.yml    # Backend CI/CD
    ├── deploy-frontend.yml   # Frontend CI/CD
    └── test.yml              # PR Testing
```

---

## ✅ Checklist Setup CI/CD

- [ ] Docker Hub account đã tạo
- [ ] Docker Hub access token đã tạo
- [ ] GitHub Secrets đã thêm đầy đủ
- [ ] IAM User cho S3/CloudFront đã tạo
- [ ] SSH key đã add vào EC2 và GitHub Secrets
- [ ] Docker đã cài trên tất cả Backend EC2
- [ ] Workflow files đã tạo trong `.github/workflows/`
- [ ] Test trigger thành công
- [ ] Verify deployment thành công

---

**Tác giả**: QuanhSS Team  
**Cập nhật**: 2025-12-15
