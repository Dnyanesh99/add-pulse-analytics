# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS build
WORKDIR /app

# Enable Corepack for Yarn Berry
RUN corepack enable && corepack prepare yarn@4.16.0 --activate

# Copy manifest files for better caching
COPY package.json yarn.lock ./
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
# Using --immutable to ensure consistency. 
# If this fails due to platform-specific lockfile changes, we might need to remove it.
RUN yarn install --immutable

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# =============================================================================
# Stage 2: Runtime (Nginx)
# =============================================================================
FROM nginx:alpine AS runtime

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
