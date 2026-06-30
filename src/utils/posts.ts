import type { CollectionEntry } from "astro:content";
import type { Category } from "../site";
import { postMatchesCategory } from "../site";

const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;
const IMG_MD_RE = /!\[[^\]]*\]\(([^)]+)\)/;

export type Post = CollectionEntry<"posts">;

export function getPostImage(post: Post): string | undefined {
  if (post.data.image?.trim()) return post.data.image.trim();
  const fromBody = post.body.match(IMG_SRC_RE)?.[1] ?? post.body.match(IMG_MD_RE)?.[1];
  return fromBody?.trim() || undefined;
}

export function getPostExcerpt(post: Post, maxLength = 160): string {
  const desc = post.data.description?.trim();
  if (desc && desc.length >= 40) return desc.slice(0, maxLength);
  const plain = post.body
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, maxLength) + (plain.length > maxLength ? "…" : "");
}

export function sortPosts(posts: Post[]) {
  return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function filterPostsByCategory(posts: Post[], category: Category) {
  return sortPosts(posts.filter((post) => postMatchesCategory(post, category)));
}

export function getRelatedPosts(post: Post, allPosts: Post[], limit = 4): Post[] {
  const others = sortPosts(allPosts.filter((p) => p.id !== post.id));
  const sameCategory = others.filter((p) => p.data.category === post.data.category);
  const tagOverlap = others.filter((p) =>
    post.data.tags.some((tag) => p.data.tags.includes(tag))
  );
  const titleWords = post.data.title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const byTitle = others.filter((p) =>
    titleWords.some((word) => p.data.title.toLowerCase().includes(word))
  );

  const seen = new Set<string>();
  const result: Post[] = [];
  for (const pool of [sameCategory, tagOverlap, byTitle, others]) {
    for (const candidate of pool) {
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      result.push(candidate);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export function withBase(path: string, base: string) {
  return /^(https?:)?\/\//.test(path) ? path : `${base}${path.replace(/^\/+/, "")}`;
}

export function absoluteUrl(path: string, site: string) {
  const origin = site.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}
