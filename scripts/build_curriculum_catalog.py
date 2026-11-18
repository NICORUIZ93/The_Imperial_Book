#!/usr/bin/env python3
"""Genera los datos de la página Temario desde el índice de temas real (specs/013).

Entrada: web/public/content/topic-index.json (lo produce build_web_topic_index.py).
Salida: web/public/content/curriculum-catalog.json y curriculum-stacks/<curso>.json.
Solo publica temas con lección real: no hay candidatos ni fuentes inventadas.
Uso: python3 scripts/build_curriculum_catalog.py [--check]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
INDEX = CONTENT / "topic-index.json"
CATALOG = CONTENT / "curriculum-catalog.json"
STACKS = CONTENT / "curriculum-stacks"
ORDER = ["foundations", "javascript", "node", "angular", "react", "java", "spring-boot", "microservices",
         "kotlin-multiplatform", "android", "ios", "flutter", "devops", "cloud", "rutaflow", "control-1"]


def dump(data: object) -> str:
    return json.dumps(data, ensure_ascii=False) + "\n"


def build() -> dict[Path, str]:
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    ids = [t for t in ORDER if t in index] + sorted(t for t in index if t not in ORDER)
    files: dict[Path, str] = {}
    summaries = []
    total = 0
    for track in ids:
        modules = []
        for module_id in sorted(index[track], key=int):
            topics = [{"title": t["title"], "status": "actual",
                       "current": {"module": module_id, "order": order, "fragment": t["fragment"]},
                       "sources": [], "courseSources": []}
                      for order, t in enumerate(index[track][module_id], start=1)]
            modules.append({"id": module_id, "kind": "current", "title": None,
                            "topicCount": len(topics), "topics": topics})
        count = sum(m["topicCount"] for m in modules)
        total += count
        files[STACKS / f"{track}.json"] = dump({"schemaVersion": 1, "stackId": track, "modules": modules,
                                                 "books": [], "courses": [], "booksRequiringOcr": []})
        summaries.append({"id": track, "asset": f"content/curriculum-stacks/{track}.json", "hasCurrentTrack": True,
                          "currentTopicCount": count, "exactBookEvidenceTopicCount": 0, "bookCandidateCount": 0,
                          "courseCandidateCount": 0, "topicCount": count, "moduleCount": len(modules),
                          "bookCount": 0, "courseCount": 0, "booksRequiringOcr": 0,
                          "modules": [{k: m[k] for k in ("id", "kind", "title", "topicCount")} for m in modules]})
    files[CATALOG] = dump({"schemaVersion": 1, "summary": {
        "currentTopics": total, "currentTopicsWithExactBookEvidence": 0, "bookCandidates": 0,
        "courseCandidates": 0, "courses": 0, "provisionalTopics": total, "booksRequiringOcr": 0},
        "stacks": summaries})
    return files


def main() -> int:
    files = build()
    stale_extra = {p for p in STACKS.glob("*.json")} - set(files)
    if "--check" in sys.argv:
        stale = [p for p, text in files.items() if not p.exists() or p.read_text(encoding="utf-8") != text]
        stale += sorted(stale_extra)
        for p in stale:
            print(f"desactualizado: {p.relative_to(ROOT)}")
        if stale:
            print("Ejecuta python3 scripts/build_curriculum_catalog.py")
            return 1
        print(f"build_curriculum_catalog: al día ({len(files) - 1} cursos)")
        return 0
    for p in stale_extra:
        p.unlink()
    for p, text in files.items():
        p.write_text(text, encoding="utf-8")
    print(f"Temario generado: {len(files) - 1} cursos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
