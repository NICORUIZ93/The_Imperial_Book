#!/usr/bin/env python3
"""Audita los temas en alcance de specs/002 (capturas, ayudas de código y ayudas visuales).

Lee specs/visual-aids-scope.json y, por cada tema, comprueba:
  V1 al menos un diagrama Mermaid o una figura,
  V2 al menos una captura en content/figures/ (o captura declarada "pendiente" con motivo),
  V3 cada bloque de código de programa/configuración nombra su archivo en las 3 líneas previas
     y el tema explica el código por bloques o línea por línea,
  V4 si hay captura, el tema incluye un "Resultado esperado" escrito.
Sale con 1 si algún tema incumple; las capturas pendientes se informan sin fallar.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
SCOPE = ROOT / "specs" / "visual-aids-scope.json"
NO_FILENAME_NEEDED = {"bash", "sh", "shell", "text", "mermaid", "console", "powershell", ""}
CAPTURE = re.compile(r"!\[[^\]]+\]\((content/figures/[^)\s]+)\)")
FENCE = re.compile(r"^```(\w*)\s*$")
FILENAME_HINT = re.compile(r"`(?:[^`\s]+\.[A-Za-z0-9]+|(?:[^`\s]*/)?(?:Dockerfile|Containerfile|Makefile|Jenkinsfile|Procfile)(?:\.[\w-]+)?)`")
EXPLANATION = re.compile(r"Explicaci[oó]n (por bloques|l[ií]nea por l[ií]nea)", re.I)


def topic_text(track: str, module: int, topic: int) -> str | None:
    """Extrae el Markdown del tema, desde su encabezado hasta el siguiente tema o sección."""
    path = CONTENT / track / f"modulo-{module}.md"
    if not path.is_file():
        return None
    lines = path.read_text(encoding="utf-8").splitlines()
    start = next((i for i, l in enumerate(lines) if re.match(rf"^### Tema {topic}:", l)), None)
    if start is None:
        return None
    end = next((i for i in range(start + 1, len(lines)) if re.match(r"^(### Tema \d+:|## )", lines[i])), len(lines))
    return "\n".join(lines[start:end])


def code_blocks_without_filename(text: str) -> list[int]:
    """Devuelve las líneas (relativas al tema) de bloques de código sin archivo nombrado antes."""
    lines = text.splitlines()
    missing, inside = [], False
    for i, line in enumerate(lines):
        match = FENCE.match(line)
        if not match:
            continue
        if inside:
            inside = False
            continue
        inside = True
        language = match.group(1).lower()
        if language in NO_FILENAME_NEEDED:
            continue
        context = "\n".join(lines[max(0, i - 3):i])
        if not FILENAME_HINT.search(context):
            missing.append(i + 1)
    return missing


def audit(entry: dict) -> tuple[list[str], list[str]]:
    name = f"{entry['track']}/{entry['module']} Tema {entry['topic']}"
    text = topic_text(entry["track"], entry["module"], entry["topic"])
    if text is None:
        return [f"{name}: no se encontró el tema"], []
    errors, pending = [], []
    captures = CAPTURE.findall(text)
    if "```mermaid" not in text and not captures:
        errors.append(f"{name}: V1 sin diagrama Mermaid ni figura")
    if entry.get("capture") == "pendiente":
        if not entry.get("reason"):
            errors.append(f"{name}: V2 captura pendiente sin motivo en el alcance")
        else:
            pending.append(f"{name}: V2 captura pendiente — {entry['reason']}")
    elif not captures:
        errors.append(f"{name}: V2 sin captura en content/figures/")
    for src in captures:
        if not (ROOT / "web" / "public" / src).is_file():
            errors.append(f"{name}: V2 la captura {src} no existe")
    for line in code_blocks_without_filename(text):
        errors.append(f"{name}: V3 bloque de código en la línea {line} del tema sin nombre de archivo antes")
    if not EXPLANATION.search(text):
        errors.append(f"{name}: V3 falta 'Explicación por bloques' o 'Explicación línea por línea'")
    if captures and "Resultado esperado" not in text:
        errors.append(f"{name}: V4 hay captura pero no 'Resultado esperado' escrito")
    return errors, pending


def main() -> int:
    scope = json.loads(SCOPE.read_text(encoding="utf-8"))["topics"]
    errors, pending = [], []
    for entry in scope:
        e, p = audit(entry)
        errors += e
        pending += p
    print(f"audit_visual_aids: {len(scope)} temas en alcance, {len(errors)} problema(s), {len(pending)} captura(s) pendiente(s)")
    for line in errors + pending:
        print(f"  {line}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
