#!/usr/bin/env python3
"""Valida el formato Aprende/Practica/Aplica solo en los módulos ya migrados.

La migración es incremental: los módulos no listados en
``docs/migration-status.json`` conservan el formato de siete pasos y los valida
el auditor existente. Este script impide que un módulo marcado como migrado
pierda temas, secciones, nivel, duración o checklist de salida.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
STATUS = ROOT / "docs/migration-status.json"

TOPIC = re.compile(r"^###\s+(Tema\b.+)$", re.MULTILINE | re.IGNORECASE)
TITLE = re.compile(
    r"^###\s+Tema\s+\d+:\s+.+?\s+·\s+(Básico|Intermedio|Avanzado|Experto)\s+·\s+"
    r"\d+(?:[–-]\d+)?\s*(?:min|h(?:\s+\d+\s*min)?)\s*$",
    re.IGNORECASE,
)


def topics_in(text: str) -> list[tuple[str, str]]:
    """Devuelve (encabezado, bloque) por cada tema, sin cortar en bloques de código."""
    structure = re.sub(
        r"^```[^\n]*\n[\s\S]*?^```[ \t]*$",
        lambda match: re.sub(r"[^\n]", " ", match.group()),
        text,
        flags=re.MULTILINE,
    )
    headings = list(re.finditer(r"^###\s+Tema\b.+$", structure, re.MULTILINE | re.IGNORECASE))
    result = []
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        result.append((heading.group(0), text[heading.start():end]))
    return result


def section(block: str, name: str) -> str | None:
    match = re.search(rf"^####\s+{name}\s*$", block, re.MULTILINE | re.IGNORECASE)
    if not match:
        return None
    rest = block[match.end():]
    end = re.search(r"^####\s+|^###\s+", rest, re.MULTILINE)
    return rest[:end.start()] if end else rest


def validate_topic(heading: str, block: str, spec: dict) -> list[str]:
    errors = []
    if not TITLE.match(heading):
        errors.append("encabezado sin 'Tema N: … · Nivel · Duración'")
    for name in spec["requiredSections"]:
        if section(block, name) is None:
            errors.append(f"falta '#### {name}'")
    if re.search(r"^####\s+Paso\b", block, re.MULTILINE):
        errors.append("conserva '#### Paso' residual")
    apply_text = section(block, "Aplica")
    if apply_text is not None:
        if "checklist de salida" not in apply_text.lower():
            errors.append("Aplica sin 'Checklist de salida'")
        items = len(re.findall(r"^\s*[-*]\s+\S", apply_text, re.MULTILINE))
        if items < spec["checklistMinItems"]:
            errors.append(
                f"Checklist de salida con {items} ítems; mínimo {spec['checklistMinItems']}"
            )
    return errors


def main() -> None:
    if not STATUS.exists():
        raise SystemExit(f"Falta {STATUS.relative_to(ROOT)}")
    data = json.loads(STATUS.read_text(encoding="utf-8"))
    if data.get("schemaVersion") != 1:
        raise SystemExit("migration-status.json: schemaVersion debe ser 1")
    spec = data["format"]
    if spec.get("requiredSections") != ["Aprende", "Practica", "Aplica"]:
        raise SystemExit("migration-status.json: requiredSections debe ser Aprende/Practica/Aplica")
    if spec.get("checklistMinItems", 0) < 4:
        raise SystemExit("migration-status.json: checklistMinItems debe ser al menos 4")

    errors: list[str] = []
    migrated = 0
    legacy = 0
    for track, entry in data["tracks"].items():
        directory = CONTENT / track
        files = sorted(directory.glob("modulo-*.md")) if directory.exists() else []
        modules = {
            int(re.search(r"modulo-(\d+)", path.name).group(1)): path
            for path in files
        }
        total_topics = 0
        for path in files:
            text = path.read_text(encoding="utf-8")
            total_topics += len(topics_in(text))
        if len(modules) < entry["originalModules"]:
            errors.append(
                f"{track}: {len(modules)} módulos; el registro declara {entry['originalModules']}"
            )
        migrated_ids = entry.get("migratedModules", [])
        if not isinstance(migrated_ids, list) or len(set(migrated_ids)) != len(migrated_ids):
            errors.append(f"{track}: migratedModules debe ser una lista sin duplicados")
            continue
        if total_topics < entry["originalTopics"]:
            errors.append(
                f"{track}: {total_topics} temas; se perdieron temas frente a {entry['originalTopics']}"
            )
        if not migrated_ids:
            legacy += len(modules)
            if total_topics != entry["originalTopics"]:
                errors.append(
                    f"{track}: track sin migrar con {total_topics} temas; el registro declara {entry['originalTopics']}"
                )
            continue
        migrated += len(migrated_ids)
        legacy += len(modules) - len(migrated_ids)
        for module_id in migrated_ids:
            path = modules.get(module_id)
            if path is None:
                errors.append(f"{track}: módulo migrado {module_id} sin archivo modulo-{module_id}.md")
                continue
            text = path.read_text(encoding="utf-8")
            topics = topics_in(text)
            if not topics:
                errors.append(f"{track}/modulo-{module_id}: módulo migrado sin temas")
            for heading, block in topics:
                for message in validate_topic(heading, block, spec):
                    errors.append(f"{track}/modulo-{module_id}: {message} ({heading})")

    if errors:
        print("Migración editorial con errores:", file=sys.stderr)
        for message in errors:
            print(f"- {message}", file=sys.stderr)
        raise SystemExit(1)

    print(
        "Migración editorial OK: "
        f"{migrated} módulos en formato Aprende/Practica/Aplica, "
        f"{legacy} aún en siete pasos, sin pérdida de temas."
    )


if __name__ == "__main__":
    main()
