#!/usr/bin/env python3
"""Audita los recursos que las lecciones usan en la app.

  --logos        cada curso (salvo los de marca tipográfica) tiene web/public/brands/<id>.svg
  --links        ninguna lección enlaza con rutas relativas que salen de web/public/content
  --images       cada imagen enlazada existe, tiene texto alternativo útil y pesa < 300 KB
  --docs-counts  README.md declara los mismos conteos que topic-index.json

Sin opciones ejecuta todas las comprobaciones. Sale con 1 si alguna falla.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "web" / "public"
CONTENT = PUBLIC / "content"
INDEX = CONTENT / "topic-index.json"
TRACKS_WITHOUT_LOGO = {
    "git", "linux", "sql", "arquitectura", "seguridad", "typescript", "kotlin", "docker", "kubernetes",
    "cicd", "iac", "observabilidad", "mensajeria", "microservicios",
}  # usan marca tipográfica en el catálogo (TRACKS_WITHOUT_LOGO en course-data.ts)
MAX_IMAGE_BYTES = 300 * 1024
MIN_ALT_CHARS = 10

RELATIVE_LINK = re.compile(r"\]\((\.\./[^)\s]+)\)")
IMAGE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)\)")


def lessons() -> list[Path]:
    return sorted(CONTENT.rglob("*.md"))


def check_logos(index: dict) -> list[str]:
    return [
        f"falta web/public/brands/{track}.svg"
        for track in sorted(index)
        if track not in TRACKS_WITHOUT_LOGO and not (PUBLIC / "brands" / f"{track}.svg").is_file()
    ]


def check_links() -> list[str]:
    errors = []
    for lesson in lessons():
        text = lesson.read_text(encoding="utf-8")
        for match in RELATIVE_LINK.finditer(text):
            line = text.count("\n", 0, match.start()) + 1
            errors.append(f"{lesson.relative_to(ROOT)}:{line} enlace relativo fuera de content: {match.group(1)}")
    return errors


def check_images() -> list[str]:
    errors = []
    for lesson in lessons():
        text = lesson.read_text(encoding="utf-8")
        for match in IMAGE.finditer(text):
            alt, src = match.groups()
            if src.startswith(("http://", "https://", "data:")):
                continue
            where = f"{lesson.relative_to(ROOT)}:{text.count(chr(10), 0, match.start()) + 1}"
            target = PUBLIC / src
            if not target.is_file():
                errors.append(f"{where} imagen inexistente: {src}")
                continue
            if len(alt.strip()) < MIN_ALT_CHARS:
                errors.append(f"{where} texto alternativo demasiado corto para {src}")
            if target.stat().st_size > MAX_IMAGE_BYTES:
                errors.append(f"{where} {src} pesa {target.stat().st_size // 1024} KB (máx. 300)")
    return errors


def check_docs_counts(index: dict) -> list[str]:
    tracks = len(index)
    modules = sum(len(mods) for mods in index.values())
    topics = sum(len(items) for mods in index.values() for items in mods.values())
    real = (tracks, modules, topics)
    declaraciones = [
        ("README.md", r"(\d+) cursos, (\d+) módulos y ([\d.]+) temas indexados"),
    ]
    errors = []
    for nombre, patron in declaraciones:
        ruta = ROOT / nombre
        if not ruta.is_file():
            errors.append(f"{nombre} no existe; no se puede comprobar su cifra declarada")
            continue
        match = re.search(patron, ruta.read_text(encoding="utf-8"))
        if not match:
            errors.append(f"{nombre} no declara su cifra con el patrón «{patron}»")
            continue
        declared = tuple(int(g.replace(".", "")) for g in match.groups())
        if declared != real:
            errors.append(f"{nombre} declara {declared} y topic-index.json tiene {real}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    for flag in ("logos", "links", "images", "docs-counts"):
        parser.add_argument(f"--{flag}", action="store_true")
    args = parser.parse_args()
    selected = {name for name in ("logos", "links", "images", "docs_counts") if getattr(args, name)}
    selected = selected or {"logos", "links", "images", "docs_counts"}

    index = json.loads(INDEX.read_text(encoding="utf-8"))
    checks = {
        "logos": lambda: check_logos(index),
        "links": check_links,
        "images": check_images,
        "docs_counts": lambda: check_docs_counts(index),
    }
    failed = False
    for name in sorted(selected):
        errors = checks[name]()
        print(f"audit_lesson_assets {name}: {'ok' if not errors else f'{len(errors)} problema(s)'}")
        for error in errors:
            print(f"  {error}")
        failed = failed or bool(errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
