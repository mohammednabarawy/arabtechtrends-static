# Google News Publisher Center

Steps to submit Arab Tech Trends for Google News / Discover eligibility.

## Prerequisites

- Site live at `https://www.arabtechtrends.com`
- Google Search Console verified (DNS or HTML tag)
- HTTPS enabled
- Clear **About** page: `/about/`
- Contact info on About or footer
- Original news content (not scraped-only)

## 1. Publisher Center

1. Open [Google Publisher Center](https://publishercenter.google.com/)
2. Sign in with the same Google account as Search Console
3. Add publication: **عرب تك / Arab Tech Trends**
4. Set primary language: **Arabic**
5. Set website URL: `https://www.arabtechtrends.com`

## 2. Branding & identity

- **Logo:** square PNG, min 512×512 — use `/uploads/arabtech-logo.png` (resize if needed)
- **Description:** use site tagline from `src/site.ts`
- **Category:** Technology
- **Distribution:** Saudi Arabia, Egypt, UAE, and other MENA countries as relevant

## 3. Content sections

Map site categories to Publisher Center sections:

| Site category | Publisher section |
|---------------|-------------------|
| أخبار تقنية | Technology news |
| هواتف | Mobile |
| شروحات | How-to |
| تطبيقات | Apps |
| ذكاء اصطناعي | AI |

Add RSS feed: `https://www.arabtechtrends.com/feed.xml`

## 4. Technical checks

- [ ] `NewsArticle` / `Article` JSON-LD on posts (implemented)
- [ ] Large images ≥1200px wide on featured posts (Discover)
- [ ] No misleading clickbait titles
- [ ] `robots.txt` allows Googlebot
- [ ] Sitemap submitted: `https://www.arabtechtrends.com/sitemap-index.xml`

## 5. Google Discover tips

- Fresh pub dates on news posts
- High-quality hero images with `fetchpriority` on lead article
- Strong E-E-A-T: About page, author/org schema
- Avoid excessive ads above the fold (static site = advantage)

## 6. After submission

- Review takes days to weeks
- Monitor GSC → **Performance** → filter by Discover
- Fix crawl errors in GSC → **Pages**

## Related

- [GOOGLE_SEARCH_CONSOLE.md](./GOOGLE_SEARCH_CONSOLE.md)
