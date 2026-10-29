#!/usr/bin/env python3
"""Construye el grafo auditable de progresión entre temas editoriales."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_OUT = ROOT / "docs/prerequisite-graph.json"
MD_OUT = ROOT / "docs/prerequisite-graph.md"

TRACK_ORDER = [
    "foundations", "javascript", "java", "node", "spring-boot", "angular",
    "react", "kotlin-multiplatform", "android", "ios", "flutter", "devops",
    "cloud", "rutaflow",
]

CROSS_TRACK = {
    "node": "javascript",
    "spring-boot": "java",
    "angular": "javascript",
    "react": "javascript",
    "android": "java",
    "kotlin-multiplatform": "java",
    "devops": "foundations",
    "cloud": "devops",
    "rutaflow": "cloud",
}


def topics_for(track: str) -> list[dict]:
    topics = []
    for path in sorted((CONTENT / track).glob("modulo-*.md"), key=lambda p: int(re.search(r"\d+", p.stem).group())):
        module = int(re.search(r"\d+", path.stem).group())
        text = path.read_text(encoding="utf-8")
        for position, match in enumerate(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*(.+))$", text, re.MULTILINE), 1):
            topics.append({
                "id": f"{track}:{module}:{position}",
                "track": track,
                "module": module,
                "position": position,
                "title": match.group(2).strip(),
                "file": str(path.relative_to(ROOT)),
                "requires": [],
            })
    return topics


def build() -> dict:
    by_track = {track: topics_for(track) for track in TRACK_ORDER}
    for track, topics in by_track.items():
        for index, topic in enumerate(topics):
            if index:
                topic["requires"].append(topics[index - 1]["id"])
            elif track in CROSS_TRACK and by_track[CROSS_TRACK[track]]:
                topic["requires"].append(by_track[CROSS_TRACK[track]][-1]["id"])
    nodes = [topic for track in TRACK_ORDER for topic in by_track[track]]
    return {
        "schemaVersion": 1,
        "policy": "Cada tema depende del anterior en su libro; el primer tema de una especialización depende del libro base declarado. Las dependencias conceptuales finas deben añadirse editorialmente durante la migración.",
        "trackDependencies": CROSS_TRACK,
        "nodes": nodes,
    }


def render(data: dict) -> str:
    counts = {track: 0 for track in TRACK_ORDER}
    for node in data["nodes"]:
        counts[node["track"]] += 1
    lines = [
        "# Grafo de prerrequisitos",
        "",
        "Este inventario representa el orden mínimo verificable. La secuencia automática no sustituye la revisión conceptual tema por tema.",
        "",
        "## Dependencias entre libros",
        "",
        "```mermaid",
        "flowchart LR",
    ]
    for target, source in data["trackDependencies"].items():
        lines.append(f'  {source.replace("-", "_")}["{source}"] --> {target.replace("-", "_")}["{target}"]')
    lines.extend(["```", "", "## Cobertura", "", "| Track | Temas ordenados |", "|---|---:|"])
    lines.extend(f"| {track} | {counts[track]} |" for track in TRACK_ORDER)
    lines.extend(["", f"**Total:** {len(data['nodes'])} temas.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = render(data)
    if len(data["nodes"]) < 893:
        raise SystemExit(f"Grafo incompleto: {len(data['nodes'])}/mínimo 893 temas")
    if args.check:
        if not JSON_OUT.exists() or JSON_OUT.read_text(encoding="utf-8") != json_text:
            raise SystemExit("docs/prerequisite-graph.json está desactualizado")
        if not MD_OUT.exists() or MD_OUT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("docs/prerequisite-graph.md está desactualizado")
    else:
        JSON_OUT.write_text(json_text, encoding="utf-8")
        MD_OUT.write_text(md_text, encoding="utf-8")
    print(f"Grafo de prerrequisitos OK: {len(data['nodes'])} temas en {len(TRACK_ORDER)} tracks")


if __name__ == "__main__":
    main()
