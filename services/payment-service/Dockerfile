FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY services/payment-service ./services/payment-service

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @qrcode-shiba/database db:generate
RUN pnpm --filter @qrcode-shiba/database build
RUN pnpm --filter @qrcode-shiba/payment-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/payment-service ./services/payment-service

EXPOSE 3004
CMD ["node", "services/payment-service/dist/main"]
