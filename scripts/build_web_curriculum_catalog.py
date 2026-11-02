#!/usr/bin/env python3
"""Build privacy-safe, per-stack curriculum assets for the academy web app."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "temario-maestro-unificado.json"
CONTENT = ROOT / "web" / "public" / "content"
INDEX = CONTENT / "curriculum-catalog.json"
STACKS_DIR = CONTENT / "curriculum-stacks"
EXPECTED_STACKS = 27


def build_assets(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    stacks: dict[str, dict[str, Any]] = {}
    summary = Counter()

    for stack_id, stack in source["stacks"].items():
        book_ids: dict[str, int] = {}
        books: list[dict[str, str]] = []
        course_ids: dict[str, int] = {}
        courses: list[dict[str, Any]] = []
        modules = []
        stack_counts = Counter()

        for module in stack["modules"]:
            topics = []
            for topic in module["topics"]:
                status = topic["status"]
                if status not in {"actual", "actual+libros", "candidato-libros", "candidato-cursos"}:
                    raise ValueError(f"Unknown topic status in {stack_id}: {status}")
                is_current = topic["current"] is not None
                is_candidate = status in {"candidato-libros", "candidato-cursos"}
                if is_current == is_candidate:
                    raise ValueError(f"Current placement and topic status disagree in {stack_id}: {topic['title']}")

                sources = []
                for source_ref in topic["bookSources"]:
                    source_path = source_ref["path"]
                    if source_path not in book_ids:
                        book_ids[source_path] = len(books)
                        books.append({
                            "title": source_ref["book"],
                            "language": source_ref["language"],
                        })
                    sources.append({
                        "bookId": book_ids[source_path],
                        "page": source_ref["page"],
                    })

                course_sources = []
                for course_id in topic["courseSources"]:
                    if course_id not in course_ids:
                        course = next(item for item in stack.get("courses", []) if item["id"] == course_id)
                        course_ids[course_id] = len(courses)
                        courses.append({
                            "provider": course["provider"],
                            "title": course["title"],
                            "url": course["url"],
                            "language": course["language"],
                            "audience": course["audience"],
                            "sourceNote": course["sourceNote"],
                            "projectFeatures": course["projectFeatures"],
                        })
                    course_sources.append({"courseId": course_ids[course_id]})

                topics.append({
                    "title": topic["title"],
                    "status": status,
                    "current": topic["current"],
                    "sources": sources,
                    "courseSources": course_sources,
                })
                stack_counts[status] += 1
                summary[status] += 1

            modules.append({
                "id": module["id"],
                "kind": module["kind"],
                "title": module.get("title"),
                "topicCount": len(topics),
                "topics": topics,
            })

        ocr_books = [
            {"title": book["title"], "pages": book["pages"]}
            for book in stack.get("booksRequiringOcr", [])
        ]
        summary["booksRequiringOcr"] += len(ocr_books)
        stacks[stack_id] = {
            "schemaVersion": 1,
            "stackId": stack_id,
            "modules": modules,
            "books": books,
            "courses": courses,
            "booksRequiringOcr": ocr_books,
        }

    current_topics = summary["actual"] + summary["actual+libros"]
    book_candidate_topics = summary["candidato-libros"]
    course_candidate_topics = summary["candidato-cursos"]
    provisional_topics = current_topics + book_candidate_topics + course_candidate_topics
    expected = source["summary"]
    checks = {
        "currentTopics": current_topics,
        "currentTopicsWithExactBookEvidence": summary["actual+libros"],
        "additionalUniqueBookTopics": book_candidate_topics,
        "additionalCourseTopics": course_candidate_topics,
        "courses": sum(len(stack.get("courses", [])) for stack in source["stacks"].values()),
        "unifiedTopics": provisional_topics,
        "booksRequiringOcr": summary["booksRequiringOcr"],
    }
    for field, actual in checks.items():
        if actual != expected[field]:
            raise ValueError(f"{field} mismatch: source says {expected[field]}, generated {actual}")
    if len(stacks) != EXPECTED_STACKS:
        raise ValueError(f"Expected {EXPECTED_STACKS} stacks, found {len(stacks)}")

    index = {
        "schemaVersion": 1,
        "summary": {
            "currentTopics": current_topics,
            "currentTopicsWithExactBookEvidence": summary["actual+libros"],
            "bookCandidates": book_candidate_topics,
            "courseCandidates": course_candidate_topics,
            "courses": checks["courses"],
            "provisionalTopics": provisional_topics,
            "booksRequiringOcr": summary["booksRequiringOcr"],
        },
        "stacks": [],
    }

    for stack_id, stack in stacks.items():
        counts = Counter(
            topic["status"]
            for module in stack["modules"]
            for topic in module["topics"]
        )
        index["stacks"].append({
            "id": stack_id,
            "asset": f"content/curriculum-stacks/{stack_id}.json",
            "hasCurrentTrack": counts["actual"] + counts["actual+libros"] > 0,
            "currentTopicCount": counts["actual"] + counts["actual+libros"],
            "exactBookEvidenceTopicCount": counts["actual+libros"],
            "bookCandidateCount": counts["candidato-libros"],
            "courseCandidateCount": counts["candidato-cursos"],
            "topicCount": sum(counts.values()),
            "moduleCount": len(stack["modules"]),
            "bookCount": len(stack["books"]),
            "courseCount": len(stack["courses"]),
            "booksRequiringOcr": len(stack["booksRequiringOcr"]),
            "modules": [
                {
                    "id": module["id"], "kind": module["kind"],
                    "title": module["title"], "topicCount": module["topicCount"],
                }
                for module in stack["modules"]
            ],
        })

    return index, stacks


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    index, stacks = build_assets(source)
    write_json(INDEX, index)
    for stack_id, data in stacks.items():
        write_json(STACKS_DIR / f"{stack_id}.json", data)

    total_bytes = INDEX.stat().st_size + sum((STACKS_DIR / f"{stack_id}.json").stat().st_size for stack_id in stacks)
    print(
        f"Web curriculum catalog generated: {len(stacks)} stacks, "
        f"{index['summary']['provisionalTopics']} topics, {total_bytes:,} bytes. "
        "Local source paths were omitted."
    )


if __name__ == "__main__":
    main()
