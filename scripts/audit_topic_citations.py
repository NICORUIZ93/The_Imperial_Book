#!/usr/bin/env python3
"""Audita las citas numéricas entre temas (specs/005, regla nueva).

Una cabecera `### Tema N:` se renumera al reordenar un capítulo, pero la prosa que rodea
ese bloque sigue citando los números viejos. Este auditor busca cada cita con alcance claro
dentro de un tema y comprueba dónde apunta:

Los formatos que resuelve:

  * `… de este módulo`                       → el capítulo actual;
  * `… del Módulo 7` / `Módulo 7, Tema 2`    → el capítulo 7 del mismo curso;
  * `Ver Tema 2` (filas de las tablas)       → el capítulo actual;
  * `M3 T1` / `Java M19 Tema 1` (abreviatura de curso) → el capítulo 3 y el 19 del mismo curso;
  * sin cualificar (`Tema 5` a secas)        → no se juzga: puede ser de otro curso.

Tres reglas duras, que hacen fallar la puerta:

  1. **existe** — el número citado tiene que ser un tema real del capítulo alcanzado;
  2. **no auto-citarse** — un `Prerrequisito: Tema 5 de este módulo` escrito dentro del
     Tema 5 se señala a sí mismo (caso real en `javascript/11`);
  3. **hacia atrás** — en frase de prerrequisito (`Prerrequisito(s)`, `Requisitos previos`,
     `Conocimiento previo`, `requiere`, `necesitas`, `después del`, `completados`) el tema
     citado tiene que ser anterior al que cita.

Una cita que mira hacia adelante fuera de esas frases («resuelve el problema del Tema 2»)
se imprime como nota: el autor a veces avisa de lo que viene después, así que no bloquea.
`--strict` sí la cuenta como fallo.

  python3 scripts/audit_topic_citations.py             # informe
  python3 scripts/audit_topic_citations.py --check     # puerta de validate.sh
  python3 scripts/audit_topic_citations.py --strict    # también fallan las notas
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
SKIPPED_GROUPS = {"lecciones", "oficial-es"}
TOPIC_HEAD = re.compile(r"^### Tema (\d+)([^:\n]*):", re.M)
SECTION_HEAD = re.compile(r"^## \S", re.M)
CITATION = re.compile(
    r"Temas?\s+(\d+)"                       # 1: número
    r"(?:\s*[–-]\s*(\d+)|\s+y\s+(\d+))?"     # 2 y 3: rango o par
    r"([^.\n]{0,70})",                      # 4: lo que sigue, hasta el fin de frase
    re.IGNORECASE,
)
# La frase propia de la cita se corta en el primer `)`, `;` o `·`: sin ese corte,
# «(Módulo 10, Tema 3 de este track); Tema 2 de este módulo» prestaba su alcance a la cita
# equivocada y el auditor inventaba un prerrequisito roto donde no lo había.
CUT = re.compile(r"[);·]", re.IGNORECASE)
THIS = re.compile(r"de este m[óo]dulo", re.IGNORECASE)
THAT = re.compile(r"(?:del|en el|en|de)\s*M[óo]dulo\s*(\d+)|M[óo]dulo\s*(\d+)\s*,", re.IGNORECASE)
# «Prerrequisitos: Módulo 12, Tema 4» — el alcance va antes del número que después.
BEFORE = re.compile(r"M[óo]dulo\s*(\d+)\s*[,.]?\s*$", re.IGNORECASE)
# Las tablas de cierre dicen `| 3 | Validar el alta | Ver Tema 4 |`: el número es del capítulo.
# `Temas?` ya lo aporta la cita, así que aquí solo queda el verbo y su artículo.
SEE = re.compile(r"\b(?:Ver|Mira|Revisa)\s+(?:los|las|el|la)?\s*$", re.IGNORECASE)
# Abreviatura de curso: `M3 T1`, `Java M19 Tema 1`, `M0 T1–T3`, `M20 Temas 9–10`.
# El grupo 1 es el capítulo; el 2 el primer tema; el 3 arrastra el resto del rango o del par.
SHORT = re.compile(
    r"\bM(\d{1,2})\s*T(?:emas?|ema)?\s*(\d{1,2})"
    r"((?:\s*[–-]\s*(?:T(?:emas?|ema)?\s*)?\d+|\s+y\s*(?:T(?:emas?|ema)?\s*)?\d+)*)",
    re.IGNORECASE,
)
SHORT_TAIL = re.compile(r"\d+")
PREREQ = re.compile(
    r"prerrequisitos?|requisitos previos|conocimiento previo|requiere|necesitas|"
    r"despu[ée]s del|completados",
    re.IGNORECASE,
)


def chapters() -> dict[str, dict[int, list[int]]]:
    """Números de tema reales, por curso y capítulo."""
    out: dict[str, dict[int, list[int]]] = {}
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        if path.parent.name in SKIPPED_GROUPS:
            continue
        text = path.read_text(encoding="utf-8")
        out.setdefault(path.parent.name, {})[int(path.stem.split("-")[1])] = [
            int(m.group(1)) for m in TOPIC_HEAD.finditer(text)
        ]
    return out


def marks(text: str) -> list[tuple[int, int | None]]:
    """Cortes (offset, tema vigente). Después de un `## ` ya no se está dentro de un tema."""
    points = [(m.start(), int(m.group(1))) for m in TOPIC_HEAD.finditer(text)]
    points += [(m.start(), None) for m in SECTION_HEAD.finditer(text)]
    return sorted(points)


def topic_at(points: list[tuple[int, int | None]], offset: int) -> int | None:
    tema = None
    for start, value in points:
        if start > offset:
            break
        tema = value
    return tema


def sentence_start(text: str, offset: int) -> int:
    return max(text.rfind(". ", 0, offset) + 2, text.rfind("\n", 0, offset) + 1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()

    index = chapters()
    errors: list[str] = []
    notes: list[str] = []
    total = 0

    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        track = path.parent.name
        if track in SKIPPED_GROUPS:
            continue
        module = int(path.stem.split("-")[1])
        text = path.read_text(encoding="utf-8")
        points = marks(text)
        shorts = [(m.start(), m.end(), int(m.group(1)),
                   [int(m.group(2))] + [int(n) for n in SHORT_TAIL.findall(m.group(3))])
                  for m in SHORT.finditer(text)]
        for m in CITATION.finditer(text):
            if any(start <= m.start() < end for start, end, _, _ in shorts):
                continue  # `Java M19 Tema 1` ya la juzgó la abreviatura
            window = m.group(4)
            cut = CUT.search(window)
            if cut:
                window = window[: cut.start()]
            numbers = [int(m.group(1))] + [int(g) for g in (m.group(2), m.group(3)) if g]
            here = THIS.search(window)
            there = THAT.search(window)
            if there and (not here or there.start() < here.start()):
                other = int(there.group(1) or there.group(2))
                if other not in index.get(track, {}):
                    # Capítulo que no existe en el curso: se salta. Que un `del Módulo 99`
                    # apunté a la nada también habría que juzgarlo, pero hoy no lo hace nadie.
                    continue
                scope, kind = index[track][other], f"Módulo {other}"
            elif here:
                scope, kind = index[track][module], "este módulo"
            elif SEE.search(text[max(0, m.start() - 12): m.start()]):
                scope, kind = index[track][module], "Ver Tema"
            else:
                pre = BEFORE.search(text[max(0, m.start() - 40): m.start()])
                if not pre:
                    continue  # sin alcance: puede ser de otro curso
                other = int(pre.group(1))
                if other not in index.get(track, {}):
                    continue
                scope, kind = index[track][other], f"Módulo {other}"
            tema = topic_at(points, m.start())
            line = text.count("\n", 0, m.start()) + 1
            where = f"{track}/{module} tema {tema} línea {line}"
            for n in numbers:
                total += 1
                if n not in scope:
                    errors.append(
                        f"{where}: cita el Tema {n} de {kind}, que no existe "
                        f"(están los números {sorted(scope)})"
                    )
                elif kind != "este módulo" or tema is None:
                    continue
                else:
                    phrase = text[sentence_start(text, m.start()):m.end() + 20]
                    if PREREQ.search(phrase) and n >= tema:
                        errors.append(f"{where}: prerrequisito que no es anterior (Tema {n})")
                    elif n > tema:
                        notes.append(f"{where}: cita hacia adelante, admisible si avisa "
                                     f"(Tema {n} > tema {tema})")

        for start, _, other, numbers in shorts:
            if other not in index.get(track, {}):
                continue
            scope, kind = index[track][other], f"Módulo {other}"
            if other == module:
                scope, kind = index[track][module], "este módulo"
            tema = topic_at(points, start)
            line = text.count("\n", 0, start) + 1
            where = f"{track}/{module} tema {tema} línea {line}"
            phrase = text[sentence_start(text, start):start + 120]
            for n in numbers:
                total += 1
                if n not in scope:
                    errors.append(
                        f"{where}: la abreviatura cita el Tema {n} de {kind}, que no existe "
                        f"(están los números {sorted(scope)})"
                    )
                elif kind != "este módulo" or tema is None:
                    continue
                elif PREREQ.search(phrase) and n >= tema:
                    errors.append(f"{where}: prerrequisito abreviado que no es anterior (Tema {n})")

    print(f"audit_topic_citations: {total} citas numéricas en "
          f"{sum(len(v) for v in index.values())} capítulos — "
          f"{'al día' if not errors else str(len(errors)) + ' citas rotas'}, "
          f"{len(notes)} notas")
    for row in errors:
        print(f"  error: {row}")
    if not args.check or args.strict:
        for row in notes:
            print(f"  nota: {row}")
    if errors:
        return 1
    return 1 if (args.strict and notes) else 0


if __name__ == "__main__":
    sys.exit(main())
