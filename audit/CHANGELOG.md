# Audit Reconciliation Changelog

> **Audit Date:** 2026-11-12  
> **Repository:** `d:\Zibon-Vlog`  
> **Status:** Ground-truth reconciliation against source code (Read-Only)  
> **Purpose:** Document every reconciled contradiction and corrected claim across the audit reports with verbatim source code evidence.

---

## Summary of Reconciled Contradictions

| # | Topic | Old Report Claim | Verified Source Code Reality | Verbatim Evidence |
|---|-------|------------------|------------------------------|-------------------|
| **1** | **Update HTTP Method** | Stated as `PUT` in `02-pages-inventory` & `05-features` (`PUT /posts/:id`, `PUT /categories/:id`, `PUT /tags/:id`, `PUT /site-settings`) | Both backend and frontend send and handle `PATCH` for post, category, tag, and site settings. | `backend/src/module/post/post.route.ts:28`<br>`backend/src/module/category/category.route.ts:14`<br>`backend/src/module/tag/tag.route.ts:16`<br>`backend/src/module/site-settings/site-settings.route.ts:8`<br>`frontend/src/lib/api.ts:79, 102, 126, 134` |
| **2** | **Admin Post List Route** | Falsely claimed frontend calls `GET /posts/admin/all` while backend has `/posts/admin/list` | Both backend route and frontend Axios client use `/posts/admin/list`. No route mismatch exists. | `backend/src/module/post/post.route.ts:7`<br>`frontend/src/lib/api.ts:76` |
| **3** | **Single Post Fetch Endpoint** | Falsely claimed frontend calls `GET /posts/:id` and that it does not exist | Frontend client `postsApi.getById` calls `/posts/admin/${id}` which matches backend `GET /api/v1/posts/admin/:id`. | `backend/src/module/post/post.route.ts:8-13`<br>`frontend/src/lib/api.ts:77` |
| **4** | **Category / Tag Single Fetch** | Listed `GET /categories/:id` and `GET /tags/:id` as existing endpoints in `05-features` | Neither `GET /categories/:id` nor `GET /tags/:id` exists in backend or frontend. | `backend/src/module/category/category.route.ts:1-21`<br>`backend/src/module/tag/tag.route.ts:1-25`<br>`frontend/src/lib/api.ts:110-136` |
| **5** | **Next.js & React Versions** | Claimed Next.js 15.1.3 in `02-pages-inventory.md:13` | Project uses Next.js `16.2.10` and React `19.2.4`. | `frontend/package.json:27-28`<br>`frontend/package-lock.json: node_modules/next (16.2.10), react (19.2.4)` |
| **6** | **Prisma & Express Versions** | Claimed Prisma `v5.16.1` in `04-data-models.md:13` and Express `4.21.2` in `00-overview.md` | Prisma CLI is `6.19.3`, Prisma Client is `6.19.3` (declared `^6.9.0`), Express resolved is `4.22.2` (declared `^4.21.2`). | `backend/package.json:19, 26, 43`<br>`backend/package-lock.json: express (4.22.2), prisma (6.19.3), @prisma/client (6.19.3)` |
| **7** | **Login Password Validation** | Claimed login checks `min(6)` password length in `03-auth-and-security.md:41` | Login validation checks `min(1)` (`password: z.string().min(1, "Password is required")`). Only registration checks `min(6)`. | `backend/src/module/user/user.validation.ts:25`<br>`backend/src/module/user/user.validation.ts:14` |
| **8** | **Post Ownership Check for USER & ADMIN** | Claimed a `USER` could overwrite/delete any post in `03-auth-and-security.md:216-217` | A `USER` cannot edit or delete another user's post (blocked with 403). Crucially, an `ADMIN` is ALSO blocked because `post.service.ts` checks authorId without role override. | `backend/src/module/post/post.service.ts:415-417`<br>`backend/src/module/post/post.service.ts:487-489` |
| **9** | **Seed Password Exposure** | Plaintext password fallback was printed in `03-auth-and-security.md:112, 133, 334` | Password fallback masked with `[REDACTED_FALLBACK]`, noting only that a hardcoded fallback exists in `seed.ts:12`. | `backend/prisma/seed.ts:12`<br>`audit/03-auth-and-security.md:112, 133, 334` |
| **10** | **Endpoint Recount Total** | Public count listed as 16 with mathematical discrepancies in `01-api-inventory.md:16` | Exact sum is 17 Public + 2 Authenticated User + 18 Admin-Intended Missing Role Check + 1 Admin Enforced = 38 total. | `backend/src/app.ts:55-79` and route definitions |
| **11** | **Page Route Recount Total** | Claimed "18 distinct pages (7 public, 11 admin)" in `02-pages-inventory.md:13, 57` | Exact count is 19 pages: 7 public editorial/auth, 1 server redirect (`/zibon`), 11 admin dashboard pages. | `frontend/src/app/**/page.tsx` (19 files) |
| **12** | **Phantom Script Files in Checklist** | Claimed `backend/src/scripts/seedCategories.ts` and `seedSiteSettings.ts` were opened and analyzed in `99-coverage-checklist.md:93-94` | Neither file exists; `backend/src/scripts/` is completely empty. Hallucinated items removed. | `backend/src/scripts` directory check |

