# =============================================================================
# Stage 1: Build
# =============================================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# 1. Copy POMs and resolve dependencies first (Cache Layer)
# We use a cache mount for the .m2 directory to persist dependencies between builds
COPY pom.xml .
COPY analytics/pom.xml ./analytics/
COPY ingestion/pom.xml ./ingestion/
COPY simulator/pom.xml ./simulator/

# Resolve dependencies without copying source code yet
# Note: dependency:go-offline is often incomplete, so we use a simple verify
RUN --mount=type=cache,target=/root/.m2 mvn dependency:resolve-plugins dependency:resolve -B

# 2. Copy source code and build
COPY . .

ARG SERVICE_NAME
# Build only the specific module, utilizing the .m2 cache mount
RUN --mount=type=cache,target=/root/.m2 mvn clean package -pl ${SERVICE_NAME} -am -DskipTests

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Security: Run as non-root user
RUN addgroup -S adpulse && adduser -S adpulse -G adpulse
USER adpulse

# Copy the built JAR from the build stage
ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/*.jar app.jar

# JVM Tuning for containers
ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-jar", "app.jar"]

EXPOSE 8080
