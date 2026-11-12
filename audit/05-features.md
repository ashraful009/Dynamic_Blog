# Feature-by-Feature Functionality Map (Phase 6 Audit)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Auditor:** Senior Full-Stack Engineer  
> **Audit Status:** Read-Only Technical Audit — Phase 6 Complete  
> **Scope:** End-to-end evaluation of all 21 features present or attempted in the codebase across frontend pages, backend REST APIs, and database models.

---

## 1. Feature Status Matrix Summary

| # | Feature Name | Implementation Status | Frontend Pages / Components | Backend APIs Touched | Models Touched | Primary Gap or Defect |
|---|--------------|:---------------------:|-----------------------------|----------------------|----------------|-----------------------|
| 1 | **Post CRUD** | **PARTIAL / DEFECTIVE** | `/[year]/[month]/[day]/[slug]`, `/zibon/posts`, `/zibon/posts/new`, `/zibon/posts/[id]/edit` | `POST /posts`, `GET /posts`, `GET /posts/admin/list`, `GET /posts/:slug`, `GET /posts/admin/:id`, `PATCH /posts/:id`, `DELETE /posts/:id` | `Post`, `User`, `Category`, `Tag` | Generates random 8-hex slugs; cross-author edits/deletes blocked even for Admins. |
| 2 | **Draft vs Published** | **COMPLETE** | `/zibon/posts`, `/zibon/posts/new`, `/zibon/posts/[id]/edit` | `GET /posts/admin/list`, `POST /posts`, `PATCH /posts/:id` | `Post`, `PostStatus` | None. Public queries strictly filter `status: "PUBLISHED"`. |
| 3 | **Post Scheduling** | **MISSING / NOT IMPLEMENTED** | None | None | `Post.publishedAt` | No scheduler, no cron worker, no future-date filter in queries. |
| 4 | **Slug Generation & Routing** | **BROKEN** | `postUrl.ts`, `/[year]/[month]/[day]/[slug]` | `POST /posts`, `GET /posts/:slug` | `Post.slug` | `slugify.ts` is ignored for posts; generates random hex strings (`d8a2f4c9`). |
| 5 | **Category Tree & Nav** | **COMPLETE** | `/category/[slug]`, `Header.tsx`, `Sidebar.tsx`, `/zibon/categories` | `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` | `Category`, `Post` | None. Hierarchical subcategories and header toggles work. (No `GET /categories/:id` route exists or is needed). |
| 6 | **Tag System & Tag Cloud** | **COMPLETE** | `/tag/[slug]`, `Sidebar.tsx`, `/zibon/tags` | `GET /tags`, `POST /tags`, `PATCH /tags/:id`, `DELETE /tags/:id` | `Tag`, `Post` | None. Many-to-many tag relations and sidebar count display work. (No `GET /tags/:id` route exists or is needed). |
| 7 | **Search Functionality** | **PARTIAL (ADMIN ONLY)** | `/zibon/posts` (Admin search only) | `GET /posts?search=...` | `Post` | Public frontend has **zero** search input or search results page. |
| 8 | **Pagination** | **COMPLETE** | `(homepage)`, `/category/[slug]`, `/tag/[slug]`, `/zibon/posts` | `GET /posts`, `GET /posts/admin/list`, `GET /media`, `GET /subscribers` | `Post`, `Media`, `Subscriber` | None. Standard offset/limit pagination with metadata. |
| 9 | **Comments & Replies** | **PARTIAL / VULNERABLE** | `CommentsSection.tsx`, `CommentForm.tsx` | `POST /posts/:id/comments`, `GET /posts/:id/comments` | `Comment`, `Post` | Anonymous posting; no moderation panel; no captcha; no rate limits. |
| 10 | **Post Views Counter** | **PARTIAL / UNPROTECTED** | `[year]/[month]/[day]/[slug]`, `DatumIndex.tsx` | `GET /posts/:slug` | `Post.views` | Increments on every request; no IP or cookie deduplication. |
| 11 | **SEO, OpenGraph & Sitemap**| **PARTIAL / HARDCODED** | `layout.tsx`, `robots.ts`, `sitemap.ts`, article reader | `GET /posts?limit=1000` | `Post` | Sitemap and robots contain hardcoded `localhost:3000` URLs. |
| 12 | **RSS / Atom Feed** | **MISSING / NOT IMPLEMENTED** | None | None | None | No RSS XML feed generator exists. |
| 13 | **Media Library & Upload** | **BROKEN (DISK LEAK)** | `/zibon/media`, `EditorMediaModal.tsx` | `POST /media/upload`, `GET /media`, `DELETE /media/:id`, `PATCH /media/:id/link` | `Media`, `Post` | Files uploaded to `backend/tmp/` are **never deleted** from server disk! |
| 14 | **Rich-Text Editor** | **COMPLETE** | `/zibon/posts/new`, `/zibon/posts/[id]/edit`, `/zibon/about` | TipTap client-side -> saved via standard post APIs | `Post.content`, `AboutPage.biography` | None. Full TipTap suite with custom resizable image & video nodes. |
| 15 | **Auth & Profiles** | **PARTIAL** | `/login`, `/register`, `/zibon/settings` | `POST /auth/*`, `GET /users/profile`, `PATCH /users/profile` | `User` | No password change, no email change, no password reset workflow. |
| 16 | **Newsletter Subscription**| **COMPLETE (LEAD GEN)** | `Sidebar.tsx`, `DatumNewsletter.tsx`, `/zibon/subscribers` | `POST /subscribers`, `GET /subscribers`, `DELETE /subscribers/:id` | `Subscriber` | Email capture only; no email broadcast / sender integration. |
| 17 | **Homepage Customizer** | **COMPLETE** | `(homepage)`, `Header.tsx`, `Footer.tsx`, `Sidebar.tsx`, `/zibon/homepage` | `GET /site-settings`, `PATCH /site-settings`, `GET /homepage` | `SiteSettings`, `Post` | Singleton settings with live editing of hero, Goodreads, widgets, and links. |
| 18 | **Author About Page** | **COMPLETE** | `/about`, `/zibon/about` | `GET /about`, `PUT /about` | `AboutPage`, `SiteSettings` | Rich bio, portrait, signature, and animated circular skill bars. |
| 19 | **Admin Dashboard Metrics** | **BROKEN (LOGIC BUG)** | `/zibon/dashboard` | `GET /posts/admin/list?limit=5` | `Post` | Computes published and draft totals from a 5-item slice! |
| 20 | **Anti-Copy Protection** | **PARTIAL / INEFFECTIVE**| `ContentProtector.tsx` on all SSR pages | None | None | Client-side only; easily bypassed via curl, DevTools, or disabling JS. |
| 21 | **Post Likes / Reactions** | **MISSING / NOT IMPLEMENTED** | None | None | None | No schema or endpoints. |

