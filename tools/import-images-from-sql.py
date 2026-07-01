#!/usr/bin/env python3
"""
Backfill post featured images from WordPress SQL dump + local uploads backup.

Usage:
  python tools/import-images-from-sql.py
  python tools/import-images-from-sql.py --sql=E:/invodhyo_wp198.sql.gz.fdmdownload --dry-run
"""
from __future__ import annotations

import argparse
import gzip
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "src" / "content" / "posts"
DEST_ROOT = ROOT / "public" / "uploads" / "wp"
MAP_PATH = ROOT / "tools" / "image-url-map.json"

DEFAULT_SQL = Path(r"E:/invodhyo_wp198.sql.gz.fdmdownload")
DEFAULT_UPLOADS = Path(r"E:/arabtechtrends.com/arabtechtrends.com/wp-content/uploads")

THUMB_RE = re.compile(r"\((\d+),(\d+),'_thumbnail_id','(\d+)'\)")
ATTACH_RE = re.compile(
    r"\((\d+),\d+,'[^']*','[^']*','','[^']*','','inherit'[^)]*?'(https://[^']+/wp-content/uploads/[^']+)',\d+,'attachment'"
)
ATTACH_RE2 = re.compile(
    r"\((\d+),.+?,'(https://www\.arabtechtrends\.com/wp-content/uploads/[^']+)',\d+,'attachment','image/"
)


def split_sql_values(tuple_str: str) -> list[str]:
    values: list[str] = []
    current: list[str] = []
    in_quote = False
    i = 0
    while i < len(tuple_str):
        ch = tuple_str[i]
        if in_quote:
            if ch == "\\" and i + 1 < len(tuple_str):
                current.append(tuple_str[i + 1])
                i += 2
                continue
            if ch == "'":
                if i + 1 < len(tuple_str) and tuple_str[i + 1] == "'":
                    current.append("'")
                    i += 2
                    continue
                in_quote = False
                i += 1
                continue
            current.append(ch)
            i += 1
            continue
        if ch == "'":
            in_quote = True
            i += 1
            continue
        if ch == ",":
            values.append("".join(current).strip())
            current = []
            i += 1
            continue
        current.append(ch)
        i += 1
    values.append("".join(current).strip())
    return values


def extract_tuple(line: str, post_id: int) -> str | None:
    needle = f"({post_id},"
    idx = line.find(needle)
    if idx == -1:
        return None
    depth = 0
    started = False
    for pos in range(idx, len(line)):
        ch = line[pos]
        if ch == "(":
            depth += 1
            started = True
        elif ch == ")":
            depth -= 1
            if started and depth == 0:
                return line[idx + 1 : pos]
    return None


def rel_from_upload_url(url: str) -> str | None:
    clean = url.split("?")[0].split("#")[0]
    if "/wp-content/uploads/" not in clean:
        return None
    path = urlparse(clean).path
    return unquote(path.split("/wp-content/uploads/", 1)[1]).replace("\\", "/")


def normalize_slug(value: str) -> str:
    return unquote(value or "").strip("/").lower()


def build_upload_index(uploads_root: Path) -> tuple[dict[str, Path], dict[str, Path]]:
    by_rel: dict[str, Path] = {}
    by_base: dict[str, Path] = {}
    if not uploads_root.exists():
        return by_rel, by_base
    for file in uploads_root.rglob("*"):
        if not file.is_file():
            continue
        if not re.search(r"\.(jpe?g|png|gif|webp|svg)(\.\w+)?$", file.name, re.I):
            continue
        rel = str(file.relative_to(uploads_root)).replace("\\", "/")
        by_rel[rel.lower()] = file
        by_base.setdefault(rel.split("/")[-1].lower(), file)
    return by_rel, by_base


def find_local_file(by_rel: dict[str, Path], by_base: dict[str, Path], rel: str) -> Path | None:
    hit = by_rel.get(rel.lower())
    if hit:
        return hit
    return by_base.get(rel.split("/")[-1].lower())


