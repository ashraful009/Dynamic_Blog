# Architecture Coupling Analysis & Decoupling Split Plan (Phase 7 Audit)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Status:** Ground-Truth Verified Plan (Read-Only)  
> **Objective:** Comprehensive migration plan to cleanly separate the current monolithic Next.js + Express repository into three isolated, zero-leak systems:
> 1. **System A — Public Frontend:** Visitor & reader portal (pure editorial, zero admin UI, zero admin routes, zero admin secrets).
> 2. **System B — Admin Management Portal:** Author & management application (isolated CMS dashboard, rich editor, media uploader, configuration panels).
> 3. **System C — Backend API:** Hardened Express + Prisma REST server with complete Role-Based Access Control (RBAC).

---

## 1. Current Monolithic Coupling Audit

Today, the repository at `d:\Zibon-Vlog` combines both the public visitor experience and the administrative CMS inside a single Next.js App Router application (`frontend/src/app`). This creates critical security, operational, and performance liabilities:

```
CURRENT ARCHITECTURE (UNPROTECTED & COUPLED):
┌─────────────────────────────────────────────────────────────────────────────┐
│ frontend/src/app (Single Next.js 16.2.10 App Router Instance)                │
│                                                                             │
│  Public Reader Experience:                  Administrative CMS Experience:  │
│  - / (Homepage SSR)                         - /zibon (Redirect)             │
│  - /about (About Author SSR)                - /zibon/dashboard              │
│  - /category/[slug] (Category SSR)          - /zibon/homepage               │
│  - /tag/[slug] (Tag Archive SSR)            - /zibon/posts                  │
│  - /[year]/[month]/[day]/[slug] (Post SSR)  - /zibon/posts/new (TipTap)     │
│  - /login & /register (Auth CSR)            - /zibon/posts/[id]/edit        │
│                                             - /zibon/categories & /tags     │
│                                             - /zibon/subscribers & /media   │
│                                             - /zibon/about & /settings      │
│                                                                             │
│  SHARED INFRASTRUCTURE:                                                     │
│  - RootLayout (`app/layout.tsx`) mounts Public Header globally              │
│  - TipTap Editor bundle (30+ packages) shipped in same client bundle tree   │
│  - `authStore.ts` stores user role in unverified browser localStorage       │
│  - `api.ts` single Axios client shared between CSR & Public Header          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP Requests (withCredentials: true)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ backend/ (Express + Prisma 6.19.3 API)                                      │
│  - Single CORS origin (`FRONTEND_URL`)                                       │
│  - Missing RBAC: 18 privileged admin endpoints lack `authorize("ADMIN")`    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Inventory of Shared Assets & Coupling Points

### 2.1 Shared UI & Structural Components
| Component | Location | Currently Used By | Target Destination | Reasoning & Risk |
|---|---|---|---|---|
| `RootLayout` | `frontend/src/app/layout.tsx` | ALL public pages & ALL `/zibon/*` admin pages | Fork / Separate | **Critical Risk:** Currently mounts public `<Header />` globally on all pages. Admin pages have to manually hide or coexist with it. System A gets reader layout; System B gets dashboard shell layout. |
| `Header` | `frontend/src/components/public/Header.tsx` | `RootLayout` (`app/layout.tsx:34`) | System A Only | **High Leak Risk:** Lines 77 & 124 explicitly check `user?.role === "ADMIN"` and render direct navigational links to `/zibon/dashboard` ("Dashboard"). Must be completely removed from public bundle. |
| `Footer` | `frontend/src/components/public/Footer.tsx` | `(public)/layout.tsx:11` | System A Only | **Information Disclosure:** Contains a footer link to the login portal ("Admin Portal" / `/login`). Public reader footer should not broadcast admin login paths. |
| `Providers` | `frontend/src/components/providers/Providers.tsx` | `app/layout.tsx:32` | Both (Duplicated) | Wraps application in TanStack `QueryClientProvider` and `Toaster`. Standard boilerplate needed by both apps independently. |
| `AuthWrapper`, `Input`, `Button` | `frontend/src/components/ui/*` | `/login`, `/register` | System B (or Duplicated if reader auth kept) | Lightweight form primitives. If visitor registration is deprecated, move exclusively to System B. |
| `TipTap Editor Suite` | `frontend/src/components/editor/*` (8 files) | `/zibon/posts/new`, `/posts/[id]/edit`, `/zibon/about` | System B Only | **Heavy Performance Weight:** 11 `@tiptap/*` packages totaling hundreds of kilobytes. Must never be imported or bundled in System A. |

### 2.2 Shared State & Utilities
| File / Module | Location | Currently Used By | Target Destination | Reasoning & Risk |
|---|---|---|---|---|
| `authStore.ts` | `frontend/src/store/authStore.ts` | `Header.tsx`, `login/page.tsx`, `register/page.tsx`, `settings/page.tsx`, `AuthGuard.tsx` | System B Only (or Specialized) | **Critical Security Flaw:** Stores unverified `{ role: "ADMIN" }` in plaintext `localStorage.getItem("auth_user")`. System A has no need for admin state. System B should use server-verified session checks or secure token memory state. |
| `api.ts` | `frontend/src/lib/api.ts` | Public header, sidebar, comments section + all 11 admin pages | Split into two clients | **Coupling Hazard:** Single Axios client configures `withCredentials: true`, redirects to `/login` on 401 (`api.ts:26`), and exports all 34 client methods. System A only requires comment & subscriber mutation endpoints. |
| `postUrl.ts` | `frontend/src/utils/postUrl.ts` | `PostFeed.tsx`, `Sidebar.tsx`, `posts/page.tsx` | Shared / Duplicated | Generates canonical slug URL `/${year}/${month}/${day}/${slug}`. Needed by System A for navigation, and by System B to link "View Live Post". |
| `globals.css` | `frontend/src/app/globals.css` | Global styling, typography, Tailwind v4 tokens | Split / Tailored | Both require Tailwind and Datum font families, but System B requires TipTap prose styling, whereas System A requires reader-specific layout tokens. |

---

## 3. Detailed File-by-File Destination Matrix

```
LEGEND:
[A] -> Moves to System A (Public Reader Frontend)
[B] -> Moves to System B (Admin Management Portal)
[C] -> Stays / Hardened in System C (Backend REST API)
[SHARED] -> Duplicated or maintained in shared internal package
[DELETE] -> Dead code / removed entirely
```

### 3.1 Frontend App Router Pages & Layouts (`frontend/src/app/`)
| File Path | Target | Migration Action & Reason |
|---|:---:|---|
| `app/layout.tsx` | **[A] / [B] Fork** | System A keeps font imports, metadata, and reader layout. System B creates an isolated admin root layout without public header. |
| `app/globals.css` | **[SHARED]** | Keep core theme variables in both projects. |
| `app/favicon.ico` | **[SHARED]** | Static brand asset. |
| `app/robots.ts` | **[A]** | Reader SEO definition; remove hardcoded `localhost:3000`. System B sets global `X-Robots-Tag: noindex, nofollow`. |
| `app/sitemap.ts` | **[A]** | Reader dynamic sitemap generator; replace hardcoded `localhost:5000` with runtime env var. |
| `app/(homepage)/layout.tsx` | **[A]** | Reader homepage layout wrapper. |
| `app/(homepage)/page.tsx` | **[A]** | Public SSR homepage (`force-dynamic`). |
| `app/(public)/layout.tsx` | **[A]** | Reader layout mounting footer. |
| `app/(public)/about/page.tsx` | **[A]** | Public author biography page SSR. |
| `app/(public)/category/[slug]/page.tsx` | **[A]** | Public category archive feed SSR. |
| `app/(public)/tag/[slug]/page.tsx` | **[A]** | Public tag archive feed SSR. |
| `app/(public)/[year]/[month]/[day]/[slug]/page.tsx` | **[A]** | Public blog article reader SSR + CSR comments. |
| `app/(public)/login/page.tsx` | **[B]** | Admin login portal. Move to System B root `/login` or `/`. |
| `app/(public)/register/page.tsx` | **[DELETE] / [B]** | Public registration currently only allows attackers to register `USER` accounts that exploit missing backend RBAC. Remove from public site entirely. |
| `app/zibon/page.tsx` | **[B]** | Root redirect `/` -> `/dashboard` in System B. |
| `app/zibon/layout.tsx` | **[B]** | Base admin metadata (`noindex, nofollow`). |
| `app/zibon/(dashboard)/layout.tsx` | **[B]** | Admin dashboard layout with `<AdminSidebar>` and authentication guard. |
| `app/zibon/(dashboard)/dashboard/page.tsx` | **[B]** | Analytics dashboard. Fix metric calculation bug (compute across all posts, not 5-item slice). |
| `app/zibon/(dashboard)/homepage/page.tsx` | **[B]** | CMS homepage & layout editor. |
| `app/zibon/(dashboard)/posts/page.tsx` | **[B]** | Post catalog & filter table. |
| `app/zibon/(dashboard)/posts/new/page.tsx` | **[B]** | TipTap post creation editor. |
| `app/zibon/(dashboard)/posts/[id]/edit/page.tsx` | **[B]** | TipTap post update editor. |
| `app/zibon/(dashboard)/categories/page.tsx` | **[B]** | Category tree management. |
| `app/zibon/(dashboard)/tags/page.tsx` | **[B]** | Tag CRUD management. |
| `app/zibon/(dashboard)/subscribers/page.tsx` | **[B]** | Newsletter subscriber list & deletion. |
| `app/zibon/(dashboard)/media/page.tsx` | **[B]** | Cloudinary media assets manager. |
| `app/zibon/(dashboard)/about/page.tsx` | **[B]** | Author bio & skills editor. |
| `app/zibon/(dashboard)/settings/page.tsx` | **[B]** | Admin profile updater. |

### 3.2 Frontend Components (`frontend/src/components/`)
| Component Folder / File | Target | Migration Action & Reason |
|---|:---:|---|
| `components/editor/*` (all 8 files) | **[B]** | TipTap WYSIWYG editor and custom video/image nodes belong exclusively in Admin. |
| `components/providers/Providers.tsx` | **[SHARED]** | QueryClientProvider duplicated in both A and B. |
| `components/public/*` (all 16 files) | **[A]** | All reader components (`Header`, `Sidebar`, `PostFeed`, `CommentsSection`, `Datum*`) belong exclusively in Public Frontend. |
| `components/ui/AuthWrapper.tsx` | **[B]** | Move to Admin for login screen. |
| `components/ui/Button.tsx`, `Input.tsx` | **[SHARED]** | General form UI atoms. |
| `components/zibon/*` (all 17 files) | **[B]** | All admin dashboard tables, forms, editors, and sidebar belong exclusively in Admin. |

### 3.3 Backend API Server (`backend/src/`)
| Module / File | Target | Migration Action & Reason |
|---|:---:|---|
| `backend/src/app.ts` | **[C]** | Update CORS to support multiple origins (`PUBLIC_FRONTEND_URL` and `ADMIN_FRONTEND_URL`). |
| `backend/src/middleware/auth.ts` | **[C]** | Add support for `Authorization: Bearer <token>` in addition to cookie for cross-domain flexibility. |
| `backend/src/middleware/auth.ts` (`authorize`) | **[C]** | **CRITICAL REQUIREMENT:** Apply `authorize("ADMIN")` to all 18 un-guarded admin endpoints. |
| `backend/src/module/about/about.route.ts` | **[C]** | Already enforced `authorize("ADMIN")` on `PUT /api/v1/about`. Add missing Zod validation schema. |
| `backend/src/module/post/post.service.ts` | **[C]** | Update post creation to use `slugify(data.title)` instead of random hex. Add role check to permit Admins to edit/delete any author's post. |
| `backend/src/module/media/media.service.ts` | **[C]** | Add `await fs.promises.unlink(file.path)` to delete temporary files from `backend/tmp/` after upload. |

---

## 4. API Separation: Public Needs vs. Admin-Only

### 4.1 APIs Truly Needed by Public Reader Site (System A)
System A only makes requests for published editorial content and public engagement:

| Method | Route | Reason & Caller | Calling Mechanism |
|---|---|---|---|
| `GET` | `/api/v1/homepage` | Loads aggregated settings, hero, featured post, recent posts, categories, and tags in one SSR roundtrip. | SSR `fetch` (`cache: "no-store"`) in `(homepage)/page.tsx:12`, `category/[slug]/page.tsx:16`, `tag/[slug]/page.tsx:16`, `[year]/[month]/[day]/[slug]/page.tsx:37` |
| `GET` | `/api/v1/posts` | Paginated post archives filtered by `categorySlug` or `tagSlug`. | SSR `fetch` in `category/[slug]/page.tsx:17` and `tag/[slug]/page.tsx:17` |
| `GET` | `/api/v1/posts/:slug` | Reads individual post content for article viewer. | SSR `fetch` in `[year]/[month]/[day]/[slug]/page.tsx:18` |
| `GET` | `/api/v1/posts?limit=1000` | Sitemaps post index. | SSR `fetch` in `sitemap.ts:14` |
| `GET` | `/api/v1/about` | Reads author biography and skill list. | SSR `fetch` in `about/page.tsx:9` |
| `GET` | `/api/v1/site-settings` | Reads header brand and footer links. | SSR `fetch` in `about/page.tsx:23` and CSR TanStack in `Header.tsx:28` |
| `GET` | `/api/v1/categories` | Navigation menu category list. | CSR TanStack in `Header.tsx:23` |
| `GET` | `/api/v1/posts/:id/comments` | Reader comments feed. | Client Axios in `CommentsSection.tsx:28` |
| `POST` | `/api/v1/posts/:id/comments` | Reader submits comment. | Client Axios in `CommentForm.tsx:32` |
| `POST` | `/api/v1/subscribers` | Reader newsletter signup. | Client Axios in `DatumNewsletter.tsx:12` and `Sidebar.tsx:41` |

### 4.2 APIs Exclusively Reserved for Admin Portal (System B)
Every other endpoint must be locked down behind `auth` + `authorize("ADMIN")` and requested only by System B:

| Category | Admin-Only Endpoints |
|---|---|
| **Authentication** | `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/users/profile`, `PATCH /api/v1/users/profile` |
| **Post Management** | `GET /api/v1/posts/admin/list`, `GET /api/v1/posts/admin/:id`, `POST /api/v1/posts`, `PATCH /api/v1/posts/:id`, `DELETE /api/v1/posts/:id` |
| **Category Management** | `POST /api/v1/categories`, `PATCH /api/v1/categories/:id`, `DELETE /api/v1/categories/:id` |
| **Tag Management** | `POST /api/v1/tags`, `PATCH /api/v1/tags/:id`, `DELETE /api/v1/tags/:id` |
| **Media Library** | `POST /api/v1/media/upload`, `GET /api/v1/media`, `DELETE /api/v1/media/:id`, `PATCH /api/v1/media/:id/link` |
| **Site Settings** | `PATCH /api/v1/site-settings` |
| **Subscribers** | `GET /api/v1/subscribers`, `DELETE /api/v1/subscribers/:id` |
| **About Page** | `PUT /api/v1/about` |

---

## 5. Cross-Origin Architecture & Authentication Strategy

When System A (Public: `https://zibonvlog.com`), System B (Admin: `https://admin.zibonvlog.com`), and System C (API: `https://api.zibonvlog.com`) reside on different hostnames or ports, the current cookie and CORS configurations will fail unless restructured:

### 5.1 Multi-Origin CORS Configuration (`backend/src/app.ts`)
Currently, `app.ts:24` configures a single origin string: `origin: config.frontendUrl`. In a split deployment, Express CORS must accept an array or dynamic origin validator:

```ts
// Hardened Cross-Origin CORS Handler
const allowedOrigins = [
  process.env.PUBLIC_FRONTEND_URL, // e.g. https://zibonvlog.com
  process.env.ADMIN_FRONTEND_URL,  // e.g. https://admin.zibonvlog.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-side fetch, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### 5.2 Cookie Transport vs. Bearer Token Architecture
| Concern | Cookie-Based Auth (`HttpOnly`) | Dual Mode: Cookie + `Authorization: Bearer` (Recommended) |
|---|---|---|
| **Configuration** | Needs `sameSite: "none"`, `secure: true`, and `domain: ".zibonvlog.com"` | Cookie remains supported for browser sessions; Admin app stores JWT in memory / closure and attaches `Authorization: Bearer <token>`. |
| **Third-Party Cookie Blocking** | Modern Safari, Brave, and Chrome Incognito block third-party cookies if Admin and API are on different apex domains (`admin-zibon.vercel.app` vs `zibon-api.onrender.com`). | Immune to third-party cookie blocking because Bearer headers are transmitted directly via HTTP headers. |
| **CSRF Vulnerability** | High risk if `SameSite=None` without Anti-CSRF tokens. | Zero CSRF risk with Bearer tokens because browser does not attach them automatically. |
| **Implementation Plan** | Update `backend/src/middleware/auth.ts:19` to check `const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/, "");`. |

---

## 6. Everything That Will Break on Split (Failure Modes & Fixes)

| # | Item / Code Location | Current Implementation | Failure Mode on Split | Required Fix & Risk Rating |
|---|---|---|---|---|
| **1** | `frontend/src/app/sitemap.ts:14` | `fetch("http://localhost:5000/api/v1/posts?limit=1000")` | Hardcoded `localhost:5000` will crash in production container or production deploy. | Replace with `${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL}/posts?limit=1000`. **Risk: High (SEO crash)** |
| **2** | `frontend/src/app/sitemap.ts:4` | `const baseUrl = "http://localhost:3000";` | Emits `localhost:3000` URLs in production XML sitemap. | Replace with `process.env.NEXT_PUBLIC_SITE_URL`. **Risk: Medium** |
| **3** | `frontend/src/app/robots.ts:3` | `const baseUrl = "http://localhost:3000";` | Emits `localhost:3000` sitemap link in robots.txt. | Replace with `process.env.NEXT_PUBLIC_SITE_URL`. **Risk: Medium** |
| **4** | `frontend/src/components/public/Header.tsx:77` | `<Link href={user?.role === "ADMIN" ? "/zibon/dashboard" : "/"} ...>` | In System A, `/zibon/dashboard` will not exist, resulting in a 404 error. | Remove the admin role check and dashboard button entirely from System A. **Risk: High (Broken Nav)** |
| **5** | `frontend/src/components/public/Footer.tsx:55` | `<Link href="/login" ...>Admin Portal</Link>` | In System A, `/login` will not exist if moved to System B. | Point to `process.env.NEXT_PUBLIC_ADMIN_URL` or remove link entirely. **Risk: Low** |
| **6** | `frontend/src/lib/api.ts:25-27` | `if (window.location.pathname.startsWith("/zibon")) window.location.href = "/login";` | In System B where routes are top-level (`/dashboard`, `/posts`), the `/zibon` path prefix check will fail to redirect unauthenticated users to `/login`. | Update interceptor in System B to redirect to `/login` for all 401s. **Risk: High** |
| **7** | `frontend/src/app/zibon/page.tsx:3` | `redirect("/zibon/dashboard")` | Deep nested paths `/zibon/*` will become obsolete in standalone System B. | Flatten System B route tree so dashboard is at `/dashboard` or `/`. **Risk: Medium** |
| **8** | Server-Side Fetch vs. Client Axios | SSR pages use `cache: "no-store"` with relative or env URL; CSR uses `api.ts`. | If environment variable is missing in SSR container, `fetch` throws `TypeError: Failed to parse URL`. | Ensure `NEXT_PUBLIC_API_URL` is set at build time and runtime for both server and client containers. **Risk: High** |
| **9** | Unlinked Media Storage Leak | `backend/src/module/media/media.route.ts:11` uploads to `backend/tmp/`. | As upload volume increases in System B, backend disk space exhausts because `media.service.ts` never unlinks temp files. | Add `fs.promises.unlink(file.path)` in `media.service.ts` immediately after Cloudinary upload. **Risk: High (Server Disk Exhaustion)** |

