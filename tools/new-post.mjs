import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error("Usage: npm run post:new -- \"عنوان المقال\"");
  process.exit(1);
}

const now = new Date();
const slug = title
  .normalize("NFKD")
  .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase()
  .slice(0, 90);
const date = now.toISOString().slice(0, 10);
const file = join("src", "content", "posts", `${date}-${slug || "post"}.md`);
const body = `---
title: "${title.replaceAll('"', '\\"')}"
description: ""
pubDate: "${now.toISOString()}"
updatedDate: "${now.toISOString()}"
author: "Arab Tech Trends"
category: "أخبار"
tags: []
image: ""
draft: false
---

اكتب المقال هنا.
`;

await mkdir(join("src", "content", "posts"), { recursive: true });
await writeFile(file, body, { flag: "wx" });
console.log(file);