def parse_sql_maps(sql_path: Path) -> tuple[dict[int, int], dict[int, str], dict[str, str]]:
    thumbnails: dict[int, int] = {}
    attachments: dict[int, str] = {}
    slug_to_image: dict[str, str] = {}
    post_ids_needed: set[int] = set()

    print("Pass 1: thumbnails + attachments ...")
    with gzip.open(sql_path, "rt", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            for m in THUMB_RE.finditer(line):
                post_id = int(m.group(2))
                thumbnails[post_id] = int(m.group(3))
                post_ids_needed.add(post_id)
            for m in ATTACH_RE.finditer(line):
                attachments[int(m.group(1))] = m.group(2)
            for m in ATTACH_RE2.finditer(line):
                attachments[int(m.group(1))] = m.group(2)

    print(f"  thumbnails={len(thumbnails)} attachments={len(attachments)}")

    print("Pass 2: post slugs for thumbnail posts ...")
    remaining = set(post_ids_needed)
    with gzip.open(sql_path, "rt", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            if not remaining:
                break
            hit: list[int] = []
            for post_id in remaining:
                if f"({post_id}," not in line:
                    continue
                tup = extract_tuple(line, post_id)
                if not tup:
                    continue
                cols = split_sql_values(tup)
                if len(cols) < 21:
                    continue
                if cols[20] != "post" or cols[7] != "publish":
                    continue
                post_name = cols[11]
                thumb_id = thumbnails.get(post_id)
                if not thumb_id:
                    hit.append(post_id)
                    continue
                guid = attachments.get(thumb_id)
                if not guid:
                    hit.append(post_id)
                    continue
                slug_to_image[normalize_slug(post_name)] = guid
                hit.append(post_id)
            for post_id in hit:
                remaining.discard(post_id)

    print(f"  slug->image mappings={len(slug_to_image)} unresolved={len(remaining)}")
    return thumbnails, attachments, slug_to_image


def set_frontmatter_image(raw: str, image: str) -> str:
    match = re.match(r"^---\n([\s\S]*?)\n---\n([\s\S]*)$", raw)
    if not match:
        return raw
    fm, body = match.group(1), match.group(2)
    escaped = image.replace("\\", "\\\\").replace('"', '\\"')
    if re.search(r"^image:", fm, re.M):
        fm = re.sub(r'^image:\s*.*$', f'image: "{escaped}"', fm, flags=re.M)
    else:
        fm = fm.rstrip() + f'\nimage: "{escaped}"'
    return f"---\n{fm}\n---\n{body}"


def load_markdown_posts() -> list[dict]:
    items = []
    for path in POSTS_DIR.glob("*.md"):
        raw = path.read_text(encoding="utf-8")
        match = re.match(r"^---\n([\s\S]*?)\n---\n", raw)
        if not match:
            continue
        fm = match.group(1)
        image = re.search(r'^image:\s*["\']([^"\']*)["\']', fm, re.M)
        source = re.search(r'^sourceUrl:\s*["\']([^"\']+)["\']', fm, re.M)
        items.append(
            {
                "path": path,
                "raw": raw,
                "image": image.group(1).strip() if image else "",
                "sourceUrl": source.group(1) if source else "",
                "slug": path.stem,
            }
        )
    return items


def match_slug(md: dict) -> str:
    source = md.get("sourceUrl") or ""
    if source:
        return normalize_slug(source.rstrip("/").split("/")[-1])
    return normalize_slug(md.get("slug") or "")


def resolve_sql_path(arg: str) -> Path:
    path = Path(arg)
    if path.exists():
        return path
    alt = Path(str(path) + ".fdmdownload")
    if alt.exists():
        return alt
    raise FileNotFoundError(arg)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sql", default=str(DEFAULT_SQL))
    parser.add_argument("--uploads", default=str(DEFAULT_UPLOADS))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    try:
        sql_path = resolve_sql_path(args.sql)
    except FileNotFoundError as exc:
        print(f"SQL dump not found: {exc}", file=sys.stderr)
        print("Download from cPanel and save as E:/invodhyo_wp198.sql.gz", file=sys.stderr)
        return 1

    _, _, slug_to_image = parse_sql_maps(sql_path)
    by_rel, by_base = build_upload_index(Path(args.uploads))
    url_map = json.loads(MAP_PATH.read_text(encoding="utf-8")) if MAP_PATH.exists() else {}

    filled = copied = skipped = no_match = missing_file = 0

    for md in load_markdown_posts():
        if md["image"]:
            skipped += 1
            continue
        slug = match_slug(md)
        remote = slug_to_image.get(slug)
        if not remote:
            no_match += 1
            continue
        rel = rel_from_upload_url(remote)
        if not rel:
            missing_file += 1
            continue
        local = f"/uploads/wp/{rel}"
        src = find_local_file(by_rel, by_base, rel)
        if not src:
            missing_file += 1
            continue
        if not args.dry_run:
            dest = DEST_ROOT / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            if not dest.exists() or dest.stat().st_size == 0:
                shutil.copy2(src, dest)
                copied += 1
            url_map[remote.split("?")[0]] = local
            md["path"].write_text(set_frontmatter_image(md["raw"], local), encoding="utf-8")
        filled += 1

    if not args.dry_run:
        MAP_PATH.write_text(json.dumps(url_map, indent=2), encoding="utf-8")

    print(
        json.dumps(
            {
                "filled": filled,
                "copied": copied,
                "skipped_has_image": skipped,
                "no_sql_match": no_match,
                "missing_file": missing_file,
                "sql_slugs_with_images": len(slug_to_image),
                "dry_run": args.dry_run,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
