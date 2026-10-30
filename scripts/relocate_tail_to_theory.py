#!/usr/bin/env python3
"""Reubica el contenido mal atribuido a "Paso 7" bajo "Paso 3" (Teoría).

`lesson-viewer.ts` arma cada tarjeta de paso recogiendo todo el contenido
hasta el siguiente ``#### Paso N`` o el siguiente ``##``/``###``. Paso 7 es el
último paso del tema, así que cualquier contenido escrito después de su línea
de cierre (Conceptos clave, la explicación completa, la analogía desarrollada,
el diagrama, los límites) queda recogido dentro de la tarjeta "Paso 7 · Cierre
y evidencia" en vez de vivir bajo "Paso 3 · Teoría", que es donde pertenece.
El efecto visible es que Paso 3 se ve como una sola frase y Paso 7 se ve como
un muro de texto fuera de lugar.

Este script no reescribe ni resume nada: corta el bloque que sigue al primer
párrafo real de Paso 7 (su línea de cierre genuina) y lo reinserta completo,
en el mismo orden, inmediatamente antes de "#### Paso 4". Solo aplica el
cambio si el conteo de palabras del tema no cambia (± tolerancia de
formato) y si `audit_lesson_substance.evaluate_topic` dejó de marcar
"cola-tras-cierre" para ese tema sin introducir ningún defecto nuevo.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from audit_lesson_substance import count_words, evaluate_topic

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"

TOPIC = re.compile(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", re.MULTILINE)
NEXT_H2 = re.compile(r"^##\s+", re.MULTILINE)
PASO7 = re.compile(r"^####\s+Paso 7[^\n]*$", re.MULTILINE)
PASO4 = re.compile(r"^####\s+Paso 4[^\n]*$", re.MULTILINE)


def topic_slice(text: str) -> str:
    boundary = NEXT_H2.search(text)
    return text[: boundary.start()] if boundary else text


def relocate(block: str) -> tuple[str, bool]:
    paso7 = PASO7.search(block)
    paso4 = PASO4.search(block)
    if not paso7 or not paso4 or paso4.start() >= paso7.start():
        return block, False

    # El contenido genuino de Paso 7 es su primer párrafo: todo hasta la
    # primera línea en blanco, o hasta el primer marcador en negrita que
    # abre una sección nueva (Conceptos clave, Analogía, etc.).
    after_heading = block[paso7.end():]
    para_break = re.search(r"\n\s*\n", after_heading)
    bold_marker = re.search(r"\n\*\*[^\n]+:\*\*", after_heading)
    candidates = [m.start() for m in (para_break, bold_marker) if m]
    if not candidates:
        return block, False
    cut = min(candidates)
    genuine_closing = after_heading[:cut]
    tail = after_heading[cut:]
    if len(tail.split()) < 30:
        return block, False  # nada sustancial que reubicar

    # El bloque original termina con el separador que había antes del
    # siguiente "### Tema" (o fin de archivo); hay que conservarlo tal cual
    # al reconstruir, o el heading siguiente queda pegado sin línea en blanco.
    trailing_sep = block[len(block.rstrip("\n")):] or "\n"

    without_tail = block[: paso7.end()] + genuine_closing.rstrip("\n")
    insertion_point = PASO4.search(without_tail)
    if not insertion_point:
        return block, False
    tail_clean = tail.strip("\n")
    new_block = (
        without_tail[: insertion_point.start()].rstrip("\n")
        + "\n\n"
        + tail_clean
        + "\n\n"
        + without_tail[insertion_point.start():].rstrip("\n")
        + trailing_sep
    )
    return re.sub(r"\n{3,}", "\n\n", new_block), True


def guard(before: str, after: str) -> bool:
    before_slice = topic_slice(before)
    after_slice = topic_slice(after)
    before_words = count_words(before_slice)
    after_words = count_words(after_slice)
    if abs(after_words - before_words) > 5:
        return False
    before_metrics = evaluate_topic(before_slice)
    after_metrics = evaluate_topic(after_slice)
    if "cola-tras-cierre" not in before_metrics["issues"]:
        return False
    if "cola-tras-cierre" in after_metrics["issues"]:
        return False
    new_issues = set(after_metrics["issues"]) - set(before_metrics["issues"])
    if new_issues:
        return False
    return True


def improve_topic(text: str) -> tuple[str, bool]:
    proposed, changed = relocate(text)
    if not changed:
        return text, False
    if not guard(text, proposed):
        return text, False
    return proposed, True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only", help="Filtra por ruta relativa que contenga este substring")
    args = parser.parse_args()

    total = 0
    files = 0
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        if args.only and args.only not in str(path):
            continue
        text = path.read_text(encoding="utf-8")
        headings = list(TOPIC.finditer(text))
        if not headings:
            continue
        pieces: list[str] = [text[: headings[0].start()]]
        changed = 0
        for index, heading in enumerate(headings):
            start = heading.start()
            end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
            improved, did_change = improve_topic(text[start:end])
            if did_change:
                changed += 1
            pieces.append(improved)
        if changed:
            files += 1
            total += changed
            print(f"{path.relative_to(ROOT)}: {changed} temas")
            if not args.dry_run:
                path.write_text("".join(pieces), encoding="utf-8")
    print(f"\n{'Se reubicarían' if args.dry_run else 'Reubicados'} {total} temas en {files} archivos")


if __name__ == "__main__":
    main()
