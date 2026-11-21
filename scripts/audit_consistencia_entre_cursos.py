#!/usr/bin/env python3
"""Audita la CONSISTENCIA ENTRE CURSOS: qué método y qué ayudas visuales usa realmente cada tema.

Las otras puertas miden si un tema cumple una plantilla; esta mide si los 16 cursos usan LA MISMA,
que es la queja de fondo: «las explicaciones cambian de un curso al otro, se usan metodologías y
formas visuales diferentes, se suponen temas».

Por tema mide (los marcadores se buscan sobre texto plegado sin acentos ni mayúsculas, porque los
.archivos conviven en NFC y cualquier patrón acentuado falla en silencio):

  F familia metodológica: ficha · 7 pasos · Aprende/Practica/Aplica · subtemas 4 · ejercicios · ninguna
  A analogía presente
  D diagrama presente (mermaid, figura, etiqueta «Diagrama» o ASCII de cajas)
  O analogía o diagrama ANTES del primer bloque de código de programa (regla: primero la imagen).
     Se expresa como «% (n)»: el porcentaje se mide solo sobre los n temas que sí tienen código de
     programa; un tema sin código no puede incumplir el orden y queda fuera del denominador.
  T diagrama sin «Texto alternativo»
  P prerrequisito declarado
  R puntero «Módulo N» ambiguo: el archivo modulo-N.md se titula con otro número, así que la cita se
     resuelve distinta según se navegue por la etiqueta visible (barra lateral) o por el id (ruta/URL);
     y puntero huérfano (ese número no lo lleva ningún capítulo del curso). Queda fuera, y no se cuenta,
     la auto-ubicación («Módulo 20, ficha 2» dentro del módulo que se titula 20): es correcta en la UI.

Uso: python3 scripts/audit_consistencia_entre_cursos.py [--curso java] [--csv ruta.csv] [--json ruta.json]
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"


def plegar(t: str) -> str:
    """minúsculas, sin acentos: el único modo de que un patrón ASCII coincida con NFC y NFD a la vez."""
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


FAMILIAS = {
    "ficha": [r"^#### 1\. ubicacion", r"^#### 5\. diagrama tecnico"],
    "7 pasos": [r"^#### paso 1 ?[·.]", r"^#### paso 6 ?[·.]"],
    "Aprende/Practica/Aplica": [r"^#### aprende\b", r"^#### practica\b", r"^#### aplica\b"],
    "subtemas 4": [r"\*\* ?(?:\d\. ?)?contexto ?\*\*", r"\*\* ?(?:\d\. ?)?hazlo tu ?\*\*"],
    "subtemas N.M": [r"^#### subtema ", r"^#### subtema \d\.\d"],
    "ejemplos resueltos": [r"^#### ejemplos resueltos", r"^#### ejemplo \d ?[^0-9a-z]"],
    "ejercicios": [r"^#### verificacion con codigo", r"^#### mas ejemplos resueltos"],
}
ANALOGIA = re.compile(r"^\s*(?:[-*] ?)?\*\*[^*\n]{0,28}analog[^*\n]{0,28}\*\*:?"
                      r"|analog[a-z]+ visual|^#+ [^\n]{0,44}analog|^analog\w* ?:|^haz la analog\w*", re.M)
DIAGRAMA = re.compile(r"```mermaid|!\[|\*\*[^*\n]{0,20}diagrama[^*\n]{0,20}\*\*|diagrama tecnico|^#+ [^\n]{0,30}diagrama", re.M)
CAJAS = re.compile(r"[┌┐└┘├┤┴╔╚═╠╣▲▼→←⇄]")
TEXTO_ALT = re.compile(r"texto alternativo")
PRERREQUISITO = re.compile(r"^\s*(?:[-*] ?)?\*\*[^*\n]{0,24}prerrequisito[^*\n]{0,24}\*\*:?"
                           r"|^#+ ?\d*\.? ?prerrequisitos|^prerrequisitos ?", re.M)
ALIAS = {"spring boot": "spring-boot", "microservicios": "microservices", "microservices": "microservices",
         "fundamentos": "foundations", "foundations": "foundations", "node js": "node", "node": "node",
         "java": "java", "react": "react", "angular": "angular", "devops": "devops", "cloud": "cloud",
         "flutter": "flutter", "ios": "ios", "android": "android", "kotlin multiplatform": "kotlin-multiplatform",
         "kotlin": "kotlin-multiplatform", "javascript": "javascript", "rutaflow": "rutaflow",
         "control 1": "control-1", "control": "control-1"}
# «Spring Boot, Módulo 17» (nombre justo antes, separado por coma o paréntesis) y «Módulo 19 del track
# Cloud» (después de las palabras track/curso). Sin ese anclaje, «una API en node (Módulo 14)» sería
# atribuido al curso Node siendo una referencia del propio curso.
_NOMBRE = r"spring boot|microservicios|microservices|fundamentos|node js|react|angular|devops|" \
          r"cloud|flutter|ios|android|kotlin multiplatform|javascript|rutaflow|control 1"
PUNTERO = re.compile(rf"(?:[\(,;(]\s*(?P<antes>{_NOMBRE})[, ]\s*)?\bmodulos? ?(?P<n>\d{{1,2}})\b"
                     rf"(?:[^.\n]{{0,28}}?track (?P<despues_nombre>{_NOMBRE}))?", re.I)
# «de cualquier forma»: el dato aparece en el tema, pero sin sección con nombre propio.
PREREQ_FORMA = re.compile(r"prerrequisito|\bnecesitas\b|\bhace falta\b|\bvenimos de\b|\bya tienes\b")


def temas_de_curso(curso: str):
    """(id de módulo, título, cuerpo) de cada tema, con el mismo reconocimiento que el índice publicado:
    microservices parte por «### Título»; los demás por «### Tema N»."""
    for path in sorted((CONTENT / curso).glob("modulo-*.md"),
                       key=lambda p: int(re.search(r"(\d+)", p.stem).group(1))):
        texto = plegar(path.read_text(encoding="utf-8"))
        patron = r"^### (.+)$" if curso == "microservices" else r"^### (tema .+)$"
        cortes = list(re.finditer(patron, texto, re.M))
        for i, m in enumerate(cortes):
            fin = cortes[i + 1].start() if i + 1 < len(cortes) else len(texto)
            yield re.search(r"\d+", path.stem).group(0), m.group(1).strip(), texto[m.end():fin]


