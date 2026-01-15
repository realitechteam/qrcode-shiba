# 📅 Sprint Planning

## QRCode-Shiba Development Sprints

**Sprint Duration**: 1 week  
**Sprint Start**: Monday  
**Last Updated**: 15/01/2026

---

## 📊 Sprint Overview

| Sprint | Name | Dates | Status | Velocity |
|--------|------|-------|--------|----------|
| 1 | Project Setup | 01/01 - 05/01 | ✅ Done | 20/20 |
| 2 | Authentication | 06/01 - 08/01 | ✅ Done | 25/25 |
| 3 | QR Generation | 09/01 - 11/01 | ✅ Done | 20/20 |
| 4 | Payment Integration | 12/01 - 14/01 | ✅ Done | 15/15 |
| 5 | Folder Management | 14/01 - 15/01 | ✅ Done | 20/20 |
| 6 | Bulk QR Generation | 15/01 - 20/01 | 🔄 In Progress | - |
| 7 | Team Collaboration | 20/01 - 27/01 | 📋 Planned | - |
| 8 | API & Optimization | 27/01 - 03/02 | 📋 Planned | - |

---

## ✅ Sprint 1: Project Setup (01/01 - 05/01)

**Goal**: Thiết lập cơ sở hạ tầng dự án

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| Khởi tạo monorepo (Turborepo) | 3 | Tech Lead | ✅ Done |
| Setup TypeScript configs | 2 | Tech Lead | ✅ Done |
| Setup ESLint & Prettier | 2 | Backend Dev | ✅ Done |
| Docker Compose cho dev | 5 | DevOps | ✅ Done |
| Prisma schema design | 5 | Backend Dev | ✅ Done |
| Next.js frontend skeleton | 3 | Frontend Dev | ✅ Done |

**Total**: 20 points | **Completed**: 20 points | **Velocity**: 100%

---

## ✅ Sprint 2: Authentication (06/01 - 08/01)

**Goal**: Hệ thống đăng ký, đăng nhập hoàn chỉnh

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| Auth Service setup (NestJS) | 3 | Backend Dev | ✅ Done |
| User registration API | 5 | Backend Dev | ✅ Done |
| JWT authentication | 5 | Backend Dev | ✅ Done |
| Google OAuth integration | 5 | Backend Dev | ✅ Done |
| Login/Register UI | 5 | Frontend Dev | ✅ Done |
| Protected routes | 2 | Frontend Dev | ✅ Done |

**Total**: 25 points | **Completed**: 25 points | **Velocity**: 100%

**Notes**: Fixed JWT secret fallback issue on 15/01.

---

## ✅ Sprint 3: QR Code Generation (09/01 - 11/01)

**Goal**: Core QR generation với đa dạng loại

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| QR Service setup | 3 | Backend Dev | ✅ Done |
| URL QR generation | 3 | Backend Dev | ✅ Done |
| vCard, WiFi, Text QR | 5 | Backend Dev | ✅ Done |
| QR styling (colors, patterns) | 5 | Backend Dev | ✅ Done |
| Logo overlay | 3 | Backend Dev | ✅ Done |
| QR Creator UI | 5 | Frontend Dev | ✅ Done |
| QR Preview component | 3 | Frontend Dev | ✅ Done |

**Total**: 27 points | **Completed**: 27 points | **Velocity**: 100%

---

## ✅ Sprint 4: Payment Integration (12/01 - 14/01)

**Goal**: Tích hợp thanh toán VNPay và MoMo

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| Payment Service setup | 3 | Backend Dev | ✅ Done |
| VNPay integration | 5 | Backend Dev | ✅ Done |
| MoMo integration | 5 | Backend Dev | ✅ Done |
| Subscription management | 5 | Backend Dev | ✅ Done |
| Pricing page UI | 3 | Frontend Dev | ✅ Done |
| Checkout flow | 3 | Frontend Dev | ✅ Done |

**Total**: 24 points | **Completed**: 24 points | **Velocity**: 100%

---

## ✅ Sprint 5: Folder Management (14/01 - 15/01)

**Goal**: Quản lý QR codes theo thư mục

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| Folder CRUD API | 5 | Backend Dev | ✅ Done |
| Folder tree structure | 3 | Backend Dev | ✅ Done |
| Move QR to folder API | 3 | Backend Dev | ✅ Done |
| FolderSidebar component | 5 | Frontend Dev | ✅ Done |
| Folder filtering in QR list | 3 | Frontend Dev | ✅ Done |
| Create folder UI | 2 | Frontend Dev | ✅ Done |

**Total**: 21 points | **Completed**: 21 points | **Velocity**: 100%

---

## 🔄 Sprint 6: Bulk QR Generation (15/01 - 20/01)

**Goal**: Tạo QR hàng loạt từ CSV/Excel

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| Bulk create API | 5 | Backend Dev | 📋 Todo |
| CSV/Excel parser | 5 | Backend Dev | 📋 Todo |
| Bulk download (ZIP) | 5 | Backend Dev | 📋 Todo |
| Bulk upload UI | 5 | Frontend Dev | 📋 Todo |
| Progress indicator | 3 | Frontend Dev | 📋 Todo |
| Template download | 2 | Frontend Dev | 📋 Todo |

**Total**: 25 points | **Target**: 25 points

---

## 📋 Sprint 7: Team Collaboration (20/01 - 27/01)

**Goal**: Chia sẻ QR giữa team members

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| Team/Workspace model | 5 | Backend Dev | 📋 Planned |
| Invite members API | 5 | Backend Dev | 📋 Planned |
| Role-based permissions | 5 | Backend Dev | 📋 Planned |
| Team settings UI | 5 | Frontend Dev | 📋 Planned |
| Member management | 3 | Frontend Dev | 📋 Planned |
| Shared folders | 3 | Backend Dev | 📋 Planned |

**Total**: 26 points

---

## 📋 Sprint 8: API & Optimization (27/01 - 03/02)

**Goal**: Public API và tối ưu hiệu suất

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| API keys management | 5 | Backend Dev | 📋 Planned |
| Rate limiting | 3 | Backend Dev | 📋 Planned |
| API documentation (Swagger) | 3 | Backend Dev | 📋 Planned |
| Performance optimization | 5 | Tech Lead | 📋 Planned |
| Caching layer | 5 | Backend Dev | 📋 Planned |
| Load testing | 3 | QA | 📋 Planned |

**Total**: 24 points

---

## 📋 Backlog

| Story | Priority | Estimate |
|-------|----------|----------|
| Email verification | P1 | 5 |
| Password reset | P1 | 3 |
| Two-factor auth | P2 | 5 |
| Export analytics | P2 | 5 |
| Custom domains | P2 | 8 |
| Webhook notifications | P2 | 5 |
| White-label solution | P3 | 13 |

---

*Sprint planning managed by PM*
