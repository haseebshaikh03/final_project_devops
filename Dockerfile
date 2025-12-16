# ============================================
# STAGE 1: BUILD STAGE
# ============================================
# Multi-stage build reduces final image size by separating build and runtime environments
# FROM: Specifies the base image to use (node:20-alpine = Node.js 20 on Alpine Linux for minimal size)
# AS build: Names this stage "build" so we can reference it later
FROM node:20-alpine AS build

# WORKDIR: Sets the working directory inside the container
# All subsequent commands will be executed from this directory
WORKDIR /usr/src/app

# COPY: Copies package.json and package-lock.json from host to container
# Copying package files separately allows Docker to cache this layer
# If package.json doesn't change, Docker reuses this layer (faster builds)
COPY app/package*.json ./

# RUN: Executes commands during image build
# npm install: Installs all dependencies (including devDependencies needed for build)
RUN npm install

# ============================================
# STAGE 2: PRODUCTION STAGE
# ============================================
# Second stage creates the final production image (smaller, no build tools)
# FROM: Starts a fresh image (previous stage is discarded, only what we copy remains)
FROM node:20-alpine

# WORKDIR: Sets working directory for production container
WORKDIR /usr/src/app

# COPY: Copy package files again for production stage
COPY app/package*.json ./

# RUN: Install only production dependencies (no devDependencies)
# --production: Skips devDependencies, reducing image size
# npm cache clean --force: Removes npm cache to further reduce image size
RUN npm install --production && \
    npm cache clean --force

# COPY: Copy application source code from host to container
# app/.: Copies everything from the app directory
# .: Destination (current WORKDIR = /usr/src/app)
COPY app/. .

# RUN: Create directory for SQLite database and set permissions
# mkdir -p: Creates directory (and parents if needed)
# chmod 755: Gives read/write/execute to owner, read/execute to others
RUN mkdir -p /usr/src/app/data && \
    chmod 755 /usr/src/app/data

# ENV: Sets environment variables that will be available in the container
# NODE_ENV=production: Tells Node.js to run in production mode (optimizations)
# PORT=3000: Application listens on port 3000
# DB_PATH: Path where SQLite database file will be stored
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/usr/src/app/data/tasks.db

# EXPOSE: Documents which port the container listens on
# Does NOT publish the port (that's done with -p flag or Kubernetes service)
# This is metadata for documentation purposes
EXPOSE 3000

# HEALTHCHECK: Defines how Docker checks if container is healthy
# --interval=30s: Check every 30 seconds
# --timeout=3s: Wait max 3 seconds for response
# --start-period=5s: Grace period before first health check
# --retries=3: Mark unhealthy after 3 consecutive failures
# CMD: The command to run for health check (HTTP GET to /health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# USER: Switches to non-root user for security
# node: A non-privileged user that comes with the node:alpine image
# Running as non-root prevents potential container breakout attacks
USER node

# CMD: Default command to run when container starts
# [ "npm", "start" ]: Executes "npm start" which runs the app
# Array format is preferred (exec form) over shell form for proper signal handling
CMD [ "npm", "start" ]
