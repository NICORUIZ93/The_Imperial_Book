#!/usr/bin/env python3
"""
Valida que los bloques de código ``` del contenido de lecciones estén bien
balanceados. Un fence sin cerrar (o un "cierre" con info-string, que marked
reinterpreta como apertura) deja los encabezados siguientes atrapados dentro
de un bloque de código: el lector —que segmenta los temas por la estructura de
encabezados del HTML— deja de verlos como temas y los muestra anidados dentro
del tema anterior. Este validador detecta exactamente ese defecto.

Uso: python3 scripts/validate_markdown_fences.py
Sale con código 1 si hay algún archivo con fences desbalanceados.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"

FENCE = re.compile(r"^```")


def check(path: Path) -> list[str]:
    errors: list[str] = []
    in_fence = False
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not FENCE.match(line):
            continue
        info = line[3:].strip()
        if in_fence:
            # Dentro de un bloque: esta línea debería cerrarlo. Una línea de
            # cierre NO puede llevar info-string; si la lleva, marked la trata
            # como nueva apertura y el bloque queda abierto -> defecto.
            if info:
                errors.append(f"L{i}: cierre de bloque con info-string '{line[:30]}' (deja el bloque abierto)")
            else:
                in_fence = False
        else:
            in_fence = True
    if in_fence:
        errors.append("EOF: el archivo termina con un bloque de código ``` sin cerrar")
    return errors


def main() -> int:
    failures = 0
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        errors = check(path)
        if errors:
            failures += 1
            rel = path.relative_to(ROOT)
            for e in errors:
                print(f"{rel}: {e}")
    if failures:
        print(f"\nFences desbalanceados en {failures} archivo(s). "
              f"Corrige los bloques ``` para que cada apertura tenga su cierre limpio.")
        return 1
    print("Fences de contenido OK: todos los bloques ``` están balanceados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
