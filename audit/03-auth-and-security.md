# Authentication & Authorization Technical Audit (Phase 4)

> **Audit Date:** 2026-11-12  
> **Target Project:** `Zibon-Vlog`  
> **Auditor:** Senior Full-Stack Engineer  
> **Audit Status:** Read-Only Technical Audit — Phase 4 Complete  
> **Scope:** End-to-end authentication, authorization, role management, guards, cryptography, CORS/CSRF configurations, session persistence, and secrets.

---

## 1. End-to-End Authentication Architecture

The application implements a stateless JSON Web Token (JWT) authentication system stored exclusively in an **HttpOnly cookie**. There is no server-side session table, no refresh token rotation, and no token revocation mechanism.

```
┌────────────────┐          1. POST /api/v1/auth/login           ┌────────────────┐
│                │ ────────────────────────────────────────────> │                │
│ Browser Client │                                               │ Express Server │
│                │ <──────────────────────────────────────────── │                │
│                │   2. Set-Cookie: token=<jwt>; HttpOnly;       │                │
│                │      Response JSON: { user: {...} }           │                │
└────────────────┘                                               └────────────────┘
         │
         │ 3. Client writes user to localStorage:
         ▼    localStorage.setItem("auth_user", JSON.stringify(user))
┌────────────────────────────────────────────────────────┐
│ Zustand In-Memory Store (authStore.ts)                 │
│  - user: User | null                                   │
│  - isAuthenticated: boolean                            │
│  - isLoading: boolean                                  │
└────────────────────────────────────────────────────────┘
```

### 1.1 Step-by-Step Login Flow
1. **Client Submission:**
   - User inputs credentials in `frontend/src/app/(public)/login/page.tsx:30-54`.
   - Form triggers `authApi.login({ email, password })` in `frontend/src/lib/api.ts:39-40`.
   - Sends HTTP `POST` request to `/api/v1/auth/login`.
2. **Backend Authentication & Verification:**
   - Route handled by `backend/src/module/user/user.route.ts:12-16` through `UserController.login` in `backend/src/module/user/user.controller.ts:22-36`.
   - Request validated by `validateRequest(UserValidation.login)` in `backend/src/module/user/user.validation.ts:18-27` (checks email format and minimum 1-character password via `password: z.string().min(1, "Password is required")`; note that `UserValidation.register` requires `min(6)` at line 14, but `login` only requires `min(1)`).
   - In `backend/src/module/user/user.service.ts:36-50`:
     - Queries DB for user: `prisma.user.findUnique({ where: { email } })`.
     - Compares submitted password with hashed password in DB via `bcrypt.compare(data.password, user.password)` (`user.service.ts:43`).
     - If invalid, throws `ApiError(401, "Invalid email or password.")`.
3. **Token Issuance & Cookie Transport:**
   - On valid credentials, signs a JWT via `generateToken(user.id, user.email, user.role)` in `user.service.ts:90-97`:
     - **Algorithm:** HMAC-SHA256 (`jsonwebtoken` default)
     - **Payload:** `{ id: string, email: string, role: string }`
     - **Secret:** `config.jwt.secret` (from `JWT_SECRET` in `.env`)
     - **Expiry:** `config.jwt.expiresIn` (defaults to `"7d"`)
   - In `user.controller.ts:24-29`, attaches the cookie to the HTTP response:
     ```ts
     res.cookie("token", token, {
       httpOnly: true,
       secure: config.nodeEnv === "production",
       sameSite: config.nodeEnv === "production" ? "none" : "lax",
       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
     });
     ```
   - Sends JSON response:
     ```json
     {
       "statusCode": 200,
       "success": true,
       "message": "Login successful",
       "data": {
         "user": {
           "id": "cm...",
           "name": "...",
           "email": "...",
           "role": "ADMIN",
           "createdAt": "..."
         }
       }
     }
     ```
