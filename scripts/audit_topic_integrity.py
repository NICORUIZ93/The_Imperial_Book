#!/usr/bin/env python3
"""Mide la integridad del temario (specs/006): temas fantasma y huecos.

Uso:
  python3 scripts/audit_topic_integrity.py                 # reporte de todos los criterios
  python3 scripts/audit_topic_integrity.py --criterion I4  # sale con 0 solo si I4 se cumple
  python3 scripts/audit_topic_integrity.py --write         # además escribe docs/topic-integrity.{md,json}
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
INDEX = CONTENT / "topic-index.json"
CATALOG = CONTENT / "curriculum-catalog.json"
STACKS = CONTENT / "curriculum-stacks"
ATLAS = ROOT / "docs" / "official-topic-atlas.json"
COVERAGE = ROOT / "docs" / "official-topic-coverage.json"
TOPIC = re.compile(r"^### Tema (\d+):\s*(.+)$", re.M)
META = re.compile(r"\s+·\s+(?:Básico|Intermedio|Avanzado|Experto|Integración|Fundamentos)\s+·.*$", re.I)


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def modules(track: str):
    for path in sorted((CONTENT / track).glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1])):
        yield int(path.stem.split("-")[1]), path.read_text(encoding="utf-8")


def masked(text: str) -> str:
    """Oculta el contenido de los bloques de código conservando posiciones."""
    return re.sub(r"^```[^\n]*\n[\s\S]*?^```[ \t]*$", lambda m: re.sub(r"[^\n]", " ", m.group()), text, flags=re.M)


def topic_bodies(text: str):
    mask = masked(text)
    matches = list(TOPIC.finditer(mask))
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[match.end():end]
        h2 = re.search(r"^## ", mask[match.end():end], re.M)
        title = text[match.start():match.end()].split(":", 1)[1]
        yield int(match.group(1)), META.sub("", title).strip(), body[: h2.start()] if h2 else body


def tracks(index):
    return sorted(index)


def check_i1(index) -> list[str]:
    problems = []
    catalog = load(CATALOG)
    fragments = {(t, str(m)): {x["fragment"] for x in ts} for t, mods in index.items() for m, ts in mods.items()}
    for stack in catalog["stacks"]:
        if not stack["currentTopicCount"]:
            problems.append(f"área sin ruta real publicada: {stack['id']}")
        data = load(ROOT / "web" / "public" / stack["asset"])
        for module in data["modules"]:
            for topic in module["topics"]:
                cur = topic.get("current")
                if not cur:
                    problems.append(f"{stack['id']}: entrada sin lección «{topic['title'][:60]}»")
                elif cur["fragment"] not in fragments.get((stack["id"], str(cur["module"])), set()):
                    problems.append(f"{stack['id']}/{cur['module']}: fragmento inexistente {cur['fragment']}")
    return problems


def check_i2(index) -> list[str]:
    problems = []
    stack_counts = {}
    for path in STACKS.glob("*.json"):
        data = load(path)
        stack_counts[data["stackId"]] = Counter(
            str(t["current"]["module"]) for m in data["modules"] for t in m["topics"] if t.get("current"))
    for track in tracks(index):
        for number, text in modules(track):
            nums = [n for n, _, _ in topic_bodies(text)]
            if not nums:
                problems.append(f"{track}/{number}: módulo sin temas")
            elif nums != list(range(1, len(nums) + 1)):
                problems.append(f"{track}/{number}: numeración {nums}")
            in_index = len(index[track].get(str(number), []))
            if in_index != len(nums):
                problems.append(f"{track}/{number}: índice {in_index} ≠ Markdown {len(nums)}")
            in_stack = stack_counts.get(track, Counter()).get(str(number), 0)
            if in_stack != len(nums):
                problems.append(f"{track}/{number}: temario {in_stack} ≠ Markdown {len(nums)}")
    return problems


def norm(title: str) -> str:
    return re.sub(r"\s+", " ", title.lower()).strip(" .")


def check_i3(index) -> list[str]:
    problems = []
    for track in tracks(index):
        seen = Counter(norm(t["title"]) for ts in index[track].values() for t in ts)
        problems += [f"{track}: título repetido «{k}» ×{v}" for k, v in seen.items() if v > 1]
    return problems


def check_i4(index) -> list[str]:
    problems = []
    for track in tracks(index):
        for number, text in modules(track):
            for n, title, body in topic_bodies(text):
                if "#### Paso 7" not in body:
                    continue
                tail = body.split("#### Paso 7", 1)[1]
                tail = tail.split("\n", 1)[1] if "\n" in tail else ""
                if re.search(r"^(\*\*¿Por qué es importante\?\*\*|\*\*Conceptos clave:\*\*|#### )", tail, re.M):
                    problems.append(f"{track}/{number} Tema {n}: contenido después del Paso 7 · {title[:50]}")
    return problems


def check_i5(index) -> list[str]:
    problems = []
    uses = []
    for track in tracks(index):
        for number, text in modules(track):
            if "xcodebuild -scheme RutaFlowApp" in text:
                uses.append(f"{track}/{number}")
    if uses:
        ios0 = (CONTENT / "ios" / "modulo-0.md").read_text(encoding="utf-8")
        if not re.search(r"^## Crea el proyecto base RutaFlowApp", ios0, re.M):
            problems.append(f"{len(uses)} capítulos usan el esquema RutaFlowApp y ios/0 no enseña a crearlo")
    return problems


def check_i6(index) -> list[str]:
    problems = []
    atlas = {t["id"]: [x.strip() for v in t["areas"].values() for x in v.split(";") if x.strip()]
             for t in load(ATLAS)["tracks"]}
    coverage = load(COVERAGE)["tracks"] if COVERAGE.exists() else {}
    for track, official in atlas.items():
        decided = coverage.get(track, {})
        for item in official:
            entry = decided.get(item)
            if entry is None:
                problems.append(f"{track}: sin decisión «{item}»")
                continue
            if entry == "hueco":
                problems.append(f"{track}: hueco «{item}»")
                continue
            for ref in entry:
                m, frag = ref.split("#")
                if frag not in {x["fragment"] for x in index[track].get(m, [])}:
                    problems.append(f"{track}: «{item}» apunta a {ref}, que no existe")
        extra = set(decided) - set(official)
        problems += [f"{track}: decisión para un tema que no está en el atlas «{x}»" for x in sorted(extra)]
    return problems


CHECKS = {"I1": check_i1, "I2": check_i2, "I3": check_i3, "I4": check_i4, "I5": check_i5, "I6": check_i6}
LABELS = {"I1": "temario sin fantasmas", "I2": "índice = Markdown = temario", "I3": "sin títulos repetidos",
          "I4": "nada después del cierre", "I5": "comandos con proyecto creado", "I6": "atlas oficial sin huecos"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--criterion", choices=sorted(CHECKS))
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--limit", type=int, default=15)
    args = parser.parse_args()
    index = load(INDEX)
    selected = [args.criterion] if args.criterion else sorted(CHECKS)
    results = {c: CHECKS[c](index) for c in selected}
    for c, problems in results.items():
        print(f"{c} {LABELS[c]}: {'ok' if not problems else f'{len(problems)} problema(s)'}")
        for p in problems[: args.limit]:
            print(f"  - {p}")
    if args.write and not args.criterion:
        summary = {c: len(p) for c, p in results.items()}
        (ROOT / "docs" / "topic-integrity.json").write_text(
            json.dumps({"spec": "specs/006", "summary": summary, "problems": results}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8")
        lines = ["# Integridad del temario (specs/006)", "",
                 "> Generado por `scripts/audit_topic_integrity.py --write`. Medición estructural.", "",
                 "| Criterio | Qué mide | Problemas |", "|---|---|---:|"]
        lines += [f"| {c} | {LABELS[c]} | {len(p)} |" for c, p in results.items()]
        (ROOT / "docs" / "topic-integrity.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    sys.exit(1 if any(results.values()) else 0)


if __name__ == "__main__":
    main()
