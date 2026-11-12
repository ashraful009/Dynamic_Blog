# Environment Variables & Configuration Inventory (Phase 9)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Status:** Ground-Truth Verified (Read-Only)  
> **Security Protocol:** NO credential or secret values are disclosed in this document. All entries describe variable names, source code locations, purposes, and post-split requirements.

---

## 1. Existing Environment Variable Inventory

### 1.1 Backend Environment Variables (`backend/.env` & Source Code)

| Variable Name | Exact Code Usages (File:Line) | Functional Purpose | Who Needs It After Split | Required / Optional |
|---|---|---|:---:|:---:|
| `PORT` | `backend/src/config/index.ts:5` | Configures the TCP port for Express HTTP listener (`app.listen(config.port)` in `server.ts:8`). Falls back to `5000`. | **System C (Backend API)** | Optional (default: `5000`) |
| `NODE_ENV` | `backend/src/config/index.ts:6`<br>`backend/src/db/index.ts:4`<br>`backend/src/middleware/globalErrorHandler.ts:82, 85`<br>`backend/src/module/user/user.controller.ts:26, 27` | Defines runtime execution environment (`development` vs `production`). In development, enables verbose Prisma SQL query logs and exposes error stack traces. In production, sets cookie `secure: true` and `sameSite: "none"`. | **All Systems (A, B, C)** | Required |
| `DATABASE_URL` | `backend/src/config/index.ts:8`<br>`backend/prisma/schema.prisma:9` | MySQL / TiDB connection string containing database host, port, user credentials, database name, and SSL parameters. | **System C (Backend API)** | **Required** |
| `JWT_SECRET` | `backend/src/config/index.ts:11`<br>`backend/src/module/user/user.service.ts:91`<br>`backend/src/middleware/auth.ts:23` | High-entropy cryptographic symmetric secret key used by `jsonwebtoken` to sign and verify HMAC-SHA256 authentication tokens. | **System C (Backend API)** | **Required** |
| `JWT_EXPIRES_IN` | `backend/src/config/index.ts:12`<br>`backend/src/module/user/user.service.ts:93` | Configures the token lifetime and expiration span for signed user JWTs. Falls back to `"7d"`. | **System C (Backend API)** | Optional (default: `"7d"`) |
| `FRONTEND_URL` | `backend/src/config/index.ts:19`<br>`backend/src/app.ts:24` | Configures the allowed origin in Express `cors` middleware (`credentials: true`). Falls back to `http://localhost:3000`. | **System C (Backend API)** | **Required** (Should be replaced by `PUBLIC_FRONTEND_URL` & `ADMIN_FRONTEND_URL`) |
| `CLOUDINARY_CLOUD_NAME` | `backend/src/config/index.ts:15`<br>`backend/src/utils/uploadImage.ts:4` | Cloudinary account identifier for cloud media asset storage and transformations. | **System C (Backend API)** | **Required** |
| `CLOUDINARY_API_KEY` | `backend/src/config/index.ts:16`<br>`backend/src/utils/uploadImage.ts:5` | API key identifier for Cloudinary REST SDK authentication. | **System C (Backend API)** | **Required** |
| `CLOUDINARY_API_SECRET` | `backend/src/config/index.ts:17`<br>`backend/src/utils/uploadImage.ts:6` | Private API secret key for signing asset uploads and deletions in Cloudinary. | **System C (Backend API)** | **Required** |
| `ADMIN_EMAIL` | `backend/prisma/seed.ts:11` | Email address used by the database seeding script to initialize the root administrative user account. Falls back to `zibon@gmail.com`. | **System C (Seed/Ops)** | **Required in Ops** (Remove fallback) |
| `ADMIN_PASSWORD` | `backend/prisma/seed.ts:12` | Plaintext initial password hashed with bcrypt (12 rounds) during database seeding for the root admin user. | **System C (Seed/Ops)** | **Required in Ops** (Remove fallback) |

---

### 1.2 Frontend Environment Variables (`frontend/.env.local` & Source Code)

