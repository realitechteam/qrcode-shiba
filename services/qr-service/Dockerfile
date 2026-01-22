FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY services/auth-service/package.json ./services/auth-service/
COPY services/qr-service/package.json ./services/qr-service/
COPY services/payment-service/package.json ./services/payment-service/
COPY services/redirect-service/package.json ./services/redirect-service/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --no-frozen-lockfile

COPY packages ./packages
COPY services/qr-service ./services/qr-service

RUN pnpm --filter @qrcode-shiba/database db:generate
RUN pnpm --filter @qrcode-shiba/database build
RUN pnpm --filter @qrcode-shiba/qr-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/qr-service ./services/qr-service

EXPOSE 3002
CMD ["node", "services/qr-service/dist/main"]
