#!/usr/bin/env python3
"""One-time publication-image migration from Mühendis Gözüyle's Facebook posts.
Fetches exact published images from Windsor.ai's per-post full_picture references.
Never regenerates or stylizes the source pictures.
"""
import io
import json
import os
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "scripts" / "mg-facebook-image-sources.json"
DEST = ROOT / "public" / "mg"
DEST.mkdir(parents=True, exist_ok=True)

sources = json.loads(SOURCES.read_text(encoding="utf-8"))
assert len(sources) == 8 and len(set(sources)) == 8
manifest = []

for slug, meta in sources.items():
    assert slug.replace("-", "").isascii() and slug.islower()
    url = meta["url"]
    hostname = (urlparse(url).hostname or "").lower()
    if not (hostname == "fbcdn.net" or hostname.endswith(".fbcdn.net")):
        raise ValueError(f"Untrusted image host for {slug}: {hostname}")

    r = requests.get(url, timeout=30, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
        "Referer": "https://www.facebook.com/",
    }, allow_redirects=True)
    r.raise_for_status()
    host_after = (urlparse(r.url).hostname or "").lower()
    if not (host_after == "fbcdn.net" or host_after.endswith(".fbcdn.net")):
        raise ValueError(f"Unexpected redirect host for {slug}: {host_after}")
    if len(r.content) > 8 * 1024 * 1024 or not r.headers.get("content-type","").startswith("image/"):
        raise ValueError(f"Invalid size or content-type for {slug}: {len(r.content)} / {r.headers.get('content-type')}")

    try:
        with Image.open(io.BytesIO(r.content)) as img:
            picture = ImageOps.exif_transpose(img).convert("RGB")
    except UnidentifiedImageError as error:
        raise ValueError(f"Invalid image bytes: {slug}") from error

    if min(picture.size) < 400:
        raise ValueError(f"Image too small for {slug}: {picture.size}")
    picture.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    location = DEST / f"{slug}.webp"
    picture.save(location, "WEBP", quality=88, method=6)
    manifest.append({
        "slug": slug,
        "post": meta["post"],
        "postId": meta["postId"],
        "image": "/mg/" + location.name,
        "width": picture.width,
        "height": picture.height,
        "bytes": location.stat().st_size,
    })
    print(f"OK {slug}: {picture.width}x{picture.height} {location.stat().st_size} bytes")

(ROOT / "scripts" / "mg-original-post-image-manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
