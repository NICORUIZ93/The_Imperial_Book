#!/usr/bin/env python3
"""Mide cada ruta contra los criterios del prompt maestro v2 (specs/004 y specs/tracks/*.md).

Criterios por ruta (los mismos identificadores que usan las specs de cada ruta):
  T1 niveles     — la ruta tiene módulos en Fundamentos, Aplicación, Integración y Experto.
  T2 master      — la ruta tiene módulo Master registrado en docs/requested-master-topics.json.
  T3 reales      — cada tema del atlas oficial (docs/official-topic-atlas.json) tiene tema o
                   encabezado propio en la ruta; una mención suelta no cuenta como enseñado.
  T4 visual      — todos los temas tienen ayuda visual (docs/topic-learning-quality.json).
  T5 facil       — al menos 90 % de los temas tienen oraciones de 25 palabras o menos en promedio.
  T6 capturas    — todos los temas están en specs/visual-aids-scope.json (capturas y ayudas de código).
  T7 proyecto    — todos los temas transfieren al proyecto integrador.

  --track X --criterion T3   sale con 0 si la ruta cumple el criterio (lo usan las specs)
  (sin opciones)             escribe docs/master-prompt-compliance.{md,json}
  --check                    falla si esos reportes están desactualizados
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
INDEX = CONTENT / "topic-index.json"
QUALITY = ROOT / "docs" / "topic-learning-quality.json"
ATLAS = ROOT / "docs" / "official-topic-atlas.json"
MASTER = ROOT / "docs" / "requested-master-topics.json"
LEVELS_REPORT = ROOT / "docs" / "zero-to-master.json"
SCOPE = ROOT / "specs" / "visual-aids-scope.json"
OUT_JSON = ROOT / "docs" / "master-prompt-compliance.json"
OUT_MD = ROOT / "docs" / "master-prompt-compliance.md"

CRITERIA = {
    "T1": "4 niveles",
    "T2": "módulo Master",
    "T3": "temas reales (atlas oficial)",
    "T4": "ayuda visual",
    "T5": "explicación fácil",
    "T6": "capturas y ayudas de código",
    "T7": "proyecto",
}
EASY_MAX_WORDS = 25
EASY_SHARE = 0.90
MASTER_EXEMPT = {"foundations": "Punto de entrada; MASTER-PROMPT lo exime de capstone.",
                 "rutaflow": "Proyecto transversal; MASTER-PROMPT lo exime de capstone."}


def norm(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def topic_blocks(track: str) -> list[str]:
    """Devuelve el Markdown de cada tema (### Tema N:) de la ruta, sin módulos de cierre."""
    blocks = []
    for path in sorted((CONTENT / track).glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1])):
        lines = path.read_text(encoding="utf-8").splitlines()
        starts = [i for i, line in enumerate(lines) if re.match(r"^### Tema \d+:", line)]
        for n, start in enumerate(starts):
            end = next((i for i in range(start + 1, len(lines)) if re.match(r"^(### Tema \d+:|## )", lines[i])), len(lines))
            blocks.append("\n".join(lines[start:end]))
    return blocks


def mean_sentence_words(block: str) -> float:
    """Promedio de palabras por oración en la prosa del tema (sin código, tablas ni encabezados)."""
    prose, fenced = [], False
    for line in block.splitlines():
        if line.startswith("```"):
            fenced = not fenced
            continue
        if fenced or line.startswith(("#", "|", "![", ">")) or not line.strip():
            continue
        prose.append(re.sub(r"`[^`]*`", "x", line))
    sentences = [s for s in re.split(r"(?<=[.!?:;])\s+", " ".join(prose)) if len(s.split()) >= 3]
    return sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0.0


