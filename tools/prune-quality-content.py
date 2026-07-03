#!/usr/bin/env python3
"""
Remove low-quality news and thin spam; protect YouTube imports, guides, and GSC top pages.
Writes tools/prune-redirects.json for deleted URLs → pillar guides.

Usage:
  python tools/prune-quality-content.py          # dry run
  python tools/prune-quality-content.py --apply  # delete + update redirects
"""
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "src/content/posts"
TOOLS = Path(__file__).resolve().parent
TOP_POSTS_JSON = ROOT / "src/data/top-posts.json"
PRUNE_REDIRECTS = TOOLS / "prune-redirects.json"
PRUNE_LOG = TOOLS / "prune-deleted-log.json"
PRUNE_REPORT = TOOLS / "prune-quality-report.json"

SPAM_KW = ("casino", "en-ligne", "bet ", "gambling", "poker", "viagra", "cialis")
CRYPTO_KW = (
    "تعدين xrp", "تعدين", "crypto mining", "اربح 1000 دولار",
    "العملة المشفرة", "عملات رقمية", "blockchain", "bnb:", " xrp ",
)
TEST_SLUGS = {"netlify-cms-test", "hello-world", "test-post"}
YT = "youtube.com/watch"

KEEP_TITLE_KW = (
    "مراجعة شاملة", "مراجعة", "مقارنة شاملة", "مقارنة", "دليل", "دليلك",
    "كيفية", "شرح", "تحذير", "خطوات", "نصائح", "أفضل ",
)
COURSE_KW = ("كورس", "تعليم", "quickbooks", "الأمين", "المنارة", "فوتوشوب", "invoice reader", "قارئ الفواتير")
DELETE_NEWS_KW = (
    "تسريب", "تسريبات", "geekbench", "tenaa", "يظهر في", "يظهر على", "يظهر رسمي",
    "قادم ب", "قادمة ب", "قادم مع", "قادمة مع", "قادم بت", "قادمة بت",
    "إطلاق هاتف", "إطلاق سلسلة", "تم إطلاق هاتف", "يتم إطلاق",
    "بسعر أقل من", "بأقل من", "بأقل شحن",
    "ميزة جديدة", "ميزة هامة", "ميزات هامة", "ميزة طال", "تحديث يجلب ميزة",
    "تحديث واتساب", "واتساب يجلب", "واتساب يحصل", "واتساب يطرح", "واتساب تكشف",
    "one ui 8", "hyperos 3", "hyperos 2", "hyperos 4",
    "galaxy s26", "galaxy s25", "galaxy s27", "iphone 17", "iphone 18",
    "ينطلق رسمي", "التجريبي", "beta ",
)

CLUSTER_RULES = [
    ("whatsapp", ("واتساب", "whatsapp")),
    ("one-ui", ("one ui", "one-ui", "one ui")),
    ("hyperos", ("hyperos", "هايبر")),
    ("galaxy", ("جالكسي", "galaxy", "سامسونج جالكسي")),
    ("iphone", ("ايفون", "آيفون", "iphone")),
    ("leaks", ("تسريب", "تسريبات")),
    ("ai-news", ("chatgpt", "جيمين", "gemini", "شات جي")),
]

PILLAR_TARGETS = {
    "whatsapp": "/guides/whatsapp-apps/",
    "one-ui": "/guides/samsung-galaxy/",
    "hyperos": "/guides/samsung-galaxy/",
    "galaxy": "/guides/samsung-galaxy/",
    "iphone": "/guides/iphone-ios/",
    "leaks": "/guides/samsung-galaxy/",
    "ai-news": "/guides/ai-tools/",
    "other-news": "/guides/",
    "spam": "/guides/",
    "thin": "/guides/",
    "rumor": "/guides/",
}


