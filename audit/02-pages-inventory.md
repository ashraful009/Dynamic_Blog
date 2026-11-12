# Complete Page & Route Inventory (Phase 3 Audit)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Auditor:** Senior Full-Stack Engineer  
> **Audit Status:** Read-Only Technical Audit — Phase 3 Complete  
> **Scope:** Every Next.js App Router route, layout, public component, admin component, navigation flow, and boundary linkage.

---

## 1. Executive Summary: Frontend Architecture

The frontend is a single monolithic **Next.js 16.2.10** (with **React 19.2.4**, verified in `frontend/package.json:27-28` and `frontend/package-lock.json`) application located in `frontend/src/app/` using the App Router. It simultaneously hosts two completely different applications inside one project:
1. **The Public Reader Site:** 7 public routes (home, about, category archive, tag archive, post slug reader, login, register).
2. **The Admin Panel:** 12 routes (1 root redirect `/zibon` + 11 dashboard pages) housed under the `/zibon` URL path hierarchy.

```
frontend/src/app/
├── layout.tsx                     <- Global RootLayout (Mounts Header globally!)
├── globals.css                    <- Shared Tailwind CSS & theme tokens
├── favicon.ico
├── robots.ts                      <- SEO robots definition (disallows /zibon/, /api/)
├── sitemap.ts                     <- Dynamic sitemap generator
│
├── (homepage)/                    <- Public Route Group 1
│   ├── layout.tsx                 <- Fragment layout
│   └── page.tsx                   <- / (Homepage SSR)
│
├── (public)/                      <- Public Route Group 2
│   ├── layout.tsx                 <- PublicLayout (Mounts Footer with "Admin Portal" link!)
│   ├── about/page.tsx             <- /about (About Author SSR)
│   ├── category/[slug]/page.tsx   <- /category/[slug] (Category archive SSR)
│   ├── tag/[slug]/page.tsx        <- /tag/[slug] (Tag archive SSR)
│   ├── [year]/[month]/[day]/[slug]/page.tsx <- /[year]/[month]/[day]/[slug] (Article reader SSR)
│   ├── login/page.tsx             <- /login (CSR Login form)
│   └── register/page.tsx          <- /register (CSR Register form)
│
└── zibon/                         <- Admin Route Group (Under /zibon URL prefix)
    ├── layout.tsx                 <- Base AdminLayout (metadata: noindex, nofollow)
    ├── page.tsx                   <- /zibon (Redirects unconditionally to /zibon/dashboard)
    └── (dashboard)/
        ├── layout.tsx             <- DashboardLayout (Wraps in <AuthGuard> + <AdminSidebar>)
        ├── dashboard/page.tsx     <- /zibon/dashboard (Analytics & recent posts CSR)
        ├── homepage/page.tsx      <- /zibon/homepage (Hero, site settings, layout editor CSR)
        ├── posts/page.tsx         <- /zibon/posts (Posts list & management CSR)
        ├── posts/new/page.tsx     <- /zibon/posts/new (TipTap post creation CSR)
        ├── posts/[id]/edit/page.tsx <- /zibon/posts/[id]/edit (Post editing CSR)
        ├── categories/page.tsx    <- /zibon/categories (Category tree management CSR)
        ├── tags/page.tsx          <- /zibon/tags (Tag CRUD CSR)
        ├── subscribers/page.tsx   <- /zibon/subscribers (Newsletter list CSR)
        ├── media/page.tsx         <- /zibon/media (Cloudinary media library CSR)
        ├── about/page.tsx         <- /zibon/about (Author bio editor CSR)
        └── settings/page.tsx      <- /zibon/settings (Admin profile CSR)
```

### Key Architectural Characteristics
- **Total Registered Page Routes:** 19 distinct pages (7 public editorial/auth, 1 server redirect route `/zibon`, 11 admin dashboard pages).
- **Total Layouts:** 5 layouts (`layout.tsx`, `(homepage)/layout.tsx`, `(public)/layout.tsx`, `zibon/layout.tsx`, `zibon/(dashboard)/layout.tsx`).
- **Rendering Strategy Split:**
  - **Public Editorial Pages:** 5 SSR pages configured with `export const dynamic = "force-dynamic"`, using native `fetch()` with `cache: "no-store"`.
  - **Public Auth Pages:** 2 CSR pages (`/login`, `/register`) marked with `"use client"`.
  - **Admin Panel Pages:** 10 CSR pages marked with `"use client"` utilizing TanStack React Query and Axios (`@/lib/api`), plus 1 Server Redirect route (`/zibon`).

