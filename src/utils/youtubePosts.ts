import type { CollectionEntry } from "astro:content";
import { sortPosts } from "./posts";

export type Post = CollectionEntry<"posts">;

const YT_WATCH_RE = /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/;
const YT_EMBED_RE = /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/;

/** Only posts imported from the @arabtechtrends channel (not legacy article embeds). */
export function isYouTubePost(post: Post): boolean {
  return Boolean(post.data.sourceUrl?.includes("youtube.com/watch"));
}

export function getYouTubeVideoId(post: Post): string | undefined {
  const fromSource = post.data.sourceUrl?.match(YT_WATCH_RE)?.[1];
  if (fromSource) return fromSource;
  return post.body.match(YT_EMBED_RE)?.[1];
}

export function filterYouTubePosts(posts: Post[]): Post[] {
  return sortPosts(posts.filter(isYouTubePost));
}
