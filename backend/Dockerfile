FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --no-cache

FROM oven/bun:1 AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 5000
ENTRYPOINT ["docker-entrypoint.sh"]
