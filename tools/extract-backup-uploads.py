#!/usr/bin/env python3
"""Extract cPanel backup uploads with per-file error recovery."""
import os
import sys
import tarfile
from pathlib import Path

ARCHIVE = Path(r"E:\backup-6.30.2026_17-15-39_invodhyo.tar.gz")
DEST = Path(r"E:\backup-6.30.2026_17-15-39_invodhyo\python-extract")
PREFIX = "backup-6.30.2026_17-15-39_invodhyo/homedir/arabtechtrends.com/wp-content/uploads/"

DEST.mkdir(parents=True, exist_ok=True)
ok = err = skip = 0

try:
    with tarfile.open(ARCHIVE, "r:gz") as tar:
        for member in tar:
            if not member.name.startswith(PREFIX) or not member.isfile():
                continue
            rel = member.name[len(PREFIX):]
            target = DEST / rel
            try:
                target.parent.mkdir(parents=True, exist_ok=True)
                if target.exists() and target.stat().st_size > 0:
                    skip += 1
                    continue
                src = tar.extractfile(member)
                if src is None:
                    err += 1
                    continue
                data = src.read()
                if not data:
                    err += 1
                    continue
                target.write_bytes(data)
                ok += 1
                if ok % 500 == 0:
                    print(f"  extracted {ok}...", flush=True)
            except Exception as e:
                err += 1
                if err <= 5:
                    print(f"  skip {rel}: {e}", flush=True)
except tarfile.ReadError as e:
    print(f"tar read ended: {e}", flush=True)

print(f"done: {ok} ok, {skip} skipped, {err} errors")
