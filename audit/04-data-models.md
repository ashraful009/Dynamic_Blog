# Data Layer & Schema Cross-Reference Audit (Phase 5)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Auditor:** Senior Full-Stack Engineer  
> **Audit Status:** Read-Only Technical Audit — Phase 5 Complete  
> **Scope:** Full Prisma schema, MySQL database definitions, relationships, indexes, constraints, migration drift, seed scripts, file upload storage layer, and the Model-to-Endpoint cross-reference matrix.

---

## 1. Database Architecture & Configuration

The application uses **MySQL** as its relational database engine, managed via **Prisma ORM v6.19.3** (CLI version `6.19.3`, `@prisma/client` declared `^6.9.0` and resolved `6.19.3` in `backend/package.json:19, 43` and `backend/package-lock.json`).

- **Prisma Generator:** `prisma-client-js` (`backend/prisma/schema.prisma:3-5`).
- **Database Provider:** `mysql` (`backend/prisma/schema.prisma:7-10`).
- **Connection String:** Configured via `DATABASE_URL` environment variable (`backend/.env`).
- **Default Database Charset & Collation:** `utf8mb4` / `utf8mb4_unicode_ci` (verified in `backend/prisma/migrations/20260709034401_init/migration.sql:14`).

---

## 2. Complete Model & Schema Inventory

The database schema defines **9 models**, **3 enums**, and **2 Prisma implicit many-to-many join tables**.

### 2.1 Enums (`backend/prisma/schema.prisma:16-29`)

| Enum Name | Defined Values | File & Lines | Usage |
|-----------|----------------|--------------|-------|
| `Role` | `ADMIN`, `USER` | `schema.prisma:16-19` | User authorization role |
| `PostStatus` | `DRAFT`, `PUBLISHED` | `schema.prisma:21-24` | Post editorial lifecycle |
| `MediaType` | `IMAGE`, `VIDEO` | `schema.prisma:26-29` | Media asset classifier |

---

### 2.2 Model 1: `User` (Table: `users`)
- **File & Lines:** `backend/prisma/schema.prisma:35-49`
- **Purpose:** Stores admin authors and registered public visitors.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `email` | `String` | `VARCHAR(191)` | No | None | `@unique` | Unique login email |
| `password` | `String` | `VARCHAR(191)` | No | None | None | Bcrypt password hash (12 rounds) |
| `name` | `String` | `VARCHAR(191)` | No | None | None | User's full display name |
| `role` | `Role` | `ENUM('ADMIN', 'USER')` | No | `USER` | None | Access control role |
| `avatar` | `String?` | `VARCHAR(191)` | Yes | None | None | Cloudinary URL for avatar |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Record creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Record update timestamp |

- **Relations:**
  - `posts`: One-to-Many (`Post[]`) -> Referenced by `Post.authorId` with `onDelete: Cascade`.
- **Indexes:**
  - Primary Key on `id`
  - Unique index `users_email_key` on `email`

---

### 2.3 Model 2: `Post` (Table: `posts`)
- **File & Lines:** `backend/prisma/schema.prisma:55-101`
- **Purpose:** Core blog article entity storing content, metadata, metrics, and relationships.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `title` | `String` | `VARCHAR(255)` | No | None | `@db.VarChar(255)` | Article title |
| `slug` | `String` | `VARCHAR(255)` | No | None | `@unique`, `@db.VarChar(255)` | Unique URL slug |
| `content` | `String` | `LONGTEXT` | No | None | `@db.LongText` | Sanitized HTML content from TipTap |
| `excerpt` | `String?` | `TEXT` | Yes | None | `@db.Text` | Short preview summary |
| `coverImage` | `String?` | `VARCHAR(191)` | Yes | None | None | Cloudinary cover image URL |
| `metaTitle` | `String?` | `VARCHAR(160)` | Yes | None | `@db.VarChar(160)` | SEO meta title tag |
| `metaDescription` | `String?` | `VARCHAR(320)` | Yes | None | `@db.VarChar(320)` | SEO meta description |
| `ogImage` | `String?` | `VARCHAR(191)` | Yes | None | None | Social sharing Open Graph image |
| `status` | `PostStatus` | `ENUM('DRAFT', 'PUBLISHED')` | No | `DRAFT` | None | Publication status |
| `isFeatured` | `Boolean` | `TINYINT(1)` | No | `false` | None | Featured article on homepage |
| `readTime` | `Int?` | `INTEGER` | Yes | None | None | Estimated read duration in minutes |
| `displayOrder` | `Int?` | `INTEGER` | Yes | None | None | Custom display sorting weight |
| `views` | `Int` | `INTEGER` | No | `0` | None | Atomic page visit counter |
| `authorId` | `String` | `VARCHAR(191)` | No | None | None | Foreign key to `User.id` |
| `categoryId` | `String?` | `VARCHAR(191)` | Yes | None | None | Foreign key to primary `Category.id` |
| `publishedAt` | `DateTime?` | `DATETIME(3)` | Yes | None | None | Timestamp when status became PUBLISHED |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Record creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Record update timestamp |

