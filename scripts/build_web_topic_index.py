#!/usr/bin/env python3
"""Genera el índice navegable de temas a partir del contenido Markdown real."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
OUTPUT = CONTENT / "topic-index.json"
HEADING = re.compile(r"^(#{2,3})\s+(.+?)\s*$", re.MULTILINE)
MODULE_FILE = re.compile(r"modulo-(\d+)\.md$")
EXCLUDED_CONTENT_GROUPS = {"lecciones", "oficial-es"}


def slugify(text: str, seen: set[str]) -> str:
    normalized = unicodedata.normalize("NFD", text)
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    base = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-") or "seccion"
    slug = base
    suffix = 2
    while slug in seen:
        slug = f"{base}-{suffix}"
        suffix += 1
    seen.add(slug)
    return slug


def clean_topic_title(title: str) -> str:
    return re.sub(
        r"^Tema(?:\s+(?:complementario|suplementario))?(?:\s+\d+)?\s*:\s*",
        "",
        title,
        flags=re.IGNORECASE,
    ).strip()


def main() -> None:
    index: dict[str, dict[str, list[dict[str, str]]]] = defaultdict(dict)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        if path.parent.name in EXCLUDED_CONTENT_GROUPS:
            continue
        match = MODULE_FILE.search(path.name)
        if not match:
            continue
        seen: set[str] = set()
        topics: list[dict[str, str]] = []
        for heading_match in HEADING.finditer(path.read_text(encoding="utf-8")):
            level, raw_title = heading_match.groups()
            title = re.sub(r"\s+#+$", "", raw_title).strip()
            heading_id = slugify(title, seen)
            if level == "###" and re.match(r"^Tema(?:\s|:)", title, re.IGNORECASE):
                topics.append({"title": clean_topic_title(title), "fragment": heading_id})
        index[path.parent.name][match.group(1)] = topics

    rendered = json.dumps(dict(sorted(index.items())), ensure_ascii=False, indent=2) + "\n"
    if "--check" in sys.argv:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != rendered:
            raise SystemExit("topic-index.json está desactualizado; ejecuta scripts/build_web_topic_index.py")
    else:
        OUTPUT.write_text(rendered, encoding="utf-8")
    total = sum(len(topics) for modules in index.values() for topics in modules.values())
    action = "validado" if "--check" in sys.argv else "generado"
    print(f"Índice web {action}: {len(index)} tracks, {total} temas -> {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
