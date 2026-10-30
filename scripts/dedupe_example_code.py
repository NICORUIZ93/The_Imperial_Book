#!/usr/bin/env python3
"""Elimina el bloque "**Código del ejemplo:**" cuando repite, casi palabra por
palabra, un bloque de código anterior dentro del mismo Paso 3.

Patrón encontrado al revisar el contenido manualmente: varios temas
concatenaron dos pasadas de generación distintas dentro de "Paso 3 · Teoría":
una explicación con su propio bloque de código embebido, seguida de un
"**Código del ejemplo:**" con el mismo código (a veces carácter por carácter)
pegado al final sin aportar nada nuevo. Esto no es lo mismo que el código que
reaparece en "Paso 4 · Demostración guiada" -- ese es el patrón intencional
"desde cero" que usa toda la plataforma, y este script nunca lo toca.

Solo borra el bloque "**Código del ejemplo:**" (su etiqueta y su fence) si:
  - Existe al menos un fence de código (no-mermaid) ANTES de él dentro de
    Paso 3, y
  - Su contenido tiene una similitud >= 0.6 (difflib SequenceMatcher) contra
    ese fence anterior.
Si no hay un duplicado claro, no toca el tema -- un "Código del ejemplo"
genuinamente distinto (similitud baja) se deja intacto.
"""

from __future__ import annotations

import argparse
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from audit_lesson_substance import count_words, evaluate_topic

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"

TOPIC = re.compile(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", re.MULTILINE)
NEXT_H2 = re.compile(r"^##\s+", re.MULTILINE)
PASO3 = re.compile(r"^####\s+Paso 3[^\n]*$", re.MULTILINE)
PASO4 = re.compile(r"^####\s+Paso 4[^\n]*$", re.MULTILINE)
CODE_FENCE = re.compile(r"```(?!mermaid)\w*\n(.*?)```\n?", re.DOTALL)
LABELED_BLOCK = re.compile(
    r"\*\*Código del ejemplo:\*\*\s*\n\n```(?!mermaid)\w*\n(.*?)```\n?",
    re.DOTALL,
)

SIMILARITY_THRESHOLD = 0.6


def topic_slice(text: str) -> str:
    boundary = NEXT_H2.search(text)
    return text[: boundary.start()] if boundary else text


def dedupe(block: str) -> tuple[str, bool]:
    paso3 = PASO3.search(block)
    paso4 = PASO4.search(block)
    if not paso3 or not paso4 or paso4.start() <= paso3.start():
        return block, False

    paso3_text = block[paso3.end(): paso4.start()]
    labeled = LABELED_BLOCK.search(paso3_text)
    if not labeled:
        return block, False

    earlier_text = paso3_text[: labeled.start()]
    earlier_fences = CODE_FENCE.findall(earlier_text)
    if not earlier_fences:
        return block, False

    candidate_code = labeled.group(1).strip()
    best_sim = max(
        SequenceMatcher(None, candidate_code, fence.strip()).ratio()
        for fence in earlier_fences
    )
    if best_sim < SIMILARITY_THRESHOLD:
        return block, False

    new_paso3 = paso3_text[: labeled.start()] + paso3_text[labeled.end():]
    new_paso3 = re.sub(r"\n{3,}", "\n\n", new_paso3)
    new_block = block[: paso3.end()] + new_paso3 + block[paso4.start():]
    return new_block, True


def guard(before: str, after: str) -> bool:
    before_slice = topic_slice(before)
    after_slice = topic_slice(after)
    before_metrics = evaluate_topic(before_slice)
    after_metrics = evaluate_topic(after_slice)
    before_words = count_words(before_slice)
    after_words = count_words(after_slice)
    # Debe reducir palabras (se borró algo) pero no desplomar el tema.
    if not (0 < before_words - after_words < 400):
        return False
    if after_metrics["words"] < 450:
        return False
    new_issues = set(after_metrics["issues"]) - set(before_metrics["issues"])
    if new_issues:
        return False
    fences_before = len(re.findall(r"^```", before_slice, re.MULTILINE))
    fences_after = len(re.findall(r"^```", after_slice, re.MULTILINE))
    if fences_after % 2 != 0:
        return False
    if fences_before - fences_after != 2:  # exactamente un fence (apertura+cierre) removido
        return False
    return True


def improve_topic(text: str) -> tuple[str, bool]:
    proposed, changed = dedupe(text)
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
    print(f"\n{'Se limpiarían' if args.dry_run else 'Limpiados'} {total} temas en {files} archivos")


if __name__ == "__main__":
    main()
