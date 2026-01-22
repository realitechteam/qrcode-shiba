FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# --- dependencies layer ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY services/qr-service/package.json ./services/qr-service/
RUN pnpm install --frozen-lockfile

# --- builder layer ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/services/qr-service ./services/qr-service
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY services/qr-service ./services/qr-service

RUN pnpm --filter @qrcode-shiba/database db:generate
RUN pnpm --filter @qrcode-shiba/qr-service build

# --- runner layer ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/services/qr-service/dist ./services/qr-service/dist
COPY --from=builder /app/services/qr-service/package.json ./services/qr-service/
COPY --from=builder /app/services/qr-service/node_modules ./services/qr-service/node_modules

EXPOSE 3002
CMD ["node", "services/qr-service/dist/main"]