4. **Client State Persistence & Rehydration:**
   - `login/page.tsx:40` calls `setAuth(user)` from `frontend/src/store/authStore.ts:23-28`.
   - `authStore` writes the unencrypted user object to `localStorage`:
     ```ts
     localStorage.setItem("auth_user", JSON.stringify(user));
     ```
   - On page refresh or new tab, `authStore.hydrate()` (`authStore.ts:48-62`) parses `localStorage.getItem("auth_user")` and populates Zustand state.
   - **Critical Vulnerability:** The frontend **NEVER validates the session with the server on page load**. `authApi.getProfile()` (`/users/profile`) exists in `api.ts:42` but is never called on app initialization!

---

## 2. Role Management & Administration

### 2.1 Role Definition in Database
- **Enum Definition:** `backend/prisma/schema.prisma:16-19`:
  ```prisma
  enum Role {
    USER
    ADMIN
  }
  ```
- **User Table Definition:** `backend/prisma/schema.prisma:40`:
  ```prisma
  role      Role     @default(USER)
  ```
- **Migration Verification:** `backend/prisma/migrations/20260709035849_change_default_role/migration.sql:2`:
  ```sql
  ALTER TABLE `User` MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';
  ```

### 2.2 How the First Admin Account Is Created
- Handled exclusively via the database seed script in `backend/prisma/seed.ts:11-29`:
  ```ts
  const adminEmail = process.env.ADMIN_EMAIL || 'zibon@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '[REDACTED_FALLBACK]'; // Hardcoded fallback exists in backend/prisma/seed.ts:12
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'ফেরদৌস আনাম জীবন',
      role: Role.ADMIN,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'ফেরদৌস আনাম জীবন',
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/...',
    },
  });
  ```
- **Security Finding:** If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not provided in environment variables, the system provisions an administrative account with hardcoded credentials:
  - **Email:** `zibon@gmail.com` (fallback in `backend/prisma/seed.ts:11`)
  - **Password:** A hardcoded plaintext fallback exists in `backend/prisma/seed.ts:12` (masked for security; hashed with bcrypt 12 rounds)

### 2.3 User Registration Role Assignment
- When a public user registers via `POST /api/v1/auth/register` (`frontend/src/app/(public)/register/page.tsx`), `backend/src/module/user/user.service.ts:19-32` executes:
  ```ts
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  ```
- Because no `role` field is passed in the create payload, Prisma applies the schema default: `Role.USER`.

---

## 3. Privilege Escalation & The RBAC Breakdown

A severe privilege escalation flaw exists due to the architectural disconnect between client-side route guards and backend endpoint authorization.

### 3.1 The Client-Side Gate: `AuthGuard.tsx`
Admin routes are protected on the frontend by `frontend/src/components/zibon/AuthGuard.tsx:1-40`:
```tsx
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  return <>{children}</>;
}
```

#### Flaw Analysis:
1. `AuthGuard` evaluates `user?.role !== "ADMIN"` entirely from the client-side Zustand store.
2. The Zustand store populates itself from `localStorage.getItem("auth_user")` (`authStore.ts:50`).
3. There is no cryptographic signature, HMAC, or server-side session check protecting `localStorage`.

### 3.2 The Backend Gate: `auth` vs `authorize`
In `backend/src/middleware/auth.ts`:
- **`auth` middleware (lines 13-54):**
  - Reads `req.cookies?.token`.
  - Verifies the JWT signature with `config.jwt.secret`.
  - Checks if user exists in the database.
  - Attaches `req.user = { id: user.id, email: user.email, role: user.role }`.
  - **Crucial:** `auth` **DOES NOT check the user's role**. It only checks if the requester is authenticated!
