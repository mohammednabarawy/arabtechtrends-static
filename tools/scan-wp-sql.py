#!/usr/bin/env python3
import gzip
import re
import sys

fp = sys.argv[1]
tables = set()
thumb = 0
uploads = 0
insert_posts = []
truncated = False

try:
    f = gzip.open(fp, "rt", encoding="utf-8", errors="replace")
except OSError as e:
    print("FILE:", fp, "OPEN ERROR:", e)
    sys.exit(1)

with f:
    try:
        for line in f:
            if "CREATE TABLE" in line:
                m = re.search(r"CREATE TABLE `([^`]+)`", line)
                if m:
                    tables.add(m.group(1))
            if "_thumbnail_id" in line:
                thumb += 1
            if "wp-content/uploads" in line:
                uploads += 1
            if "INSERT INTO" in line and "posts" in line:
                insert_posts.append(line[:160])
    except EOFError:
        truncated = True

post_tables = sorted(t for t in tables if "post" in t.lower())
meta_tables = sorted(t for t in tables if "postmeta" in t.lower())
print("FILE:", fp)
print("truncated:", truncated)
print("total tables:", len(tables))
print("postmeta tables:", meta_tables)
print("post-related tables:", post_tables[:30])
print("_thumbnail_id lines:", thumb)
print("wp-content/uploads lines:", uploads)
print("sample INSERT posts lines:", len(insert_posts))
for s in insert_posts[:2]:
    print(" ", s[:200])
