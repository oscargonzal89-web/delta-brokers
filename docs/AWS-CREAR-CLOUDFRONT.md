# How to Create a CloudFront Distribution in AWS

Step-by-step guide to create a CloudFront distribution for serving a static SPA from S3.

---

## Prerequisites

- AWS account
- S3 bucket with your built application (`index.html` and `assets/` folder)
- Bucket in the same region you will use (e.g. `us-east-2`)

---

## Step 1: Open CloudFront Console

1. Log in to **AWS Console**
2. Search for **CloudFront** in the top search bar
3. Click **CloudFront**
4. Click **Create distribution**

---

## Step 2: Origin Settings

### Origin domain

- Click the **Origin domain** field
- Select your S3 bucket from the dropdown (e.g. `delta-brokers-web.s3.us-east-2.amazonaws.com`)
- **Do not** select the S3 website endpoint (`s3-website-...`). Use the standard S3 endpoint.

### Origin path

- Leave empty (your files are at the root of the bucket)

### Name

- Auto-filled from the origin domain. You can leave it as is or rename (e.g. `delta-brokers-s3`).

### Origin access

Select **Origin access control settings (recommended)**.

- Click **Create control setting**
- **Name:** `delta-brokers-oac` (or any descriptive name)
- Click **Create**

This creates an OAC so only CloudFront can read from S3. The bucket can stay private.

### Enable Origin Shield

- **No** (optional feature, adds cost and latency)

---

## Step 3: Default Cache Behavior

### Viewer protocol policy

- **Redirect HTTP to HTTPS** (recommended for production)

### Allowed HTTP methods

- **GET, HEAD, OPTIONS** (sufficient for static sites)

### Cache policy

- **CachingOptimized** (recommended)
- Or **CachingDisabled** if you prefer no caching at the edge (not recommended for static assets)

### Origin request policy

- **None** (for static SPA)
- Use **CORS-S3Origin** only if your app makes cross-origin requests to S3

---

## Step 4: Function Associations (Optional)

Leave empty unless you use Lambda@Edge or CloudFront Functions.

---

## Step 5: Settings

### Price class

- **Use all edge locations** (best performance)
- Or **Use only North America and Europe** to reduce cost

### Alternate domain names (CNAMEs)

- Leave empty for now
- Add your custom domain later (e.g. `app.tudominio.com`)

### Custom SSL certificate

- **Default CloudFront certificate (*.cloudfront.net)** for now
- Switch to a custom ACM certificate when you add a domain

### Default root object

- **`index.html`** (required for SPA)

### Standard logging

- **Off** (enable only if you need access logs)

### WAF web ACL

- **Do not enable** (optional, adds cost)

---

## Step 6: Error Pages (Required for SPA)

React Router and other SPAs use client-side routing. Direct access to paths like `/dashboard` returns 403/404 from S3. Configure CloudFront to serve `index.html` for those errors.

### Add 403 error response

1. Click **Create custom error response**
2. **HTTP error code:** `403`
3. **Customize error response:** Yes
4. **Response page path:** `/index.html`
5. **HTTP response code:** `200`
6. **TTL:** `300` (or leave default)
7. Click **Create custom error response**

### Add 404 error response

1. Click **Create custom error response** again
2. **HTTP error code:** `404`
3. **Customize error response:** Yes
4. **Response page path:** `/index.html`
5. **HTTP response code:** `200`
6. **TTL:** `300`
7. Click **Create custom error response**

---

## Step 7: Create Distribution

1. Click **Create distribution**
2. Status will be **Deploying** (takes 5–15 minutes)
3. When status is **Enabled**, the distribution is ready

---

## Step 8: Get Distribution Details

1. Click your distribution in the list
2. Note:
   - **Distribution ID** (e.g. `E2ABCDEFGHIJK`) → use in GitHub variable `CLOUDFRONT_DISTRIBUTION_ID`
   - **Distribution domain name** (e.g. `d1234abcd5678.cloudfront.net`) → use to test the site

---

## Step 9: Update S3 Bucket Policy

CloudFront will show a banner: *"The S3 bucket policy needs to be updated"*.

1. In the distribution, go to **Origins** tab
2. Select the S3 origin → **Edit**
3. Scroll to **Bucket policy**
4. Click **Copy policy**
5. Go to **S3** → your bucket → **Permissions**
6. **Block public access** → ensure it is **ON** (with OAC, S3 stays private)
7. **Bucket policy** → **Edit** → Paste the copied policy → **Save changes**

---

## Verification

1. Wait until CloudFront status is **Enabled**
2. Open in browser: `https://YOUR_DISTRIBUTION_DOMAIN.cloudfront.net`
3. The app should load
4. Navigate to a route (e.g. `/dashboard`) and refresh → it should still work (thanks to error pages)

---

## Summary of Key Settings

| Setting | Value |
|---------|-------|
| Origin | S3 bucket (standard endpoint) |
| Origin access | OAC (Origin Access Control) |
| Viewer protocol | Redirect HTTP to HTTPS |
| Default root object | `index.html` |
| Error 403 | → `/index.html` (200) |
| Error 404 | → `/index.html` (200) |

---

## Next Steps

- Add `CLOUDFRONT_DISTRIBUTION_ID` to GitHub Actions variables
- Configure custom domain: see [AWS-CLOUDFRONT-SETUP.md](AWS-CLOUDFRONT-SETUP.md) Step 5
