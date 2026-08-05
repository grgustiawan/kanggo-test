# 🚀 Kanggo — Task Management System

[![Bun](https://img.shields.io/badge/Bun-Runtime-f9f1e1?logo=bun)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://mysql.com)
[![DragonflyDB](https://img.shields.io/badge/DragonflyDB-Cache-green?logo=dragonfly)](https://dragonflydb.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)

Aplikasi Task Management System full-stack yang dibangun dengan arsitektur **Clean Architecture** (Domain-Driven Design). Dirancang untuk mengelola task dalam skala besar (teruji hingga **100K+ tasks**) dengan performa tinggi berkat **MySQL FULLTEXT N-gram Tokenization** dan **DragonflyDB Cache Layer**.

---

## 🎬 Demo Video

<p align="center">
  <a href="https://www.youtube.com/watch?v=RfvBodQ4fwQ">
    <img src="https://img.youtube.com/vi/RfvBodQ4fwQ/maxresdefault.jpg" alt="Demo Video Kanggo Task Management System" width="800" />
  </a>
</p>

<p align="center">
  ▶️ <a href="https://www.youtube.com/watch?v=RfvBodQ4fwQ"><b>Tonton Demo Video di YouTube</b></a>
</p>

---

## 📑 Daftar Isi

- [Demo Video](#-demo-video)
- [Tampilan UI](#-tampilan-ui)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Performance Optimization: N-gram + DragonflyDB](#-performance-optimization-search-dengan-n-gram-tokenization--dragonfly-cache)
- [Struktur Proyek](#-struktur-proyek)
- [Quick Start (Docker)](#-quick-start-docker--paling-mudah)
- [Manual Setup (Development)](#-menjalankan-secara-manual-development)
- [Database & Seeding](#-database--seeding)
- [API Documentation](#-dokumentasi-api-swagger-ui)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Keamanan](#-keamanan)

---

## 🖼 Tampilan UI

### Login

<table>
  <tr>
    <td width="70%">
      <img src="ui-ux/login.jpg" alt="Login - Desktop" />
    </td>
    <td width="30%">
      <img src="ui-ux/login-mobile.jpg" alt="Login - Mobile" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>Desktop</b></td>
    <td align="center"><b>Mobile</b></td>
  </tr>
</table>

### Register

<table>
  <tr>
    <td width="70%">
      <img src="ui-ux/register.jpg" alt="Register - Desktop" />
    </td>
    <td width="30%">
      <img src="ui-ux/register-mobile.jpg" alt="Register - Mobile" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>Desktop</b></td>
    <td align="center"><b>Mobile</b></td>
  </tr>
</table>

### Dashboard

<table>
  <tr>
    <td width="70%">
      <img src="ui-ux/dashboard.jpg" alt="Dashboard - Desktop" />
    </td>
    <td width="30%">
      <img src="ui-ux/dashboard-mobile.jpg" alt="Dashboard - Mobile" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>Desktop</b></td>
    <td align="center"><b>Mobile</b></td>
  </tr>
</table>

### Task Management

<table>
  <tr>
    <td width="70%">
      <img src="ui-ux/tasks.jpg" alt="Tasks - Desktop" />
    </td>
    <td width="30%">
      <img src="ui-ux/tasks-mobile.jpg" alt="Tasks - Mobile" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>Desktop</b></td>
    <td align="center"><b>Mobile</b></td>
  </tr>
</table>

### User Management

<table>
  <tr>
    <td width="70%">
      <img src="ui-ux/users.jpg" alt="Users - Desktop" />
    </td>
    <td width="30%">
      <img src="ui-ux/users-mobile.jpg" alt="Users - Mobile" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>Desktop</b></td>
    <td align="center"><b>Mobile</b></td>
  </tr>
</table>

---

## ✨ Fitur Utama

| Kategori | Fitur |
|---|---|
| **Autentikasi** | Register, Login, Logout, JWT Access + Refresh Token (HttpOnly Cookie), Auto Token Refresh |
| **RBAC** | Role-Based Access Control (superadmin, admin, manager, user, viewer) dengan granular permissions |
| **Task Management** | CRUD task, status tracking (pending → in_progress → done), prioritas (low/medium/high), deadline, soft delete |
| **Search** | Full-text search menggunakan MySQL FULLTEXT Index dengan **N-gram Parser** — mendukung pencarian substring & bahasa Indonesia |
| **Caching** | Multi-layer caching dengan **DragonflyDB** (Redis-compatible, multi-threaded) — search result cache, idempotency keys, session management |
| **Pagination** | Dual-mode: **Cursor-based** (mobile/infinite scroll) & **Offset-based** (desktop/table) |
| **Dashboard** | Statistik real-time (total users, tasks by status), recent activity, pie chart progress |
| **Audit Trail** | Automatic audit logging via MySQL triggers untuk setiap operasi pada `users` dan `tasks` |
| **Auto Partitioning** | MySQL Event Scheduler untuk auto-create partisi bulanan pada tabel `tasks` dan `audit_logs` |
| **Atomic Operations** | Stored Procedures dengan transaction isolation untuk atomic task creation & auto-numbering (`TSK-{orgId}-{sequence}`) |
| **Rate Limiting** | Redis-backed rate limiter (100 req/15min global, 10 req/min untuk endpoint sensitif) |
| **Idempotency** | Idempotency key support pada operasi create dan update task untuk mencegah duplikasi |
| **API Docs** | Swagger UI interaktif terintegrasi di `/api-docs` |
| **Unit Testing** | Comprehensive test suite menggunakan Bun test runner |
| **Docker** | Full containerized deployment dengan Docker Compose (4 services) |

---

## 🛠 Tech Stack

### Backend
| Teknologi | Fungsi |
|---|---|
| **[Bun](https://bun.sh)** | JavaScript Runtime (pengganti Node.js, lebih cepat) |
| **[Express.js](https://expressjs.com) v5** | HTTP Framework |
| **[Drizzle ORM](https://orm.drizzle.team)** | Type-safe SQL ORM |
| **[MySQL 8.0](https://mysql.com)** | Relational Database (FULLTEXT, Stored Procedures, Triggers, Partitioning, Events) |
| **[DragonflyDB](https://dragonflydb.io)** | In-memory cache (Redis-compatible, multi-threaded, ~25x lebih hemat memori) |
| **[Argon2](https://github.com/ranisalt/node-argon2)** | Password hashing (winner PHC) |
| **[JWT](https://jwt.io)** | Stateless authentication (Access + Refresh token) |
| **[Zod](https://zod.dev) v4** | Schema validation |
| **[Helmet](https://helmetjs.github.io)** | HTTP security headers |
| **[Redlock](https://github.com/mike-marcacci/node-redlock)** | Distributed locking |
| **[Swagger](https://swagger.io)** | API documentation |

### Frontend
| Teknologi | Fungsi |
|---|---|
| **[Next.js 16](https://nextjs.org)** | React Framework (App Router + Turbopack) |
| **[React 19](https://react.dev)** | UI Library |
| **[Tailwind CSS](https://tailwindcss.com)** | Utility-first CSS |
| **[Shadcn UI](https://ui.shadcn.com)** | Accessible component library (Radix UI primitives) |
| **[Framer Motion](https://www.framer.com/motion)** | Animation library |
| **[Recharts](https://recharts.org)** | Charting library |
| **[Lucide React](https://lucide.dev)** | Icon library |
| **[React Hook Form](https://react-hook-form.com)** | Form management |

### Infrastructure
| Teknologi | Fungsi |
|---|---|
| **[Docker Compose](https://docs.docker.com/compose/)** | Container orchestration (4 services) |
| **Multi-stage Build** | Optimized Docker images (deps → build → runner) |

---

## 🏛 Arsitektur Sistem

Proyek ini mengikuti prinsip **Clean Architecture** dengan pemisahan layer yang jelas:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                        │
│  Routes → Validators → Middlewares → Handlers                  │
│  (HTTP concerns: request/response, auth, rate limiting)        │
├─────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                         │
│  Services (business orchestration, caching, idempotency)       │
│  Use Cases                                                     │
├─────────────────────────────────────────────────────────────────┤
│                        DOMAIN LAYER                            │
│  Models (Task, User, Auth) & Repository Interfaces             │
│  (pure business logic, no framework dependency)                │
├─────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE LAYER                       │
│  Repository Implementations, Database (Drizzle + MySQL),       │
│  Redis/DragonflyDB, Config, Swagger                            │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Flow
```
Presentation → Application → Domain ← Infrastructure
                                ↑           │
                                └───────────┘
          (Infrastructure implements Domain interfaces)
```

---

## ⚡ Performance Optimization: Search dengan N-gram Tokenization + Dragonfly Cache

Fitur search pada sistem ini dioptimasi dengan pendekatan **dua lapis (two-tier)** yang menggabungkan kemampuan database-level indexing dan in-memory caching.

### 🔤 Layer 1: MySQL FULLTEXT Index dengan N-gram Parser

#### Apa itu N-gram Tokenization?

N-gram adalah teknik tokenisasi teks yang memecah string menjadi subsequences sepanjang **n karakter** yang saling overlap. Berbeda dengan FULLTEXT parser bawaan MySQL yang memecah teks berdasarkan spasi/delimiter (word boundary), **N-gram parser** memecah setiap kata menjadi token-token kecil.

**Contoh** dengan `ngram_token_size=2` (default MySQL):

```
Input  : "Dashboard"
Tokens : ["Da", "as", "sh", "hb", "bo", "oa", "ar", "rd"]

Input  : "Mengoptimasi"
Tokens : ["Me", "en", "ng", "go", "op", "pt", "ti", "im", "ma", "as", "si"]
```

#### Mengapa N-gram, bukan Default FULLTEXT Parser?

| Aspek | Default Parser | N-gram Parser ✅ |
|---|---|---|
| **Bahasa** | Hanya efektif untuk bahasa berbasis spasi (Inggris) | Universal — mendukung bahasa CJK, Indonesia, dll. |
| **Pencarian substring** | ❌ Tidak bisa cari "optimasi" dari "Mengoptimasi" | ✅ Bisa! Token overlap menangkap substring |
| **Minimum word length** | Default 3-4 karakter (butuh konfigurasi `ft_min_word_len`) | Dikontrol oleh `ngram_token_size` (default: 2) |
| **Kata pendek** | ❌ "UI", "DB", "API" sering diabaikan | ✅ Token 2 karakter menangkap kata pendek |
| **Performa index** | Lebih kecil | Sedikit lebih besar (trade-off wajar) |

#### Implementasi di Schema SQL

```sql
-- schema.sql (line 136)
CREATE TABLE tasks (
    ...
    title VARCHAR(500) NOT NULL,
    ...
    FULLTEXT KEY ft_tasks_title_desc (title) WITH PARSER ngram,
    ...
) ENGINE=InnoDB;
```

#### Penggunaan di Query (Boolean Mode)

```typescript
// backend/src/infrastructure/repositories/task.repository.ts
if (search) {
    conditions.push(
        sql`MATCH(${tasks.title}) AGAINST(${search} IN BOOLEAN MODE)`
    );
}
```

**`BOOLEAN MODE`** dipilih karena:
- Tidak memerlukan minimum match threshold (berbeda dengan `NATURAL LANGUAGE MODE`)
- Mendukung operator `+`, `-`, `*` untuk advanced search
- Lebih predictable untuk user-facing search

#### Bagaimana Search Bekerja End-to-End

```
User mengetik "dashboard"
        │
        ▼
┌─────────────────────────────┐
│  MySQL N-gram Parser        │
│  Tokenize query:            │
│  "da","as","sh","hb",       │
│  "bo","oa","ar","rd"        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  FULLTEXT Index Lookup      │
│  Cocokkan tokens query      │
│  dengan tokens di index     │
│  (inverted index matching)  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Results                    │
│  "Mendesain halaman         │
│   dashboard"              ✅│
│  "Update dashboard API"   ✅│
│  "Fix sidebar menu"       ❌│
└─────────────────────────────┘
```

### 🐉 Layer 2: DragonflyDB Cache (Redis-Compatible)

#### Mengapa DragonflyDB, bukan Redis?

[DragonflyDB](https://dragonflydb.io) adalah in-memory data store yang **100% kompatibel dengan Redis protocol** namun dibangun dari scratch dengan arsitektur modern:

| Aspek | Redis | DragonflyDB ✅ |
|---|---|---|
| **Threading** | Single-threaded (event loop) | Multi-threaded (shared-nothing architecture) |
| **Memory efficiency** | ~1x baseline | Hingga **25x lebih hemat memori** (novel hashtable design) |
| **Throughput** | ~100K ops/s (single instance) | Hingga **4M ops/s** (single instance) |
| **Snapshot (RDB)** | Blocking fork() — memory spike 2x | Non-blocking snapshot, tidak ada memory spike |
| **Compatibility** | - | Drop-in replacement untuk Redis (gunakan client Redis biasa) |

#### Strategi Caching

```
User request GET /api/tasks?search=dashboard&status=pending
        │
        ▼
┌──────────────────────────────────────┐
│  CacheService.buildSearchKey()       │
│  Hash query params dengan MD5:       │
│  key = "task:search:{orgId}:{hash}"  │
└──────────────────┬───────────────────┘
                   │
                   ▼
            ┌─────────────┐
            │  Cache HIT?  │
            └──────┬──────┘
              YES  │  NO
         ┌────────┘  └────────┐
         ▼                    ▼
  ┌─────────────┐   ┌──────────────────┐
  │ Return dari │   │ Query ke MySQL   │
  │ DragonflyDB │   │ (FULLTEXT search)│
  │ langsung    │   │                  │
  │ (< 1ms)     │   │ Simpan result ke │
  │             │   │ cache (TTL: 300s)│
  └─────────────┘   └──────────────────┘
```

#### Cache Key Design

```typescript
// CacheService.buildSearchKey()
// Input: orgId=1, params={search:"dashboard", status:"pending", page:1, limit:20}
// Output: "task:search:1:a3f2b8c9d4e5..."  (MD5 hash of JSON params)
```

Menggunakan **MD5 hash** dari seluruh query parameters memastikan:
- Setiap kombinasi unik filter/search/pagination menghasilkan cache key berbeda
- Tidak ada collision antar organisasi (prefix `task:search:{orgId}:`)
- Key tetap pendek dan konsisten

#### Cache Invalidation Strategy

Cache diinvalidasi secara **pattern-based** saat data berubah:

```typescript
// Saat task di-create, update, atau delete:
await this.cacheService.invalidatePattern(`task:search:${organizationId}:*`);
```

Ini menghapus **semua cache search** untuk organisasi tersebut menggunakan `SCAN` + `DEL`, memastikan data selalu konsisten setelah mutasi.

#### Idempotency Keys via Cache

Operasi create dan update task mendukung **idempotency** melalui header `Idempotency-Key`:

```typescript
// Simpan mapping: idempotencyKey → taskId (TTL: 24 jam)
await redis.set(`idem:${idempotencyKey}`, task.id, 'EX', 86400);
```

Ini mencegah duplikasi task jika client mengirim request yang sama berulang kali (misalnya karena network retry).

### 📊 Performa Gabungan (N-gram + Cache)

```
┌─────────────────────────────────────────────────────────┐
│              SEARCH PERFORMANCE TIERS                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🟢 Cache HIT (DragonflyDB)                            │
│     Response time: < 1-5ms                              │
│     Skenario: Query identik dalam 5 menit terakhir     │
│                                                         │
│  🟡 Cache MISS → MySQL FULLTEXT (N-gram)                │
│     Response time: ~10-50ms (100K+ rows)                │
│     Skenario: Query baru / setelah cache invalidation   │
│     Setelah query, hasil disimpan ke cache              │
│                                                         │
│  🔴 Tanpa optimasi (LIKE '%keyword%')                   │
│     Response time: ~500-2000ms (100K+ rows)             │
│     ❌ Full table scan, tidak menggunakan index          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Struktur Proyek

```
kanggo-test/
├── backend/                          # Express.js + Bun
│   ├── src/
│   │   ├── domain/                   # 🟦 Domain Layer (pure business logic)
│   │   │   ├── models/               # Entity types (Task, User, Auth)
│   │   │   └── repository/           # Repository interfaces (contracts)
│   │   ├── application/              # 🟩 Application Layer (orchestration)
│   │   │   ├── services/             # Business services (TaskService, AuthService, CacheService)
│   │   │   └── usecases/             # Use case implementations
│   │   ├── infrastructure/           # 🟧 Infrastructure Layer (implementations)
│   │   │   ├── config/               # Environment & Swagger config
│   │   │   ├── db/                   # Drizzle ORM setup, schema, migrations, seeds
│   │   │   ├── redis/                # DragonflyDB/Redis client + Redlock
│   │   │   ├── repositories/         # Repository implementations (MySQL queries)
│   │   │   └── swagger/              # Swagger configuration
│   │   ├── presentation/             # 🟥 Presentation Layer (HTTP)
│   │   │   ├── handlers/             # Request handlers (controllers)
│   │   │   ├── middlewares/           # Auth, Authorize, Rate Limiter, Validator
│   │   │   ├── routes/               # Express route definitions
│   │   │   └── validators/           # Zod schemas for input validation
│   │   ├── __tests__/                # Unit tests (Bun test runner)
│   │   └── index.ts                  # Application entry point
│   ├── schema.sql                    # Complete SQL schema (tables, SPs, triggers, partitions)
│   ├── Dockerfile                    # Multi-stage Bun image
│   └── docker-entrypoint.sh          # DB init + app start
│
├── frontend/                         # Next.js 16 + React 19
│   ├── app/
│   │   ├── (auth)/                   # Auth pages (login, register)
│   │   ├── (app)/                    # Protected pages
│   │   │   ├── dashboard/            # Dashboard dengan statistik & charts
│   │   │   ├── tasks/                # Task management (CRUD, search, filter)
│   │   │   └── users/                # User management
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── auth/                     # Auth-related components
│   │   ├── dashboard/                # Dashboard widgets
│   │   ├── tasks/                    # Task components
│   │   ├── users/                    # User components
│   │   └── layout/                   # Layout components (sidebar, header)
│   ├── lib/                          # Utilities
│   │   ├── api-client.ts             # HTTP client (auto refresh, retry)
│   │   ├── auth-context.tsx          # React auth context provider
│   │   ├── types.ts                  # TypeScript type definitions
│   │   └── constants.ts              # App constants
│   ├── middleware.ts                 # Next.js middleware (route protection)
│   └── Dockerfile                    # Multi-stage Node.js image
│
├── docker/                           # Docker helper files
│   └── mysql-init.sh                 # MySQL initialization script
│
├── docker-compose.yml                # 4 services: MySQL, DragonflyDB, Backend, Frontend
└── README.md
```

---

## 🐳 Quick Start (Docker — Paling Mudah)

Jika Anda memiliki **Docker Desktop** atau Docker Engine, jalankan seluruh aplikasi dengan 1 perintah:

```bash
docker compose up -d --build
```

Tunggu hingga semua container healthy, lalu akses:

| Service | URL | Keterangan |
|---|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Next.js Dashboard |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | Express.js REST API |
| **Swagger UI** | [http://localhost:5000/api-docs](http://localhost:5000/api-docs) | Interactive API Docs |
| **MySQL** | `localhost:3306` | Database (user: `root`, pass: `password`) |
| **DragonflyDB** | `localhost:6379` | Cache (Redis-compatible) |

### Docker Services Architecture

```
docker-compose.yml
├── mysql         (MySQL 8.0)          Port: 3306
├── redis         (DragonflyDB)        Port: 6379   ← Redis-compatible
├── backend       (Bun + Express)      Port: 5000   depends_on: mysql, redis
└── frontend      (Next.js 16)         Port: 3000   depends_on: backend
```

---

## 🛠 Menjalankan Secara Manual (Development)

### Prasyarat
- [Bun](https://bun.sh) runtime (latest)
- [Node.js](https://nodejs.org) v22+ (untuk frontend)
- MySQL 8.0 (atau jalankan via Docker: `docker compose up mysql -d`)
- DragonflyDB/Redis (atau jalankan via Docker: `docker compose up redis -d`)

### 1. Menjalankan Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
bun install

# Salin dan konfigurasi environment
cp .env.example .env
# Edit .env sesuai koneksi database Anda

# Push schema ke database
bun run db:push

# (Opsional) Jalankan seeder untuk data dummy (100 users + 100K tasks)
bun run db:seed

# Jalankan server development (hot reload)
bun run dev
```

Backend akan berjalan di **http://localhost:5000**

### 2. Menjalankan Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
bun install
# atau: npm install

# Salin dan konfigurasi environment
cp .env.example .env
# Pastikan NEXT_PUBLIC_API_URL=http://localhost:5000

# Jalankan development server (Turbopack)
bun run dev
# atau: npm run dev
```

Frontend akan berjalan di **http://localhost:3000**

---

## 🗄 Database & Seeding

### Schema Highlights

Database schema (`backend/schema.sql`) mencakup fitur-fitur advanced MySQL:

| Fitur | Detail |
|---|---|
| **7 Tabel** | `organizations`, `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `tasks`, `audit_logs`, `task_number_sequences`, `partition_maintenance_log` |
| **FULLTEXT Index** | N-gram parser pada kolom `title` tabel `tasks` |
| **Stored Procedures** | `sp_next_task_number` (atomic sequence), `sp_create_task` (atomic insert with isolation level) |
| **Triggers** | 6 audit triggers pada `users` dan `tasks` (INSERT, UPDATE, DELETE → `audit_logs`) |
| **Partitioning** | Range partitioning by month pada `tasks` dan `audit_logs` |
| **Event Scheduler** | `evt_partition_maintenance` — auto-create partisi 3 bulan ke depan setiap bulan |

### Seeder

Seeder mengisi database dengan data realistis untuk testing performa:

```bash
bun run db:seed
```

Akan membuat:
- 1 Organization: **PT. Tenaga Kanggo Indonesia**
- 100 Users dengan nama Indonesia (password: `testkanggo2026`)
- 5 Roles: superadmin, admin, manager, user, viewer
- 15 Permissions (task.*, user.*, role.*, org.*)
- **100.000 Tasks** dengan title bilingual (Indonesia + Inggris), batch insert 5K/batch
- Task number auto-sequence: `TSK-{orgId}-{000000000001}`

Login setelah seeding:
```
Email: user1@kanggo.test
Password: testkanggo2026
```

---

## 📖 Dokumentasi API (Swagger UI)

Saat backend berjalan, akses dokumentasi lengkap di:

👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Endpoint Overview

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user baru | ❌ |
| `POST` | `/api/auth/login` | Login (set cookie) | ❌ |
| `POST` | `/api/auth/logout` | Logout (clear cookie) | ✅ |
| `POST` | `/api/auth/refresh` | Refresh access token | ❌ (uses refresh cookie) |
| `GET` | `/api/tasks` | List tasks (search, filter, paginate) | ✅ |
| `GET` | `/api/tasks/:id` | Get task by ID | ✅ |
| `POST` | `/api/tasks` | Create task | ✅ + Role |
| `PUT` | `/api/tasks/:id` | Update task | ✅ + Role |
| `DELETE` | `/api/tasks/:id` | Soft delete task | ✅ + Role |
| `GET` | `/api/summary` | Dashboard summary statistics | ✅ |
| `GET` | `/api/users` | List users | ✅ + Role |

---

## 🧪 Testing

Backend memiliki comprehensive test suite menggunakan **Bun test runner**:

```bash
cd backend

# Jalankan semua tests
bun test

# Watch mode
bun test --watch

# Coverage report
bun test --coverage
```

### Test Coverage

| Layer | Files | Tested |
|---|---|---|
| **Services** | `auth.service.test.ts`, `task.service.test.ts` | Business logic, caching, idempotency |
| **Handlers** | `auth.handler.test.ts`, `task.handler.test.ts`, `user.handler.test.ts`, `summary.handler.test.ts` | HTTP request/response handling |
| **Middlewares** | `auth.test.ts`, `authorize.test.ts`, `validate.test.ts` | JWT verification, RBAC, Zod validation |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development              # development | production
APP_PORT=5000                      # Server port
DATABASE_URL=mysql://root:password@localhost:3306/task_management_system
REDIS_URL=redis://localhost:6379   # DragonflyDB connection

JWT_ACCESS_SECRET=your-secret      # ⚠️ Ganti di production!
JWT_REFRESH_SECRET=your-secret     # ⚠️ Ganti di production!
JWT_ACCESS_EXPIRES_IN=15m          # Access token TTL
JWT_REFRESH_EXPIRES_IN=7d          # Refresh token TTL
COOKIE_DOMAIN=                     # Cookie domain (kosongkan untuk localhost)
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000   # Backend API URL
```

---

## 🔒 Keamanan

| Mekanisme | Implementasi |
|---|---|
| **Password Hashing** | Argon2 (PHC winner, memory-hard) |
| **JWT HttpOnly Cookie** | Token tidak bisa diakses JavaScript client (XSS protection) |
| **Access + Refresh Token** | Access token short-lived (15m), refresh token stored di Redis (7d) |
| **RBAC** | Role-based middleware checks sebelum akses endpoint |
| **Rate Limiting** | Redis-backed: 100 req/15min (global), 10 req/1min (strict) |
| **Helmet** | Security headers (CSP, X-Frame-Options, HSTS, dll.) |
| **Input Validation** | Zod schema validation pada semua endpoint |
| **Soft Delete** | Data tidak pernah benar-benar dihapus, selalu bisa di-audit |
| **CORS** | Configured dengan `credentials: true` |
| **Distributed Lock** | Redlock untuk operasi concurrent-safe |

---

## 📜 Scripts Reference

### Backend

```bash
bun run dev          # Development server (hot reload)
bun run start        # Production server
bun test             # Run all tests
bun test --watch     # Watch mode testing
bun test --coverage  # Coverage report
bun run db:push      # Push Drizzle schema ke MySQL
bun run db:generate  # Generate Drizzle migrations
bun run db:seed      # Seed database (100 users + 100K tasks)
bun run db:init      # Initialize database (used in Docker)
```

### Frontend

```bash
bun run dev          # Development server (Turbopack)
bun run build        # Production build
bun run start        # Start production server
bun run lint         # ESLint check
```

---
