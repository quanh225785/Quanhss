# 🚨 URGENT: Security Cleanup Required

## ⚠️ CRITICAL SECURITY ISSUE DISCOVERED

**Date**: December 17, 2025  
**Severity**: **CRITICAL**  
**Status**: ❌ **ACTION REQUIRED IMMEDIATELY**

---

## 📋 Summary

All previous Docker images on Docker Hub **CONTAIN HARDCODED SECRETS** in the `application.yaml` file inside the JAR:

- ❌ Database password
- ❌ JWT Signer Key  
- ❌ Email password
- ❌ VietMap API Key
- ❌ AWS S3 Secret Key

**Anyone who pulls the Docker image can extract these secrets.**

---

## ✅ What Has Been Fixed

1. ✅ **pom.xml**: Now excludes `application.yaml` from JAR builds
2. ✅ **Dockerfile**: Added security verification to ensure `application.yaml` is NOT in JAR
3. ✅ **Dockerfile**: Uses `application-prod.yaml` (env vars only) instead

---

## 🔥 IMMEDIATE ACTIONS REQUIRED

### Step 1: DELETE ALL Docker Images on Docker Hub

**⚠️ DO THIS FIRST - Before pushing new code!**

1. **Login to Docker Hub**: https://hub.docker.com
2. **Navigate to**: `lyan148/quanhss-backend`
3. **Delete ALL tags** (latest, all SHA tags):
   - Click **Tags** tab
   - Select **All tags**
   - Click **Actions** → **Delete**
   - Confirm deletion

**Why?** Old images contain secrets. Even if you push new images, old ones are still accessible.

### Step 2: ROTATE ALL SECRETS

All secrets in `application.yaml` are compromised. You **MUST** change them:

| Secret | Where to Rotate | New Value Location |
|--------|-----------------|-------------------|
| **Database Password** | [Aiven Console](https://console.aiven.io/) → Service → Users → Reset password | GitHub Secrets: `DB_PASSWORD` |
| **JWT Signer Key** | Generate new: `openssl rand -base64 64` | GitHub Secrets: `JWT_SIGNER_KEY` |
| **Email Password** | Gmail → App Passwords → Revoke old → Create new | GitHub Secrets: `MAIL_PASSWORD` |
| **VietMap API Key** | [VietMap Dashboard](https://vietmap.vn/) → Regenerate API key | GitHub Secrets: `VIETMAP_API_KEY` |
| **AWS S3 Secret** | AWS IAM → Deactivate old key → Create new access key | GitHub Secrets: `S3_SECRET_KEY` |

### Step 3: Update GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Update these secrets with NEW values:

```
DB_PASSWORD=<new_aiven_password>
JWT_SIGNER_KEY=<new_64_char_key>
MAIL_PASSWORD=<new_gmail_app_password>
VIETMAP_API_KEY=<new_vietmap_key>
S3_SECRET_KEY=<new_aws_secret>
```

### Step 4: Update Local application.yaml

Replace all secrets in `backend/src/main/resources/application.yaml` with NEW values.

**OR BETTER**: Delete it entirely and use `.env` file for local development.

### Step 5: Rebuild and Push NEW Docker Image

```bash
# After rotating ALL secrets and deleting old images
cd backend
docker build -t lyan148/quanhss-backend:latest .

# Verify application.yaml is NOT in JAR
docker run --rm lyan148/quanhss-backend:latest sh -c "jar tf app.jar | grep application.yaml"
# Should output: (empty) or exit 1

# If verification passes, push
docker push lyan148/quanhss-backend:latest
```

### Step 6: Trigger GitHub Actions

```bash
git add .
git commit -m "security: fix Docker image secret leakage"
git push origin main
```

GitHub Actions will:
- Build new JAR (without `application.yaml`)
- Build new Docker image (with security check)
- Deploy to EC2 with environment variables

---

## 🔍 How to Verify the Fix

### Verify JAR doesn't contain application.yaml

```bash
# Pull the new image
docker pull lyan148/quanhss-backend:latest

# Extract JAR
docker run --rm -v $(pwd):/extract lyan148/quanhss-backend:latest sh -c "cp app.jar /extract/"

# Check contents
jar tf app.jar | grep -i application
```

**Expected output:**
```
BOOT-INF/classes/application-prod.yaml    ✅ OK (uses env vars)
```

**NOT expected:**
```
BOOT-INF/classes/application.yaml         ❌ FAIL (contains secrets)
```

### Verify application works with env vars

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://..." \
  -e SPRING_DATASOURCE_PASSWORD="<new_password>" \
  -e JWT_SIGNERKEY="<new_key>" \
  lyan148/quanhss-backend:latest
```

---

## 📝 Post-Cleanup Checklist

- [ ] All old Docker images deleted from Docker Hub
- [ ] All secrets rotated (database, JWT, email, API keys)
- [ ] GitHub Secrets updated with new values
- [ ] Local `application.yaml` updated with new secrets (or deleted)
- [ ] New Docker image built and verified (no application.yaml in JAR)
- [ ] New Docker image pushed to Docker Hub
- [ ] GitHub Actions pipeline successful
- [ ] Application running on EC2 with new secrets
- [ ] Verified app is accessible and working

---

## 🛡️ Future Prevention

1. ✅ **Never commit secrets** to Git (use environment variables)
2. ✅ **Always use `.dockerignore`** for sensitive files
3. ✅ **Verify JAR contents** before pushing Docker images
4. ✅ **Use `application-prod.yaml`** (env vars only) for production
5. ✅ **Regular security audits** of Docker images

---

## 📞 Questions?

If you need help with any step, check:
- Docker Hub documentation: https://docs.docker.com/
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Spring Boot Profiles: https://docs.spring.io/spring-boot/reference/features/external-config.html

---

**⏰ DO NOT DELAY - Complete these steps TODAY!**