- **Relations:**
  - `author`: Belongs-to `User` via `authorId` (`onDelete: Cascade`)
  - `category`: Belongs-to `Category` (Primary) via `categoryId` (`onDelete: SetNull`)
  - `categories`: Many-to-Many (`Category[]`) via implicit join table `_PostCategories`
  - `tags`: Many-to-Many (`Tag[]`) via implicit join table `_PostTags`
  - `media`: One-to-Many (`Media[]`) via `Media.postId`
  - `comments`: One-to-Many (`Comment[]`) via `Comment.postId` (`onDelete: Cascade`)
- **Indexes:**
  - `@id` on `id`
  - `@unique` on `slug`
  - `@@index([slug])`
  - `@@index([status])`
  - `@@index([authorId])`
  - `@@index([categoryId])`
  - `@@index([isFeatured])`

---

### 2.4 Model 3: `Media` (Table: `media`)
- **File & Lines:** `backend/prisma/schema.prisma:107-131`
- **Purpose:** Cloudinary uploaded media asset metadata.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `publicId` | `String` | `VARCHAR(191)` | No | None | `@unique` | Cloudinary public_id |
| `url` | `String` | `TEXT` | No | None | `@db.Text` | HTTP asset URL |
| `secureUrl` | `String` | `TEXT` | No | None | `@db.Text` | HTTPS asset URL |
| `format` | `String` | `VARCHAR(191)` | No | None | None | Asset extension (`jpg`, `webp`, `mp4`) |
| `type` | `MediaType` | `ENUM('IMAGE', 'VIDEO')` | No | None | None | Media discriminator |
| `hlsUrl` | `String?` | `TEXT` | Yes | None | `@db.Text` | Video HLS adaptive stream URL (`.m3u8`) |
| `width` | `Int?` | `INTEGER` | Yes | None | None | Media pixel width |
| `height` | `Int?` | `INTEGER` | Yes | None | None | Media pixel height |
| `bytes` | `Int?` | `INTEGER` | Yes | None | None | File size in bytes |
| `alt` | `String?` | `VARCHAR(255)` | Yes | None | `@db.VarChar(255)` | Accessibility & SEO alt text |
| `postId` | `String?` | `VARCHAR(191)` | Yes | None | None | Optional foreign key to `Post.id` |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Record creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Record update timestamp |

- **Relations:**
  - `post`: Belongs-to `Post` via `postId` (`onDelete: SetNull`)
- **Indexes:**
  - `@id` on `id`
  - `@unique` on `publicId`
  - `@@index([postId])`
  - `@@index([type])`

---