---

## 2. Complete Page & Route Inventory Table

| # | URL Path | File Path & Lines | Access Type | Who Can Access | Layout Used | Data Fetched (SSR / CSR) | Forms / Actions Triggered | Components Used |
|---|----------|-------------------|-------------|----------------|-------------|--------------------------|---------------------------|-----------------|
| **1** | `/` | `frontend/src/app/(homepage)/page.tsx:1-63` | Public | Guest / Any | `RootLayout` (`layout.tsx:33`), `(homepage)/layout.tsx:1` | **SSR (`force-dynamic`):**<br>`GET ${apiUrl}/homepage?page=${page}&limit=5` (`page.tsx:15-18`) | Pagination navigation | `ContentProtector`, `DatumHero`, `DatumFeatured`, `DatumIndex`, `PostFeed`, `Sidebar`, `DatumNewsletter`, `DatumFooter` |
| **2** | `/about` | `frontend/src/app/(public)/about/page.tsx:1-146` | Public | Guest / Any | `RootLayout` (`layout.tsx:33`), `PublicLayout` (`(public)/layout.tsx:3`) | **SSR (`force-dynamic`):**<br>`GET ${apiUrl}/about` (`page.tsx:10-18`)<br>`GET ${apiUrl}/site-settings` (`page.tsx:21-29`) | None (Read-only bio) | `ContentProtector`, `CircularSkillBar`, `ProseRenderer`, `DatumFooter`, `Footer` (via `(public)/layout.tsx`) |
| **3** | `/category/[slug]` | `frontend/src/app/(public)/category/[slug]/page.tsx:1-137` | Public | Guest / Any | `RootLayout` (`layout.tsx:33`), `PublicLayout` (`(public)/layout.tsx:3`) | **SSR (`force-dynamic`):**<br>`GET ${apiUrl}/homepage` (`page.tsx:24`)<br>`GET ${apiUrl}/posts?categorySlug=${slug}&page=${page}&limit=10` (`page.tsx:13`) | Category pagination | `ContentProtector`, `DatumHero`, `PostFeed`, `Sidebar`, `Footer` (via `(public)/layout.tsx`) |
| **4** | `/tag/[slug]` | `frontend/src/app/(public)/tag/[slug]/page.tsx:1-137` | Public | Guest / Any | `RootLayout` (`layout.tsx:33`), `PublicLayout` (`(public)/layout.tsx:3`) | **SSR (`force-dynamic`):**<br>`GET ${apiUrl}/homepage` (`page.tsx:24`)<br>`GET ${apiUrl}/posts?tagSlug=${slug}&page=${page}&limit=10` (`page.tsx:13`) | Tag pagination | `ContentProtector`, `DatumHero`, `PostFeed`, `Sidebar`, `Footer` (via `(public)/layout.tsx`) |
| **5** | `/[year]/[month]/[day]/[slug]` | `frontend/src/app/(public)/[year]/[month]/[day]/[slug]/page.tsx:1-258` | Public | Guest / Any | `RootLayout` (`layout.tsx:33`), `PublicLayout` (`(public)/layout.tsx:3`) | **SSR (`force-dynamic`):**<br>`GET ${apiUrl}/posts/${slug}` (`page.tsx:18`)<br>`GET ${apiUrl}/homepage` (`page.tsx:37`)<br>**CSR (Client Component):**<br>`GET /posts/:id/comments` (`CommentsSection.tsx:28`) | - Post comment (`POST /posts/:id/comments` via `CommentForm.tsx:32`)<br>- Newsletter subscribe (`POST /subscribers` via `Sidebar.tsx:41`) | `ContentProtector`, `DatumHero`, `Sidebar`, `PostProse`, `CommentsSection`, `CommentForm`, `Footer` (via `(public)/layout.tsx`) |
| **6** | `/login` | `frontend/src/app/(public)/login/page.tsx:1-107` | Public (Redirects if authed) | Guest / Unauthenticated | `RootLayout` (`layout.tsx:33`), `PublicLayout` (`(public)/layout.tsx:3`) | **CSR (`"use client"`):**<br>None on mount; reads `authStore` | - User login (`POST /api/v1/auth/login` via `authApi.login`)<br>- Redirect to `/zibon/dashboard` if role == "ADMIN", else `/` (`login/page.tsx:43`) | `AuthWrapper`, `Input`, `Button`, `Eye`, `EyeOff`, `Mail`, `Lock` |
| **7** | `/register` | `frontend/src/app/(public)/register/page.tsx:1-114` | Public (Redirects if authed) | Guest / Unauthenticated | `RootLayout` (`layout.tsx:33`), `PublicLayout` (`(public)/layout.tsx:3`) | **CSR (`"use client"`):**<br>None on mount; reads `authStore` | - User registration (`POST /api/v1/auth/register` via `authApi.register`)<br>- Redirect to `/` (`register/page.tsx:42`) | `AuthWrapper`, `Input`, `Button`, `Eye`, `EyeOff`, `Mail`, `Lock`, `User` |
| **8** | `/zibon` | `frontend/src/app/zibon/page.tsx:1-4` | Protected (Server Redirect) | Any (Redirects unconditionally) | `RootLayout` (`layout.tsx:33`), `AdminLayout` (`zibon/layout.tsx:6`) | **SSR:** None | Redirects via `redirect("/zibon/dashboard")` (`page.tsx:3`) | None |
| **9** | `/zibon/dashboard` | `frontend/src/app/zibon/(dashboard)/dashboard/page.tsx:1-213` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` (`(dashboard)/layout.tsx:7`) | **CSR (`"use client"`):**<br>`GET /posts/admin/list?limit=5` via `postsApi.getAllAdmin()` (`page.tsx:20`, `lib/api.ts:76`) | Navigation to post edit or create | `AuthGuard`, `AdminSidebar`, `StatCard`, `FileText`, `Eye`, `TrendingUp`, `Clock`, `ArrowRight` |
| **10** | `/zibon/homepage` | `frontend/src/app/zibon/(dashboard)/homepage/page.tsx:1-137` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /site-settings` via `siteSettingsApi.get()` (`page.tsx:22`) | - Update site settings (`PATCH /site-settings` via `siteSettingsApi.update()` at `page.tsx:33`, `lib/api.ts:102`) | `AuthGuard`, `AdminSidebar`, `HeroEditor`, `HeroImageEditor`, `FeaturedPostSelector`, `SidebarEditor`, `NewsletterEditor`, `HeaderFooterEditor` |
| **11** | `/zibon/posts` | `frontend/src/app/zibon/(dashboard)/posts/page.tsx:1-285` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /posts/admin/list` via `postsApi.getAllAdmin()` (`page.tsx:28`, `lib/api.ts:76`) | - Delete post (`DELETE /posts/:id` via `postsApi.delete()` at `page.tsx:37`)<br>- Filter by status/category<br>- Search posts | `AuthGuard`, `AdminSidebar`, `Search`, `Plus`, `ExternalLink`, `Edit3`, `Trash2`, `Filter` |
| **12** | `/zibon/posts/new` | `frontend/src/app/zibon/(dashboard)/posts/new/page.tsx:1-278` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /categories` via `categoriesApi.getAll()`<br>`GET /tags` via `tagsApi.getAll()` | - LocalStorage auto-save draft (`zibon_vlog_draft_post` at `page.tsx:55`)<br>- Upload media (`POST /media/upload` via `mediaApi.upload`)<br>- Create post (`POST /posts` via `postsApi.create` at `page.tsx:103`) | `AuthGuard`, `AdminSidebar`, `Editor` (TipTap), `PostMetaFields`, `PostCategorySelect`, `PostTagSelect`, `PostSeoPanel`, `Save`, `Eye` |
| **13** | `/zibon/posts/[id]/edit` | `frontend/src/app/zibon/(dashboard)/posts/[id]/edit/page.tsx:1-285` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /posts/admin/:id` via `postsApi.getById(id)` (`page.tsx:47`, `lib/api.ts:77`)<br>`GET /categories` via `categoriesApi.getAll()`<br>`GET /tags` via `tagsApi.getAll()` | - Upload media (`POST /media/upload`)<br>- Update post (`PATCH /posts/:id` via `postsApi.update(id)` at `page.tsx:85`, `lib/api.ts:79`) | `AuthGuard`, `AdminSidebar`, `Editor` (TipTap), `PostMetaFields`, `PostCategorySelect`, `PostTagSelect`, `PostSeoPanel`, `Save`, `Eye` |
| **14** | `/zibon/categories` | `frontend/src/app/zibon/(dashboard)/categories/page.tsx:1-129` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /categories` via `categoriesApi.getAll()` (`page.tsx:16`) | - Create category (`POST /categories`)<br>- Update category (`PATCH /categories/:id` at `CategoryForm.tsx:61`, `lib/api.ts:126`)<br>- Delete category (`DELETE /categories/:id` at `CategoryTable.tsx:30`) | `AuthGuard`, `AdminSidebar`, `CategoryForm`, `CategoryTable` |
| **15** | `/zibon/tags` | `frontend/src/app/zibon/(dashboard)/tags/page.tsx:1-168` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /tags` via `tagsApi.getAll()` (`page.tsx:24`) | - Create tag (`POST /tags` at `page.tsx:34`)<br>- Update tag (`PATCH /tags/:id` at `page.tsx:32`, `lib/api.ts:134`)<br>- Delete tag (`DELETE /tags/:id` at `page.tsx:49`) | `AuthGuard`, `AdminSidebar`, Tag CRUD Form & Table |
| **16** | `/zibon/subscribers` | `frontend/src/app/zibon/(dashboard)/subscribers/page.tsx:1-85` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /subscribers` via `subscribersApi.getAll()` (`page.tsx:14`) | - Delete subscriber (`DELETE /subscribers/:id` via `subscribersApi.delete(id)` at `page.tsx:21`) | `AuthGuard`, `AdminSidebar`, `SubscriberTable` |
| **17** | `/zibon/media` | `frontend/src/app/zibon/(dashboard)/media/page.tsx:1-218` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /media` via `mediaApi.getAll()` (`page.tsx:19`) | - Upload file (`POST /media/upload` via `mediaApi.upload` at `page.tsx:42`)<br>- Delete media (`DELETE /media/:id` via `mediaApi.delete(id)` at `page.tsx:64`) | `AuthGuard`, `AdminSidebar`, Upload Dropzone, Media Grid, Copy Link Button |
| **18** | `/zibon/about` | `frontend/src/app/zibon/(dashboard)/about/page.tsx:1-248` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>`GET /about` via `aboutApi.get()` (`page.tsx:28`) | - Upload avatar (`POST /media/upload`)<br>- Update about page (`PUT /about` via `aboutApi.update()` at `page.tsx:36`) | `AuthGuard`, `AdminSidebar`, `Editor` (TipTap), Skill list editor, Social links editor |
| **19** | `/zibon/settings` | `frontend/src/app/zibon/(dashboard)/settings/page.tsx:1-120` | Protected (Admin) | Admin (Guarded by client `AuthGuard`) | `RootLayout`, `AdminLayout`, `DashboardLayout` | **CSR (`"use client"`):**<br>None on mount; reads `useAuthStore` | - Update profile name (`PATCH /users/profile` via `authApi.updateProfile` at `page.tsx:32`) | `AuthGuard`, `AdminSidebar`, `UserCircle`, `Mail`, `Shield`, `Save` |

---

## 3. Public-to-Admin Link & Leak Analysis (Refactor Separation Matrix)

The refactoring goal is to guarantee that the public frontend has **NO way to reach, navigate to, or discover the admin panel**. Today, there are multiple explicit navigation pathways, links, redirects, and meta disclosures leading directly from the public site to the admin panel:

### 3.1 Direct Links from Public Site to Admin / Login

| # | Source File & Line | Link / Element Code | Target Destination | Context & User Visibility |
|---|---------------------|---------------------|--------------------|---------------------------|
| **1** | `frontend/src/components/public/Header.tsx:77` | `<Link href={user?.role === "ADMIN" ? "/zibon/dashboard" : "/"} className="...">Dashboard</Link>` | `/zibon/dashboard` | **Top Desktop Navigation:** If the logged-in user in Zustand state has `role: "ADMIN"`, an explicit "Dashboard" button is rendered in the global header. |
| **2** | `frontend/src/components/public/Header.tsx:94` | `<Link href="/login" className="...">Login</Link>` | `/login` | **Top Desktop Navigation:** Rendered for unauthenticated visitors. Points to the login page that redirects directly to `/zibon/dashboard` for admins. |
| **3** | `frontend/src/components/public/Header.tsx:288` | `<Link href={user?.role === "ADMIN" ? "/zibon/dashboard" : "/"} className="...">Dashboard</Link>` | `/zibon/dashboard` | **Mobile Drawer Navigation:** Direct link to `/zibon/dashboard` for admin users. |
| **4** | `frontend/src/components/public/Header.tsx:305` | `<Link href="/login" className="...">Login</Link>` | `/login` | **Mobile Drawer Navigation:** Explicit Login button in mobile slide-out drawer. |
| **5** | `frontend/src/components/public/Footer.tsx:30` | `<li><Link href="/login" className="...">Admin Portal</Link></li>` | `/login` | **Public Footer Column:** Rendered on every public page inside `(public)/layout.tsx:13` with the literal anchor text **"Admin Portal"**! |
| **6** | `frontend/src/app/(public)/login/page.tsx:43` | `if (user.role === "ADMIN") router.push("/zibon/dashboard");` | `/zibon/dashboard` | **Login Form Submission Action:** Redirects immediately into the admin dashboard if the returned user has role `ADMIN`. |
| **7** | `frontend/src/lib/api.ts:25-27` | `if (window.location.pathname.startsWith("/zibon")) window.location.href = "/login";` | `/login` | **Axios 401 Interceptor:** If any API request in `/zibon` fails with 401, hard-redirects the browser to `/login`. |
| **8** | `frontend/src/components/public/Header.tsx:43-45` | `if (pathname?.startsWith("/zibon")) return null;` | N/A (Route coupling) | **Component Coupling:** The public `Header` component explicitly inspects the URL pathname for `"/zibon"` to hide itself. |
| **9** | `frontend/src/app/robots.ts:7` | `disallow: ["/zibon/", "/api/"]` | Disallow rule | **SEO Disallow Rule:** Publicly announces the secret admin route path `/zibon/` to search engines, bots, and curious visitors reading `https://domain.com/robots.txt`. |

