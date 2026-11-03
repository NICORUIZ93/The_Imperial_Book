#!/usr/bin/env python3
"""Construye el temario total deduplicado desde el inventario de libros.

No elimina encabezados por criterios editoriales: sólo agrupa equivalentes exactos
tras normalizar mayúsculas, acentos y puntuación. Conserva todas las fuentes.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "book-curriculum-inventory.json"
OUTPUT = ROOT / "docs" / "temario-total-libros-por-stack.md"

STACK_ORDER = [
    "foundations", "javascript", "node", "angular", "react", "java",
    "spring-boot", "microservices", "kotlin-multiplatform", "android", "ios", "flutter",
    "devops", "cloud", "rutaflow", "python", "cpp", "data-ai",
    "cybersecurity", "databases", "iot-embedded", "robotics-drones",
    "ui-ux", "game-development", "quantum-computing", "electronics",
    "math-science", "general-technical",
]


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def main() -> None:
    inventory = json.loads(SOURCE.read_text(encoding="utf-8"))
    grouped: dict[str, dict[str, dict]] = defaultdict(dict)
    ocr: dict[str, list[dict]] = defaultdict(list)

    for book in inventory["books"]:
        if not book["topics"]:
            ocr[book["stack"]].append(book)
            continue
        for topic in book["topics"]:
            key = normalized(topic["title"])
            if not key:
                continue
            item = grouped[book["stack"]].setdefault(key, {
                "title": topic["title"], "matches": [], "sources": [],
            })
            if len(topic["title"]) < len(item["title"]):
                item["title"] = topic["title"]
            if topic.get("existing"):
                match = topic["existing"]
                item["matches"].append((match["track"], str(match["module"]), match["score"]))
            item["sources"].append({
                "book": book["title"], "page": topic.get("page"),
                "language": book["language"], "path": book["path"],
            })

    total_unique = sum(len(items) for items in grouped.values())
    lines = [
        "# Temario total extraído de los libros por stack", "",
        "> Lista sin síntesis editorial. Sólo se fusionan títulos equivalentes después de normalizar mayúsculas, acentos y puntuación.", "",
        f"- Encabezados originales: {inventory['summary']['extractedTopics']}",
        f"- Temas/encabezados únicos normalizados: {total_unique}",
        f"- Libros pendientes de OCR: {inventory['summary']['booksRequiringOcr']}", "",
    ]

    for stack in STACK_ORDER:
        items = list(grouped.get(stack, {}).values())
        pending_ocr = ocr.get(stack, [])
        if not items and not pending_ocr:
            continue
        lines.extend([f"## Stack: {stack}", "", f"Temas únicos recuperados: {len(items)}", ""])

        by_module: dict[tuple[str, str], list[dict]] = defaultdict(list)
        unassigned = []
        for item in items:
            if item["matches"]:
                best = max(item["matches"], key=lambda match: match[2])
                by_module[(best[0], best[1])].append(item)
            else:
                unassigned.append(item)

        for (track, module), module_items in sorted(
            by_module.items(), key=lambda entry: (entry[0][0], int(entry[0][1]))
        ):
            lines.extend([f"### Correspondencia: {track} / módulo {module}", ""])
            for item in sorted(module_items, key=lambda value: normalized(value["title"])):
                lines.extend(render_item(item))

        if unassigned:
            lines.extend(["### Temas por reorganizar en módulos", ""])
            for item in sorted(unassigned, key=lambda value: normalized(value["title"])):
                lines.extend(render_item(item))

        if pending_ocr:
            lines.extend(["### Libros pendientes de OCR", ""])
            for book in sorted(pending_ocr, key=lambda value: normalized(value["title"])):
                lines.append(f"- {book['title']} — {book['pages']} páginas — `{book['path']}`")
            lines.append("")

    OUTPUT.write_text("\n".join(line.rstrip() for line in lines).rstrip() + "\n", encoding="utf-8")
    print(json.dumps({
        "originalHeadings": inventory["summary"]["extractedTopics"],
        "uniqueNormalizedTopics": total_unique,
        "booksRequiringOcr": inventory["summary"]["booksRequiringOcr"],
        "output": str(OUTPUT),
    }, ensure_ascii=False, indent=2))


def render_item(item: dict) -> list[str]:
    lines = [f"- **{item['title']}**"]
    seen = set()
    for source in item["sources"]:
        identity = (source["path"], source["page"])
        if identity in seen:
            continue
        seen.add(identity)
        page = f", p. {source['page']}" if source["page"] else ""
        lines.append(f"  - Fuente ({source['language']}{page}): {source['book']} — `{source['path']}`")
    return lines


if __name__ == "__main__":
    main()