---

## 2. In-Depth Feature Audits

---

### Feature 1: Post CRUD
- **Status:** **PARTIAL / DEFECTIVE**
- **Public Reader Page:** `frontend/src/app/(public)/[year]/[month]/[day]/[slug]/page.tsx:1-258`
- **Admin Pages:**
  - Index: `frontend/src/app/zibon/(dashboard)/posts/page.tsx:1-285`
  - Create: `frontend/src/app/zibon/(dashboard)/posts/new/page.tsx:1-278`
  - Edit: `frontend/src/app/zibon/(dashboard)/posts/[id]/edit/page.tsx:1-285`
- **APIs:**
  - `POST /api/v1/posts` (`post.controller.ts:7-16`, `post.route.ts:22-27`)
  - `GET /api/v1/posts` (`post.controller.ts:18-34`, `post.route.ts:16`)
  - `GET /api/v1/posts/admin/list` (`post.controller.ts:61-76`, `post.route.ts:7`)
  - `GET /api/v1/posts/:slug` (`post.controller.ts:78-92`, `post.route.ts:17-21`)
  - `GET /api/v1/posts/admin/:id` (`post.controller.ts:94-104`, `post.route.ts:8-13`)
  - `PATCH /api/v1/posts/:id` (`post.controller.ts:106-116`, `post.route.ts:28-33`)
  - `DELETE /api/v1/posts/:id` (`post.controller.ts:118-128`, `post.route.ts:34-39`)
