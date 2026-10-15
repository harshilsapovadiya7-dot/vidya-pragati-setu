# 🎓 VIDYA PRAGATI SETU (વિદ્યા પ્રગતિ સેતુ)
> **One-Stop Integrated Digital Platform for Student Scholarships & Material Assistance Schemes**  
> *Education Department, Government of Gujarat (Hackathon Demonstration Prototype)*

---

## 📌 Executive Summary

**Vidya Pragati Setu** is an enterprise-grade, modern, and unified educational welfare delivery platform. Designed specifically for the state of Gujarat, it eliminates departmental silos by bridging:
1. **Financial Scholarships & Direct Benefit Transfer (DBT)** (e.g., Namo Lakshmi Yojana, Namo Saraswati Vigyan Sadhna Yojana, Mukhyamantri Gyan Sadhna, Gyan Setu, NMMS).
2. **Material Assistance Physical Asset Traceability** (e.g., Saraswati Sadhna Yojana bicycle supply chain tracking from state allocation, central warehouse dispatch, school receipt, through to student QR/OTP verified handover).
3. **Single Student Digital Document Vault** (allowing reusable verified credentials across multiple schemes with zero duplicate file re-uploads).
4. **Explainable Deterministic Eligibility Engine** (transparent criteria breakdown explaining rule satisfaction, missing prerequisites, and required document verifications).
5. **Multi-Tier Administrative Governance** (isolated dashboards for School Teachers/Principals, District Education Officers, and State Directorate Leadership).

---

## 🌟 Hackathon Key Differentiators

- **Unified Student Record**: One profile re-used seamlessly across all scholarship applications without redundant data entry.
- **Explainable Eligibility Engine**: Transparent evaluation reporting precise rules satisfied (`EQUALS`, `IN`, `GREATER_EQUAL`, `LESS_THAN`, etc.), missing prerequisites, and required document approvals.
- **Physical Asset Traceability**: End-to-end bicycle supply chain lifecycle (`ALLOCATED` ➔ `DISPATCHED` ➔ `RECEIVED_BY_SCHOOL` ➔ `DELIVERY_CONFIRMED`) with tamper-proof QR code generation, OTP verification, and duplicate delivery prevention.
- **Simulated DBT Banking Pipeline**: Realistic mock adapter representing the 8-stage PFMS / NPCI Aadhaar-payment bridge with simulated state advancement and bank reconciliation.
- **Multi-Role Governance**: Tailored workspaces for Students, Teachers, Principals, District Education Officers (DEOs), and State Directorate Administrators.
- **Live Automated Test Suite**: Built-in test runner verifying 12 mission-critical business logic rules.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite & TypeScript
- **Styling**: Tailwind CSS with custom Gujarat government visual palette (Deep Navy `#0f172a`, Saffron/Orange `#f97316`, Emerald `#059669`)
- **UI Architecture**: shadcn/ui design patterns, Radix UI accessible primitives, Lucide React icons
- **Data Visualization**: Recharts for administrative and district performance analytics
- **Routing & State**: React Router v6 with Role-Based Protected Routes, Axios API client with HTTP-only cookie support
- **Form Validation**: React Hook Form with Zod schemas

### Backend
- **Runtime**: Node.js v24 LTS with TypeScript & Express.js
- **Database ORM**: Prisma ORM v5
- **Database**: SQLite (`dev.db`) for immediate zero-dependency local demonstration; fully architected and convertible to PostgreSQL for production
- **Security**: Helmet headers, CORS credentials whitelist, express-rate-limit, bcryptjs password hashing, JWT authentication via HTTP-only cookies

---

## 📁 Project Directory Structure

