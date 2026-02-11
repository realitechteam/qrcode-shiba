#!/bin/bash

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Usage: DATABASE_URL='postgresql://...' ./scripts/deploy-admin.sh"
  exit 1
fi

echo "🚀 Deploying Admin Panel Database Changes..."

# 1. Push schema changes (create tables/columns) without data loss if possible
echo "📦 Running prisma db push..."
cd packages/database
npx prisma db push

# 2. Seed data (SystemConfig + Admin Role)
echo "🌱 Seeding data..."
npm run db:seed

echo "✅ Deployment complete!"
echo "   - Schema updated"
echo "   - System config set (affiliate_total_rate = 0.20)"
echo "   - Admin role granted to partner@realitech.dev (if user exists)"