- **`authorize(...roles)` middleware (lines 55-67):**
  - Checks `if (!roles.includes(req.user.role)) throw new ApiError(403, "Forbidden")`.
  - **Crucial:** `authorize("ADMIN")` is **ONLY applied to a single endpoint in the entire application**:
    - `backend/src/module/about/about.route.ts:8`: `router.put("/", auth, authorize("ADMIN"), AboutController.updateAbout);`
  - It is **MISSING on 18 administrative endpoints**!

### 3.3 The Exploit Scenario (Verified)
Because the backend endpoints only check `auth` (logged-in status) and omit `authorize("ADMIN")`:
1. An attacker visits `https://domain.com/register` and creates a standard account (`role: USER`).
2. The server issues a valid, signed 7-day JWT cookie for this user.
3. In the browser, the attacker opens Developer Tools (Console) and executes:
   ```javascript
   const u = JSON.parse(localStorage.getItem("auth_user"));
   u.role = "ADMIN";
   localStorage.setItem("auth_user", JSON.stringify(u));
   ```
4. The attacker reloads the page and navigates to `/zibon/dashboard`.
5. `AuthGuard.tsx` reads `auth_user` from `localStorage`, sees `role: "ADMIN"`, and permits full entry to the Admin Panel UI.
6. The attacker can now perform operations against the backend API with the following exact backend behaviors:
   - `POST /api/v1/posts` (**SUCCEEDS:** Any authenticated `USER` can create published articles; `authorId` is set to the user's own id).
   - `PATCH /api/v1/posts/:id` (**BLOCKED for other authors:** `backend/src/module/post/post.service.ts:415-417` checks `if (existingPost.authorId !== authorId) throw new ApiError(403, "You do not have permission to edit this post.")`. A `USER` can only edit their *own* posts. Note that because `post.service.ts` never inspects `user.role`, an `ADMIN` is ALSO blocked from editing posts authored by other users).
   - `DELETE /api/v1/posts/:id` (**BLOCKED for other authors:** `backend/src/module/post/post.service.ts:487-489` checks `if (post.authorId !== authorId) throw new ApiError(403, "You do not have permission to delete this post.")`. A `USER` can only delete their *own* posts, and an `ADMIN` cannot delete posts authored by other users).
   - `POST /api/v1/categories` (**SUCCEEDS:** Any authenticated `USER` can create categories globally).
   - `PATCH /api/v1/categories/:id` (**SUCCEEDS:** Any authenticated `USER` can modify any category).
   - `DELETE /api/v1/categories/:id` (**SUCCEEDS:** Any authenticated `USER` can delete any category without posts).
   - `POST /api/v1/tags` (**SUCCEEDS:** Any authenticated `USER` can create tags).
   - `PATCH /api/v1/tags/:id` (**SUCCEEDS:** Any authenticated `USER` can modify tags).
   - `DELETE /api/v1/tags/:id` (**SUCCEEDS:** Any authenticated `USER` can delete tags).
   - `POST /api/v1/media/upload` (**SUCCEEDS:** Any authenticated `USER` can upload up to 100MB files to Cloudinary).
   - `GET /api/v1/media` (**SUCCEEDS:** Any authenticated `USER` can enumerate all media assets).
   - `DELETE /api/v1/media/:id` (**SUCCEEDS:** Any authenticated `USER` can delete any media asset from Cloudinary and DB).
   - `GET /api/v1/subscribers` (**SUCCEEDS / PRIVACY LEAK:** Any authenticated `USER` can harvest the full email subscriber list).
   - `DELETE /api/v1/subscribers/:id` (**SUCCEEDS:** Any authenticated `USER` can delete subscribers).
   - `PATCH /api/v1/site-settings` (**SUCCEEDS:** Any authenticated `USER` can mutate homepage, hero, footer, and brand settings).
   - `PUT /api/v1/about` (**BLOCKED:** Fails with 403 Forbidden because `backend/src/module/about/about.route.ts:8` applies `authorize("ADMIN")`).

---

## 4. Middleware & Route Protection Inventory

| Component / Middleware | Location | Applied To | What It Protects | Identified Vulnerabilities & Gaps |
|------------------------|----------|------------|------------------|-----------------------------------|
| **`auth` Middleware** | `backend/src/middleware/auth.ts:13-54` | 21 backend endpoints | Ensures requester has a valid signed JWT in `req.cookies.token`. | - **Ignores `Authorization: Bearer`:** Does not read `req.headers.authorization`.<br>- **No RBAC:** Does not verify if `role === 'ADMIN'`.<br>- **DB query on every request:** Executes `prisma.user.findUnique` on every authenticated API call without caching. |
| **`authorize("ADMIN")`** | `backend/src/middleware/auth.ts:55-67` | `PUT /api/v1/about` (`about.route.ts:8`) | Ensures `req.user.role === 'ADMIN'`. | **Completely absent** from 18 administrative routes (posts CRUD, categories CRUD, tags CRUD, media CRUD, subscribers delete, site-settings update). |
| **`AuthGuard`** | `frontend/src/components/zibon/AuthGuard.tsx:1-40` | All 10 admin pages inside `zibon/(dashboard)/layout.tsx:15` | Hides admin UI from unauthenticated users or users whose `user.role !== 'ADMIN'`. | - Purely client-side.<br>- Reads unverified `localStorage`.<br>- No server-side session ping (`getProfile`) on load.<br>- Trivially bypassed via DevTools console. |
| **`validateRequest`** | `backend/src/middleware/validateRequest.ts:1-18` | Select routes (user auth, post create/update, category create/update, tag create/update, site-settings update) | Validates `req.body` against a Zod schema. | - Missing on `POST /posts/:id/comments` & `GET /posts/:id/comments`<br>- Missing on `PUT /about` (no Zod schema defined)<br>- Missing on `DELETE /categories/:id`, `DELETE /tags/:id`, `DELETE /subscribers/:id`<br>- Missing on `PATCH /media/:id/link`. |
| **`globalErrorHandler`** | `backend/src/middleware/globalErrorHandler.ts:1-94` | Global Express error handler (`app.ts:87`) | Formats error responses, catches Prisma constraint errors and Zod validation errors. | Exposes internal stack traces in development mode (`nodeEnv === 'development'`). |

---

## 5. Cryptography, Passwords & Secrets

### 5.1 Password Hashing
- **Library:** `bcrypt` (`^5.1.1` in `backend/package.json:34`).
- **Salt Rounds:** `12` (`backend/src/module/user/user.service.ts:17` and `backend/prisma/seed.ts:13`).
- **Timing Attacks:** Handled by standard `bcrypt.compare` (`user.service.ts:43`).
- **Password Exposure:** Password field is stripped using ES6 rest destructuring before returning the user object:
  ```ts
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
  ```

### 5.2 Token Characteristics
- **Algorithm:** HS256 (HMAC with SHA-256).
- **Secret Key:** `process.env.JWT_SECRET` (loaded in `backend/src/config/index.ts:11`).
- **Token Expiration:** Configured via `process.env.JWT_EXPIRES_IN || "7d"` (`config/index.ts:12`).
- **Lack of Rotation:** There is no refresh token mechanism (`JWT_REFRESH_SECRET` does not exist).
- **Inability to Invalidate:** If an admin's laptop or token is compromised, the token remains valid for the full 7-day period. The backend does not maintain a revocation list or token version counter on the user record.

---

## 6. Security Configurations: CORS, CSRF, Cookies, Rate Limits

### 6.1 CORS Configuration
Configured in `backend/src/app.ts:22-29`:
```ts
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```
- **Configuration Analysis:**
  - `config.frontendUrl` is loaded from `process.env.FRONTEND_URL || "http://localhost:3000"` (`config/index.ts:19`).
  - **Split Risk:** `origin` is configured as a single string. When the project is split into **(A) Public Frontend** (`https://zibonvlog.com`) and **(B) Admin Panel** (`https://admin.zibonvlog.com`), this CORS setup will immediately break because Express `cors` will reject requests from the second domain unless refactored to support an array or validation function.

### 6.2 CSRF Vulnerability
- **CSRF Tokens:** There is **NO CSRF protection** anywhere in the backend (no `csurf`, no double-submit cookie, no custom header verification).
- **SameSite Cookie Behavior in Production:**
  In `backend/src/module/user/user.controller.ts:12, 27`:
  ```ts
  sameSite: config.nodeEnv === "production" ? "none" : "lax"
  ```
  - When `NODE_ENV === "production"`, `sameSite: "none"` is explicitly configured so cookies can traverse cross-origin contexts.
  - With `sameSite: "none"` and `credentials: true`, cross-site requests carry the authentication cookie. While modern browsers restrict cross-origin read access, cross-origin write requests (state-changing mutations) can be triggered if CORS preflight is bypassed or if standard methods are invoked.

### 6.3 Cookie Security Flags
In `backend/src/module/user/user.controller.ts:9-14, 24-29`:
- `httpOnly: true`: JavaScript in the browser cannot read `document.cookie` (Mitigates XSS token extraction).
- `secure: config.nodeEnv === "production"`: Only transmitted over HTTPS in production.
- `maxAge: 7 * 24 * 60 * 60 * 1000`: 7-day lifespan.
- **Logout Clears Cookie:** `UserController.logout` in `user.controller.ts:38` calls `res.clearCookie("token")`.

### 6.4 Rate Limiting Configuration
Configured in `backend/src/app.ts:30-52` using `express-rate-limit`:
1. **General API Limiter (`app.ts:30-41`):**
   - Window: 15 minutes (`15 * 60 * 1000`)
   - Max Requests: 500
   - Applied to: `/api/v1/`
2. **Auth Limiter (`app.ts:42-52`):**
   - Window: 15 minutes (`15 * 60 * 1000`)
   - Max Requests: 50
   - Applied to: `/api/v1/auth` (`app.ts:55`)
3. **Identified Rate Limit Gaps:**
   - **Comments Endpoint:** `POST /api/v1/posts/:id/comments` (`comment.route.ts:6`) has NO dedicated rate limiter. An automated bot can flood the database with spam comments up to the 500 requests/15min threshold.
   - **Subscriber Signup:** `POST /api/v1/subscribers` (`subscriber.route.ts:15`) has NO dedicated limiter, allowing bot email floods.

### 6.5 HTTP Security Headers (Helmet)
- `app.use(helmet())` is invoked in `backend/src/app.ts:20`.
- Applied with default Helmet settings:
  - `X-DNS-Prefetch-Control: off`
  - `X-Frame-Options: SAMEORIGIN`
  - `Strict-Transport-Security: max-age=15552000; includeSubDomains`
  - `X-Download-Options: noopen`
  - `X-Content-Type-Options: nosniff`
  - `X-Permitted-Cross-Domain-Policies: none`
  - `Referrer-Policy: no-referrer`
- **Gap:** Content Security Policy (CSP) is not explicitly defined in Helmet. Next.js does not configure CSP headers either.

---

## 7. Hardcoded Secrets, Fallbacks & Environment Variables

### 7.1 Hardcoded Secrets & Fallback Credentials

| File & Line Number | Hardcoded Value / Fallback Pattern | Severity | Impact |
|--------------------|-----------------------------------|----------|--------|
| `backend/prisma/seed.ts:11` | `process.env.ADMIN_EMAIL \|\| 'zibon@gmail.com'` | **Critical** | Default admin email known publicly in repository code. |
| `backend/prisma/seed.ts:12` | `process.env.ADMIN_PASSWORD \|\| '[REDACTED_FALLBACK]'` | **Critical** | Hardcoded plaintext fallback password exists in repository code (`backend/prisma/seed.ts:12`). |
| `frontend/src/app/robots.ts:9` | `sitemap: "http://localhost:3000/sitemap.xml"` | **Medium** | Hardcoded development URL in production robots.txt metadata. |
| `frontend/src/app/sitemap.ts:4` | `const baseUrl = "http://localhost:3000";` | **Medium** | Hardcoded localhost baseUrl in production sitemap generator. |
| `frontend/src/app/sitemap.ts:14` | `fetch("http://localhost:5000/api/v1/posts?limit=1000")` | **Medium** | Hardcoded backend localhost API URL in sitemap generator. |
| `frontend/src/lib/api.ts:8` | `process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:5000/api/v1"` | **Low** | Development fallback URL for Axios client. |
| `backend/src/config/index.ts:5` | `parseInt(process.env.PORT \|\| "5000", 10)` | **Low** | Development fallback port. |
| `backend/src/config/index.ts:12` | `process.env.JWT_EXPIRES_IN \|\| "7d"` | **Low** | Token expiration default fallback. |
| `backend/src/config/index.ts:19` | `process.env.FRONTEND_URL \|\| "http://localhost:3000"` | **Low** | CORS origin development fallback. |

### 7.2 Environment Variable Inventory (Masked Values)

#### Backend Environment Variables (`backend/.env` & `backend/src/config/index.ts`):
- `PORT`: Server listening port (default: `5000`).
- `NODE_ENV`: Execution environment (`development` / `production`).
- `DATABASE_URL`: MySQL database connection string (`mysql://user:***@host:port/dbname`).
- `JWT_SECRET`: Cryptographic signing secret for JSON Web Tokens (`***`).
- `JWT_EXPIRES_IN`: JWT expiration window (e.g. `7d`).
- `FRONTEND_URL`: Permitted CORS origin URL (e.g. `http://localhost:3000`).
- `CLOUDINARY_CLOUD_NAME`: Cloudinary account cloud identifier.
- `CLOUDINARY_API_KEY`: Cloudinary API credential key.
- `CLOUDINARY_API_SECRET`: Cloudinary API credential secret (`***`).
- `ADMIN_EMAIL`: Email address used for database seed provisioning.
- `ADMIN_PASSWORD`: Plaintext password used for database seed provisioning (`***`).

#### Frontend Environment Variables (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL`: Base REST API endpoint URL (e.g. `http://localhost:5000/api/v1`).

---

## 8. Summary of Action Items for the Three-Way Split

To securely split this application into (A) Public Frontend, (B) Admin Panel, and (C) Backend Server:

1. **Implement True Backend RBAC:**
   - Add `authorize("ADMIN")` to all 18 unprotected administrative endpoints. Never rely on the client or the `auth` middleware alone to protect admin functionality.
2. **Support Multiple CORS Origins:**
   - Update `backend/src/app.ts:24` to accept an array of origins: `[process.env.FRONTEND_URL, process.env.ADMIN_URL]`.
3. **Decouple Admin Auth from Public Auth:**
   - Separate visitor sessions from admin sessions.
   - The Public Frontend should have no concept of `ADMIN` roles or `/zibon` routes.
   - The Admin Panel should have its own dedicated `/login` page pointing to an isolated admin authentication flow.
4. **Implement Token Revocation & Server-Side Verification:**
   - Add a `/api/v1/auth/me` or `/api/v1/users/profile` verification call on Admin Panel load to confirm token validity against the database rather than trusting `localStorage`.
5. **Support `Authorization: Bearer` Header:**
   - Update `backend/src/middleware/auth.ts:19` to check `req.headers.authorization` in addition to `req.cookies?.token`. This allows cross-domain admin communication without complex third-party cookie handling.
6. **Eliminate Hardcoded Credentials:**
   - Remove fallback seed passwords from `backend/prisma/seed.ts:11-12`. Throw an error during seeding if `ADMIN_PASSWORD` is not explicitly set in the environment.