---

## 4. Admin-to-Public Navigation Links

The admin panel also maintains direct dependencies and links back to the public frontend:

| # | Source File & Line | Link / Element Code | Target Destination | Context |
|---|---------------------|---------------------|--------------------|---------|
| **1** | `frontend/src/app/zibon/(dashboard)/posts/page.tsx:224` | `<Link href={getPostUrl(post)} target="_blank" title="View live">` | `/[year]/[month]/[day]/[slug]` | Admin posts list table has a "View live" button opening the public blog article in a new tab. |
| **2** | `frontend/src/components/zibon/AuthGuard.tsx:19` | `else if (user?.role !== "ADMIN") router.replace("/");` | `/` | Non-admin users attempting to open `/zibon/*` are kicked out to the public homepage. |
| **3** | `frontend/src/components/zibon/AdminSidebar.tsx:45` | `router.push("/login")` | `/login` | Clicking "Sign Out" in the admin sidebar redirects to `/login`. |
| **4** | `frontend/src/app/(public)/login/page.tsx:26` | `if (isAuthenticated) router.replace("/");` | `/` | Already logged-in users visiting `/login` are redirected to `/`. |
| **5** | `frontend/src/app/(public)/register/page.tsx:27` | `if (isAuthenticated) router.replace("/");` | `/` | Already logged-in users visiting `/register` are redirected to `/`. |

