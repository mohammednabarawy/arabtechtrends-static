#!/usr/bin/env python3
"""Analyze news vs valuable content for pruning recommendations."""
import re
import json
from pathlib import Path
from collections import Counter
from html import unescape

POSTS = Path(__file__).resolve().parent.parent / "src/content/posts"
NEWS_KW = (
    "تسريب", "تسريبات", "تحديث", "رسمي", "إطلاق", "كشف", "مواصفات", "سعر",
    "هاتف", "جالكسي", "ايفون", "آيفون", "واتساب", "hyperos", "one ui",
    "شاومي", "سامسونج", "ميزة", "ميزات", "قادم", "يصل", "يتلقى", "يفاجئ",
)
GUIDE_KW = ("شرح", "دليل", "كيفية", "طريقة", "كيف ", "أفضل", "مقارنة", "خطوة", "كورس", "تعليم")
YT = "youtube.com/watch"
TOP_SLUGS = {
    "ويندوز-11-iso",
    "تحميل-ويندوز-10-بصيغة-iso-نسخة-رسمية",
    "تجميع-كمبيوتر-ألعاب-في-2025-دليلك-النهائي-من-الصفر-إلى-الاحتراف",
    "best-vpn-html",
    "شرح-4-طرق-لاستخدام-خرائط-جوجل-بدون-نت",
    "الدليل-الشامل-خطوات-تسريع-شبكة-الواي-فاي-المنزلية-المجربة-وداعا-للبطء",
    "ماذا-تفعل-عند-انسكاب-الماء-على-اللابتوب-دليل-الإنقاذ-الكامل-تحذير-لا-تستخدم-الأرز",
    "أفضل-رامات-للكمبيوتر-في-2025-دليلك-لاختيار-ddr5-أو-ddr4-المناسبة-لتجميعتك",
}


def parse(path: Path):
    raw = path.read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\n([\s\S]*?)\n---\n([\s\S]*)$", raw)
    if not m:
        return None
    fm, body = m.group(1), m.group(2)

    def field(name, default=""):
        mm = re.search(rf"^{name}:\s*(.+)$", fm, re.M)
        if not mm:
            return default
        return mm.group(1).strip().strip('"').strip("'")

    title = field("title")
    cat = field("category")
    pub = field("pubDate")
    year = int(pub[:4]) if pub and len(pub) >= 4 and pub[:4].isdigit() else 0
    source = field("sourceUrl")
    slug = path.stem
    text = re.sub(r"<[^>]+>", " ", body)
    text = unescape(re.sub(r"\s+", " ", text)).strip()
    words = len(text.split()) if text else 0
    is_yt = YT in source or (YT in body and "عن عرب تك" in body)
    is_guide = any(k in title for k in GUIDE_KW) or any(k in cat for k in GUIDE_KW)
    is_news_kw = any(k.lower() in title.lower() for k in NEWS_KW)
    is_top = slug in TOP_SLUGS
    return {
        "file": path.name,
        "slug": slug,
        "title": title,
        "cat": cat,
        "year": year,
        "words": words,
        "is_yt": is_yt,
        "is_guide": is_guide,
        "is_news_kw": is_news_kw,
        "is_top": is_top,
    }


def cluster_title(title: str) -> str:
    t = title.lower()
    if "واتساب" in title or "whatsapp" in t:
        return "whatsapp"
    if "one ui" in t or "one-ui" in t:
        return "one-ui"
    if "hyperos" in t:
        return "hyperos"
    if "جالكسي" in title or "galaxy" in t:
        return "galaxy"
    if "ايفون" in title or "آيفون" in title or "iphone" in t:
        return "iphone"
    if "تسريب" in title or "تسريبات" in title:
        return "leaks"
    if "gemini" in t or "chatgpt" in t or "جيمين" in title or "شات جي" in title:
        return "ai-news"
    if "تعدين" in title or "crypto" in t or "xrp" in t or "bnb" in t:
        return "crypto-spam"
    return "other-news"


def main():
    posts = [parse(p) for p in sorted(POSTS.glob("*.md"))]
    posts = [p for p in posts if p]

    cats = Counter(p["cat"] for p in posts)
    news_cat = [p for p in posts if p["cat"] == "أخبار"]
    yt = [p for p in posts if p["is_yt"]]
    guides = [p for p in posts if p["is_guide"] and not p["is_yt"]]

    # Proposed prune: أخبار category, not top slug, not substantive guide cross-over
    prune_candidates = []
    for p in news_cat:
        if p["is_top"]:
            continue
        cl = cluster_title(p["title"])
        prune_candidates.append({**p, "cluster": cl})

    by_cluster = Counter(p["cluster"] for p in prune_candidates)
    by_year = Counter(p["year"] for p in prune_candidates)

    # Aggressive: keep only 1-2 per cluster for recent (2025+) + all pillar-worthy deep posts
    keep_recent_per_cluster = 2
    aggressive_remove = []
    cluster_kept = Counter()
    for p in sorted(prune_candidates, key=lambda x: (-x["year"], -x["words"])):
        cl = p["cluster"]
        if p["year"] >= 2025 and cluster_kept[cl] < keep_recent_per_cluster:
            cluster_kept[cl] += 1
            continue
        if p["words"] >= 250 and any(k in p["title"] for k in ("مقارنة", "دليل", "مراجعة")):
            continue
        aggressive_remove.append(p)

    out = Path(__file__).resolve().parent / "news-prune-analysis.json"
    out.write_text(
        json.dumps(
            {
                "total": len(posts),
                "categories": dict(cats),
                "news_category_count": len(news_cat),
                "youtube_imports": len(yt),
                "evergreen_guides_non_yt": len(guides),
                "news_clusters": dict(by_cluster),
                "news_by_year": dict(sorted(by_year.items())),
                "aggressive_prune_estimate": len(aggressive_remove),
                "sample_remove_titles": [p["title"][:80] for p in aggressive_remove[:15]],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(out.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
