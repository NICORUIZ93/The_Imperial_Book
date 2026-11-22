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
ANY_HEADING = re.compile(r"^(#{2,6})\s+(.+?)\s*$", re.MULTILINE)
MODULE_FILE = re.compile(r"modulo-(\d+)\.md$")
EXCLUDED_CONTENT_GROUPS = {"lecciones", "oficial-es"}

# Un tema escrito como ficha (specs/018) no lleva prefijo «Tema N:»: se reconoce
# porque su encabezado `###` va seguido de la primera sección de la ficha.
FICHA_PRIMER_PUNTO = re.compile(r"^1\.\s+UBICACI[OÓ]N\b", re.IGNORECASE)



TOPIC_META = re.compile(
    r"\s+·\s+(?:Básico|Intermedio|Avanzado|Experto)\s+·\s+\d+(?:[–-]\d+)?\s*(?:min|h(?:\s+\d+\s*min)?)\s*$",
    re.IGNORECASE,
)


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


def is_ficha_topic(headings: list[tuple[str, str]], position: int) -> bool:
    """La ficha empieza siempre por el punto 1 (UBICACIÓN): eso distingue un tema de una sección suelta."""
    for level, title in headings[position + 1:]:
        if len(level) <= len(headings[position][0]):
            return False
        if len(level) == 4:
            return bool(FICHA_PRIMER_PUNTO.match(title))
    return False


def main() -> None:
    index: dict[str, dict[str, list[dict[str, str]]]] = defaultdict(dict)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        if path.parent.name in EXCLUDED_CONTENT_GROUPS:
            continue
        match = MODULE_FILE.search(path.name)
        if not match:
            continue
        text = path.read_text(encoding="utf-8")
        headings = [(m.group(1), re.sub(r"\s+#+$", "", m.group(2)).strip())
                    for m in ANY_HEADING.finditer(text)]
        positions = [i for i, (level, _) in enumerate(headings) if level in ("##", "###")]
        seen: set[str] = set()
        topics: list[dict[str, str]] = []
        for position in positions:
            level, title = headings[position]
            heading_id = slugify(TOPIC_META.sub("", title), seen)
            if level != "###":
                continue
            # Editorial standard: ### topic headings are topics; exclude module/chapter headings.
            is_topic = (
                re.match(r"^Tema(?:\s|:)", title, re.IGNORECASE)
                or is_ficha_topic(headings, position)
                or not re.match(r"^(Módulo|Modulo|Fase|Capítulo|Capitulo)\b", title, re.IGNORECASE)
            )
            if is_topic:
                topics.append({"title": clean_topic_title(TOPIC_META.sub("", title)), "fragment": heading_id})
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