### 2.5 Model 4: `SiteSettings` (Table: `site_settings`)
- **File & Lines:** `backend/prisma/schema.prisma:137-202`
- **Purpose:** Singleton document storing layout configurations, hero section, sidebar widgets, Goodreads list, and footer links.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `"default"` | `@id` | Singleton record ID (`"default"`) |
| `siteName` | `String` | `VARCHAR(191)` | No | `"ফেরদৌস আনাম জীবন"` | None | Website brand title |
| `siteSubtitle` | `String?` | `VARCHAR(191)` | Yes | `"লেখালেখি"` | None | Brand subtitle |
| `navLinks` | `Json` | `JSON` | No | `"[]"` | None | JSON array of header nav links |
| `headerCtaText` | `String?` | `VARCHAR(191)` | Yes | `"Subscribe"` | None | CTA button label |
| `headerCtaLink` | `String?` | `VARCHAR(191)` | Yes | `"#subscribe"` | None | CTA anchor link |
| `readMoreBtnText`| `String?` | `VARCHAR(191)` | Yes | `"READ MORE"` | None | Blog feed button label |
| `heroCoordText` | `String?` | `VARCHAR(191)` | Yes | None | None | Datum hero coordinate text |
| `heroTitle` | `String` | `TEXT` | No | None | `@db.Text` | Hero headline text |
| `heroSubtitle` | `String?` | `TEXT` | Yes | None | `@db.Text` | Hero subheadline |
| `heroPrimaryBtnText` | `String?` | `VARCHAR(191)` | Yes | `"Browse the index"` | None | Hero primary button label |
| `heroPrimaryBtnLink` | `String?` | `VARCHAR(191)` | Yes | `"#index"` | None | Hero primary button link |
| `heroSecondaryBtnText`| `String?` | `VARCHAR(191)` | Yes | `"Get new notes by email"` | None | Hero secondary button label |
| `heroSecondaryBtnLink`| `String?` | `VARCHAR(191)` | Yes | `"#subscribe"` | None | Hero secondary button link |
| `heroPanelLabel`| `String?` | `VARCHAR(191)` | Yes | `"N 41.203 / E 6.004"` | None | Coordinate watermarking |
| `heroImage` | `String?` | `TEXT` | Yes | None | `@db.Text` | Hero banner image URL |
| `sidebarNewsletterLabel` | `String?` | `VARCHAR(191)` | Yes | `"নতুন লেখা..."` | None | Sidebar newsletter header |
| `newsletterTitle`| `String?` | `TEXT` | Yes | None | `@db.Text` | Main newsletter headline |
| `newsletterSubtitle` | `String?` | `TEXT` | Yes | None | `@db.Text` | Main newsletter subheadline |
| `newsletterPlaceholder` | `String?` | `VARCHAR(191)` | Yes | `"Type your email..."` | None | Input placeholder |
| `newsletterBtnText` | `String?` | `VARCHAR(191)` | Yes | `"Subscribe"` | None | Button text |
| `newsletterNote` | `String?` | `VARCHAR(191)` | Yes | `"By subscribing..."` | None | Privacy disclaimer |
| `footerMark` | `String?` | `VARCHAR(191)` | Yes | None | None | Footer copyright mark |
| `footerLinks` | `Json` | `JSON` | No | `"[]"` | None | Array of `{label, href}` objects |
| `sidebarAboutTitle` | `String?` | `VARCHAR(191)` | Yes | None | None | Sidebar author widget title |
| `sidebarAboutImage` | `String?` | `TEXT` | Yes | None | `@db.Text` | Sidebar author thumbnail URL |
| `sidebarAboutText` | `String?` | `TEXT` | Yes | None | `@db.Text` | Sidebar author short bio |
| `sidebarAboutLinkText` | `String?` | `VARCHAR(191)` | Yes | `"এই লিংক থেকে"` | None | About link anchor text |
| `sidebarAboutLinkUrl` | `String?` | `VARCHAR(191)` | Yes | `"/category/..."` | None | About link URL |
| `sidebarAboutSignoff` | `String?` | `VARCHAR(191)` | Yes | `"- ফেরদৌস আনাম জীবন"` | None | Signature string |
| `sidebarGoodreadsTitle`| `String?` | `VARCHAR(191)` | Yes | `"গুডরিডসের পড়াশোনা"` | None | Goodreads reading widget header |
| `sidebarGoodreadsBooks`| `Json` | `JSON` | No | `"[]"` | None | Array of `{title, author, coverUrl, rating, link}` |
| `sidebarRecentTitle` | `String?` | `VARCHAR(191)` | Yes | `"সাম্প্রতিক লেখা"` | None | Recent posts title |
| `sidebarRecentCount` | `Int` | `INTEGER` | No | `5` | None | Number of recent posts in sidebar |
| `sidebarCategoriesTitle` | `String?` | `VARCHAR(191)` | Yes | `"বিষয় নির্বাচন"` | None | Categories widget title |
| `sidebarTagsTitle` | `String?` | `VARCHAR(191)` | Yes | `"যা নিয়ে লিখছি..."` | None | Tags widget title |
| `sidebarCustomHtml` | `String?` | `TEXT` | Yes | None | `@db.Text` | Custom raw embed HTML |
| `showSidebarAbout` | `Boolean` | `TINYINT(1)` | No | `true` | None | Toggle author widget |
| `showSidebarNewsletter`| `Boolean` | `TINYINT(1)` | No | `true` | None | Toggle newsletter widget |
| `showSidebarGoodreads` | `Boolean` | `TINYINT(1)` | No | `true` | None | Toggle Goodreads widget |
| `showSidebarRecent` | `Boolean` | `TINYINT(1)` | No | `true` | None | Toggle recent posts widget |
| `showSidebarCategories`| `Boolean` | `TINYINT(1)` | No | `true` | None | Toggle categories widget |
| `showSidebarTags` | `Boolean` | `TINYINT(1)` | No | `true` | None | Toggle tags widget |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Update timestamp |

