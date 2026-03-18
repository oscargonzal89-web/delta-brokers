# AWS CloudFront + S3 + Custom Domain Setup

Complete guide to configure CloudFront with S3, permissions, and custom domain.

> **Detailed CloudFront creation:** For a step-by-step guide focused only on creating the distribution, see [AWS-CREAR-CLOUDFRONT.md](AWS-CREAR-CLOUDFRONT.md).

---

## Step 1: Create CloudFront Distribution

1. AWS Console → **CloudFront** → **Create distribution**

2. **Origin settings:**
   - **Origin domain:** Select your S3 bucket from dropdown (e.g. `delta-brokers-web.s3.us-east-2.amazonaws.com`)
   - **Origin access:** Select **Origin access control settings (recommended)**
   - Click **Create control setting** → Name: `delta-brokers-oac` → **Create**
   - **Enable Origin Shield:** No (optional, adds cost)

3. **Default cache behavior:**
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Allowed HTTP methods:** GET, HEAD, OPTIONS
   - **Cache policy:** CachingOptimized (or create custom)
   - **Origin request policy:** CORS-S3Origin (if needed for API calls)

4. **Settings:**
   - **Price class:** Use all edge locations (or choose to reduce cost)
   - **Alternate domain names (CNAMEs):** Leave empty for now, add in Step 5
   - **Custom SSL certificate:** Leave default for now, add in Step 5
   - **Default root object:** `index.html`

5. **Error pages (for SPA routing):**
   - Click **Create custom error response**
   - HTTP error code: `403` → Redirect to: `/index.html` → Response: `200`
   - Click **Create custom error response** again
   - HTTP error code: `404` → Redirect to: `/index.html` → Response: `200`

6. **Create distribution**
7. **Copy the Distribution ID** (e.g. `E1234ABCD5678`) → Add to GitHub variable `CLOUDFRONT_DISTRIBUTION_ID`

---

## Step 2: Enable CloudFront with S3 (Bucket Permissions)

CloudFront will show a banner: *"The S3 bucket policy needs to be updated"*. Follow the link or run:

**Option A - Copy from CloudFront console:**
1. In your distribution, go to **Origins** tab → Select origin → **Edit**
2. Scroll to **Bucket policy** → Click **Copy policy**
3. S3 → Your bucket → **Permissions** → **Bucket policy** → **Edit** → Paste → **Save**

**Option B - Manual policy** (replace placeholders):

```json
{
  "Version": "2012-10-17",
  "Statement": {
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": {
      "Service": "cloudfront.amazonaws.com"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
      }
    }
  }
}
```

Replace:
- `YOUR_BUCKET_NAME` → Your S3 bucket name
- `ACCOUNT_ID` → Your AWS Account ID (12 digits)
- `DISTRIBUTION_ID` → Your CloudFront distribution ID

**Important:** With OAC, you can keep **Block Public Access** ON on the bucket. Only CloudFront can access it.

---

## Step 3: IAM Permissions for GitHub Actions

The IAM user (or role) used by GitHub Actions needs CloudFront invalidation permission.

Add this policy (or attach `CloudFrontFullAccess` for simplicity):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

Replace `ACCOUNT_ID` and `DISTRIBUTION_ID`.

---

## Step 4: GitHub Workflow (Already Configured)

The workflow `.github/workflows/deploy-s3.yml` includes:
- Deploy to S3
- CloudFront cache invalidation

**Required GitHub Variable:**
- `CLOUDFRONT_DISTRIBUTION_ID` → Your CloudFront distribution ID

---

## Step 5: Custom Domain with Route 53

### 5.1 Request SSL Certificate (ACM)

1. AWS Console → **Certificate Manager** (in **us-east-1** for CloudFront)
2. **Request certificate**
3. **Domain names:** `app.tudominio.com` (your domain)
4. **Validation:** DNS validation
5. **Create**
6. In certificate details → **Create records in Route 53** (if using Route 53)

### 5.2 Add Domain to CloudFront

1. CloudFront → Your distribution → **Edit**
2. **Alternate domain names (CNAMEs):** `app.tudominio.com`
3. **Custom SSL certificate:** Select the certificate from ACM
4. **Save changes**

### 5.3 Create Route 53 Record (A/AAAA Alias)

1. Route 53 → **Hosted zones** → Select your domain
2. **Create record**
3. **Record name:** `app` (or leave blank for root domain)
4. **Record type:** A
5. **Alias:** Yes
6. **Route traffic to:** Alias to CloudFront distribution → Select your distribution
7. **Create records**

Repeat for **AAAA** (IPv6) if needed.

### 5.4 External DNS (if not using Route 53)

If your domain is with another provider (GoDaddy, Namecheap, etc.):

1. Create a **CNAME** record:
   - **Name:** `app` (or `www`, or `@` for root - depends on provider)
   - **Value:** `d1234abcd5678.cloudfront.net` (your CloudFront domain)
   - **TTL:** 300

2. Wait for DNS propagation (5–30 minutes)

---

## Verification Checklist

| Step | Verify |
|------|--------|
| 1 | CloudFront distribution status: **Deployed** |
| 2 | S3 bucket policy allows CloudFront OAC |
| 3 | IAM user has `cloudfront:CreateInvalidation` |
| 4 | GitHub has `CLOUDFRONT_DISTRIBUTION_ID` variable |
| 5 | SSL certificate status: **Issued** |
| 5 | DNS points to CloudFront (dig / nslookup) |
| 5 | https://app.tudominio.com loads the app |

---

## URLs

- **CloudFront default:** `https://d1234abcd5678.cloudfront.net`
- **Custom domain:** `https://app.tudominio.com`