- **Models:** `Post`, `User`, `Category`, `Tag`, `Media`
- **Audit Findings & Defects:**
  1. **Random Hex Slug Generation:** In `backend/src/module/post/post.service.ts:26-31`, `createPost` generates slugs using `crypto.randomBytes(4).toString("hex")` (e.g. `d8a2f4c9`), completely ignoring the article title!
  2. **Multi-Admin Permission Lock:** In `backend/src/module/post/post.service.ts:415-417` and `487-489`, `updatePost` and `deletePost` enforce `if (existingPost.authorId !== authorId) throw new ApiError(403)`. An administrator cannot edit or delete posts created by a previous administrator or author.
  3. **Auto-save LocalStorage Draft:** `posts/new/page.tsx:55` auto-saves drafts to `localStorage.getItem("zibon_vlog_draft_post")`.

---

### Feature 2: Draft vs Published Workflow
- **Status:** **COMPLETE**
- **Admin Pages:** `/zibon/posts`, `/zibon/posts/new`, `/zibon/posts/[id]/edit`
- **APIs:** `GET /posts/admin/list`, `POST /posts`, `PATCH /posts/:id`
- **Models:** `Post`, `enum PostStatus { DRAFT, PUBLISHED }`
- **Audit Findings:**
  - Public endpoints strictly filter `status: "PUBLISHED"` (`post.service.ts:108, 224, 226, 351`).
  - Transitioning status from `DRAFT` to `PUBLISHED` sets `publishedAt = new Date()` (`post.service.ts:72, 432`).
  - Admin post table allows filtering by status (`ALL`, `PUBLISHED`, `DRAFT`) (`posts/page.tsx:88-100`).

---

### Feature 3: Post Scheduling
- **Status:** **MISSING / NOT IMPLEMENTED**
- **Audit Findings:**
  - The `Post` model has a `publishedAt DateTime?` column (`schema.prisma:91`).
  - However, there is **no scheduling UI**, no cron worker, and no background task runner.
  - Furthermore, `getAllPublished` (`post.service.ts:108`) only filters by `status: "PUBLISHED"` and **does not check** `publishedAt: { lte: new Date() }`. Setting a future date does not prevent immediate public visibility.

---

### Feature 4: Slug Generation & URL Routing
- **Status:** **BROKEN (Random Hex Slugs for New Posts)**
- **Files:** `backend/src/utils/slugify.ts:1-25`, `backend/src/module/post/post.service.ts:26-31`, `frontend/src/utils/postUrl.ts:1-12`
- **Audit Findings:**
  - `slugify.ts` contains a high-quality Unicode-aware slugifier supporting Bengali script (`\p{L}\p{M}\p{N}`).
  - However, `post.service.ts` **does not use `slugify()`** when creating posts! Lines 26-31 generate random 8-character hex strings:
    ```ts
    let slug = crypto.randomBytes(4).toString("hex");
    ```
  - Pre-seeded posts from `seed.ts` have clean slugs (`the-devotion-of-suspect-x`), but newly authored posts in the admin panel receive slugs like `a7f92b10`.
  - Frontend canonical route `frontend/src/utils/postUrl.ts:6-10` builds URLs in the format `/${year}/${month}/${day}/${slug}` using the post's `publishedAt` date.

---

### Feature 5: Category Hierarchy & Navigation (বিষয় নির্বাচন)
- **Status:** **COMPLETE**
- **Public Pages:** `frontend/src/app/(public)/category/[slug]/page.tsx`, `Header.tsx`, `Sidebar.tsx`
- **Admin Pages:** `frontend/src/app/zibon/(dashboard)/categories/page.tsx`
- **APIs:** `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`
- **Models:** `Category`, `Post`
- **Audit Findings:**
  - Supports self-referential parent-child subcategories (`Category.parentId`).
  - Includes a `showInHeader` boolean flag: Categories with `showInHeader: true` are dynamically rendered in the main top header navigation (`Header.tsx:50-52`).
  - Fallback logic in `Header.tsx:54-65`: If no categories are marked `showInHeader`, the top 4 root categories are shown.
  - Category archive page `/category/[slug]` queries posts belonging to the target category **and all of its child subcategories** (`post.service.ts:125-131`).

