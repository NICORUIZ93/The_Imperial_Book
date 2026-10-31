#!/usr/bin/env python3
"""Mide la metodología editorial de siete pasos en cada tema visible."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from audit_topic_learning_quality import student_visible_content, topic_blocks

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_REPORT = ROOT / "docs/seven-step-methodology.json"
MD_REPORT = ROOT / "docs/seven-step-methodology.md"


def matches(pattern: str, block: str) -> bool:
    return bool(re.search(pattern, block, re.IGNORECASE | re.MULTILINE))


def evaluate(block: str) -> dict[str, bool]:
    return {
        "objective": matches(r"paso 1.{0,40}objetivo", block) and matches(r"al finalizar", block),
        "prerequisites": matches(r"conocimiento previo|prerrequisitos?", block),
        "context": matches(r"paso 2.{0,50}contexto", block) and matches(r"(caso|situaci[oó]n|problema).{0,80}(real|profesional)|caso real", block),
        "theoryAnalogy": matches(r"paso 3.{0,50}teoría", block) and matches(r"analogía", block),
        "guidedDemo": matches(r"paso 4.{0,60}demostración guiada", block) and matches(r"^```(?!mermaid)", block) and (
            matches(
                r"(crea|cre[aá]|guarda|actualiza|implementa|pega|reemplaza|a[ñn]ade|agrega|escribe|monta|nombr[aá]lo).{0,220}(src/|app/|lib/|[\w./-]+\.(?:mjs|cjs|js|jsx|ts|tsx|java|kt|swift|dart|py|tf|ya?ml|json|html|css|scss|sql|sh|conf|service|env|ini|toml|properties|md|cs|csproj))",
                block,
            )
            # Un tema de infraestructura/CLI demuestra operando recursos
            # reales (su artefacto es el recurso cloud, no un archivo local):
            # aprovisionarlo, consultarlo o mutarlo con la CLI del proveedor.
            or matches(r"\b(aws|az|gcloud|kubectl|terraform|tofu|sam|helm|ansible(?:-\w+)?)\b[\s\S]{0,120}\b(create|apply|deploy|put[\w-]*|run|publish|invoke|new|add|init|get[\w-]*|list[\w-]*|describe[\w-]*|query|update[\w-]*|send[\w-]*|encrypt|cp|mb|tag-resources|restore[\w-]*|presign[\w-]*)\b", block)
            # Un tema de KMP/Gradle demuestra compilando o ejecutando la suite
            # de pruebas del módulo compartido (artefacto = build/test).
            or matches(r"\./gradlew\s+[\w:]*(test|build|assembleDebug|allTests|publish)", block)
            or matches(r"xcodebuild\s+(-scheme|-create-xcframework)", block)
            # Un tema de iOS/SwiftUI demuestra creando un proyecto en Xcode y
            # compilándolo (su artefacto es el proyecto, no un archivo suelto).
            # El separador del menú puede ser '.', '>', '/' o '▸'.
            or matches(r"(crea el proyecto en xcode|File\s*[.>/▸]\s*New\s*[.>/▸]\s*Project)[\s\S]{0,180}(nombr|pega|compil|swift)", block)
        ),
        "codeExplanation": matches(r"//.{6,}|explica.{0,40}(línea|bloque|parte)", block),
        "execution": matches(r"^```bash[\s\S]{0,500}(\b(node|npm|npx|java|mvn|gradle|python3?|py|sqlite3|psql|redis-cli|curl|flutter|dart|swift|xcodebuild|xcrun|docker|terraform|tofu|kubectl|aws|az|gcloud|sam|serverless|helm|ng|pod|adb|ssh|scp|rsync|systemctl|journalctl|nginx|certbot|ufw|fail2ban-client|openssl|dig|restic|k6|wrk|dotnet)\b|\./(gradlew|mvnw))", block),
        "expectedResult": matches(r"resultado esperado|salida esperada", block),
        # Fallo deliberado: romper algo a propósito para observar/diagnosticar
        # el efecto. Acepta "fallo deliberado", "provocar deliberadamente …" y
        # el orden inverso "… deliberadamente … provoca …".
        "deliberateFailure": (
            matches(r"(fallo deliberado|provoca[rl]?\s+deliberadamente|provoca[rl]?\s+(?:un|el|una|la)\b)", block)
            or matches(r"deliberadamente[\s\S]{0,120}provoca", block)
        ) and matches(r"(error|falla|diagn[oó]st)", block),
        "guidedPractice": matches(r"paso 5.{0,60}práctica guiada", block) and matches(r"pista", block),
        "independentPractice": matches(r"paso 6.{0,60}práctica independiente", block),
        "closure": matches(r"paso 7.{0,50}cierre", block) and matches(r"(siguiente|próximo)", block),
        "commonErrors": matches(r"errores comunes", block),
        "resources": matches(r"fuente[s]? oficial", block) and matches(r"https?://", block),
        "standaloneExample": (
            # Vía general: lenguaje de arranque limpio + comando de andamiaje
            # (mkdir, npm create, ng new, Xcode nuevo proyecto, terraform init…),
            # o la copia de una plantilla del laboratorio a una carpeta propia.
            matches(r"(ejemplo independiente|carpeta vac[ií]a|proyecto nuevo|desde cero|copia independiente)", block)
            and matches(
                r"(mkdir|New-Item|npm init|npm create|npx create|npx @angular/cli@[^ ]+ new|create-next-app|ng new|flutter create|dart create|gradle init|mvn|cargo new|swift package init|terraform init|New . Project|File . New . Project|cp\s+-R\s+examples/[\w./-]+\s+ejemplo)",
                block,
            )
        ) or (
            # Vía nube: la demostración (Paso 4) arranca creando/operando su
            # propio recurso base con la CLI, sin depender de un proyecto
            # acumulativo. El artefacto verificable es el recurso en la nube.
            matches(r"paso 4[\s\S]{0,1600}\b(aws|az|gcloud)\s+[\w-]+\s+(create[\w-]*|put[\w-]*|publish|invoke|cp|update-table|query|list-tables)", block)
        ) or (
            # Vía proyecto compilable: el tema demuestra compilando un proyecto
            # con nombre propio (Xcode) o ejecutando la suite de pruebas de un
            # módulo (Gradle/KMP). El artefacto verificable es el build/test,
            # autocontenido y reproducible sin arrastrar estado de otro tema.
            matches(r"xcodebuild\s+(-scheme|-create-xcframework)", block)
            or matches(r"\./gradlew\s+[\w:]*(test|build|assembleDebug|allTests|publish)", block)
        ),
    }


def build() -> dict:
    tracks: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        module = int(re.search(r"\d+", path.stem).group())
        text = student_visible_content(path.read_text(encoding="utf-8"))
        for title, block in topic_blocks(text):
            criteria = evaluate(block)
            passed = sum(criteria.values())
            tracks[path.parent.name].append({
                "module": module,
                "topic": title,
                "criteria": criteria,
                "classification": {
                    "stepsPassed": passed,
                    "complete": passed == len(criteria),
                },
            })

    summary = {}
    for track, topics in sorted(tracks.items()):
        counts = Counter()
        for topic in topics:
            counts.update(name for name, value in topic["criteria"].items() if value)
        summary[track] = {
            "topics": len(topics),
            **{name: counts[name] for name in next(iter(topics))["criteria"]},
            "complete": sum(topic["classification"]["complete"] for topic in topics),
        }
    return {"summary": summary, "topics": tracks}


def render_markdown(data: dict) -> str:
    keys = list(next(iter(data["summary"].values())).keys())
    keys = [key for key in keys if key not in ("topics", "complete")]
    labels = [key for key in keys]
    lines = [
        "# Auditoría de metodología universal por tema",
        "",
        "Un tema completo hace visibles los siete pasos solicitados y sus apoyos profesionales según 16 marcadores heurísticos. Este reporte no confunde una mención curricular con una lección terminada. El resultado no demuestra calidad, aprendizaje ni ejecución de los ejemplos; la auditoría de criterios editoriales es independiente y usa otra rúbrica.",
        "",
        "| Track | Temas | " + " | ".join(labels) + " | Completos |",
        "|---|---:|" + "---:|" * (len(keys) + 1),
    ]
    for track, row in data["summary"].items():
        lines.append(f"| {track} | {row['topics']} | " + " | ".join(str(row[key]) for key in keys) + f" | {row['complete']} |")
    totals = {key: sum(row[key] for row in data["summary"].values()) for key in ["topics", *keys, "complete"]}
    lines.append(f"| **Total** | **{totals['topics']}** | " + " | ".join(f"**{totals[key]}**" for key in keys) + f" | **{totals['complete']}** |")
    lines.extend([
        "", "## Interpretación", "",
        "- **Demostración** exige código comentado, archivo concreto, ejecución y salida observable.",
        "- **Fallo deliberado** exige provocar un error y explicar su diagnóstico; mencionar errores no basta.",
        "- **Ejemplo independiente** exige iniciar el tema en una carpeta vacía o proyecto nuevo; ninguna lección depende de un proyecto acumulativo.",
        "- Los temas incompletos permanecen como deuda editorial hasta ser reescritos específicamente.",
        "- Cada campo es una detección textual de marcadores; una revisión humana sigue siendo necesaria para confirmar que el paso enseña realmente el concepto.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = render_markdown(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text:
            raise SystemExit("La auditoría de siete pasos está desactualizada")
        if not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("El resumen de siete pasos está desactualizado")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8")
        MD_REPORT.write_text(md_text, encoding="utf-8")
    total = sum(row["topics"] for row in data["summary"].values())
    complete = sum(row["complete"] for row in data["summary"].values())
    if total < 893 or len(data["summary"]) != 14:
        raise SystemExit(f"Inventario metodológico inválido: {total} temas en {len(data['summary'])} tracks")
    if args.require_complete and complete != total:
        raise SystemExit(f"Metodología incompleta: {complete}/{total} temas")
    print(f"Metodología universal auditada: {complete}/{total} temas completos")


if __name__ == "__main__":
    main()
