# Delta Brokers

Frontend application built with Vite, React, and Supabase.

## Development

```bash
npm install
npm run dev
```

## Deployment to S3

The project includes a GitHub Actions workflow that automatically deploys to AWS S3 on every push to the `main` branch.

### Prerequisites

1. **S3 Bucket** configured for static website hosting:
   - Enable "Static website hosting"
   - Index document: `index.html`
   - Error document: `index.html` (required for SPA client-side routing)

2. **IAM user** with S3 permissions:
   - `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`

### GitHub Configuration

Configure the following in your repository (Settings → Secrets and variables → Actions):

**Secrets:**

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `VITE_SUPABASE_URL` | Supabase project URL (for build) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (for build) |

**Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `S3_BUCKET_NAME` | Target S3 bucket name | Required |
| `AWS_REGION` | AWS region | `us-east-1` |

### Manual Deployment

Go to Actions → Deploy to S3 → Run workflow.
