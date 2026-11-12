# Phase 2: Complete API Inventory & Security Audit

> **Project:** Zibon-Vlog  
> **API Base URL:** `http://localhost:5000/api/v1` (Frontend env: `NEXT_PUBLIC_API_URL`, `frontend/.env.local:2`)  
> **Backend Mount Root:** `backend/src/app.ts:55-74`  
> **Total Endpoints Inventoried:** 38 endpoints  
> **Audit Status:** Verified against source code files (Read-Only)  
> **Date:** 2026-11-12  

---

## 1. Executive Summary of API Findings

1. **Total Route Handlers:** 38 distinct HTTP endpoints (36 under `/api/v1/*`, 2 root/health endpoints).
2. **Access Breakdown:**
   - **PUBLIC:** 17 endpoints (15 under `/api/v1/*`, plus `/api/v1/health` and `/`)
   - **AUTHENTICATED USER (General):** 2 endpoints (`GET /users/profile`, `PATCH /users/profile`)
   - **ADMIN-INTENDED ENDPOINTS MISSING ROLE CHECKS:** **18 endpoints**
   - **ENFORCED ADMIN-ONLY:** **1 endpoint** (`PUT /api/v1/about` via `authorize("ADMIN")`)
   - *Total:* 17 + 2 + 18 + 1 = **38 endpoints**
3. **Critical Security Vulnerability:**
   - The backend provides an `authorize(...roles: string[])` middleware (`backend/src/middleware/auth.ts:55-67`), but it is **only applied to a single route** in the entire system (`PUT /api/v1/about` in `backend/src/module/about/about.route.ts:8`).
   - Every other destructive admin operation—including creating/updating/deleting posts, creating/deleting categories and tags, uploading 100MB files to Cloudinary, deleting media assets, reading all newsletter subscriber emails, and overwriting site settings—only applies the `auth` middleware (`backend/src/middleware/auth.ts:13-54`).
   - Because `auth` only verifies that a JWT cookie exists, **any registered user with the default role `USER` can execute all administrative actions directly via HTTP requests.**
4. **Dead / Unused Endpoints in Frontend:** 6 endpoints are defined in the backend but never invoked by the frontend UI.

---

## 2. Complete API Inventory Tables

---

