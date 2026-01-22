FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# --- dependencies layer ---
FROM base AS deps
WORKDIR /app
# Copy all package.json files for workspace resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY services/auth-service/package.json ./services/auth-service/
RUN pnpm install --frozen-lockfile

# --- builder layer ---
FROM base AS builder
WORKDIR /app
# Copy all from deps
COPY --from=deps /app ./
# Copy source files
COPY packages ./packages
COPY services/auth-service ./services/auth-service

# Build database package first (generates Prisma client AND builds TypeScript)
RUN pnpm --filter @qrcode-shiba/database db:generate
RUN pnpm --filter @qrcode-shiba/database build

# Build auth service
RUN pnpm --filter @qrcode-shiba/auth-service build

# --- runner layer ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/package.json ./services/auth-service/
COPY --from=builder /app/services/auth-service/node_modules ./services/auth-service/node_modules

EXPOSE 3001
CMD ["node", "services/auth-service/dist/main"]
