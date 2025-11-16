# Multi-stage Dockerfile for the Restaurant Menu Service API

# Stage 1: install production dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: runtime image
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy installed modules first for better layer caching
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY package*.json ./
COPY server.js ./
COPY build-frontend.js ./
COPY public ./public

# Expose API port
EXPOSE 3000

# Simple healthcheck that pings the categories endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider --quiet http://127.0.0.1:3000/api/categories || exit 1

# Start the Express server
CMD ["npm", "start"]