def load_protected_slugs() -> set[str]:
    slugs = set()
    if TOP_POSTS_JSON.exists():
        data = json.loads(TOP_POSTS_JSON.read_text(encoding="utf-8"))
        slugs.update(data.get("slugs", []))
    # Evergreen slugs that must never be pruned
    slugs.update({
        "ويندوز-11-iso",
        "best-vpn-html",
        "recover-deleted-contacts-html",
        "wifi-qr-code-generator-html",
        "best-websites-to-download-free-software-html",
        "ألعاب-متعددة-اللاعبين-للكمبيوتر-2025-دليلك-الشامل-لأفضل-16-لعبة-multiplayer",
        "الدليل-النهائي-لاختيار-معالجات-إنتل-2025-مقارنة-شاملة-لـ-core-ultra-14th-13th-12th-gen",
        "أفضل-معالج-للألعاب-في-2025-مقارنة-شاملة-بين-intel-core-و-amd-ryzen",
        "تحذير-عاجل-يستهدف-الاحتيال-في-أمازون-العملاء-الرئيسيين-كيفية-حماية-حسابك-من-السرقة",
        "مراجعة-شاملة-جهاز-rog-xbox-ally-و-rog-xbox-ally-x-عصر-جديد-لل",
    })
    return slugs


def parse_post(path: Path):
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
    category = field("category")
    pub = field("pubDate")
    source = field("sourceUrl")
    slug = path.stem
    text = re.sub(r"<[^>]+>", " ", body)
    text = unescape(re.sub(r"\s+", " ", text)).strip()
    words = len(text.split()) if text else 0
    is_yt = YT in source or (YT in body and "عن عرب تك" in body)
    truncated = slug.endswith("-d") or slug.endswith("-م") or slug.endswith("-ا")
    title_l = title.lower()

    return {
        "file": path.name,
        "slug": slug,
        "title": title,
        "category": category,
        "words": words,
        "is_yt": is_yt,
        "truncated": truncated,
        "title_l": title_l,
        "body_sample": text[:200],
    }


def cluster_for(title: str, title_l: str) -> str:
    for key, kws in CLUSTER_RULES:
        if any(k.lower() in title_l or k in title for k in kws):
            return key
    return "other-news"


def is_protected(p: dict, protected_slugs: set[str]) -> tuple[bool, str]:
    if p["slug"] in protected_slugs:
        return True, "protected-slug"
    if p["is_yt"]:
        return True, "youtube-import"
    if any(k in p["title"] for k in KEEP_TITLE_KW):
        return True, "keep-title"
    if any(k.lower() in p["title_l"] for k in COURSE_KW):
        return True, "course-series"
    if p["category"] == "ألعاب" and p["words"] >= 100:
        return True, "games"
    # News posts often have inflated word counts from migrated HTML boilerplate
    if p["category"] == "أخبار":
        if p["words"] >= 450 and any(k in p["title"] for k in ("مراجعة", "مقارنة", "دليل", "تحذير")):
            return True, "substantive-news"
        return False, ""
    if p["words"] >= 320:
        return True, "substantive"
    return False, ""


def should_delete(p: dict, protected_slugs: set[str], cluster_keepers: set[str]) -> tuple[bool, list[str]]:
    blob = (p["title"] + p["slug"] + p["body_sample"]).lower()
    title_blob = p["title"] + p["slug"]

    if any(k in blob for k in SPAM_KW):
        return True, ["spam"]
    if any(k in p["title"].lower() or k in blob for k in CRYPTO_KW):
        return True, ["crypto-spam"]
    if "تعدين" in title_blob and any(x in title_blob.upper() for x in ("XRP", "BNB", "ETH")):
        return True, ["crypto-spam"]

    ok, reason = is_protected(p, protected_slugs)
    if ok:
        return False, [reason]

    reasons = []
    if p["slug"] in TEST_SLUGS:
        return True, ["test-post"]
    if p["truncated"] and p["words"] < 280:
        return True, ["truncated-slug", f"{p['words']}w"]
    if not p["is_yt"] and p["words"] < 45:
        return True, ["near-empty", f"{p['words']}w"]

    # Thin non-news without guide value
    if p["category"] != "أخبار" and not p["is_yt"] and p["words"] < 85:
        if not any(k in p["title"] for k in KEEP_TITLE_KW):
            return True, ["thin-non-news", f"{p['words']}w"]

    cl = cluster_for(p["title"], p["title_l"])

    # News category: aggressive prune
    if p["category"] == "أخبار":
        if p["slug"] in cluster_keepers:
            return False, ["cluster-keeper"]
        if any(k.lower() in p["title_l"] or k in p["title"] for k in DELETE_NEWS_KW):
            return True, ["low-news-pattern", cl]
        if p["words"] < 160:
            return True, ["thin-news", f"{p['words']}w"]
        # Default: remove remaining أخبار not explicitly kept
        return True, ["news-prune", cl]

    # Rumor churn in other categories
    rumor_hit = any(k.lower() in p["title_l"] or k in p["title"] for k in DELETE_NEWS_KW)
    if rumor_hit and p["words"] < 200:
        return True, ["rumor-thin", cl]

    return False, ["keep"]