---

## 5. Component Bundling & Boundary Analysis

### 5.1 Are Admin Components Leaking into Public Pages?
- **Inspection Result:** **NO direct component imports.**  
  A regex scan across all files in `frontend/src/app/(homepage)/`, `frontend/src/app/(public)/`, and `frontend/src/components/public/` confirmed that no public page or component imports from `frontend/src/components/zibon/` or `frontend/src/components/editor/`.
- **However, Shared Dependencies Exist in the Bundle:**
  Both public and admin share:
  1. `frontend/src/store/authStore.ts` (Zustand auth store)
  2. `frontend/src/lib/api.ts` (Monolithic Axios client containing admin API methods alongside public ones)
  3. `frontend/src/utils/postUrl.ts` (URL generation utility)
  4. `frontend/src/components/ui/Button.tsx` and `Input.tsx` (Shared UI primitives)
  5. `frontend/src/components/providers/Providers.tsx` (React Query client provider + Toaster)
  6. `frontend/src/app/globals.css` (Tailwind styles)

### 5.2 Root Layout Pollution
In `frontend/src/app/layout.tsx:42`:
```tsx
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```
The public `<Header />` component is mounted at the global root of the Next.js app. Because of this, `Header.tsx` had to add lines 43-45:
```tsx
if (pathname?.startsWith("/zibon")) {
  return null;
}
```
This is a code smell and architectural flaw: the root layout should not mount public chrome that has to actively detect and hide itself on admin routes.

