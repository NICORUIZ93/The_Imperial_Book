#!/usr/bin/env python3
"""Mide código didáctico y visuales reales sin contar guías generadas."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit

from audit_topic_learning_quality import resolve_archify_visual_link, unresolved_archify_visual_links

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_REPORT = ROOT / "docs/code-visual-quality.json"
MD_REPORT = ROOT / "docs/code-visual-quality.md"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)
EDITORIAL_MARKERS = ("DEFINITIVE-COMPLEMENTS", "SUPPLEMENTAL-COMPLEMENTS", "REQUESTED-PRACTICAL-EXAMPLES")
OFFICIAL_SOURCE_HOSTS = frozenset({
    "angular.dev", "react.dev", "nodejs.org", "dev.java", "docs.spring.io",
    "spring.io", "kotlinlang.org", "developer.android.com", "developer.apple.com",
    "docs.flutter.dev", "developer.mozilla.org", "docs.docker.com", "kubernetes.io",
    "developer.hashicorp.com", "docs.aws.amazon.com", "learn.microsoft.com",
    "cloud.google.com", "floci.io",
    "docs.python.org", "peps.python.org", "docs.oracle.com", "www.typescriptlang.org",
    "www.gnu.org", "git-scm.com", "docs.npmjs.com", "tc39.es", "openjdk.org",
    "dart.dev", "api.flutter.dev", "docs.gradle.org", "maven.apache.org",
    "www.postgresql.org", "www.sqlite.org", "code.visualstudio.com", "docs.github.com",
    "aws.amazon.com", "opentelemetry.io",
})


def student_visible_content(text: str) -> str:
    for marker in EDITORIAL_MARKERS:
        text = re.sub(
            rf"\n?<!-- {marker}:START -->[\s\S]*?<!-- {marker}:END -->\n?",
            "\n",
            text,
        )
    return text


def structural_text(text: str) -> str:
    return re.sub(
        r"^```[^\n]*\n[\s\S]*?^```[ \t]*$",
        lambda match: re.sub(r"[^\n]", " ", match.group()),
        text,
        flags=re.MULTILINE,
    )


def blocks(text: str):
    structure = structural_text(text)
    headings = list(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", structure, re.MULTILINE))
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        block = text[heading.start():end]
        block_structure = structure[heading.start():end]
        next_h2 = re.search(r"^##\s+", block_structure[heading.end() - heading.start():], re.MULTILINE)
        if next_h2:
            block = block[:heading.end() - heading.start() + next_h2.start()]
        yield heading.group(1), block


def official_source_urls(block: str) -> list[str]:
    urls = []
    for url in re.findall(r"https?://[^\s<>\[\])`\"']+", structural_text(student_visible_content(block)), re.IGNORECASE):
        try:
            parsed = urlsplit(url)
        except ValueError:
            continue
        if parsed.hostname in OFFICIAL_SOURCE_HOSTS and parsed.username is None:
            urls.append(url)
    return urls


def evaluate(block: str) -> dict[str, bool]:
    code_blocks = re.findall(r"^```(?!mermaid)([^\n]*)\n(.*?)^```", block, re.MULTILINE | re.DOTALL)
    commented = any(re.search(r"(^|\n)\s*(//|#|/\*|<!--|--\s)", code) for _, code in code_blocks)
    misleading = bool(re.search(r"\*\*Diagrama:\*\*\s*\n\s*```(?!mermaid|text(?:\s|$)|\s*$)(?:\w+)", block))
    ascii_visual = bool(re.search(r"\*\*Diagrama:\*\*\s*\n\s*```(?:text)?\s*\n", block))
    return {
        "code": bool(code_blocks),
        "commentedCode": commented,
        "mermaid": "```mermaid" in block,
        "archifyVisual": any(
            resolve_archify_visual_link(href)
            for href in re.findall(r"\[[^\]]+\]\((/visuals/[^)\s]+\.html)\)", block)
        ),
        "asciiVisual": ascii_visual,
        "misleadingDiagramLabel": misleading,
        "filePath": bool(re.search(r"(?:src/|lib/|app/|tests?/|[\w.-]+\.(?:ts|tsx|js|java|kt|swift|dart|py|tf|ya?ml|json|html|css))", block)),
        "runCommand": bool(re.search(r"\b(?:npm|npx|node|python3?|java|gradle|mvnw?|flutter|swift|docker|kubectl|terraform|aws|curl|xcodebuild)\b", block, re.IGNORECASE)),
        "officialSource": bool(official_source_urls(block)),
    }


def build() -> dict:
    tracks = {}
    debts = []
    for track in TRACKS:
        counts = Counter()
        total = 0
        for path in sorted((CONTENT / track).glob("modulo-*.md")):
            module = int(re.search(r"\d+", path.stem).group())
            for title, block in blocks(student_visible_content(path.read_text(encoding="utf-8"))):
                unresolved_links = unresolved_archify_visual_links(block)
                if unresolved_links:
                    links = ", ".join(unresolved_links)
                    raise SystemExit(f"{path.relative_to(ROOT)}: destino Archify inexistente o fuera de visuals/: {links}")
                total += 1
                checks = evaluate(block)
                counts.update(name for name, value in checks.items() if value)
                if not checks["code"] or (checks["code"] and not checks["commentedCode"]):
                    debts.append({"track": track, "module": module, "topic": title, "missingCode": not checks["code"], "missingComments": checks["code"] and not checks["commentedCode"]})
        tracks[track] = {"topics": total, **{name: counts[name] for name in evaluate("")}}
    return {"tracks": tracks, "priorityDebt": debts}


def render(data: dict) -> str:
    source_review = json.loads((ROOT / "docs/topic-source-review.json").read_text(encoding="utf-8"))
    source_summary = source_review["summary"]
    lines = [
        "# Auditoría de código y visuales",
        "",
        "Mide únicamente contenido dentro de cada tema. Las guías transversales no cuentan como código editorial ni como fuente oficial del tema.",
        "",
        f"Las fuentes se reconocen por host exacto en la prosa visible, no dentro del código. El reconocimiento no comprueba acceso, vigencia ni pertinencia. La revisión parcial del {source_review['reviewedAt']} conserva los {source_summary['baselineUnrecognizedTopics']} temas originalmente sin reconocimiento y los resultados HTTP de {source_summary['urlsChecked']} citas registradas en [el registro de fuentes por tema](./topic-source-review.json); todos mantienen revisión manual pendiente de pertinencia.",
        "",
        "| Track | Temas | Código | Código comentado | Mermaid | Archify HTML | ASCII pendiente | Etiqueta engañosa | Ruta | Ejecución | Dominio oficial detectado |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for track, row in data["tracks"].items():
        lines.append(f"| {track} | {row['topics']} | {row['code']} | {row['commentedCode']} | {row['mermaid']} | {row['archifyVisual']} | {row['asciiVisual']} | {row['misleadingDiagramLabel']} | {row['filePath']} | {row['runCommand']} | {row['officialSource']} |")
    total = Counter()
    for row in data["tracks"].values():
        total.update(row)
    lines.append(f"| **Total** | **{total['topics']}** | **{total['code']}** | **{total['commentedCode']}** | **{total['mermaid']}** | **{total['archifyVisual']}** | **{total['asciiVisual']}** | **{total['misleadingDiagramLabel']}** | **{total['filePath']}** | **{total['runCommand']}** | **{total['officialSource']}** |")
    lines.extend(["", "## Regla editorial", "", "Un bloque de código debe indicar archivo, explicar decisiones relevantes y poder ejecutarse. Un visual ASCII sigue siendo deuda hasta convertirse manualmente en Mermaid/SVG sin deformar la relación que representa. Un enlace Archify solo cuenta si el HTML local existe; el conteo no sustituye una revisión visual ni justifica diagramas decorativos.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = render(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text or not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("La auditoría de código y visuales está desactualizada")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8")
        MD_REPORT.write_text(md_text, encoding="utf-8")
    count = sum(row["topics"] for row in data["tracks"].values())
    print(f"Auditoría de código y visuales OK: {count} temas editoriales visibles; inventarios generados excluidos")


if __name__ == "__main__":
    main()
