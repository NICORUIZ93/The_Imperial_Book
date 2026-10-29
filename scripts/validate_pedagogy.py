#!/usr/bin/env python3
"""Valida que cada libro conserve una estructura educativa mínima y medible."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
METHODOLOGY = ROOT / "docs" / "METODOLOGIA-DE-APRENDIZAJE.md"
TRACKS = (
    "foundations", "cloud", "angular", "react", "java", "spring-boot",
    "kotlin-multiplatform", "android", "ios", "flutter",
    "node", "javascript", "devops", "rutaflow",
)

errors: list[str] = []
totals = {"files": 0, "topics": 0, "code": 0, "labs": 0, "cases": 0, "diagrams": 0}

if not METHODOLOGY.exists():
    errors.append("falta docs/METODOLOGIA-DE-APRENDIZAJE.md")
else:
    method_text = METHODOLOGY.read_text(encoding="utf-8")
    for stage in ("Objetivo", "Explicación", "Demostración", "Tarea", "Repaso"):
        if stage not in method_text:
            errors.append(f"metodología: falta la etapa {stage}")

for track in TRACKS:
    files = sorted((CONTENT / track).glob("modulo-*.md"))
    if not files:
        errors.append(f"{track}: no tiene módulos")
        continue
    if "## Antes de comenzar:" not in files[0].read_text(encoding="utf-8"):
        errors.append(f"{track}/modulo-0.md: falta preparación del entorno desde cero")
    if track != "foundations" and "## Ruta de proyecto progresivo desde carpeta vacía" not in files[0].read_text(encoding="utf-8"):
        errors.append(f"{track}/modulo-0.md: falta ruta acumulativa desde carpeta vacía")

    for path in files:
        text = path.read_text(encoding="utf-8")
        totals["files"] += 1
        totals["code"] += text.count("```") // 2
        totals["labs"] += text.count("## Laboratorio práctico")
        totals["cases"] += text.count("**Casos de uso reales:**")
        totals["diagrams"] += text.count("**Diagrama:**") + text.count("**Diagrama interactivo:**")

        for required in ("## Aprende construyendo",):
            if required not in text:
                errors.append(f"{path.relative_to(ROOT)}: falta {required}")

        topics = list(re.finditer(r"^### Tema .+$", text, re.MULTILINE))
        if not topics:
            errors.append(f"{path.relative_to(ROOT)}: no contiene temas prácticos")
        totals["topics"] += len(topics)
        for index, match in enumerate(topics):
            end = topics[index + 1].start() if index + 1 < len(topics) else text.find("\n---", match.end())
            section = text[match.start(): end if end >= 0 else len(text)]
            title = match.group(0)
            if len(re.findall(r"\b\w+\b", section)) < 45:
                errors.append(f"{path.relative_to(ROOT)} · {title}: explicación demasiado breve")

        # No se exige una cantidad artificial de palabras: la profundidad se mide
        # tema por tema en audit_topic_learning_quality.py. Un mínimo global
        # incentivaba párrafos repetidos y anexos que simulaban cobertura.

if errors:
    print("Validación pedagógica FALLÓ:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print(
    "Pedagogía OK: "
    f"{totals['files']} lecciones, {totals['topics']} temas, "
    f"{totals['code']} bloques de código y {totals['labs']} laboratorios. "
    f"Casos reales explícitos: {totals['cases']}/{totals['topics']}; "
    f"diagramas editoriales: {totals['diagrams']}/{totals['topics']} (los faltantes permanecen como deuda; no se generan gráficos decorativos)."
)