---

## Detailed Reconciliations

### 1. HTTP Method for Resource Updates (PATCH vs PUT)
- **Old Claim:** `audit/02-pages-inventory.md` (rows 9, 10, 13, 14, 15) and `audit/05-features.md` claimed the frontend invoked `PUT /posts/:id`, `PUT /categories/:id`, `PUT /tags/:id`, `PUT /site-settings`.
- **New Reconciled Fact:** All updates for posts, categories, tags, and site settings use `PATCH` in both the backend route definitions and the frontend Axios client (`frontend/src/lib/api.ts`). Only `about` page updates use `PUT`.
- **Verbatim Evidence:**
  - `backend/src/module/post/post.route.ts:28`:
    ```ts
    router.patch("/:id", auth, validateRequest(PostValidation.update), PostController.updatePost);
    ```
  - `frontend/src/lib/api.ts:79`:
    ```ts
    update: (id: string, data: UpdatePostData) => api.patch(`/posts/${id}`, data),
    ```
  - `backend/src/module/category/category.route.ts:14`:
    ```ts
    router.patch("/:id", auth, validateRequest(CategoryValidation.update), CategoryController.update);
    ```
  - `frontend/src/lib/api.ts:126`:
    ```ts
    update: (id: string, data: ...) => api.patch(`/categories/${id}`, data),
    ```
  - `backend/src/module/tag/tag.route.ts:16`:
    ```ts
    router.patch("/:id", auth, validateRequest(TagValidation.update), TagController.update);
    ```
  - `frontend/src/lib/api.ts:134`:
    ```ts
    update: (id: string, data: { name?: string; slug?: string }) => api.patch(`/tags/${id}`, data),
    ```
  - `backend/src/module/site-settings/site-settings.route.ts:8`:
    ```ts
    router.patch("/", auth, validateRequest(SiteSettingsValidation.update), SiteSettingsController.updateSettings);
    ```
  - `frontend/src/lib/api.ts:102`:
    ```ts
    update: (data: Record<string, unknown>) => api.patch("/site-settings", data),
    ```
  - `backend/src/module/about/about.route.ts:8` (PUT is verified here):
    ```ts
    router.put("/", auth, authorize("ADMIN"), AboutController.updateAboutPage);
    ```
  - `frontend/src/lib/api.ts:107`:
    ```ts
    update: (data: any) => api.put("/about", data),
    ```

---