def pick_cluster_keepers(posts: list[dict], protected_slugs: set[str], per_cluster: int = 1) -> set[str]:
    by_cluster: dict[str, list[dict]] = defaultdict(list)
    for p in posts:
        if p["category"] != "أخبار":
            continue
        if is_protected(p, protected_slugs)[0]:
            continue
        by_cluster[cluster_for(p["title"], p["title_l"])].append(p)

    keepers = set()
    for cl, items in by_cluster.items():
        ranked = sorted(items, key=lambda x: (-x["words"], x["slug"]))
        for p in ranked[:per_cluster]:
            keepers.add(p["slug"])
    return keepers


def redirect_for(reasons: list[str]) -> str:
    cl = reasons[-1] if reasons else "other-news"
    if cl in PILLAR_TARGETS:
        return PILLAR_TARGETS[cl]
    if "spam" in reasons or "crypto" in reasons[0]:
        return "/guides/"
    return "/guides/"


def main():
    apply = "--apply" in sys.argv
    protected_slugs = load_protected_slugs()
    parsed = [parse_post(p) for p in sorted(POSTS.glob("*.md"))]
    parsed = [p for p in parsed if p]

    cluster_keepers = pick_cluster_keepers(parsed, protected_slugs, per_cluster=1)

    to_delete = []
    to_keep = []
    for p in parsed:
        delete, reasons = should_delete(p, protected_slugs, cluster_keepers)
        p["reasons"] = reasons
        (to_delete if delete else to_keep).append(p)

    by_reason = Counter(r[0] for p in to_delete for r in [p["reasons"]])
    print(f"total={len(parsed)} keep={len(to_keep)} delete={len(to_delete)}")
    print("delete_by_reason:", dict(by_reason))

    report = {
        "at": datetime.now(timezone.utc).isoformat(),
        "delete_count": len(to_delete),
        "keep_count": len(to_keep),
        "delete_by_reason": dict(by_reason),
        "delete_samples": [
            {"slug": p["slug"], "title": p["title"][:90], "reasons": p["reasons"]}
            for p in to_delete[:25]
        ],
    }
    PRUNE_REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {PRUNE_REPORT}")

    if not apply:
        print("\nDry run. Pass --apply to delete flagged posts.")
        return

    blocked = [p for p in to_delete if p["slug"] in protected_slugs or p["is_yt"]]
    if blocked:
        print(f"ABORT: {len(blocked)} protected posts flagged for delete")
        for p in blocked[:5]:
            print(f"  {p['slug']}")
        sys.exit(1)

    # Build redirect map for deleted slugs
    existing_redirects = {}
    if PRUNE_REDIRECTS.exists():
        existing_redirects = json.loads(PRUNE_REDIRECTS.read_text(encoding="utf-8"))

    removed = []
    for p in to_delete:
        path = POSTS / p["file"]
        if not path.exists():
            continue
        path.unlink()
        target = redirect_for(p["reasons"])
        slug = p["slug"]
        existing_redirects[f"/posts/{slug}/"] = target
        existing_redirects[f"/posts/{slug}"] = target
        existing_redirects[f"/{slug}/"] = target
        existing_redirects[f"/{slug}"] = target
        removed.append({"file": p["file"], "slug": slug, "reasons": p["reasons"], "redirect": target})
        print(f"  deleted {p['file']} -> {target}")

    PRUNE_REDIRECTS.write_text(
        json.dumps(existing_redirects, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(existing_redirects)} prune redirects")

    entry = {"at": datetime.now(timezone.utc).isoformat(), "removed": removed, "count": len(removed)}
    history = []
    if PRUNE_LOG.exists():
        history = json.loads(PRUNE_LOG.read_text(encoding="utf-8"))
    history.append(entry)
    PRUNE_LOG.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDeleted {len(removed)} posts. Log: {PRUNE_LOG}")


if __name__ == "__main__":
    main()
