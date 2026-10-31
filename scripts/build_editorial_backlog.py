#!/usr/bin/env python3
"""Genera una deuda editorial accionable sin confundir ayudas de UI con contenido."""

from __future__ import annotations

import argparse
from pathlib import Path

from audit_topic_learning_quality import build

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "editorial-backlog.md"
LABELS = {
    "explanation": "explicación",
    "code": "código",
    "filePath": "ruta",
    "runCommand": "ejecución",
    "expectedResult": "resultado",
    "practice": "modificación",
    "project": "conexión con un proyecto",
    "modelMental": "modelo mental",
    "limitsDecision": "límites",
}


def render() -> str:
    data = build()
    lines = [
        "# Deuda editorial verificable",
        "",
        "Este inventario se genera desde el Markdown real mediante detectores heurísticos de presencia. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial. Un criterio detectado no demuestra que la explicación sea correcta o suficiente ni que el código se haya ejecutado.",
        "",
        "El estado «completo» de este reporte solo significa que aparecen los criterios de esta auditoría; no equivale a completar los siete pasos editoriales. La auditoría independiente de siete pasos evalúa otros 16 marcadores y registra su propio resultado en `seven-step-methodology.md`.",
        "",
        "## Estado global",
        "",
        "| Criterio | Cubierto | Pendiente |",
        "|---|---:|---:|",
    ]
    total = sum(row["topics"] for row in data["summary"].values())
    for key, label in LABELS.items():
        covered = sum(row[key] for row in data["summary"].values())
        lines.append(f"| {label.capitalize()} | {covered} | {total - covered} |")
    practicable = sum(row["practicable"] for row in data["summary"].values())
    lines.append(f"| **Perfil de criterios detectado** | **{practicable}** | **{total - practicable}** |")

    lines.extend([
        "",
        "## Prioridad por track",
        "",
        "| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin proyecto | Sin límites |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ])
    for track, row in data["summary"].items():
        lines.append(
            f"| {track} | {row['topics']} | {row['topics'] - row['code']} | "
            f"{row['topics'] - row['filePath']} | {row['topics'] - row['runCommand']} | "
            f"{row['topics'] - row['expectedResult']} | {row['topics'] - row['practice']} | "
            f"{row['topics'] - row['project']} | {row['topics'] - row['limitsDecision']} |"
        )

    lines.extend(["", "## Pendientes por tema", ""])
    pending = []
    for track, topics in data["topics"].items():
        for topic in topics:
            missing = [label for key, label in LABELS.items() if not topic["criteria"][key]]
            if topic["classification"]["genericScaffold"]:
                missing.append("texto genérico o demostración repetida")
            if missing:
                path = f"../web/public/content/{track}/modulo-{topic['module']}.md"
                pending.append(f"- [{track} · módulo {topic['module']}]({path}) · {topic['topic']}: " + ", ".join(missing) + ".")
    lines.extend(pending or ["No hay criterios pendientes en esta auditoría de presencia editorial."])
    lines.append("")

    lines.extend([
        "## Regla de cierre",
        "",
        "Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas. El resultado de esta comprobación debe complementarse con la auditoría de siete pasos y una revisión humana; los indicadores de presencia no certifican calidad, aprendizaje ni ejecución.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("La deuda editorial está desactualizada")
    else:
        OUTPUT.write_text(content, encoding="utf-8")
        print(f"Deuda editorial actualizada: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
