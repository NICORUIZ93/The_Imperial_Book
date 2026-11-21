#!/usr/bin/env python3
"""Lista de trabajo de un curso contra los 12 puntos de la sección 4 del MASTER-PROMPT.

Lee `docs/auditoria/prompt-maestro-items.csv` (una fila por tema; la genera
`scripts/audit_master_prompt_items.py`) y cuenta, punto por punto, qué temas del curso siguen pendientes.

Sale 0 solo cuando ningún tema del curso tiene puntos pendientes, así que sirve como comando de
verificación (specs/024, C4). Con `--temas` lista los títulos, para trabajar capítulo por capítulo.

  python3 scripts/plan_maestro_items.py --curso foundations
  python3 scripts/plan_maestro_items.py --curso foundations --modulo 0 --temas
"""
from __future__ import annotations

import argparse
import csv
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "docs" / "auditoria" / "prompt-maestro-items.csv"
PUNTOS = [f"P{i}" for i in range(1, 13)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--curso", required=True, help="nombre de carpeta en web/public/content")
    ap.add_argument("--modulo", help="filtrar por número de capítulo")
    ap.add_argument("--temas", action="store_true", help="listar los temas pendientes")
    a = ap.parse_args()

    if not CSV.exists():
        print(f"falta {CSV.relative_to(ROOT)}: ejecuta python3 scripts/audit_master_prompt_items.py")
        return 2
    with CSV.open(encoding="utf-8") as fh:
        filas = [r for r in csv.DictReader(fh)
                 if r["curso"] == a.curso and (a.modulo is None or r["modulo"] == a.modulo)]
    if not filas:
        print(f"plan_maestro_items: el curso {a.curso!r} (módulo {a.modulo}) no aparece en el CSV")
        return 2

    mal = [r for r in filas if r["faltan"].strip()]
    por_punto = Counter(p for r in mal for p in r["faltan"].split())
    print(f"{a.curso}{'/' + a.modulo if a.modulo else ''}: {len(filas)} temas · "
          f"{len(filas) - len(mal)} cumplen los 12 puntos · {len(mal)} pendientes")
    if mal:
        print("  " + " · ".join(f"{p} {por_punto[p]}" for p in PUNTOS if por_punto[p]))
    if a.temas:
        for r in mal[:60]:
            print(f"  modulo-{r['modulo']} · {r['titulo'][:64]:64s} · {r['faltan']}")
    if len(mal) > 60 and not a.temas:
        print("  (usa --temas para ver la lista)")
    return 0 if not mal else 1


if __name__ == "__main__":
    sys.exit(main())
