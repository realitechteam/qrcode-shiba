# 👥 Team Structure

## QRCode-Shiba Project Team

**Last Updated**: 15/01/2026

---

## 🏢 Organization Chart

```
                    ┌─────────────────┐
                    │      CEO        │
                    │   (Stakeholder) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Project Manager │
                    │   Nguyễn Văn A  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│   Tech Lead     │ │  Product Owner  │ │   QA Lead       │
│   Trần Văn B    │ │   Lê Thị C      │ │   Phạm Văn D    │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
┌────────┴────────────────────────────┐
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  Backend    │  │  Frontend   │  │
│  │  Developer  │  │  Developer  │  │
│  │  Hoàng E    │  │  Ngọc F     │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  DevOps     │  │  Designer   │  │
│  │  Minh G     │  │  Hương H    │  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
```

---

## 📋 Team Roles & Responsibilities

### Executive Sponsor
| Role | Name | Responsibilities |
|------|------|------------------|
| **CEO** | [CEO Name] | Strategic direction, funding approval, major decisions |

---

### Core Team

| Role | Name | Email | Responsibilities |
|------|------|-------|------------------|
| **Project Manager** | Nguyễn Văn A | pm@qrcode-shiba.vn | Timeline, resources, stakeholder communication, risk management |
| **Tech Lead / SA** | Trần Văn B | techload@qrcode-shiba.vn | Architecture decisions, code review, technical mentoring |
| **Product Owner** | Lê Thị C | po@qrcode-shiba.vn | Backlog prioritization, requirements, user stories |
| **QA Lead** | Phạm Văn D | qa@qrcode-shiba.vn | Test strategy, quality assurance, bug tracking |

---

### Development Team

| Role | Name | Skills | Current Focus |
|------|------|--------|---------------|
| **Backend Developer** | Hoàng E | NestJS, Prisma, PostgreSQL | API development, payment integration |
| **Frontend Developer** | Ngọc F | Next.js, React, TypeScript | Dashboard UI, QR components |
| **DevOps Engineer** | Minh G | Docker, AWS, CI/CD | Infrastructure, deployment |
| **UI/UX Designer** | Hương H | Figma, Design Systems | User experience, visual design |

---

## 📊 Team Metrics

### Velocity
| Sprint | Story Points | Completed | Velocity |
|--------|--------------|-----------|----------|
| Sprint 1-4 | 80 | 75 | 94% |
| Sprint 5 | 20 | 20 | 100% |
| **Average** | - | - | **96%** |

### Communication
- **Daily Standup**: 9:00 AM (15 mins)
- **Sprint Planning**: Monday 10:00 AM
- **Sprint Review**: Friday 3:00 PM
- **Retrospective**: Friday 4:00 PM

---

## 🔧 Tools & Platforms

| Category | Tool | Purpose |
|----------|------|---------|
| **Project Management** | Jira | Sprint tracking, backlog |
| **Documentation** | Confluence / Notion | Wiki, docs |
| **Communication** | Slack | Team chat |
| **Code Repository** | GitHub | Version control |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Design** | Figma | UI/UX design |
| **Monitoring** | Sentry | Error tracking |

---

## 📞 Escalation Path

```
Developer → Tech Lead → PM → CEO
                ↓
            Product Owner (for scope changes)
```

---

## 🎯 RACI Matrix

| Activity | CEO | PM | Tech Lead | Dev Team | QA |
|----------|-----|-----|-----------|----------|-----|
| Architecture Decisions | I | C | A/R | C | I |
| Sprint Planning | I | A | R | R | C |
| Code Development | I | I | C | A/R | I |
| Code Review | - | I | A/R | R | I |
| Testing | I | I | C | C | A/R |
| Deployment | I | A | R | R | C |
| Release Decisions | C | A | R | I | C |

**Legend**: R = Responsible, A = Accountable, C = Consulted, I = Informed

---

*Contact PM for team-related queries*