def familia(cuerpo: str) -> str:
    for nombre, patrones in FAMILIAS.items():
        if all(re.search(p, cuerpo, re.M) for p in patrones):
            return nombre
    return "ninguna"


def ayuda_visual(cuerpo: str):
    """Posiciones de toda ayuda visual (analogía, diagrama etiquetado, mermaid, figura o ASCII de cajas)."""
    return [r.start() for r in ANALOGIA.finditer(cuerpo)] + [r.start() for r in DIAGRAMA.finditer(cuerpo)] \
        + [r.start() for r in CAJAS.finditer(cuerpo)]


# «código de programa o configuración» = cualquier fence cuyo lenguaje NO sea consola ni prosa.
# Es la misma definición que usa scripts/audit_visual_aids.py, para no medir dos cosas distintas.
NO_CODIGO = {"bash", "sh", "shell", "text", "mermaid", "console", "powershell", "output", ""}


def codigo_de_programa(cuerpo: str):
    return next((m.start() for m in re.finditer(r"^```([\w+-]*)", cuerpo, re.M)
                 if m.group(1).lower() not in NO_CODIGO), None)


def hay_diagrama(cuerpo: str) -> bool:
    return bool(DIAGRAMA.search(cuerpo) or CAJAS.search(cuerpo))


def ayuda_antes_del_codigo(cuerpo: str):
    """(¿hay código de programa?, ¿alguna ayuda visual aparece antes?) — sin código no hay nada que medir."""
    code = codigo_de_programa(cuerpo)
    if code is None:
        return False, True
    ayudas = ayuda_visual(cuerpo)
    return True, bool(ayudas) and min(ayudas) < code


