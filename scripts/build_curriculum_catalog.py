#!/usr/bin/env python3
"""Genera web/public/content/curriculum-catalog.json y curriculum-stacks/<curso>.json.

La fuente es el índice de temas (topic-index.json, generado por build_web_topic_index.py), así que la
biblioteca de temarios siempre coincide con los cursos y módulos que existen. Los libros y cursos externos
de referencia aún no se catalogan: quedan como listas vacías en el mismo formato.

Uso:
  python3 scripts/build_curriculum_catalog.py          # escribe los archivos
  python3 scripts/build_curriculum_catalog.py --check  # falla si están desactualizados
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "web" / "public" / "content"
INDEX = CONTENT / "topic-index.json"
CATALOG = CONTENT / "curriculum-catalog.json"
STACKS = CONTENT / "curriculum-stacks"


def construir() -> dict[Path, str]:
    indice = json.loads(INDEX.read_text(encoding="utf-8"))
    archivos: dict[Path, str] = {}
    resumenes = []
    total = 0
    for curso in sorted(indice):
        modulos = []
        for modulo in sorted(indice[curso], key=int):
            temas = [
                {
                    "title": tema["title"],
                    "status": "actual",
                    "current": {"module": modulo, "order": orden, "fragment": tema["fragment"]},
                    "sources": [],
                    "courseSources": [],
                }
                for orden, tema in enumerate(indice[curso][modulo], start=1)
            ]
            modulos.append({"id": modulo, "kind": "current", "title": None, "topicCount": len(temas), "topics": temas})
        cantidad = sum(m["topicCount"] for m in modulos)
        total += cantidad
        pila = {"schemaVersion": 1, "stackId": curso, "modules": modulos, "books": [], "courses": [], "booksRequiringOcr": 0}
        archivos[STACKS / f"{curso}.json"] = json.dumps(pila, ensure_ascii=False, indent=1) + "\n"
        resumenes.append({
            "id": curso,
            "asset": f"content/curriculum-stacks/{curso}.json",
            "hasCurrentTrack": True,
            "currentTopicCount": cantidad,
            "exactBookEvidenceTopicCount": 0,
            "bookCandidateCount": 0,
            "courseCandidateCount": 0,
            "topicCount": cantidad,
            "moduleCount": len(modulos),
            "bookCount": 0,
            "courseCount": 0,
            "booksRequiringOcr": 0,
            "modules": [{k: m[k] for k in ("id", "kind", "title", "topicCount")} for m in modulos],
        })
    catalogo = {
        "schemaVersion": 1,
        "summary": {
            "currentTopics": total,
            "currentTopicsWithExactBookEvidence": 0,
            "bookCandidates": 0,
            "courseCandidates": 0,
            "courses": 0,
            "provisionalTopics": total,
            "booksRequiringOcr": 0,
        },
        "stacks": resumenes,
    }
    archivos[CATALOG] = json.dumps(catalogo, ensure_ascii=False, indent=1) + "\n"
    return archivos


def main() -> int:
    archivos = construir()
    sobrantes = [p for p in STACKS.glob("*.json") if p not in archivos] if STACKS.is_dir() else []
    if "--check" in sys.argv:
        viejos = [p for p, texto in archivos.items() if not p.is_file() or p.read_text(encoding="utf-8") != texto]
        if viejos or sobrantes:
            for p in viejos + sobrantes:
                print(f"Desactualizado: {p.relative_to(ROOT)}")
            print("Ejecuta: python3 scripts/build_curriculum_catalog.py")
            return 1
        print(f"Temario validado: {len(archivos) - 1} cursos")
        return 0
    STACKS.mkdir(parents=True, exist_ok=True)
    for p in sobrantes:
        p.unlink()
    for p, texto in archivos.items():
        p.write_text(texto, encoding="utf-8")
    print(f"Temario generado: {len(archivos) - 1} cursos, {len(sobrantes)} pilas retiradas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
