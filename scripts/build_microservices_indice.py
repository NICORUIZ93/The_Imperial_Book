#!/usr/bin/env python3
"""Genera docs/microservicios/04-indice-de-fichas.md a partir del inventario (specs/018).

Una línea por ficha del inventario, con enlace a su módulo y su estado según
scripts/validate_fichas.py: «completa», «incompleta» (existe pero le faltan puntos) o «pendiente».

Uso:
  python3 scripts/build_microservices_indice.py          # escribe el índice
  python3 scripts/build_microservices_indice.py --check  # falla si el índice no está al día
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import validate_fichas as vf  # noqa: E402

SALIDA = vf.ENTREGABLES / "04-indice-de-fichas.md"
FASES = {
    0: "Fase 0 · Fundamentos absolutos",
    1: "Fase 1 · Spring Boot de cero a experto",
    2: "Fase 2 · Node.js de cero a experto",
    3: "Fase 3 · Nivel maestro: arquitectura avanzada",
}


def generar() -> str:
    inventario = json.loads(vf.INVENTARIO.read_text())["fichas"]
    cache: dict[str, list] = {}
    filas: dict[int, list[str]] = {}
    cuenta = {"completa": 0, "incompleta": 0, "pendiente": 0}
    for item in inventario:
        ruta = vf.CONTENT / item["archivo"]
        if item["archivo"] not in cache:
            cache[item["archivo"]] = list(vf.temas(ruta.read_text())) if ruta.exists() else []
        clave = vf.norm(item["tema"])
        cuerpo = next((c for t, c in cache[item["archivo"]] if clave and clave in vf.norm(t)), None)
        if cuerpo is None:
            estado = "pendiente"
        else:
            estado = "completa" if not vf.revisar_ficha(item, cuerpo) else "incompleta"
        cuenta[estado] += 1
        enlace = f"../../web/public/content/microservices/{item['archivo']}"
        filas.setdefault(item["fase"], []).append(
            f"| {item['id']} | {item['etiqueta']} | {item['tema']} | [{item['archivo']}]({enlace}) | {estado} |"
        )
    total = len(inventario)
    partes = [
        "# 4 · Índice de fichas",
        "",
        "> Entregable 4 del prompt del dueño: **una ficha por cada tema del inventario**. Archivo generado por",
        "> `python3 scripts/build_microservices_indice.py` a partir de",
        "> [docs/temarios/microservicios-inventario.json](../temarios/microservicios-inventario.json); no lo",
        "> edites a mano. El estado lo calcula `scripts/validate_fichas.py`: **completa** (cumple los 14 puntos),",
        "> **incompleta** (existe, pero le falta algún punto) o **pendiente** (aún no está escrita).",
        "",
        f"**Resumen:** {total} fichas · {cuenta['completa']} completas · {cuenta['incompleta']} incompletas · "
        f"{cuenta['pendiente']} pendientes.",
    ]
    for fase in sorted(filas):
        partes += [
            "",
            f"## {FASES[fase]}",
            "",
            "| ID | Módulo | Ficha | Archivo | Estado |",
            "|---|---|---|---|---|",
            *filas[fase],
        ]
    return "\n".join(partes) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    texto = generar()
    if a.check:
        if not SALIDA.exists() or SALIDA.read_text() != texto:
            print("04-indice-de-fichas.md no está al día: ejecuta python3 scripts/build_microservices_indice.py")
            return 1
        print("04-indice-de-fichas.md al día")
        return 0
    SALIDA.write_text(texto)
    print(f"Escrito {SALIDA.relative_to(vf.ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
