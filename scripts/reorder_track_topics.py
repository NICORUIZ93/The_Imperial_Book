#!/usr/bin/env python3
"""Reordena los `### Tema` de un módulo, los renumera y remapea los registros que indexan por número.

    python3 scripts/reorder_track_topics.py --track node --module 0 --order 1,3,2,4
    python3 scripts/reorder_track_topics.py --track node --module 0 --order 1,3,2,4 --apply

Sin `--apply` solo imprime el antes/después. Con `--apply` reescribe el Markdown y actualiza
`docs/topic-learning-quality.json` (cuya fila guarda el encabezado completo) y
`specs/visual-aids-scope.json` (que indexa por número de tema). Los bloques se mueven íntegros:
el único texto que cambia en el contenido es el prefijo `Tema N:`.

Después hay que regenerar índices: build_web_topic_index.py, build_curriculum_catalog.py,
build_zero_to_master_report.py y audit_track_master_prompt.py.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
QUALITY = ROOT / "docs" / "topic-learning-quality.json"
SCOPE = ROOT / "specs" / "visual-aids-scope.json"
HEADING_LINE = re.compile(r"^### Tema (\d+)([^:\n]*):\s?(.*)$", re.M)
TOPIC_START = re.compile(r"^### Tema \d+", re.M)


def module_path(track: str, module: int) -> Path:
    path = CONTENT / track / f"modulo-{module}.md"
    if not path.exists():
        raise SystemExit(f"no existe {path.relative_to(ROOT)}")
    return path


def heading_text(block: str) -> str:
    """El encabezado del bloque sin las almohadillas, tal como lo guardan los registros."""
    match = HEADING_LINE.search(block)
    if not match:
        raise SystemExit("un bloque de tema perdió su encabezado")
    number, extra, title = match.groups()
    return f"Tema {number}{extra}: {title}"


def split_blocks(text: str) -> tuple[str, list[str], str]:
    """Prefacio, bloques de tema (cada uno empieza en su `### Tema`) y apéndice final."""
    marks = [m.start() for m in TOPIC_START.finditer(text)]
    if not marks:
        raise SystemExit("el módulo no tiene encabezados `### Tema N:`")
    tail = re.compile(r"^## ", re.M).search(text, marks[-1])
    end = tail.start() if tail else len(text)
    bounds = marks + [end]
    blocks = [text[bounds[i] : bounds[i + 1]] for i in range(len(marks))]
    return text[: marks[0]], blocks, text[end:]


def renumber(blocks: list[str]) -> list[str]:
    return [
        HEADING_LINE.sub(lambda m, i=i: f"### Tema {i}{m.group(2)}: {m.group(3)}", block, count=1)
        for i, block in enumerate(blocks, start=1)
    ]


def remap_quality(track: str, module: int, old_to_new: dict[int, int], headings: list[str]) -> None:
    data = json.loads(QUALITY.read_text(encoding="utf-8"))
    rows = data["topics"].get(track, [])
    mine = [row for row in rows if row["module"] == module]
    if len(mine) != len(headings):
        raise SystemExit(
            f"{track}/{module}: el registro tiene {len(mine)} filas y el archivo, {len(headings)} temas"
        )
    by_number = {}
    for row in mine:
        match = re.match(r"^Tema (\d+)", row["topic"])
        if not match:
            raise SystemExit(f"{track}/{module}: fila sin prefijo `Tema N:` -> {row['topic'][:60]}")
        by_number[int(match.group(1))] = row
    for position, text in enumerate(headings, start=1):
        by_number[old_to_new[position]]["topic"] = text
    QUALITY.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def remap_scope(track: str, module: int, old_to_new: dict[int, int]) -> int:
    data = json.loads(SCOPE.read_text(encoding="utf-8"))
    moved = 0
    for entry in data["topics"]:
        if entry["track"] == track and entry["module"] == module:
            new = old_to_new[entry["topic"]]
            moved += new != entry["topic"]
            entry["topic"] = new
    SCOPE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return moved


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--track", required=True)
    parser.add_argument("--module", required=True, type=int)
    parser.add_argument("--order", required=True, help="números actuales, en el nuevo orden, separados por comas")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    wanted = [int(item) for item in args.order.split(",") if item.strip()]
    path = module_path(args.track, args.module)
    pre, blocks, post = split_blocks(path.read_text(encoding="utf-8"))

    if sorted(wanted) != list(range(1, len(blocks) + 1)):
        raise SystemExit(f"--order debe ser una permutación de 1..{len(blocks)}")
    if wanted == list(range(1, len(blocks) + 1)):
        print(f"{args.track}/{args.module}: el orden pedido ya es el actual")
        return 0

    old_to_new = {old: position for position, old in enumerate(wanted, start=1)}
    old_titles = [heading_text(block) for block in blocks]
    renumbered = renumber([blocks[number - 1] for number in wanted])
    new_titles = [heading_text(block) for block in renumbered]

    print(f"{args.track}/modulo-{args.module}: {sum(1 for o, n in old_to_new.items() if o != n)} temas cambian de posición")
    for old in range(1, len(blocks) + 1):
        new = old_to_new[old]
        if new == old:
            continue
        print(f"  T{old} -> T{new}: {old_titles[old - 1].split(': ', 1)[1][:76]}")

    if not args.apply:
        return 0

    path.write_text(pre + "".join(renumbered) + post, encoding="utf-8")
    remap_quality(args.track, args.module, old_to_new, new_titles)
    scope_moved = remap_scope(args.track, args.module, old_to_new)
    print(f"  registros: quality reescrito, scope con {scope_moved} entradas movidas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
