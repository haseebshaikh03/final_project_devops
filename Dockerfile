# Multi-stage build for optimized image size
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY app/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY app/package*.json ./

# Install only production dependencies
RUN npm install --production && \
    npm cache clean --force

# Copy application source
COPY app/. .

# Create data directory for SQLite database with proper permissions
RUN mkdir -p /usr/src/app/data && \
    chmod 755 /usr/src/app/data

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/usr/src/app/data/tasks.db

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run as non-root user for security
USER node

# Start application
CMD [ "npm", "start" ]
