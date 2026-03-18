# Delta Brokers

Frontend application built with Vite, React, and Supabase.

## Development

```bash
npm install
npm run dev
```

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

### GitHub Configuration

**Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Variables:** `S3_BUCKET_NAME`, `AWS_REGION`, `CLOUDFRONT_DISTRIBUTION_ID`

### Manual Deployment

Actions → Deploy to S3 → Run workflow.