### 2.1 Authentication Resource (`/api/v1/auth`)
*Mount Point:* `app.use("/api/v1/auth", authLimiter, authRoutes);` (`backend/src/app.ts:55`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `backend/src/module/user/user.route.ts:7-11` | `UserController.register` (`backend/src/module/user/user.controller.ts:7-21`) | `authLimiter` (50 req/15min, `app.ts:42-52`), `validateRequest(UserValidation.register)` | No (PUBLIC) | Public / None | **Body:** `{ name: string (2-100), email: string (email), password: string (6-128) }` (`user.validation.ts:3-17`) | `{ statusCode: 201, success: true, message: "User registered successfully", data: { user: { id, name, email, role, createdAt } } }` + Set-Cookie `token` (HttpOnly, maxAge: 7d) | `User` (`prisma.user.findUnique`, `prisma.user.create`) | None (Local `bcrypt.hash` 12 rounds) |
| `POST` | `/api/v1/auth/login` | `backend/src/module/user/user.route.ts:12-16` | `UserController.login` (`backend/src/module/user/user.controller.ts:22-36`) | `authLimiter` (50 req/15min), `validateRequest(UserValidation.login)` | No (PUBLIC) | Public / None | **Body:** `{ email: string (email), password: string (min 1) }` (`user.validation.ts:18-27`) | `{ statusCode: 200, success: true, message: "Login successful", data: { user: { id, email, name, role, avatar, createdAt, updatedAt } } }` + Set-Cookie `token` (HttpOnly, maxAge: 7d) | `User` (`prisma.user.findUnique`) | None (Local `bcrypt.compare`) |
| `POST` | `/api/v1/auth/logout` | `backend/src/module/user/user.route.ts:17` | `UserController.logout` (`backend/src/module/user/user.controller.ts:37-45`) | `authLimiter` (50 req/15min) | No (PUBLIC / ANY) | Public / None | None | `{ statusCode: 200, success: true, message: "Logout successful", data: null }` + Clear-Cookie `token` | None | None |

---

### 2.2 User & Profile Resource (`/api/v1/users`)
*Mount Point:* `app.use("/api/v1/users", userRoutes);` (`backend/src/app.ts:56`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/users/profile` | `backend/src/module/user/user.route.ts:20` | `UserController.getProfile` (`backend/src/module/user/user.controller.ts:46-55`) | Global `limiter` (500 req/15min, `app.ts:30-41`), `auth` (`auth.ts:13-54`) | Yes (AUTHENTICATED USER) | Any authenticated user (`USER` or `ADMIN`) | None | `{ statusCode: 200, success: true, message: "Profile retrieved successfully", data: { id, name, email, role, avatar, createdAt, updatedAt, _count: { posts } } }` | `User` (`prisma.user.findUnique`), `Post` count | None |
| `PATCH` | `/api/v1/users/profile` | `backend/src/module/user/user.route.ts:21-26` | `UserController.updateProfile` (`backend/src/module/user/user.controller.ts:56-65`) | Global `limiter`, `auth`, `validateRequest(UserValidation.updateProfile)` | Yes (AUTHENTICATED USER) | Any authenticated user (`USER` or `ADMIN`) | **Body:** `{ name?: string (2-100), avatar?: string (url) }` (`user.validation.ts:28-37`) | `{ statusCode: 200, success: true, message: "Profile updated successfully", data: { id, name, email, role, avatar, updatedAt } }` | `User` (`prisma.user.update`) | None |

---

### 2.3 Blog Posts Resource (`/api/v1/posts`)
*Mount Point:* `app.use("/api/v1/posts", postRoutes);` (`backend/src/app.ts:58`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/posts/admin/list` | `backend/src/module/post/post.route.ts:7` | `PostController.getAllForAdmin` (`backend/src/module/post/post.controller.ts:61-76`) | Global `limiter`, `auth` | Yes (AUTHENTICATED USER) | **MISSING ADMIN ROLE CHECK.** Named `/admin/list` but only checks `auth`. Queries `where: { authorId }` (`post.service.ts:274`). | **Query:** `page?: number`, `limit?: number`, `status?: "DRAFT" \| "PUBLISHED"` (parsed manually in controller) | `{ statusCode: 200, success: true, message: "Posts retrieved successfully", meta: { page, limit, total, totalPages }, data: Post[] }` | `Post` (`prisma.post.count`, `prisma.post.findMany`), `Category`, `Tag` | None |
| `GET` | `/api/v1/posts/admin/:id` | `backend/src/module/post/post.route.ts:8-13` | `PostController.getById` (`backend/src/module/post/post.controller.ts:94-104`) | Global `limiter`, `auth`, `validateRequest(PostValidation.getById)` | Yes (AUTHENTICATED USER) | **MISSING ADMIN ROLE CHECK.** Only checks `post.authorId === authorId` (`post.service.ts:386`). | **Params:** `{ id: string }` (`post.validation.ts:82-86`) | `{ statusCode: 200, success: true, message: "Post retrieved successfully", data: Post (with author, category, categories, tags, media) }` | `Post` (`prisma.post.findUnique`), `User`, `Category`, `Tag`, `Media` | None |
| `GET` | `/api/v1/posts/featured` | `backend/src/module/post/post.route.ts:14` | `PostController.getFeatured` (`backend/src/module/post/post.controller.ts:36-44`) | Global `limiter` | No (PUBLIC) | Public / None | None | `{ statusCode: 200, success: true, message: "Featured post retrieved successfully", data: Post \| null }` | `Post` (`prisma.post.findFirst` where status: PUBLISHED, orderBy: `[{ isFeatured: "desc" }, { publishedAt: "desc" }]`) | None |
| `GET` | `/api/v1/posts/recent-index` | `backend/src/module/post/post.route.ts:15` | `PostController.getRecentIndex` (`backend/src/module/post/post.controller.ts:46-59`) | Global `limiter` | No (PUBLIC) | Public / None | **Query:** `page?: number`, `limit?: number` | `{ statusCode: 200, success: true, message: "Recent index posts retrieved successfully", meta: { page, limit, total, totalPages }, data: Post[] }` | `Post` (`prisma.post.count`, `prisma.post.findMany` where status: PUBLISHED) | None |
| `GET` | `/api/v1/posts` | `backend/src/module/post/post.route.ts:16` | `PostController.getAllPublished` (`backend/src/module/post/post.controller.ts:18-34`) | Global `limiter` | No (PUBLIC) | Public / None | **Query:** `page?: number`, `limit?: number`, `search?: string`, `categorySlug?: string`, `tagSlug?: string` | `{ statusCode: 200, success: true, message: "Posts retrieved successfully", meta: { page, limit, total, totalPages }, data: Post[] }` | `Post` (`prisma.post.count`, `prisma.post.findMany`), `Category`, `Tag` | None |
| `GET` | `/api/v1/posts/:slug` | `backend/src/module/post/post.route.ts:17-21` | `PostController.getBySlug` (`backend/src/module/post/post.controller.ts:78-92`) | Global `limiter`, `validateRequest(PostValidation.getBySlug)` | No (PUBLIC) | Public / None | **Params:** `{ slug: string (min 1) }` (`post.validation.ts:75-81`) | `{ statusCode: 200, success: true, message: "Post retrieved successfully", data: Post }` | `Post` (`prisma.post.findUnique`, plus background increment `views += 1`) | None |
| `POST` | `/api/v1/posts` | `backend/src/module/post/post.route.ts:22-27` | `PostController.createPost` (`backend/src/module/post/post.controller.ts:7-16`) | Global `limiter`, `auth`, `validateRequest(PostValidation.create)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can create published blog posts! | **Body:** `{ title: string (3-255), content: string (min 10), excerpt?: string (max 2000), coverImage?: string (url), metaTitle?: string (max 160), metaDescription?: string (max 320), ogImage?: string (url), status?: "DRAFT" \| "PUBLISHED", isFeatured?: boolean, readTime?: int, displayOrder?: int, categoryId?: uuid \| null, categoryIds?: uuid[], tagIds?: uuid[] }` (`post.validation.ts:4-35`) | `{ statusCode: 201, success: true, message: "Post created successfully", data: Post }` | `Post` (`prisma.post.create`, `prisma.post.updateMany`), `Category`, `Tag` | None |
| `PATCH` | `/api/v1/posts/:id` | `backend/src/module/post/post.route.ts:28-33` | `PostController.updatePost` (`backend/src/module/post/post.controller.ts:106-116`) | Global `limiter`, `auth`, `validateRequest(PostValidation.update)` | Yes (AUTHENTICATED USER) | **MISSING ADMIN ROLE CHECK.** Only checks `post.authorId === authorId` (`post.service.ts:415`). | **Params:** `{ id: string }`, **Body:** Optional fields matching `create` (`post.validation.ts:36-74`) | `{ statusCode: 200, success: true, message: "Post updated successfully", data: Post }` | `Post` (`prisma.post.findUnique`, `prisma.post.update`, `prisma.post.updateMany`) | None |
| `DELETE` | `/api/v1/posts/:id` | `backend/src/module/post/post.route.ts:34-39` | `PostController.deletePost` (`backend/src/module/post/post.controller.ts:118-128`) | Global `limiter`, `auth`, `validateRequest(PostValidation.getById)` | Yes (AUTHENTICATED USER) | **MISSING ADMIN ROLE CHECK.** Only checks `post.authorId === authorId` (`post.service.ts:487`). | **Params:** `{ id: string }` (`post.validation.ts:82-86`) | `{ statusCode: 200, success: true, message: "Post deleted successfully", data: { id: string } }` | `Post` (`prisma.post.findUnique`, `prisma.post.delete`) | None |

---

### 2.4 Comments Resource (`/api/v1/posts/:id/comments`)
*Mount Point:* `app.use("/api/v1/posts", commentRoutes);` (`backend/src/app.ts:57`)  
*Route File:* `backend/src/module/comment/comment.route.ts:1-9`

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/posts/:id/comments` | `backend/src/module/comment/comment.route.ts:6` | `CommentController.createComment` (`backend/src/module/comment/comment.controller.ts:6-22`) | Global `limiter`. **NO route validation middleware.** Manual validation inside controller via `createCommentSchema.parse(req.body)` | No (PUBLIC) | Public / None | **Params:** `:id` (postId, unvalidated in route/schema). **Body:** `{ content: string (min 1), authorName: string (min 1), authorEmail?: string (email or ""), parentId?: uuid }` (`comment.validation.ts:3-8`) | `{ statusCode: 201, success: true, message: "Comment created successfully", data: Comment }` (Error format: `{ success: false, message: string }`, bypassing global error handler) | `Post` (`prisma.post.findUnique`), `Comment` (`prisma.comment.findUnique`, `prisma.comment.create`) | None (Sanitized via `sanitizeHtml`) |
| `GET` | `/api/v1/posts/:id/comments` | `backend/src/module/comment/comment.route.ts:7` | `CommentController.getComments` (`backend/src/module/comment/comment.controller.ts:24-39`) | Global `limiter`. **NO validation middleware.** | No (PUBLIC) | Public / None | **Params:** `:id` (postId, unvalidated) | `{ statusCode: 200, success: true, message: "Comments retrieved successfully", data: Comment[] (nested comment tree with replies) }` | `Comment` (`prisma.comment.findMany` where postId) | None |

---

### 2.5 Categories Resource (`/api/v1/categories`)
*Mount Point:* `app.use("/api/v1/categories", categoryRoutes);` (`backend/src/app.ts:61`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/categories` | `backend/src/module/category/category.route.ts:7` | `CategoryController.getAll` (`backend/src/module/category/category.controller.ts:5-13`) | Global `limiter` | No (PUBLIC) | Public / None | None | `{ statusCode: 200, success: true, message: "Categories retrieved successfully", data: Category[] (with children, parent, _count: { posts }) }` | `Category` (`prisma.category.findMany`), `Post` | None |
| `POST` | `/api/v1/categories` | `backend/src/module/category/category.route.ts:8-13` | `CategoryController.create` (`backend/src/module/category/category.controller.ts:14-22`) | Global `limiter`, `auth`, `validateRequest(CategoryValidation.create)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can create categories! | **Body:** `{ name: string, slug?: string, parentId?: string \| null, showInHeader?: boolean }` (`category.validation.ts:3-12`) | `{ statusCode: 201, success: true, message: "Category created successfully", data: Category }` | `Category` (`prisma.category.findFirst`, `prisma.category.create`) | None (Slug auto-generated via `slugify.ts`) |
| `PATCH` | `/api/v1/categories/:id` | `backend/src/module/category/category.route.ts:14-19` | `CategoryController.update` (`backend/src/module/category/category.controller.ts:23-32`) | Global `limiter`, `auth`, `validateRequest(CategoryValidation.update)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can edit any category! | **Params:** `:id` (UNVALIDATED). **Body:** `{ name?: string, slug?: string, parentId?: string \| null, showInHeader?: boolean }` (`category.validation.ts:14-21`) | `{ statusCode: 200, success: true, message: "Category updated successfully", data: Category }` | `Category` (`prisma.category.findUnique`, `prisma.category.findFirst`, `prisma.category.update`) | None |
| `DELETE` | `/api/v1/categories/:id` | `backend/src/module/category/category.route.ts:20` | `CategoryController.deleteCategory` (`backend/src/module/category/category.controller.ts:33-42`) | Global `limiter`, `auth`. **NO validation middleware.** | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can delete categories! | **Params:** `:id` (UNVALIDATED) | `{ statusCode: 200, success: true, message: "Category deleted successfully", data: { id: string } }` | `Category` (`prisma.category.findUnique` with post count check, `prisma.category.delete`) | None |

---

### 2.6 Tags Resource (`/api/v1/tags`)
*Mount Point:* `app.use("/api/v1/tags", tagRoutes);` (`backend/src/app.ts:62`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/tags` | `backend/src/module/tag/tag.route.ts:9` | `TagController.getAll` (`backend/src/module/tag/tag.controller.ts:6-14`) | Global `limiter` | No (PUBLIC) | Public / None | None | `{ statusCode: 200, success: true, message: "Tags retrieved successfully", data: Tag[] (with _count: { posts }) }` | `Tag` (`prisma.tag.findMany`), `Post` count | None |
| `POST` | `/api/v1/tags` | `backend/src/module/tag/tag.route.ts:10-15` | `TagController.create` (`backend/src/module/tag/tag.controller.ts:16-24`) | Global `limiter`, `auth`, `validateRequest(TagValidation.create)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can create tags! | **Body:** `{ name: string (min 1), slug?: string }` (`tag.validation.ts:3-10`) | `{ statusCode: 201, success: true, message: "Tag created successfully", data: Tag }` | `Tag` (`prisma.tag.findFirst`, `prisma.tag.create`) | None |
| `PATCH` | `/api/v1/tags/:id` | `backend/src/module/tag/tag.route.ts:16-21` | `TagController.update` (`backend/src/module/tag/tag.controller.ts:26-35`) | Global `limiter`, `auth`, `validateRequest(TagValidation.update)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can rename tags! | **Params:** `:id` (UNVALIDATED). **Body:** `{ name?: string, slug?: string }` (`tag.validation.ts:12-17`) | `{ statusCode: 200, success: true, message: "Tag updated successfully", data: Tag }` | `Tag` (`prisma.tag.findUnique`, `prisma.tag.findFirst`, `prisma.tag.update`) | None |
| `DELETE` | `/api/v1/tags/:id` | `backend/src/module/tag/tag.route.ts:22` | `TagController.deleteTag` (`backend/src/module/tag/tag.controller.ts:37-46`) | Global `limiter`, `auth`. **NO validation middleware.** | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can delete tags! | **Params:** `:id` (UNVALIDATED) | `{ statusCode: 200, success: true, message: "Tag deleted successfully", data: { id: string } }` | `Tag` (`prisma.tag.findUnique`, `prisma.tag.delete`) | None |

---

### 2.7 Media & File Upload Resource (`/api/v1/media`)
*Mount Point:* `app.use("/api/v1/media", mediaRoutes);` (`backend/src/app.ts:59`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/media/upload` | `backend/src/module/media/media.route.ts:48-53` | `MediaController.upload` (`backend/src/module/media/media.controller.ts:6-20`) | Global `limiter`, `auth`, `multer.single("file")` (`media.route.ts:41-47`). **NOTE:** `MediaValidation.upload` is NOT attached to route! | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can upload up to 100MB files to Cloudinary! | **Multipart Form-Data:** `file` (image/jpeg, png, gif, webp, svg+xml, video/mp4, webm, quicktime, x-msvideo, max 100MB), `alt?: string`, `postId?: string` | `{ statusCode: 201, success: true, message: "File uploaded successfully", data: Media }` | `Media` (`prisma.media.create`) | Cloudinary API (`cloudinary.uploader.upload`) |
| `GET` | `/api/v1/media` | `backend/src/module/media/media.route.ts:54` | `MediaController.getAll` (`backend/src/module/media/media.controller.ts:21-35`) | Global `limiter`, `auth` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can view entire media catalog! | **Query:** `page?: number`, `limit?: number`, `type?: "IMAGE" \| "VIDEO"` | `{ statusCode: 200, success: true, message: "Media retrieved successfully", meta: { page, limit, total, totalPages }, data: Media[] }` | `Media` (`prisma.media.count`, `prisma.media.findMany`) | None |
| `DELETE` | `/api/v1/media/:id` | `backend/src/module/media/media.route.ts:55-60` | `MediaController.deleteMedia` (`backend/src/module/media/media.controller.ts:36-45`) | Global `limiter`, `auth`, `validateRequest(MediaValidation.delete)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can delete any media asset from Cloudinary and DB! | **Params:** `{ id: string }` (`media.validation.ts:12-16`) | `{ statusCode: 200, success: true, message: "Media deleted successfully", data: { id: string } }` | `Media` (`prisma.media.findUnique`, `prisma.media.delete`) | Cloudinary API (`cloudinary.uploader.destroy`) |
| `PATCH` | `/api/v1/media/:id/link` | `backend/src/module/media/media.route.ts:61-65` | `MediaController.linkToPost` (`backend/src/module/media/media.controller.ts:46-56`) | Global `limiter`, `auth`. **NO validation middleware.** | Yes (AUTHENTICATED USER) | **MISSING ADMIN CHECK.** Any user with role `USER` can link media to posts. | **Params:** `:id`, **Body:** `{ postId: string }` | `{ statusCode: 200, success: true, message: "Media linked to post successfully", data: Media }` | `Media` (`prisma.media.update`) | None |

---

### 2.8 Site Settings Resource (`/api/v1/site-settings`)
*Mount Point:* `app.use("/api/v1/site-settings", siteSettingsRoutes);` (`backend/src/app.ts:60`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/site-settings` | `backend/src/module/site-settings/site-settings.route.ts:7` | `SiteSettingsController.getSettings` (`backend/src/module/site-settings/site-settings.controller.ts:5-13`) | Global `limiter` | No (PUBLIC) | Public / None | None | `{ statusCode: 200, success: true, message: "Site settings retrieved successfully", data: SiteSettings }` | `SiteSettings` (`prisma.siteSettings.findUnique`, `prisma.siteSettings.create` fallback) | None |
| `PATCH` | `/api/v1/site-settings` | `backend/src/module/site-settings/site-settings.route.ts:8-13` | `SiteSettingsController.updateSettings` (`backend/src/module/site-settings/site-settings.controller.ts:14-22`) | Global `limiter`, `auth`, `validateRequest(SiteSettingsValidation.update)` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can overwrite entire site configuration! | **Body:** Up to 40 optional fields (`siteName`, `navLinks`, `heroTitle`, `heroImage`, widget toggles, etc.) (`site-settings.validation.ts:3-50`) | `{ statusCode: 200, success: true, message: "Site settings updated successfully", data: SiteSettings }` | `SiteSettings` (`prisma.siteSettings.update`) | None |

---

### 2.9 Newsletter Subscribers Resource (`/api/v1/subscribers`)
*Mount Point:* `app.use("/api/v1/subscribers", subscriberRoutes);` (`backend/src/app.ts:63`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/subscribers` | `backend/src/module/subscriber/subscriber.route.ts:7-11` | `SubscriberController.subscribe` (`backend/src/module/subscriber/subscriber.controller.ts:5-14`) | Global `limiter`, `validateRequest(SubscriberValidation.subscribe)` | No (PUBLIC) | Public / None | **Body:** `{ email: string (email) }` (`subscriber.validation.ts:2-10`) | `{ statusCode: 201, success: true, message: "Subscribed successfully", data: Subscriber }` | `Subscriber` (`prisma.subscriber.findUnique`, `prisma.subscriber.create`) | None |
| `GET` | `/api/v1/subscribers` | `backend/src/module/subscriber/subscriber.route.ts:12` | `SubscriberController.getAll` (`backend/src/module/subscriber/subscriber.controller.ts:15-28`) | Global `limiter`, `auth` | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK & PRIVACY LEAK.** Any logged-in `USER` can harvest all subscriber emails! | **Query:** `page?: number`, `limit?: number` | `{ statusCode: 200, success: true, message: "Subscribers retrieved successfully", meta: { page, limit, total, totalPages }, data: Subscriber[] }` | `Subscriber` (`prisma.subscriber.count`, `prisma.subscriber.findMany`) | None |
| `DELETE` | `/api/v1/subscribers/:id` | `backend/src/module/subscriber/subscriber.route.ts:13` | `SubscriberController.deleteSubscriber` (`backend/src/module/subscriber/subscriber.controller.ts:29-38`) | Global `limiter`, `auth`. **NO validation middleware.** | Yes (AUTHENTICATED USER) | **CRITICAL: MISSING ADMIN CHECK.** Any user with role `USER` can delete subscribers! | **Params:** `:id` (UNVALIDATED) | `{ statusCode: 200, success: true, message: "Subscriber deleted successfully", data: { id: string } }` | `Subscriber` (`prisma.subscriber.findUnique`, `prisma.subscriber.delete`) | None |

---

### 2.10 Homepage Aggregation Resource (`/api/v1/homepage`)
*Mount Point:* `app.use("/api/v1/homepage", homepageRoutes);` (`backend/src/app.ts:64`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/homepage` | `backend/src/module/homepage/homepage.route.ts:4` | `HomepageController.getHomepageData` (`backend/src/module/homepage/homepage.controller.ts:6-18`) | Global `limiter` | No (PUBLIC) | Public / None | **Query:** `page?: number` (default 1), `limit?: number` (default 5) | `{ statusCode: 200, success: true, message: "Homepage data retrieved successfully", data: { settings, featuredPost, recentPosts, sidebarRecentPosts, pagination, totalPosts, categories, tags } }` | `SiteSettings`, `Post`, `Category`, `Tag` (Aggregated via `Promise.all` in `homepage.service.ts:11-20`) | None |

---

### 2.11 About Page Resource (`/api/v1/about`)
*Mount Point:* `app.use("/api/v1/about", aboutRoutes);` (`backend/src/app.ts:65`)

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/about` | `backend/src/module/about/about.route.ts:7` | `AboutController.getAboutPage` (`backend/src/module/about/about.controller.ts:5-13`) | Global `limiter`. **NOTE:** Controller does NOT use `catchAsync` wrapper! | No (PUBLIC) | Public / None | None | `{ statusCode: 200, success: true, message: "About page data retrieved successfully", data: AboutPage }` | `AboutPage` (`(prisma as any).aboutPage.findUnique`, `create` fallback) | None |
| `PUT` | `/api/v1/about` | `backend/src/module/about/about.route.ts:8` | `AboutController.updateAboutPage` (`backend/src/module/about/about.controller.ts:15-23`) | Global `limiter`, `auth`, `authorize("ADMIN")` (`auth.ts:55-67`). **NO Zod validation schema.** Controller lacks `catchAsync`. | Yes (ADMIN-ONLY) | **ADMIN ONLY (Enforced via `authorize("ADMIN")`)** | **Body:** `{ name, designation, phone, email, biography, profileImage, signatureImage, skills }` | `{ statusCode: 200, success: true, message: "About page updated successfully", data: AboutPage }` | `AboutPage` (`(prisma as any).aboutPage.findUnique`, `create` / `update`) | None (Sanitizes biography with `sanitizeHtml`) |

---

### 2.12 Direct App & System Endpoints (`/api/v1/health`, `/`)
*Mount Point:* Direct Express application routes in `backend/src/app.ts:66-79`

| Method | Full path | File:line | Handler/controller | Middleware applied | Auth required? | Role required | Request params/query/body | Response shape | DB models touched | External services |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/health` | `backend/src/app.ts:66-73` | Inline Express arrow function | Global `limiter` | No (PUBLIC) | Public / None | None | `{ success: true, message: "🟢 Zibon-Vlog API is running", timestamp: string, environment: string }` | None | None |
| `GET` | `/` | `backend/src/app.ts:74-79` | Inline Express arrow function | None (Above `/api/v1/` rate limiter prefix) | No (PUBLIC) | Public / None | None | `{ success: true, message: "Welcome to Zibon-Vlog API" }` | None | None |

---

## 3. Explicit Security Classification Summary

```
┌────────────────────────────────────────────────────────┐
│ TOTAL ENDPOINTS: 38                                     │
├───────────────────────────────┬────────────────────────┤
│ Public                        │ 17 endpoints (44.7%)   │
│ Authenticated User (Legit)    │  2 endpoints ( 5.3%)   │
│ Admin Actions Missing RBAC    │ 18 endpoints (47.4%)   │
│ Admin Enforced RBAC           │  1 endpoint  ( 2.6%)   │
│ Dead / Unused by Frontend UI  │  6 endpoints (15.8%)   │
└───────────────────────────────┴────────────────────────┘
```

---

## 4. Critical Security Findings: Admin-Type Actions Missing Role Checks

The table below lists every admin-level destructive or privileged action in the system that lacks the `authorize("ADMIN")` middleware check.

| Endpoint | File:line | Intended Privilege | Current Guard | Risk Description |
|---|---|---|---|---|
| `POST /api/v1/posts` | `backend/src/module/post/post.route.ts:22` | Admin Only | `auth` only | Any registered user can publish unauthorized blog posts to the public site. |
| `PATCH /api/v1/posts/:id` | `backend/src/module/post/post.route.ts:28` | Admin Only | `auth` + `authorId` match | Any user who created a post can modify it, but no admin override exists for other admins/users. |
| `DELETE /api/v1/posts/:id` | `backend/src/module/post/post.route.ts:34` | Admin Only | `auth` + `authorId` match | Any user who created a post can delete it. |
| `GET /api/v1/posts/admin/list` | `backend/src/module/post/post.route.ts:7` | Admin Only | `auth` + `authorId` filter | A normal user calling this route gets an empty list or their own drafts, without receiving a 403 Forbidden. |
| `GET /api/v1/posts/admin/:id` | `backend/src/module/post/post.route.ts:8` | Admin Only | `auth` + `authorId` match | Normal users can query draft posts belonging to them. |
| `POST /api/v1/categories` | `backend/src/module/category/category.route.ts:8` | Admin Only | `auth` only | Any logged-in user can create categories that appear in the global site navigation! |
| `PATCH /api/v1/categories/:id` | `backend/src/module/category/category.route.ts:14` | Admin Only | `auth` only | Any logged-in user can alter category slugs and names globally. |
| `DELETE /api/v1/categories/:id` | `backend/src/module/category/category.route.ts:20` | Admin Only | `auth` only | Any logged-in user can delete empty categories. |
| `POST /api/v1/tags` | `backend/src/module/tag/tag.route.ts:10` | Admin Only | `auth` only | Any logged-in user can inject tags into the system. |
| `PATCH /api/v1/tags/:id` | `backend/src/module/tag/tag.route.ts:16` | Admin Only | `auth` only | Any logged-in user can rename tags across the site. |
| `DELETE /api/v1/tags/:id` | `backend/src/module/tag/tag.route.ts:22` | Admin Only | `auth` only | Any logged-in user can delete tags from the system. |
| `POST /api/v1/media/upload` | `backend/src/module/media/media.route.ts:48` | Admin Only | `auth` only | Any logged-in user can upload up to 100MB files to the administrator's Cloudinary account, exhausting bandwidth/storage. |
| `GET /api/v1/media` | `backend/src/module/media/media.route.ts:54` | Admin Only | `auth` only | Any logged-in user can enumerate all private/public assets in Cloudinary. |
| `DELETE /api/v1/media/:id` | `backend/src/module/media/media.route.ts:55` | Admin Only | `auth` only | Any logged-in user can delete any media asset from Cloudinary and the database! |
| `PATCH /api/v1/media/:id/link` | `backend/src/module/media/media.route.ts:61` | Admin Only | `auth` only | Any logged-in user can link media assets to posts. |
| `PATCH /api/v1/site-settings` | `backend/src/module/site-settings/site-settings.route.ts:8` | Admin Only | `auth` only | **CRITICAL:** Any logged-in user can deface the site, overwrite navigation links, change the site name, and disable sidebar widgets! |
| `GET /api/v1/subscribers` | `backend/src/module/subscriber/subscriber.route.ts:12` | Admin Only | `auth` only | **PRIVACY LEAK:** Any logged-in user can extract the full list of newsletter subscriber email addresses. |
| `DELETE /api/v1/subscribers/:id` | `backend/src/module/subscriber/subscriber.route.ts:13` | Admin Only | `auth` only | Any logged-in user can delete subscribers from the database. |

---

## 5. Dead / Unused Endpoints in Frontend

These endpoints exist in the backend router, but frontend search verification confirms they are never requested by any page or component in `frontend/src`:

1. **`GET /api/v1/posts/featured` (`backend/src/module/post/post.route.ts:14`):**
   - *Why unused:* The public homepage retrieves the featured post through the aggregated `GET /api/v1/homepage` endpoint (`frontend/src/app/(homepage)/page.tsx:12`). `postsApi.getFeatured` does not even exist in `frontend/src/lib/api.ts`.
2. **`GET /api/v1/posts/recent-index` (`backend/src/module/post/post.route.ts:15`):**
   - *Why unused:* The homepage recent posts feed is also provided directly by `GET /api/v1/homepage` (`backend/src/module/homepage/homepage.service.ts:15-16`). `postsApi.getRecentIndex` is not defined in `frontend/src/lib/api.ts`.
3. **`PATCH /api/v1/media/:id/link` (`backend/src/module/media/media.route.ts:61`):**
   - *Why unused:* Wrapped in `frontend/src/lib/api.ts:96-97` (`mediaApi.linkToPost`), but a full codebase search across `frontend/src` reveals zero usages in any page or component.
4. **`GET /api/v1/users/profile` (`backend/src/module/user/user.route.ts:20`):**
   - *Why unused:* Wrapped in `frontend/src/lib/api.ts:42` (`authApi.getProfile`), but never called in any React component or page. The frontend instead persists user data in browser `localStorage.getItem("auth_user")` (`frontend/src/store/authStore.ts:50`).
5. **`GET /api/v1/health` (`backend/src/app.ts:66`):**
   - *Why unused:* Standard health probe for hosting / uptime monitors; never invoked by the frontend client.
6. **`GET /` (`backend/src/app.ts:74`):**
   - *Why unused:* Default API root welcome banner; never invoked by the frontend client.

---

## 6. Implementation Gaps & Missing Validation Schemas

1. **Category Module Validation Gaps:**
   - `DELETE /api/v1/categories/:id` has no `validateRequest` middleware (`backend/src/module/category/category.route.ts:20`).
   - `PATCH /api/v1/categories/:id` validates `req.body` but does not validate `req.params.id` as a valid UUID (`backend/src/module/category/category.validation.ts:14-21`).
2. **Tag Module Validation Gaps:**
   - `DELETE /api/v1/tags/:id` has no `validateRequest` middleware (`backend/src/module/tag/tag.route.ts:22`).
   - `PATCH /api/v1/tags/:id` does not validate `req.params.id` (`backend/src/module/tag/tag.validation.ts:12-17`).
3. **Subscriber Module Validation Gaps:**
   - `DELETE /api/v1/subscribers/:id` has no `validateRequest` middleware (`backend/src/module/subscriber/subscriber.route.ts:13`).
4. **About Module Validation Gaps:**
   - `PUT /api/v1/about` has **NO Zod validation schema** at all (`backend/src/module/about/about.route.ts:8`).
   - `backend/src/module/about/` contains no `about.validation.ts` file.
   - `AboutController.getAboutPage` and `AboutController.updateAboutPage` do not use `catchAsync` (`backend/src/module/about/about.controller.ts:5, 15`). In Express 4, an unhandled Promise rejection in these handlers could crash or hang requests.
5. **Comment Module Architecture Inconsistency:**
   - `CommentController` does not use `catchAsync` (`backend/src/module/comment/comment.controller.ts:6, 24`).
   - Manual `try/catch` returns `{ success: false, message: error.message }` directly, bypassing `globalErrorHandler` (`backend/src/middleware/globalErrorHandler.ts:19-93`).
   - Neither `GET` nor `POST` validates the `:id` route parameter.
6. **Media Upload Validation Inconsistency:**
   - `MediaValidation.upload` is defined in `backend/src/module/media/media.validation.ts:3-11`, but is **never applied to `router.post("/upload", ...)`** in `backend/src/module/media/media.route.ts:48-53`.