---

### Feature 6: Tag System & Tag Cloud (ট্যাগসমূহ)
- **Status:** **COMPLETE**
- **Public Pages:** `frontend/src/app/(public)/tag/[slug]/page.tsx`, `Sidebar.tsx`
- **Admin Pages:** `frontend/src/app/zibon/(dashboard)/tags/page.tsx`, `PostTagSelect.tsx`
- **APIs:** `GET /tags`, `POST /tags`, `PATCH /tags/:id`, `DELETE /tags/:id`
- **Models:** `Tag`, `Post`
- **Audit Findings:**
  - Implements a many-to-many relationship (`_PostTags`).
  - `GET /tags` returns all tags with aggregate post counts (`_count: { posts: true }`) (`tag.service.ts:32`).
  - Public sidebar (`Sidebar.tsx:320-370`) renders a literary tag cloud with dynamic font sizing based on article count.

---

### Feature 7: Search Functionality
- **Status:** **PARTIAL (ADMIN ONLY — NO PUBLIC UI)**
- **Audit Findings:**
  - Backend `GET /api/v1/posts?search=...` filters by `title` or `excerpt` contains (`post.service.ts:112-115`).
  - Admin posts management table (`/zibon/posts/page.tsx:77-83`) provides a search input that live-filters posts.
  - **The Public Reader Site has NO search bar anywhere.** Header, sidebar, and homepage lack any search input or search results route.

---

### Feature 8: Pagination
- **Status:** **COMPLETE**
- **Pages:** `(homepage)/page.tsx`, `category/[slug]/page.tsx`, `tag/[slug]/page.tsx`, `/zibon/posts`
- **APIs:** `GET /posts`, `GET /posts/admin/list`, `GET /media`, `GET /subscribers`
- **Models:** `Post`, `Media`, `Subscriber`
- **Audit Findings:**
  - Backend uses standard SQL offset/limit: `skip = (page - 1) * limit`.
  - API responses return metadata `{ page, limit, total, totalPages }`.
  - Public frontend `PostFeed.tsx:32-36` constructs clean query param pagination links (`?page=2`).

---

### Feature 9: Comments & Threaded Replies
- **Status:** **PARTIAL / VULNERABLE TO SPAM**
- **Public Components:** `frontend/src/components/public/post/CommentsSection.tsx:1-129`, `CommentForm.tsx:1-132`
- **APIs:** `POST /posts/:id/comments`, `GET /posts/:id/comments` (`comment.route.ts:6-7`)
- **Models:** `Comment`, `Post`
- **Audit Findings & Gaps:**
  1. **Threaded Hierarchy:** Implements nested self-referential replies via `Comment.parentId`. Backend constructs a recursive tree structure (`comment.service.ts:40-55`).
  2. **Zero Moderation:** There is no admin comments page (`/zibon/comments` does not exist). Admins cannot review, approve, or delete comments.
  3. **Zero Anti-Spam Protection:** Comments are completely anonymous (no authentication required). There is no captcha, turnstile, or rate limiter on `POST /posts/:id/comments`. Anyone can flood the database with automated spam.

---

### Feature 10: Post Views Counter & Metrics
- **Status:** **PARTIAL / UNPROTECTED**
- **Components:** `[year]/[month]/[day]/[slug]/page.tsx`, `DatumIndex.tsx`, `dashboard/page.tsx`
- **APIs:** `GET /posts/:slug` (`post.service.ts:354-359`)
- **Models:** `Post.views`
- **Audit Findings:**
  - Views increment atomically on the database: `views: { increment: 1 }`.
  - Executed asynchronously in `post.service.ts:354-359` without blocking the HTTP response.
  - **Defect:** No IP address, user agent, or cookie deduplication exists. Refreshing an article 100 times increments views by 100.

---

