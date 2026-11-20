#!/usr/bin/env python3
"""Auditoría mecánica de TODOS los temas contra la plantilla del estado final (specs/013, Parte 2).

Para cada tema (### Tema N) de cada web/public/content/<curso>/modulo-N.md mide ocho elementos:
objetivos, motivación, analogía, código con resultado esperado, análisis paso a paso, errores comunes,
resumen y ejercicios con solución. Es una medición de presencia por marcadores, no de calidad: un tema
que la pasa puede estar mal escrito, y la revisión humana sigue siendo obligatoria.

Uso: python3 scripts/audit_plantilla.py [--json salida.json] [--curso java]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
TOPIC = re.compile(r"^### Tema \d+[:.]", re.M)
FENCE = re.compile(r"^```([\w+-]*)\s*$", re.M)

CHECKS = {
    "objetivos": r"al (?:finalizar|terminar)\s*,?\s*(?:vas a|podr[aá]s)|objetivo|qu[eé] podr[aá]s hacer",
    "motivacion": r"por qu[eé] (es importante|importa)|contexto y caso real|caso real",
    "analogia": r"analog[ií]a|modelo mental",
    "codigo_y_resultado": None,  # se calcula aparte
    # El formato de la casa explica el código en el Paso 3 (teoría, conceptos clave, mapa de
    # subtemas) y en bloques como «Explicación del mecanismo», no solo con la frase «paso a paso».
    "analisis": (r"explicaci[oó]n (causal|por bloques|l[ií]nea|del mecanismo|de c[oó]digo|de cada)"
                 r"|conceptos clave|mapa de subtemas|modelo mental|desglose|paso a paso"
                 r"|qu[eé] hace cada|c[oó]digo comentado|an[aá]lisis|línea \d"),
    "errores_comunes": r"errores? comunes|fallo deliberado|error esperado|diagn[oó]stico",
    "resumen": r"resumen|cierre|checklist|lo que aprendiste|en una frase",
    "ejercicios_con_solucion": None,  # se calcula aparte
}


def split_topics(text: str) -> list[tuple[str, str]]:
    marks = [m.start() for m in TOPIC.finditer(text)] + [len(text)]
    out = []
    for a, b in zip(marks, marks[1:]):
        body = text[a:b]
        out.append((body.splitlines()[0].strip(), body))
    return out


def audit_topic(body: str) -> dict[str, bool]:
    low = body.lower()
    res = {k: bool(re.search(p, low)) for k, p in CHECKS.items() if p}
    langs = FENCE.findall(body)
    code_blocks = [l for l in langs[::2]]  # cada bloque abre y cierra
    has_code = any(l not in ("", "text", "mermaid", "markdown") for l in code_blocks)
    res["codigo_y_resultado"] = has_code and bool(re.search(
        r"esperad[oa]|deber[ií]as ver|ver[aá]s|la (salida|consola|respuesta) (muestra|imprime|devuelve|dice)", low))
    has_ex = bool(re.search(r"ejercicio|pr[aá]ctica (guiada|independiente)|reto", low))
    has_sol = bool(re.search(r"<details|soluci[oó]n", low))
    res["ejercicios_con_solucion"] = has_ex and has_sol
    return res


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    ap.add_argument("--curso")
    args = ap.parse_args()
    filas = []
    for md in sorted(CONTENT.glob("*/modulo-*.md"), key=lambda p: (p.parent.name, int(p.stem.split("-")[1]))):
        curso = md.parent.name
        if args.curso and curso != args.curso:
            continue
        for titulo, body in split_topics(md.read_text(encoding="utf-8")):
            r = audit_topic(body)
            filas.append({"curso": curso, "modulo": int(md.stem.split("-")[1]), "tema": titulo,
                          "lineas": body.count("\n"), **r, "cumple": all(r.values())})
    por_curso: dict[str, list] = defaultdict(list)
    for f in filas:
        por_curso[f["curso"]].append(f)
    print(f"{'curso':22} {'temas':>5} {'cumplen':>7}  faltas más frecuentes")
    for curso, fs in por_curso.items():
        faltas = defaultdict(int)
        for f in fs:
            for k in CHECKS:
                if not f[k]:
                    faltas[k] += 1
        top = ", ".join(f"{k} {v}" for k, v in sorted(faltas.items(), key=lambda x: -x[1])[:3])
        print(f"{curso:22} {len(fs):5} {sum(f['cumple'] for f in fs):7}  {top}")
    total = len(filas)
    print(f"TOTAL {total} temas; cumplen los 8 elementos: {sum(f['cumple'] for f in filas)}")
    if args.json:
        Path(args.json).write_text(json.dumps(filas, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
