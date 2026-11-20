#!/usr/bin/env python3
"""Genera web/src/app/tracks/microservices.track.ts desde docs/microservicios/track/modulo-N.json (specs/018).

Solo se publican los módulos que tienen su JSON y su lección `modulo-N.md`. Cada JSON tiene:
{"id": 5, "title": "...", "shortTitle": "...", "level": "Fundamentos|Intermedio|Avanzado|Experto",
 "duration": "12 h", "color": "#0f766e", "description": "...", "concepts": [...], "practice": [...],
 "questions": [...], "tools": [...], "deliverable": "..."}

Uso: python3 scripts/build_microservices_track.py [--check]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FUENTE = ROOT / "docs/microservicios/track"
CONTENIDO = ROOT / "web/public/content/microservices"
DESTINO = ROOT / "web/src/app/tracks/microservices.track.ts"
CAMPOS = ["id", "title", "shortTitle", "level", "duration", "color", "description",
          "concepts", "practice", "questions", "tools", "deliverable"]


def ts(valor) -> str:
    return json.dumps(valor, ensure_ascii=False).replace("'", "\\'")


def generar() -> str:
    modulos = []
    for ruta in sorted(FUENTE.glob("modulo-*.json"), key=lambda p: int(p.stem.split("-")[1])):
        datos = json.loads(ruta.read_text())
        faltan = [c for c in CAMPOS if c not in datos]
        if faltan:
            sys.exit(f"{ruta}: faltan {faltan}")
        if not (CONTENIDO / f"modulo-{datos['id']}.md").exists():
            continue
        args = ",\n    ".join(ts(datos[c]) for c in CAMPOS)
        modulos.append(f"  m(\n    {args}),")
    cuerpo = "\n".join(modulos)
    return (
        "import { CourseModule, createModule as m } from '../course-module.model';\n\n"
        "/** Generado por scripts/build_microservices_track.py desde docs/microservicios/track (specs/018). No editar a mano. */\n"
        f"export const MICROSERVICES_MODULES: CourseModule[] = [\n{cuerpo}\n];\n"
    )


def main() -> int:
    nuevo = generar()
    if "--check" in sys.argv:
        if DESTINO.read_text() != nuevo:
            print("microservices.track.ts no coincide con docs/microservicios/track; ejecuta el script.")
            return 1
        print("microservices.track.ts al día")
        return 0
    DESTINO.write_text(nuevo)
    print(f"escrito {DESTINO.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
