# 📝 Changelog

All notable changes to QRCode-Shiba will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Sprint 6 - Bulk QR Generation
- [ ] Bulk create API
- [ ] CSV/Excel parser
- [ ] Bulk download ZIP
- [ ] Upload UI

---

## [1.0.0-alpha.5] - 2026-01-15

### Added
- **Firebase Google Authentication** - Users can now login with Google via Firebase
- **Firebase Sync Endpoint** - `POST /auth/firebase/sync` to sync Firebase users with database
- **QR Naming** - Users can now set custom names when creating QR codes
- **QR Actions Menu** - Dropdown menu with Open Link, Download, Edit, Delete actions
- **Session Persistence** - Zustand store now properly hydrates from localStorage

### Fixed
- **Session lost on navigation** - Added `_hasHydrated` flag to wait for Zustand hydration before auth check
- **Firebase UID mismatch** - Created sync endpoint to map Firebase UIDs to database UUIDs
- **500 error on QR creation** - Resolved by using database user ID instead of Firebase UID

### Changed
- Updated `auth-store.ts` with `onRehydrateStorage` callback
- Updated dashboard layout to check `_hasHydrated` before redirecting

---

## [1.0.0-alpha.4] - 2026-01-15

### Added
- **Folder Management** - Organize QR codes in folders
- **Folder Sidebar** - Visual folder tree in dashboard
- **Folder Filtering** - Filter QR list by folder
- **Move QR to Folder** - Drag/drop QR codes between folders

---

## [1.0.0-alpha.3] - 2026-01-14

### Added
- **VNPay Integration** - Vietnamese payment gateway
- **MoMo Integration** - Mobile wallet payment
- **Subscription Tiers** - Free, Pro, Business, Enterprise plans
- **Pricing Page** - Visual pricing comparison

---

## [1.0.0-alpha.2] - 2026-01-11

### Added
- **QR Code Generation** - All types (URL, vCard, WiFi, Text, Email, Phone, SMS, Location)
- **QR Styling** - Custom colors, corner styles, patterns
- **Logo Overlay** - Add logo to QR codes
- **Download Formats** - PNG, SVG support
- **QR Preview** - Real-time preview during creation

---

## [1.0.0-alpha.1] - 2026-01-08

### Added
- **User Registration** - Email/password signup
- **Login System** - JWT authentication
- **Google OAuth** - Server-side OAuth flow
- **Protected Routes** - Dashboard auth guard

### Fixed
- JWT secret fallback for development environment
- TypeScript moduleResolution configuration

---

## [1.0.0-alpha.0] - 2026-01-05

### Added
- **Project Setup** - Turborepo monorepo structure
- **Next.js Frontend** - App Router, TailwindCSS
- **NestJS Backend** - Microservices architecture
- **Database Schema** - Prisma with PostgreSQL
- **Docker Development** - Docker Compose for local services

---

*Changelog maintained by Development Team*
