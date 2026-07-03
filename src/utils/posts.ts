import type { CollectionEntry } from "astro:content";
import type { Category } from "../site";
import { postMatchesCategory } from "../site";

const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;
const IMG_MD_RE = /!\[[^\]]*\]\(([^)]+)\)/;
const GUIDE_MARKERS = /شرح|شروحات|كيفية|طريقة|دليل|نصائح|أفضل|مقارنة|خطوة/i;
const HEADING_RE = /<h([23])[^>]*>(.*?)<\/h\1>/gis;

export type Post = CollectionEntry<"posts">;

export type TagEntry = {
  slug: string;
  label: string;
  count: number;
};

export type ArticleHeading = {
  level: number;
  text: string;
  id: string;
};

function normalizeImageUrl(url: string | undefined) {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim().split("?")[0].split("#")[0];
  return trimmed || undefined;
}

export function getPostImage(post: Post): string | undefined {
  const fromFm = normalizeImageUrl(post.data.image);
  if (fromFm) return fromFm;
  const fromBody = normalizeImageUrl(
    post.body.match(IMG_SRC_RE)?.[1] ?? post.body.match(IMG_MD_RE)?.[1]
  );
  return fromBody;
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

export function tagToSlug(tag: string): string {
  const slug = tag
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (slug.length >= 2) return slug;
  let hash = 0;
  for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `tag-${hash.toString(36)}`;
}

export function buildTagIndex(posts: Post[]): TagEntry[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const post of posts) {
    for (const raw of post.data.tags) {
      const label = raw.trim();
      if (!label || label.length > 60) continue;
      const slug = tagToSlug(label);
      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(slug, { label, count: 1 });
      }
    }
  }
  return [...map.entries()]
    .map(([slug, { label, count }]) => ({ slug, label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"));
}

export function filterPostsByTag(posts: Post[], tagSlug: string) {
  return sortPosts(posts.filter((post) => post.data.tags.some((tag) => tagToSlug(tag.trim()) === tagSlug)));
}

export function getPlainText(body: string) {
  return body
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getWordCount(post: Post) {
  return getPlainText(post.body).split(/\s+/).filter(Boolean).length;
}

export function getReadingTime(post: Post, wpm = 200) {
  return Math.max(1, Math.ceil(getWordCount(post) / wpm));
}

export function isGuideLike(post: Post) {
  const text = `${post.data.title} ${post.data.category}`;
  return GUIDE_MARKERS.test(text) || getWordCount(post) >= 500;
}

export function extractHeadings(body: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(HEADING_RE.source, HEADING_RE.flags);
  while ((match = re.exec(body))) {
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const id = text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    headings.push({ level: Number(match[1]), text, id: id || `section-${headings.length + 1}` });
  }
  return headings;
}

export function getPillarForPost(
  post: Post,
  pillars: { slug: string; keywords: string[] }[]
) {
  const text = `${post.data.title} ${post.data.category} ${post.body.slice(0, 400)}`.toLowerCase();
  return pillars.find((pillar) => pillar.keywords.some((k) => text.includes(k.toLowerCase())));
}
