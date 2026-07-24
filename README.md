<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-TiDB-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center"> Zibon-Vlog</h1>

<p align="center">
  <strong>A full-stack, production-ready dynamic blogging & content management platform</strong><br/>
  Built with Next.js 16, Express.js, Prisma ORM, and TiDB Cloud — designed for academics, writers, and content creators.
</p>

---

##  Table of Contents

- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [Scalability & Architecture](#-scalability--architecture)
- [Tech Stack](#-tech-stack)
- [Screenshots & Visual Walkthrough](#-screenshots--visual-walkthrough)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [License](#-license)

---

##  Project Overview

**Zibon-Vlog** is a dynamic, full-stack CMS (Content Management System) and blogging platform purpose-built for **Dr. Ferdaus Anam Jibon**, an Associate Professor and researcher. The platform serves as a personal academic portfolio and blog — publishing essays, research articles, poetry, and creative writing in both **English** and **Bengali**.

The system features a **public-facing blog** with a magazine-style editorial layout and a **full admin dashboard** for managing every aspect of the site — from composing rich-text posts with embedded media, to organizing hierarchical categories, managing subscribers, and customizing the homepage layout — all without touching a single line of code.

### What Makes It Different

- **Bilingual Support**: Native support for Bengali (বাংলা) and English content with proper Unicode rendering.
- **Fully Dynamic CMS**: Every element on the public site — hero section, sidebar widgets, featured posts, newsletter — is configurable from the admin panel.
- **Content Protection**: Right-click, text selection, copy/paste, and DevTools shortcuts are disabled to protect original academic and creative content.
- **SEO-First Architecture**: Server-side rendering, dynamic meta tags, Open Graph images, auto-generated sitemaps, and semantic URL structures (`/YYYY/MM/DD/slug`).
- **Academic-Grade Rich Editor**: Tiptap-powered editor with resizable media, font controls, text alignment, and inline media library integration.

---

##  Core Features

### Public Site
| Feature | Description |
|---|---|
| **Dynamic Homepage** | CMS-driven hero section, featured post, post feed, and configurable sidebar widgets |
| **Category Navigation** | Two-level hierarchical categories with dropdown menus in the header navbar |
| **Blog Post Pages** | Full-width article layout with cover images, reading time, comments, and related posts rail |
| **About Page** | Dynamic profile page with biography, profile image, and animated circular skill bars |
| **Comment System** | Threaded comments with nested replies (no login required) |
| **Newsletter** | Email subscription with subscriber management in the admin panel |
| **Content Protection** | Disables right-click, copy, print, view-source, and drag on all public pages |
| **SEO Optimization** | Server-rendered meta tags, Open Graph, `robots.txt`, and dynamic `sitemap.xml` |
| **Responsive Design** | Fully responsive layout with mobile navigation drawer |

### Admin Dashboard (`/zibon`)
| Feature | Description |
|---|---|
| **Dashboard Overview** | Stats cards showing total posts, published count, drafts, and weekly activity |
| **Rich Text Editor** | Tiptap-based WYSIWYG editor with font family/size, text formatting, alignment, link/image insertion, and resizable media nodes |
| **Post Management** | Create, edit, publish/draft, feature, and delete blog posts with full SEO metadata control |
| **Category Manager** | CRUD for hierarchical (parent → child) categories with auto-slug generation |
| **Media Library** | Upload images/videos to Cloudinary, browse/search uploaded media, and link media to posts |
| **Homepage Editor** | Tab-based editor for hero section, hero image, featured post, sidebar widgets, newsletter, and header/footer configuration |
| **About Page Editor** | Edit biography, profile image, designation, contact info, and skill bars |
| **Subscriber Management** | View and manage newsletter subscribers |
| **Site Settings** | Global configuration for site name, navigation, footer, and widget visibility toggles |

---

##  Scalability & Architecture

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│       Frontend (Vercel)      │     │     Backend (Render/VPS)     │
│  Next.js 16 App Router       │────▶│  Express.js REST API         │
│  SSR + Client Components     │     │  Modular MVC Architecture    │
│  TailwindCSS 4               │     │  JWT HttpOnly Auth           │
│  React Query + Zustand       │     │  Zod Validation              │
└──────────────────────────────┘     └──────────┬───────────────────┘
                                                 │
                                     ┌───────────▼───────────┐
                                     │   TiDB Cloud (MySQL)  │
                                     │   Prisma ORM          │
                                     │   Serverless Tier     │
                                     └───────────────────────┘
                                                 │
                                     ┌───────────▼───────────┐
                                     │   Cloudinary CDN      │
                                     │   Images & Videos     │
                                     │   Signed URLs         │
                                     │   HLS Streaming       │
                                     └───────────────────────┘
```

| Concern | How It's Handled |
|---|---|
| **Horizontal Scaling** | Frontend on Vercel Edge Network (auto-scaled); Backend is stateless and can be replicated behind a load balancer |
| **Database Scaling** | TiDB Cloud provides MySQL-compatible distributed SQL with automatic horizontal scaling and high availability |
| **Media at Scale** | All media assets are offloaded to Cloudinary CDN — images are auto-optimized (`quality: auto`, `fetch_format: auto`), videos are HLS-transcoded for adaptive streaming |
| **API Rate Limiting** | `express-rate-limit` enforces 100 req/15min per IP (global), 20 req/15min for auth endpoints |
| **Security Headers** | Helmet.js sets CSP, X-Frame-Options, HSTS, and other security headers; Next.js adds Referrer-Policy and Permissions-Policy |
| **Code Modularity** | Backend follows a strict modular pattern: each domain has its own `controller → service → validation → route` files, making it easy to add new modules |
| **Caching Strategy** | Next.js server components use `force-dynamic` + `cache: "no-store"` for real-time content; client components use React Query's intelligent cache with stale-while-revalidate |

---

##  Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16 | React framework with App Router, SSR, and file-based routing |
| **React** | 19 | UI rendering library with Server Components support |
| **TypeScript** | 5 | Static type-checking for improved developer experience and fewer runtime errors |
| **Tailwind CSS** | 4 | Utility-first CSS framework for rapid, consistent UI development |
| **TanStack React Query** | 5 | Asynchronous data fetching with caching, refetching, and optimistic updates |
| **Zustand** | 5 | Lightweight state management for auth store |
| **Tiptap** | 3 | Headless rich-text editor framework with custom nodes for resizable media |
| **Axios** | 1.18 | HTTP client with interceptors for API communication |
| **Lucide React** | 1.23 | Modern icon library with tree-shakeable SVG icons |
| **date-fns** | 4 | Lightweight date formatting and manipulation |
| **react-hot-toast** | 2 | Toast notification system for user feedback |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Express.js** | 4 | Minimalist Node.js web framework for the REST API |
| **TypeScript** | 5 | Type safety across the entire backend codebase |
| **Prisma** | 6 | Type-safe ORM for MySQL with migration management and schema introspection |
| **bcrypt** | 5 | Password hashing with salt rounds for secure authentication |
| **jsonwebtoken** | 9 | JWT token generation and verification for HttpOnly cookie-based auth |
| **Cloudinary** | 2 | Cloud media storage with authenticated uploads, signed URLs, and HLS video transcoding |
| **Zod** | 3 | Schema-based request validation with detailed error messages |
| **Helmet** | 8 | HTTP security headers middleware |
| **express-rate-limit** | 7 | API rate limiting to prevent abuse |
| **DOMPurify** | 3 | Server-side HTML sanitization to prevent XSS in user-submitted rich-text content |
| **Multer** | 1.4 | Multipart form data parsing for file uploads |
| **cookie-parser** | 1.4 | Parse HTTP cookies for JWT auth flow |

### Database & Infrastructure

| Technology | Purpose |
|---|---|
| **TiDB Cloud** | MySQL-compatible serverless database with horizontal scaling |
| **Cloudinary CDN** | Media asset storage, transformation, and delivery |
| **Vercel** | Frontend hosting with Edge Network and automatic deployments |

---

##  Screenshots & Visual Walkthrough

### 1. Public Homepage
![Public Homepage](./docs/screenshots/01-homepage.png)

The main public-facing homepage of the platform. It features:
- A **dual-bar navigation** — the top bar contains the logo and primary links (Home, About, Contact), while the second bar dynamically renders all parent categories (Explore, লেখালেখি, Courses, Newspaper, Research) with dropdown menus for subcategories.
- A **configurable hero section** with a headline, subtitle, CTA buttons, and a profile image — all editable from the admin dashboard.
- Below the hero, a **two-column layout** displays the post feed on the left and sidebar widgets (About, Categories, Tags) on the right.

---

### 2. Admin — Create New Post (Rich Text Editor)
![Admin Post Editor](./docs/screenshots/02-admin-editor.png)

The **New Post** page within the admin panel (`/zibon/posts/new`). Key elements:
- A **Tiptap-powered WYSIWYG editor** with a full toolbar: font family, font size, bold/italic/underline/strikethrough, headings (H1–H4), text alignment (left/center/right/justify), ordered/unordered lists, blockquotes, links, and media embedding.
- A **right sidebar** with metadata fields: cover image (URL or upload), excerpt, category selector with parent grouping, read time, display order for homepage, and a "Mark as featured" toggle.
- **Save Draft** and **Publish** buttons in the top-right corner for workflow control.

---

### 3. Admin — Category Management
![Admin Categories](./docs/screenshots/03-admin-categories.png)

The **Categories** management page (`/zibon/categories`). It shows:
- A **hierarchical table** displaying all categories with their names, slugs, and post counts. Child categories are visually indented under their parent (e.g., Events, Colleagues, Teachers under Explore).
- An **"Add New Category"** form on the right with fields for name, optional slug (auto-generated from name), and a parent category dropdown for creating nested categories.
- Edit and delete actions for each category row.

---

### 4. Admin — Homepage Editor (Hero Section)
![Admin Homepage Editor](./docs/screenshots/04-admin-homepage.png)

The **Homepage** editor (`/zibon/homepage`) with a **tabbed interface** for managing different sections:
- **Hero Section** (active tab): Edit the hero coordinate text, title (supports line breaks), subtitle, primary/secondary button texts and links, and hero panel label.
- Other tabs include **Hero Image**, **Featured Post**, **Sidebar Widgets**, **Newsletter**, and **Header & Footer** — providing granular control over every public-facing element.
- Changes save directly to the `SiteSettings` database model and reflect immediately on the public site.

---

### 5. Admin — Dashboard Overview
![Admin Dashboard](./docs/screenshots/05-admin-dashboard.png)

The **Dashboard** landing page (`/zibon/dashboard`). It provides:
- A personalized **greeting** with the admin's name and time-of-day context.
- **Four stat cards**: Total Posts, Published, Drafts, and This Week's activity — each with a distinct color-coded icon.
- Quick-action buttons: **New Post** and **Manage Posts**.
- A **Recent Posts** widget showing the latest entries, or a call-to-action to create the first post if the blog is empty.
- The **left sidebar** navigation links to all admin modules: Dashboard, Homepage, All Posts, New Post, Categories, Subscribers, Media Library, About Page, and Settings.

---

##  Project Directory Structure

### Frontend (`/frontend`)

```
frontend/
├── public/                          # Static assets (favicon, images)
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (homepage)/              # Homepage route group
│   │   │   ├── layout.tsx           # Homepage-specific layout with custom fonts
│   │   │   └── page.tsx             # Homepage server component (SSR)
│   │   ├── (public)/                # Public routes group
│   │   │   ├── [year]/[month]/[day]/[slug]/
│   │   │   │   └── page.tsx         # Blog post detail page (SEO-friendly URLs)
│   │   │   ├── about/
│   │   │   │   └── page.tsx         # Dynamic About page with skills
│   │   │   ├── category/[slug]/
│   │   │   │   └── page.tsx         # Category archive page
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # User/Admin login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # User registration page
│   │   │   └── layout.tsx           # Public layout wrapper
│   │   ├── zibon/                   # Admin panel routes
│   │   │   ├── (dashboard)/         # Dashboard route group
│   │   │   │   ├── about/           # About page editor
│   │   │   │   ├── categories/      # Category management
│   │   │   │   ├── dashboard/       # Dashboard overview
│   │   │   │   ├── homepage/        # Homepage CMS editor
│   │   │   │   ├── media/           # Media library
│   │   │   │   ├── posts/           # Post management (list, new, edit)
│   │   │   │   │   ├── [id]/        # Edit existing post
│   │   │   │   │   ├── new/         # Create new post
│   │   │   │   │   └── page.tsx     # All posts list
│   │   │   │   ├── settings/        # Site settings
│   │   │   │   ├── subscribers/     # Subscriber management
│   │   │   │   └── layout.tsx       # Dashboard layout with sidebar
│   │   │   ├── layout.tsx           # Admin auth wrapper
│   │   │   └── page.tsx             # Admin redirect
│   │   ├── globals.css              # Global styles & design tokens
│   │   ├── layout.tsx               # Root layout (Header, Providers)
│   │   ├── robots.ts                # Dynamic robots.txt generation
│   │   └── sitemap.ts               # Dynamic sitemap.xml generation
│   ├── components/
│   │   ├── editor/                  # Tiptap rich-text editor
│   │   │   ├── Editor.tsx           # Main editor component
│   │   │   ├── EditorMediaModal.tsx  # Media picker modal
│   │   │   ├── FontSize.ts          # Custom font-size extension
│   │   │   ├── ResizableImageComponent.tsx  # Drag-resizable image node
│   │   │   ├── ResizableImageNode.ts        # Tiptap image node extension
│   │   │   ├── ResizableVideoComponent.tsx  # Drag-resizable video node
│   │   │   ├── ResizableVideoNode.ts        # Tiptap video node extension
│   │   │   └── Toolbar.tsx          # Editor toolbar with formatting controls
│   │   ├── providers/
│   │   │   └── Providers.tsx        # React Query + Toast provider wrapper
│   │   ├── public/                  # Public-facing components
│   │   │   ├── about/
│   │   │   │   └── CircularSkillBar.tsx  # Animated circular progress bar
│   │   │   ├── datum/               # Homepage section components
│   │   │   │   ├── DatumFeatured.tsx     # Featured post card
│   │   │   │   ├── DatumFooter.tsx       # Homepage footer
│   │   │   │   ├── DatumHero.tsx         # Hero section
│   │   │   │   ├── DatumIndex.tsx        # Post index listing
│   │   │   │   └── DatumNewsletter.tsx   # Newsletter subscription form
│   │   │   ├── feed/
│   │   │   │   └── PostFeed.tsx     # Post card feed grid
│   │   │   ├── post/                # Blog post page components
│   │   │   │   ├── CommentForm.tsx       # Comment submission form
│   │   │   │   ├── CommentsSection.tsx   # Threaded comments display
│   │   │   │   ├── PostFooter.tsx        # Post bottom section
│   │   │   │   ├── PostHeader.tsx        # Post title & metadata
│   │   │   │   ├── PostProse.tsx         # Article body renderer
│   │   │   │   ├── PostRail.tsx          # Related posts sidebar
│   │   │   │   ├── PostSiteFooter.tsx    # Post page footer
│   │   │   │   └── PostSiteHeader.tsx    # Post page header
│   │   │   ├── sidebar/
│   │   │   │   └── Sidebar.tsx      # Sidebar with widgets
│   │   │   ├── ContentProtector.tsx  # Anti-copy/right-click protection
│   │   │   ├── Footer.tsx           # Global site footer
│   │   │   ├── Header.tsx           # Global header with category navbar
│   │   │   └── ProseRenderer.tsx    # HTML content renderer
│   │   ├── ui/                      # Reusable UI primitives
│   │   │   ├── AuthWrapper.tsx      # Auth page layout wrapper
│   │   │   ├── Button.tsx           # Styled button component
│   │   │   └── Input.tsx            # Styled input component
│   │   └── zibon/                   # Admin-specific components
│   │       ├── categories/          # Category CRUD components
│   │       ├── homepage/            # Homepage editor sections
│   │       │   ├── FeaturedPostSelector.tsx
│   │       │   ├── HeaderFooterEditor.tsx
│   │       │   ├── HeroEditor.tsx
│   │       │   ├── HeroImageEditor.tsx
│   │       │   ├── LinkListEditor.tsx
│   │       │   ├── NewsletterEditor.tsx
│   │       │   └── SidebarEditor.tsx
│   │       ├── posts/               # Post management components
│   │       ├── subscribers/         # Subscriber list components
│   │       ├── AdminSidebar.tsx     # Admin panel sidebar navigation
│   │       └── AuthGuard.tsx        # Route protection for admin pages
│   ├── lib/
│   │   └── api.ts                   # Axios instance & API helper functions
│   ├── store/
│   │   └── authStore.ts             # Zustand auth state management
│   └── utils/
│       └── postUrl.ts               # Post URL generator (/YYYY/MM/DD/slug)
├── next.config.ts                   # Next.js config (images, security headers, CSP)
├── postcss.config.mjs               # PostCSS with Tailwind plugin
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs                # ESLint configuration
└── package.json                     # Dependencies & scripts
```

### Backend (`/backend`)

```
backend/
├── prisma/
│   ├── migrations/                  # Prisma migration history
│   ├── schema.prisma                # Database schema definition (9 models)
│   └── seed.ts                      # Local database seeding script
├── src/
│   ├── config/
│   │   └── index.ts                 # Environment configuration
│   ├── db/
│   │   └── index.ts                 # Prisma client singleton instance
│   ├── middleware/
│   │   ├── auth.ts                  # JWT authentication & role-based authorization
│   │   ├── globalErrorHandler.ts    # Centralized error handler (Prisma, Zod, JWT)
│   │   └── validateRequest.ts       # Zod schema validation middleware
│   ├── module/                      # Feature modules (MVC pattern)
│   │   ├── about/                   # About page CRUD
│   │   │   ├── about.controller.ts
│   │   │   ├── about.route.ts
│   │   │   └── about.service.ts
│   │   ├── category/                # Category management with hierarchy
│   │   │   ├── category.controller.ts
│   │   │   ├── category.route.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.validation.ts
│   │   ├── comment/                 # Threaded comment system
│   │   │   ├── comment.controller.ts
│   │   │   ├── comment.route.ts
│   │   │   ├── comment.service.ts
│   │   │   └── comment.validation.ts
│   │   ├── homepage/                # Homepage data aggregation API
│   │   │   ├── homepage.controller.ts
│   │   │   ├── homepage.route.ts
│   │   │   └── homepage.service.ts
│   │   ├── media/                   # Cloudinary media upload & management
│   │   │   ├── media.controller.ts
│   │   │   ├── media.route.ts
│   │   │   ├── media.service.ts
│   │   │   └── media.validation.ts
│   │   ├── post/                    # Blog post CRUD with full SEO support
│   │   │   ├── post.controller.ts
│   │   │   ├── post.route.ts
│   │   │   ├── post.service.ts
│   │   │   └── post.validation.ts
│   │   ├── site-settings/           # Singleton site configuration
│   │   │   ├── site-settings.controller.ts
│   │   │   ├── site-settings.route.ts
│   │   │   └── site-settings.service.ts
│   │   ├── subscriber/              # Newsletter subscriber management
│   │   │   ├── subscriber.controller.ts
│   │   │   ├── subscriber.route.ts
│   │   │   ├── subscriber.service.ts
│   │   │   └── subscriber.validation.ts
│   │   └── user/                    # User authentication & profile
│   │       ├── user.controller.ts
│   │       ├── user.route.ts
│   │       ├── user.service.ts
│   │       └── user.validation.ts
│   ├── response/
│   │   └── sendResponse.ts          # Standardized API response helper
│   ├── scripts/
│   │   └── seedCloudDb.ts           # Cloud database seeding script
│   ├── utils/
│   │   ├── catchAsync.ts            # Async error wrapper for controllers
│   │   ├── sanitize.ts              # DOMPurify HTML sanitization (XSS prevention)
│   │   ├── slugify.ts               # URL slug generator
│   │   └── uploadImage.ts           # Cloudinary upload/delete/signed-URL utilities
│   ├── app.ts                       # Express app setup (middleware, routes, CORS)
│   └── server.ts                    # Server bootstrap & graceful shutdown
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies & scripts
```

---

##  Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **MySQL** database (local or TiDB Cloud)
- **Cloudinary** account for media storage

### Installation

```bash
# Clone the repository
git clone https://github.com/ashraful009/Dynamic_Blog.git
cd Dynamic_Blog

# Install backend dependencies
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database (optional)
npx ts-node prisma/seed.ts

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 — Start the backend
cd backend
npm run dev          # Runs on http://localhost:5000

# Terminal 2 — Start the frontend
cd frontend
npm run dev          # Runs on http://localhost:3000
```

---

##  Environment Variables

### Backend (`/backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend (`/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Register a new user |
| `POST` | `/api/v1/auth/login` | — | Login (sets HttpOnly cookie) |
| `POST` | `/api/v1/auth/logout` | ok | Clear auth cookie |
| `GET` | `/api/v1/users/profile` | ok | Get current user profile |
| `PATCH` | `/api/v1/users/profile` | ok | Update user profile |
| `GET` | `/api/v1/posts` | — | List published posts (paginated) |
| `GET` | `/api/v1/posts/:slug` | — | Get single post by slug |
| `GET` | `/api/v1/posts/admin/list` |  Admin | List all posts (incl. drafts) |
| `POST` | `/api/v1/posts` |  Admin | Create a new post |
| `PATCH` | `/api/v1/posts/:id` |  Admin | Update a post |
| `DELETE` | `/api/v1/posts/:id` |  Admin | Delete a post |
| `GET` | `/api/v1/posts/:postId/comments` | — | Get comments for a post |
| `POST` | `/api/v1/posts/:postId/comments` | — | Add a comment |
| `GET` | `/api/v1/categories` | — | List all categories |
| `POST` | `/api/v1/categories` |  Admin | Create a category |
| `PATCH` | `/api/v1/categories/:id` |  Admin | Update a category |
| `DELETE` | `/api/v1/categories/:id` |  Admin | Delete a category |
| `POST` | `/api/v1/media/upload` |  Admin | Upload image/video to Cloudinary |
| `GET` | `/api/v1/media` |  Admin | List uploaded media |
| `DELETE` | `/api/v1/media/:id` |  Admin | Delete a media asset |
| `GET` | `/api/v1/site-settings` | — | Get site settings |
| `PATCH` | `/api/v1/site-settings` |  Admin | Update site settings |
| `GET` | `/api/v1/homepage` | — | Get aggregated homepage data |
| `GET` | `/api/v1/about` | — | Get about page data |
| `PUT` | `/api/v1/about` |  Admin | Update about page |
| `POST` | `/api/v1/subscribers` | — | Subscribe to newsletter |
| `GET` | `/api/v1/subscribers` |  Admin | List subscribers |
| `DELETE` | `/api/v1/subscribers/:id` |  Admin | Remove subscriber |
| `GET` | `/api/v1/health` | — | Health check endpoint |

---

##  Database Schema

The database consists of **9 models** managed via Prisma ORM:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │────▶│     Post     │◀────│   Category   │
│  (Admin)     │  1:N│  (Content)   │ N:1 │ (Hierarchy)  │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │ 1:N                │ Self-ref
                     ┌──────▼───────┐     ┌──────▼───────┐
                     │    Media     │     │   Category   │
                     │ (Cloudinary) │     │  (Children)  │
                     └──────────────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │   Comment    │◀──┐ Self-referential
                     │  (Threaded)  │───┘ (parent/replies)
                     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ SiteSettings │     │  Subscriber  │     │  AboutPage   │
│ (Singleton)  │     │ (Newsletter) │     │ (Singleton)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

| Model | Description |
|---|---|
| **User** | Admin users with bcrypt-hashed passwords and role-based access (ADMIN/USER) |
| **Post** | Blog content with rich HTML, SEO metadata, featured flag, views, and display ordering |
| **Category** | Hierarchical categories with self-referential parent/child relationships |
| **Media** | Cloudinary asset metadata (public ID, URLs, dimensions, format, HLS for video) |
| **Comment** | Threaded comments with self-referential replies (no auth required) |
| **SiteSettings** | Singleton config for hero, navigation, newsletter, sidebar widgets, and footer |
| **Subscriber** | Newsletter email subscriptions |
| **AboutPage** | Singleton about page data (biography, skills, profile image) |

---

##  Deployment

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variable: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com/api/v1`.
4. Deploy — Vercel auto-detects Next.js.

### Backend → Render / Railway / VPS

1. Set **Root Directory** to `backend`.
2. **Build Command**: `npm install && npx prisma generate && npm run build`
3. **Start Command**: `npm start`
4. Add all environment variables from the backend `.env` section above.
5. Ensure `FRONTEND_URL` is set to your Vercel deployment URL for CORS.

### Database → TiDB Cloud

1. Create a free **Serverless** cluster on [TiDB Cloud](https://tidbcloud.com).
2. Copy the MySQL connection string and set it as `DATABASE_URL`.
3. Run `npx prisma db push` to create tables.
4. Optionally run `npx ts-node src/scripts/seedCloudDb.ts "connection-string"` to seed initial data.

---

##  License

This project is licensed under the ISC License.

---

<p align="center">
  Built with by <strong>Ashraful Islam</strong>
</p>
