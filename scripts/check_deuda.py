#!/usr/bin/env python3
"""Trinquete de deuda (specs/025 C6, specs/026 C8): ningún contador puede empeorar.

La puerta no exige saldar la deuda —eso la legalizaría— sino impedir que un lote
nuevo la aumente. El suelo vive en `scripts/umbrales.json` y solo se mueve hacia
arriba al cerrar cada lote de la spec 026.

Uso:
  python3 scripts/check_deuda.py            # informe
  python3 scripts/check_deuda.py --check    # falla si algún contador empeoró
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ITEMS = ROOT / "docs/auditoria/prompt-maestro-items.json"
FUENTES = ROOT / "docs/auditoria/fuentes-oficiales.json"
COHERENCIA = ROOT / "docs/auditoria/coherencia-codigo.csv"
UMBRALES = ROOT / "scripts" / "umbrales.json"


def medir() -> dict[str, int]:
    actual: dict[str, int] = {}
    items = json.loads(ITEMS.read_text(encoding="utf-8"))
    for punto, datos in items.get("resumen", {}).items():
        actual[punto] = datos["cumplen"]

    fuentes = json.loads(FUENTES.read_text(encoding="utf-8"))
    actual["urls_rotas"] = fuentes["urls_rotas"]

    salida = subprocess.run(
        [sys.executable, str(ROOT / "scripts/validate_formato.py")],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    total = re.search(r"^\| \*\*Total\*\* \| \d+ \| (\d+) \|", salida, re.M)
    if not total:
        raise RuntimeError("validate_formato no devolvió la fila Total")
    actual["en_formato"] = int(total.group(1))
    # Número de cursos al 100 % se lee directamente del resultado de --check.
    check = subprocess.run(
        [sys.executable, str(ROOT / "scripts/validate_formato.py"), "--check"],
        cwd=ROOT, capture_output=True, text=True, check=False,
    )
    salida_check = check.stdout + check.stderr
    m = re.search(r"ok \((\d+) de (\d+) cursos completos", salida_check)
    actual["cursos_en_formato"] = int(m.group(1)) if m else actual.get("cursos_en_formato", 0)

    tiempos = subprocess.run(
        [sys.executable, str(ROOT / "scripts/check_tiempos.py")],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    m = re.search(r"(\d+)/(\d+) temas con nivel", tiempos)
    actual["temas_con_nivel_minutos"] = int(m.group(1)) if m else 0

    with COHERENCIA.open(encoding="utf-8", newline="") as fh:
        filas = list(csv.DictReader(fh))
    actual["temas_sin_incidencia_codigo"] = sum(
        1 for r in filas if all(r[k] == "0" for k in ("C1", "C2", "C3", "C4", "C5", "C6"))
    )

    titulos = subprocess.run(
        [sys.executable, str(ROOT / "scripts/audit_track_lesson_titles.py")],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    m = re.search(r"(\d+) títulos divergentes", titulos)
    actual["titulos_divergentes"] = int(m.group(1)) if m else 0
    m = re.search(r"(\d+) módulos con concepts no publicados", titulos)
    actual["modulos_concepts_divergentes"] = int(m.group(1)) if m else 0

    orden = subprocess.run(
        [sys.executable, str(ROOT / "scripts/audit_topic_order.py")],
        cwd=ROOT, capture_output=True, text=True, check=False,
    ).stdout
    m = re.search(r"(\d+) módulos con incidencias", orden)
    actual["modulos_orden_niveles_incorrecto"] = int(m.group(1)) if m else 0
    return actual


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    try:
        suelos = json.loads(UMBRALES.read_text(encoding="utf-8"))
        actual = medir()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"check_deuda: no se pudo medir: {error}")
        return 1

    peores: list[str] = []
    for clave, base in suelos["mas_es_mejor"].items():
        valor = actual.get(clave)
        if valor is None:
            peores.append(f"{clave}: sin medición")
            print(f"  {clave}: sin medición (suelo {base})")
            continue
        ok = valor >= base
        print(f"  {clave}: {valor} (suelo {base}) {'ok' if ok else 'EMPEORÓ'}")
        if not ok:
            peores.append(f"{clave}: {valor} frente a {base}")
    for clave, base in suelos["menos_es_mejor"].items():
        valor = actual.get(clave)
        if valor is None:
            peores.append(f"{clave}: sin medición")
            print(f"  {clave}: sin medición (techo {base})")
            continue
        ok = valor <= base
        print(f"  {clave}: {valor} (techo {base}) {'ok' if ok else 'EMPEORÓ'}")
        if not ok:
            peores.append(f"{clave}: {valor} frente a {base}")

    if a.check and peores:
        print("check_deuda: la deuda aumentó — " + "; ".join(peores))
        return 1
    print("check_deuda: " + ("al día" if a.check else "informe"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
