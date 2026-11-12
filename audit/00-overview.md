# Project Technical Audit: Overview & Architecture

> **Audit Phase:** Phase 1 — Project Overview  
> **Repository:** `d:\Zibon-Vlog`  
> **Audit Status:** Verified against source code files (Read-Only)  
> **Date:** 2026-11-12  

---

## 1. Executive Summary & Refactoring Goal

The **Zibon-Vlog** platform is a full-stack personal blogging and Content Management System (CMS) built for Dr. Ferdaus Anam Jibon. The system currently houses both public reader-facing pages and administrative content management panels within a single repository containing two independent sub-projects:
- `backend/`: Express.js + Prisma ORM REST API server.
- `frontend/`: Next.js App Router (React 19) full-stack client application.

### Planned Target Architecture
The upcoming refactor aims to separate this system into three decoupled units:
1. **(A) Public Frontend:** Standalone web application for visitors and readers with zero admin code, zero admin routes, and zero administrative dependencies.
2. **(B) Admin Panel:** Standalone application (isolated web application or separate portal) exclusively for authenticated administrators.
3. **(C) Main Backend Server:** Standalone Express/Prisma API serving both client applications independently with strict role-based access control (RBAC).

---

## 2. Monorepo vs. Single App Organization

The project is structured as a **multi-folder repository (polyrepo pattern in a single git tree)** without a root package manager or workspace manager (no Turborepo, no Lerna, no npm/pnpm workspaces configured at root):

- **Root Directory (`d:\Zibon-Vlog`):**
  - Contains `.gitignore` (`.gitignore:1-5`) and `README.md` (`README.md:1-600`).
  - Contains no root `package.json`, no root build scripts, and no shared type packages.
- **Client Application (`d:\Zibon-Vlog\frontend`):**
  - Independent Next.js project with its own `package.json` (`frontend/package.json:1-44`), `tsconfig.json` (`frontend/tsconfig.json:1-34`), and `node_modules/`.
  - Implements both public visitor pages (`/`, `/[year]/[month]/[day]/[slug]`, `/category/[slug]`, `/tag/[slug]`, `/about`) and administrative dashboard pages (`/zibon/*`) inside the same Next.js App Router instance (`frontend/src/app`).
- **Server Application (`d:\Zibon-Vlog\backend`):**
  - Independent Node.js/Express project with its own `package.json` (`backend/package.json:1-52`), `tsconfig.json` (`backend/tsconfig.json:1-27`), `prisma/` schema/migrations, and `node_modules/`.
  - Exposes REST API endpoints mounted under `/api/v1/` (`backend/src/app.ts:55-66`).

---

## 3. Technology Stack & Exact Dependency Versions

### 3.1 Backend Stack (`backend/package.json`)

