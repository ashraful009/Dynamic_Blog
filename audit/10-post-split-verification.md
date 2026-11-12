# Post-Split Comprehensive Verification Report

**Date**: 2026-11-12  
**Target Environment**: Monorepo split into `./frontend` (Public), `./admin` (CMS), and `./backend` (API)  
**Production Domains**:
- Public: `https://ferdausanamjibon.com`
- Admin: `https://cms.ferdausanamjibon.com`
- API: `https://api.ferdausanamjibon.com`
**Verification Mode**: READ-ONLY static verification (`tsc`, AST/route stack inspection, git history audit, grep). Zero database writes performed.

---

## 1. Backend Route Table & Privileged Route Verification

The Express route tree was inspected programmatically by walking `app._router.stack` recursively.

### Complete Route Inventory (37 Routes)

| Method | Full Path | Middleware Chain | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `anonymous` | **PUBLIC** |
| `GET` | `/api/v1/health` | `anonymous` | **PUBLIC** |
| `POST` | `/api/v1/auth/login` | `validateRequest`, `UserController.login` | **PUBLIC** |
| `POST` | `/api/v1/auth/logout` | `UserController.logout` | **PUBLIC** |
| `GET` | `/api/v1/users/profile` | `auth`, `UserController.getProfile` | **AUTH-ONLY** |
| `PATCH` | `/api/v1/users/profile` | `auth`, `validateRequest`, `UserController.updateProfile` | **AUTH-ONLY** |
| `GET` | `/api/v1/posts/` | `PostController.getAll` | **PUBLIC** |
| `GET` | `/api/v1/posts/:slug` | `validateRequest`, `PostController.getBySlug` | **PUBLIC** |
| `GET` | `/api/v1/posts/featured` | `PostController.getFeatured` | **PUBLIC** |
| `GET` | `/api/v1/posts/recent-index`| `PostController.getRecentIndex` | **PUBLIC** |
| `GET` | `/api/v1/posts/admin/list` | `auth`, `authorize`, `PostController.getAllForAdmin` | **ADMIN** |
| `GET` | `/api/v1/posts/admin/:id` | `auth`, `authorize`, `validateRequest`, `PostController.getByIdForAdmin` | **ADMIN** |
| `POST` | `/api/v1/posts/` | `auth`, `authorize`, `validateRequest`, `PostController.create` | **ADMIN** |
| `PATCH` | `/api/v1/posts/:id` | `auth`, `authorize`, `validateRequest`, `PostController.update` | **ADMIN** |
| `DELETE` | `/api/v1/posts/:id` | `auth`, `authorize`, `validateRequest`, `PostController.deletePost` | **ADMIN** |
| `GET` | `/api/v1/posts/:id/comments` | `CommentController.getCommentsByPost` | **PUBLIC** |
| `POST` | `/api/v1/posts/:id/comments` | `rateLimit`, `CommentController.createComment` | **PUBLIC** |
| `GET` | `/api/v1/media/` | `auth`, `authorize`, `MediaController.getAll` | **ADMIN** |
| `POST` | `/api/v1/media/upload` | `auth`, `authorize`, `multerMiddleware`, `validateRequest`, `MediaController.upload` | **ADMIN** |
| `PATCH` | `/api/v1/media/:id/link` | `auth`, `authorize`, `validateRequest`, `MediaController.linkToPost` | **ADMIN** |
| `DELETE` | `/api/v1/media/:id` | `auth`, `authorize`, `validateRequest`, `MediaController.deleteMedia` | **ADMIN** |
| `GET` | `/api/v1/categories/` | `CategoryController.getAll` | **PUBLIC** |
| `POST` | `/api/v1/categories/` | `auth`, `authorize`, `validateRequest`, `CategoryController.create` | **ADMIN** |
| `PATCH` | `/api/v1/categories/:id` | `auth`, `authorize`, `validateRequest`, `CategoryController.update` | **ADMIN** |
| `DELETE` | `/api/v1/categories/:id` | `auth`, `authorize`, `validateRequest`, `CategoryController.deleteCategory` | **ADMIN** |
| `GET` | `/api/v1/tags/` | `TagController.getAll` | **PUBLIC** |
| `POST` | `/api/v1/tags/` | `auth`, `authorize`, `validateRequest`, `TagController.create` | **ADMIN** |
| `PATCH` | `/api/v1/tags/:id` | `auth`, `authorize`, `validateRequest`, `TagController.update` | **ADMIN** |
| `DELETE` | `/api/v1/tags/:id` | `auth`, `authorize`, `validateRequest`, `TagController.deleteTag` | **ADMIN** |
| `GET` | `/api/v1/subscribers/` | `auth`, `authorize`, `SubscriberController.getAll` | **ADMIN** |
| `POST` | `/api/v1/subscribers/` | `rateLimit`, `validateRequest`, `SubscriberController.subscribe` | **PUBLIC** |
| `DELETE` | `/api/v1/subscribers/:id` | `auth`, `authorize`, `validateRequest`, `SubscriberController.deleteSubscriber` | **ADMIN** |
| `GET` | `/api/v1/site-settings/` | `SiteSettingsController.get` | **PUBLIC** |
| `PATCH` | `/api/v1/site-settings/` | `auth`, `authorize`, `validateRequest`, `SiteSettingsController.update` | **ADMIN** |
| `GET` | `/api/v1/about/` | `AboutController.get` | **PUBLIC** |
| `PUT` | `/api/v1/about/` | `auth`, `authorize`, `validateRequest`, `AboutController.update` | **ADMIN** |
| `GET` | `/api/v1/homepage/` | `HomepageController.getData` | **PUBLIC** |