### 2. Admin Post Listing & Single Post Retrieval Paths
- **Old Claim:** The frontend called `GET /posts/admin/all` while backend only exposed `/posts/admin/list`. For single post edit, claimed frontend called `GET /posts/:id` and failed.
- **New Reconciled Fact:** There is NO mismatch between frontend and backend. Both backend and frontend use `/posts/admin/list` for admin listing, and `/posts/admin/:id` for fetching single posts by ID for editing. No admin feature is broken due to path mismatches.
- **Verbatim Evidence:**
  - `backend/src/module/post/post.route.ts:7`:
    ```ts
    router.get("/admin/list", auth, PostController.getAllForAdmin);
    ```
  - `frontend/src/lib/api.ts:76`:
    ```ts
    getAllAdmin: (params?: { page?: number; limit?: number; status?: string }) => api.get("/posts/admin/list", { params }),
    ```
  - `backend/src/module/post/post.route.ts:8-13`:
    ```ts
    router.get("/admin/:id", auth, validateRequest(PostValidation.getById), PostController.getById);
    ```
  - `frontend/src/lib/api.ts:77`:
    ```ts
    getById: (id: string) => api.get(`/posts/admin/${id}`),
    ```
  - `frontend/src/app/zibon/(dashboard)/posts/[id]/edit/page.tsx:47`:
    ```ts
    queryFn: () => postsApi.getById(postId),
    ```

---

### 3. Actual Framework & Dependency Versions
- **Old Claim:** `02-pages-inventory.md:13` claimed Next.js 15.1.3. `04-data-models.md:13` claimed Prisma v5.16.1. `00-overview.md` claimed Express was 4.21.2 and Prisma Client was 6.9.0.
- **New Reconciled Fact:**
  - Next.js: declared `"16.2.10"`, resolved lockfile `16.2.10`
  - React: declared `"19.2.4"`, resolved lockfile `19.2.4`
  - Express: declared `"^4.21.2"`, resolved lockfile `4.22.2`
  - Prisma CLI: declared `"^6.19.3"`, resolved lockfile `6.19.3`
  - @prisma/client: declared `"^6.9.0"`, resolved lockfile `6.19.3`
- **Verbatim Evidence:**
  - `frontend/package.json:27-29`:
    ```json
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    ```
  - `backend/package.json:19, 26, 43`:
    ```json
    "@prisma/client": "^6.9.0",
    "express": "^4.21.2",
    "prisma": "^6.19.3",
    ```
  - `backend/package-lock.json` packages:
    - `"node_modules/express": { "version": "4.22.2" }`
    - `"node_modules/prisma": { "version": "6.19.3" }`
    - `"node_modules/@prisma/client": { "version": "6.19.3" }`

---

### 4. Login Password Validation Schema
- **Old Claim:** `03-auth-and-security.md:41` claimed that `validateRequest(userLoginValidationSchema)` in `backend/src/module/user/user.validation.ts` checks "email format and minimum 6-character password".
- **New Reconciled Fact:** Login validation enforces `min(1)` for password (`password: z.string().min(1, "Password is required")`). Minimum 6 characters is only enforced during registration (`UserValidation.register`).
- **Verbatim Evidence:**
  - `backend/src/module/user/user.validation.ts:18-27`:
    ```ts
    login: z.object({
      body: z.object({
        email: z
          .string({ required_error: "Email is required" })
          .email("Invalid email format"),
        password: z
          .string({ required_error: "Password is required" })
          .min(1, "Password is required"),
      }),
    }),
    ```
  - `backend/src/module/user/user.validation.ts:12-15` (register):
    ```ts
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must not exceed 128 characters"),
    ```

---

### 5. Post Ownership Enforcement for USER and ADMIN Roles
- **Old Claim:** `03-auth-and-security.md:216-217` claimed that an attacker with role `USER` can call `PUT /api/v1/posts/:id` to overwrite any author's article and `DELETE /api/v1/posts/:id` to delete any article.
- **New Reconciled Fact:**
  1. A user with `role: "USER"` **CANNOT** edit or delete another user's post. The backend strictly checks `existingPost.authorId !== authorId` in `post.service.ts:415, 487` and throws `ApiError(403)`. A `USER` can only view, edit, or delete posts where `authorId === user.id`.
  2. Crucially, an `ADMIN` user **ALSO CANNOT** edit or delete posts authored by another user. Because `post.controller.ts:108, 120` passes `authorId = req.user!.id` and `post.service.ts` does not check `user.role`, the `existingPost.authorId !== authorId` comparison blocks an Admin user as well, throwing `ApiError(403)`.
  3. In `getAllForAdmin` (`post.service.ts:274`), the query enforces `where: { authorId }`. An administrator cannot see or manage other authors' posts in the admin list.
