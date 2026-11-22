#!/usr/bin/env python3
"""Valida la trazabilidad de las especificaciones en specs/ (SDD).

Cada criterio de un archivo specs/NNN-*.md debe tener:
  - un identificador único dentro del archivo (C1, V2, ...),
  - un estado: pendiente, en-curso, hecho o descartado,
  - una línea "Verificación:" con un comando entre comillas invertidas,
  - y, si el comando cita archivos del repositorio, esos archivos deben existir.

Con --run además ejecuta la verificación de cada criterio en estado "hecho".
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPECS = ROOT / "specs"
STATES = {"pendiente", "en-curso", "hecho", "descartado"}
CRITERION = re.compile(r"^- \*\*([A-Z]\d+)\*\* `([a-z-]+)` — (.+)$")
VERIFY = re.compile(r"^\s+Verificación: `(.+)`\s*$")
# Rutas del repositorio citadas en un comando: scripts/x.py, web/src/..., specs/...
REPO_PATH = re.compile(r"(?<![\w/.-])((?:scripts|specs|web/src|web/public|docs)/[\w./-]+\.\w+)")


@dataclass
class Criterion:
    spec: str
    ident: str
    state: str
    line: int
    command: str | None = None


def parse(spec: Path) -> tuple[list[Criterion], list[str]]:
    """Devuelve los criterios del archivo y los errores de formato encontrados."""
    criteria: list[Criterion] = []
    errors: list[str] = []
    lines = spec.read_text(encoding="utf-8").splitlines()
    for number, text in enumerate(lines, start=1):
        match = CRITERION.match(text)
        if match:
            ident, state, _ = match.groups()
            criteria.append(Criterion(str(spec.relative_to(SPECS)), ident, state, number))
            if state not in STATES:
                errors.append(f"{spec.relative_to(SPECS)}:{number} {ident}: estado desconocido '{state}'")
            continue
        verify = VERIFY.match(text)
        if verify and criteria and criteria[-1].command is None:
            criteria[-1].command = verify.group(1)
    seen: set[str] = set()
    for item in criteria:
        if item.ident in seen:
            errors.append(f"{spec.name}:{item.line} {item.ident}: identificador repetido")
        seen.add(item.ident)
        if item.command is None:
            errors.append(f"{spec.name}:{item.line} {item.ident}: falta la línea 'Verificación:'")
            continue
        for path in REPO_PATH.findall(item.command):
            if "*" not in path and not (ROOT / path).exists():
                errors.append(f"{spec.name}:{item.line} {item.ident}: la verificación cita '{path}', que no existe")
    return criteria, errors


def run(item: Criterion) -> bool:
    """Ejecuta la verificación desde la raíz del repo y devuelve si pasó."""
    try:
        # Cada verificación tiene un límite: una comprobación colgada no puede
        # dejar `--run` esperando indefinidamente (specs/026 C10).
        result = subprocess.run(
            item.command, shell=True, cwd=ROOT, capture_output=True, text=True,
            timeout=300,
        )
    except subprocess.TimeoutExpired:
        print(f"  {item.spec} {item.ident}: FALLA (timeout de 300 s)")
        return False
    status = "ok" if result.returncode == 0 else f"FALLA (código {result.returncode})"
    print(f"  {item.spec} {item.ident}: {status}")
    if result.returncode != 0:
        print((result.stdout + result.stderr).strip()[-1500:])
    return result.returncode == 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--run", action="store_true", help="ejecuta la verificación de los criterios 'hecho'")
    args = parser.parse_args()

    specs = sorted(SPECS.glob("[0-9][0-9][0-9]-*.md")) + sorted((SPECS / "tracks").glob("*.md"))
    if not specs:
        print("validate_specs: no hay archivos specs/NNN-*.md")
        return 1
    all_criteria: list[Criterion] = []
    all_errors: list[str] = []
    for spec in specs:
        criteria, errors = parse(spec)
        if not criteria:
            errors.append(f"{spec.name}: no declara criterios")
        all_criteria += criteria
        all_errors += errors

    counts = {state: sum(1 for c in all_criteria if c.state == state) for state in sorted(STATES)}
    print(f"validate_specs: {len(specs)} specs, {len(all_criteria)} criterios {counts}")
    for error in all_errors:
        print(f"  error: {error}")
    if all_errors:
        return 1
    if args.run:
        failed = [c for c in all_criteria if c.state == "hecho" and not run(c)]
        if failed:
            print(f"validate_specs: {len(failed)} criterio(s) 'hecho' no pasan su verificación")
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