```text
vidya-pragati-setu/
├── .env.example                       # Environment configuration template
├── .env                               # Active development environment variables
├── package.json                       # Monorepo root workspace scripts
├── README.md                          # Comprehensive platform documentation
│
├── server/                            # Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma              # 17 normalized relational models
│   │   ├── seed.ts                    # Synthetic seed script for Gujarat institutions
│   │   └── dev.db                     # Active SQLite database
│   ├── src/
│   │   ├── config/env.ts              # Validated environment loader
│   │   ├── lib/prisma.ts              # Singleton Prisma client instance
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT authentication & RBAC middleware
│   │   │   └── errorHandler.ts        # Centralized AppError handling
│   │   ├── routes/
│   │   │   ├── application.routes.ts  # Multi-stage scholarship workflow
│   │   │   ├── asset.routes.ts        # Bicycle traceability & QR/OTP
│   │   │   ├── audit.routes.ts        # System audit trail logs
│   │   │   ├── auth.routes.ts         # Login, logout, session verification
│   │   │   ├── document.routes.ts     # Protected vault file handling
│   │   │   ├── eligibility.routes.ts  # Deterministic rule evaluation
│   │   │   ├── notification.routes.ts # In-app notification queue
│   │   │   ├── payment.routes.ts      # DBT payment state machine simulation
│   │   │   ├── report.routes.ts       # CSV export & KPI aggregations
│   │   │   ├── scheme.routes.ts       # Welfare scheme catalog CRUD
│   │   │   └── student.routes.ts      # Profile management & promotion
│   │   ├── services/
│   │   │   ├── audit.service.ts       # Audit logging utility
│   │   │   ├── eligibility.service.ts # Core multi-operator rule engine
│   │   │   └── notification.service.ts# Event-driven in-app notifications
│   │   ├── tests/
│   │   │   └── business-logic.test.ts # 12 automated unit/integration tests
│   │   ├── utils/
│   │   │   ├── csvExport.ts           # Dynamic CSV formatting utility
│   │   │   └── generateId.ts          # Collision-checked unique references
│   │   └── index.ts                   # Express server startup entry
│   ├── uploads/                       # Private document vault storage
│   ├── package.json
│   └── tsconfig.json
│
└── client/                            # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── DashboardLayout.tsx# Collapsible role-tailored sidebar & navbar
    │   │   │   ├── DemoBanner.tsx     # Persistent demonstration watermark
    │   │   │   ├── ProtectedRoute.tsx # Role-based access route guard
    │   │   │   └── PublicLayout.tsx   # Public government navigation & footer
    │   │   ├── shared/
    │   │   │   ├── ConfirmDialog.tsx  # Confirmation modals
    │   │   │   ├── DataTable.tsx      # Paginated, searchable, sortable tables
    │   │   │   ├── EmptyState.tsx     # Friendly fallback UI
    │   │   │   ├── FilterBar.tsx      # Multi-select dropdown filters
    │   │   │   ├── LoadingSkeleton.tsx# Shimmer loading cards
    │   │   │   ├── PageHeader.tsx     # Consistent breadcrumb and title headers
    │   │   │   ├── ProgressStepper.tsx# 6-stage horizontal application stepper
    │   │   │   ├── SchemeCard.tsx     # Card view for scholarship discovery
    │   │   │   ├── StatCard.tsx       # KPI stat summary cards with trend badges
    │   │   │   └── StatusBadge.tsx    # Color-coded workflow badges
    │   │   └── ui/                    # 17+ Radix-powered UI components
    │   ├── contexts/
    │   │   ├── AuthContext.tsx        # Session state & demo persona 1-click switcher
    │   │   └── NotificationContext.tsx# Real-time unread counter & notifications
    │   ├── lib/
    │   │   ├── api.ts                 # Axios REST client with typed endpoints
    │   │   ├── constants.ts           # System status enums & Gujarati labels
    │   │   └── utils.ts               # Formatting helpers (INR currency, dates, cn)
    │   ├── pages/
    │   │   ├── admin/                 # 9 State Directorate governance dashboards
    │   │   ├── district/              # 5 District Education Officer dashboards
    │   │   ├── public/                # Landing page, Login, Scheme catalog, Help
    │   │   ├── school/                # 5 Institutional Teacher/Principal pages
    │   │   └── student/               # 9 Beneficiary student & vault pages
    │   ├── App.tsx                    # Complete route registry
    │   └── main.tsx                   # Browser mounting entry
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🔑 Demonstration Accounts & Credentials

For fast evaluation during hackathon judging, the login screen includes a **1-Click Demo Persona Switcher** that pre-fills and authenticates any role instantly:

| Role | Email | Password | Name / Jurisdiction |
| :--- | :--- | :--- | :--- |
| 👑 **State Administrator** | `admin@vpse.gov.in` | `admin123` | Rajesh Kumar Sharma (State Directorate) |
| 🏢 **District Education Officer** | `do.ahmedabad@vpse.gov.in` | `demo123` | Priya Desai (Ahmedabad District) |
| 🏫 **School Principal** | `principal.s001@vpse.gov.in` | `demo123` | Dr. Harshvardhan Shukla (Shri Swaminarayan Vidyalaya) |
| 👩‍🏫 **School Teacher** | `teacher.s001@vpse.gov.in` | `demo123` | Swaminarayan Vidyalaya Staff |
| 🎒 **Student (Class 10 - Boy)** | `student1@vpse.gov.in` | `demo123` | Arjun Patel (Gyan Setu Merit Scholar) |
| 🎒 **Student (Class 9 - Girl)** | `student2@vpse.gov.in` | `demo123` | Priya Shah (Namo Lakshmi & Bicycle Beneficiary) |

*(Additional accounts exist in the seed for Surat, Vadodara, Rajkot, and Gandhinagar jurisdictions).*

---

## ⚡ Quickstart: Installation & Execution

### Prerequisites
- Node.js v18+ (Node.js v24 LTS recommended)
- npm v9+

### 1. Initial Setup
```bash
# Clone or navigate into the project directory
cd vidya-pragati-setu

