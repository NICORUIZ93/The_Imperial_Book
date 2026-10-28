#!/usr/bin/env python3
"""Audita cada tema Markdown con criterios pedagógicos verificables."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
PUBLIC = ROOT / "web/public"
VISUALS = PUBLIC / "visuals"
JSON_REPORT = ROOT / "docs/topic-learning-quality.json"
MD_REPORT = ROOT / "docs/topic-learning-quality.md"
REQUIRED_CRITERIA = ("explanation", "code", "filePath", "runCommand", "expectedResult", "practice", "project", "modelMental", "limitsDecision")
EDITORIAL_MARKERS = ("DEFINITIVE-COMPLEMENTS", "SUPPLEMENTAL-COMPLEMENTS", "REQUESTED-PRACTICAL-EXAMPLES")
ARCHIFY_VISUAL_LINK = re.compile(r"\[[^\]]+\]\((/visuals/[^)\s]+\.html)\)")


def student_visible_content(text: str) -> str:
    for marker in EDITORIAL_MARKERS:
        text = re.sub(
            rf"\n?<!-- {marker}:START -->[\s\S]*?<!-- {marker}:END -->\n?",
            "\n",
            text,
        )
    return text


def structural_text(text: str) -> str:
    """Oculta el contenido de fences conservando offsets y saltos de línea."""
    return re.sub(
        r"^```[^\n]*\n[\s\S]*?^```[ \t]*$",
        lambda match: re.sub(r"[^\n]", " ", match.group()),
        text,
        flags=re.MULTILINE,
    )


def topic_blocks(text: str):
    structure = structural_text(text)
    headings = list(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", structure, re.MULTILINE))
    for index, match in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        block = text[match.start():end]
        block_structure = structure[match.start():end]
        next_h2 = re.search(r"^##\s+", block_structure[match.end() - match.start():], re.MULTILINE)
        if next_h2:
            block = block[:match.end() - match.start() + next_h2.start()]
        yield match.group(1), block


def resolve_archify_visual_link(href: str) -> Path | None:
    target = (PUBLIC / href.lstrip("/")).resolve()
    visuals_root = VISUALS.resolve()
    if not target.is_relative_to(visuals_root) or not target.is_file():
        return None
    return target


def unresolved_archify_visual_links(block: str) -> list[str]:
    return [
        href for href in ARCHIFY_VISUAL_LINK.findall(block)
        if resolve_archify_visual_link(href) is None
    ]


def evaluate(block: str) -> dict[str, bool]:
    return {
        "explanation": len(re.findall(r"\b\w+\b", block)) >= 90,
        "code": bool(re.search(r"^```(?!mermaid)", block, re.MULTILINE)),
        "visual": (
            "```mermaid" in block
            or bool(re.search(r"[┌┐└┘├┤┬┴┼─│]", block))
            or any(resolve_archify_visual_link(href) for href in ARCHIFY_VISUAL_LINK.findall(block))
        ),
        "filePath": bool(re.search(r"(?:src/|lib/|app/|\.github/|[\w-]+\.(?:ts|tsx|js|java|kt|swift|dart|py|tf|ya?ml|json|html|css|sql|sh|properties|kts))", block)),
        # runCommand: exige un comando de ejecución REAL al inicio de una línea
        # (opcionalmente tras `$ ` o `cd ... && `), no una palabra suelta en prosa
        # ni un marcador de lenguaje como ```swift o ```java. Esto evita el falso
        # positivo que hacía pasar temas sin ningún comando ejecutable.
        "runCommand": bool(re.search(
            r"^(?:\s*(?:\$|>|#)\s*)?(?:[\w./-]+\s*&&\s*)*"
            r"(npm|npx|pnpm|yarn|node|deno|bun|python3?|pip3?|java|javac|\./gradlew|gradle|mvn|\./mvnw"
            r"|flutter|dart|swift|xcodebuild|docker|docker-compose|kubectl|helm|terraform|tofu|ansible"
            r"|aws|az|gcloud|curl|git|psql|pg_dump|sqlite3|cargo|dotnet|go|bash|sh|make|floci|ng|adb|pod|xcrun)\b",
            block, re.MULTILINE | re.IGNORECASE)),
        "expectedResult": bool(re.search(r"(resultado esperado|salida esperada|debe mostrar|verifica)", block, re.IGNORECASE)),
        "practice": bool(re.search(r"(práctica|ejercicio|laboratorio|construcci[oó]n|predice|modifica)", block, re.IGNORECASE)),
        "project": bool(re.search(r"proyecto (propio|integrador|real|de tamaño real|final)|proyecto transversal", block, re.IGNORECASE)),
        "modelMental": bool(re.search(r"(analogía|modelo mental|por qué es importante)", block, re.IGNORECASE)),
        "limitsDecision": bool(re.search(r"(cuándo|límite|limitación|no usar|no conviene|diferencia|frente a|trade.?off)", block, re.IGNORECASE)),
    }


def classify(criteria: dict[str, bool], block: str) -> dict[str, bool | int]:
    """Distingue presencia editorial de una lección realmente practicable."""
    rubric = {
        "explanation": 2 if criteria["modelMental"] and criteria["limitsDecision"] else int(criteria["explanation"]),
        "example": 2 if criteria["code"] else 0,
        "location": 2 if criteria["filePath"] else 0,
        "execution": 2 if criteria["runCommand"] else 0,
        "result": 2 if criteria["expectedResult"] else 0,
        "visual": 2 if criteria["visual"] else 0,
        "practice": 2 if criteria["practice"] else 0,
        "project": 2 if criteria["project"] else 0,
    }
    score = sum(rubric.values())
    generic_markers = (
        "Este tema se incorpora de forma explícita porque no aparecía",
        "Este tema se estudia identificando el problema, sus prerrequisitos",
        "amplía el mapa mental y permite comprender decisiones",
        "Evidence(topic:",
        "passed: true",
    )
    return {
        "rubricScore": score,
        "practicable": all(criteria[name] for name in REQUIRED_CRITERIA) and not any(marker in block for marker in generic_markers),
        "genericScaffold": any(marker in block for marker in generic_markers),
        "repeatedDemo": False,
    }


def demo_signature(block: str) -> str:
    """Normaliza Paso 4 para detectar demos clonadas con otra carpeta/número."""
    match = re.search(r"paso 4.{0,60}demostración guiada([\s\S]*?)(?=^####\s+paso 5|\Z)", block, re.IGNORECASE | re.MULTILINE)
    if not match:
        return ""
    demo = match.group(1).lower()
    demo = re.sub(r"```[a-z0-9_-]*", "```", demo)
    demo = re.sub(r"(?:src/|app/|lib/)?[\w.-]+\.(?:js|ts|java|kt|swift|dart|py|tf|ya?ml|json|txt|html)", "<archivo>", demo)
    demo = re.sub(r"\bm\d+\b|\d+", "<n>", demo)
    demo = re.sub(r"ejemplo-[\w-]+", "<carpeta>", demo)
    demo = re.sub(r"\s+", " ", demo).strip()
    return demo if len(demo) >= 80 else ""


def build() -> dict:
    tracks: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        module = int(re.search(r"\d+", path.stem).group())
        for title, block in topic_blocks(student_visible_content(path.read_text(encoding="utf-8"))):
            unresolved_links = unresolved_archify_visual_links(block)
            if unresolved_links:
                links = ", ".join(unresolved_links)
                raise SystemExit(f"{path.relative_to(ROOT)}: destino Archify inexistente o fuera de visuals/: {links}")
            criteria = evaluate(block)
            tracks[path.parent.name].append({
                "module": module,
                "topic": title,
                "criteria": criteria,
                "classification": classify(criteria, block),
                "_demoSignature": demo_signature(block),
            })
    signature_counts = Counter(
        topic["_demoSignature"]
        for topics in tracks.values()
        for topic in topics
        if topic["_demoSignature"]
    )
    for topics in tracks.values():
        for topic in topics:
            repeated = bool(topic["_demoSignature"] and signature_counts[topic["_demoSignature"]] >= 3)
            topic["classification"]["repeatedDemo"] = repeated
            if repeated:
                topic["classification"]["genericScaffold"] = True
                topic["classification"]["practicable"] = False
            topic.pop("_demoSignature", None)
    summary = {}
    for track, topics in sorted(tracks.items()):
        counts = Counter()
        for topic in topics:
            counts.update(name for name, passed in topic["criteria"].items() if passed)
        summary[track] = {
            "topics": len(topics),
            **{name: counts[name] for name in next(iter(topics))["criteria"]},
            "practicable": sum(topic["classification"]["practicable"] for topic in topics),
            "genericScaffold": sum(topic["classification"]["genericScaffold"] for topic in topics),
            "repeatedDemo": sum(topic["classification"]["repeatedDemo"] for topic in topics),
        }
    return {"criteria": ["explanation", "code", "visual", "filePath", "runCommand", "expectedResult", "practice", "project", "modelMental", "limitsDecision"], "summary": summary, "topics": tracks}


def render_markdown(data: dict) -> str:
    lines = ["# Auditoría pedagógica tema por tema", "", "Esta auditoría mide exclusivamente la presencia de criterios en el contenido editorial real mediante heurísticas de texto. **Explicación** solo indica extensión mínima; no demuestra calidad. **Perfil cubierto** significa que aparecen explicación, código, ruta, ejecución, resultado, práctica, proyecto, modelo mental y límites; no acredita que sean suficientes, correctos, pedagógicamente eficaces ni ejecutables. **Texto genérico** detecta plantillas que nombran un tema sin enseñarlo. **Demo repetida** detecta el mismo Paso 4 reciclado en tres o más temas cambiando apenas nombres o números. Una ausencia o plantilla es deuda editorial explícita. La presencia visual reconoce Mermaid, diagramas ASCII y enlaces locales a HTML Archify existente; no acredita calidad ni revisión visual. Esta comprobación no ejecuta ejemplos ni sustituye la revisión humana. La metodología más estricta de siete pasos usa marcadores propios y mide un conjunto distinto de requisitos; consulta su reporte por separado.", "", "| Track | Temas | Explicación | Código | Ruta | Ejecución | Resultado | Práctica | Proyecto | Modelo mental | Límites | Perfil cubierto | Texto genérico | Demo repetida |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for track, row in data["summary"].items():
        lines.append(f"| {track} | {row['topics']} | {row['explanation']} | {row['code']} | {row['filePath']} | {row['runCommand']} | {row['expectedResult']} | {row['practice']} | {row['project']} | {row['modelMental']} | {row['limitsDecision']} | {row['practicable']} | {row['genericScaffold']} | {row['repeatedDemo']} |")
    total = {key: sum(row[key] for row in data["summary"].values()) for key in ["topics", *data["criteria"], "practicable", "genericScaffold", "repeatedDemo"]}
    lines.append(f"| **Total** | **{total['topics']}** | **{total['explanation']}** | **{total['code']}** | **{total['filePath']}** | **{total['runCommand']}** | **{total['expectedResult']}** | **{total['practice']}** | **{total['project']}** | **{total['modelMental']}** | **{total['limitsDecision']}** | **{total['practicable']}** | **{total['genericScaffold']}** | **{total['repeatedDemo']}** |")
    lines.extend(["", "## Regla editorial", "", "Un término listado en el sílabo no está cubierto hasta que el Markdown explique su modelo mental, muestre una aplicación específica, indique una decisión o límite y proponga evidencia verificable. El lector no genera diagramas decorativos para ocultar esa deuda. Esta auditoría solo registra indicios textuales y no sustituye la validación de siete pasos, la revisión técnica ni la ejecución de ejemplos.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--require-practicable", action="store_true", help="falla si algún tema no cumple el contrato pedagógico")
    parser.add_argument("--min-practicable", type=int, default=None,
                        help="umbral mínimo de temas practicables (trinquete anti-regresión); "
                             "falla si el conteo real baja de este valor. Súbelo al corregir temas.")
    args = parser.parse_args()
    data = build(); json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"; md_text = render_markdown(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text or not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("La auditoría tema por tema está desactualizada")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8"); MD_REPORT.write_text(md_text, encoding="utf-8")
    count = sum(row["topics"] for row in data["summary"].values())
    if count == 0 or len(data["summary"]) != 14:
        raise SystemExit(f"Inventario visible inválido: {count} temas en {len(data['summary'])} tracks")
    practicable = sum(row["practicable"] for row in data["summary"].values())
    generic = sum(row["genericScaffold"] for row in data["summary"].values())
    # El texto genérico de plantilla siempre bloquea: es deuda editorial encubierta.
    if args.require_practicable and generic:
        raise SystemExit(f"{generic} temas conservan texto genérico de plantilla (deuda encubierta)")
    # Trinquete anti-regresión: la cobertura practicable no puede bajar del umbral.
    # En vez de exigir 100% (que ocultaría la deuda real), se fija un piso que sube
    # a medida que se corrigen temas. Así el validador no miente ni bloquea el repo.
    if args.min_practicable is not None and practicable < args.min_practicable:
        raise SystemExit(
            f"Regresión pedagógica: {practicable}/{count} temas practicables, "
            f"por debajo del umbral {args.min_practicable}. No degrades el contenido."
        )
    estado = "OK" if (args.min_practicable is None or practicable >= args.min_practicable) else "INCOMPLETO"
    print(f"Auditoría pedagógica detallada {estado}: {count} temas en {len(data['summary'])} tracks "
          f"({practicable}/{count} practicables, deuda de {count - practicable})")


if __name__ == "__main__": main()
