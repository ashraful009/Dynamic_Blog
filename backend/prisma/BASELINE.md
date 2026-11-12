# Database Migration Baseline & VPS Runbook

This document outlines the step-by-step procedures for initializing and managing migrations for the production database using Prisma.

The migration baseline folder is:
```text
backend/prisma/migrations/20261112130000_baseline/migration.sql
```
Legacy migration files have been moved to `backend/prisma/migrations_legacy/` for historical reference and should remain outside the Prisma migrations directory.

---

## 1. Critical Rules & Guardrails

> [!CAUTION]
> **NEVER run `npx prisma migrate dev` or `npx prisma migrate reset` against production, staging, or live databases.**
> - `migrate dev` is an interactive development command that may detect drift and prompt to DROP entire tables or the entire schema.
> - `migrate reset` will unconditionally DROP the database and purge all data.
> - **In production, always use `npx prisma migrate deploy` or `npx prisma migrate resolve`.**

---

## 2. Pre-flight Database Server Requirements

1. **Database Engine & Version**:
   - Must be **MySQL 8.0+** or **MariaDB 10.6+**.
   - Check version:
     ```sql
     SELECT VERSION();
     ```
   - *Reason*: Prisma schema uses native `Json` types (`site_settings.navLinks`, `site_settings.footerLinks`, `site_settings.sidebarGoodreadsBooks`, `about_page.skills`), which require modern MySQL/MariaDB JSON functions and storage.

2. **Character Set & Collation**:
   - The database **must** be created with `utf8mb4` character set and `utf8mb4_unicode_ci` collation to support Bengali text and Unicode emoji without character corruption.
   - All 11 tables in `20261112130000_baseline/migration.sql` explicitly declare `DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.
   - Verify database settings:
     ```sql
     SELECT default_character_set_name, default_collation_name
     FROM information_schema.SCHEMATA
     WHERE schema_name = 'zibon_blog';
     ```

---

## 3. Pre-Deployment Testing on Scratch Database (Always Test First)

Before applying migrations to the live database, run a rehearsal on a temporary scratch database on the same server:

1. Create a scratch database:
   ```sql
   CREATE DATABASE zibon_blog_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Run `migrate deploy` targeting the scratch database:
   ```bash
   cd backend
   export DATABASE_URL="mysql://DB_USER:DB_PASS@127.0.0.1:3306/zibon_blog_test"
   npx prisma migrate deploy
   ```

3. Verify zero drift:
   ```bash
   npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
   ```
   *Expected output: (Empty / no output).*

4. Test JSON column read/write:
   ```bash
   node -e '
   const { PrismaClient } = require("@prisma/client");
   const prisma = new PrismaClient();
   async function test() {
     const record = await prisma.siteSettings.create({
       data: {
         id: "test",
         heroTitle: "টেস্ট শিরোনাম",
         navLinks: [{ label: "হোম", path: "/" }],
         footerLinks: [{ label: "গোপনীয়তা", path: "/privacy" }],
         sidebarGoodreadsBooks: []
       }
     });
     console.log("JSON write success:", record.navLinks);
     await prisma.siteSettings.delete({ where: { id: "test" } });
     console.log("Cleanup complete");
   }
   test().catch(console.error).finally(() => prisma.$disconnect());
   '
   ```

5. Drop scratch database after successful test:
   ```sql
   DROP DATABASE zibon_blog_test;
   ```

---

## 4. Production Deployment Procedures

Choose either **Case 1** or **Case 2** depending on your database state:

### CASE 1: Fresh Empty Database on VPS

Use this case if you are provisioning a completely new, empty database.

1. **Create the database with utf8mb4**:
   ```sql
   CREATE DATABASE zibon_blog
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure environment variable**:
   ```bash
   export DATABASE_URL="mysql://DB_USER:DB_PASS@127.0.0.1:3306/zibon_blog"
   ```

3. **Deploy the baseline migration**:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
   *Expected output*: `1 migration found in prisma/migrations ... 20261112130000_baseline applied`.

4. **Verify zero drift**:
   ```bash
   npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
   ```
   *Expected output*: Completely empty output. If any SQL is output, stop and inspect.

5. **Verify migration status**:
   ```bash
   npx prisma migrate status
   ```
   *Expected output*: `Database schema is up to date!`

---

### CASE 2: Database Already Has Tables / Data (e.g., Imported Dump)

Use this case if the production database already contains existing tables and data (e.g. from an existing database dump).

1. **Take an immediate full backup**:
   ```bash
   mysqldump -u DB_USER -p --single-transaction --quick --lock-tables=false zibon_blog > /path/to/backups/backup_pre_baseline_$(date +%Y%m%d_%H%M%S).sql
   ```
   *Confirm the backup file was created and is non-empty before proceeding.*

2. **Run drift check**:
   Compare the live database structure against the Prisma schema:
   ```bash
   cd backend
   export DATABASE_URL="mysql://DB_USER:DB_PASS@127.0.0.1:3306/zibon_blog"
   npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
   ```
   - **If the output is EMPTY**: The database schema matches `prisma/schema.prisma` perfectly. Proceed to Step 3.
   - **If the output is NOT EMPTY**: **STOP.** Do NOT run resolve or deploy. Inspect the printed diff. The database schema has diverged from `schema.prisma`. Resolve column/index differences before proceeding.

3. **Mark the baseline migration as applied**:
   Because the tables already exist in the database, executing `migration.sql` would fail with `table already exists`. Tell Prisma that the baseline migration has already been executed:
   ```bash
   npx prisma migrate resolve --applied 20261112130000_baseline
   ```
   *Expected output*: `Migration 20261112130000_baseline marked as applied.`

4. **Verify migration status**:
   ```bash
   npx prisma migrate status
   ```
   *Expected output*: `Database schema is up to date!`

5. **Future migrations**:
   For all future database updates, use **`npx prisma migrate deploy` only**.

