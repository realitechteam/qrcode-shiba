# Environment Configuration Guide

> How to configure QRCode-Shiba for Local Development and Production.

## Quick Start

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Start Docker services
docker-compose up -d

# 3. Run development
pnpm dev
```

---

## File Structure

| File           | Purpose                          | Commit to Git? |
| -------------- | -------------------------------- | -------------- |
| `.env.example` | Template with placeholder values | ✅ Yes         |
| `.env.local`   | Local development with Docker    | ❌ No          |
| `.env`         | Production secrets               | ❌ No          |

---

## Local Development Setup

### Prerequisites

- Docker & Docker Compose installed
- Node.js >= 20, pnpm >= 8

### Steps

1. **Start infrastructure:**

```bash
docker-compose up -d
```

2. **Copy environment file:**

```bash
cp .env.example .env.local
```

3. **Update `.env.local`** with your development values:
   - Firebase credentials (from Firebase Console)
   - Google OAuth credentials (from Google Cloud Console)
   - Resend API key (from resend.com)

4. **Initialize database:**

```bash
pnpm db:generate
pnpm db:push
```

5. **Start development:**

```bash
pnpm dev
```

### Docker Services (Local)

| Service       | Port | Credentials             |
| ------------- | ---- | ----------------------- |
| PostgreSQL    | 5432 | postgres / postgres     |
| Redis         | 6379 | -                       |
| MinIO Console | 9001 | minioadmin / minioadmin |
| Mailhog       | 8025 | -                       |

---

## Production Setup

### Environment Variables

For production, you need to set these in your hosting platform (Vercel, Railway, etc.):

#### Required

| Variable             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `NODE_ENV`           | Set to `production`                                  |
| `DATABASE_URL`       | PostgreSQL connection string                         |
| `JWT_ACCESS_SECRET`  | Strong random string (use `openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Strong random string                                 |
| `FRONTEND_URL`       | Your production domain                               |

#### Firebase (Frontend)

| Variable                           | Description          |
| ---------------------------------- | -------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Firebase API Key     |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Firebase Project ID  |

#### Email

| Variable            | Description          |
| ------------------- | -------------------- |
| `RESEND_API_KEY`    | Resend.com API Key   |
| `RESEND_FROM_EMAIL` | Sender email address |

#### Payment (SePay)

| Variable               | Description                   |
| ---------------------- | ----------------------------- |
| `SEPAY_API_TOKEN`      | SePay API Token               |
| `SEPAY_WEBHOOK_SECRET` | Webhook verification secret   |
| `SEPAY_BANK_CODE`      | Your bank code (e.g., VPBANK) |
| `SEPAY_ACCOUNT_NO`     | Your bank account number      |

---

## Service Port Map

| Service          | Port | API Prefix |
| ---------------- | ---- | ---------- |
| Web (Next.js)    | 3000 | -          |
| Auth Service     | 3001 | /api/v1    |
| QR Service       | 3002 | /api/v1    |
| Redirect Service | 3003 | /          |
| Payment Service  | 3004 | /api/v1    |

---

## Troubleshooting

### Services can't connect to database

Ensure Docker is running and PostgreSQL is healthy:

```bash
docker-compose ps
docker-compose logs postgres
```

### Environment variables not loading

NestJS services read from root `.env.local` first. Restart services after changes:

```bash
# Stop all
Ctrl+C

# Start again
pnpm dev
```
