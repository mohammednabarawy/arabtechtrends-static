import type { Post } from "./posts";
import topPostsData from "../data/top-posts.json";

const GUIDE_RE = /شرح|دليل|كيفية|أفضل|iso|تنزيل|تحميل/i;

/** Homepage «most read» block — slugs from GSC export via `npm run import:gsc`. */
export function resolveTopPosts(allPosts: Post[], limit = 6): Post[] {
  const bySlug = new Map(allPosts.map((p) => [p.slug, p]));
  const picked: Post[] = [];
  const seen = new Set<string>();

  for (const slug of topPostsData.slugs) {
    const post = bySlug.get(slug);
    if (!post || post.data.draft || seen.has(post.id)) continue;
    picked.push(post);
    seen.add(post.id);
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    for (const post of allPosts) {
      if (seen.has(post.id) || post.data.draft) continue;
      if (!GUIDE_RE.test(post.data.title)) continue;
      picked.push(post);
      seen.add(post.id);
      if (picked.length >= limit) break;
    }
  }

  return picked;
}

export function getTopPostsMeta() {
  return { updated: topPostsData.updated, source: topPostsData.source };
}
