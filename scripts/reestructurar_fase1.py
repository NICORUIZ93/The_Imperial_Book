#!/usr/bin/env python3
"""Fase 1 de la reestructuración de cursos (docs/REESTRUCTURACION_CURSOS.md).

Mueve módulos entre cursos sin reescribir su contenido:
  * crea los cursos nuevos con módulos que ya existen,
  * une Spring MS y Node MS en un curso «microservicios» con dos rutas,
  * disuelve DevOps (pasa a ser una ruta) y retira RutaFlow,
  * elimina duplicados exactos y fusiona Flutter M18 en M13,
  * renumera, corrige enlaces /curso/<id>/<n> y escribe la tabla de traslado.

Uso:  python3 scripts/reestructurar_fase1.py [--raiz RUTA]
Escribe web/src/app/module-moves-v5.json con la tabla viejo → nuevo.
Compatible con Python 3.10.
"""
import argparse
import json
import re
import shutil
from pathlib import Path

# ── Cursos nuevos: id → (constante TS, archivo) ─────────────────────────────
NUEVOS = {
    "git": "GIT_MODULES",
    "linux": "LINUX_MODULES",
    "sql": "SQL_MODULES",
    "arquitectura": "ARQUITECTURA_MODULES",
    "seguridad": "SEGURIDAD_MODULES",
    "typescript": "TYPESCRIPT_MODULES",
    "kotlin": "KOTLIN_MODULES",
    "docker": "DOCKER_MODULES",
    "kubernetes": "KUBERNETES_MODULES",
    "cicd": "CICD_MODULES",
    "iac": "IAC_MODULES",
    "observabilidad": "OBSERVABILIDAD_MODULES",
    "mensajeria": "MENSAJERIA_MODULES",
    "microservicios": "MICROSERVICIOS_MODULES",
}

SM, NM, SB = "spring-microservices", "node-microservices", "spring-boot"

# Destino → módulos de origen, en el orden en que quedan.
DESTINOS = {
    "git": [("devops", 1)],
    "linux": [("devops", 0), ("devops", 18)],
    "sql": [("foundations", 4)],
    "arquitectura": [("foundations", 7), ("foundations", 10), ("devops", 17), ("devops", 19), ("devops", 21)],
    "seguridad": [("foundations", 6), ("devops", 11)],
    "typescript": [("javascript", 11), ("node", 13)],
    "kotlin": [("android", 0), ("kotlin-multiplatform", 0), ("kotlin-multiplatform", 1), ("kotlin-multiplatform", 2)],
    "docker": [("devops", 2), ("devops", 3), ("cloud", 1)],
    "kubernetes": [("devops", 6), ("devops", 7), ("devops", 15)],
    "cicd": [("devops", 4), ("devops", 5), ("devops", 13), ("devops", 16)],
    "iac": [("devops", 8)],
    "observabilidad": [("devops", 9), ("devops", 10), ("devops", 14)],
    "mensajeria": [("devops", 20), (SM, 10)],
    "microservicios": [
        (SM, 1), (NM, 1), (NM, 2), (SM, 2), (NM, 3), (SM, 3), (SM, 4), (NM, 11),
        (SM, 5), (NM, 5), (SM, 6), (SB, 16), (NM, 4), (NM, 13), (SM, 7), (NM, 6),
        (SM, 8), (NM, 7), (SM, 9), (NM, 8), (NM, 9), (SM, 11), (SB, 17), (SM, 12),
        (NM, 10), (NM, 14), (SM, 13), (NM, 15), (SM, 14), (SM, 15), (NM, 12),
    ],
    # Cursos existentes que reciben módulos al final.
    "cloud": [("devops", 12), ("devops", 22)],
}

ELIMINAR = [(SM, 0), (NM, 0), ("flutter", 19), ("flutter", 20)]
FUSIONAR = {("flutter", 18): ("flutter", 13)}   # se añaden sus temas nuevos al destino
DISUELTOS = ["devops", SM, NM, "rutaflow"]
# Temas duplicados que se quitan (curso, módulo, inicio del encabezado).
TEMAS_A_QUITAR = [
    ("java", 4, "### Tema 5: Las cuatro interfaces funcionales"),
    (SM, 4, "### Tema 6: Mapa del diseño de sistemas"),
]
RUTA_MICRO = {SM: "Ruta Spring", SB: "Ruta Spring", NM: "Ruta Node"}