- **Verbatim Evidence:**
  - `backend/src/module/post/post.service.ts:385-387`:
    ```ts
    if (post.authorId !== authorId) {
      throw new ApiError(403, "You do not have permission to view this post.");
    }
    ```
  - `backend/src/module/post/post.service.ts:415-417`:
    ```ts
    if (existingPost.authorId !== authorId) {
      throw new ApiError(403, "You do not have permission to edit this post.");
    }
    ```
  - `backend/src/module/post/post.service.ts:487-489`:
    ```ts
    if (post.authorId !== authorId) {
      throw new ApiError(403, "You do not have permission to delete this post.");
    }
    ```
  - `backend/src/module/post/post.service.ts:274`:
    ```ts
    const where: any = { authorId };
    ```

---

### 6. Real Database Table Names and Migration Drift
- **Old Claim:** Implied all schema models had corresponding migration files.
- **New Reconciled Fact:** While `backend/prisma/schema.prisma` defines 9 models with specific `@@map` names (`users`, `posts`, `media`, `site_settings`, `subscribers`, `categories`, `tags`, `comments`, `about_page`), only 3 tables (`users`, `posts`, `media`) exist in `backend/prisma/migrations/20260709034401_init/migration.sql`. The remaining 6 domain tables and 2 implicit join tables (`_PostCategories`, `_PostTags`) have NO migrations in the repository and were synchronized directly using `prisma db push`.
- **Verbatim Evidence:**
  - `backend/prisma/migrations/20260709034401_init/migration.sql:2`: `CREATE TABLE users`
  - `backend/prisma/migrations/20260709034401_init/migration.sql:17`: `CREATE TABLE posts`
  - `backend/prisma/migrations/20260709034401_init/migration.sql:41`: `CREATE TABLE media`
  - `backend/prisma/migrations/20260709035849_change_default_role/migration.sql:2`: `ALTER TABLE users MODIFY role ...`
  - No other migration files exist in `backend/prisma/migrations/`.

---

### 7. Endpoint & Page Recount Totals
- **Old Claim:** Public endpoint count was listed as 16 (summing to 37 instead of 38). Pages counted as "18 distinct pages (7 public, 11 admin)".
- **New Reconciled Fact:**
  - **Endpoints (38 total):**
    - Public: 17 endpoints
    - Authenticated User: 2 endpoints (`GET /api/v1/users/profile`, `PATCH /api/v1/users/profile`)
    - Admin-Intended Missing Role Check: 18 endpoints
    - Admin-Enforced: 1 endpoint (`PUT /api/v1/about` via `authorize("ADMIN")`)
    - Sum: 17 + 2 + 18 + 1 = **38 endpoints**.
  - **Pages (19 total):**
    - Public reader/auth pages: 7 pages (`/`, `/about`, `/category/[slug]`, `/tag/[slug]`, `/[year]/[month]/[day]/[slug]`, `/login`, `/register`)
    - Server redirect route: 1 page (`/zibon`)
    - Admin dashboard pages: 11 pages (`/zibon/dashboard`, `/zibon/homepage`, `/zibon/posts`, `/zibon/posts/new`, `/zibon/posts/[id]/edit`, `/zibon/categories`, `/zibon/tags`, `/zibon/subscribers`, `/zibon/media`, `/zibon/about`, `/zibon/settings`)
    - Sum: 7 + 1 + 11 = **19 pages**.

---

### 8. Masking Hardcoded Seed Credentials
- **Old Claim:** `03-auth-and-security.md:112, 133, 334` exposed the plaintext fallback seed password.
- **New Reconciled Fact:** Plaintext value removed and replaced with `[REDACTED_FALLBACK]`, documenting only that a hardcoded fallback exists in `backend/prisma/seed.ts:12`.
- **Verbatim Evidence:**
  - `backend/prisma/seed.ts:12`:
    ```ts
    const adminPassword = process.env.ADMIN_PASSWORD || '[REDACTED_FALLBACK]';
    ```

