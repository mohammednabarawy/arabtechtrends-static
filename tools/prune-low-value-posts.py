#!/usr/bin/env python3
"""Score posts; export delete list with tiered thresholds."""
import re
import json
from pathlib import Path
from html import unescape

POSTS = Path(__file__).resolve().parent.parent / "src/content/posts"
GUIDE_KW = ("شرح", "شروحات", "كيفية", "طريقة", "دليل", "نصائح", "أفضل", "مقارنة", "خطوة", "كيف ")
SPAM_KW = ("casino", "en-ligne", "bet ", "gambling", "poker", "viagra", "cialis")
TEST_SLUGS = {"netlify-cms-test", "hello-world", "test-post"}


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
    year = int(pub[:4]) if pub and len(pub) >= 4 and pub[:4].isdigit() else 0
    text = re.sub(r"<[^>]+>", " ", body)
    text = unescape(re.sub(r"\s+", " ", text)).strip()
    words = len(text.split()) if text else 0
    links = len(re.findall(r"<a\s", body, re.I))
    source = field("sourceUrl")
    slug = path.stem
    is_yt = "youtube.com/watch" in source
    has_image = bool(
        re.search(r'^image:\s*["\'][^"\']+["\']', fm, re.M)
        and not re.search(r'^image:\s*["\']["\']', fm, re.M)
    )
    is_guide = any(k in title or k in category for k in GUIDE_KW)
    is_spam = any(k in (title + slug + text).lower() for k in SPAM_KW)
    is_test = slug in TEST_SLUGS or "test" in slug.lower() and words < 50
    truncated = slug.endswith("-d") or slug.endswith("-م") or slug.endswith("-ا")

    return {
        "file": path.name,
        "slug": slug,
        "title": title,
        "category": category,
        "year": year,
        "words": words,
        "links": links,
        "has_image": has_image,
        "is_guide": is_guide,
        "is_spam": is_spam,
        "is_test": is_test,
        "truncated": truncated,
        "is_yt": is_yt,
    }


def classify(p):
    reasons = []

    if p.get("is_yt"):
        return "keep", ["youtube-import"]

    if p["is_spam"]:
        return "delete", ["spam"]
    if p["is_test"]:
        return "delete", ["test-post"]
    if p["words"] < 25:
        return "delete", ["near-empty", f"{p['words']}w"]

    # Keep all substantive guides regardless of age
    if p["is_guide"] and p["words"] >= 120:
        return "keep", ["evergreen-guide"]

    # Recent news with reasonable depth
    if p["year"] >= 2024 and p["words"] >= 80:
        return "keep", ["recent-news"]

    # Recent but thin
    if p["year"] >= 2024 and p["words"] < 80:
        return "delete", ["recent-but-thin", f"{p['words']}w"]

    # Truncated slug + not a deep article
    if p["truncated"] and p["words"] < 200:
        return "delete", ["truncated-slug", f"{p['words']}w"]

    # Old thin news (no long-term value)
    if p["year"] and p["year"] < 2023 and p["words"] < 150:
        return "delete", ["old-thin-news", f"{p['year']}", f"{p['words']}w"]

    # Medium old, still thin
    if p["year"] and p["year"] < 2022 and p["words"] < 220 and not p["is_guide"]:
        return "delete", ["stale-news", f"{p['year']}", f"{p['words']}w"]

    # 2023 corridor — keep if substantive
    if p["year"] == 2023 and p["words"] >= 100:
        return "keep", ["2023-ok"]
    if p["year"] == 2023 and p["words"] < 100:
        return "delete", ["2023-thin", f"{p['words']}w"]

    # Default keep if decent word count
    if p["words"] >= 150:
        return "keep", ["substantive"]

    return "delete", ["low-value", f"{p['words']}w"]


def main():
    import sys
    from datetime import datetime, timezone

    apply = "--apply" in sys.argv
    keep, delete = [], []
    for path in sorted(POSTS.glob("*.md")):
        p = parse_post(path)
        if not p:
            continue
        action, reasons = classify(p)
        p["action"] = action
        p["reasons"] = reasons
        (delete if action == "delete" else keep).append(p)

    print(f"total={len(keep)+len(delete)} keep={len(keep)} delete={len(delete)}")
    by_reason = {}
    for p in delete:
        r = p["reasons"][0]
        by_reason[r] = by_reason.get(r, 0) + 1
    print("delete_by_reason:", by_reason)

    tools = Path(__file__).resolve().parent
    out = tools / "prune-candidates.json"
    out.write_text(
        json.dumps({"delete": delete, "keep_count": len(keep)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {out}")

    if not apply:
        print("\nDry run. Pass --apply to delete flagged posts.")
        return

    removed = []
    for p in delete:
        path = POSTS / p["file"]
        if path.exists():
            path.unlink()
            removed.append({"file": p["file"], "reasons": p["reasons"]})
            print(f"  deleted {p['file']}")

    log = tools / "prune-deleted-log.json"
    entry = {"at": datetime.now(timezone.utc).isoformat(), "removed": removed}
    history = []
    if log.exists():
        history = json.loads(log.read_text(encoding="utf-8"))
    history.append(entry)
    log.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDeleted {len(removed)} posts. Log: {log}")


if __name__ == "__main__":
    main()
