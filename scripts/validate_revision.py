#!/usr/bin/env python3
"""Valida el registro de revisión independiente de la sección 6 del MASTER-PROMPT.

`docs/revision/<curso>.tsv` guarda, una fila por tema, las ocho notas de la rúbrica y firma quién escribió
y quién revisó. Es la prueba de dos reglas que ningún detector de estructura puede dar:

  - sección 6: «un tema se publica con 4 o más en todos los criterios y 5 en exactitud»;
  - sección 1.6: «quien escribe un tema no lo aprueba».

Columnas (tabuladores, cabecera obligatoria):
  curso  modulo  tema  autor  revisor  exactitud_tecnica  actualidad  claridad  profundidad
  ejemplo_ejecutable  ayudas_visuales  ejercicios  accesibilidad  estado  fecha

Con `--publicados` solo exige las reglas a las filas en estado `publicado`; sin esa bandera revisa todas
las filas y además falla si un tema publicado no tiene fecha ISO.

  python3 scripts/validate_revision.py --curso foundations
"""
from __future__ import annotations

import argparse
import csv
import datetime
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "docs" / "revision"
NOTAS = ["actualidad", "claridad", "profundidad", "ejemplo_ejecutable",
         "ayudas_visuales", "ejercicios", "accesibilidad"]
CAMPOS = (["curso", "modulo", "tema", "autor", "revisor", "exactitud_tecnica"] + NOTAS
          + ["estado", "fecha"])


def revisar(ruta: Path, solo_publicados: bool) -> list[str]:
    errores: list[str] = []
    with ruta.open(encoding="utf-8", newline="") as fh:
        lector = csv.DictReader(fh, delimiter="\t")
        if lector.fieldnames is None:
            return [f"{ruta.name}: archivo vacío"]
        if lector.fieldnames != CAMPOS:
            return [f"{ruta.name}: cabecera distinta de la rúbrica de la sección 6"]
        for numero, fila in enumerate(lector, start=2):
            publicado = (fila.get("estado") or "").strip() == "publicado"
            if solo_publicados and not publicado:
                continue
            tema = f"{ruta.name}:{numero} {fila.get('curso')}/M{fila.get('modulo')} {fila.get('tema')}"
            faltan = [c for c in CAMPOS if not (fila.get(c) or "").strip()]
            if faltan:
                errores.append(f"{tema}: faltan {faltan}")
                continue
            try:
                exacta = int(fila["exactitud_tecnica"])
            except ValueError:
                errores.append(f"{tema}: exactitud_tecnica {fila['exactitud_tecnica']!r} no es 1-5")
                continue
            if publicado and exacta != 5:
                errores.append(f"{tema}: exactitud_tecnica {exacta}, la sección 6 exige 5 para publicar")
            elif not 1 <= exacta <= 5:
                errores.append(f"{tema}: exactitud_tecnica {exacta} fuera de 1-5")
            for nota in NOTAS:
                try:
                    valor = int(fila[nota])
                except ValueError:
                    errores.append(f"{tema}: {nota} {fila[nota]!r} no es 1-5")
                    continue
                if publicado and valor < 4:
                    errores.append(f"{tema}: {nota} {valor}, la sección 6 exige 4 o más para publicar")
                elif not 1 <= valor <= 5:
                    errores.append(f"{tema}: {nota} {valor} fuera de 1-5")
            if fila["revisor"].strip() == fila["autor"].strip():
                errores.append(f"{tema}: autor y revisor son el mismo agente (sección 1.6)")
            try:
                datetime.date.fromisoformat(fila["fecha"])
            except ValueError:
                errores.append(f"{tema}: fecha {fila['fecha']!r} no es ISO (AAAA-MM-DD)")
    return errores


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--curso", required=True, help="nombre de carpeta en web/public/content")
    ap.add_argument("--publicados", action="store_true")
    a = ap.parse_args()
    ruta = DIR / f"{a.curso}.tsv"
    if not ruta.is_file():
        print(f"validate_revision: falta {ruta.relative_to(ROOT)} "
              f"(sin registro, ningún tema de {a.curso} puede estar publicado)")
        return 1
    errores = revisar(ruta, a.publicados)
    with ruta.open(encoding="utf-8", newline="") as fh:
        filas = list(csv.DictReader(fh, delimiter="\t"))
    publicados = sum(1 for f in filas if (f.get("estado") or "").strip() == "publicado")
    for error in errores[:40]:
        print(f"  error: {error}")
    print(f"validate_revision {a.curso}: {len(filas)} filas, {publicados} publicados, "
          f"{len(errores)} errores")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
