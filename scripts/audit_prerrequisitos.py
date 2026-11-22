#!/usr/bin/env python3
"""Audita prerrequisitos usados antes de definirse (specs/027 C6-C8).

Fase inicial: inventario medible. La detección semántica fina se incorpora por lote en la
Fase B; este script ya define la interfaz y el formato para que la spec sea verificable.
"""
from __future__ import annotations
import argparse, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
INDEX = ROOT / "web/public/content/topic-index.json"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resumen", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--curso")
    args = ap.parse_args()
    idx = json.loads(INDEX.read_text(encoding="utf-8"))
    total = 0
    for course in idx.values():
        if isinstance(course, dict):
            for mod in course.values():
                if isinstance(mod, list):
                    total += len(mod)
        elif isinstance(course, list):
            total += len(course)
    print(f"audit_prerrequisitos: {total} temas indexados; auditor semántico pendiente de Fase B (specs/027)")
    if args.check and args.curso:
        # Fase B se implementa por lote; por ahora no bloquea los cursos no migrados.
        print(f"audit_prerrequisitos: --check --curso {args.curso} pendiente de implementación de lote")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
