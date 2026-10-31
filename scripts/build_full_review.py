#!/usr/bin/env python3
"""Resume auditorías existentes sin confundir señales automáticas con revisión humana."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from audit_code_visual_quality import build as build_visual
from audit_course_depth import build as build_depth
from audit_lesson_substance import build as build_substance
from audit_seven_step_methodology import build as build_steps
from audit_topic_learning_quality import build as build_quality

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/full-review.md"
BROWSER_REPORT = ROOT / "docs/browser-course-review.json"
EXECUTION_REPORT = ROOT / "examples/professional-bridges/verification.json"


def total_field(summary: dict, field: str) -> int:
    return sum(row[field] for row in summary.values())


def topic_count(value: int) -> str:
    return f"{value} tema" if value == 1 else f"{value} temas"


def build() -> str:
    quality = build_quality()
    steps = build_steps()
    substance = build_substance()
    visual = build_visual()
    depth = build_depth()
    browser = json.loads(BROWSER_REPORT.read_text(encoding="utf-8"))
    execution = json.loads(EXECUTION_REPORT.read_text(encoding="utf-8"))

    topic_total = depth["totals"]["topics"]
    module_total = depth["totals"]["modules"]
    quality_summary = quality["summary"]
    step_summary = steps["summary"]
    visual_summary = visual["tracks"]
    browser_topic_total = browser.get("topics", 0)
    browser_page_total = browser.get("pages", 0)
    browser_findings = len(browser.get("findings", []))
    browser_page_errors = sum(len(row.get("pageErrors", [])) for row in browser.get("results", []))
    browser_render_errors = sum(len(row.get("errors", [])) for row in browser.get("results", []))
    browser_overflows = sum(bool(row.get("horizontalOverflow")) for row in browser.get("results", []))
    browser_uncovered_topics = max(topic_total - browser_topic_total, 0)

    review_states: dict[str, int] = {}
    for row in depth["topics"]:
        state = row["humanPedagogicalReview"]
        review_states[state] = review_states.get(state, 0) + 1

    execution_states: dict[str, int] = {}
    for row in execution.get("laboratories", []):
        state = row["status"]
        execution_states[state] = execution_states.get(state, 0) + 1
    execution_total = len(execution.get("laboratories", []))

    visual_totals = {
        key: total_field(visual_summary, key)
        for key in (
            "topics",
            "code",
            "commentedCode",
            "mermaid",
            "archifyVisual",
            "asciiVisual",
            "officialSource",
        )
    }
    quality_detected = total_field(quality_summary, "practicable")
    step_complete = total_field(step_summary, "complete")
    substance_summary = substance["summary"]
    findings = substance_summary.get("issues", {})

    lines = [
        "# Revisión integral y trazable",
        "",
        "Este informe agrega los auditores versionados; no reemplaza sus resultados detallados. Cada conteo debe leerse según el alcance de su detector. Una coincidencia textual no demuestra corrección, ejecución, comprensión ni calidad pedagógica.",
        "",
        "## Cobertura y estado por capa",
        "",
        "| Capa | Cobertura y resultado registrado | Límite / pendiente | Evidencia detallada |",
        "|---|---|---|---|",
        f"| Inventario estructural | {depth['totals']['tracks']} tracks, {module_total} módulos y {topic_total} temas en Markdown. | La paridad de archivos y metadatos no evalúa el aprendizaje. | [Curso por tema](./course-depth-review.md) |",
        f"| Criterios editoriales | {quality_detected}/{topic_total} temas muestran el perfil de presencia; {topic_total - quality_detected} no lo completan. | Detector heurístico; no valida el contenido de cada criterio. | [Métricas](./topic-learning-quality.md) · [Deuda](./editorial-backlog.md) |",
        f"| Marcadores de siete pasos | {step_complete}/{topic_total} cumplen todos los marcadores medidos. | Presencia de marcadores, no utilidad ni calidad de las prácticas. | [Metodología](./seven-step-methodology.md) |",
        f"| Sustancia Markdown | {substance_summary['topicsWithIssues']}/{topic_total} temas presentan al menos una señal; {substance_summary['modulesWithLegacySections']}/{module_total} módulos, secciones heredadas. | Las señales requieren inspección del texto; no son defectos confirmados. | [Sustancia](./lesson-substance.md) |",
        f"| Código y visuales | {visual_totals['topics']} temas revisados; {visual_totals['mermaid']} con Mermaid, {visual_totals['archifyVisual']} con Archify y {visual_totals['asciiVisual']} con visual ASCII pendiente. | La presencia no acredita que el código se compile o que un diagrama se renderice y sea correcto. | [Código y visuales](./code-visual-quality.md) |",
        f"| Fuentes oficiales | {visual_totals['officialSource']}/{topic_total} temas contienen una URL de dominios oficiales reconocidos por el detector. | El enlace puede estar desactualizado o no sustentar la afirmación concreta; la vigencia es una comprobación distinta. | [Auditoría de visuales y fuentes](./code-visual-quality.md) · [Vigencia](./official-sources.json) |",
        f"| Renderizado estructural de navegador | El snapshot disponible registra {browser_page_total} páginas y {browser_topic_total}/{topic_total} temas; {browser_findings} hallazgos agregados, {browser_page_errors} errores de página y {browser_render_errors} errores de renderizado. | El snapshot no registra fecha y cubre {browser_uncovered_topics} temas menos que el inventario actual; actualizar el barrido antes de declarar cobertura completa. | [Snapshot](./browser-course-review.json) |",
        f"| Ejecución de ejemplos | {execution_states.get('checked-with-limits', 0)}/{execution_total} laboratorios seleccionados figuran como comprobados con límites; {execution_states.get('pending', 0)} sigue pendiente. | Muestra delimitada; no cubre todos los ejemplos históricos ni certifica aprendizaje. | [Registro de ejecución](../examples/professional-bridges/verification.json) |",
        f"| Revisión pedagógica humana | {topic_total - review_states.get('pending', 0)}/{topic_total} temas tienen un estado distinto de pendiente en el registro actual. | La revisión humana y la prueba con personas siguen pendientes según [el registro tema por tema](./course-depth-review.md). | [Revisión por tema](./course-depth-review.json) |",
        f"| Similitud entre temas | No medida; el auditor detecta repetición literal dentro de cada tema en {findings.get('parrafo-repetido', 0)} temas. | No se ejecutó análisis semántico, similitud entre temas ni detección de plagio. | [Límites de la auditoría de sustancia](./lesson-substance.md) |",
        "",
        "## Hallazgos estructurales que requieren priorización",
        "",
        "| Señal | Conteo | Lectura correcta |",
        "|---|---:|---|",
        f"| Bloques editoriales repetidos | {topic_count(findings.get('bloque-repetido', 0))} | Requiere inspección y reescritura; no se elimina automáticamente. |",
        f"| Andamiaje genérico | {topic_count(findings.get('andamiaje-generico', 0))} | Revisar si la instrucción realmente conduce a un artefacto específico. |",
        f"| Cola posterior al cierre | {topic_count(findings.get('cola-tras-cierre', 0))} | Señal de contenido posiblemente desplazado, no diagnóstico pedagógico automático. |",
        f"| Párrafos repetidos | {topic_count(findings.get('parrafo-repetido', 0))} | Confirmar duplicación dentro del contexto de cada tema. |",
        f"| Temas breves | {topic_count(findings.get('tema-breve', 0))} | La brevedad sola no prueba insuficiencia; revisar objetivo y práctica. |",
        "",
        "## Registro de revisión manual",
        "",
        "El registro estructural incluye una fila por tema y conserva `humanPedagogicalReview` como estado separado. Ningún tema se marca como pedagógicamente revisado por ejecutar un script, generar un reporte o superar una prueba de navegador. Para cerrar una revisión humana hay que actualizar el registro tema por tema con responsable, fecha, evidencia examinada y resultado.",
        "",
        f"La validación de navegador es otra capa. El snapshot anterior cubre menos temas que el inventario actual y no registra su fecha; hasta regenerarlo y documentar el recorrido real, no se declara que los {topic_total} temas se hayan probado en navegador.",
        "",
        "## Reproducibilidad",
        "",
        "Este resumen se genera con `python3 scripts/build_full_review.py` y se verifica con `python3 scripts/build_full_review.py --check`. Los reportes enlazados se regeneran por sus respectivos auditores; consulta `./scripts/validate.sh` para sus comandos de verificación.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = build()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("docs/full-review.md está desactualizado; ejecuta scripts/build_full_review.py")
        print("Revisión integral sincronizada.")
        return
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Informe actualizado: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