# Configure environment variables
cp .env.example .env
cp .env.example server/.env
```

### 2. Install Dependencies & Setup Database
```bash
# Install backend dependencies
cd server
npm install

# Generate Prisma Client & Sync SQLite schema
npx prisma generate
npx prisma db push

# Seed with synthetic Gujarat demonstration data
npm run db:seed

# Install frontend dependencies
cd ../client
npm install
```

### 3. Run Automated Tests
```bash
cd ../server
npm test
```
*Executes all 12 automated unit and integration tests verifying eligibility rules, RBAC, uniqueness constraints, and asset verifications.*

### 4. Start Development Servers
You can start both servers simultaneously or in separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Starts on http://localhost:3000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Starts on http://localhost:5173
```

Access the web portal in your browser: **[http://localhost:5173](http://localhost:5173)**.

---

## 🧪 Test Results

The integrated automated test runner executes against the live seeded database:

```text
🧪 Starting Vidya Pragati Setu Automated Business Logic Test Suite...

  ✅ PASS: Authentication: bcrypt password hashing and verification
  ✅ PASS: RBAC: Users have verified roles across hierarchy
  ✅ PASS: Data Isolation: School and District mapping integrity
  ✅ PASS: Eligibility Engine: Namo Lakshmi evaluates female students in grades 9-12
  ✅ PASS: Eligibility Engine: Male student in grade 10 is NOT eligible for Namo Lakshmi
  ✅ PASS: Application Integrity: Duplicate application prevention for same period
  ✅ PASS: Workflow: Application status history tracking is preserved
  ✅ PASS: Document Vault: Reusable verified documents linked to student
  ✅ PASS: Asset Traceability: Saraswati Sadhna bicycle delivery event log and QR/OTP verification
  ✅ PASS: Asset Integrity: Delivery verification uniqueness constraint
  ✅ PASS: DBT Tracking: Simulated Direct Benefit Transfer stages
  ✅ PASS: Reporting: District-level and School-level student statistics aggregation

=============================================
🏁 Test Summary: 12 Passed, 0 Failed
=============================================
```

---

## 🔄 Production Deployment & PostgreSQL Configuration

### Switch from SQLite (Development) to PostgreSQL (Production)
1. In `server/prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `server/.env`:
   ```env
   DATABASE_URL="postgresql://vps_user:SecurePassword123@db-host.internal:5432/vidya_pragati_setu?schema=public"
   NODE_ENV="production"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Production Build
```bash
# Build backend
cd server && npm run build

# Build frontend
cd ../client && npm run build
```
The optimized client bundle is generated in `client/dist` and can be served via NGINX, Cloudflare Pages, AWS S3/CloudFront, or directly through Express.

---

## ⚠️ Prototype Scope & Known Limitations

1. **Aadhaar / DigiLocker Integration**: For demonstration safety, actual Aadhaar XML demographic verification and DigiLocker APIs are decoupled and replaced with internal cryptographic student IDs (`GJ2024STU1001`).
2. **PFMS / NPCI Payment Gateway**: Real funds are not moved. The platform utilizes a simulated banking state machine representing real PFMS clearing stages (`INITIATED` ➔ `BANK_VERIFICATION_PENDING` ➔ `PROCESSING` ➔ `SUCCESSFUL`).
3. **SMS OTP Gateway**: Phone OTP handovers use development mock verification codes (`884219`) without live telecom charges.
4. **Local File Storage**: Uploaded certificates reside in `server/uploads`. In a production cloud deployment, this adapter connects to S3/GCS buckets with presigned URLs.

---

*Vidya Pragati Setu — "One Student. One Record. Every Eligible Opportunity."*
