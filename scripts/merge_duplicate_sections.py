#!/usr/bin/env python3
"""Fusiona secciones repetidas conservando el contenido único.

Las generaciones anteriores duplicaron secciones enteras (``¿Por qué es
importante?``, ``Analogía``, ``Conceptos clave``) y el segundo bloque a veces
contenía la única mención al proyecto integrador o a los límites. Borrarlo
empeoraba el tema; fusionarlo conserva todo y elimina la repetición.

El script solo aplica la fusión si el tema resultante conserva los 17 marcadores
de la metodología, no pierde criterios editoriales, mantiene 450 palabras, deja
los fences balanceados y reduce los defectos de sustancia. Si algo falla, no toca
el tema.
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
NEXT_H2 = re.compile(r"^##\s+", re.MULTILINE)

MERGE_MARKERS = (
    "**¿Por qué es importante?**",
    "**Analogía:**",
    "**Conceptos clave:**",
)

GENERIC_SCAFFOLD = re.compile(
    r"\n?\*\*Ejemplo independiente \(desde cero\):\*\*[^\n]*(?:\n(?!\n|\*\*|####|###|##)[^\n]*)*",
    re.IGNORECASE,
)

SENTENCE = re.compile(r"(?<=[.!?])\s+")


def topic_slice(text: str) -> str:
    boundary = NEXT_H2.search(text)
    return text[: boundary.start()] if boundary else text


def paragraph_span(text: str, start: int) -> tuple[int, int]:
    end = len(text)
    for separator in ("\n\n", "\n**", "\n#### ", "\n### ", "\n## "):
        found = text.find(separator, start)
        if found >= 0:
            end = min(end, found)
    return start, end


def normalized(sentence: str) -> str:
    return re.sub(r"\s+", " ", sentence).strip().lower()


def merge_marker(text: str, marker: str) -> tuple[str, bool]:
    positions = [match.start() for match in re.finditer(re.escape(marker), text)]
    if len(positions) < 2:
        return text, False

    spans = [paragraph_span(text, position) for position in positions]
    first_start, first_end = spans[0]
    first = text[first_start:first_end].strip()
    sentences = [part.strip() for part in SENTENCE.split(first) if part.strip()]
    seen = {normalized(sentence) for sentence in sentences}

    for start, end in spans[1:]:
        extra = text[start:end].strip()
        for sentence in SENTENCE.split(extra):
            candidate = sentence.strip()
            key = normalized(candidate)
            if candidate and key not in seen and f"**{key}**" not in seen:
                sentences.append(candidate)
                seen.add(key)

    merged = " ".join(sentences)
    result = text[:first_start] + merged + text[first_end:]

    # Eliminar los spans posteriores, de atrás hacia delante.
    for start, end in reversed(spans[1:]):
        shift = len(merged) - (first_end - first_start)
        result = result[: start + shift] + result[end + shift:]
    return re.sub(r"\n{3,}", "\n\n", result), True


def merge_topic(text: str) -> tuple[str, bool]:
    changed = False
    for marker in MERGE_MARKERS:
        text, did_change = merge_marker(text, marker)
        changed = changed or did_change
    return text, changed


def drop_generic_scaffold(text: str) -> tuple[str, bool]:
    result, count = GENERIC_SCAFFOLD.subn("", text)
    return result, count > 0


def fences_balanced(text: str) -> bool:
    return len(re.findall(r"^```", text, re.MULTILINE)) % 2 == 0


def guard(before: str, after: str) -> bool:
    before_slice = topic_slice(before)
    after_slice = topic_slice(after)
    before_issues = evaluate_topic(before_slice)["issues"]
    after_metrics = evaluate_topic(after_slice)
    if len(after_metrics["issues"]) >= len(before_issues):
        return False
    if after_metrics["words"] < 450 or not fences_balanced(after):
        return False
    if not all(seven_step(after_slice).values()):
        return False
    before_editorial = editorial(before_slice)
    after_editorial = editorial(after_slice)
    if any(before_editorial[key] and not after_editorial[key] for key in before_editorial):
        return False
    return True


def improve_topic(text: str) -> tuple[str, bool]:
    proposed, changed = merge_topic(text)
    cleaned, scaffold_removed = drop_generic_scaffold(proposed)
    if scaffold_removed:
        proposed, changed = cleaned, True
    if not changed:
        return text, False
    if not guard(text, proposed):
        # Intentar solo la fusión, sin tocar el andamiaje genérico.
        proposed, changed = merge_topic(text)
        if not changed or not guard(text, proposed):
            return text, False
    return proposed, True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    total = 0
    files = 0
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
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
    print(f"\n{'Se fusionarían' if args.dry_run else 'Fusionados'} {total} temas en {files} archivos")


if __name__ == "__main__":
    main()
