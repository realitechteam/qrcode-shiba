# 🐕 QRCode-Shiba

> Nền tảng tạo và quản lý mã QR code hiện đại cho doanh nghiệp Việt Nam

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### Setup

1. **Clone and install dependencies**

```bash
cd qrcode-shiba
pnpm install
```

2. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start infrastructure services**

```bash
docker-compose up -d
```

4. **Setup database**

```bash
pnpm db:generate
pnpm db:push
```

5. **Start development servers**

```bash
pnpm dev
```

### Access the applications

- **Web App**: http://localhost:3000
- **Auth API**: http://localhost:3001/api/v1
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001
- **Mailhog UI**: http://localhost:8025

## 📁 Project Structure

```
qrcode-shiba/
├── apps/
│   └── web/                    # Next.js 14 Frontend
├── services/
│   ├── auth-service/           # NestJS Authentication
│   ├── qr-service/             # QR Generation (coming)
│   ├── redirect-service/       # Fast Redirect (coming)
│   └── analytics-service/      # Scan Analytics (coming)
├── packages/
│   ├── database/               # Prisma schema & client
│   ├── typescript-config/      # Shared TS configs
│   └── eslint-config/          # Shared ESLint configs
├── docker-compose.yml          # Local dev infrastructure
└── turbo.json                  # Turborepo config
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Auth**: Passport.js + JWT

### Infrastructure
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: AWS S3 / MinIO
- **Queue**: (coming) Apache Kafka

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all services in development |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for all required environment variables.

## 📄 API Documentation

API documentation is available at `/api/v1/docs` when running in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

---

Made with ❤️ in Vietnam 🇻🇳