| Layer / Concern | Technology | Declared Version | Resolved / Lockfile Version | Source Verification |
|---|---|---|---|---|
| **Runtime & Language** | Node.js + TypeScript | `^5.9.3` | `5.9.3` | `backend/package.json:44` |
| **Server Framework** | Express.js | `^4.21.2` | `4.22.2` | `backend/package.json:26`, `backend/package-lock.json` |
| **Database** | MySQL (TiDB Cloud compatible) | MySQL 8.x protocol | TiDB Cloud Serverless | `backend/prisma/schema.prisma:8-9` |
| **ORM / Query Engine** | Prisma ORM | `^6.19.3` (CLI) / `^6.9.0` (Client) | `6.19.3` (CLI) / `6.19.3` (Client) | `backend/package.json:19, 43`, `backend/package-lock.json` |
| **Authentication & Tokens** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.2` | `9.0.2` | `backend/package.json:31` |
| **Password Hashing** | `bcrypt` | `^5.1.1` | `5.1.1` | `backend/package.json:20` |
| **Validation Library** | `zod` | `^3.24.2` | `3.24.2` | `backend/package.json:33` |
| **HTTP Security Headers** | `helmet` | `^8.0.0` | `8.0.0` | `backend/package.json:28` |
| **Rate Limiting** | `express-rate-limit` | `^7.5.0` | `7.5.0` | `backend/package.json:27` |
| **CORS Middleware** | `cors` | `^2.8.5` | `2.8.5` | `backend/package.json:23` |
| **Cookie Parsing** | `cookie-parser` | `^1.4.7` | `1.4.7` | `backend/package.json:22` |
| **HTML Sanitization** | `dompurify` + `isomorphic-dompurify` + `jsdom` | `^3.2.4` / `^3.19.0` / `^26.0.0` | `3.2.4` / `3.19.0` / `26.0.0` | `backend/package.json:24, 29, 30` |
| **File / Media Ingestion** | `multer` (disk storage) | `^1.4.5-lts.1` | `1.4.5-lts.1` | `backend/package.json:32` |
| **Cloud Media SDK** | Cloudinary v2 SDK (`cloudinary`) | `^2.5.1` | `2.5.1` | `backend/package.json:21` |
| **Dev Server / Reload** | `ts-node-dev` | `^2.0.0` | `2.0.0` | `backend/package.json:47` |
| **Compiler / Build Tool** | `tsc` (TypeScript Compiler) | `^5.9.3` | `5.9.3` | `backend/package.json:8, 44` |

### 3.2 Frontend Stack (`frontend/package.json`)

| Layer / Concern | Technology | Declared Version | Resolved / Lockfile Version | Source Verification |
|---|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.2.10` | `16.2.10` | `frontend/package.json:27` |
| **UI Library** | React & React DOM | `19.2.4` | `19.2.4` | `frontend/package.json:28-29` |
| **Language** | TypeScript | `^5` | `5.x` | `frontend/package.json:42` |
| **CSS / Styling** | Tailwind CSS v4 + `@tailwindcss/postcss` | `^4` | `4.x` | `frontend/package.json:35, 41` |
| **Server State Management** | TanStack React Query (`@tanstack/react-query`) | `^5.101.2` | `5.101.2` | `frontend/package.json:12` |
| **Client State Management** | Zustand | `^5.0.14` | `5.0.14` | `frontend/package.json:32` |
| **HTTP Client** | Axios | `^1.18.1` | `1.18.1` | `frontend/package.json:24` |
| **Rich Text WYSIWYG** | Tiptap Editor v3 suite (`@tiptap/*`) | `^3.27.3` | `3.27.3` | `frontend/package.json:13-23` |
| **Iconography** | `lucide-react` + `react-icons` | `^1.23.0` / `^5.7.0` | `1.23.0` / `5.7.0` | `frontend/package.json:26, 31` |
| **Notifications** | `react-hot-toast` | `^2.6.0` | `2.6.0` | `frontend/package.json:30` |
| **Date Utilities** | `date-fns` | `^4.4.0` | `4.4.0` | `frontend/package.json:25` |
| **Linter** | ESLint 9 (`eslint`, `eslint-config-next`) | `^9` / `16.2.10` | `9.x` / `16.2.10` | `frontend/package.json:39, 40` |

---

## 4. Entry Points, Boot Sequence & Lifecycle Scripts

### 4.1 Backend Execution & Boot Flow
1. **Entry Point:** `backend/src/server.ts:4-36`
   - Invokes `bootstrap()` (`backend/src/server.ts:4`).
   - Connects to database via Prisma client: `await prisma.$connect()` (`backend/src/server.ts:6`).
   - Starts HTTP listener on `config.port` (default 5000): `app.listen(config.port, ...)` (`backend/src/server.ts:8`).
   - Sets up global process event listeners for `unhandledRejection` (`backend/src/server.ts:23-26`), `uncaughtException` (`backend/src/server.ts:27-30`), and graceful shutdown on `SIGTERM` (`backend/src/server.ts:31-35`).
