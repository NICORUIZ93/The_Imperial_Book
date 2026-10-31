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
    browser_inventory = browser.get("inventoryTopics", topic_total)
    browser_covered = browser.get("coveredTopics", browser_topic_total)
    browser_uncovered_topics = max(browser_inventory - browser_covered, 0)
    browser_generated_at = browser.get("generatedAt")
    browser_date = browser_generated_at[:10] if isinstance(browser_generated_at, str) else None
    browser_complete = bool(browser_date) and browser_uncovered_topics == 0

    human_review = depth.get("humanPedagogicalReview", {})
    human_signed = human_review.get("reviewed", 0)
    human_pre_read = human_review.get("preRead", 0)

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

    if browser_complete:
        browser_row = (
            f"| Renderizado estructural de navegador | Snapshot del {browser_date}: {browser_page_total} páginas y "
            f"{browser_covered}/{browser_inventory} temas; {browser_findings} hallazgos agregados, "
            f"{browser_page_errors} errores de página y {browser_render_errors} errores de renderizado. | "
            "Cobertura completa del renderizado estructural; no ejecuta ejercicios ni acredita calidad pedagógica. | "
            "[Snapshot](./browser-course-review.json) |"
        )
        browser_note = (
            f"La validación de navegador se ejecutó el {browser_date} sobre {browser_page_total} páginas y "
            f"{browser_covered}/{browser_inventory} temas. Comprueba estructura y errores de renderizado; "
            "no sustituye pruebas funcionales ni revisión humana."
        )
    else:
        browser_row = (
            f"| Renderizado estructural de navegador | El snapshot disponible registra {browser_page_total} páginas y "
            f"{browser_covered}/{browser_inventory} temas; {browser_findings} hallazgos agregados, "
            f"{browser_page_errors} errores de página y {browser_render_errors} errores de renderizado. | "
            f"{'El snapshot no registra fecha' if not browser_date else 'El snapshot no cubre el inventario completo'}"
            f"; cubre {browser_uncovered_topics} temas menos que el inventario actual; actualizar el barrido antes de "
            "declarar cobertura completa. | [Snapshot](./browser-course-review.json) |"
        )
        browser_note = (
            "La validación de navegador es otra capa. El snapshot anterior cubre menos temas que el inventario actual "
            "o no registra su fecha; hasta regenerarlo y documentar el recorrido real, no se declara que los "
            f"{topic_total} temas se hayan probado en navegador."
        )

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
        browser_row,
        f"| Ejecución de ejemplos | {execution_states.get('checked-with-limits', 0)}/{execution_total} laboratorios seleccionados figuran como comprobados con límites; {'ninguno pendiente' if execution_states.get('pending', 0) == 0 else str(execution_states.get('pending', 0)) + ' sigue pendiente'}. | Muestra delimitada; no cubre todos los ejemplos históricos ni certifica aprendizaje. | [Registro de ejecución](../examples/professional-bridges/verification.json) |",
        f"| Revisión pedagógica humana | {human_signed}/{topic_total} temas con firma humana; {human_pre_read} con pre-lectura de agente sin firma. | La pre-lectura no acredita ejecución, comprensión ni calidad; la firma humana sigue pendiente según [el registro manual](./manual-review-log.md). | [Registro manual](./manual-review-log.md) · [Revisión por tema](./course-depth-review.json) |",
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
        "El registro estructural incluye una fila por tema y conserva `humanPedagogicalReview` como estado separado. Ningún tema se marca como pedagógicamente revisado por ejecutar un script, generar un reporte o superar una prueba de navegador. Las 14 pre-lecturas de la muestra inicial están en [el registro manual](./manual-review-log.md) con firma humana pendiente. Para cerrar una revisión humana hay que actualizar el registro tema por tema con responsable, fecha, evidencia examinada y resultado.",
        "",
        browser_note,
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
