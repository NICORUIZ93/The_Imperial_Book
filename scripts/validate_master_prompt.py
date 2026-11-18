#!/usr/bin/env python3
"""Valida que el prompt maestro v3 conserve sus secciones obligatorias (specs/008; antes specs/003).

Comprueba en MASTER-PROMPT.md: constitución, flujo SDD, investigación, estándar de tema, agentes,
bucle de revisión, ingreso de capturas, equivalencias con las pautas 13–17 de la v2 y cifras iguales
a topic-index.json.
Comprueba en docs/PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md: nombre The Imperial Book, referencia a
specs/002 y principios de enseñanza. También verifica que existan los archivos que ambos citan.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "MASTER-PROMPT.md"
METHOD = ROOT / "docs" / "PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md"
INDEX = ROOT / "web" / "public" / "content" / "topic-index.json"

MASTER_REQUIRED = (
    "# MASTER-PROMPT v3 · The Imperial Book",
    "## 1. Constitución (reglas que no se negocian)",
    "## 2. Flujo spec-driven por lote",
    "## 3. Protocolo de investigación",
    "## 4. Estándar de tema (definición de terminado)",
    "## 5. Agentes y responsabilidades",
    "## 6. Bucle de retroalimentación",
    "## 9. Capturas que guarda el dueño",
    "PAUTA 13 — Explicación fácil",
    "PAUTA 17 — De cero a master",
)
METHOD_REQUIRED = (
    "editor de The Imperial Book",
    "specs/002-estandar-temas-con-capturas-y-ayudas.md",
    "PRINCIPIOS DE ENSEÑANZA",
    "De cero a master",
)
CITED = re.compile(r"`((?:scripts|specs|docs)/[\w./-]+\.(?:py|md|json))`")


def main() -> int:
    errors: list[str] = []
    master = MASTER.read_text(encoding="utf-8")
    method = METHOD.read_text(encoding="utf-8")
    for needle in MASTER_REQUIRED:
        if needle not in master:
            errors.append(f"MASTER-PROMPT.md: falta «{needle}»")
    for needle in METHOD_REQUIRED:
        if needle not in method:
            errors.append(f"PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md: falta «{needle}»")
    if "Academia Floci" in method:
        errors.append("PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md: usa «Academia Floci» en vez de The Imperial Book")

    index = json.loads(INDEX.read_text(encoding="utf-8"))
    real = (len(index), sum(len(m) for m in index.values()), sum(len(t) for m in index.values() for t in m.values()))
    match = re.search(r"\*\*(\d+) rutas · (\d+) módulos · (\d+) temas\*\*", master)
    if not match:
        errors.append("MASTER-PROMPT.md: falta la línea de cifras «**N rutas · M módulos · T temas**»")
    elif tuple(int(n) for n in match.groups()) != real:
        errors.append(f"MASTER-PROMPT.md: declara {match.groups()} y topic-index.json tiene {real}")

    for name, text in (("MASTER-PROMPT.md", master), ("PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md", method)):
        for path in sorted(set(CITED.findall(text))):
            if "*" not in path and "NNN" not in path and not (ROOT / path).exists():
                errors.append(f"{name}: cita {path}, que no existe")

    print(f"validate_master_prompt: {'ok' if not errors else f'{len(errors)} problema(s)'} (cifras reales {real})")
    for error in errors:
        print(f"  {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
