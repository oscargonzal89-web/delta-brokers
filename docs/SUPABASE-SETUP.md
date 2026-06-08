# Connect to Supabase Database

Guide to connect the Delta Brokers frontend to a Supabase project (PostgreSQL, Auth, Storage).

---

## 1. Create or Open a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project** (or open an existing one)
2. Note your **Project URL** and **anon public key**:
   - **Settings** → **API**
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public:** safe to use in the browser (with RLS enabled)

---

## 2. Configure Environment Variables (Local)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Restart the dev server after changing `.env`:

```bash
npm run dev
```

The client is initialized in `src/lib/supabase.ts` and used across `src/lib/api/*` and `src/lib/auth.tsx`.

---

## 3. Run Database Migrations

Apply SQL migrations in order via **Supabase Dashboard** → **SQL Editor**:

| Order | File |
|-------|------|
| 1 | `supabase/migrations/001_initial_schema.sql` |
| 2 | `supabase/migrations/002_rls_policies.sql` |
| 3 | `supabase/migrations/003_functions_triggers.sql` |
| 4 | `supabase/migrations/004_views.sql` |
| 5 | `supabase/migrations/005_seed_data.sql` |
| 6 | `supabase/migrations/006_storage.sql` |
| 7 | `supabase/migrations/007_fix_dashboard_kpis_count.sql` |
| 8 | `supabase/migrations/008_add_etapa_enum_values.sql` |
| 9 | `supabase/migrations/009_estado_cliente_negados_catalog_and_views.sql` |

For each file: open → copy all → paste in SQL Editor → **Run**.

---

## 4. Create the Admin User

Migrations do not create login users. Create one in Supabase Auth:

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `admin@deltabrokers.co` (or your choice)
3. Password: set a secure password
4. Confirm email: **Yes** (or disable email confirmation in Auth settings for dev)

The trigger `handle_new_user` creates a row in `user_profiles` with role `analista` by default. Promote to admin:

```sql
UPDATE user_profiles
SET rol = 'administrador', nombre = 'Administrador'
WHERE email = 'admin@deltabrokers.co';
```

---

## 5. Verify Connection

1. Run `npm run dev`
2. Open `http://localhost:5173/login`
3. Sign in with the admin user
4. Dashboard should load data from views like `v_dashboard_kpis`

If login fails, check:
- `.env` values match **Settings → API**
- Migrations ran without errors
- User exists in **Authentication → Users**
- `user_profiles` has a row for that user with `activo = true`

---

## 6. Production (GitHub Actions / S3)

Add the same variables as **GitHub Secrets** (not variables):

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

The deploy workflow injects them at build time so the production bundle connects to Supabase.

---

## 7. Optional: Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

`project-ref` is the ID in your URL (e.g. `hwjiasyyqfpalsufjuai` from `https://hwjiasyyqfpalsufjuai.supabase.co`).

---

## Architecture

```
React (Vite)  →  @supabase/supabase-js  →  Supabase
                    ├── Auth (login/session)
                    ├── PostgreSQL (tables + views + RLS)
                    └── Storage (documents)
```

Row Level Security (RLS) enforces access by role: `analista`, `coordinador`, `administrador`.