def measure() -> dict:
    index, quality = load(INDEX), load(QUALITY)["topics"]
    atlas = {t["id"]: t for t in load(ATLAS)["tracks"]}
    master_rows = load(MASTER)["tracks"]
    master = {t["track"] for t in master_rows}
    master_real = {t["track"] for t in master_rows if str(t["module"]) in index.get(t["track"], {})}
    levels = {row["track"]: row for row in load(LEVELS_REPORT)["tracks"]}
    scope = load(SCOPE)["topics"]
    rows = []
    for track in sorted(index):
        total = sum(len(v) for v in index[track].values())
        q = quality.get(track, [])
        blocks = topic_blocks(track)
        easy = sum(1 for b in blocks if 0 < mean_sentence_words(b) <= EASY_MAX_WORDS)
        if track in atlas:
            titles = " | ".join(norm(t["title"]) for mods in index[track].values() for t in mods)
            heads = " | ".join(
                norm(h) for p in (CONTENT / track).glob("modulo-*.md")
                for h in re.findall(r"^#{3,5} (.+)$", p.read_text(encoding="utf-8"), re.M) if not h.startswith("Paso")
            )
            official = [x.strip() for v in atlas[track]["areas"].values() for x in v.split(";") if x.strip()]
            taught = [x for x in official if norm(x) in titles or norm(x) in heads]
            real = {"official": len(official), "taught": len(taught),
                    "missing": [x for x in official if x not in taught]}
        else:
            real = {"official": 0, "taught": 0, "missing": [], "note": "sin atlas oficial registrado"}
        in_scope = sum(1 for e in scope if e["track"] == track and e.get("capture") != "pendiente")
        status = {
            "T1": not levels[track]["missingLevels"],
            "T2": track in master_real,
            "T3": bool(real["official"]) and not real["missing"],
            "T4": sum(1 for t in q if t["criteria"].get("visual")) == total,
            "T5": bool(blocks) and easy / len(blocks) >= EASY_SHARE,
            "T6": in_scope == total,
            "T7": sum(1 for t in q if t["criteria"].get("project")) == total,
        }
        rows.append({
            "track": track,
            "topics": total,
            "status": status,
            "exempt": {"T2": MASTER_EXEMPT[track]} if track in MASTER_EXEMPT else {},
            "detail": {
                "missingLevels": levels[track]["missingLevels"],
                "realTopics": real,
                "masterGhost": track in master and track not in master_real,
                "visual": sum(1 for t in q if t["criteria"].get("visual")),
                "easy": easy, "measuredTopics": len(blocks),
                "captureScope": in_scope,
                "project": sum(1 for t in q if t["criteria"].get("project")),
            },
        })
    return {"criteria": CRITERIA, "tracks": rows}


def markdown(data: dict) -> str:
    lines = [
        "# Cumplimiento del prompt maestro v2 por ruta",
        "",
        "> Generado por `scripts/audit_track_master_prompt.py` (specs/004). Medición estructural: no acredita",
        "> revisión humana. ✅ cumple · ⬜ pendiente · ➖ exento con motivo.",
        "",
        "| Ruta | Temas | " + " | ".join(f"{k} {v}" for k, v in data["criteria"].items()) + " |",
        "|---|---:|" + ":---:|" * len(data["criteria"]),
    ]
    for row in data["tracks"]:
        d = row["detail"]
        cells = {
            "T1": "✅" if row["status"]["T1"] else "⬜ " + ", ".join(d["missingLevels"]),
            "T2": "✅" if row["status"]["T2"] else (
                "➖" if "T2" in row["exempt"] else (
                    "⬜ registrado sin capítulo" if d["masterGhost"] else "⬜")),
            "T3": "✅" if row["status"]["T3"] else (f"⬜ {d['realTopics']['taught']}/{d['realTopics']['official']}" if d["realTopics"]["official"] else "⬜ sin atlas"),
            "T4": "✅" if row["status"]["T4"] else f"⬜ {d['visual']}/{row['topics']}",
            "T5": "✅" if row["status"]["T5"] else f"⬜ {d['easy']}/{d['measuredTopics']}",
            "T6": "✅" if row["status"]["T6"] else f"⬜ {d['captureScope']}/{row['topics']}",
            "T7": "✅" if row["status"]["T7"] else f"⬜ {d['project']}/{row['topics']}",
        }
        lines.append(f"| {row['track']} | {row['topics']} | " + " | ".join(cells[k] for k in data["criteria"]) + " |")
    lines += ["", "## Temas oficiales todavía sin tema propio (T3)", ""]
    for row in data["tracks"]:
        missing = row["detail"]["realTopics"]["missing"]
        if missing:
            lines.append(f"- **{row['track']}** ({len(missing)}): " + "; ".join(missing))
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--track")
    parser.add_argument("--criterion", choices=sorted(CRITERIA))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = measure()
    if args.track:
        row = next((r for r in data["tracks"] if r["track"] == args.track), None)
        if row is None or not args.criterion:
            print("uso: --track <ruta> --criterion T1..T7")
            return 2
        ok = row["status"][args.criterion]
        print(f"{args.track} {args.criterion} ({CRITERIA[args.criterion]}): {'cumple' if ok else 'pendiente'} — {json.dumps(row['detail'], ensure_ascii=False)[:400]}")
        return 0 if ok else 1
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = markdown(data)
    if args.check:
        stale = [p.name for p, t in ((OUT_JSON, json_text), (OUT_MD, md_text)) if not p.is_file() or p.read_text(encoding="utf-8") != t]
        print("audit_track_master_prompt: " + (f"desactualizado {stale}" if stale else "al día"))
        return 1 if stale else 0
    OUT_JSON.write_text(json_text, encoding="utf-8")
    OUT_MD.write_text(md_text, encoding="utf-8")
    print(f"audit_track_master_prompt: {len(data['tracks'])} rutas medidas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
