#!/usr/bin/env python3
"""Recorta apéndices heredados solo cuando el tema sigue siendo válido.

Las generaciones anteriores pegaron al final de muchos temas bloques que
repetían el Paso 3 y el Paso 4. Este script propone un recorte y lo aplica
únicamente si, después del recorte, el tema conserva los 17 marcadores de la
metodología, todos los criterios editoriales, al menos 450 palabras, fences
balanceados y menos defectos de sustancia que antes. Si algo falla, no toca el
tema: la limpieza editorial completa sigue siendo trabajo humano.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from audit_lesson_substance import evaluate_topic
from audit_seven_step_methodology import evaluate as seven_step
from audit_topic_learning_quality import evaluate as editorial

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"

TOPIC = re.compile(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", re.MULTILINE)
CLOSURE = re.compile(r"^####\s+Paso 7[^\n]*$", re.MULTILINE)
NEXT_H2 = re.compile(r"^##\s+", re.MULTILINE)

REQUIRED = (
    "**Evidencia de aprendizaje:**",
    "**Errores comunes:**",
    "**Fuente oficial",
    "**Fuentes oficiales:**",
    "**Límites y decisión de uso:**",
    "Siguiente paso",
)

LEGACY = (
    "**Conceptos clave:**",
    "**Diagrama interactivo:**",
    "**Código del ejemplo:**",
    "**Decisión profesional:**",
)


def legacy_candidates(tail: str) -> list[int]:
    positions: list[int] = []
    for marker in LEGACY:
        start = 0
        while (index := tail.find(marker, start)) >= 0:
            positions.append(index)
            start = index + len(marker)
    for marker in ("**Analogía:**", "**¿Por qué es importante?**"):
        start = 0
        seen = 0
        while (index := tail.find(marker, start)) >= 0:
            seen += 1
            if seen > 1:
                positions.append(index)
            start = index + len(marker)
    return sorted(set(positions))


def trim_topic(topic_text: str) -> tuple[str, bool]:
    closure = CLOSURE.search(topic_text)
    if not closure:
        return topic_text, False

    body_end = len(topic_text)
    after_closure = NEXT_H2.search(topic_text, closure.end())
    if after_closure:
        body_end = after_closure.start()

    tail = topic_text[closure.end():body_end]
    last_required = max(
        (tail.rfind(marker) for marker in REQUIRED if marker in tail),
        default=0,
    )
    candidates = [index for index in legacy_candidates(tail) if index > last_required]
    if not candidates:
        return topic_text, False

    cut = closure.end() + min(candidates)
    return topic_text[:cut].rstrip() + "\n\n" + topic_text[body_end:], True


def dedupe_topic(topic_text: str) -> tuple[str, bool]:
    """Quita la segunda aparición de una sección y su párrafo."""
    changed = False
    for marker in ("**¿Por qué es importante?**", "**Analogía:**"):
        positions = [match.start() for match in re.finditer(re.escape(marker), topic_text)]
        if len(positions) < 2:
            continue
        for position in reversed(positions[1:]):
            end = len(topic_text)
            for separator in ("\n**", "\n#### ", "\n### ", "\n## "):
                found = topic_text.find(separator, position + len(marker))
                if found >= 0:
                    end = min(end, found)
            topic_text = topic_text[:position] + topic_text[end:].lstrip("\n")
            changed = True
    return topic_text, changed


def fences_balanced(text: str) -> bool:
    return len(re.findall(r"^```", text, re.MULTILINE)) % 2 == 0


def topic_slice(topic_text: str) -> str:
    """Parte del bloque que pertenece al tema, sin las secciones H2 del módulo."""
    boundary = NEXT_H2.search(topic_text)
    return topic_text[: boundary.start()] if boundary else topic_text


def safe_trim(topic_text: str) -> tuple[str, bool]:
    proposed, changed = trim_topic(topic_text)
    deduped, dedupe_changed = dedupe_topic(proposed)
    if dedupe_changed:
        proposed, changed = deduped, True
    if not changed:
        return topic_text, False

    before_issues = evaluate_topic(topic_slice(topic_text))["issues"]
    after = evaluate_topic(topic_slice(proposed))
    if len(after["issues"]) >= len(before_issues):
        return topic_text, False
    if after["words"] < 450 or not fences_balanced(proposed):
        return topic_text, False
    if not all(seven_step(proposed).values()):
        return topic_text, False
    before_editorial = editorial(topic_slice(topic_text))
    after_editorial = editorial(topic_slice(proposed))
    if any(before_editorial[key] and not after_editorial[key] for key in before_editorial):
        return topic_text, False
    return proposed, True


def clean_file(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    headings = list(TOPIC.finditer(text))
    if not headings:
        return 0

    pieces: list[str] = [text[: headings[0].start()]]
    changed = 0
    for index, heading in enumerate(headings):
        start = heading.start()
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        trimmed, did_change = safe_trim(text[start:end])
        if did_change:
            changed += 1
        pieces.append(trimmed)
    if changed and not dry_run:
        path.write_text("".join(pieces), encoding="utf-8")
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    total = 0
    files = 0
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        changed = clean_file(path, args.dry_run)
        if changed:
            files += 1
            total += changed
            print(f"{path.relative_to(ROOT)}: {changed} temas")
    print(f"\n{'Se recortarían' if args.dry_run else 'Recortados'} {total} temas en {files} archivos")


if __name__ == "__main__":
    main()
