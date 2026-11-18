#!/usr/bin/env python3
"""Genera la sección «Mapa de la ruta» al inicio del módulo 0 de cada ruta (specs/007 C6).

La sección sale de las definiciones de módulos en `web/src/app/tracks/*.track.ts` y
`web/src/app/course-data.ts`: un diagrama de las cuatro etapas y una tabla con enlace a cada módulo.
Se ubica justo antes de «## Aprende construyendo» y se reemplaza entera en cada ejecución.

  python3 scripts/build_route_maps.py          # escribe los mapas
  python3 scripts/build_route_maps.py --check  # falla si algún mapa falta o está desactualizado
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "web" / "src" / "app"
CONTENT = ROOT / "web" / "public" / "content"
HEADING = "## Mapa de la ruta"
ANCHOR = "## Aprende construyendo"
STAGES = ["Fundamentos", "Aplicación", "Integración", "Experto"]
STRING = r"'((?:[^'\\]|\\.)*)'"
MODULE = re.compile(rf"\bm\(\s*(\d+),\s*{STRING},\s*{STRING},\s*{STRING}")
CONSTANT = re.compile(r"export const (\w+): CourseModule\[\] = \[")
TRACK = re.compile(r"\{\s*id:\s*'([\w-]+)',\s*name:\s*'((?:[^'\\]|\\.)*)'.*?modules:\s*(\w+)\s*\}")


def unescape(text: str) -> str:
    return text.replace("\\'", "'")


def modules_by_constant() -> dict[str, list[tuple[int, str, str]]]:
    """Devuelve {CONSTANTE: [(número, título, etapa)]} leyendo cada arreglo de módulos."""
    result: dict[str, list[tuple[int, str, str]]] = {}
    for path in [*sorted((APP / "tracks").glob("*.track.ts")), APP / "course-data.ts"]:
        text = path.read_text(encoding="utf-8")
        starts = [(m.start(), m.group(1)) for m in CONSTANT.finditer(text)]
        for index, (start, name) in enumerate(starts):
            end = starts[index + 1][0] if index + 1 < len(starts) else len(text)
            result[name] = [(int(n), unescape(title), stage)
                            for n, title, _short, stage in MODULE.findall(text[start:end])]
    return result


def ranges(numbers: list[int]) -> str:
    """[0, 1, 2, 5] -> '0–2 y 5'."""
    parts, start = [], None
    for i, n in enumerate(numbers):
        if start is None:
            start = n
        if i + 1 == len(numbers) or numbers[i + 1] != n + 1:
            parts.append(str(start) if start == n else f"{start}–{n}")
            start = None
    return parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " y " + parts[-1]


def section(track: str, name: str, modules: list[tuple[int, str, str]]) -> str:
    by_stage = {stage: [n for n, _t, s in modules if s == stage] for stage in STAGES}
    present = [s for s in STAGES if by_stage[s]]
    lines = [HEADING, "",
             (f"«{name}» tiene {len(modules)} módulos en {len(present)} etapas. Cada etapa se apoya en la "
              "anterior; usa la tabla para saltar a un módulo concreto." if len(present) > 1 else
              f"«{name}» tiene, por ahora, 1 módulo publicado, de la etapa {present[0]}; los siguientes se "
              "agregan a medida que pasan la revisión." if len(modules) == 1 else
              f"«{name}» tiene {len(modules)} módulos, todos de la etapa {present[0]}; usa la tabla para "
              "saltar a un módulo concreto."), "",
             "```mermaid", "flowchart LR"]
    for i, stage in enumerate(present):
        word = "módulo" if len(by_stage[stage]) == 1 else "módulos"
        lines.append(f'    E{i}["{stage}<br/>{word} {ranges(by_stage[stage])}"]')
    lines += [f"    E{i} --> E{i + 1}" for i in range(len(present) - 1)]
    lines += ["```", "", "| Módulo | Etapa | Qué aprendes |", "|---|---|---|"]
    lines += [f"| {n} | {stage} | [{title.replace('|', '/')}](/curso/{track}/{n}) |"
              for n, title, stage in sorted(modules)]
    return "\n".join(lines) + "\n\n"


def apply(text: str, block: str) -> str:
    if HEADING in text:
        start = text.index(HEADING)
        nxt = re.search(r"^## ", text[start + len(HEADING):], re.M)
        end = start + len(HEADING) + nxt.start() if nxt else len(text)
        return text[:start] + block + text[end:]
    if ANCHOR not in text:
        raise SystemExit(f"falta «{ANCHOR}»")
    return text.replace(ANCHOR, block + ANCHOR, 1)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    constants = modules_by_constant()
    tracks = TRACK.findall((APP / "course-data.ts").read_text(encoding="utf-8"))
    stale = []
    for track, name, constant in tracks:
        lesson = CONTENT / track / "modulo-0.md"
        text = lesson.read_text(encoding="utf-8")
        updated = apply(text, section(track, unescape(name), constants[constant]))
        if updated != text:
            stale.append(track)
            if not args.check:
                lesson.write_text(updated, encoding="utf-8")
    if args.check and stale:
        print(f"Mapas de ruta desactualizados: {', '.join(stale)}. Ejecuta python3 scripts/build_route_maps.py")
        return 1
    print(f"Mapas de ruta {'verificados' if args.check else 'generados'}: {len(tracks)} rutas"
          + (f" ({len(stale)} actualizadas)" if stale and not args.check else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
