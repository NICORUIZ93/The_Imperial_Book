#!/usr/bin/env python3
"""Mide cuántos temas cumplen la plantilla académica única (docs/PLANTILLA_CURSO.md).

Modo informe por defecto. Los cursos listados en BLOQUEANTES fallan la validación
si algún tema no cumple; se agregan a medida que se migran.
Uso: python3 scripts/audit_template.py [--detalle CURSO]
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
BLOQUEANTES: set[str] = {"foundations"}

BLOQUES = [
    ("objetivos", r"^#### Objetivos\s*$"),
    ("conceptos clave", r"^\*\*Conceptos clave:\*\*"),
    ("el problema", r"^#### El problema\s*$"),
    ("glosario", r"^#### Glosario del tema\s*$"),
    ("cómo funciona", r"^#### ► CÓMO FUNCIONA\s*$"),
    ("problema resuelto", r"^#### Problema resuelto \d"),
    ("error común", r"^> \*\*Error común\.\*\*"),
    ("checkpoint", r"^#### Checkpoint \d"),
    ("laboratorio", r"^#### Paso \d"),
    ("resumen", r"^#### Resumen\s*$"),
    ("ejercicio verificable", r"^#### Ejercicio verificable \d"),
    ("en el trabajo", r"^#### En el trabajo\s*$"),
]
PROHIBIDO = [
    r"/tmp/opencode", r"Resuelve un problema real de diseño o implementación",
    r"te permite tomar mejores decisiones técnicas", r"con foco en comprensión antes de implementación",
    r"como una herramienta de taller", r"No hay visual aprobado",
]
CAMPOS_FICHA = ["Definición técnica", "En palabras sencillas", "Dónde se rompe la comparación", "Ejemplo", "Error típico"]


def normalizar(termino: str) -> str:
    return re.sub(r"[`*()]", "", termino).strip().lower()


def fichas(tema: str) -> dict[str, list[str]]:
    resultado: dict[str, list[str]] = {}
    for m in re.finditer(r"^\*\*([^*\n]+)\*\*\n((?:- \*\*[^*]+:\*\*.*\n?)+)", tema, re.M):
        campos = re.findall(r"^- \*\*([^*]+):\*\*", m.group(2), re.M)
        resultado[normalizar(m.group(1))] = campos
    return resultado


def revisar(tema: str) -> list[str]:
    faltas = [nombre for nombre, patron in BLOQUES if not re.search(patron, tema, re.M)]
    conceptos = re.search(r"^\*\*Conceptos clave:\*\*(.+)$", tema, re.M)
    definidas = fichas(tema)
    if conceptos:
        for termino in [t for t in (normalizar(x) for x in conceptos.group(1).split(",")) if t]:
            ficha = next((campos for nombre, campos in definidas.items() if termino == nombre
                          or nombre.startswith(termino + " ")
                          or termino in [p.strip() for p in re.split(r",|\s+e\s+|\s+y\s+", nombre)]), None)
            if ficha is None:
                faltas.append(f"sin ficha: {termino}")
            elif any(c not in ficha for c in CAMPOS_FICHA):
                faltas.append(f"ficha incompleta: {termino}")
    faltas += [f"texto prohibido: {p}" for p in PROHIBIDO if re.search(p, tema)]
    return faltas


def main() -> int:
    detalle = sys.argv[sys.argv.index("--detalle") + 1] if "--detalle" in sys.argv else None
    errores = 0
    total_ok = total = 0
    for curso in sorted(p for p in CONTENT.iterdir() if p.is_dir() and list(p.glob("modulo-*.md"))):
        ok = n = 0
        for archivo in sorted(curso.glob("modulo-*.md"), key=lambda p: int(re.search(r"\d+", p.name).group())):
            texto = archivo.read_text(encoding="utf-8")
            for tema in re.split(r"(?m)^(?=### Tema \d)", texto)[1:]:
                n += 1
                faltas = revisar(tema)
                if not faltas:
                    ok += 1
                elif detalle == curso.name:
                    titulo = tema.split("\n", 1)[0][4:70]
                    print(f"  {archivo.name} · {titulo}: {', '.join(faltas[:6])}{' …' if len(faltas) > 6 else ''}")
                if faltas and curso.name in BLOQUEANTES:
                    errores += 1
        total_ok += ok
        total += n
        print(f"plantilla {curso.name}: {ok}/{n} temas cumplen")
    print(f"plantilla total: {total_ok}/{total} temas cumplen")
    return 1 if errores else 0


if __name__ == "__main__":
    raise SystemExit(main())
