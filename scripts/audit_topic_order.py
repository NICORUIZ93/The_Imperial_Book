#!/usr/bin/env python3
"""Audita el orden de los temas dentro de cada capítulo (specs/005).

Dos reglas objetivas, medidas sobre el encabezado `### Tema N: título · Nivel · XX min`:

  1. numeración — los temas de un capítulo van numerados 1..k sin saltos ni duplicados;
  2. dificultad — el nivel declarado no puede bajar al avanzar el capítulo
     (Básico < Intermedio < Avanzado < Experto).

Las citas de prerrequisitos las audita su propio script, `scripts/audit_topic_citations.py`: comprueba que
cada `Tema N de este módulo` / `Módulo N, Tema M` exista, que nadie se cite a sí mismo como
prerrequisito y que las frases de prerrequisito apunten hacia atrás. Aquí solo se juzga la
cabecera, porque reordenar un capítulo no reescribe la prosa que lo atraviesa.

Los capítulos que incumplen una regla y se dejan así a propósito viven en
`docs/topic-order-exceptions.json` (hoy vacía); `--check` falla si un capítulo fuera de esa lista
incumple una regla, y también si una entrada de la lista ya no incumple nada (deuda rancia).

  python3 scripts/audit_topic_order.py            # informe
  python3 scripts/audit_topic_order.py --check    # puerta de validate.sh
  python3 scripts/audit_topic_order.py --write-exceptions   # regenera la lista de pendientes
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
EXCEPTIONS = ROOT / "docs" / "topic-order-exceptions.json"
SKIPPED_GROUPS = {"lecciones", "oficial-es"}
TOPIC_HEAD = re.compile(r"^### Tema (\d+)([^:\n]*):\s?(.*)$", re.M)
LEVEL_META = re.compile(r"·\s*(Básico|Intermedio|Avanzado|Experto)\s*·")
RANK = {"Básico": 0, "Intermedio": 1, "Avanzado": 2, "Experto": 3}


def violations(path: Path) -> dict[str, list[str]]:
    text = path.read_text(encoding="utf-8")
    numbers: list[int] = []
    levels: list[tuple[int, str]] = []
    for match in TOPIC_HEAD.finditer(text):
        number = int(match.group(1))
        numbers.append(number)
        found = LEVEL_META.search(match.group(3))
        if found:
            levels.append((number, found.group(1)))

    out: dict[str, list[str]] = {"numeros": [], "niveles": []}
    for position, number in enumerate(numbers, start=1):
        if number != position:
            out["numeros"].append(f"posición {position} lleva el número {number}")
    if len(set(numbers)) != len(numbers):
        out["numeros"].append("números de tema repetidos")
    for (a, la), (b, lb) in zip(levels, levels[1:]):
        if RANK[lb] < RANK[la]:
            out["niveles"].append(f"tema {a} ({la}) antes del tema {b} ({lb})")
    return out


def scan() -> tuple[list[tuple[str, dict[str, list[str]]]], int, int]:
    rows = []
    topics = 0
    unlabeled = 0
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        if path.parent.name in SKIPPED_GROUPS:
            continue
        text = path.read_text(encoding="utf-8")
        heads = list(TOPIC_HEAD.finditer(text))
        topics += len(heads)
        unlabeled += sum(1 for m in heads if not LEVEL_META.search(m.group(3)))
        found = violations(path)
        if any(found.values()):
            rows.append((f"{path.parent.name}/{int(path.stem.split('-')[1])}", found))
    return rows, topics, unlabeled


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--write-exceptions", action="store_true")
    args = parser.parse_args()

    rows, topics, unlabeled = scan()
    pending = {key for key, _ in rows}
    declared = set(json.loads(EXCEPTIONS.read_text(encoding="utf-8"))["modules"]) if EXCEPTIONS.exists() else set()

    if args.write_exceptions:
        EXCEPTIONS.write_text(
            json.dumps({"schemaVersion": 1, "modules": sorted(pending)}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"audit_topic_order: {len(pending)} módulos pendientes escritos en {EXCEPTIONS.relative_to(ROOT)}")
        return 0

    print(f"audit_topic_order: {topics} temas, {unlabeled} sin nivel declarado, {len(pending)} módulos con incidencias")
    if not args.check:
        for key, found in rows:
            kinds = ", ".join(f"{name}: {detail[0]}" for name, detail in found.items() if detail)
            print(f"  {key} — {kinds}")
        return 0

    errors = []
    for key, found in rows:
        if key not in declared:
            detail = "; ".join(f"{name}: {d}" for name, items in found.items() for d in items)
            errors.append(f"{key} incumple el orden y no está declarado: {detail}")
    for key in sorted(declared - pending):
        errors.append(f"{key} está declarado como pendiente pero ya no incumple: quítalo de la lista")
    for error in errors:
        print(f"  error: {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
