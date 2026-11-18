#!/usr/bin/env python3
"""Comprueba que examples/ tenga exactamente los laboratorios que citan las lecciones (specs/013).

- Cada carpeta examples/<lab> citada en una lección debe existir.
- Cada carpeta de examples/ debe estar citada por alguna lección (si no, es basura).
Los archivos dentro de un laboratorio pueden no existir: muchas lecciones piden crearlos.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
EXAMPLES = ROOT / "examples"
LAB = re.compile(r"examples/([A-Za-z0-9_-]+)")


def main() -> int:
    citados: dict[str, set[str]] = {}
    for leccion in sorted(CONTENT.glob("*/modulo-*.md")):
        for lab in LAB.findall(leccion.read_text(encoding="utf-8")):
            citados.setdefault(lab, set()).add(str(leccion.relative_to(ROOT)))

    existentes = {p.name for p in EXAMPLES.iterdir() if p.is_dir()} if EXAMPLES.exists() else set()
    faltan = sorted(set(citados) - existentes)
    sobran = sorted(existentes - set(citados))
    for lab in faltan:
        print(f"falta examples/{lab}, citado en {sorted(citados[lab])[0]}")
    for lab in sobran:
        print(f"examples/{lab} no lo cita ninguna lección")
    if faltan or sobran:
        return 1
    print(f"validate_lesson_labs: ok ({len(existentes)} laboratorios, todos citados y presentes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
