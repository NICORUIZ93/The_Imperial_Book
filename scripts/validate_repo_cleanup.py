#!/usr/bin/env python3
"""Comprueba la limpieza de specs/009: lo movido a la rama `archivo` ya no está y nadie lo cita.

Las specs quedan fuera de la búsqueda porque registran la historia de lo que se movió.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOVED = [
    "docs/book-curriculum-inventory.json",
    "docs/listado-maestro-temas-libros.md",
    "docs/temario-total-libros-por-stack.md",
    "docs/mapa-integracion-temas-libros.md",
    "scripts/extract_book_curriculum.py",
    "scripts/build_total_book_topics.py",
    "docs/app-flow-inspection-dedup.json",
    "docs/app-flow-inspection-devops.json",
    "docs/app-flow-inspection-evidence.json",
    "docs/app-flow-inspection-order.json",
    "docs/app-flow-inspection-relocate.json",
    "docs/archivo",
    "docs/INVENTARIO-CURSOS-TEMAS-SUBTEMAS.md",
    "docs/temas-inventario.md",
    "docs/java-m2-technical-review.md",
    "docs/java-m3-technical-review.md",
    "docs/java-m4-technical-review.md",
    "docs/quality-metrics.md",
    "docs/revision-por-curso.md",
    "docs/biblioteca-externa-gaps.md",
    "scripts/dedupe_example_code.py",
    "scripts/merge_duplicate_sections.py",
    "scripts/relocate_tail_to_theory.py",
    "scripts/prepare_study_diagram.py",
    "scripts/audit_full.py",
    "examples/cloud-http",
    "examples/flutter-testing",
    "examples/ios-lab",
    "examples/archify/temas/devops/modulo-19-tema-2-contextos.html",
    "web/public/assets/cloud-local-learning-lab.png",
]
SKIP_PREFIXES = ("specs/", "docs/repo-graph.", "scripts/validate_repo_cleanup.py", "CHANGELOG.md")
TEXT = (".md", ".py", ".sh", ".ts", ".html", ".json", ".yml", ".yaml", ".js", ".mjs", ".cjs", ".txt")


def main() -> int:
    errors = [f"sigue en el repo: {path}" for path in MOVED if (ROOT / path).exists()]
    tracked = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split()
    for name in tracked:
        if name.startswith(SKIP_PREFIXES) or not name.endswith(TEXT):
            continue
        text = (ROOT / name).read_text(encoding="utf-8", errors="ignore")
        for path in MOVED:
            needle = path if "/" in path.strip("/") else path + "/"
            if needle in text:
                errors.append(f"{name} cita {path}, que se movió a la rama archivo")
    print(f"validate_repo_cleanup: {'ok' if not errors else f'{len(errors)} problema(s)'} ({len(MOVED)} rutas movidas)")
    for error in errors:
        print(f"  {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
