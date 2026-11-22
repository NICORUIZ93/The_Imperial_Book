#!/usr/bin/env python3
"""Compara los títulos de módulo de los tracks con el H1 de la lección publicada.

Cada `web/src/app/tracks/<curso>.track.ts` declara `m(id, 'Título', ...)`, que debe
coincidir con `# Módulo <id>: Título` en `web/public/content/<curso>/modulo-<id>.md`.
También comprueba que los `concepts[]` anuncien solo temas publicados en
`web/public/content/topic-index.json` (specs/026 C6): la paleta de comandos usa
esos textos como palabras clave y no debe sugerir lecciones inexistentes.

Uso:
  python3 scripts/audit_track_lesson_titles.py             # informe
  python3 scripts/audit_track_lesson_titles.py --check     # falla si hay divergencias
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKS = ROOT / "web/src/app/tracks"
CONTENT = ROOT / "web/public/content"
M = re.compile(r"\bm\((\d+),\s*'((?:[^'\\]|\\.)*)'")
H1 = re.compile(r"^# Módulo (\d+):\s*(.+?)\s*$", re.M)
INDICE = ROOT / "web/public/content/topic-index.json"
EXTRA = {"cloud": ROOT / "web/src/app/course-data.ts"}


def concepts_divergentes() -> list[str]:
    """Conceptos que la paleta anuncia pero el índice de temas no publica."""
    from alinear_concepts import campos, cadenas, cuerpo_m, normaliza  # import local: mismo directorio

    indice = json.loads(INDICE.read_text(encoding="utf-8"))
    divergencias: list[str] = []
    declaraciones = [(c.name.replace(".track.ts", ""), c) for c in sorted(TRACKS.glob("*.track.ts"))]
    declaraciones += sorted(EXTRA.items())
    for curso, ruta in declaraciones:
        if curso not in indice:
            continue
        texto = ruta.read_text(encoding="utf-8")
        for hallazgo in re.finditer(r"\bm\s*\(", texto):
            encontrado = cuerpo_m(texto, hallazgo.end() - 1)
            if not encontrado:
                continue
            fin, cuerpo = encontrado
            trozos = campos(cuerpo)
            if len(trozos) < 8:
                continue
            id_modulo = cuerpo[trozos[0][0]:trozos[0][1]].strip()
            if not id_modulo.isdigit() or id_modulo not in indice[curso]:
                continue
            segmento = cuerpo[trozos[7][0]:trozos[7][1]]
            actuales = cadenas(segmento)
            publicados = [t["title"] for t in indice[curso][id_modulo]]
            if [normaliza(x) for x in actuales] != [normaliza(x) for x in publicados]:
                divergencias.append(f"{curso}/modulo-{id_modulo}: concepts no publicados")
    return divergencias


def titulos_track(ruta: Path) -> dict[int, str]:
    texto = ruta.read_text(encoding="utf-8")
    return {int(id_): titulo.replace("\\'", "'") for id_, titulo in M.findall(texto)}


def titulos_leccion(curso: Path) -> dict[int, str]:
    resultado: dict[int, str] = {}
    for fichero in sorted(curso.glob("modulo-*.md")):
        texto = fichero.read_text(encoding="utf-8")
        encontrado = H1.search(texto)
        if encontrado:
            resultado[int(encontrado.group(1))] = encontrado.group(2).strip()
    return resultado


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    divergencias: list[str] = []
    for track in sorted(TRACKS.glob("*.track.ts")):
        curso = track.name.replace(".track.ts", "")
        directorio = CONTENT / curso
        if not directorio.is_dir():
            continue
        tt, tl = titulos_track(track), titulos_leccion(directorio)
        for id_ in sorted(set(tt) & set(tl)):
            if tt[id_].strip() != tl[id_].strip():
                divergencias.append(f"{curso}/modulo-{id_}: track '{tt[id_]}' != H1 '{tl[id_]}'")

    conceptos = concepts_divergentes()
    print(f"audit_track_lesson_titles: {len(divergencias)} títulos divergentes, "
          f"{len(conceptos)} módulos con concepts no publicados")
    for linea in divergencias[:25]:
        print("  " + linea)
    for linea in conceptos[:25]:
        print("  " + linea)
    if a.check and (divergencias or conceptos):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
