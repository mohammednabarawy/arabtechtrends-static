/** Shared helpers for YouTube → blog post content (عرب تك identity). */

export const SITE = {
  name: "عرب تك",
  nameEn: "Arab Tech Trends",
  url: "https://www.arabtechtrends.com",
  tagline: "التقنية بين يديك",
  youtube: "https://www.youtube.com/@arabtechtrends",
  social: [
    { label: "يوتيوب", href: "https://www.youtube.com/@arabtechtrends" },
    { label: "إنستجرام", href: "https://www.instagram.com/arabtechtrends_official/" },
    { label: "فيسبوك", href: "https://www.facebook.com/profile.php?id=61560338201303" },
    { label: "لينكدإن", href: "https://www.linkedin.com/company/arabtechtrends" },
    { label: "بينتريست", href: "https://www.pinterest.com/arabtechtrends" }
  ]
};

const BRANDS = [
  "سامسونج", "Samsung", "جالكسي", "galaxy", "آيفون", "ايفون", "iPhone", "iOS",
  "أندرويد", "Android", "واتساب", "WhatsApp", "شاومي", "Xiaomi", "ويندوز", "Windows",
  "Photoshop", "فوتوشوب", "QuickBooks", "ChatGPT", "Stripe", "MetaMask", "Docker",
  "Linux", "لينكس", "One UI", "HyperOS", "الأمين", "Alameen"
];

const BLOCKED_TAG_RE = /egymasry|ايجي|netaawy|مصري/i;

const BOILERPLATE_RE = [
  /^إن أعجبك الفيديو/i,
  /^اشترك/i,
  /^شغل التنبيهات/i,
  /^انتسب إلى القناة/i,
  /^تابعني/i,
  /^subscribe/i,
  /^follow me/i,
  /^📢/,
  /^✔️/,
  /^►/,
  /^⚡/,
  /^-~-~~-/,
  /^شاهد فيديو/i,
  /info\.com/i,
  /^arabtechtrends\.com$/i,
  /^egymasry/i,
  /^ايجي[_\s]?مصري/i,
  /^t\.me\//i,
  /^[\w\u0600-\u06FF]+_[\w\u0600-\u06FF_]+$/ // leftover hashtag tokens
];

function isBoilerplate(line) {
  const t = line.trim();
  if (!t) return true;
  return BOILERPLATE_RE.some((re) => re.test(t));
}

export function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function trimMeta(text, max = 158) {
  let out = String(text || "").replace(/\s+/g, " ").trim();
  if (out.length <= max) return out;
  out = out.slice(0, max - 1);
  const lastSpace = out.lastIndexOf(" ");
  if (lastSpace > 80) out = out.slice(0, lastSpace);
  return `${out}…`;
}