---

### 2.6 Model 5: `Subscriber` (Table: `subscribers`)
- **File & Lines:** `backend/prisma/schema.prisma:208-214`
- **Purpose:** Stores newsletter subscriber email addresses.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `email` | `String` | `VARCHAR(191)` | No | None | `@unique` | Unique subscriber email |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Subscription timestamp |

---

### 2.7 Model 6: `Category` (Table: `categories`)
- **File & Lines:** `backend/prisma/schema.prisma:220-237`
- **Purpose:** Hierarchical taxonomy categories with parent-child support and header toggle.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `name` | `String` | `VARCHAR(191)` | No | None | `@unique` | Category name |
| `slug` | `String` | `VARCHAR(191)` | No | None | `@unique` | Clean URL slug |
| `showInHeader` | `Boolean` | `TINYINT(1)` | No | `false` | None | Whether to show in top navbar |
| `parentId` | `String?` | `VARCHAR(191)` | Yes | None | None | Self-referencing parent foreign key |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Record creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Record update timestamp |

- **Relations:**
  - `posts`: One-to-Many (`Post[]`) as Primary Category (`"PrimaryCategory"`)
  - `multiPosts`: Many-to-Many (`Post[]`) as Secondary Categories (`"PostCategories"`)
  - `parent`: Self-referential Belongs-to `Category?` (`onDelete: SetNull`)
  - `children`: Self-referential Has-Many `Category[]`

---

### 2.8 Model 7: `Tag` (Table: `tags`)
- **File & Lines:** `backend/prisma/schema.prisma:243-253`
- **Purpose:** Topic tags for post tagging and sidebar tag cloud.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `name` | `String` | `VARCHAR(191)` | No | None | `@unique` | Tag name |
| `slug` | `String` | `VARCHAR(191)` | No | None | `@unique` | Clean URL slug |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Record creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Record update timestamp |

- **Relations:**
  - `posts`: Many-to-Many (`Post[]`) via implicit join table `_PostTags`

---

### 2.9 Model 8: `Comment` (Table: `comments`)
- **File & Lines:** `backend/prisma/schema.prisma:259-278`
- **Purpose:** Hierarchical threaded comments on blog posts.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `uuid()` | `@id` | Primary Key (UUID v4) |
| `content` | `String` | `TEXT` | No | None | `@db.Text` | Comment body (sanitized) |
| `authorName` | `String` | `VARCHAR(191)` | No | None | None | Commenter display name |
| `authorEmail` | `String?` | `VARCHAR(191)` | Yes | None | None | Commenter contact email |
| `postId` | `String` | `VARCHAR(191)` | No | None | None | Foreign key to `Post.id` |
| `parentId` | `String?` | `VARCHAR(191)` | Yes | None | None | Self-referencing parent foreign key |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Comment timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Update timestamp |

- **Relations:**
  - `post`: Belongs-to `Post` via `postId` (`onDelete: Cascade`)
  - `parent`: Self-referential Belongs-to `Comment?` (`onDelete: Cascade`)
  - `replies`: Self-referential Has-Many `Comment[]`
- **Indexes:**
  - `@id` on `id`
  - `@@index([postId])`
  - `@@index([parentId])`

---

### 2.10 Model 9: `AboutPage` (Table: `about_page`)
- **File & Lines:** `backend/prisma/schema.prisma:284-303`
- **Purpose:** Singleton document storing author biography, skills, and contact information.

| Field Name | Prisma Type | DB Column Type | Nullable | Default | Constraints & Attributes | Description |
|------------|-------------|----------------|----------|---------|--------------------------|-------------|
| `id` | `String` | `VARCHAR(191)` | No | `"default"` | `@id` | Singleton record ID (`"default"`) |
| `name` | `String` | `VARCHAR(191)` | No | `"ফেরদৌস আনাম জীবন"` | None | Author's full name |
| `designation` | `String` | `VARCHAR(191)` | No | `"কথাসাহিত্যিক ও গবেষক"` | None | Professional title |
| `phone` | `String?` | `VARCHAR(191)` | Yes | None | None | Contact phone |
| `email` | `String?` | `VARCHAR(191)` | Yes | None | None | Contact email |
| `biography` | `String` | `TEXT` | No | None | `@db.Text` | Rich HTML biography |
| `profileImage` | `String?` | `TEXT` | Yes | None | `@db.Text` | Profile portrait URL |
| `signatureImage` | `String?` | `TEXT` | Yes | None | `@db.Text` | Signature graphic URL |
| `skills` | `Json` | `JSON` | No | `"[]"` | None | Array of `{name: string, percentage: number}` |
| `createdAt` | `DateTime` | `DATETIME(3)` | No | `now()` | None | Record creation timestamp |
| `updatedAt` | `DateTime` | `DATETIME(3)` | No | None | `@updatedAt` | Record update timestamp |

