FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# --- builder layer (single layer for monorepo) ---
FROM base AS builder
WORKDIR /app

# Copy entire monorepo for workspace resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY services/auth-service ./services/auth-service

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @qrcode-shiba/database db:generate

# Build database package (compiles TypeScript)
RUN pnpm --filter @qrcode-shiba/database build

# Build auth service
RUN pnpm --filter @qrcode-shiba/auth-service build

# --- runner layer ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files for running
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/auth-service ./services/auth-service

EXPOSE 3001
CMD ["node", "services/auth-service/dist/main"]