export function stripDescription(desc) {
  return String(desc || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/^#+\s*/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/@\w+/g, "")
        .replace(/^["']|["']$/g, "")
        .trim()
    )
    .filter((line) => line && !isBoilerplate(line))
    .join("\n")
    .trim();
}

export function meaningfulParagraphs(desc) {
  return stripDescription(desc)
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20 && !isBoilerplate(p));
}

export function descriptionToHtml(desc) {
  const paragraphs = meaningfulParagraphs(desc);
  if (!paragraphs.length) return "";
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n\n");
}

export function buildIntro(title, desc) {
  const paragraphs = meaningfulParagraphs(desc);
  const first = paragraphs[0];
  if (first && first.length > 30) return first;
  return `شرح فيديو من قناة ${SITE.name}: ${title}`;
}

export function extractTags(title, description) {
  const tags = new Set();
  const hay = `${title} ${description}`.toLowerCase();

  for (const brand of BRANDS) {
    if (hay.includes(brand.toLowerCase())) tags.add(brand);
  }

  const hashTags = String(description || "").match(/#[\p{L}\p{N}_]+/gu) || [];
  for (const tag of hashTags) {
    const clean = tag.replace(/^#/, "").slice(0, 30);
    if (clean && !BLOCKED_TAG_RE.test(clean)) tags.add(clean);
  }

  if (tags.size < 3) {
    for (const word of title.split(/\s+/).filter((w) => w.length > 3).slice(0, 4)) {
      const clean = word.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 24);
      if (clean && !BLOCKED_TAG_RE.test(clean)) tags.add(clean);
    }
  }

  tags.add("يوتيوب");
  tags.add("عرب تك");
  tags.add("شرح فيديو");

  return [...tags].filter((t) => t && !BLOCKED_TAG_RE.test(t)).slice(0, 8);
}

function fallbackVideoContext(title) {
  const cleanTitle = String(title || "الفيديو").replace(/\s+/g, " ").trim();
  return `<p>يقدم هذا الفيديو من ${escapeHtml(SITE.name)} نظرة عملية حول ${escapeHtml(cleanTitle)}، مع توضيح الفكرة الأساسية وما يمكن أن يستفيد منه المشاهد قبل تطبيق الخطوات أو متابعة التفاصيل.</p>`;
}
export function embedIframe(title, videoId) {
  const safeTitle = escapeHtml(title);
  return `<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">
<iframe loading="lazy" title="${safeTitle}" width="500" height="281" src="https://www.youtube.com/embed/${videoId}?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div></figure>`;
}

export function siteFooter(watchUrl) {
  const socialList = SITE.social
    .map(
      (s) =>
        `<li><a href="${s.href}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`
    )
    .join("\n");

  return `<h2>عن ${escapeHtml(SITE.name)}</h2>

<p>مدونة <strong>${escapeHtml(SITE.name)}</strong> (${escapeHtml(SITE.nameEn)}) — ${escapeHtml(SITE.tagline)}. أخبار تقنية عربية وشروحات للأندرويد والآيفون والكمبيوتر منذ 2012. زُر <a href="${SITE.url}">arabtechtrends.com</a> لمزيد من المقالات.</p>

<h2>تابعنا</h2>

<ul>
${socialList}
</ul>

<h2>شاهد على يوتيوب</h2>

<p><a href="${watchUrl}" target="_blank" rel="noopener noreferrer">مشاهدة الفيديو على قناة ${escapeHtml(SITE.name)}</a></p>`;
}

export function buildPostBody(video) {
  const { id, title, description } = video;
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  const intro = buildIntro(title, description);
  const bodyDesc = descriptionToHtml(description);
  const summaryParagraphs = meaningfulParagraphs(description);
  const summaryHtml =
    bodyDesc ||
    (summaryParagraphs.length
      ? summaryParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n\n")
      : fallbackVideoContext(title));

  return `${embedIframe(title, id)}

<p>${escapeHtml(intro)}</p>

<h2>ملخص الفيديو</h2>

${summaryHtml}

${siteFooter(watchUrl)}
`;
}

export function uploadDateToIso(uploadDate, timestamp) {
  if (uploadDate && /^\d{8}$/.test(uploadDate)) {
    const y = uploadDate.slice(0, 4);
    const m = uploadDate.slice(4, 6);
    const d = uploadDate.slice(6, 8);
    return `${y}-${m}-${d}T12:00:00.000Z`;
  }
  if (timestamp) return new Date(timestamp * 1000).toISOString();
  return new Date().toISOString();
}

export function yaml(value) {
  return JSON.stringify(String(value ?? ""));
}

export function buildPostFrontmatter(video, imagePath) {
  const { title, description, upload_date, timestamp, id } = video;
  const intro = buildIntro(title, description);
  const meta = trimMeta(intro);
  const tags = extractTags(title, description);
  const pubDate = uploadDateToIso(upload_date, timestamp);
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;

  return `---
title: ${yaml(title)}
description: ${yaml(meta)}
pubDate: ${yaml(pubDate)}
author: "Arab Tech Trends"
category: "دروس تقنية ومقالات"
tags: ${JSON.stringify(tags)}
image: ${yaml(imagePath)}
draft: false
sourceUrl: ${yaml(watchUrl)}
---`;
}

export function buildFullPost(video, imagePath) {
  return `${buildPostFrontmatter(video, imagePath)}

${buildPostBody(video)}`;
}

