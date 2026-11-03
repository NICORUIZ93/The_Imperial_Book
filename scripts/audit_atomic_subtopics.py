#!/usr/bin/env python3
"""Reporta estructura atómica de cuatro pasos sin confundirla con aprendizaje."""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_REPORT = ROOT / "docs/atomic-subtopics.json"
MD_REPORT = ROOT / "docs/atomic-subtopics.md"
TOPIC = re.compile(r"^### Tema(?:\s|:).*$", re.MULTILINE)
SUBTOPIC = re.compile(r"^#### Subtema\s+(\d+\.\d+)\b.*$", re.MULTILINE)


def matches(pattern: str, text: str) -> bool:
    return bool(re.search(pattern, text, re.IGNORECASE | re.MULTILINE))


def evaluate(block: str) -> dict[str, bool]:
    has_action = matches(r"\*\*2\. Hazlo t[uú]\*\*|\*\*Hazlo t[uú]:\*\*", block)
    has_code_or_command = matches(r"```(?:bash|sh|java|js|ts|dart|sql|ya?ml)", block) or matches(
        r"\./mvnw|\./gradlew|\bnpm\s|\bnode\s|\bflutter\s|\bdart\s|\bdocker\s|\bpodman\s", block
    )
    has_file = matches(
        r"(?:src/|lib/|examples/|test/|web/|app/)[\w./-]+\.[\w]+|`[\w./-]+\.(?:java|kt|js|mjs|ts|tsx|dart|sql|ya?ml|json)`",
        block,
    )
    return {
        "context": matches(r"\*\*1\. Contexto\*\*|\*\*Contexto:\*\*", block),
        "action": has_action and has_code_or_command and has_file,
        "expectedResult": matches(r"salida esperada|resultado esperado", block),
        "deliberateFailure": matches(r"fallo deliberado", block)
        and matches(r"diagn[oó]stico", block),
        "understand": matches(r"\*\*3\. Entiende\*\*|\*\*Entiende:\*\*", block),
        "close": matches(r"\*\*4\. Cierra\*\*|\*\*Cierra:\*\*", block),
        "duration": bool(re.search(r"·\s*(?:[5-9]|1[0-5])\s*min", block, re.IGNORECASE)),
    }


def build() -> dict:
    tracks: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        text = path.read_text(encoding="utf-8")
        topic_matches = list(TOPIC.finditer(text))
        for index, match in enumerate(topic_matches):
            end = topic_matches[index + 1].start() if index + 1 < len(topic_matches) else len(text)
            block = text[match.start():end]
            children = list(SUBTOPIC.finditer(block))
            subtopics = []
            for child_index, child in enumerate(children):
                child_end = children[child_index + 1].start() if child_index + 1 < len(children) else len(block)
                subtopic_block = block[child.start():child_end]
                criteria = evaluate(subtopic_block)
                subtopics.append({
                    "id": child.group(1),
                    "title": child.group(0),
                    "criteria": criteria,
                    "complete": all(criteria.values()),
                })
            complete = 3 <= len(subtopics) <= 6 and all(item["complete"] for item in subtopics)
            tracks[path.parent.name].append({
                "module": int(re.search(r"\d+", path.stem).group()),
                "topic": match.group(0),
                "subtopicCount": len(subtopics),
                "subtopics": subtopics,
                "complete": complete,
            })
    summary = {}
    for track, topics in sorted(tracks.items()):
        complete = sum(topic["complete"] for topic in topics)
        summary[track] = {
            "topics": len(topics),
            "completeTopics": complete,
            "topicsWith3to6Subtopics": sum(3 <= topic["subtopicCount"] <= 6 for topic in topics),
            "subtopics": sum(topic["subtopicCount"] for topic in topics),
            "completeSubtopics": sum(item["complete"] for topic in topics for item in topic["subtopics"]),
        }
    return {"summary": summary, "topics": tracks}


def render(data: dict) -> str:
    total = sum(row["topics"] for row in data["summary"].values())
    complete = sum(row["completeTopics"] for row in data["summary"].values())
    lines = [
        "# Auditoría de subtemas atómicos",
        "",
        "> Auditoría estructural. Un encabezado o criterio detectado no demuestra que el ejemplo se haya ejecutado ni que la explicación sea pedagógicamente suficiente.",
        "",
        f"Temas conformes a cuatro pasos: **{complete}/{total}**. Tracks inventariados: **{len(data['summary'])}**.",
        "",
        "| Track | Temas conformes | Temas inventariados | Subtemas detectados | Subtemas con estructura completa |",
        "|---|---:|---:|---:|---:|",
    ]
    for track, row in data["summary"].items():
        lines.append(
            f"| {track} | {row['completeTopics']} | {row['topics']} | {row['subtopics']} | {row['completeSubtopics']} |"
        )
    lines.extend(["", "## Temas pendientes", ""])
    for track, topics in data["topics"].items():
        pending = [topic for topic in topics if not topic["complete"]]
        if not pending:
            continue
        lines.append(f"### {track}")
        lines.append("")
        for topic in pending:
            missing = []
            if not 3 <= topic["subtopicCount"] <= 6:
                missing.append(f"tiene {topic['subtopicCount']} subtemas")
            for child in topic["subtopics"]:
                absent = [name for name, passed in child["criteria"].items() if not passed]
                if absent:
                    missing.append(f"{child['id']}: faltan {', '.join(absent)}")
            lines.append(f"- M{topic['module']} {topic['topic']}: " + ("; ".join(missing) or "revisión pendiente"))
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = render(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text:
            raise SystemExit("La auditoría de subtemas atómicos está desactualizada")
        if not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("El resumen de subtemas atómicos está desactualizado")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8")
        MD_REPORT.write_text(md_text, encoding="utf-8")
    total = sum(row["topics"] for row in data["summary"].values())
    complete = sum(row["completeTopics"] for row in data["summary"].values())
    if total < 1 or len(data["summary"]) != 14:
        raise SystemExit(f"Inventario inválido: {total} temas en {len(data['summary'])} tracks")
    print(f"Estructura atómica auditada: {complete}/{total} temas completos en {len(data['summary'])} tracks")
    if args.require_complete and complete != total:
        raise SystemExit(f"Migración incompleta: {complete}/{total} temas")


if __name__ == "__main__":
    main()
