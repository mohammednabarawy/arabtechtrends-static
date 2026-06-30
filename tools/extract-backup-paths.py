#!/usr/bin/env python3
"""Extract specific backup paths (e.g. public_html uploads) with error recovery."""
import tarfile
from pathlib import Path

ARCHIVE = Path(r"E:\backup-6.30.2026_17-15-39_invodhyo.tar.gz")
DEST = Path(r"E:\backup-6.30.2026_17-15-39_invodhyo\python-extract-public")
PREFIXES = [
    "backup-6.30.2026_17-15-39_invodhyo/homedir/public_html/wp-content/uploads/",
    "backup-6.30.2026_17-15-39_invodhyo/homedir/arabtechtrends.com/wp-content/uploads/",
]

DEST.mkdir(parents=True, exist_ok=True)
ok = err = 0

with tarfile.open(ARCHIVE, "r:gz") as tar:
    for member in tar:
        if not member.isfile():
            continue
        matched = next((p for p in PREFIXES if member.name.startswith(p)), None)
        if not matched:
            continue
        rel = member.name[len(matched):]
        target = DEST / matched.split("/")[-4] / rel  # tag by site folder name
        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists() and target.stat().st_size > 0:
                continue
            src = tar.extractfile(member)
            if not src:
                err += 1
                continue
            target.write_bytes(src.read())
            ok += 1
            if ok % 500 == 0:
                print(f"  {ok}...", flush=True)
        except Exception:
            err += 1

print(f"done: {ok} ok, {err} err")