---

## 3. The Migration Drift Discrepancy (Critical Finding)

During line-by-line inspection of `backend/prisma/migrations/`, an alarming discrepancy was identified between the Prisma schema and the committed database migrations:

```
backend/prisma/migrations/
├── 20260709034401_init/
│   └── migration.sql              <- ONLY creates `users`, `posts`, and `media` tables!
└── 20260709035849_change_default_role/
    └── migration.sql              <- ONLY alters `users.role` default to 'USER'!
```

### Impact & Risk:
1. **6 of the 9 Tables Have NO Migrations:**
   The tables `site_settings`, `subscribers`, `categories`, `tags`, `comments`, `about_page`, and the M:N tables `_PostCategories` and `_PostTags` **do not exist in any migration file**.
2. **Missing Post Columns:**
   Columns added to `posts` (`isFeatured`, `readTime`, `displayOrder`, `views`, `categoryId`) are not present in `20260709034401_init/migration.sql`.
3. **Fresh Deployment Failure:**
   Running `npx prisma migrate deploy` in a production CI/CD pipeline on a fresh MySQL database will fail immediately because 67% of the schema is un-migrated.
4. **Resolution Required Before Split:**
   The team must execute `npx prisma migrate diff` or create a new baseline migration representing the true state of `schema.prisma`.

---

## 4. Model-to-Endpoint Cross-Reference Matrix

This matrix maps every API endpoint to the Prisma models it interacts with:
- **C** = Creates record
- **R** = Reads record / queries
- **U** = Updates record
- **D** = Deletes record
- **FK** = References / Connects foreign key
- **Inc** = Includes related model data