### Privileged / Write Route Audit
Every single administrative and write route has `authorize("ADMIN")` attached immediately following `auth`:
1. `GET /api/v1/posts/admin/list` -> `auth, authorize("ADMIN")` ([post.route.ts:14](file:///d:/Zibon-Vlog/backend/src/module/post/post.route.ts#L14))
2. `GET /api/v1/posts/admin/:id` -> `auth, authorize("ADMIN")` ([post.route.ts:20](file:///d:/Zibon-Vlog/backend/src/module/post/post.route.ts#L20))
3. `POST /api/v1/posts/` -> `auth, authorize("ADMIN")` ([post.route.ts:28](file:///d:/Zibon-Vlog/backend/src/module/post/post.route.ts#L28))
4. `PATCH /api/v1/posts/:id` -> `auth, authorize("ADMIN")` ([post.route.ts:36](file:///d:/Zibon-Vlog/backend/src/module/post/post.route.ts#L36))
5. `DELETE /api/v1/posts/:id` -> `auth, authorize("ADMIN")` ([post.route.ts:44](file:///d:/Zibon-Vlog/backend/src/module/post/post.route.ts#L44))
6. `GET /api/v1/media/` -> `auth, authorize("ADMIN")` ([media.route.ts:38](file:///d:/Zibon-Vlog/backend/src/module/media/media.route.ts#L38))
7. `POST /api/v1/media/upload` -> `auth, authorize("ADMIN")` ([media.route.ts:16](file:///d:/Zibon-Vlog/backend/src/module/media/media.route.ts#L16))
8. `PATCH /api/v1/media/:id/link` -> `auth, authorize("ADMIN")` ([media.route.ts:44](file:///d:/Zibon-Vlog/backend/src/module/media/media.route.ts#L44))
9. `DELETE /api/v1/media/:id` -> `auth, authorize("ADMIN")` ([media.route.ts:52](file:///d:/Zibon-Vlog/backend/src/module/media/media.route.ts#L52))
10. `POST /api/v1/categories/` -> `auth, authorize("ADMIN")` ([category.route.ts:11](file:///d:/Zibon-Vlog/backend/src/module/category/category.route.ts#L11))
11. `PATCH /api/v1/categories/:id` -> `auth, authorize("ADMIN")` ([category.route.ts:18](file:///d:/Zibon-Vlog/backend/src/module/category/category.route.ts#L18))
12. `DELETE /api/v1/categories/:id` -> `auth, authorize("ADMIN")` ([category.route.ts:25](file:///d:/Zibon-Vlog/backend/src/module/category/category.route.ts#L25))
13. `POST /api/v1/tags/` -> `auth, authorize("ADMIN")` ([tag.route.ts:11](file:///d:/Zibon-Vlog/backend/src/module/tag/tag.route.ts#L11))
14. `PATCH /api/v1/tags/:id` -> `auth, authorize("ADMIN")` ([tag.route.ts:18](file:///d:/Zibon-Vlog/backend/src/module/tag/tag.route.ts#L18))
15. `DELETE /api/v1/tags/:id` -> `auth, authorize("ADMIN")` ([tag.route.ts:25](file:///d:/Zibon-Vlog/backend/src/module/tag/tag.route.ts#L25))
16. `GET /api/v1/subscribers/` -> `auth, authorize("ADMIN")` ([subscriber.route.ts:21](file:///d:/Zibon-Vlog/backend/src/module/subscriber/subscriber.route.ts#L21))
17. `DELETE /api/v1/subscribers/:id` -> `auth, authorize("ADMIN")` ([subscriber.route.ts:27](file:///d:/Zibon-Vlog/backend/src/module/subscriber/subscriber.route.ts#L27))
18. `PATCH /api/v1/site-settings/` -> `auth, authorize("ADMIN")` ([site-settings.route.ts:11](file:///d:/Zibon-Vlog/backend/src/module/site-settings/site-settings.route.ts#L11))
19. `PUT /api/v1/about/` -> `auth, authorize("ADMIN")` ([about.route.ts:11](file:///d:/Zibon-Vlog/backend/src/module/about/about.route.ts#L11))

**Unprivileged Write Routes**:
- `POST /api/v1/posts/:id/comments`: Public with dedicated 10 req/15 min IP rate limiter ([comment.route.ts:15](file:///d:/Zibon-Vlog/backend/src/module/comment/comment.route.ts#L15)).
- `POST /api/v1/subscribers`: Public with dedicated 10 req/15 min IP rate limiter and email validation ([subscriber.route.ts:11-15](file:///d:/Zibon-Vlog/backend/src/module/subscriber/subscriber.route.ts#L11-L15)).
- `PATCH /api/v1/users/profile`: AUTH-ONLY user profile update ([user.route.ts:16-21](file:///d:/Zibon-Vlog/backend/src/module/user/user.route.ts#L16-L21)).

**Missing Authorize Routes**: **None**.

---

## 2. Registration Removal & Login Role Verification

### Registration Route Removed
In [user.route.ts:6-13](file:///d:/Zibon-Vlog/backend/src/module/user/user.route.ts#L6-L13):
```typescript
const router = Router();
router.post(
  "/login",
  validateRequest(UserValidation.login),
  UserController.login
);
router.post("/logout", UserController.logout);
export const authRoutes = router;
```
`git grep -n "register" -- backend/src` returns **zero hits**.

### Non-Admin Login Rejection
In [user.service.ts:10-19](file:///d:/Zibon-Vlog/backend/src/module/user/user.service.ts#L10-L19):
```typescript
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (user.role !== "ADMIN") {
    throw new ApiError(401, "Invalid email or password.");
  }
```
All failures (missing user, incorrect password, or non-ADMIN role) throw the identical generic error `401 "Invalid email or password."`. No role enumeration or account existence is leaked.

---

## 3. Cookie Transport, Trust Proxy, CORS, & CSRF Defense

### Cookie Options on Login and Logout
In [user.controller.ts:8-37](file:///d:/Zibon-Vlog/backend/src/module/user/user.controller.ts#L8-L37):
```typescript
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  path: "/",
};

const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await UserService.login(req.body);
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: { user },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successful",
    data: null,
  });
});
```
- `httpOnly: true`: Blocks client-side JavaScript access.
- `secure: config.nodeEnv === "production"`: Enforces HTTPS in production.
- `sameSite: "strict"`: Replaces any dynamic `"none"` branch.
- Host-Only Cookie: No `domain` property specified; cookie is scoped strictly to `api.ferdausanamjibon.com`.
- `maxAge: 24 * 60 * 60 * 1000` (24 hours).
- Synchronized with [config/index.ts:25-27](file:///d:/Zibon-Vlog/backend/src/config/index.ts#L25-L27):
```typescript
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
```
- `clearCookie` uses the identical `cookieOptions` object (`httpOnly`, `secure`, `sameSite`, `path`), ensuring browser eviction.

### Trust Proxy Setting
In [app.ts:19-20](file:///d:/Zibon-Vlog/backend/src/app.ts#L19-L20):
```typescript
const app: Application = express();
app.set("trust proxy", 1);
```
Applied before all rate limiters and route handlers.

### CORS Origins Logic
In [config/index.ts:6-16](file:///d:/Zibon-Vlog/backend/src/config/index.ts#L6-L16):
```typescript
const parseOrigins = (...rawValues: (string | undefined)[]): string[] => {
  return rawValues
    .flatMap((v) => (v ? v.split(",") : []))
    .map((s) => s.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins(
  process.env.PUBLIC_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL
);
```
In [app.ts:22-37](file:///d:/Zibon-Vlog/backend/src/app.ts#L22-L37):
```typescript
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### CSRF Defense Middleware
In [app.ts:39-53](file:///d:/Zibon-Vlog/backend/src/app.ts#L39-L53):
```typescript
// CSRF Defense middleware for state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin && !config.cors.allowedOrigins.includes(origin)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Forbidden: Invalid request origin",
      });
      return;
    }
  }
  next();
});
```
Positioned immediately after CORS and before all route handlers and body parsers.

---

## 4. Match Matrix: Client API Calls -> Backend Routes

### `admin/` API Calls -> Backend Routes
| Admin Client Method (`admin/src/lib/api.ts`) | HTTP Method | Endpoint Path | Backend Route File | Required Access Level | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `authApi.login` | `POST` | `/api/v1/auth/login` | `user.route.ts` | **PUBLIC** | MATCH |
| `authApi.logout` | `POST` | `/api/v1/auth/logout` | `user.route.ts` | **PUBLIC** | MATCH |
| `authApi.getProfile` | `GET` | `/api/v1/users/profile` | `user.route.ts` | **AUTH-ONLY** | MATCH |
| `authApi.updateProfile` | `PATCH` | `/api/v1/users/profile` | `user.route.ts` | **AUTH-ONLY** | MATCH |
| `postsApi.getAllAdmin` | `GET` | `/api/v1/posts/admin/list` | `post.route.ts` | **ADMIN** | MATCH |
| `postsApi.getById` | `GET` | `/api/v1/posts/admin/:id` | `post.route.ts` | **ADMIN** | MATCH |
| `postsApi.create` | `POST` | `/api/v1/posts` | `post.route.ts` | **ADMIN** | MATCH |
| `postsApi.update` | `PATCH` | `/api/v1/posts/:id` | `post.route.ts` | **ADMIN** | MATCH |
| `postsApi.delete` | `DELETE` | `/api/v1/posts/:id` | `post.route.ts` | **ADMIN** | MATCH |
| `mediaApi.upload` | `POST` | `/api/v1/media/upload` | `media.route.ts` | **ADMIN** | MATCH |
| `mediaApi.getAll` | `GET` | `/api/v1/media` | `media.route.ts` | **ADMIN** | MATCH |
| `mediaApi.delete` | `DELETE` | `/api/v1/media/:id` | `media.route.ts` | **ADMIN** | MATCH |
| `mediaApi.linkToPost` | `PATCH` | `/api/v1/media/:id/link` | `media.route.ts` | **ADMIN** | MATCH |
| `siteSettingsApi.get` | `GET` | `/api/v1/site-settings` | `site-settings.route.ts` | **PUBLIC** | MATCH |
| `siteSettingsApi.update` | `PATCH` | `/api/v1/site-settings` | `site-settings.route.ts` | **ADMIN** | MATCH |
| `aboutApi.get` | `GET` | `/api/v1/about` | `about.route.ts` | **PUBLIC** | MATCH |
| `aboutApi.update` | `PUT` | `/api/v1/about` | `about.route.ts` | **ADMIN** | MATCH |
| `categoriesApi.getAll` | `GET` | `/api/v1/categories` | `category.route.ts` | **PUBLIC** | MATCH |
| `categoriesApi.create` | `POST` | `/api/v1/categories` | `category.route.ts` | **ADMIN** | MATCH |
| `categoriesApi.update` | `PATCH` | `/api/v1/categories/:id` | `category.route.ts` | **ADMIN** | MATCH |
| `categoriesApi.delete` | `DELETE` | `/api/v1/categories/:id` | `category.route.ts` | **ADMIN** | MATCH |
| `tagsApi.getAll` | `GET` | `/api/v1/tags` | `tag.route.ts` | **PUBLIC** | MATCH |
| `tagsApi.create` | `POST` | `/api/v1/tags` | `tag.route.ts` | **ADMIN** | MATCH |
| `tagsApi.update` | `PATCH` | `/api/v1/tags/:id` | `tag.route.ts` | **ADMIN** | MATCH |
| `tagsApi.delete` | `DELETE` | `/api/v1/tags/:id` | `tag.route.ts` | **ADMIN** | MATCH |
| `subscribersApi.getAll` | `GET` | `/api/v1/subscribers` | `subscriber.route.ts` | **ADMIN** | MATCH |
| `subscribersApi.delete` | `DELETE` | `/api/v1/subscribers/:id` | `subscriber.route.ts` | **ADMIN** | MATCH |

### `frontend/` API Calls -> Backend Routes
| Public Client Method (`frontend/src/lib/api.ts` & Fetch) | HTTP Method | Endpoint Path | Backend Route File | Required Access Level | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `homepageApi.getData` / `fetch("/homepage")` | `GET` | `/api/v1/homepage` | `homepage.route.ts` | **PUBLIC** | MATCH |
| `postsApi.getAllPublished` / `fetch("/posts")` | `GET` | `/api/v1/posts` | `post.route.ts` | **PUBLIC** | MATCH |
| `postsApi.getBySlug` / `fetch("/posts/:slug")` | `GET` | `/api/v1/posts/:slug` | `post.route.ts` | **PUBLIC** | MATCH |
| `commentsApi.getByPost` | `GET` | `/api/v1/posts/:id/comments` | `comment.route.ts` | **PUBLIC** | MATCH |
| `commentsApi.create` | `POST` | `/api/v1/posts/:id/comments` | `comment.route.ts` | **PUBLIC** | MATCH |
| `subscribersApi.subscribe` | `POST` | `/api/v1/subscribers` | `subscriber.route.ts` | **PUBLIC** | MATCH |
| `categoriesApi.getAll` | `GET` | `/api/v1/categories` | `category.route.ts` | **PUBLIC** | MATCH |
| `tagsApi.getAll` | `GET` | `/api/v1/tags` | `tag.route.ts` | **PUBLIC** | MATCH |
| `siteSettingsApi.get` | `GET` | `/api/v1/site-settings` | `site-settings.route.ts` | **PUBLIC** | MATCH |
| `aboutApi.get` / `fetch("/about")` | `GET` | `/api/v1/about` | `about.route.ts` | **PUBLIC** | MATCH |

**Result**: Public app calls **ZERO** admin or privileged routes. Mismatches: **0**.

---

## 5. Public App Leak Scan & Build Output

### Source Code Grep
Command:
```bash
git grep -n -i -E "zibon/|/login|/register|ADMIN|authStore|tiptap|NEXT_PUBLIC_ADMIN|cms\." -- src package.json next.config.ts
```
**Output**: `0 matches` (clean exit).

### Environment File Grep
Command:
```powershell
Get-ChildItem -Path frontend/.env* | Select-String -Pattern "zibon/|/login|/register|ADMIN|authStore|tiptap|NEXT_PUBLIC_ADMIN|cms\."
```
**Output**: `0 matches`.

### Build Route Outputs
**`frontend/`**:
```text
Route (app)                       Revalidate  Expire
┌ ƒ /
├ ○ /_not-found
├ ƒ /[year]/[month]/[day]/[slug]
├ ƒ /about
├ ƒ /category/[slug]
├ ○ /robots.txt
├ ○ /sitemap.xml                          1h      1y
└ ƒ /tag/[slug]
```
*Zero `/zibon`, `/login`, or `/register` routes exist.*

**`admin/`**:
```text
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /categories
├ ○ /dashboard
├ ○ /homepage
├ ○ /login
├ ○ /media
├ ○ /posts
├ ƒ /posts/[id]/edit
├ ○ /posts/new
├ ○ /robots.txt
├ ○ /settings
├ ○ /subscribers
└ ○ /tags
```

### Search Inside `frontend/.next` Artifacts
- Pattern `"zibon/dashboard"`: **0 occurrences** across all files.
- Pattern `"tiptap"`: **0 occurrences** across all files.
- Pattern `"cms."`: **0 occurrences** across all files.
*(Note: A generic `@example ... LayoutProps<'/dashboard'>` string is present in Next.js's built-in framework type declaration file `frontend/.next/types/routes.d.ts:50`; no actual application chunk or route bundle references `/dashboard`).*

---

## 6. Admin App Security & Isolation

### Server Session Verification (No Trust in `localStorage`)
In [AuthGuard.tsx:15-36](file:///d:/Zibon-Vlog/admin/src/components/AuthGuard.tsx#L15-L36):
```typescript
    const verifyAdmin = async () => {
      try {
        const res = await authApi.getProfile();
        const profile = res?.data?.data;
        if (profile && profile.role === "ADMIN") {
          if (isMounted) {
            setAuth(profile);
            setIsVerifying(false);
          }
        } else {
          if (isMounted) {
            clearAuth();
            router.replace("/login");
          }
        }
      } catch (error) {
        if (isMounted) {
          clearAuth();
          router.replace("/login");
        }
      }
    };
```
In [authStore.ts:22-40](file:///d:/Zibon-Vlog/admin/src/store/authStore.ts#L22-L40):
```typescript
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
```
`localStorage` is completely absent. State is strictly in-memory.

### SEO & Indexing Prevention
1. Root Metadata ([admin/src/app/layout.tsx:11](file:///d:/Zibon-Vlog/admin/src/app/layout.tsx#L11)):
   ```typescript
   robots: { index: false, follow: false },
   ```
2. Security Headers ([admin/next.config.ts:18-28](file:///d:/Zibon-Vlog/admin/next.config.ts#L18-L28)):
   ```typescript
   headers: [
     { key: "X-Robots-Tag", value: "noindex, nofollow" },
     { key: "X-Frame-Options", value: "DENY" },
     { key: "X-Content-Type-Options", value: "nosniff" },
     { key: "Referrer-Policy", value: "origin-when-cross-origin" },
   ]
   ```
3. Robots Disallow ([admin/src/app/robots.ts:6-9](file:///d:/Zibon-Vlog/admin/src/app/robots.ts#L6-L9)):
   ```typescript
   rules: {
     userAgent: "*",
     disallow: "/",
   }
   ```

### Public Component Import Isolation
`git grep -n "components/public" admin/src` returns **zero hits**.

---

## 7. Secrets & Git History Audit

### Tracked Environment Files
Command: `git ls-files | Select-String -Pattern "env"`
Output:
- `admin/.env.example`
- `backend/.env.example`

`backend/.env` and `frontend/.env.local` are uncommitted and ignored by `.gitignore`.

### Historical Git Commits Audit
Command: `git log --all --oneline -- backend/.env frontend/.env.local`
Output: **None** (neither file has ever been committed to git).

### 50-Commit History Pattern Audit
- Old Seed Fallback:
  - In commit `2cb04f9` (`prisma/seed.ts`), fallback defaults existed (`admin@zibon.com` / `Admin123!`).
  - In commit `2d75bb9` ([seed.ts:14-18](file:///d:/Zibon-Vlog/backend/prisma/seed.ts#L14-L18)), the fallbacks were removed and replaced with a mandatory exception:
    ```typescript
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variable. Both are required for seeding.'
      );
    }
    ```
- `JWT_SECRET=`: Only placeholder occurrences found in `README.md` (`JWT_SECRET=your-jwt-secret-key`).
- `CLOUDINARY_API_SECRET=`: Only placeholder occurrences found in `README.md` (`CLOUDINARY_API_SECRET=your-api-secret`).
- `mysql://` with credentials: Only placeholder occurrences found in `README.md` (`DATABASE_URL=mysql://user:password@host:port/database`).
Zero production secrets exist in the git history or working tree.

---

## 8. Dependency Audit (`npm audit --omit=dev`)

### Summary by Component

| Component | Total Vulnerabilities | Low | Moderate | High | Critical | Key Critical Packages |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`backend/`** | **13** | 0 | 1 (`qs`) | 9 (`body-parser`, `brace-expansion`, `deepmerge-ts`, `source-map-js`, `undici`, `zod`) | 3 | `dompurify`, `proxy-addr`, `tar` |
| **`frontend/`** | **8** | 0 | 1 (`baseline-browser-mapping`) | 6 (`axios`, `follow-redirects`, `nanoid`, `postcss`, `sharp`, `source-map-js`) | 1 | `next` (v16.2.10) |
| **`admin/`** | **3** | 0 | 0 | 2 (`postcss`, `sharp`) | 1 | `next` (v16.2.10) |

*(Note: Per safety instructions, `npm audit fix` was NOT executed).*

---

## 9. TypeScript Compilation Verification

Command: `npx tsc --noEmit`

| Package Folder | Command Exit Code | Compiler Output | Status |
| :--- | :--- | :--- | :--- |
| `backend/` | `0` | Clean (0 errors) | **PASS** |
| `admin/` | `0` | Clean (0 errors) | **PASS** |
| `frontend/` | `0` | Clean (0 errors) | **PASS** |

---

## 10. Prisma Migrations vs. `schema.prisma` Audit

Comparison of `backend/prisma/schema.prisma` against `backend/prisma/migrations/`:

### Migration History on Disk
- `20260709034401_init/migration.sql`: Created `users`, `posts`, and `media` tables.
- `20260709035849_change_default_role/migration.sql`: Altered default role on `users` table to `USER`.

### Database Objects in `schema.prisma` NOT Covered by Migrations
1. **Missing Tables (6 Entire Models)**:
   - `site_settings` ([schema.prisma:137-202](file:///d:/Zibon-Vlog/backend/prisma/schema.prisma#L137-L202))
   - `subscribers` ([schema.prisma:208-214](file:///d:/Zibon-Vlog/backend/prisma/schema.prisma#L208-L214))
   - `categories` ([schema.prisma:220-237](file:///d:/Zibon-Vlog/backend/prisma/schema.prisma#L220-L237))
   - `tags` ([schema.prisma:243-253](file:///d:/Zibon-Vlog/backend/prisma/schema.prisma#L243-L253))
   - `comments` ([schema.prisma:259-278](file:///d:/Zibon-Vlog/backend/prisma/schema.prisma#L259-L278))
   - `about_page` ([schema.prisma:284-303](file:///d:/Zibon-Vlog/backend/prisma/schema.prisma#L284-L303))
2. **Missing Join Tables (2 Implicit M:N Relations)**:
   - `_PostCategories` (Post <-> Category many-to-many join table)
   - `_PostTags` (Post <-> Tag many-to-many join table)
3. **Missing Columns on Existing `posts` Table**:
   - `isFeatured` (`Boolean @default(false)`)
   - `readTime` (`Int?`)
   - `displayOrder` (`Int?`)
   - `views` (`Int @default(0)`)
   - `categoryId` (`String?`, foreign key to `categories.id`)
   - Indexes on `posts`: `@@index([categoryId])`, `@@index([isFeatured])`

### Impact
Running `npx prisma migrate deploy` in a clean production database will only create `users`, `posts` (legacy schema), and `media`. It will **fail to create the rest of the application tables**.

---

## 11. PASS / FAIL Verdict & Production Blockers

| Item | Verification Task | Verdict | Notes |
| :---: | :--- | :---: | :--- |
| **1** | Backend Route Table & Privileged Route Verification | **PASS** | All 18 admin endpoints have `authorize("ADMIN")`. |
| **2** | Registration Removed & Non-Admin Login Rejection | **PASS** | `/auth/register` is deleted; generic 401 thrown for non-ADMIN. |
| **3** | Cookie Options, Trust Proxy, CORS & CSRF Defense | **PASS** | `sameSite: "strict"`, host-only, 24h maxAge, `trust proxy: 1`, CSRF check active. |
| **4** | Client Match Matrix | **PASS** | Public site calls zero admin routes; all 27 admin calls match backend routes. |
| **5** | Public App Leak Scan | **PASS** | 0 hits for admin/login/register/tiptap/cms. |
| **6** | Admin App Security & Isolation | **PASS** | Server-verified session in memory, noindex headers, zero public imports. |
| **7** | Secrets & Git History Audit | **PASS** | No tracked `.env` files; zero production credentials committed. |
| **8** | NPM Audit (`--omit=dev`) | **PASS** (Reported) | Audit completed without fix; vulnerabilities documented. |
| **9** | TypeScript Static Verification (`tsc`) | **PASS** | 0 errors across `backend`, `admin`, and `frontend`. |
| **10** | Prisma Migrations vs. `schema.prisma` | **FAIL** (Blocker) | 6 tables, 2 join tables, and 5 `posts` columns missing from migration files. |

---

### Production Blockers
1. **Prisma Migration Desynchronization (BLOCKER)**:
   - `migrations/` is out of date. Before deploying to production, a migration must be generated (e.g. `npx prisma migrate dev --name add_all_models_and_relations` against a development database) to serialize the 6 missing models, 2 M:N join tables, and new `posts` columns into SQL migration scripts for `prisma migrate deploy`.
2. **Production Dependency Advisories**:
   - Critical vulnerabilities in `next` (v16.2.10), `dompurify` (<=3.4.16), and `tar` (<=7.5.20). Update dependencies via normal version bumps prior to live production hosting.
3. **Environment Setup**:
   - Production instances must supply `PUBLIC_FRONTEND_URL=https://ferdausanamjibon.com` and `ADMIN_FRONTEND_URL=https://cms.ferdausanamjibon.com` to `backend/.env` to allow CORS and CSRF validation.
   - Admin instance must supply `NEXT_PUBLIC_API_URL=https://api.ferdausanamjibon.com/api/v1` and `NEXT_PUBLIC_SITE_URL=https://ferdausanamjibon.com`.
   - Public instance must supply `NEXT_PUBLIC_API_URL=https://api.ferdausanamjibon.com/api/v1` and `NEXT_PUBLIC_SITE_URL=https://ferdausanamjibon.com`.

