# Codebase Issues, Vulnerabilities & Defects Audit (Phase 8)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Status:** Ground-Truth Verified (Read-Only)  
> **Scope:** Full-codebase audit of security vulnerabilities, operational bugs, architectural flaws, dead code, dependency risks (`npm audit`), and code hygiene markers.

---

## 1. Executive Summary & Defect Ranking

| Severity | Count | Primary Impact Areas |
|---|:---:|---|
| **CRITICAL** | **3** | Missing Role-Based Access Control (RBAC) across 18 administrative API routes; Hardcoded plaintext fallback seed password; Client-side authentication bypass via unverified `localStorage`. |
| **HIGH** | **4** | Server disk leak (orphaned temporary upload files in `backend/tmp/`); Random hex slug generator ignoring post titles; Multi-author admin lockout (Admins cannot edit other authors' posts); Dependency vulnerabilities (3 Critical in backend, 1 Critical in frontend). |
| **MEDIUM** | **5** | Admin dashboard analytics calculation bug; Anonymous unmoderated comments spam vulnerability; Post view counter manipulation without deduplication; Hardcoded development localhost URLs in production sitemap and robots; Single-origin CORS configuration. |
| **LOW** | **3** | 6 dead/unused backend API routes; Missing request validation schemas on delete and link routes; Verbose error stack traces in development mode. |

---

## 2. Dependency Audit Results (`npm audit --json`)

Real `npm audit` executions were performed against both sub-projects:

### 2.1 Backend Audit Summary (`backend/package-lock.json`)
```json
{
  "totalVulnerabilities": 13,
  "breakdown": {
    "info": 0,
    "low": 0,
    "moderate": 1,
    "high": 9,
    "critical": 3
  },
  "dependenciesAudited": {
    "prod": 286,
    "dev": 48,
    "total": 343
  }
}
```
**Key Backend Advisory Highlights:**
- **CRITICAL / HIGH — `undici` (<7.30.1):** TLS certificate validation bypass (`GHSA-2m5v-pch6-74hx`), cross-origin redirect cache poisoning (`GHSA-4w7w-5xrc-9h26`), and DoS vulnerabilities.
- **HIGH — `zod` (<4.6.6):** Unbounded memory exhaustion when validating oversized collections (`GHSA-mrhx-c7xc-m3w5`).
- **HIGH — `body-parser` (<=1.20.8):** Denial of Service via trailing bytes after compressed request bodies (`GHSA-27r3-jxmh-p828`).
- **HIGH — `brace-expansion` (<1.1.20):** DoS via stack exhaustion and uncontrolled recursion (`GHSA-qhr7-859c-m2p7`).

### 2.2 Frontend Audit Summary (`frontend/package-lock.json`)
```json
{
  "totalVulnerabilities": 52,
  "breakdown": {
    "info": 0,
    "low": 0,
    "moderate": 39,
    "high": 12,
    "critical": 1
  },
  "dependenciesAudited": {
    "prod": 97,
    "dev": 364,
    "total": 509
  }
}
```
**Key Frontend Advisory Highlights:**
- **HIGH / MODERATE — `@tiptap/core` (<=3.30.4):** Prototype pollution in `mergeAttributes()` allowing arbitrary executable DOM attribute injection (`GHSA-cp6q-959q-f8rh`) and ReDoS in Markdown attribute parsing (`GHSA-j95f-988m-3j2f`).
- **HIGH — `prosemirror-view` (<1.42.3):** Cross-site scripting (XSS) vulnerability during paste handling (`GHSA-c8x8-7fp4-3x9w`).
- **HIGH — `sharp` (<=0.35.5-rc.1):** Multiple memory corruption vulnerabilities in underlying `libvips`, `libheif`, and `librsvg` libraries (`CVE-2026-33327`, `CVE-2026-96889`).
- **HIGH — `source-map-js` (>=1.0.0 <1.2.2):** Event-loop Denial of Service via indexed source-map section offsets (`GHSA-68fv-2mgg-jv7q`).

---

## 3. Comprehensive Categorized Defect Log

### 3.1 CRITICAL SEVERITY

#### Issue C1: Missing Role-Based Access Control (RBAC) on 18 Administrative Endpoints
- **File & Lines:**
  - `backend/src/middleware/auth.ts:55-67` (`authorize` middleware defined)
  - `backend/src/module/about/about.route.ts:8` (ONLY route that uses `authorize("ADMIN")`)
  - Privileged routes lacking RBAC:
    - `backend/src/module/post/post.route.ts:22` (`POST /posts` - Create post)
    - `backend/src/module/post/post.route.ts:7` (`GET /posts/admin/list`)
    - `backend/src/module/post/post.route.ts:8` (`GET /posts/admin/:id`)
    - `backend/src/module/post/post.route.ts:28` (`PATCH /posts/:id` - Edit post)
    - `backend/src/module/post/post.route.ts:34` (`DELETE /posts/:id` - Delete post)
    - `backend/src/module/category/category.route.ts:8, 14, 20` (`POST`, `PATCH`, `DELETE /categories`)
    - `backend/src/module/tag/tag.route.ts:10, 16, 22` (`POST`, `PATCH`, `DELETE /tags`)
    - `backend/src/module/media/media.route.ts:48, 54, 55, 61` (`POST /upload`, `GET`, `DELETE`, `PATCH /link`)
    - `backend/src/module/site-settings/site-settings.route.ts:8` (`PATCH /site-settings`)
    - `backend/src/module/subscriber/subscriber.route.ts:12, 13` (`GET`, `DELETE /subscribers`)
- **Vulnerability Description:** The `auth` middleware only checks that a valid JWT exists in `req.cookies.token` and that the user exists in the database (`auth.ts:30-36`). It attaches `req.user = { id, email, role }`, but never verifies that `req.user.role === "ADMIN"`.
- **Exploitation Impact:** Any public visitor who registers a standard account (which defaults to `role: "USER"`) can directly invoke administrative REST APIs to create published posts, modify site settings, delete categories/tags, upload 100MB media files to Cloudinary, and harvest the entire database of subscriber email addresses.
- **Remediation:** Apply `authorize("ADMIN")` to every administrative router handler:
  ```ts
  router.post("/", auth, authorize("ADMIN"), validateRequest(...), controllerMethod);
  ```

---

#### Issue C2: Hardcoded Plaintext Fallback Password in Database Seed Script
- **File & Lines:** `backend/prisma/seed.ts:11-12`
- **Vulnerability Description:**
  ```ts
  const adminEmail = process.env.ADMIN_EMAIL || 'zibon@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '[REDACTED_FALLBACK]';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  ```
  The database seed script embeds a default fallback password directly in the source repository.
- **Exploitation Impact:** If an operator runs `npm run prisma:push && ts-node prisma/seed.ts` without explicitly configuring `ADMIN_PASSWORD` in `.env`, the root administrative account is created with a publicly known password, allowing instant complete compromise of the blog.
- **Remediation:** Remove fallback values. Throw an explicit error during seed initialization if `ADMIN_PASSWORD` or `ADMIN_EMAIL` is not set:
  ```ts
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("CRITICAL: ADMIN_PASSWORD environment variable is required to seed the database.");
  }
  ```

---

#### Issue C3: Pure Client-Side Authentication Guard with Zero Session Verification
- **File & Lines:** `frontend/src/components/zibon/AuthGuard.tsx:1-40` & `frontend/src/store/authStore.ts:48-62`
- **Vulnerability Description:** The admin UI protection relies solely on reading `{ role: "ADMIN" }` from unencrypted browser `localStorage.getItem("auth_user")`. The frontend application never verifies session validity with the backend API on page load or initialization. `authApi.getProfile()` (`/users/profile`) is defined in `frontend/src/lib/api.ts:42` but never called in any React component or guard.
- **Exploitation Impact:** Any user can open their browser DevTools and execute:
  ```js
  localStorage.setItem("auth_user", JSON.stringify({ id: "fake", name: "Hacker", role: "ADMIN" }));
  ```
  Upon refreshing, `AuthGuard.tsx` permits complete access to the administrative UI panels.
- **Remediation:** Implement a server-side session validation check or call `/api/v1/users/profile` in `authStore.hydrate()` to verify token validity before unlocking the dashboard shell.

---

### 3.2 HIGH SEVERITY

#### Issue H1: Disk Storage Leak — Orphaned Upload Files in `backend/tmp/`
- **File & Lines:** `backend/src/module/media/media.route.ts:9-18` and `backend/src/module/media/media.service.ts:18, 21`
- **Bug Description:** Multer is configured with `diskStorage` storing uploads to `path.join(process.cwd(), "tmp")`. `MediaService.upload()` passes `file.path` to Cloudinary (`uploadImage` / `uploadVideo`), creates the database record, but **never unlinks the file from local disk**.
- **Evidence:** Inspection of `backend/tmp/` revealed **14 orphaned temporary files** dating back months:
  - `1783570503297-795147120.jpeg` (51 KB)
  - `1783879478205-734696069.png` (322 KB)
  - `1789969987815-246522445.jfif` (760 KB)
  - `1794202910588-84083411.jfif` (684 KB)
- **Impact:** Over time, production server disk space will silently exhaust, crashing the Node.js process and corrupting local services.
- **Remediation:** Add a `finally` block in `MediaService.upload` to guarantee local file removal:
  ```ts
  try {
    uploadResult = await uploadImage(file.path);
  } finally {
    await fs.promises.unlink(file.path).catch(console.error);
  }
  ```

---

#### Issue H2: Post Slug Creation Generates Random Hex Strings (Ignoring Article Titles)
- **File & Lines:** `backend/src/module/post/post.service.ts:26-31`
- **Bug Description:** The utility `backend/src/utils/slugify.ts:1-25` contains a robust, Unicode-aware slug generator that correctly normalizes Bengali and English text. However, `PostService.createPost` does not use `slugify.ts`. Instead, it generates an 8-character random hex string:
  ```ts
  let slug = crypto.randomBytes(4).toString("hex");
  let existingPost = await prisma.post.findUnique({ where: { slug } });
  while (existingPost) {
    slug = crypto.randomBytes(4).toString("hex");
    existingPost = await prisma.post.findUnique({ where: { slug } });
  }
  ```
- **Impact:** All newly published articles receive unreadable, SEO-destructive URLs such as `/2026/11/12/d8a2f4c9` instead of descriptive semantic titles.
- **Remediation:** Replace random hex generation with `slugify(data.title)` with collision-handling suffixes:
  ```ts
  let baseSlug = slugify(data.title);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  ```

---

#### Issue H3: Multi-Author Ownership Lockout for Administrators
- **File & Lines:** `backend/src/module/post/post.service.ts:274, 385-387, 415-417, 487-489`
- **Bug Description:** `getAllForAdmin`, `getById`, `updatePost`, and `deletePost` enforce an `authorId` match strictly without checking `user.role === "ADMIN"`:
  ```ts
  if (existingPost.authorId !== authorId) {
    throw new ApiError(403, "You do not have permission to edit this post.");
  }
  ```
- **Impact:** If multiple administrators or authors exist, or if an administrator attempts to edit or delete an article created by a previous author/admin, the operation fails with a 403 Forbidden error. Admins cannot perform system-wide editorial maintenance.
- **Remediation:** Pass `user.role` from controller to service, and permit Admins to bypass the `authorId` match:
  ```ts
  if (existingPost.authorId !== authorId && role !== "ADMIN") {
    throw new ApiError(403, "You do not have permission to edit this post.");
  }
  ```

---

### 3.3 MEDIUM SEVERITY

#### Issue M1: Admin Dashboard Analytics Metric Bug
- **File & Lines:** `frontend/src/app/zibon/(dashboard)/dashboard/page.tsx:20, 55-80`
- **Bug Description:** Line 20 calls `postsApi.getAllAdmin({ limit: 5 })`, retrieving only the latest 5 posts. Lines 55-80 then calculate "Published", "Drafts", and "This Week" metrics by running `.filter()` on the 5 retrieved posts.
- **Impact:** Dashboard metric cards display false totals (maximum value of 5), misleading administrators about actual publication statistics.
- **Remediation:** Implement a dedicated backend endpoint `GET /api/v1/posts/admin/stats` returning true aggregate counts via `prisma.post.count()`.

---

#### Issue M2: Anonymous Unmoderated Comment Section & Flood Vulnerability
- **File & Lines:** `backend/src/module/comment/comment.route.ts:6-7` & `comment.controller.ts:6-32`
- **Bug Description:** `POST /api/v1/posts/:id/comments` accepts submissions from unauthenticated users with zero CAPTCHA, zero turnstile, and no route-specific rate limiter. Furthermore, comments are published immediately without an approval workflow.
- **Impact:** Vulnerable to automated comment spam, database table bloat, and malicious link injection.
- **Remediation:** Add rate limiting, Cloudflare Turnstile, and an `isApproved` moderation status flag.

---

#### Issue M3: Unprotected Post View Counter
- **File & Lines:** `backend/src/module/post/post.service.ts:354`
- **Bug Description:** Every request to `GET /api/v1/posts/:slug` unconditionally increments `views: { increment: 1 }` without deduplicating by IP address, user agent, or session cookie.
- **Impact:** View counters can be artificially inflated by simple loop scripts or web crawlers.
- **Remediation:** Deduplicate view increments using a Redis set with TTL or a client session cookie.

---

#### Issue M4: Hardcoded `localhost:5000` and `localhost:3000` URLs in Production Code
- **File & Lines:**
  - `frontend/src/app/sitemap.ts:14`: `fetch("http://localhost:5000/api/v1/posts?limit=1000")`
  - `frontend/src/app/sitemap.ts:4`: `const baseUrl = "http://localhost:3000";`
  - `frontend/src/app/robots.ts:3`: `const baseUrl = "http://localhost:3000";`
  - `backend/src/config/index.ts:19`: `process.env.FRONTEND_URL || "http://localhost:3000"`
- **Bug Description:** Production SEO generators and fallbacks contain development loopback URLs.
- **Impact:** In production deployment, sitemaps output broken `localhost:3000` URLs to search engines and fetch from unreachable localhost ports.
- **Remediation:** Bind all URLs strictly to environment variables (`NEXT_PUBLIC_SITE_URL`, `INTERNAL_API_URL`).

---

#### Issue M5: Single-Origin CORS Configuration
- **File & Lines:** `backend/src/app.ts:24`
- **Bug Description:** CORS origin is configured as a single string: `origin: config.frontendUrl`.
- **Impact:** Blocks splitting Public Frontend and Admin Panel onto separate domains or subdomains.
- **Remediation:** Upgrade to dynamic array origin verification.

---

### 3.4 LOW SEVERITY

#### Issue L1: Dead / Unused Backend Endpoints
- **File & Lines:**
  - `backend/src/module/post/post.route.ts:14` (`GET /api/v1/posts/featured`)
  - `backend/src/module/post/post.route.ts:15` (`GET /api/v1/posts/recent-index`)
  - `backend/src/module/media/media.route.ts:61` (`PATCH /api/v1/media/:id/link`)
  - `backend/src/module/user/user.route.ts:20` (`GET /api/v1/users/profile`)
  - `backend/src/app.ts:66` (`GET /api/v1/health`)
  - `backend/src/app.ts:74` (`GET /`)
- **Finding:** Frontend UI never invokes these routes (homepage aggregates data via `/homepage`; user profile is stored in localStorage).
- **Remediation:** Prune dead routes or document as third-party integration points.

---

#### Issue L2: Missing Route Parameter Validation Schemas
- **File & Lines:**
  - `backend/src/module/category/category.route.ts:20` (`DELETE /categories/:id` lacks schema)
  - `backend/src/module/tag/tag.route.ts:22` (`DELETE /tags/:id` lacks schema)
  - `backend/src/module/subscriber/subscriber.route.ts:13` (`DELETE /subscribers/:id` lacks schema)
  - `backend/src/module/about/about.route.ts:8` (`PUT /about` lacks any Zod validation schema)
  - `backend/src/module/media/media.route.ts:48` (`MediaValidation.upload` is defined in `media.validation.ts:3-11` but never attached to route)
- **Finding:** Missing validation middleware leaves endpoints vulnerable to malformed input causing database errors.
- **Remediation:** Attach Zod parameter and body validation schemas to all route handlers.

---

#### Issue L3: Stack Trace Disclosure in Development Mode
- **File & Lines:** `backend/src/middleware/globalErrorHandler.ts:82-86`
- **Finding:** `globalErrorHandler` attaches full error stack traces when `process.env.NODE_ENV === "development"`.
- **Remediation:** Ensure `NODE_ENV=production` is strictly set in all non-local deployment environments.

---

## 4. Code Hygiene & Marker Verification
A full-codebase scan across `backend/src` and `frontend/src` for code hygiene markers (`TODO`, `FIXME`, `HACK`, `XXX`) was conducted:
- **Total Markers Found:** **0**
- **Result:** No unresolved developer comment flags exist in the source code.

