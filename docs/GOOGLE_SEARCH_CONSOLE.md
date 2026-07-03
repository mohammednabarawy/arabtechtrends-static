# Google Search Console Setup

After deploying, verify the site and submit the sitemap.

## 1. Verify ownership (DNS — recommended)

You chose **Domain name provider** verification. No code or GitHub secrets are required.

1. In [Google Search Console](https://search.google.com/search-console), open your property
2. Under verification details, copy the **TXT record** Google provides. It looks like:
   - **Type:** `TXT`
   - **Host/Name:** `@` (or leave blank for root domain)
   - **Value:** `google-site-verification=xxxxxxxxxxxxxxxx`
3. Sign in to wherever **arabtechtrends.com** DNS is managed (registrar or Cloudflare, etc.)
4. Add a new **TXT** record with that exact value
5. Save and wait for DNS propagation (often 5–30 minutes; can take up to 48 hours)
6. Click **Verify** in Search Console

**Important:** Do not delete this TXT record — removing it will drop verification.

**Covers both www and apex:** If you verified the **Domain** property (`arabtechtrends.com`), it includes `www.arabtechtrends.com` and all subdomains.

### Optional: add a backup method

In Search Console → **Settings → Ownership verification**, add a second method (HTML tag or HTML file) so verification survives if the DNS record is ever removed.

For HTML tag backup, add `GSC_VERIFICATION_TOKEN` as a GitHub Actions secret (see below).

### Alternative: HTML tag verification

1. Add property: `https://www.arabtechtrends.com`
2. Copy the `content` value from the meta tag
3. GitHub repo → **Settings → Secrets → Actions** → `GSC_VERIFICATION_TOKEN`
4. Redeploy — the build injects `<meta name="google-site-verification" content="..." />`

## 2. Submit sitemap

In Search Console → **Sitemaps** → add:

```
https://www.arabtechtrends.com/sitemap-index.xml
```

## 3. Monitor indexing

- **Pages** → check indexed vs not indexed
- **URL inspection** → test a few `/posts/...` URLs
- Expect 1–2 weeks for full re-crawl after the WordPress → static migration

## 4. Legacy URL redirects

~1,960 redirect rules map old WordPress URLs (`/old-slug/`) to `/posts/new-slug/`. Test a few old links from Search Console’s “Not found” report after deploy.

## 5. Homepage «الأكثر قراءة» block

1. GSC → **Performance** → **Pages** (last 28 days)
2. Click **Export** → download CSV
3. From repo root:

```bash
npm run import:gsc -- path/to/Pages.csv
git add src/data/top-posts.json
git commit -m "Update homepage top posts from GSC"
git push
```

The homepage reads `src/data/top-posts.json`. Until you import, it uses seeded evergreen guide slugs.
