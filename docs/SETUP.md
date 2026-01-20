# 🚀 Development Setup Guide

## QRCode-Shiba Local Development

**Last Updated**: 15/01/2026

---

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | >= 18.x | `node -v` |
| pnpm | >= 8.x | `pnpm -v` |
| Docker | >= 24.x | `docker -v` |
| Docker Compose | >= 2.x | `docker compose version` |

---

## 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/qrcode-shiba.git
cd qrcode-shiba

# Install dependencies
pnpm install
```

---

## 2. Environment Setup

### Automatic Setup (Recommended)
```bash
pnpm run setup
```

### Manual Setup
Copy `.env.example` to `.env` for each service:

```bash
# Root
cp .env.example .env

# Services
cp services/auth-service/.env.example services/auth-service/.env
cp services/qr-service/.env.example services/qr-service/.env
cp services/redirect-service/.env.example services/redirect-service/.env
cp services/payment-service/.env.example services/payment-service/.env
```

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:postgres@localhost:5432/qrcode_shiba` |
| `JWT_SECRET` | JWT signing key | `dev-secret-change-in-production` |
| `JWT_REFRESH_SECRET` | Refresh token key | `dev-refresh-secret-change-in-production` |
| `NEXT_PUBLIC_API_URL` | Auth API URL | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_QR_API_URL` | QR API URL | `http://localhost:3002/api/v1` |

### Firebase Configuration (for Google Auth)

Add to `apps/web/.env`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, MinIO, MailHog
docker compose up -d

# Verify containers
docker compose ps
```

### Services:
| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `localhost:5432` |
| Redis | 6379 | `localhost:6379` |
| MinIO Console | 9001 | http://localhost:9001 |
| MailHog | 8025 | http://localhost:8025 |

---

## 4. Database Setup

```bash
# Generate Prisma client
pnpm run db:generate

# Run migrations
pnpm run db:push

# (Optional) Seed database
pnpm run db:seed
```

---

## 5. Start All Services

### Option 1: Turborepo (Recommended)
```bash
pnpm run dev
```

### Option 2: Individual Services
```bash
# Terminal 1 - Web
cd apps/web && pnpm dev

# Terminal 2 - Auth Service
cd services/auth-service && pnpm run start:dev

# Terminal 3 - QR Service
cd services/qr-service && pnpm run start:dev

# Terminal 4 - Redirect Service
cd services/redirect-service && pnpm run start:dev
```

---

## 6. Verify Setup

| Service | URL | Expected |
|---------|-----|----------|
| Web App | http://localhost:3000 | Landing page |
| Auth API | http://localhost:3001/api/v1/auth | 404 (no GET) |
| QR API | http://localhost:3002/api/v1/qr | 400 (requires user) |
| Redirect | http://localhost:3003 | 404 (no shortcode) |

---

## Port Reference

| Service | Development Port |
|---------|-----------------|
| Web (Next.js) | 3000 |
| Auth Service | 3001 |
| QR Service | 3002 |
| Redirect Service | 3003 |
| Payment Service | 3004 |

---

## Troubleshooting

### Database Connection Failed
```bash
# Check Docker containers
docker compose ps

# Restart PostgreSQL
docker compose restart postgres
```

### Prisma Client Not Found
```bash
pnpm run db:generate
```

### Port Already in Use
```bash
# Find process on port
lsof -i :3001

# Kill process
kill -9 <PID>
```

---

## Helpful Commands

```bash
# Build all packages
pnpm run build

# Lint all packages
pnpm run lint

# Test all packages
pnpm run test

# View database
pnpm run db:studio
```

---

*Setup guide maintained by Tech Team*
