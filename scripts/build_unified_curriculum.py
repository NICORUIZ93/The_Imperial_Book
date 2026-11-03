#!/usr/bin/env python3
"""Une las rutas actuales con encabezados de libros y currículos de cursos."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "docs" / "book-curriculum-inventory.json"
COURSES = ROOT / "docs" / "course-curriculum-inventory.json"
CURRENT = ROOT / "web" / "public" / "content" / "topic-index.json"
OUT_MD = ROOT / "docs" / "temario-maestro-unificado.md"
OUT_JSON = ROOT / "docs" / "temario-maestro-unificado.json"

STACK_ORDER = [
    "foundations", "javascript", "node", "angular", "react", "java",
    "spring-boot", "microservices", "kotlin-multiplatform", "android", "ios", "flutter",
    "devops", "cloud", "rutaflow", "python", "cpp", "data-ai",
    "cybersecurity", "databases", "iot-embedded", "robotics-drones",
    "ui-ux", "game-development", "quantum-computing", "electronics",
    "math-science", "general-technical",
]


def norm(value: str) -> str:
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def main() -> None:
    current = json.loads(CURRENT.read_text(encoding="utf-8"))
    inventory = json.loads(BOOKS.read_text(encoding="utf-8"))
    course_inventory = json.loads(COURSES.read_text(encoding="utf-8"))
    book_topics: dict[str, dict[str, dict]] = defaultdict(dict)
    ocr: dict[str, list[dict]] = defaultdict(list)
    courses_by_stack: dict[str, list[dict]] = defaultdict(list)

    for book in inventory["books"]:
        if not book["topics"]:
            ocr[book["stack"]].append({
                "title": book["title"], "pages": book["pages"], "path": book["path"]
            })
            continue
        for position, topic in enumerate(book["topics"]):
            key = norm(topic["title"])
            if not key:
                continue
            item = book_topics[book["stack"]].setdefault(key, {
                "title": topic["title"], "sources": [],
                "firstOrder": [book["path"], topic.get("page") or 10**9, position],
            })
            item["sources"].append({
                "book": book["title"], "language": book["language"],
                "page": topic.get("page"), "path": book["path"],
            })

    for course in course_inventory["courses"]:
        if course["stack"] not in STACK_ORDER:
            raise ValueError(f"Unknown course stack: {course['stack']}")
        if "fbclid" in course["url"]:
            raise ValueError(f"Tracking parameters must not be stored in course URL: {course['id']}")
        courses_by_stack[course["stack"]].append(course)

    result = {"summary": {}, "stacks": {}}
    current_count = 0
    merged_count = 0
    book_only_count = 0
    course_topic_count = 0

    for stack in STACK_ORDER:
        modules = []
        stack_books = book_topics.get(stack, {})
        used = set()
        for module_id, topics in sorted(current.get(stack, {}).items(), key=lambda item: int(item[0])):
            unified_topics = []
            for order, topic in enumerate(topics, 1):
                current_count += 1
                key = norm(topic["title"])
                sources = stack_books.get(key, {}).get("sources", [])
                if sources:
                    merged_count += 1
                    used.add(key)
                unified_topics.append({
                    "title": topic["title"], "status": "actual+libros" if sources else "actual",
                    "current": {"module": str(module_id), "order": order, "fragment": topic["fragment"]},
                    "bookSources": sources,
                    "courseSources": [],
                })
            modules.append({"id": str(module_id), "kind": "current", "topics": unified_topics})

        additions = []
        for key, item in sorted(stack_books.items(), key=lambda pair: pair[1]["firstOrder"]):
            if key in used:
                continue
            additions.append({
                "title": item["title"], "status": "candidato-libros",
                "current": None, "bookSources": item["sources"], "courseSources": [],
            })
        book_only_count += len(additions)
        if additions:
            modules.append({"id": "expansion-editorial", "kind": "candidate", "topics": additions})

        stack_courses = courses_by_stack.get(stack, [])
        course_modules = []
        if stack_courses:
            for course in stack_courses:
                topics = []
                seen = set()
                for title in course["topics"]:
                    key = norm(title)
                    if not key or key in seen:
                        continue
                    seen.add(key)
                    topics.append({
                        "title": title, "status": "candidato-cursos",
                        "current": None, "bookSources": [],
                        "courseSources": [course["id"]],
                    })
                course_topic_count += len(topics)
                course_modules.append({
                    "id": course["id"], "kind": "course",
                    "title": course["title"], "topics": topics,
                })

        if modules or ocr.get(stack) or stack_courses:
            result["stacks"][stack] = {
                "modules": modules + course_modules,
                "booksRequiringOcr": ocr.get(stack, []),
                "courses": stack_courses,
            }

    book_topics_total = current_count + book_only_count
    result["summary"] = {
        "currentTopics": current_count,
        "currentTopicsWithExactBookEvidence": merged_count,
        "additionalUniqueBookTopics": book_only_count,
        "additionalCourseTopics": course_topic_count,
        "courses": len(course_inventory["courses"]),
        "unifiedTopics": book_topics_total + course_topic_count,
        "booksRequiringOcr": sum(len(items) for items in ocr.values()),
        "rule": "Sólo se fusionan coincidencias exactas normalizadas dentro del mismo stack.",
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = result["summary"]
    lines = [
        "# Temario maestro unificado: academia + libros", "",
        "> Conserva todos los temas actuales y todos los encabezados únicos recuperados. Una entrada candidata aún requiere revisión curricular y pedagógica antes de publicarse como lección.", "",
        f"- Temas actuales conservados: {summary['currentTopics']}",
        f"- Temas actuales con evidencia exacta en libros: {summary['currentTopicsWithExactBookEvidence']}",
        f"- Temas adicionales únicos de libros: {summary['additionalUniqueBookTopics']}",
        f"- Temas candidatos provenientes de cursos: {summary['additionalCourseTopics']}",
        f"- Cursos externos inventariados: {summary['courses']}",
        f"- Total unificado provisional: {summary['unifiedTopics']}",
        f"- Libros pendientes de OCR: {summary['booksRequiringOcr']}",
        f"- Regla de fusión: {summary['rule']}", "",
        "## Estados", "",
        "- `actual`: tema publicado actualmente.",
        "- `actual+libros`: tema publicado con coincidencia exacta en uno o más libros.",
        "- `candidato-libros`: tema adicional conservado de un libro, pendiente de ubicación pedagógica.",
        "- `candidato-cursos`: tema anunciado en un curso externo, pendiente de revisión; no es una lección publicada.", "",
    ]
    for stack in STACK_ORDER:
        data = result["stacks"].get(stack)
        if not data:
            continue
        total = sum(len(module["topics"]) for module in data["modules"])
        lines.extend([f"## Stack: {stack}", "", f"Total provisional: {total} temas.", ""])
        for module in data["modules"]:
            title = (
                f"Módulo actual {module['id']}" if module["kind"] == "current"
                else f"Curso fuente: {module['title']}" if module["kind"] == "course"
                else "Expansión editorial por organizar"
            )
            lines.extend([f"### {title}", ""])
            for index, topic in enumerate(module["topics"], 1):
                lines.append(f"{index}. **{topic['title']}** — `{topic['status']}`")
                for source in topic["bookSources"]:
                    page = f", p. {source['page']}" if source["page"] else ""
                    lines.append(f"   - Fuente ({source['language']}{page}): {source['book']} — `{source['path']}`")
                for course_id in topic["courseSources"]:
                    course = next(course for course in data["courses"] if course["id"] == course_id)
                    lines.append(f"   - Curso fuente: [{course['provider']} — {course['title']}]({course['url']})")
            lines.append("")
        if data["booksRequiringOcr"]:
            lines.extend(["### Libros pendientes de OCR", ""])
            for book in data["booksRequiringOcr"]:
                lines.append(f"- {book['title']} — {book['pages']} páginas — `{book['path']}`")
            lines.append("")
        if data["courses"]:
            for course in data["courses"]:
                lines.extend([
                    f"#### Alcance anunciado del proyecto final: {course['title']}",
                    "",
                    f"- Audiencia indicada: {course['audience']}",
                    f"- Nota: {course['sourceNote']}",
                ])
                lines.extend(f"- {feature}" for feature in course["projectFeatures"])
                lines.append("")
    OUT_MD.write_text("\n".join(line.rstrip() for line in lines).rstrip() + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