| Variable Name | Exact Code Usages (File:Line) | Functional Purpose | Who Needs It After Split | Required / Optional |
|---|---|---|:---:|:---:|
| `NEXT_PUBLIC_API_URL` | `frontend/src/lib/api.ts:8`<br>`frontend/src/app/(homepage)/page.tsx:11`<br>`frontend/src/app/(public)/about/page.tsx:9, 23`<br>`frontend/src/app/(public)/category/[slug]/page.tsx:12`<br>`frontend/src/app/(public)/tag/[slug]/page.tsx:12`<br>`frontend/src/app/(public)/[year]/[month]/[day]/[slug]/page.tsx:17, 36` | Base URL used by browser-side Axios and server-side Next.js `fetch` to connect to the backend REST API (`/api/v1`). Falls back to `http://localhost:5000/api/v1`. | **System A (Public)**<br>**System B (Admin)** | **Required** |

---

## 2. New Environment Variables Required After Split

To resolve current hardcoded URLs and support multi-origin decoupled deployments, the following new environment variables must be introduced:

| System | New Variable Name | Purpose & Justification |
|---|---|---|
| **System A (Public Frontend)** | `NEXT_PUBLIC_SITE_URL` | Canonical public website base URL (e.g. `https://zibonvlog.com`). Replaces hardcoded `const baseUrl = "http://localhost:3000"` in `frontend/src/app/sitemap.ts:4` and `robots.ts:3`. |
| **System A (Public Frontend)** | `INTERNAL_API_URL` | Private network address (e.g. `http://backend:5000/api/v1`) for Next.js SSR server-side `fetch` calls, reducing latency and avoiding public roundtrips. Replaces hardcoded `http://localhost:5000/api/v1` in `sitemap.ts:14`. |
| **System A (Public Frontend)** | `NEXT_PUBLIC_ADMIN_URL` | Public URL for the standalone Admin Panel (e.g. `https://admin.zibonvlog.com`). Replaces relative `/login` in `frontend/src/components/public/Footer.tsx:55`. |
| **System B (Admin Management)** | `NEXT_PUBLIC_SITE_URL` | Canonical reader website URL (e.g. `https://zibonvlog.com`). Used by post editor and post list tables to render "View Live Article" links. |
| **System C (Backend API)** | `PUBLIC_FRONTEND_URL` | Allowed origin for reader site in multi-origin CORS configuration (`https://zibonvlog.com`). |
| **System C (Backend API)** | `ADMIN_FRONTEND_URL` | Allowed origin for CMS management portal in multi-origin CORS configuration (`https://admin.zibonvlog.com`). |
| **System C (Backend API)** | `COOKIE_DOMAIN` | Top-level cookie domain (e.g. `.zibonvlog.com`) enabling cross-subdomain authentication cookie sharing between API and Admin Portal if unified cookies are retained. |

---

## 3. Environment Variable Distribution Matrix (Post-Split)

```
┌──────────────────────────────────────────────┐
│ SYSTEM A: Public Reader Frontend             │
├──────────────────────────────────────────────┤
│ - NODE_ENV                                   │
│ - NEXT_PUBLIC_SITE_URL                       │
│ - NEXT_PUBLIC_API_URL                        │
│ - INTERNAL_API_URL                           │
│ - NEXT_PUBLIC_ADMIN_URL                      │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ SYSTEM B: Admin Management Portal            │
├──────────────────────────────────────────────┤
│ - NODE_ENV                                   │
│ - NEXT_PUBLIC_API_URL                        │
│ - NEXT_PUBLIC_SITE_URL                       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ SYSTEM C: Backend REST API                   │
├──────────────────────────────────────────────┤
│ - PORT                                       │
│ - NODE_ENV                                   │
│ - DATABASE_URL                               │
│ - JWT_SECRET                                 │
│ - JWT_EXPIRES_IN                             │
│ - PUBLIC_FRONTEND_URL                        │
│ - ADMIN_FRONTEND_URL                         │
│ - COOKIE_DOMAIN                              │
│ - CLOUDINARY_CLOUD_NAME                      │
│ - CLOUDINARY_API_KEY                         │
│ - CLOUDINARY_API_SECRET                      │
│ - ADMIN_EMAIL (Ops/Seed only)                │
│ - ADMIN_PASSWORD (Ops/Seed only)             │
└──────────────────────────────────────────────┘
```

