#!/usr/bin/env python3
"""Reubica "**Evidencia de aprendizaje:**" cuando aparece al inicio de Paso 3
en vez de cerca del cierre del tema (Paso 7), donde pertenece.

"Evidencia de aprendizaje" resume qué debe entregar el estudiante al TERMINAR
el tema (la demo, el fallo deliberado, la práctica). Encontrarla pegada justo
después de la frase corta de Paso 3 -- antes de que la demostración siquiera
ocurra -- es un resto de una generación anterior que se concatenó sin
reordenar, el mismo tipo de problema que relocate_tail_to_theory.py corrigió
para el contenido atrapado en Paso 7.

Solo mueve la oración de Evidencia de aprendizaje cuando aparece dentro de
los primeros ~300 caracteres de Paso 3 (antes de cualquier explicación
sustancial). La inserta inmediatamente antes de "#### Paso 7", en su propia
línea. No toca "Conceptos clave" temprano -- ese es el patrón normal de la
plataforma (glosario justo después de la frase corta de Paso 3).
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
PASO3 = re.compile(r"^####\s+Paso 3[^\n]*$", re.MULTILINE)
PASO4 = re.compile(r"^####\s+Paso 4[^\n]*$", re.MULTILINE)
PASO7 = re.compile(r"^####\s+Paso 7[^\n]*$", re.MULTILINE)
EARLY_WINDOW = 300


def topic_slice(text: str) -> str:
    boundary = NEXT_H2.search(text)
    return text[: boundary.start()] if boundary else text


def relocate(block: str) -> tuple[str, bool]:
    paso3 = PASO3.search(block)
    paso4 = PASO4.search(block)
    paso7 = PASO7.search(block)
    if not paso3 or not paso4 or not paso7:
        return block, False

    paso3_body = block[paso3.end(): paso4.start()]
    # Se busca el marcador contra el cuerpo COMPLETO de Paso 3 (nunca contra
    # una porción recortada) para que `[^\n]*` capture la línea entera, sin
    # importar qué tan larga sea; solo se exige que el marcador EMPIECE
    # dentro de la ventana temprana.
    evidence_match = re.search(r"\*\*Evidencia de aprendizaje:\*\*[^\n]*", paso3_body)
    if not evidence_match or evidence_match.start() > EARLY_WINDOW:
        return block, False
    evidence_line = evidence_match.group(0).strip()

    # Quita la línea (y una línea en blanco sobrante) de Paso 3.
    before = paso3_body[: evidence_match.start()].rstrip("\n")
    after = paso3_body[evidence_match.end():].lstrip("\n")
    new_paso3_body = (before + "\n" + after) if before else after
    new_paso3_body = re.sub(r"\n{3,}", "\n\n", new_paso3_body)

    new_block = block[: paso3.end()] + new_paso3_body + block[paso4.start():]

    # Reinserta la línea justo antes de Paso 7 (ahora puede haberse
    # desplazado por el recorte anterior, así que se vuelve a buscar).
    paso7_new = PASO7.search(new_block)
    if not paso7_new:
        return block, False
    insertion = new_block[: paso7_new.start()].rstrip("\n") + "\n\n" + evidence_line + "\n\n" + new_block[paso7_new.start():]
    return re.sub(r"\n{3,}", "\n\n", insertion), True


def guard(before: str, after: str) -> bool:
    before_slice = topic_slice(before)
    after_slice = topic_slice(after)
    before_words = count_words(before_slice)
    after_words = count_words(after_slice)
    if abs(after_words - before_words) > 5:
        return False
    before_metrics = evaluate_topic(before_slice)
    after_metrics = evaluate_topic(after_slice)
    new_issues = set(after_metrics["issues"]) - set(before_metrics["issues"])
    if new_issues:
        return False
    fences_before = len(re.findall(r"^```", before_slice, re.MULTILINE))
    fences_after = len(re.findall(r"^```", after_slice, re.MULTILINE))
    if fences_before != fences_after or fences_after % 2 != 0:
        return False
    if "**Evidencia de aprendizaje:**" not in after_slice:
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
