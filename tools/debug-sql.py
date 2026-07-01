#!/usr/bin/env python3
import gzip
import re
import sys

fp = sys.argv[1]
post_id = int(sys.argv[2])

guid_pat = re.compile(
    rf"\({post_id},\d+,.+?,'(https://www\.arabtechtrends\.com/[^']+)',\d+,'post'"
)
slug_pat = re.compile(
    rf"\({post_id},\d+,.+?,'publish','closed','closed','','([^']+)',"
)

with gzip.open(fp, "rt", encoding="utf-8", errors="replace") as f:
    for line in f:
        if f"({post_id}," not in line:
            continue
        m = guid_pat.search(line)
        s = slug_pat.search(line)
        print("guid", m.group(1) if m else None)
        print("slug", s.group(1) if s else None)
        break