---

## 6. Dead & Orphaned Frontend Components

During the complete audit of `frontend/src/components/`, **5 public post components** were found to be completely unused, dead code. They are declared in `frontend/src/components/public/post/` but are never imported or rendered anywhere in the entire codebase:

| # | Dead Component File | Lines | Declared Purpose | Why It Is Dead |
|---|---------------------|-------|------------------|----------------|
| **1** | `frontend/src/components/public/post/PostHeader.tsx` | 1-85 | Blog post header with breadcrumbs, category badge, publication date, and author avatar. | `[year]/[month]/[day]/[slug]/page.tsx` renders its own inline title, category, and date instead of importing `PostHeader`. |
| **2** | `frontend/src/components/public/post/PostFooter.tsx` | 1-90 | Post footer with tags, author bio card, and share buttons. | `[year]/[month]/[day]/[slug]/page.tsx` renders tags and social share buttons inline or omits author card. |
| **3** | `frontend/src/components/public/post/PostRail.tsx` | 1-46 | Floating left rail with share buttons (Facebook, Twitter, LinkedIn, copy link). | Never imported by article reader page. |
| **4** | `frontend/src/components/public/post/PostSiteHeader.tsx` | 1-28 | Alternate minimal header for post reading layout. | Root `Header.tsx` is used instead. |
| **5** | `frontend/src/components/public/post/PostSiteFooter.tsx` | 1-18 | Alternate minimal footer for post reading layout. | `Footer.tsx` or `DatumFooter.tsx` is used instead. |