### Feature 11: SEO Metadata, OpenGraph & Dynamic Sitemap
- **Status:** **PARTIAL / HARDCODED LOCALHOST URLS**
- **Files:** `frontend/src/app/layout.tsx:5-32`, `robots.ts:1-11`, `sitemap.ts:1-30`, `[year]/[month]/[day]/[slug]/page.tsx:45-75`
- **Models:** `Post`
- **Audit Findings & Defects:**
  1. **Dynamic Metadata:** Article reader page generates comprehensive OpenGraph and Twitter cards based on `metaTitle`, `metaDescription`, and `ogImage`.
  2. **JSON-LD Schema:** Injects structured data (`BlogPosting`) with author, datePublished, and headline (`page.tsx:88-105`).
  3. **Hardcoded URLs:**
     - `sitemap.ts:4`: `const baseUrl = "http://localhost:3000";`
     - `sitemap.ts:14`: `fetch("http://localhost:5000/api/v1/posts?limit=1000")`
     - `robots.ts:9`: `sitemap: "http://localhost:3000/sitemap.xml"`
     In production, the sitemap generator attempts to fetch from localhost:5000 and outputs localhost:3000 URLs.
  4. **Admin URL Disclosure:** `robots.ts:7` contains `disallow: ["/zibon/", "/api/"]`, publicly leaking the admin panel path to web crawlers.

---

### Feature 12: RSS / Atom Feed
- **Status:** **MISSING / NOT IMPLEMENTED**
- **Audit Findings:**
  - Neither Next.js (`frontend/src/app/feed.xml` / `rss.xml`) nor Express (`/api/v1/rss`) implements an RSS feed.

---

### Feature 13: Media Library & File Upload
- **Status:** **BROKEN (Server Disk Leak)**
- **Admin Page:** `frontend/src/app/zibon/(dashboard)/media/page.tsx:1-218`
- **Components:** `EditorMediaModal.tsx`
- **APIs:** `POST /media/upload`, `GET /media`, `DELETE /media/:id`, `PATCH /media/:id/link`
- **Models:** `Media`, `Post`
- **Audit Findings & Defects:**
  1. **Cloudinary Storage:** Assets uploaded to Cloudinary with auto-format and auto-quality transformations.
  2. **Video Streaming:** Videos generate HLS adaptive streaming `.m3u8` playlists (`uploadImage.ts:58-61`).
  3. **Disk Space Leak (Critical):** `backend/src/module/media/media.service.ts:7-44` fails to call `fs.unlink()` after uploading files from `backend/tmp/`. All uploaded media files permanently accumulate on the server's hard drive until disk exhaustion occurs.

---

### Feature 14: Rich-Text Editor (TipTap)
- **Status:** **COMPLETE**
- **Components:** `frontend/src/components/editor/Editor.tsx:1-101`, `Toolbar.tsx`, `ResizableImageComponent.tsx`, `ResizableVideoComponent.tsx`
- **Audit Findings:**
  - Feature-complete TipTap implementation including StarterKit, Underline, TextAlign, Link, TextStyle, Color, Highlight, FontFamily, and custom FontSize extensions.
  - Custom React NodeViews for resizable, draggable images and videos with responsive float alignments (`data-float="left"`, `"right"`, `"center"`).
  - Integrated with `EditorMediaModal.tsx` allowing one-click insertion of assets from the Cloudinary media library.
  - Backend sanitizes incoming HTML via `isomorphic-dompurify` (`sanitize.ts:1-39`).

---