| # | Endpoint Path & Method | User | Post | Media | SiteSettings | Subscriber | Category | Tag | Comment | AboutPage |
|---|------------------------|:----:|:----:|:-----:|:------------:|:----------:|:--------:|:---:|:-------:|:---------:|
| 1 | `POST /api/v1/auth/register` | **C, R** | - | - | - | - | - | - | - | - |
| 2 | `POST /api/v1/auth/login` | **R** | - | - | - | - | - | - | - | - |
| 3 | `POST /api/v1/auth/logout` | - | - | - | - | - | - | - | - | - |
| 4 | `GET /api/v1/users/profile` | **R** | Inc (Count) | - | - | - | - | - | - | - |
| 5 | `PATCH /api/v1/users/profile` | **U** | - | - | - | - | - | - | - | - |
| 6 | `POST /api/v1/posts` | **R** (auth) | **C** | - | - | - | **FK** | **FK** | - | - |
| 7 | `GET /api/v1/posts` | - | **R** | - | - | - | **R, Inc** | **R, Inc** | - | - |
| 8 | `GET /api/v1/posts/admin/all` | - | **R** | - | - | - | **Inc** | **Inc** | - | - |
| 9 | `GET /api/v1/posts/:slug` | - | **R, U** (views) | **Inc** | - | - | **Inc** | **Inc** | - | - |
| 10 | `GET /api/v1/posts/:id` | - | **R** | **Inc** | - | - | **Inc** | **Inc** | - | - |
| 11 | `PUT /api/v1/posts/:id` | **R** (auth) | **U** | - | - | - | **FK** | **FK** | - | - |
| 12 | `DELETE /api/v1/posts/:id` | **R** (auth) | **D** | - | - | - | - | - | Cascaded | - |
| 13 | `POST /api/v1/posts/:id/comments` | - | **R** (check) | - | - | - | - | - | **C** | - |
| 14 | `GET /api/v1/posts/:id/comments` | - | - | - | - | - | - | - | **R** (tree) | - |
| 15 | `POST /api/v1/categories` | **R** (auth) | - | - | - | - | **C** | - | - | - |
| 16 | `GET /api/v1/categories` | - | Inc (Count) | - | - | - | **R** (tree) | - | - | - |
| 17 | `GET /api/v1/categories/:id` | - | - | - | - | - | **R** | - | - | - |
| 18 | `PUT /api/v1/categories/:id` | **R** (auth) | - | - | - | - | **U** | - | - | - |
| 19 | `DELETE /api/v1/categories/:id` | **R** (auth) | - | - | - | - | **D** | - | - | - |
| 20 | `POST /api/v1/tags` | **R** (auth) | - | - | - | - | - | **C** | - | - |
| 21 | `GET /api/v1/tags` | - | Inc (Count) | - | - | - | - | **R** | - | - |
| 22 | `GET /api/v1/tags/:id` | - | - | - | - | - | - | **R** | - | - |
| 23 | `PUT /api/v1/tags/:id` | **R** (auth) | - | - | - | - | - | **U** | - | - |
| 24 | `DELETE /api/v1/tags/:id` | **R** (auth) | - | - | - | - | - | **D** | - | - |
| 25 | `POST /api/v1/subscribers` | - | - | - | - | **C, R** | - | - | - | - |
| 26 | `GET /api/v1/subscribers` | **R** (auth) | - | - | - | **R** | - | - | - | - |
| 27 | `DELETE /api/v1/subscribers/:id` | **R** (auth) | - | - | - | **D** | - | - | - | - |
| 28 | `POST /api/v1/media/upload` | **R** (auth) | **R** (optional) | **C** | - | - | - | - | - | - |
| 29 | `GET /api/v1/media` | **R** (auth) | - | **R** | - | - | - | - | - | - |
| 30 | `DELETE /api/v1/media/:id` | **R** (auth) | - | **D** | - | - | - | - | - | - |
| 31 | `PATCH /api/v1/media/:id/link` | **R** (auth) | **R** (check) | **U** | - | - | - | - | - | - |
| 32 | `GET /api/v1/site-settings` | - | - | - | **R** | - | - | - | - | - |
| 33 | `PUT /api/v1/site-settings` | **R** (auth) | - | - | **U** | - | - | - | - | - |
| 34 | `GET /api/v1/about` | - | - | - | - | - | - | - | - | **R** |
| 35 | `PUT /api/v1/about` | **R** (auth) | - | - | - | - | - | - | - | **U** |
| 36 | `GET /api/v1/homepage` | - | **R** | - | **R** | - | **R** | **R** | - | - |
| 37 | `GET /api/v1/health` | - | - | - | - | - | - | - | - | - |
| 38 | `GET /` | - | - | - | - | - | - | - | - | - |

---

## 5. File Upload & Media Storage Layer

File uploads are handled through a two-stage pipeline: **Local Multer Disk Buffer -> Remote Cloudinary Bucket**.

### 5.1 Multer Disk Configuration
In `backend/src/module/media/media.route.ts:9-47`:
- **Upload Directory:** `path.join(process.cwd(), "tmp")` (`media.route.ts:11`).
- **Filename Generation:** `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}` (`media.route.ts:14-16`).
- **MIME Type Whitelist (`media.route.ts:24-34`):**
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
  - Videos: `video/mp4`, `video/webm`, `video/quicktime`, `video/x-msvideo`
- **Max File Size Limit:** `100 * 1024 * 1024` (100 MB) (`media.route.ts:45`).

### 5.2 Cloudinary Remote Integration
In `backend/src/utils/uploadImage.ts:1-120`:
- **Credentials:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Target Folders:**
  - Images: `zibon-vlog/images` (`uploadImage.ts:22`)
  - Videos: `zibon-vlog/videos` (`uploadImage.ts:50`)
- **Image Transformations:** `{ quality: "auto", fetch_format: "auto" }` (`uploadImage.ts:29`).
- **Video Eager Streaming:** Generates HLS `.m3u8` streaming profile (`streaming_profile: "hd"`, `format: "m3u8"`) (`uploadImage.ts:58-59`).

### 5.3 Critical Bug: Server Disk Space Leak
In `backend/src/module/media/media.service.ts:7-44`:
1. Multer writes the uploaded file to disk at `backend/tmp/<uniqueSuffix>.<ext>`.
2. `MediaService.upload()` passes `file.path` to `uploadImage()` or `uploadVideo()`.
3. Cloudinary uploads the asset.
4. Prisma creates the `Media` record.
5. **The service never calls `fs.unlinkSync()` or `fs.promises.unlink()`!**
6. Every single uploaded file remains permanently stranded in `backend/tmp/`. This is verified by the **14 orphaned media files** found in `backend/tmp/` during Phase 1 (consuming ~20 MB of disk space).

