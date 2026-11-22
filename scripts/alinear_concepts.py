#!/usr/bin/env python3
"""Alinea los `concepts[]` de los tracks con los temas publicados (specs/026 C6).

Los conceptos solo alimentan las palabras clave de la paleta de comandos
(`command-palette.ts`). Un concepto que no corresponde a un tema publicado hace
que la búsqueda anuncie contenido que el alumno no encuentra, así que se
sustituye por los títulos reales de `web/public/content/topic-index.json`.

El formato del archivo (comillas, salto de línea, sangría) se conserva: solo se
reescribe el segmento que va del `[` al `]` del array de conceptos.

Uso:
  python3 scripts/alinear_concepts.py --plan
  python3 scripts/alinear_concepts.py
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKS = ROOT / "web/src/app/tracks"
EXTRA = {"cloud": ROOT / "web/src/app/course-data.ts"}
INDICE = ROOT / "web/public/content/topic-index.json"


def normaliza(texto: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", texto.lower())


def cadenas(segmento: str) -> list[str]:
    """Extrae los literales de un array, respetando la comilla que abre cada uno."""
    resultado: list[str] = []
    i = 0
    while i < len(segmento):
        if segmento[i] not in "'\"":
            i += 1
            continue
        comilla = segmento[i]
        i += 1
        inicio = i
        while i < len(segmento):
            if segmento[i] == "\\":
                i += 2
                continue
            if segmento[i] == comilla:
                resultado.append(segmento[inicio:i])
                i += 1
                break
            i += 1
    return resultado


def campos(cuerpo: str) -> list[tuple[int, int]]:
    """Devuelve (inicio, fin) de cada campo separado por comas de nivel 0."""
    trozos: list[tuple[int, int]] = []
    inicio = 0
    profundidad = 0
    comilla = ""
    escape = False
    for i, ch in enumerate(cuerpo):
        if escape:
            escape = False
            continue
        if comilla:
            if ch == "\\":
                escape = True
            elif ch == comilla:
                comilla = ""
            continue
        if ch in "'\"":
            comilla = ch
        elif ch in "[({":
            profundidad += 1
        elif ch in "])}":
            profundidad -= 1
        elif ch == "," and profundidad == 0:
            trozos.append((inicio, i))
            inicio = i + 1
    trozos.append((inicio, len(cuerpo)))
    return trozos


def cuerpo_m(texto: str, inicio: int) -> tuple[int, str] | None:
    """Dado el índice de una `m(`, devuelve (fin, cuerpo) respetando comillas."""
    profundidad = 0
    comilla = ""
    escape = False
    for i in range(inicio, len(texto)):
        ch = texto[i]
        if escape:
            escape = False
            continue
        if comilla:
            if ch == "\\":
                escape = True
            elif ch == comilla:
                comilla = ""
            continue
        if ch in "'\"":
            comilla = ch
        elif ch == "(":
            profundidad += 1
        elif ch == ")":
            profundidad -= 1
            if profundidad == 0:
                return i, texto[inicio + 1:i]
    return None


def plan() -> list[tuple[Path, int, str, str]]:
    indice = json.loads(INDICE.read_text(encoding="utf-8"))
    cambios: list[tuple[Path, int, str, str]] = []
    declaraciones = [(c.name.replace(".track.ts", ""), c) for c in sorted(TRACKS.glob("*.track.ts"))]
    declaraciones += sorted(EXTRA.items())
    for curso, ruta in declaraciones:
        if curso not in indice:
            continue
        texto = ruta.read_text(encoding="utf-8")
        # Se recorre de atrás hacia delante para que los offsets sigan siendo válidos.
        hallazgos = list(re.finditer(r"\bm\s*\(", texto))
        for hallazgo in reversed(hallazgos):
            encontrado = cuerpo_m(texto, hallazgo.end() - 1)
            if not encontrado:
                continue
            fin, cuerpo = encontrado
            trozos = campos(cuerpo)
            if len(trozos) < 8:
                continue
            id_texto = cuerpo[trozos[0][0]:trozos[0][1]].strip()
            if not id_texto.isdigit():
                continue
            id_modulo = id_texto
            if id_modulo not in indice[curso]:
                continue
            # `createModule` declara: id, título, corto, nivel, duración, color, descripción,
            # concepts, challenges, ... El campo 7 es el que alimenta la paleta de comandos.
            inicio_concepts, fin_concepts = trozos[7]
            segmento = cuerpo[inicio_concepts:fin_concepts]
            if "[" not in segmento or "]" not in segmento:
                continue
            publicados = [t["title"] for t in indice[curso][id_modulo]]
            if not publicados:
                continue
            actuales = cadenas(segmento)
            if [normaliza(x) for x in actuales] == [normaliza(x) for x in publicados]:
                continue
            comilla = "'" if "'" in segmento else '"'
            # El array puede venir en una línea o repartido; se conserva el estilo del original.
            dentro = segmento[segmento.index("[") + 1:segmento.rindex("]")]
            multilinea = "\n" in dentro
            if multilinea:
                base = re.match(r"\s*", dentro.split("\n", 1)[1]).group()
                cierre = re.match(r"\s*", dentro.rsplit("\n", 1)[1]).group()
                nuevo = "[" + "\n" + ",\n".join(
                    f"{base}{comilla}{t.replace(comilla, chr(92) + comilla)}{comilla}" for t in publicados
                ) + "\n" + cierre + "]"
            else:
                nuevo = "[" + ", ".join(
                    f"{comilla}{t.replace(comilla, chr(92) + comilla)}{comilla}" for t in publicados
                ) + "]"
            absoluto_inicio = hallazgo.end() + inicio_concepts
            absoluto_fin = hallazgo.end() + fin_concepts
            cambios.append((ruta, absoluto_inicio, texto[absoluto_inicio:absoluto_fin], nuevo))
    return cambios


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--plan", action="store_true")
    a = ap.parse_args()

    cambios = plan()
    por_archivo: dict[Path, list[tuple[int, str, str]]] = {}
    for ruta, inicio, viejo, nuevo in cambios:
        por_archivo.setdefault(ruta, []).append((inicio, viejo, nuevo))
    print(f"alinear_concepts: {len(cambios)} módulos en {len(por_archivo)} declaraciones")
    for ruta in sorted(por_archivo):
        print(f"  {ruta.relative_to(ROOT)}: {len(por_archivo[ruta])}")

    if not a.plan:
        for ruta, cambios_archivo in por_archivo.items():
            texto = ruta.read_text(encoding="utf-8")
            for inicio, _viejo, nuevo in sorted(cambios_archivo, reverse=True):
                # El segmento viejo puede tener distinta longitud; se localiza por el propio offset.
                fin = inicio + len(_viejo)
                assert texto[inicio:fin] == _viejo, (ruta, inicio)
                texto = texto[:inicio] + nuevo + texto[fin:]
            ruta.write_text(texto, encoding="utf-8")
        print("alinear_concepts: cambios aplicados")
    return 0


if __name__ == "__main__":
    sys.exit(main())
