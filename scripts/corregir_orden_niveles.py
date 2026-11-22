#!/usr/bin/env python3
"""Hace que el nivel de los temas no decrezca dentro de cada módulo (specs/026).

Los temas llevaban niveles mezclados heredados de antes de la normalización: un
tema `Avanzado` seguido de otro `Intermedio` rompe la progresión que comprueba
`audit_topic_order.py`. La corrección es mínima: el tema que baja se sube al
máximo nivel ya visto en el módulo; nunca se baja un tema.

Uso:
  python3 scripts/corregir_orden_niveles.py --plan
  python3 scripts/corregir_orden_niveles.py
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
ORDEN = ["Básico", "Intermedio", "Avanzado", "Experto"]
RANGO = {n: i for i, n in enumerate(ORDEN)}
TEMA = re.compile(r"^### Tema (\d+):\s*(.*)$")
NIVEL = re.compile(r"[·•]\s*(Básico|Intermedio|Avanzado|Experto)\s*[·•]\s*(\d+)\s*min\s*$", re.I)


def plan() -> list[tuple[Path, int, str, str]]:
    cambios: list[tuple[Path, int, str, str]] = []
    for fichero in sorted(CONTENT.glob("*/modulo-*.md")):
        lineas = fichero.read_text(encoding="utf-8").splitlines()
        maximo = -1
        for i, linea in enumerate(lineas):
            encontrado = TEMA.match(linea)
            if not encontrado:
                continue
            declarado = NIVEL.search(linea)
            if not declarado:
                continue
            nivel = declarado.group(1).capitalize()
            actual = RANGO[nivel]
            if actual < maximo:
                nuevo_nivel = ORDEN[maximo]
                nueva = (linea[:declarado.start(1)] + nuevo_nivel +
                         linea[declarado.end(1):])
                cambios.append((fichero, i, linea, nueva))
            else:
                maximo = actual
    return cambios


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--plan", action="store_true")
    a = ap.parse_args()

    cambios = plan()
    por_fichero: dict[Path, dict[int, str]] = {}
    for fichero, i, _viejo, nuevo in cambios:
        por_fichero.setdefault(fichero, {})[i] = nuevo
    print(f"corregir_orden_niveles: {len(cambios)} temas en {len(por_fichero)} módulos")
    for fichero in sorted(por_fichero)[:12]:
        print(f"  {fichero.relative_to(ROOT)}: {len(por_fichero[fichero])}")

    if not a.plan:
        for fichero, lineas in por_fichero.items():
            original = fichero.read_text(encoding="utf-8").splitlines()
            for i, nuevo in lineas.items():
                original[i] = nuevo
            fichero.write_text("\n".join(original) + "\n", encoding="utf-8")
        print("corregir_orden_niveles: cambios aplicados")
    return 0


if __name__ == "__main__":
    sys.exit(main())
