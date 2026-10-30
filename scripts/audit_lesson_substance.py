#!/usr/bin/env python3
"""Mide la sustancia real de cada tema: repetición, cola editorial y andamiaje.

La auditoría de siete pasos comprueba que los marcadores aparezcan. Esta
comprueba lo contrario: que el texto no esté inflado para aparentar cobertura.
No mide aprendizaje ni calidad de la explicación; mide defectos verificables:

- ``bloque-repetido``: una sección editorial aparece dos veces en el mismo tema.
- ``cola-tras-cierre``: más de 500 palabras después del encabezado del Paso 7
  (señal de texto pegado de otra generación, no de un cierre).
- ``andamiaje-generico``: frases plantilla que prometen independencia sin
  demostrarla ("este tema se puede reproducir en una carpeta vacía").
- ``parrafo-repetido``: el mismo párrafo dos veces dentro del tema.
- ``sin-fuente``: ninguna URL en el tema.
- ``tema-breve``: menos de 450 palabras.

El modo ``--strict`` usa ``docs/lesson-substance-baseline.json``: las deudas
históricas quedan registradas y cualquier tema nuevo (o cualquier defecto nuevo
en un tema existente) hace fallar la validación. Así se impide que la deuda
crezca sin obligar a reescribir 1.000 temas de golpe.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

from audit_topic_learning_quality import student_visible_content, topic_blocks

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_REPORT = ROOT / "docs/lesson-substance.json"
MD_REPORT = ROOT / "docs/lesson-substance.md"
BASELINE = ROOT / "docs/lesson-substance-baseline.json"

# Secciones que deben aparecer una sola vez por tema. Dos apariciones indican
# que se pegó una generación anterior en vez de reescribir el bloque.
UNIQUE_SECTIONS = (
    "**¿Por qué es importante?**",
    "**Analogía:**",
    "**Conceptos clave:**",
    "**Fuentes oficiales:**",
    "**Errores comunes:**",
    "**Evidencia de aprendizaje:**",
    "**Límites y decisión de uso:**",
)

# Plantillas que simulan cumplir un criterio sin demostrarlo.
GENERIC_SCAFFOLD = (
    "Ejemplo independiente (desde cero):** este tema también se puede reproducir",
    "este tema se puede reproducir en una **carpeta vacía**",
    "se incorpora de forma explícita porque no aparecía",
    "amplía el mapa mental y permite comprender decisiones",
)

MAX_TAIL_WORDS = 500
MIN_WORDS = 450

# Apéndices de módulo que se acumularon en generaciones anteriores.
LEGACY_MODULE_SECTIONS = (
    "## Ruta de proyecto progresivo desde carpeta vacía",
    "## Construcción guiada del capítulo",
    "**Errores comunes y soluciones**",
)

def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def paragraphs(block: str) -> list[str]:
    """Párrafos de prosa, sin fences, tablas ni encabezados."""
    result = []
    for raw in re.split(r"\n\s*\n", block):
        candidate = norm(raw)
        if len(candidate) < 160:
            continue
        if candidate.startswith(("```", "|", "#", "-", "*", ">")):
            continue
        result.append(candidate)
    return result


def count_words(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def evaluate_topic(block: str) -> dict:
    codes: set[str] = set()
    for marker in UNIQUE_SECTIONS:
        if block.count(marker) > 1:
            codes.add("bloque-repetido")
    for generic in GENERIC_SCAFFOLD:
        if generic in block:
            codes.add("andamiaje-generico")

    closure = re.search(r"^####\s+Paso 7[^\n]*$", block, re.MULTILINE)
    tail_words = 0
    if closure:
        tail_words = count_words(block[closure.end():])
        if tail_words > MAX_TAIL_WORDS:
            codes.add("cola-tras-cierre")

    seen: Counter[str] = Counter(paragraphs(block))
    if any(count > 1 for count in seen.values()):
        codes.add("parrafo-repetido")

    if "http://" not in block and "https://" not in block:
        codes.add("sin-fuente")

    words = count_words(block)
    if words < MIN_WORDS:
        codes.add("tema-breve")

    return {
        "words": words,
        "tailWords": tail_words,
        "issues": sorted(codes),
    }


def module_level_sections(text: str) -> list[str]:
    """Apéndices heredados que viven después del último tema del módulo."""
    headings = list(re.finditer(r"^###\s+Tema\b.*$", text, re.MULTILINE))
    start = headings[-1].start() if headings else 0
    tail = text[start:]
    return [section for section in LEGACY_MODULE_SECTIONS if section in tail]


def topic_key(track: str, module: int, title: str) -> str:
    return f"{track}/{module}/{title}"


def build() -> dict:
    topics: dict[str, list[dict]] = defaultdict(list)
    modules: list[dict] = []
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        track = path.parent.name
        module = int(re.search(r"\d+", path.stem).group())
        visible = student_visible_content(path.read_text(encoding="utf-8"))
        for title, block in topic_blocks(visible):
            result = evaluate_topic(block)
            topics[track].append({
                "module": module,
                "topic": title,
                "words": result["words"],
                "tailWords": result["tailWords"],
                "issues": result["issues"],
            })
        legacy = module_level_sections(visible)
        modules.append({
            "track": track,
            "module": module,
            "legacySections": legacy,
        })

    issue_counts: Counter[str] = Counter()
    total = 0
    with_issues = 0
    for entries in topics.values():
        for entry in entries:
            total += 1
            issue_counts.update(entry["issues"])
            if entry["issues"]:
                with_issues += 1

    summary = {
        "topics": total,
        "topicsWithIssues": with_issues,
        "issues": dict(sorted(issue_counts.items())),
        "modules": len(modules),
        "modulesWithLegacySections": sum(1 for m in modules if m["legacySections"]),
        "legacySections": dict(sorted(Counter(
            section for m in modules for section in m["legacySections"]
        ).items())),
    }

    fingerprint = hashlib.sha256(
        json.dumps({"topics": topics}, ensure_ascii=False, sort_keys=True).encode()
    ).hexdigest()
    summary["fingerprint"] = fingerprint
    return {"summary": summary, "topics": topics, "modules": modules}


def render_markdown(data: dict) -> str:
    summary = data["summary"]
    lines = [
        "# Sustancia de las lecciones",
        "",
        "Detección de defectos verificables: repetición, cola de texto pegada y",
        "andamiaje genérico. **No mide aprendizaje ni calidad**; una lección sin",
        "defectos detectados tampoco acredita haber sido comprendida.",
        "",
        "| Métrica | Valor |",
        "|---|---:|",
        f"| Temas analizados | {summary['topics']} |",
        f"| Temas con algún defecto | {summary['topicsWithIssues']} |",
        f"| Módulos con apéndices heredados | {summary['modulesWithLegacySections']}/{summary['modules']} |",
        "",
        "## Defectos por tipo",
        "",
        "| Código | Temas |",
        "|---|---:|",
    ]
    for code, count in summary["issues"].items():
        lines.append(f"| `{code}` | {count} |")
    lines += [
        "",
        "## Apéndices heredados más frecuentes",
        "",
        "| Sección | Módulos |",
        "|---|---:|",
    ]
    for section, count in summary["legacySections"].items():
        lines.append(f"| {section} | {count} |")
    lines += [
        "",
        "## Temas con más defectos",
        "",
        "| Track / módulo | Tema | Palabras | Cola tras cierre | Códigos |",
        "|---|---|---:|---:|---|",
    ]
    rows = []
    for track, entries in data["topics"].items():
        for entry in entries:
            if entry["issues"]:
                rows.append((len(entry["issues"]), track, entry))
    rows.sort(key=lambda row: (-row[0], -row[2]["tailWords"]))
    for _, track, entry in rows[:40]:
        lines.append(
            f"| {track} / {entry['module']} | {entry['topic']} | {entry['words']} | "
            f"{entry['tailWords']} | {', '.join(entry['issues'])} |"
        )
    lines += [
        "",
        "## Cómo se corrige",
        "",
        "1. Se reescribe el bloque dentro del tema; no se añade texto al final.",
        "2. Se elimina la segunda aparición de una sección, no se renombra.",
        "3. Se borra el apéndice de módulo o se integra en el tema que lo necesita.",
        "4. `--strict` compara contra `docs/lesson-substance-baseline.json`: ningún",
        "   tema nuevo puede nacer con estos defectos.",
        "",
        f"Huella del contenido: `{summary['fingerprint']}`",
        "",
    ]
    return "\n".join(lines)


def baseline_from(data: dict) -> dict:
    allowed = {}
    for track, entries in data["topics"].items():
        for entry in entries:
            if entry["issues"]:
                allowed[topic_key(track, entry["module"], entry["topic"])] = entry["issues"]
    return {
        "description": (
            "Deuda histórica aceptada por scripts/audit_lesson_substance.py "
            "--strict. Cada entrada debe reducirse, nunca ampliarse."
        ),
        "allowed": allowed,
    }


def check_strict(data: dict) -> list[str]:
    if not BASELINE.exists():
        return [f"Falta {BASELINE.relative_to(ROOT)}; ejecuta --update-baseline una vez."]
    allowed = json.loads(BASELINE.read_text(encoding="utf-8")).get("allowed", {})
    errors: list[str] = []
    for track, entries in data["topics"].items():
        for entry in entries:
            if not entry["issues"]:
                continue
            key = topic_key(track, entry["module"], entry["topic"])
            previous = set(allowed.get(key, []))
            current = set(entry["issues"])
            if not previous:
                errors.append(f"{key}: tema nuevo con defectos {sorted(current)}")
                continue
            new_codes = current - previous
            if new_codes:
                errors.append(f"{key}: defectos nuevos {sorted(new_codes)}")
    for key in allowed:
        track, module, _ = key.split("/", 2)
        if track not in data["topics"]:
            errors.append(f"{key}: el track ya no existe en el baseline")
        elif not any(str(entry["module"]) == module for entry in data["topics"][track]):
            errors.append(f"{key}: el módulo ya no existe en el baseline")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Falla si el reporte está desactualizado.")
    parser.add_argument("--strict", action="store_true", help="Falla si aparece un defecto no registrado en el baseline.")
    parser.add_argument("--update-baseline", action="store_true", help="Registra la deuda actual como aceptada.")
    args = parser.parse_args()

    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    md_text = render_markdown(data)

    if args.update_baseline:
        BASELINE.write_text(
            json.dumps(baseline_from(data), ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        print(f"Baseline actualizado: {len(json.loads(BASELINE.read_text(encoding='utf-8'))['allowed'])} temas con deuda aceptada")

    if args.check:
        stale = []
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text:
            stale.append(JSON_REPORT.name)
        if not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            stale.append(MD_REPORT.name)
        if stale:
            raise SystemExit(
                "Reporte de sustancia desactualizado: " + ", ".join(stale)
                + ". Ejecuta: python3 scripts/audit_lesson_substance.py"
            )
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8")
        MD_REPORT.write_text(md_text, encoding="utf-8")

    if args.strict:
        errors = check_strict(data)
        if errors:
            print("Sustancia FALLÓ:", file=sys.stderr)
            for error in errors:
                print(f"- {error}", file=sys.stderr)
            raise SystemExit(1)

    summary = data["summary"]
    print(
        f"Sustancia auditada: {summary['topics']} temas, "
        f"{summary['topicsWithIssues']} con defectos, "
        f"{summary['modulesWithLegacySections']}/{summary['modules']} módulos con apéndices heredados"
    )


if __name__ == "__main__":
    main()
