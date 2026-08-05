# ========================================
# Stage 1: Install dependencies
# ========================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install bun in the node image
RUN npm install -g bun

COPY package.json .npmrc ./
RUN rm -f bun.lock && bun install --no-cache

# ========================================
# Stage 2: Build the application
# ========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL

RUN bun run build

# ========================================
# Stage 3: Production runner (minimal image)
# ========================================
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g bun

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
