# Build stage - optimize dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci (deterministic)
RUN npm ci --only=prod && npm cache clean --force

# Copy source code
COPY . .

# Build the project with optimization flags
RUN npm run build --if-present

# Production stage - minimal image
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling and curl for health checks
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./

# Install only production dependencies with optimizations
RUN npm ci --only=production \
    && npm cache clean --force \
    && find node_modules -type f -name "*.md" -delete \
    && find node_modules -type f -name "LICENSE*" -delete \
    && find node_modules -type d -name "test" -type d -exec rm -rf {} + 2>/dev/null || true

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5000

# Health check using curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application with node clustering for performance
CMD ["node", "dist/index.js"]