def leer(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def escribir(p: Path, s: str) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(s, encoding="utf-8")


# ── Entradas m(...) de los archivos de track ────────────────────────────────
def partir_track(texto: str):
    """Devuelve (cabecera, [entradas], pie). Cada entrada empieza en una línea '  m('."""
    lineas = texto.split("\n")
    inicio = next(i for i, l in enumerate(lineas) if re.match(r"\s*m\(", l))
    fin = max(i for i, l in enumerate(lineas) if l.strip().startswith("];"))
    cuerpo = lineas[inicio:fin]
    entradas, actual = [], []
    for l in cuerpo:
        if re.match(r"\s*m\(", l) and actual:
            entradas.append("\n".join(actual))
            actual = []
        actual.append(l)
    if actual:
        entradas.append("\n".join(actual))
    return "\n".join(lineas[:inicio]), entradas, "\n".join(lineas[fin:])


def id_de(entrada: str) -> int:
    return int(re.match(r"\s*m\(\s*(\d+)", entrada).group(1))


def con_id(entrada: str, nuevo: int) -> str:
    return re.sub(r"^(\s*m\(\s*)\d+", lambda m: f"{m.group(1)}{nuevo}", entrada, count=1)


CADENA = r"'(?:[^'\\]|\\.)*'"


def con_prefijo(entrada: str, prefijo: str) -> str:
    """Antepone la ruta al título y al título corto (2.º y 3.er argumento)."""
    corto = prefijo.replace("Ruta ", "")
    patron = r"^(\s*m\(\s*\d+,\s*')((?:[^'\\]|\\.)*'\s*,\s*')"
    return re.sub(patron, lambda m: m.group(1) + prefijo + " · " + m.group(2) + corto + " · ", entrada, count=1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--raiz", default=str(Path(__file__).resolve().parents[1]))
    raiz = Path(ap.parse_args().raiz)
    contenido = raiz / "web/public/content"
    tracks_dir = raiz / "web/src/app/tracks"
    course_data = raiz / "web/src/app/course-data.ts"

    archivo_track = {p.name.replace(".track.ts", ""): p for p in tracks_dir.glob("*.track.ts")}

    # Entradas TS por (curso, módulo). Cloud vive en course-data.ts.
    entradas, partes = {}, {}
    for curso, p in archivo_track.items():
        cab, ents, pie = partir_track(leer(p))
        partes[curso] = (cab, pie)
        for e in ents:
            entradas[(curso, id_de(e))] = e
    cd = leer(course_data)
    a = cd.index("export const COURSE_MODULES")
    b = cd.index("];", a) + 2
    cab_c, ents_c, _ = partir_track(cd[a:b])
    for e in ents_c:
        entradas[("cloud", id_de(e))] = e

    # 1. Quitar temas duplicados.
    for curso, mod, encabezado in TEMAS_A_QUITAR:
        p = contenido / curso / f"modulo-{mod}.md"
        s = leer(p)
        i = s.index(encabezado)
        j = min([k for k in (s.find("\n### ", i + 4), s.find("\n## Cierre", i), s.find("\n## Laboratorio", i)) if k != -1])
        escribir(p, s[:i] + s[j + 1:])

    # 2. Fusión Flutter M18 → M13: los temas de M18 que M13 no tiene se añaden al final.
    for (c1, m1), (c2, m2) in FUSIONAR.items():
        origen = leer(contenido / c1 / f"modulo-{m1}.md")
        destino_p = contenido / c2 / f"modulo-{m2}.md"
        destino = leer(destino_p)
        n_dest = len(re.findall(r"^### Tema", destino, re.M))
        bloques = re.split(r"(?m)^(?=### Tema )", origen)[1:]
        nuevos = bloques[n_dest:]          # T1–T4 de M18 repiten T1–T4 de M13
        extra = "".join(re.sub(r"^### Tema \d+", f"### Tema {n_dest + k + 1}", blq, count=1)
                        for k, blq in enumerate(nuevos))
        escribir(destino_p, destino.rstrip() + "\n\n" + extra)

    # 3. Calcular el mapa viejo → nuevo.
    movidos = {}                     # (curso, mod) → (curso_nuevo, mod_nuevo)
    salen = {(c, m) for lst in DESTINOS.values() for c, m in lst} | set(ELIMINAR) | set(FUSIONAR)
    modulos_de = {}
    for (c, m) in entradas:
        modulos_de.setdefault(c, []).append(m)
    # Cursos que se quedan: renumerar lo que no sale.
    for c, mods in modulos_de.items():
        if c in DISUELTOS:
            continue
        quedan = sorted(m for m in mods if (c, m) not in salen)
        for nuevo, viejo in enumerate(quedan):
            movidos[(c, viejo)] = (c, nuevo)
    for destino, lst in DESTINOS.items():
        base = len([1 for (c, _), (d, _) in movidos.items() if d == destino and c == destino])
        for k, (c, m) in enumerate(lst):
            movidos[(c, m)] = (destino, base + k)
    for k, v in FUSIONAR.items():
        movidos[k] = movidos[v]

    # 4. Copiar archivos a una carpeta temporal y luego reemplazar.
    tmp = contenido.parent / "_content_fase1"
    if tmp.exists():
        shutil.rmtree(tmp)
    for (c, m), (d, n) in movidos.items():
        if (c, m) in FUSIONAR:
            continue
        src = contenido / c / f"modulo-{m}.md"
        s = leer(src)
        s = re.sub(r"^# Módulo \d+", f"# Módulo {n}", s, count=1)
        escribir(tmp / d / f"modulo-{n}.md", s)

    def nuevo_enlace(mt):
        c, m = mt.group(1), int(mt.group(2))
        d, n = movidos.get((c, m), (c, m))
        return f"/curso/{d}/{n}"

    for p in tmp.rglob("*.md"):
        escribir(p, re.sub(r"/curso/([a-z0-9-]+)/(\d+)", nuevo_enlace, leer(p)))

    cursos_afectados = {c for c, _ in movidos} | {d for d, _ in movidos.values()} | set(DISUELTOS)
    for c in cursos_afectados:
        carpeta = contenido / c
        if carpeta.exists():
            for f in carpeta.glob("modulo-*.md"):
                f.unlink()
    for c in DISUELTOS:
        carpeta = contenido / c
        if carpeta.exists():
            shutil.rmtree(carpeta)
    for p in tmp.rglob("*.md"):
        dest = contenido / p.relative_to(tmp)
        escribir(dest, leer(p))
    shutil.rmtree(tmp)

    # 5. Reescribir los archivos de track.
    por_destino = {}
    for (c, m), (d, n) in movidos.items():
        if (c, m) in FUSIONAR:
            continue
        e = con_id(entradas[(c, m)], n)
        if d == "microservicios":
            e = con_prefijo(e, RUTA_MICRO[c])
        por_destino.setdefault(d, []).append((n, e))
    for d, lst in por_destino.items():
        cuerpo = "\n".join(e for _, e in sorted(lst))
        if d == "cloud":
            cd = cd[:a] + f"{cab_c}\n{cuerpo}\n];" + cd[b:]
            continue
        if d in archivo_track:
            cab, pie = partes[d]
            escribir(archivo_track[d], f"{cab}\n{cuerpo}\n{pie}")
        else:
            const = NUEVOS[d]
            escribir(tracks_dir / f"{d}.track.ts",
                     "import { CourseModule, createModule as m } from '../course-module.model';\n\n"
                     f"export const {const}: CourseModule[] = [\n{cuerpo}\n];\n")
    escribir(course_data, cd)
    for c in DISUELTOS:
        if c in archivo_track:
            archivo_track[c].unlink()

    tabla = sorted(([c, m, d, n] for (c, m), (d, n) in movidos.items() if (c, m) != (d, n)), key=lambda x: (x[0], x[1]))
    escribir(raiz / "web/src/app/module-moves-v5.json", json.dumps(
        {"eliminados": [list(x) for x in ELIMINAR], "fusionados": [[*k, *v] for k, v in FUSIONAR.items()], "movidos": tabla},
        ensure_ascii=False, indent=1))
    print(f"módulos trasladados o renumerados: {len(tabla)} · eliminados: {len(ELIMINAR)} · fusionados: {len(FUSIONAR)}")
    for d in sorted(por_destino):
        print(f"  {d}: {len(por_destino[d])} módulos")


if __name__ == "__main__":
    main()
