FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# --- dependencies layer ---
FROM base AS deps
WORKDIR /app
# Copy root config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copy packages necessary for install
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
# Copy services necessary for install
COPY services/auth-service/package.json ./services/auth-service/

# Install deps (frozen lockfile for consistency)
RUN pnpm install --frozen-lockfile

# --- builder layer ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/services ./services
COPY . .

# Build database first (prisma generate)
RUN pnpm --filter @qrcode-shiba/database db:generate
# Build the specific service
RUN pnpm --filter @qrcode-shiba/auth-service build

# --- runner layer ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/package.json ./services/auth-service/

# Expose port (auth-service usually runs on 3001)
EXPOSE 3001

# Start the service
CMD ["node", "services/auth-service/dist/main"]