def mapas_de_curso(curso: str):
    """(número de archivo → etiqueta visible, etiqueta visible → número de archivo) para un curso."""
    por_id, por_lab = {}, {}
    for path in sorted((CONTENT / curso).glob("modulo-*.md")):
        id_archivo = int(re.search(r"(\d+)", path.stem).group(1))
        lab = re.search(r"^#+ modulo (\d+)(?:\.\d+)?[^0-9a-z]", plegar(path.read_text(encoding="utf-8")), re.M)
        por_id[id_archivo] = int(lab.group(1)) if lab else id_archivo
        if lab:
            por_lab.setdefault(int(lab.group(1)), id_archivo)
    return por_id, por_lab


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--curso")
    ap.add_argument("--json", type=Path)
    ap.add_argument("--csv", type=Path)
    args = ap.parse_args()

    todos = sorted(p.name for p in CONTENT.iterdir() if p.is_dir() and list(p.glob("modulo-*.md"))
                   and p.name not in {"figures", "curriculum-stacks"})
    cursos = [args.curso] if args.curso else todos
    mapas = {c: mapas_de_curso(c) for c in todos}

    filas, por_curso = [], defaultdict(lambda: defaultdict(int))
    for curso in cursos:
        por_id, por_lab = mapas[curso]
        desfase = sum(1 for id_archivo, l in por_id.items() if l != id_archivo)

        for id_mod, titulo, cuerpo in temas_de_curso(curso):
            diag = hay_diagrama(cuerpo)
            analog = bool(ANALOGIA.search(cuerpo))
            con_code, antes = ayuda_antes_del_codigo(cuerpo)
            propio = por_id.get(int(id_mod))
            amb = orf = aut = 0
            for m in PUNTERO.finditer(cuerpo):
                # La barra lateral muestra la etiqueta del H1 («Módulo 20 · Seguridad»), pero la ruta y el
                # enlace son el id (modulo-24.md). Cuando no coinciden, «Módulo N» se resuelve distinto
                # según por dónde se navegue. Una cita nombrada («Spring Boot, Módulo 17») se comprueba
                # en el curso citado, no en el propio. Y «Módulo 20, ficha 2» dentro del módulo que se
                # titula 20 es auto-ubicación, no puntero: contarla como ambigua inflaría la cifra 5×.
                destino = ALIAS.get(m.group("antes") or m.group("despues_nombre"), curso)
                ids, labs = mapas.get(destino, ({}, {}))
                n = int(m.group("n"))
                if destino == curso and n == propio:
                    aut += 1
                elif n not in ids and n not in labs:
                    orf += 1
                elif n not in ids or ids[n] != n:
                    amb += 1
            f = familia(cuerpo)
            filas.append({"curso": curso, "modulo": id_mod, "tema": titulo[:80], "familia": f,
                          "analogia": analog, "diagrama": diag,
                          "con_codigo_de_programa": con_code, "ayuda_antes_codigo": con_code and antes,
                          "diagrama_sin_alt": diag and not TEXTO_ALT.search(cuerpo),
                          "prerequisito": bool(PRERREQUISITO.search(cuerpo)),
                          "prereq_en_cualquier_forma": bool(PREREQ_FORMA.search(cuerpo)),
                          "punteros_ambiguos": amb, "punteros_huerfanos": orf,
                          "punteros_autoreferencia": aut})
            est = por_curso[curso]
            for k, v in (("temas", 1), (f, 1), ("analogia", analog), ("diagrama", diag),
                         ("con_codigo_de_programa", con_code), ("ayuda_antes_codigo", con_code and antes),
                         ("diagrama_sin_alt", filas[-1]["diagrama_sin_alt"]),
                         ("prerequisito", filas[-1]["prerequisito"]),
                         ("prereq_en_cualquier_forma", filas[-1]["prereq_en_cualquier_forma"]),
                         ("punteros_ambiguos", amb), ("punteros_huerfanos", orf), ("modulos_desfasados", 0)):
                est[k] += int(v)
        por_curso[curso]["modulos_desfasados"] = desfase

    pc = lambda est, k: f"{100 * est[k] // est['temas']:d} %"
    pbase = lambda est, k, base: f"{100 * est[k] // max(1, est[base]):d} %"
    print(f"{'curso':22s} {'temas':>5s} {'met.':>4s} {'mayoritaria':>26s} {'anal':>5s} {'diag':>5s} "
          f"{'antes':>11s} {'sin-alt':>7s} {'prereq':>6s} {'p-forma':>7s} {'amb':>4s} {'orf':>4s} {'desf':>4s}")
    for curso in cursos:
        est = por_curso[curso]
        activas = sorted((f for f in list(FAMILIAS) + ["ninguna"] if est[f]), key=lambda f: -est[f])
        p100 = lambda k: pc(est, k)
        may = f"{activas[0]} {100 * est[activas[0]] // est['temas']}"
        antes = f"{pbase(est, 'ayuda_antes_codigo', 'con_codigo_de_programa')} ({est['con_codigo_de_programa']})"
        print(f"{curso:22s} {est['temas']:5d} {len(activas):4d} {may + '%':>26s} {p100('analogia'):>5s} "
              f"{p100('diagrama'):>5s} {antes:>11s} "
              f"{p100('diagrama_sin_alt'):>7s} {p100('prerequisito'):>6s} {p100('prereq_en_cualquier_forma'):>7s} "
              f"{est['punteros_ambiguos']:4d} {est['punteros_huerfanos']:4d} {est['modulos_desfasados']:4d}")
    print("\nmix por curso (todas las metodologías que aparecen):")
    for curso in cursos:
        est = por_curso[curso]
        activas = sorted((f for f in list(FAMILIAS) + ["ninguna"] if est[f]), key=lambda f: -est[f])
        print(f"  {curso:22s} " + " + ".join(f"{f} {est[f]}" for f in activas))

    total = sum(e["temas"] for e in por_curso.values())
    familias_usadas = sorted({f for e in por_curso.values() for f in list(FAMILIAS) + ["ninguna"] if e[f]})
    print(f"\nTOTAL {total} temas · {len(familias_usadas)} metodologías conviviendo: {', '.join(familias_usadas)}")
    for curso in cursos:
        est = por_curso[curso]
        k = sum(1 for f in list(FAMILIAS) + ["ninguna"] if est[f])
        if k > 1:
            print(f"  {curso}: {k} metodologías dentro del mismo curso")
    if args.json:
        args.json.write_text(json.dumps(filas, ensure_ascii=False, indent=1), encoding="utf-8")
    if args.csv:
        with args.csv.open("w", newline="", encoding="utf-8") as fh:
            wr = csv.DictWriter(fh, fieldnames=list(filas[0]))
            wr.writeheader()
            wr.writerows(filas)
    return 0


if __name__ == "__main__":
    sys.exit(main())
