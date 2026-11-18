#!/usr/bin/env python3
"""Audita el estándar de tema de 12 partes de MASTER-PROMPT v3 (sección 4; specs/010).

Cada tema v3 usa encabezados fijos para que la comprobación no dependa de heurísticas:

  ### Tema N: título · Nivel · NN min
  **Prerrequisitos:** …
  #### Objetivo · #### Por qué importa · #### Explicación (con **Analogía:**, **Límite:** y Mermaid)
  #### Ejemplo desde cero (archivos nombrados, comando, **Explicación por bloques:**, captura real o
       **Captura pendiente:** con motivo, **Resultado esperado:**)
  #### Fallo deliberado (**Error esperado:** y **Diagnóstico:**)
  #### Ejercicios (Nivel 1 · Guiado, Nivel 2 · Independiente, Nivel 3 · Reto, cada uno con
       <details><summary>…</summary> de solución o rúbrica)
  #### Cierre (**Checklist de salida:** con 4 o más casillas, **Errores comunes:**, **Siguiente paso:**)
  #### Proyecto integrador · #### Fuentes (enlaces y fecha «Consultadas el AAAA-MM-DD»)

Uso:
  python3 scripts/audit_topic_standard_v3.py --track docker            # todos los módulos publicados
  python3 scripts/audit_topic_standard_v3.py --track docker --module 0
Sale con 1 si algún tema incumple una parte.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
HEADER = re.compile(r"^### Tema (\d+): (.+?) · (Básico|Intermedio|Avanzado|Experto) · (\d+) min$", re.M)
FENCE = re.compile(r"^```[^\n]*\n[\s\S]*?^```[ \t]*$", re.M)
FILENAME = re.compile(r"Archivo `[^`]+`")
SECTIONS = ("Objetivo", "Por qué importa", "Explicación", "Ejemplo desde cero", "Fallo deliberado",
            "Ejercicios", "Cierre", "Proyecto integrador", "Fuentes")


def masked(text: str) -> str:
    """Oculta el interior de los bloques de código para no leer encabezados de ejemplos."""
    return FENCE.sub(lambda m: re.sub(r"[^\n]", " ", m.group()), text)


def topics(text: str):
    mask = masked(text)
    heads = list(HEADER.finditer(mask))
    for i, head in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
        nxt = re.search(r"^## ", mask[head.end():end], re.M)
        stop = head.end() + nxt.start() if nxt else end
        yield head, text[head.start():stop], mask[head.start():stop]


def section(block: str, mask: str, name: str) -> str | None:
    match = re.search(rf"^#### {re.escape(name)}\s*$", mask, re.M)
    if not match:
        return None
    rest = mask[match.end():]
    nxt = re.search(r"^#### ", rest, re.M)
    return block[match.end(): match.end() + (nxt.start() if nxt else len(rest))]


def audit_topic(block: str, mask: str) -> list[str]:
    missing: list[str] = []
    if "**Prerrequisitos:**" not in block:
        missing.append("prerrequisitos")
    parts = {name: section(block, mask, name) for name in SECTIONS}
    missing += [f"sección «{name}»" for name, body in parts.items() if body is None]
    explanation = parts["Explicación"] or ""
    for marker in ("**Analogía:**", "**Límite:**", "```mermaid"):
        if marker not in explanation:
            missing.append(f"Explicación sin {marker.strip('*:`')}")
    example = parts["Ejemplo desde cero"] or ""
    code_blocks = [m for m in re.finditer(r"^```(\w[\w+-]*)", example, re.M) if m.group(1) not in ("text", "mermaid", "console")]
    if not code_blocks:
        missing.append("ejemplo sin código")
    if not FILENAME.search(example):
        missing.append("ejemplo sin archivo nombrado («Archivo `…`»)")
    for marker in ("**Explicación por bloques:**", "**Resultado esperado:**"):
        if marker not in example:
            missing.append(f"ejemplo sin {marker.strip('*:')}")
    if not (re.search(r"!\[[^\]]+\]\(content/figures/[^)]+\)", example) or "**Captura pendiente:**" in example):
        missing.append("ejemplo sin captura real ni captura pendiente con motivo")
    failure = parts["Fallo deliberado"] or ""
    for marker in ("**Error esperado:**", "**Diagnóstico:**"):
        if marker not in failure:
            missing.append(f"fallo sin {marker.strip('*:')}")
    exercises = parts["Ejercicios"] or ""
    for level in ("Nivel 1 · Guiado", "Nivel 2 · Independiente", "Nivel 3 · Reto"):
        if level not in exercises:
            missing.append(f"falta ejercicio «{level}»")
    if exercises.count("<details>") < 3 or exercises.count("</details>") < 3:
        missing.append("ejercicios sin tres soluciones o rúbricas plegables")
    closing = parts["Cierre"] or ""
    if "**Checklist de salida:**" not in closing or len(re.findall(r"^- \[ \] ", closing, re.M)) < 4:
        missing.append("cierre sin checklist de 4 casillas")
    for marker in ("**Errores comunes:**", "**Siguiente paso:**"):
        if marker not in closing:
            missing.append(f"cierre sin {marker.strip('*:')}")
    sources = parts["Fuentes"] or ""
    if not re.search(r"\]\(https?://", sources) or not re.search(r"Consultadas el \d{4}-\d{2}-\d{2}", sources):
        missing.append("fuentes sin enlace o sin fecha de consulta")
    return missing


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--track", required=True)
    parser.add_argument("--module", type=int)
    args = parser.parse_args()
    folder = CONTENT / args.track
    files = [folder / f"modulo-{args.module}.md"] if args.module is not None else sorted(
        folder.glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1]))
    problems = total = 0
    for path in files:
        if not path.is_file():
            print(f"{path.relative_to(ROOT)}: no existe")
            problems += 1
            continue
        for head, block, mask in topics(path.read_text(encoding="utf-8")):
            total += 1
            missing = audit_topic(block, mask)
            if missing:
                problems += 1
                print(f"{path.relative_to(ROOT)} Tema {head.group(1)}: " + "; ".join(missing))
    if total == 0:
        print("audit_topic_standard_v3: no hay temas v3 que auditar")
        return 1
    print(f"audit_topic_standard_v3: {total - problems}/{total} temas cumplen las 12 partes ({args.track})")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