### Feature 15: User Authentication & Profiles
- **Status:** **PARTIAL**
- **Pages:** `/login`, `/register`, `/zibon/settings`
- **APIs:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /users/profile`, `PATCH /users/profile`
- **Models:** `User`
- **Audit Findings & Gaps:**
  - Profile update (`PATCH /users/profile`) allows editing `name` and `avatar`.
  - **Gaps:** No password change feature; no email change feature; no "Forgot Password" or email reset token workflow exists.

---

### Feature 16: Newsletter Subscription (Lead Generation)
- **Status:** **COMPLETE (LEAD GEN)**
- **Public Components:** `Sidebar.tsx:30-49`, `DatumNewsletter.tsx:9-26`
- **Admin Page:** `/zibon/subscribers/page.tsx:1-85`
- **APIs:** `POST /subscribers`, `GET /subscribers`, `DELETE /subscribers/:id`
- **Models:** `Subscriber`
- **Audit Findings:**
  - Visitors can submit emails via sidebar or homepage newsletter section.
  - Validates email syntax and rejects duplicates via unique constraint.
  - Admin panel lists subscribers with creation timestamps and delete action.
  - **Limitation:** Solely a database subscriber list. There is no email broadcast or campaign sending integration (no SendGrid, Resend, or Mailgun).

---

### Feature 17: Dynamic Homepage & Layout Customizer
- **Status:** **COMPLETE**
- **Public Components:** `(homepage)/page.tsx`, `Header.tsx`, `Footer.tsx`, `Sidebar.tsx`
- **Admin Page:** `/zibon/homepage/page.tsx:1-137`
- **APIs:** `GET /site-settings`, `PATCH /site-settings`, `GET /homepage`
- **Models:** `SiteSettings`, `Post`
- **Audit Findings:**
  - Admin panel provides a tabbed live configuration interface:
    1. **Hero Editor:** Title, subtitle, coordinate watermark, CTA buttons, and background banner image.
    2. **Featured Post Selector:** Manually selects a post or defaults to the latest published post.
    3. **Sidebar Widgets Editor:** Toggles for About widget, Goodreads reading list, recent posts, categories, and tags. Includes JSON editor for Goodreads reading list.
    4. **Newsletter Editor:** Customizes newsletter section copy and disclaimers.
    5. **Header & Footer Editor:** Brand name, subtitle, and dynamic footer links array.

---

### Feature 18: Author About Page & Skill Visualization
- **Status:** **COMPLETE**
- **Public Page:** `frontend/src/app/(public)/about/page.tsx:1-146`
- **Admin Page:** `frontend/src/app/zibon/(dashboard)/about/page.tsx:1-248`
- **APIs:** `GET /about`, `PUT /about`
- **Models:** `AboutPage`, `SiteSettings`
- **Audit Findings:**
  - Displays author portrait, biography, designation, contact info, and signature graphic.
  - Renders interactive circular SVG skill bars (`CircularSkillBar.tsx`) that animate from 0% to the target percentage when scrolled into viewport using `IntersectionObserver`.
  - Admin panel allows editing biography via TipTap editor and adding/editing skills and percentages.

---

### Feature 19: Admin Dashboard Analytics
- **Status:** **BROKEN (Sample Calculation Bug)**
- **Admin Page:** `frontend/src/app/zibon/(dashboard)/dashboard/page.tsx:1-213`
- **APIs:** `GET /posts/admin/list?limit=5` (`postsApi.getAllAdmin({ limit: 5 })` at line 20, `frontend/src/lib/api.ts:76`)
- **Models:** `Post`
- **Audit Findings & Severe Defect:**
  - Dashboard renders 4 StatCards: "Total Posts", "Published", "Drafts", and "This Week".
  - Line 20 queries only a 5-post slice: `postsApi.getAllAdmin({ limit: 5 })`.
  - Lines 55-80 compute "Published", "Drafts", and "This Week" by calling `.filter()` on `posts` (the 5 items returned)!
  - **Result:** If the database contains 1,000 published articles and 50 drafts, the dashboard will display Published: 4 or 5 and Drafts: 0 or 1. All metric cards except "Total Posts" display completely false statistics.

---

### Feature 20: Client-Side Anti-Copy Protection
- **Status:** **PARTIAL / INEFFECTIVE SECURITY**
- **Component:** `frontend/src/components/public/ContentProtector.tsx:1-66`
- **Audit Findings:**
  - Mounted across all public SSR pages.
  - Injects CSS `user-select: none` and blocks keyboard shortcuts (`Ctrl+C`, `Ctrl+P`, `Ctrl+S`, `Ctrl+U`, `F12`, `Ctrl+Shift+I/J/C`).
  - Provides zero real protection: all articles are delivered in plaintext SSR HTML (viewable via `curl` or disabling JavaScript).

