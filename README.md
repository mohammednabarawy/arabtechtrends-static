# Arab Tech Trends Static

Arabic technology news site — Astro static site on GitHub Pages.

## Stack

- **Astro 5** — static site generator
- **GitHub Pages** — hosting (auto-deploy on push to `main`)
- **Pagefind** — client-side search
- **Markdown** — ~890 posts in `src/content/posts`

## Local development

```bash
npm install
npm run dev
```

## Add a post

```bash
npm run post:new -- "عنوان المقال"
git add src/content/posts
git commit -m "Add new post"
git push origin main
```

## Maintenance scripts

```bash
npm run fix:slugs          # Rename corrupted utm/encoded slugs
npm run redirects          # Regenerate WordPress → /posts/ redirect map
npm run migrate:images     # Download images to public/uploads (Blogger + Wayback)
npm run extract:images     # Pull first image from post body into frontmatter
npm run cleanup:posts      # Strip WordPress HTML leftovers from posts
npm run import:wp          # Re-import from WordPress API (if still online)
```

## Google Search Console

See [docs/GOOGLE_SEARCH_CONSOLE.md](docs/GOOGLE_SEARCH_CONSOLE.md). Add `GSC_VERIFICATION_TOKEN` as a GitHub Actions secret, then deploy.

## Legacy URLs

~1,960 redirect rules map old WordPress permalinks to `/posts/{slug}/`. Regenerate after slug changes with `npm run redirects`.

## SEO & AI

- `public/robots.txt` — crawler rules including AI bots
- `public/llms.txt` — AI discovery file
- Auto-generated `sitemap-index.xml` via `@astrojs/sitemap`
- Open Graph, Twitter Cards, and JSON-LD on all pages

## Site structure

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/posts/` | Paginated archive |
| `/category/{slug}/` | Category archives |
| `/posts/{slug}/` | Article |
| `/search/` | Full-text search |
| `/feed.xml` | RSS feed |
