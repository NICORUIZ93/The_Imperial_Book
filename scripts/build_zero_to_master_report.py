#!/usr/bin/env python3
"""Mide, por ruta, la cobertura «de cero a master» que exige el prompt maestro v2 (specs/003).

Para cada track reporta: módulos por nivel (Fundamentos, Aplicación, Integración, Experto), si
tiene módulo Master, número de temas y cuántos temas ya cumplen ayuda visual y transferencia al
proyecto según docs/topic-learning-quality.json. Es una medición para planear lotes, no una
aprobación: un número alto no demuestra que la explicación sea fácil ni que el código funcione.

  python3 scripts/build_zero_to_master_report.py          # escribe docs/zero-to-master.{md,json}
  python3 scripts/build_zero_to_master_report.py --check  # falla si los reportes están desactualizados
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKS = ROOT / "web" / "src" / "app" / "tracks"
INDEX = ROOT / "web" / "public" / "content" / "topic-index.json"
QUALITY = ROOT / "docs" / "topic-learning-quality.json"
OUT_JSON = ROOT / "docs" / "zero-to-master.json"
OUT_MD = ROOT / "docs" / "zero-to-master.md"
LEVELS = ("Fundamentos", "Aplicación", "Integración", "Experto")
MODULE = re.compile(r"\bm\(\s*(\d+)\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'(?:[^'\\]|\\.)*'\s*,\s*'([^']+)'")


COURSE_DATA = ROOT / "web" / "src" / "app" / "course-data.ts"
MASTER_REGISTRY = ROOT / "docs" / "requested-master-topics.json"


def track_modules(track: str) -> list[dict]:
    path = TRACKS / f"{track}.track.ts"
    if path.is_file():
        source = path.read_text(encoding="utf-8")
    elif track == "cloud":
        # Cloud define sus módulos en course-data.ts (COURSE_MODULES), antes de las demás rutas.
        text = COURSE_DATA.read_text(encoding="utf-8")
        source = text[text.index("export const COURSE_MODULES"):text.index("];", text.index("export const COURSE_MODULES"))]
    else:
        return []
    return [
        {"id": int(mid), "title": title.replace("\\'", "'"), "level": level}
        for mid, title, level in MODULE.findall(source)
    ]


def build() -> dict:
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    quality = json.loads(QUALITY.read_text(encoding="utf-8"))["topics"]
    master = {item["track"] for item in json.loads(MASTER_REGISTRY.read_text(encoding="utf-8"))["tracks"]}
    rows = []
    for track in sorted(index):
        modules = track_modules(track)
        topics = quality.get(track, [])
        levels = {level: sum(1 for m in modules if m["level"] == level) for level in LEVELS}
        missing = [level for level in LEVELS if levels[level] == 0]
        rows.append({
            "track": track,
            "modules": len(index[track]),
            "topics": sum(len(v) for v in index[track].values()),
            "levels": levels,
            "missingLevels": missing,
            "hasMasterModule": track in master or any("master" in m["title"].lower() for m in modules),
            "visualTopics": sum(1 for t in topics if t["criteria"].get("visual")),
            "projectTopics": sum(1 for t in topics if t["criteria"].get("project")),
        })
    return {
        "note": "Medición estructural para planear lotes del prompt maestro v2; no acredita calidad pedagógica.",
        "tracks": rows,
    }


def markdown(data: dict) -> str:
    lines = [
        "# Cobertura de cero a master por ruta",
        "",
        "> Generado por `scripts/build_zero_to_master_report.py` (specs/003). " + data["note"],
        "",
        "| Ruta | Módulos | Temas | Fund. | Aplic. | Integr. | Experto | Módulo Master | Con ayuda visual | Con proyecto | Niveles faltantes |",
        "|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|---|",
    ]
    for row in data["tracks"]:
        lv = row["levels"]
        lines.append(
            f"| {row['track']} | {row['modules']} | {row['topics']} | {lv['Fundamentos']} | {lv['Aplicación']} | "
            f"{lv['Integración']} | {lv['Experto']} | {'sí' if row['hasMasterModule'] else '**no**'} | "
            f"{row['visualTopics']}/{row['topics']} | {row['projectTopics']}/{row['topics']} | "
            f"{', '.join(row['missingLevels']) or '—'} |"
        )
    lines += [
        "",
        "## Cómo se usa",
        "",
        "1. Elige la siguiente ruta según la prioridad de `MASTER-PROMPT.md`.",
        "2. Abre una spec del lote con los temas que faltan para cerrar niveles y ayudas visuales.",
        "3. Crea o reescribe los temas con el prompt maestro v2 y agrégalos a `specs/visual-aids-scope.json`.",
        "4. Regenera este reporte: la columna de ayudas visuales debe subir y ningún nivel debe quedar vacío.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = markdown(data)
    if args.check:
        stale = [p.name for p, text in ((OUT_JSON, json_text), (OUT_MD, md_text))
                 if not p.is_file() or p.read_text(encoding="utf-8") != text]
        if stale:
            print(f"build_zero_to_master_report: desactualizado {stale}; ejecuta el script sin --check")
            return 1
        print("build_zero_to_master_report: al día")
        return 0
    OUT_JSON.write_text(json_text, encoding="utf-8")
    OUT_MD.write_text(md_text, encoding="utf-8")
    print(f"build_zero_to_master_report: {len(data['tracks'])} rutas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
