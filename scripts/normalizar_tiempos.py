#!/usr/bin/env python3
"""Declara nivel y duración en los temas que aún no los tienen (specs/026 C5).

La regla es derivada, no inventada: el nivel sale del campo `level` del módulo en
`web/src/app/tracks/<curso>.track.ts` y los minutos de su `duration`, repartidos
entre los temas del capítulo y acotados al rango de FORMATO-UNICO (20–45 min).
Así el meta es coherente con el temario ya aprobado y no depende de criterios
arbitrarios por tema.

Uso:
  python3 scripts/normalizar_tiempos.py --plan        # qué cambiaría, sin escribir
  python3 scripts/normalizar_tiempos.py               # aplica los cambios
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audit_track_lesson_titles import TRACKS, CONTENT  # noqa: E402

# El hilo paralelo de visuales está editando este capítulo; no se toca aquí.
EXCLUIDOS = {CONTENT / "foundations" / "modulo-1.md"}
NIVEL_TRACK = {
    "Fundamentos": "Básico",
    "Aplicación": "Intermedio",
    "Integración": "Avanzado",
    "Experto": "Avanzado",
}
MODULO = re.compile(r"\bm\((\d+),\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'([^']+)',\s*'([^']+)'", re.S)
# Cloud no tiene archivo en tracks/: sus módulos se declaran en course-data.ts.
FUERAS_DE_TRACK = {"cloud": TRACKS.parent / "course-data.ts"}
TEMA = re.compile(r"^### Tema \d+:\s*(.+)$")
Y_DECLARADO = re.compile(
    r"[·•]\s*(?:Básico|Intermedio|Avanzado|Experto)\s*[·•]\s*"
    r"\d+(?:\s*h(?:\s*\d+\s*min)?)?(?:\s*min(?:utos)?)?", re.I)


def minutos_de(duracion: str) -> int:
    horas = re.search(r"(\d+(?:[.,]\d+)?)\s*h", duracion, re.I)
    mins = re.search(r"(\d+)\s*min", duracion, re.I)
    total = (float(horas.group(1).replace(",", ".")) * 60 if horas else 0)
    total += int(mins.group(1)) if mins else 0
    return int(total)


def plan() -> list[tuple[Path, int, str, str]]:
    cambios: list[tuple[Path, int, str, str]] = []
    declaraciones = [(t.name.replace(".track.ts", ""), t) for t in sorted(TRACKS.glob("*.track.ts"))]
    declaraciones += list(FUERAS_DE_TRACK.items())
    for curso, track in declaraciones:
        directorio = CONTENT / curso
        if not directorio.is_dir():
            continue
        texto_track = track.read_text(encoding="utf-8")
        fichas = {int(m.group(1)): (m.group(4), m.group(5)) for m in MODULO.finditer(texto_track)}
        for fichero in sorted(directorio.glob("modulo-*.md")):
            if fichero in EXCLUIDOS:
                continue
            id_modulo = int(re.search(r"\d+", fichero.stem).group())
            if id_modulo not in fichas:
                continue
            level, duracion = fichas[id_modulo]
            nivel = NIVEL_TRACK.get(level)
            if not nivel:
                continue
            lineas = fichero.read_text(encoding="utf-8").splitlines()
            temas = [i for i, linea in enumerate(lineas) if TEMA.match(linea)]
            if not temas:
                continue
            minutos = max(20, min(45, round(minutos_de(duracion) / len(temas) / 5) * 5))
            if minutos_de(duracion) == 0:
                continue
            for i in temas:
                linea = lineas[i]
                declarado = Y_DECLARADO.search(linea)
                if declarado and 20 <= int(re.search(r"(\d+)", declarado.group()).group()) <= 45:
                    continue
                if declarado:
                    nuevo = Y_DECLARADO.sub(f"· {nivel} · {minutos} min", linea)
                    # El patrón no consume el sufijo: sin esto quedaría «45 min min».
                    nuevo = re.sub(r"(\b\d+\s*min)\s+min\b", r"\1", nuevo)
                else:
                    nuevo = linea.rstrip() + f" · {nivel} · {minutos} min"
                cambios.append((fichero, i, linea, nuevo))
    return cambios


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--plan", action="store_true")
    a = ap.parse_args()

    cambios = plan()
    por_fichero: dict[Path, dict[int, str]] = {}
    for fichero, i, _viejo, nuevo in cambios:
        por_fichero.setdefault(fichero, {})[i] = nuevo

    print(f"normalizar_tiempos: {len(cambios)} temas en {len(por_fichero)} capítulos")
    for fichero in sorted(por_fichero)[:8]:
        print(f"  {fichero.relative_to(Path.cwd())}: {len(por_fichero[fichero])}")
    if len(por_fichero) > 8:
        print(f"  ... y {len(por_fichero) - 8} capítulos más")

    if not a.plan:
        for fichero, lineas in por_fichero.items():
            original = fichero.read_text(encoding="utf-8").splitlines()
            for i, nuevo in lineas.items():
                original[i] = nuevo
            fichero.write_text("\n".join(original) + "\n", encoding="utf-8")
        print("normalizar_tiempos: cambios aplicados")
    return 0


if __name__ == "__main__":
    sys.exit(main())
