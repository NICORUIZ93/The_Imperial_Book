#!/usr/bin/env python3
"""Comprueba nivel y duración de cada tema publicado (specs/026 C5).

Un tema declarado con `### Tema N:` debe llevar `· <nivel> · <min> min`, con el
nivel en Básico/Intermedio/Avanzado y la duración entre 20 y 45 minutos, según
`docs/reestructuracion/FORMATO-UNICO.md`.

Uso:
  python3 scripts/check_tiempos.py            # informe
  python3 scripts/check_tiempos.py --check    # falla si hay temas fuera de rango
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
TEMA = re.compile(r"^### Tema (\d+):\s*(.+)$")
# El mismo patrón que el detector canónico de P1 en audit_master_prompt_items.py.
NIVEL = re.compile(r"[·•]\s*(?:Básico|Intermedio|Avanzado|Experto)\s*[·•]\s*(\d+)\s*min\s*$", re.IGNORECASE)


def medir() -> tuple[list[tuple[str, str]], int]:
    malos: list[tuple[str, str]] = []
    total = 0
    for fichero in sorted(CONTENT.glob("*/modulo-*.md")):
        for linea in fichero.read_text(encoding="utf-8").splitlines():
            encontrado = TEMA.match(linea)
            if not encontrado:
                continue
            total += 1
            resto = encontrado.group(2)
            nivel = NIVEL.search(resto)
            if not nivel:
                malos.append((f"{fichero.relative_to(ROOT)}", linea[:100]))
            elif not 20 <= int(nivel.group(1)) <= 45:
                malos.append((f"{fichero.relative_to(ROOT)}", linea[:100]))
    return malos, total


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    malos, total = medir()
    print(f"check_tiempos: {total - len(malos)}/{total} temas con nivel y duración en 20–45 min")
    for ruta, linea in malos[:20]:
        print(f"  {ruta}: {linea}")
    if len(malos) > 20:
        print(f"  ... y {len(malos) - 20} más")
    if a.check and malos:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
