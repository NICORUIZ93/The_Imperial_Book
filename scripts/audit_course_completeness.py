#!/usr/bin/env python3
"""Audita que cada curso sea un programa completo, no un par de capítulos sueltos (specs/013).

Cuatro reglas objetivas, medidas sobre el contenido y sobre el registro de cada ruta:

  1. paridad — cada capítulo registrado en el track tiene su `modulo-N.md`, y ningún archivo
     queda fuera del registro (un archivo sin registrar es un capítulo invisible para el lector);
  2. etapas — un curso recorre las cuatro etapas del programa: Fundamentos, Aplicación,
     Integración y Experto. Medido el 2026-11-19: 15 de los 16 cursos ya las cubrían los cuatro,
     así que la regla no inventa un mínimo, escribe el acuerdo del programa y señala la
     única excepción;
  3. capítulo Master — `docs/requested-master-topics.json` no puede declarar como visible
     (`visible-and-assessed`) un capítulo cuyo archivo ya no existe;
  4. anclas internas — todo enlace `](#fragmento)` resuelve contra un encabezado del mismo
     archivo, calculando el id tal como lo calcula el lector: sin diacríticos y sin el sufijo
     ` · Nivel · XX min` de las cabeceras de tema.

Los cursos con una regla incumplida y dejada así a propósito se declaran en
`docs/course-completeness-exceptions.json`, con su motivo. `--check` falla si un curso incumple
sin declararlo, y también si una declaración deja de aplicarse (deuda rancia).

  python3 scripts/audit_course_completeness.py            # informe
  python3 scripts/audit_course_completeness.py --check    # puerta de validate.sh
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
DATA = ROOT / "web" / "src" / "app" / "course-data.ts"
TRACKS = ROOT / "web" / "src" / "app" / "tracks"
REGISTRY = ROOT / "docs" / "requested-master-topics.json"
EXCEPTIONS = ROOT / "docs" / "course-completeness-exceptions.json"

ETAPAS = ("Fundamentos", "Aplicación", "Integración", "Experto")
TOPIC_HEAD = re.compile(r"^### Tema \d+:[^\n]*", re.M)
LEVEL_SUFFIX = re.compile(r"\s*[·•]\s*(Básico|Intermedio|Avanzado|Experto)\s*[·•]\s*\d+\s*min\s*$")


def slugify(text: str) -> str:
    """El mismo id que produce `web/src/app/course/lesson-viewer.ts` para un encabezado."""
    decomposed = unicodedata.normalize("NFD", text)
    stripped = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    base = re.sub(r"[^a-z0-9]+", "-", stripped.lower()).strip("-")
    return base or "seccion"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def array_body(source: str, symbol: str) -> str:
    """Devuelve el texto del array asignado a `symbol`, emparejendo corchetes."""
    start = source.find(symbol)
    if start < 0:
        raise SystemExit(f"no encuentro el array {symbol} en {DATA.relative_to(ROOT)}")
    # el primer `[` tras el nombre puede ser el del tipo (`CourseModule[]`): se busca tras el `=`
    assign = source.index("=", source.index(symbol, start) + len(symbol))
    open_at = source.index("[", assign)
    depth = 0
    for i in range(open_at, len(source)):
        if source[i] == "[":
            depth += 1
        elif source[i] == "]":
            depth -= 1
            if depth == 0:
                return source[open_at:i + 1]
    raise SystemExit(f"el array {symbol} no cierra")


def call_args(call: str) -> list[str]:
    """Args escalares de un `m(...)`: números y strings de primer nivel (los arrays cuentan como uno)."""
    args, buf, quote, depth = [], "", None, 0
    for ch in call:
        if quote:
            if ch == quote:
                quote = None
            buf += ch
            continue
        if ch in "'\"":
            quote = ch
            buf += ch
            continue
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch == "," and depth == 0:
            args.append(buf.strip())
            buf = ""
            continue
        buf += ch
    if buf.strip():
        args.append(buf.strip())
    return args


def calls(body: str) -> list[list[str]]:
    out, i = [], 0
    while True:
        j = body.find("m(", i)
        if j < 0:
            return out
        depth, k = 0, j + 1
        while k < len(body):
            if body[k] == "(":
                depth += 1
            elif body[k] == ")":
                depth -= 1
                if depth == 0:
                    break
            k += 1
        out.append(call_args(body[j + 2:k]))
        i = k + 1


def unquote(value: str) -> str:
    return value.strip().strip("'\"")


def registered_modules(course: str, data_source: str) -> list[tuple[int, str]]:
    """(número de capítulo, etapa) tal como los registra la aplicación."""
    row = re.search(r"\{ id: '%s',.*?modules: (\w+)" % re.escape(course), data_source, re.S)
    if not row:
        raise SystemExit(f"{course}: no tiene filas con `modules:` en course-data.ts")
    symbol = row.group(1)
    source = data_source
    if symbol != "COURSE_MODULES":
        path = TRACKS / f"{symbol.replace('_MODULES', '').lower()}.track.ts"
        if not path.is_file():
            path = next((p for p in sorted(TRACKS.glob("*.track.ts"))
                         if f"export const {symbol}" in read(p)), None)
            if path is None:
                raise SystemExit(f"{course}: no encuentro el archivo que define {symbol}")
        source = read(path)
    out = []
    for args in calls(array_body(source, symbol)):
        if len(args) < 4:
            raise SystemExit(f"{course}: un capítulo registrado con {len(args)} argumentos, no sé leerlo")
        etapa = unquote(args[3])
        if etapa not in ETAPAS:
            raise SystemExit(f"{course}: etapa desconocida {etapa!r} en el capítulo {unquote(args[0])}")
        out.append((int(unquote(args[0])), etapa))
    return out


def headings_of(path: Path) -> set[str]:
    ids, seen = set(), set()
    for line in read(path).splitlines():
        match = re.match(r"^#{2,6} (.+)$", line)
        if not match:
            continue
        base = slugify(LEVEL_SUFFIX.sub("", match.group(1)))
        slug, n = base, 2
        while slug in seen:
            slug = f"{base}-{n}"
            n += 1
        seen.add(slug)
        ids.add(slug)
    return ids


def measure() -> list[dict]:
    data_source = read(DATA)
    index = json.loads(read(CONTENT / "topic-index.json"))
    registry = json.loads(read(REGISTRY))["tracks"]
    rows = []
    for course in sorted(index):
        modules_dir = CONTENT / course
        files = sorted(int(p.stem.split("-")[1]) for p in modules_dir.glob("modulo-*.md"))
        registered = registered_modules(course, data_source)
        ghost_registered = [n for n, _ in registered if n not in files]
        orphan_files = [n for n in files if n not in {r for r, _ in registered}]
        etapas = {e for _, e in registered}
        missing_etapas = [e for e in ETAPAS if e not in etapas]
        master = next((t for t in registry if t["track"] == course), None)
        master_ghost = bool(master and master["status"] == "visible-and-assessed"
                            and str(master["module"]) not in index[course])
        dead_anchors = []
        for path in sorted(modules_dir.glob("modulo-*.md")):
            ids = headings_of(path)
            for match in re.finditer(r"\]\(#([^)]+)\)", read(path)):
                if match.group(1) not in ids:
                    dead_anchors.append(f"{path.name} #{match.group(1)}")
        topics = sum(len(v) for v in index[course].values())
        rows.append({
            "track": course,
            "chapters": len(files),
            "topics": topics,
            "etapas": sorted(etapas),
            "missingEtapas": missing_etapas,
            "ghostRegistered": ghost_registered,
            "orphanFiles": orphan_files,
            "masterGhost": master_ghost,
            "deadAnchors": dead_anchors,
        })
    return rows


def failures(rows: list[dict], declared: dict[str, dict]) -> list[str]:
    problems = []
    for row in rows:
        course = row["track"]
        entry = declared.get(course, {})
        pending = []
        if row["missingEtapas"]:
            pending.append("etapas sin capítulo: " + ", ".join(row["missingEtapas"]))
        if row["ghostRegistered"]:
            pending.append("capítulos registrados sin archivo: "
                           + ", ".join(str(n) for n in row["ghostRegistered"]))
        if row["orphanFiles"]:
            pending.append("archivos sin registrar en el track: "
                           + ", ".join(str(n) for n in row["orphanFiles"]))
        if row["masterGhost"]:
            pending.append("el registro declara un capítulo Master que no existe")
        if row["deadAnchors"]:
            pending.append("anclas internas rotas: " + ", ".join(row["deadAnchors"]))
        if not pending:
            if entry:
                problems.append(f"{course}: declarado como incompleto en {EXCEPTIONS.name} "
                                f"pero ya no incumple nada (deuda rancia)")
            continue
        reasons = entry.get("motivos", {})
        for gap in pending:
            key = gap.split(":")[0]
            if key not in reasons:
                problems.append(f"{course}: {gap} — sin declarar en {EXCEPTIONS.name}")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rows = measure()
    declared = json.loads(read(EXCEPTIONS))["tracks"] if EXCEPTIONS.is_file() else {}
    declared = {d["track"]: d for d in declared}
    problems = failures(rows, declared)
    print(f"{'curso':22}{'cap':>5}{'temas':>7}  etapas cubiertas")
    for row in rows:
        marks = " ".join(("falt" if e in row["missingEtapas"] else "ok") for e in ETAPAS)
        gap = f"  faltan: {', '.join(row['missingEtapas'])}" if row["missingEtapas"] else ""
        print(f"{row['track']:22}{row['chapters']:5}{row['topics']:7}  {marks}{gap}")
    total = len(rows)
    print(f"TOTAL {total} cursos; "
          f"{sum(1 for r in rows if not r['missingEtapas'])} con las cuatro etapas; "
          f"{sum(1 for r in rows if r['masterGhost'])} capítulos Master fantasma; "
          f"{sum(len(r['deadAnchors']) for r in rows)} anclas rotas")
    if problems:
        print("\nINCIDENCIAS:")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("audit_course_completeness: sin incidencias undeclaradas"
          + (f" ({len(declared)} cursos declarados incompletos)" if declared else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
