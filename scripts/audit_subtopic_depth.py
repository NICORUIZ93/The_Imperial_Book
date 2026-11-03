#!/usr/bin/env python3
"""Inventaría la revisión humana de profundidad por subtema.

Las señales heurísticas priorizan revisión; no acreditan profundidad. El cierre de
un tema vive en docs/subtopic-depth-reviewed.json y exige un mapa humano explícito.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from audit_topic_learning_quality import student_visible_content, topic_blocks

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
REGISTRY = ROOT / "docs" / "subtopic-depth-reviewed.json"
OUT_JSON = ROOT / "docs" / "subtopic-depth-review.json"
OUT_MD = ROOT / "docs" / "subtopic-depth-review.md"

GENERIC_HEADINGS = {
    "aprende", "practica", "práctica", "aplica", "cierre", "contexto",
    "teoria", "teoría", "demostracion", "demostración", "proyecto",
    "checklist", "errores comunes", "fuentes", "recursos",
}


def semantic_headings(block: str) -> list[str]:
    result = []
    for raw in re.findall(r"^####+\s+(.+)$", block, re.MULTILINE):
        title = re.sub(r"^paso\s+\d+\s*[·:.-]*\s*", "", raw, flags=re.I).strip()
        normalized = re.sub(r"[^a-záéíóúüñ]+", " ", title.lower()).strip()
        if normalized and not any(normalized == generic or normalized.startswith(generic + " ") for generic in GENERIC_HEADINGS):
            result.append(title)
    return result


def broad_title(title: str) -> bool:
    clean = re.sub(r"^Tema(?:[^:]*)?:\s*", "", title, flags=re.I)
    clean = re.sub(r"·.*$", "", clean)
    return bool(re.search(r"\b(y|vs\.?|frente a|con|,|/)\b", clean, re.I)) or clean.count(":") > 0


def build() -> dict:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    reviews = registry.get("reviews", {})
    topics = []
    by_track = Counter()
    reviewed_by_track = Counter()

    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        track = path.parent.name
        module = int(re.search(r"\d+", path.stem).group())
        text = student_visible_content(path.read_text(encoding="utf-8"))
        for title, block in topic_blocks(text):
            key = f"{track}/modulo-{module}::{title}"
            review = reviews.get(key)
            headings = semantic_headings(block)
            reasons = []
            is_broad = broad_title(title)
            if is_broad:
                reasons.append("título agrupa varios conceptos")
            if is_broad and len(headings) < 2:
                reasons.append("menos de dos encabezados semánticos internos")
            if len(re.findall(r"\*\*Conceptos clave", block, re.I)) and len(headings) < 2:
                reasons.append("lista conceptos clave sin mapa interno verificable")
            status = review.get("status", "pending") if review else "pending"
            by_track[track] += 1
            if status == "reviewed":
                reviewed_by_track[track] += 1
            topics.append({
                "id": key,
                "track": track,
                "module": module,
                "topic": title,
                "status": status,
                "semanticHeadings": headings,
                "prioritySignals": reasons,
                "review": review,
            })

    current_ids = {topic["id"] for topic in topics}
    stale = sorted(set(reviews) - current_ids)
    summary = {
        "topics": len(topics),
        "reviewed": sum(topic["status"] == "reviewed" for topic in topics),
        "pending": sum(topic["status"] != "reviewed" for topic in topics),
        "priorityCandidates": sum(bool(topic["prioritySignals"]) and topic["status"] != "reviewed" for topic in topics),
        "byTrack": {
            track: {"topics": by_track[track], "reviewed": reviewed_by_track[track], "pending": by_track[track] - reviewed_by_track[track]}
            for track in sorted(by_track)
        },
        "staleRegistryEntries": stale,
        "interpretation": "Las señales priorizan inspección. Sólo el registro humano marca profundidad revisada.",
    }
    return {"summary": summary, "topics": topics}


def render(data: dict) -> str:
    summary = data["summary"]
    lines = [
        "# Revisión de profundidad de subtemas", "",
        "> Las señales automáticas no prueban profundidad ni ausencia de ella. Un tema sólo queda revisado mediante el registro humano con mapa de subtemas críticos, evidencia y fuentes.", "",
        f"- Temas inventariados: {summary['topics']}",
        f"- Revisados humanamente para subtemas: {summary['reviewed']}",
        f"- Pendientes: {summary['pending']}",
        f"- Candidatos prioritarios por señales: {summary['priorityCandidates']}", "",
        "## Cobertura por track", "",
        "| Track | Temas | Revisados | Pendientes |", "|---|---:|---:|---:|",
    ]
    for track, row in summary["byTrack"].items():
        lines.append(f"| {track} | {row['topics']} | {row['reviewed']} | {row['pending']} |")
    lines.extend(["", "## Cola prioritaria", ""])
    for topic in data["topics"]:
        if topic["status"] == "reviewed" or not topic["prioritySignals"]:
            continue
        reasons = "; ".join(topic["prioritySignals"])
        lines.append(f"- `{topic['track']}/modulo-{topic['module']}` — {topic['topic']} — {reasons}")
    lines.extend(["", "## Revisados", ""])
    for topic in data["topics"]:
        if topic["status"] != "reviewed":
            continue
        subtopics = "; ".join(topic["review"].get("criticalSubtopics", []))
        lines.append(f"- `{topic['track']}/modulo-{topic['module']}` — {topic['topic']} — {subtopics}")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument(
        "--max-pending",
        type=int,
        help="Falla si la deuda humana supera este trinquete anti-regresión.",
    )
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = render(data)
    if args.check:
        if not OUT_JSON.exists() or OUT_JSON.read_text(encoding="utf-8") != json_text:
            raise SystemExit("La revisión de subtemas está desactualizada")
        if not OUT_MD.exists() or OUT_MD.read_text(encoding="utf-8") != md_text:
            raise SystemExit("El informe de subtemas está desactualizado")
    else:
        OUT_JSON.write_text(json_text, encoding="utf-8")
        OUT_MD.write_text(md_text, encoding="utf-8")
    if data["summary"]["staleRegistryEntries"]:
        raise SystemExit("El registro de subtemas contiene identificadores obsoletos")
    if args.max_pending is not None and data["summary"]["pending"] > args.max_pending:
        raise SystemExit(
            "Regresión de profundidad: "
            f"{data['summary']['pending']} pendientes superan el máximo "
            f"permitido de {args.max_pending}. Todo tema nuevo debe entrar revisado."
        )
    print(json.dumps(data["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
