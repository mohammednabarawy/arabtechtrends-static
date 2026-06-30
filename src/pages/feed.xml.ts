import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getPostImage } from "../utils/posts";

const escapeXml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection("posts", ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 50);

  const origin = (site?.toString() ?? "https://www.arabtechtrends.com/").replace(/\/$/, "");
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const channelUrl = new URL(base, `${origin}/`).toString();

  const items = posts
    .map((post) => {
      const link = new URL(`${base.replace(/^\//, "")}posts/${post.slug}/`, `${origin}/`).toString();
      const image = getPostImage(post);
      const enclosure = image
        ? `<enclosure url="${escapeXml(image.startsWith("http") ? image : `${origin}/${image.replace(/^\//, "")}`)}" type="image/jpeg" />`
        : "";

      return `
        <item>
          <title>${escapeXml(post.data.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid>${escapeXml(link)}</guid>
          <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
          <category>${escapeXml(post.data.category)}</category>
          <description>${escapeXml(post.data.description)}</description>
          ${enclosure}
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>عرب تك | التقنية بين يديك</title>
        <link>${escapeXml(channelUrl)}</link>
        <description>عرب تك، دروس تقنية ومقالات ومعلومات وتحميل أحدث تطبيقات الأيفون والأندرويد.</description>
        <language>ar</language>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
};