2. **Express App Initialization:** `backend/src/app.ts:19-88`
   - Instantiates Express application (`backend/src/app.ts:19`).
   - Applies core security & parsing middleware:
     - `helmet()` (`backend/src/app.ts:20`)
     - `cookieParser()` (`backend/src/app.ts:21`)
     - `cors({ origin: config.frontendUrl, credentials: true })` (`backend/src/app.ts:22-29`)
     - Global rate limiter (500 req/15min) on `/api/v1/` (`backend/src/app.ts:30-41`)
     - Auth rate limiter (50 req/15min) on `/api/v1/auth` (`backend/src/app.ts:42-52`)
     - `express.json({ limit: "10mb" })` (`backend/src/app.ts:53`)
     - `express.urlencoded({ extended: true, limit: "10mb" })` (`backend/src/app.ts:54`)
   - Mounts routes (`backend/src/app.ts:55-65`):
     - `/api/v1/auth` -> `authRoutes`
     - `/api/v1/users` -> `userRoutes`
     - `/api/v1/posts` -> `commentRoutes` AND `postRoutes`
     - `/api/v1/media` -> `mediaRoutes`
     - `/api/v1/site-settings` -> `siteSettingsRoutes`
     - `/api/v1/categories` -> `categoryRoutes`
     - `/api/v1/tags` -> `tagRoutes`
     - `/api/v1/subscribers` -> `subscriberRoutes`
     - `/api/v1/homepage` -> `homepageRoutes`
     - `/api/v1/about` -> `aboutRoutes`
     - `/api/v1/health` -> Health probe
   - Registers 404 handler (`backend/src/app.ts:80-86`) and `globalErrorHandler` (`backend/src/app.ts:87`).
3. **Backend Lifecycle Scripts (`backend/package.json:6-14`):**
   - `npm run dev`: `ts-node-dev --respawn --transpile-only src/server.ts`
   - `npm run build`: `tsc`
   - `npm start`: `node dist/server.js`
   - `npm run prisma:generate`: `prisma generate`
   - `npm run prisma:push`: `prisma db push`
   - `npm run prisma:migrate`: `prisma migrate dev`
   - `npm run prisma:studio`: `prisma studio`
   - `prisma.seed`: `ts-node prisma/seed.ts` (`backend/package.json:49-51`)

### 4.2 Frontend Execution & Boot Flow
1. **Entry Point:** Next.js App Router root layout `frontend/src/app/layout.tsx:1-45`
   - Injects global stylesheet `globals.css` (`frontend/src/app/layout.tsx:2`).
   - Wraps entire tree in client-side `<Providers>` (`frontend/src/app/layout.tsx:39-41`), which sets up TanStack Query Client (`frontend/src/components/providers/Providers.tsx:11-20`) and `Toaster` notifications (`frontend/src/components/providers/Providers.tsx:22`).
   - Loads global Google Fonts (Playfair Display, EB Garamond, Inter, Fira Code, Hind Siliguri, Noto Serif Bengali) via Next.js Font Optimization (`frontend/src/app/layout.tsx:6-34`).
2. **Routing Structure (`frontend/src/app/`):**
   - `(homepage)/`: Route group for the root landing page (`/`), with dedicated layout.
   - `(public)/`: Route group for public blog pages (`/about`, `/category/[slug]`, `/tag/[slug]`, `/[year]/[month]/[day]/[slug]`, `/login`, `/register`).
   - `zibon/`: Administrative dashboard root (`/zibon`), nested under `(dashboard)/` group protected by `<AuthGuard>`.
3. **Frontend Lifecycle Scripts (`frontend/package.json:5-10`):**
   - `npm run dev`: `next dev`
   - `npm run build`: `next build`
   - `npm start`: `next start`
   - `npm run lint`: `eslint`

---

## 5. Deployment, Docker, and CI/CD Inventory

