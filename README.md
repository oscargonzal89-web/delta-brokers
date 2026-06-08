# Delta Brokers

Frontend application built with Vite, React, and Supabase.

## Development

```bash
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev
```

## Macro stages (`etapa_macro`)

| DB value | Label | Subestados (catalog) |
|----------|-------|----------------------|
| `preaprobacion` | Preaprobación | See migration 005 |
| `aprobacion` | Aprobación | See migration 005 |
| `legalizacion` | Legalización | See migration 005 |
| `desembolsado` | Desembolsado | See migration 005 |
| `estado_cliente` | Estado Cliente | No interesados, Desistidos, Aprobados otro banco |
| `negados` | Negados | Negado definitivo, En subsanación radicado, En subsanación proceso de aprobación |

Apply migrations `008` then `009` after the base schema (see [docs/SUPABASE-SETUP.md](docs/SUPABASE-SETUP.md)).

## Client management

From **Clientes**, click a row to open the client detail modal (centered dialog).

- **Status & bank**: inline forms to update etapa, subestado, and banco without nested dialogs.
- **Analyst assignment** (admin only): assign the primary analyst (`analista_delta`) from active users with role `analista`.
- **Documents, history, assignments**: available in the modal tabs.

## Supabase Database

The app connects to Supabase for auth, PostgreSQL, and storage. Configure:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get both values from **Supabase Dashboard → Settings → API**.

**Setup guide:** [docs/SUPABASE-SETUP.md](docs/SUPABASE-SETUP.md)

1. Run migrations in `supabase/migrations/` (SQL Editor, in order 001–006)
2. Create an admin user in **Authentication → Users**
3. Set role: `UPDATE user_profiles SET rol = 'administrador' WHERE email = '...'`

## Deployment (S3 + CloudFront)

The project includes a GitHub Actions workflow that deploys to S3 and invalidates CloudFront cache on every push to `master`.

### Architecture

```
GitHub Push → Build → S3 Upload → CloudFront Invalidation
                                    ↓
                              Custom Domain (optional)
```

### Prerequisites

1. **S3 Bucket** (origin for CloudFront)
2. **CloudFront distribution** with S3 origin
3. **IAM user** with S3 + CloudFront permissions
4. **Custom domain** (optional): Route 53 or external DNS + ACM certificate

### AWS Setup Guide

- **[docs/AWS-CREAR-CLOUDFRONT.md](docs/AWS-CREAR-CLOUDFRONT.md)** — Create CloudFront distribution (step-by-step)
- **[docs/AWS-CLOUDFRONT-SETUP.md](docs/AWS-CLOUDFRONT-SETUP.md)** — Full setup (S3 permissions, IAM, custom domain)
- **[docs/CONFIGURAR-DOMINIO-DELTABROKERS.md](docs/CONFIGURAR-DOMINIO-DELTABROKERS.md)** — Configure domain deltabrokers.com.co

### GitHub Configuration

**Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Variables:** `S3_BUCKET_NAME`, `AWS_REGION`, `CLOUDFRONT_DISTRIBUTION_ID`

### Manual Deployment

Actions → Deploy to S3 → Run workflow.
