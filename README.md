# Arab Tech Trends Static

Free stack:

- Astro builds the static site.
- GitHub Pages hosts it.
- GitHub Actions publishes every push to `main`.
- Posts are Markdown files in `src/content/posts`.

## Local

```bash
npm install
npm run dev
```

## Add a Post

```bash
npm run post:new -- "عنوان المقال"
```

Edit the new file in `src/content/posts`, then publish:

```bash
git add src/content/posts
git commit -m "Add new post"
git push origin main
```

GitHub Actions will build and deploy automatically.