In addition:
- `authApi.getProfile` defined in `frontend/src/lib/api.ts:42` (`() => api.get("/users/profile")`) is **never called anywhere in the entire frontend**. No component, hook, or guard ever validates the current session with the backend on page load.

---

## 7. Client-Side Content Protection Analysis

The public frontend implements a client-side anti-copy protection script in `frontend/src/components/public/ContentProtector.tsx:1-66`.

### How It Works:
- Mounted in all 5 public SSR pages:
  - `(homepage)/page.tsx:28`
  - `(public)/about/page.tsx:32`
  - `(public)/category/[slug]/page.tsx:35`
  - `(public)/tag/[slug]/page.tsx:35`
  - `(public)/[year]/[month]/[day]/[slug]/page.tsx:49`
- Injects a `<style>` tag into the DOM with:
  ```css
  body {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  img, video {
    pointer-events: none;
  }
  video {
    pointer-events: auto;
  }
  ```
- Adds event listeners intercepting keyboard shortcuts:
  - `Ctrl/Cmd + C` (Copy -> shows toast "Copying is disabled on this site.")
  - `Ctrl/Cmd + P` (Print)
  - `Ctrl/Cmd + S` (Save page)
  - `Ctrl/Cmd + U` (View Source)
  - `F12` (Open DevTools)
  - `Ctrl/Cmd + Shift + I/J/C` (Open DevTools / Inspect Element)
  - `dragstart` (Prevents dragging images)

### Security Assessment:
This is pure client-side obfuscation. It provides **zero real security**:
1. Anyone disabling JavaScript in the browser bypasses all listeners.
2. The raw HTML content is fully delivered in SSR response payloads (visible via `curl`, `wget`, or View Source).
3. RSS / scraping scripts can read all posts directly from the public REST API (`GET /api/v1/posts`).
4. It degrades accessibility (screen readers, text-to-speech) and frustrates legitimate readers.

---

## 8. Summary of Findings for Phase 3 Split Plan

When splitting the project into **(A) Public Frontend** and **(B) Admin Panel**:
1. **Delete `/zibon` from App (A):** The entire `frontend/src/app/zibon/` folder must be completely deleted from the Public Frontend codebase.
2. **Remove Admin UI Links:**
   - Remove "Dashboard" link from `Header.tsx:77, 288`.
   - Remove "Admin Portal" link from `Footer.tsx:30`.
   - Remove `pathname?.startsWith("/zibon")` checks from `Header.tsx:43` and `api.ts:25`.
   - Remove `/zibon/` from `robots.ts:7`.
3. **Decouple `/login` and `/register`:**
   - In App (A), decide whether regular visitors should even be able to register/login (only needed if comments require auth; currently comments are anonymous!).
   - In App (B), create a dedicated `/login` page specifically for administrators.
4. **Prune Dead Code:** Delete the 5 unused components in `frontend/src/components/public/post/`.
5. **Separate API Clients:** Public site needs only public read endpoints (`/homepage`, `/posts`, `/categories`, `/tags`, `/site-settings`, `/about`, `/subscribers`, `/posts/:id/comments`). Admin panel needs the full administrative API client.

