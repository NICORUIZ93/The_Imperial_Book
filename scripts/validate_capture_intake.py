#!/usr/bin/env python3
"""Valida docs/capture-intake.json, el registro de capturas convertidas en temas (specs/003).

Cada tema extraído de una captura debe tener una decisión comprobable:
  cubierto / agregado  -> cada ubicación (track, module, topic) existe en topic-index.json
  candidato            -> el curso citado existe en docs/course-curriculum-inventory.json
                          y en docs/temario-maestro-unificado.json
  fuera-de-alcance     -> lleva un motivo escrito
Además, todo curso citado por una captura debe estar en el inventario y en el temario unificado, y
una captura con `publishedAs` (ruta recomendada visible en la app) debe tener esa sección en la lección
con un enlace a cada tema cubierto o agregado.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INTAKE = ROOT / "docs" / "capture-intake.json"
INDEX = ROOT / "web" / "public" / "content" / "topic-index.json"
INVENTORY = ROOT / "docs" / "course-curriculum-inventory.json"
UNIFIED = ROOT / "docs" / "temario-maestro-unificado.json"
DECISIONS = {"cubierto", "agregado", "candidato", "fuera-de-alcance"}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    intake, index = load(INTAKE), load(INDEX)
    inventory_ids = {course["id"] for course in load(INVENTORY)["courses"]}
    unified_ids = {
        course["id"]
        for stack in load(UNIFIED)["stacks"].values()
        for course in stack.get("courses", [])
    }
    errors: list[str] = []
    counts = {decision: 0 for decision in sorted(DECISIONS)}

    def check_course(course_id: str, where: str) -> None:
        if course_id not in inventory_ids:
            errors.append(f"{where}: el curso '{course_id}' no está en course-curriculum-inventory.json")
        elif course_id not in unified_ids:
            errors.append(f"{where}: el curso '{course_id}' no aparece en temario-maestro-unificado.json (regenera con build_unified_curriculum.py)")

    for batch in intake["batches"]:
        for capture in batch["captures"]:
            name = f"{batch['id']}/{capture['file']}"
            if capture.get("inventoryCourse"):
                check_course(capture["inventoryCourse"], name)
            published = capture.get("publishedAs")
            if published:
                lesson = ROOT / "web" / "public" / "content" / published["track"] / f"modulo-{published['module']}.md"
                text = lesson.read_text(encoding="utf-8") if lesson.is_file() else ""
                heading = f"## {published['heading']}"
                if heading not in text:
                    errors.append(f"{name}: falta la sección «{published['heading']}» en {lesson.relative_to(ROOT)}")
                else:
                    section = text.split(heading, 1)[1].split("\n## ", 1)[0]
                    for topic in capture["topics"]:
                        for place in topic.get("where", [])[:1]:
                            items = index.get(place["track"], {}).get(str(place["module"]), [])
                            if 1 <= place["topic"] <= len(items):
                                link = f"/curso/{place['track']}/{place['module']}#{items[place['topic'] - 1]['fragment']}"
                                if link not in section:
                                    errors.append(f"{name}: la ruta publicada no enlaza «{topic['title']}» ({link})")
            for topic in capture["topics"]:
                label = f"{name} «{topic['title']}»"
                decision = topic.get("decision")
                if decision not in DECISIONS:
                    errors.append(f"{label}: decisión desconocida '{decision}'")
                    continue
                counts[decision] += 1
                if decision in {"cubierto", "agregado"}:
                    if not topic.get("where"):
                        errors.append(f"{label}: falta 'where'")
                    for place in topic.get("where", []):
                        topics = index.get(place["track"], {}).get(str(place["module"]), [])
                        if not 1 <= place["topic"] <= len(topics):
                            errors.append(f"{label}: {place['track']}/M{place['module']} Tema {place['topic']} no existe")
                elif decision == "candidato":
                    if not topic.get("reason"):
                        errors.append(f"{label}: un candidato necesita 'reason'")
                    check_course(topic.get("inventoryCourse", ""), label)
                elif not topic.get("reason"):
                    errors.append(f"{label}: fuera de alcance sin 'reason'")

    print(f"validate_capture_intake: {sum(counts.values())} temas de capturas {counts}")
    for error in errors:
        print(f"  error: {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
