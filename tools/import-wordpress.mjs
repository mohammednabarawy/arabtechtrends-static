import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = "https://www.arabtechtrends.com";
const outDir = path.resolve("src/content/posts");

function strip(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function yaml(value) {
  return JSON.stringify(value ?? "");
}

function slugify(value) {
  let decoded = value || "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    decoded = String(value || "");
  }
  return (decoded
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")) || `post-${Date.now()}`;
}

async function fetchJson(url, attempts = 2, timeout = 30000) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return { data: await response.json(), headers: response.headers };
    } catch (error) {
      lastError = error;
      console.log(`Retry ${attempt}/${attempts}: ${url}`);
    }
  }
  throw lastError;
}

async function loadTerms() {
  const termMap = new Map();
  for (const type of ["categories", "tags"]) {
    const first = await fetchJson(`${source}/wp-json/wp/v2/${type}?per_page=100&page=1`);
    const pages = Number(first.headers.get("x-wp-totalpages") || 1);
    for (const term of first.data) termMap.set(term.id, term.name);
    for (let page = 2; page <= pages; page++) {
      const { data } = await fetchJson(`${source}/wp-json/wp/v2/${type}?per_page=100&page=${page}`);
      for (const term of data) termMap.set(term.id, term.name);
    }
  }
  return termMap;
}

async function fetchPostsPage(page) {
  try {
    return (await fetchJson(`${source}/wp-json/wp/v2/posts?per_page=10&page=${page}`, 2, 20000)).data;
  } catch {
    console.log(`Skipped page ${page}`);
    return [];
  }
}

async function writePost(post, termMap) {
  const categories = (post.categories || []).map((id) => termMap.get(id)).filter(Boolean);
  const tags = (post.tags || []).map((id) => termMap.get(id)).filter(Boolean);
  const title = strip(post.title?.rendered);
  const description = strip(post.excerpt?.rendered).slice(0, 240);
  const body = post.content?.rendered || "";
  const file = path.join(outDir, `${slugify(post.slug || `post-${post.id}`)}.md`);

  await writeFile(file, `---
title: ${yaml(title)}
description: ${yaml(description || title)}
pubDate: ${yaml(post.date)}
updatedDate: ${yaml(post.modified)}
author: "Arab Tech Trends"
category: ${yaml(categories[0] || "Technology")}
tags: ${JSON.stringify(tags)}
image: ""
draft: false
sourceUrl: ${yaml(post.link)}
---

${body}
`, "utf8");
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const termMap = await loadTerms();
const first = await fetchJson(`${source}/wp-json/wp/v2/posts?per_page=10&page=1`, 3, 20000);
const pages = Math.min(Number(first.headers.get("x-wp-totalpages") || 1), Number(process.env.WP_IMPORT_PAGES || 89));
let imported = 0;

for (const post of first.data) await writePost(post, termMap);
imported += first.data.length;
console.log(`Page 1/${pages}: ${imported} posts`);

for (let page = 2; page <= pages; page++) {
  const posts = await fetchPostsPage(page);
  for (const post of posts) await writePost(post, termMap);
  imported += posts.length;
  console.log(`Page ${page}/${pages}: ${imported} posts`);
}

console.log(`Imported ${imported} posts.`);
