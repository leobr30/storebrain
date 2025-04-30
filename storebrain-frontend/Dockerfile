# Base stage with a more compatible Debian image
FROM node:18-bullseye AS base

# Dependencies installation stage (system dependencies + node_modules)
FROM base AS deps
# Update package lists and install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  libc6-dev \
  libvips-dev \
  libfftw3-dev \
  build-essential \
  curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy lock files to leverage Docker cache
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build stage
FROM base AS builder
WORKDIR /app

# Define build arguments
ARG NEXTAUTH_URL
ARG NEXTAUTH_URL_INTERNAL
ARG AUTH_SECRET
ARG AUTH_TRUST_HOST
ARG NEXT_PUBLIC_API_URL
ARG API_URL

# Set environment variables
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_URL_INTERNAL=$NEXTAUTH_URL_INTERNAL
ENV AUTH_SECRET=$AUTH_SECRET
ENV AUTH_TRUST_HOST=$AUTH_TRUST_HOST
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_URL=$API_URL

# Copy node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .
COPY .env.local .env.local

# Build the application
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Final stage (production)
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public files
COPY --from=builder /app/public ./public

# Create .next directory and set ownership
RUN mkdir .next && chown nextjs:nodejs .next

# Copy built files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Set environment variables for the server
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
