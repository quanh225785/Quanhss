# ========================================
# Build Stage
# ========================================
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml và download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# SECURITY: Remove application.yaml (contains secrets) - use application-prod.yaml only
RUN rm -f src/main/resources/application.yaml && \
    ls -la src/main/resources/ && \
    echo "✅ Removed application.yaml from source"

# Build JAR with prod profile
RUN mvn clean package -DskipTests -Dspring.profiles.active=prod

# Remove .original JAR file (Spring Boot creates this)
RUN rm -f target/*.jar.original

# SECURITY CHECK: Verify application.yaml is NOT in the final JAR
# Note: application-prod.yaml and application.yaml.example are OK
RUN JAR_FILE=$(ls target/*.jar | head -1) && \
    echo "Checking JAR: $JAR_FILE" && \
    echo "Files containing 'application' in JAR:" && \
    jar tf "$JAR_FILE" | grep application || true && \
    if jar tf "$JAR_FILE" | grep -E "BOOT-INF/classes/application\.yaml$"; then \
        echo "❌ ERROR: application.yaml found in JAR! Security risk!" && \
        exit 1; \
    else \
        echo "✅ OK: application.yaml excluded (only prod/example files present)"; \
    fi

# ========================================
# Runtime Stage
# ========================================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy jar file từ build stage (KHÔNG chứa application.yaml)
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run with prod profile (uses application-prod.yaml + env vars)
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