- **Docker Status:** **NONE FOUND**. No `Dockerfile`, no `docker-compose.yml`, and no containerization configuration exist in the repository.
- **CI/CD Pipelines:** **NONE FOUND**. No `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml`, or Bitbucket pipelines exist.
- **Deployment Platform Configuration:**
  - Vercel is referenced in `README.md:88, 162` as the intended host for the frontend, but no `vercel.json` config file exists.
  - Render / VPS is referenced in `README.md:88` as the intended host for the backend, but no `render.yaml` or Procfile exists.
  - Static configuration: `frontend/next.config.ts:16-44` specifies explicit HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Content-Security-Policy`).

---

## 6. Full Source Tree (Excluding `node_modules`, `.git`, build output, and `.next`)

```
d:\Zibon-Vlog
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20260709034401_init/
│   │       │   └── migration.sql
│   │       └── 20260709035849_change_default_role/
│   │           └── migration.sql
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   └── index.ts
│   │   ├── db/
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── module/
│   │   │   ├── about/
│   │   │   │   ├── about.controller.ts
│   │   │   │   ├── about.route.ts
│   │   │   │   └── about.service.ts
│   │   │   ├── category/
│   │   │   │   ├── category.controller.ts
│   │   │   │   ├── category.route.ts
│   │   │   │   ├── category.service.ts
│   │   │   │   └── category.validation.ts
│   │   │   ├── comment/
│   │   │   │   ├── comment.controller.ts
│   │   │   │   ├── comment.route.ts
│   │   │   │   ├── comment.service.ts
│   │   │   │   └── comment.validation.ts
│   │   │   ├── homepage/
│   │   │   │   ├── homepage.controller.ts
│   │   │   │   ├── homepage.route.ts
│   │   │   │   └── homepage.service.ts
│   │   │   ├── media/
│   │   │   │   ├── media.controller.ts
│   │   │   │   ├── media.route.ts
│   │   │   │   ├── media.service.ts
│   │   │   │   └── media.validation.ts
│   │   │   ├── post/
│   │   │   │   ├── post.controller.ts
│   │   │   │   ├── post.route.ts
│   │   │   │   ├── post.service.ts
│   │   │   │   └── post.validation.ts
│   │   │   ├── site-settings/
│   │   │   │   ├── site-settings.controller.ts
│   │   │   │   ├── site-settings.route.ts
│   │   │   │   ├── site-settings.service.ts
│   │   │   │   └── site-settings.validation.ts
│   │   │   ├── subscriber/
│   │   │   │   ├── subscriber.controller.ts
│   │   │   │   ├── subscriber.route.ts
│   │   │   │   ├── subscriber.service.ts
│   │   │   │   └── subscriber.validation.ts
│   │   │   ├── tag/
│   │   │   │   ├── tag.controller.ts
│   │   │   │   ├── tag.route.ts
│   │   │   │   ├── tag.service.ts
│   │   │   │   └── tag.validation.ts
│   │   │   └── user/
│   │   │       ├── user.controller.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.service.ts
│   │   │       └── user.validation.ts
│   │   ├── response/
│   │   │   └── sendResponse.ts
│   │   └── utils/
│   │       ├── catchAsync.ts
│   │       ├── sanitize.ts
│   │       ├── slugify.ts
│   │       └── uploadImage.ts
│   └── tmp/ (14 orphaned image files lingering from uncleaned multer uploads)
│
└── frontend/
    ├── .env.local
    ├── .gitignore
    ├── AGENTS.md
    ├── eslint.config.mjs
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.mjs
    ├── README.md
    ├── tsconfig.json
    ├── tsconfig.tsbuildinfo
    ├── public/
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    └── src/
        ├── app/
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── robots.ts
        │   ├── sitemap.ts
        │   ├── (homepage)/
        │   │   ├── layout.tsx
        │   │   └── page.tsx
        │   ├── (public)/
        │   │   ├── layout.tsx
        │   │   ├── about/page.tsx
        │   │   ├── category/[slug]/page.tsx
        │   │   ├── login/page.tsx
        │   │   ├── register/page.tsx
        │   │   ├── tag/[slug]/page.tsx
        │   │   └── [year]/[month]/[day]/[slug]/page.tsx
        │   └── zibon/
        │       ├── layout.tsx
        │       ├── page.tsx
        │       └── (dashboard)/
        │           ├── layout.tsx
        │           ├── about/page.tsx
        │           ├── categories/page.tsx
        │           ├── dashboard/page.tsx
        │           ├── homepage/page.tsx
        │           ├── media/page.tsx
        │           ├── posts/
        │           │   ├── page.tsx
        │           │   ├── new/page.tsx
        │           │   └── [id]/edit/page.tsx
        │           ├── settings/page.tsx
        │           ├── subscribers/page.tsx
        │           └── tags/page.tsx
        ├── components/
        │   ├── editor/
        │   │   ├── Editor.tsx
        │   │   ├── EditorMediaModal.tsx
        │   │   ├── FontSize.ts
        │   │   ├── ResizableImageComponent.tsx
        │   │   ├── ResizableImageNode.ts
        │   │   ├── ResizableVideoComponent.tsx
        │   │   ├── ResizableVideoNode.ts
        │   │   └── Toolbar.tsx
        │   ├── providers/
        │   │   └── Providers.tsx
        │   ├── public/
        │   │   ├── ContentProtector.tsx
        │   │   ├── Footer.tsx
        │   │   ├── Header.tsx
        │   │   ├── ProseRenderer.tsx
        │   │   ├── about/
        │   │   │   └── CircularSkillBar.tsx
        │   │   ├── datum/
        │   │   │   ├── DatumFeatured.tsx
        │   │   │   ├── DatumFooter.tsx
        │   │   │   ├── DatumHero.tsx
        │   │   │   ├── DatumIndex.tsx
        │   │   │   └── DatumNewsletter.tsx
        │   │   ├── feed/
        │   │   │   └── PostFeed.tsx
        │   │   ├── post/
        │   │   │   ├── CommentForm.tsx
        │   │   │   ├── CommentsSection.tsx
        │   │   │   ├── PostFooter.tsx
        │   │   │   ├── PostHeader.tsx
        │   │   │   ├── PostProse.tsx
        │   │   │   ├── PostRail.tsx
        │   │   │   ├── PostSiteFooter.tsx
        │   │   │   └── PostSiteHeader.tsx
        │   │   └── sidebar/
        │   │       └── Sidebar.tsx
        │   ├── ui/
        │   │   ├── AuthWrapper.tsx
        │   │   ├── Button.tsx
        │   │   └── Input.tsx
        │   └── zibon/
        │       ├── AdminSidebar.tsx
        │       ├── AuthGuard.tsx
        │       ├── categories/
        │       │   ├── CategoryForm.tsx
        │       │   └── CategoryTable.tsx
        │       ├── homepage/
        │       │   ├── FeaturedPostSelector.tsx
        │       │   ├── HeaderFooterEditor.tsx
        │       │   ├── HeroEditor.tsx
        │       │   ├── HeroImageEditor.tsx
        │       │   ├── LinkListEditor.tsx
        │       │   ├── NewsletterEditor.tsx
        │       │   └── SidebarEditor.tsx
        │       ├── posts/
        │       │   ├── PostCategorySelect.tsx
        │       │   ├── PostMetaFields.tsx
        │       │   ├── PostSeoPanel.tsx
        │       │   └── PostTagSelect.tsx
        │       └── subscribers/
        │           └── SubscriberTable.tsx
        ├── lib/
        │   └── api.ts
        ├── store/
        │   └── authStore.ts
        └── utils/
            └── postUrl.ts
```

---

## 7. Verification Notes & Discrepancies Found in Phase 1

1. **Phantom Script in `README.md`:** `README.md:396` documents `backend/src/scripts/seedCloudDb.ts`. **Verified: False.** That file does NOT exist in the filesystem.
2. **Prisma Migrations Incompleteness:** The migrations folder (`backend/prisma/migrations/`) only contains migrations for `users`, `posts`, and `media` (`backend/prisma/migrations/20260709034401_init/migration.sql:1-67`). Models `Category`, `Tag`, `Comment`, `SiteSettings`, `Subscriber`, and `AboutPage` were introduced via `prisma db push` without migration tracking files.
3. **Hardcoded Fallback Credentials in Seed:** `backend/prisma/seed.ts:11-12` sets a fallback admin email and plain-text password if environment variables are not supplied.
4. **Temporary File Accumulation:** `backend/tmp/` contains 14 image files totaling several megabytes because Multer disk storage uploads (`backend/src/module/media/media.route.ts:9-18`) are uploaded to Cloudinary (`backend/src/module/media/media.service.ts:18, 21`), but local files are never removed via `fs.unlink()`.

