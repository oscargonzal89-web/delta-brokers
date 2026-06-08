# Configure Domain deltabrokers.com.co with CloudFront

Guide to connect the domain **deltabrokers.com.co** to your existing CloudFront distribution.

---

## Prerequisites

- CloudFront distribution already created (e.g. `E3HRGKMF3PS4BT`)
- Access to DNS management for `deltabrokers.com.co` (Route 53 or external provider)
- Domain ownership verified

---

## DNS on Cloudflare

If **deltabrokers.com.co** uses Cloudflare as DNS (nameservers point to Cloudflare), configure records in the **Cloudflare dashboard**, not in Route 53.

### 1. ACM validation (if not done yet)

When you requested the certificate in AWS ACM, it showed a **CNAME** for validation (e.g. `_abc123.deltabrokers.com.co` → `_xyz.acm-validations.aws.`). That record must exist in **Cloudflare** until the certificate is **Issued**.

### 2. Point traffic to CloudFront

Use your CloudFront domain (e.g. `d1234abcd.cloudfront.net`) from **CloudFront → Distribution → Domain name**.

#### Subdomain `www.deltabrokers.com.co`

| Field | Value |
|-------|--------|
| **Type** | CNAME |
| **Name** | `www` |
| **Target** | `d1234abcd.cloudfront.net` (your CloudFront domain) |
| **Proxy status** | **DNS only** (grey cloud) — recommended |

**Why DNS only (grey cloud)?** CloudFront already provides HTTPS (ACM), CDN, and edge locations. With the orange cloud (proxied), traffic goes Browser → Cloudflare → CloudFront, which can cause SSL or caching quirks. **DNS only** sends users straight to CloudFront.

If you **must** use **Proxied** (orange cloud): set **SSL/TLS** → **Overview** to **Full (strict)** so Cloudflare trusts CloudFront’s certificate.

#### Root `deltabrokers.com.co` (apex)

Cloudflare supports **CNAME flattening** at the root:

| Field | Value |
|-------|--------|
| **Type** | CNAME |
| **Name** | `@` |
| **Target** | `d1234abcd.cloudfront.net` |
| **Proxy status** | **DNS only** (grey cloud) recommended |

Only add `@` if that hostname is listed in **CloudFront Alternate domain names** and covered by your ACM certificate.

### 3. Nameservers

At your **domain registrar** (where you bought `deltabrokers.com.co`), the domain must use **Cloudflare’s nameservers** (shown under **DNS** → your site → scroll to **Cloudflare Nameservers**). If the registrar still uses other NS, records you create in Cloudflare **do not apply** → errors like `DNS_PROBE_FINISHED_NXDOMAIN`.

### 4. TTL

Use **Auto** or **300** seconds.

### 5. Verify

```bash
dig www.deltabrokers.com.co +short
# Should show CloudFront IPs or CNAME to cloudfront.net
```

---

## Option A: Subdomain (Recommended - e.g. www.deltabrokers.com.co)

Easier to configure. Use `www.deltabrokers.com.co` or `app.deltabrokers.com.co`.

### Step 1: Request SSL Certificate (ACM)

1. AWS Console → Switch region to **US East (N. Virginia) us-east-1** (required for CloudFront)
2. Search **Certificate Manager** → **Request certificate**
3. **Domain names:**
   - `www.deltabrokers.com.co` (or `app.deltabrokers.com.co`)
4. **Validation method:** DNS validation
5. **Create**
6. In certificate details → **Create records in Route 53** (if using Route 53)
   - Or manually add the CNAME record shown in ACM to your DNS provider
7. Wait for status **Issued** (5–30 min)

### Step 2: Add Domain to CloudFront

1. CloudFront → Your distribution → **Edit** (General tab)
2. **Alternate domain names (CNAMEs):** `www.deltabrokers.com.co`
3. **Custom SSL certificate:** Select the ACM certificate from the dropdown
4. **Save changes**
5. Note your CloudFront domain (e.g. `d1234xyz.cloudfront.net`)

### Step 3: Configure DNS

**If using Route 53:**

1. Route 53 → **Hosted zones** → **deltabrokers.com.co**
2. **Create record**
3. **Record name:** `www` (or `app`)
4. **Record type:** A
5. **Alias:** On
6. **Route traffic to:** Alias to CloudFront distribution → Select your distribution
7. **Create records**
8. (Optional) Create AAAA record for IPv6

**If using external DNS (GoDaddy, Namecheap, etc.):**

1. Add **CNAME** record:
   - **Name:** `www` (or `app`)
   - **Value:** `d1234xyz.cloudfront.net` (your CloudFront domain from Step 2)
   - **TTL:** 300

---

## Option B: Root Domain (deltabrokers.com.co)

The root domain requires special handling because CNAME at root is not standard.

### Step 1: Request SSL Certificate

1. ACM in **us-east-1**
2. **Domain names:** `deltabrokers.com.co`
3. **Validation:** DNS validation
4. Add the CNAME record to your DNS for validation

### Step 2: Add to CloudFront

1. CloudFront → Distribution → **Edit**
2. **Alternate domain names:** `deltabrokers.com.co`
3. **Custom SSL certificate:** Select the certificate
4. **Save changes**

### Step 3: Configure DNS (Root Domain)

**Route 53 (recommended for root):**

1. **Create record**
2. **Record name:** (leave blank for root)
3. **Record type:** A
4. **Alias:** On
5. **Route traffic to:** Alias to CloudFront distribution → Select distribution
6. **Create**
7. Repeat for AAAA (IPv6)

**External DNS:**

Many providers support **ALIAS** or **ANAME** for root (equivalent to CNAME). If your provider does:
- **Name:** `@` or blank
- **Type:** ALIAS/ANAME
- **Value:** `d1234xyz.cloudfront.net`

If your provider **does not** support ALIAS at root:
- Use a redirect service (e.g. `www.deltabrokers.com.co` → `deltabrokers.com.co`)
- Or host the root on a simple redirect that points to www

---

## Redirect www → root (Optional)

If you use `www.deltabrokers.com.co` and want `deltabrokers.com.co` to redirect to www:

1. Request certificate for **both**: `deltabrokers.com.co` and `www.deltabrokers.com.co`
2. Create a **second** CloudFront distribution that only redirects to `https://www.deltabrokers.com.co`
3. Point root domain DNS to this redirect distribution

(Advanced - can be documented in a follow-up if needed)

---

## Verification

| Step | Command / Check |
|------|-----------------|
| SSL | ACM certificate status = **Issued** |
| DNS | `dig www.deltabrokers.com.co` or `nslookup www.deltabrokers.com.co` |
| Site | Open `https://www.deltabrokers.com.co` in browser |

---

## Summary for deltabrokers.com.co

| Option | Domain | Difficulty |
|-------|--------|------------|
| Subdomain | `www.deltabrokers.com.co` or `app.deltabrokers.com.co` | Easy |
| Root | `deltabrokers.com.co` | Requires Route 53 or ALIAS support |

**Recommended:** Start with `www.deltabrokers.com.co` — simplest and works with any DNS provider.
