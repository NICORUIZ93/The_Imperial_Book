#!/usr/bin/env python3
"""Audita los 12 ítems de la sección 4 de MASTER-PROMPT.md tema por tema (los 1608 indexados).

Qué mide y qué no. La sección 4 del prompt maestro define la «definición de terminado» de un tema con
doce puntos. Este script comprueba si el **texto necesario está presente** en el bloque del tema. Es
medición estructural: un `hecho` aquí significa «el punto existe y tiene cuerpo», nunca «el punto está
bien escrito». La rúbrica de la sección 6 (exactitud, claridad, profundidad) sigue siendo de revisión
humana y este auditor no la sustituye.

Los dos formatos de tema que hay en la academia se miden con los mismos doce puntos, porque cada detector
busca la *función* (objetivo, analogía, diagrama, código, fallo, ejercicio, cierre, proyecto) y no una
frase literal:

  - formato estándar  — `### Tema N: título · Nivel · XX min` con `#### Paso 1 · …` hasta `#### Paso 7 · …`
  - ficha             — `### Título` con `#### 1. UBICACIÓN` … `#### 14. ANTI-PATRÓN RELACIONADO`
    (reconocida por su primer punto, igual que hacen build_web_topic_index.py y lesson-viewer.ts)

Salidas:
  docs/auditoria/prompt-maestro-items.md    tabla por punto y por curso
  docs/auditoria/prompt-maestro-items.json  lo mismo, máquina-leíble
  docs/auditoria/prompt-maestro-items.csv   una fila por tema con los puntos que le faltan (lista de trabajo)

Uso:
  python3 scripts/audit_master_prompt_items.py           # genera las tres salidas
  python3 scripts/audit_master_prompt_items.py --check   # falla si están desactualizadas
  python3 scripts/audit_master_prompt_items.py --resumen # solo totales por punto
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
OUT_DIR = ROOT / "docs" / "auditoria"
OUT_MD = OUT_DIR / "prompt-maestro-items.md"
OUT_JSON = OUT_DIR / "prompt-maestro-items.json"
OUT_CSV = OUT_DIR / "prompt-maestro-items.csv"

# Los doce puntos, con el nombre que usa el prompt maestro.
ITEMS = {
    "P1": "Encabezado con nivel y duración + prerrequisitos",
    "P2": "Objetivo verificable",
    "P3": "Por qué importa, con caso real",
    "P4": "Explicación sencilla y precisa + analogía con su límite",
    "P5": "Ayuda visual propia (diagrama o imagen)",
    "P6": "Ejemplo ejecutable con nombre de archivo",
    "P7": "Explicación por bloques del código",
    "P8": "Captura real con resultado en texto",
    "P9": "Fallo deliberado: error exacto y diagnóstico",
    "P10": "Ejercicios en tres niveles con solución",
    "P11": "Checklist de salida y siguiente paso",
    "P12": "Aporte al proyecto integrador y fuentes con fecha",
}

# Un tema declara las funciones de tres maneras reales según su estructura (`#### Paso N · …`,
# `#### Subtema N.M: …` y los 14 puntos de la ficha) o como rótulo en negrita dentro de un renglón
# (`**Prerrequisitos:** M0 T1 (compilar y ejecutar)`). Los detectadores buscan el RÓTULO de la
# función con contenido detrás, nunca una mención suelta en prosa: que la frase «prerrequisitos»
# aparezca escrita en una oración no cuenta como punto cumplido.
NIVEL = re.compile(r"[·•]\s*(?:Básico|Intermedio|Avanzado|Experto)\s*[·•]\s*\d+", re.IGNORECASE)
PRERREQUISITOS = r"prerrequisitos|necesitas saber|necesitas tener|conocimientos previos|dependencias"
OBJETIVO = r"objetivo(?: de aprendizaje)?|al terminar podrás|qué sabrás hacer"
PORQUE = (r"por qué importa|por que importa|por qué es importante|que problema resuelve|"
          r"contexto y caso real|caso real|casos de uso")
ANALOGIA = r"analog[íi]a(?: visual)?|explicación sencilla|teor[íi]a sencilla|modelo mental"
BLOQUES = r"por bloques|explicación del có?digo|explicación intermedia|intermedia|explicación maestra|maestra|demostración guiada"
FALLO = r"fallo deliberado|erro?r(?:es)? com[úu]n(?:es)?|error esperable|síntoma|diagn[óo]stico|anti-?patr[óo]n|qué puede salir mal|rompe"
EJERCICIO_GUIADO = r"pr[áa]ctica guiada|ejercicio guiado|ejercicio 1|mini-?laboratorio"
EJERCICIO_INDEP = r"pr[áa]ctica independiente|ejercicio independiente|independiente|reto|desaf[íi]o|ejercicio [23]"
CIERRE = r"cierre(?: y evidencia)?|checklist de salida|resumen|autoevaluaci[óo]n|siguiente paso|verificaci[óo]n"
PROYECTO = re.compile(r"proyecto integrador|proyecto guía|proyecto guia|capstone|aporte al proyecto", re.I)
FUENTES = re.compile(r"fuentes(?: consultadas)?|referencias|bibliograf[íi]a|para profundizar", re.I)
FECHA = re.compile(r"20\d\d-\d\d-\d\d|20\d\d")
ARCHIVO = re.compile(r"(?:[\w.\-]+/)+[\w.\-]+\.[a-zA-Z0-9]+|[\w.\-]+\.[a-zA-Z0-9]{1,10}\b")
FENCE = re.compile(r"^```(\w*)", re.M)
HEAD = re.compile(r"^(#{3,6})\s+(.+?)\s*$", re.M)
IMG = re.compile(r"!\[([^\]]*)\]\([^)]+\)")
FICHA_1 = re.compile(r"^1\.\s+UBICACI[OÓ]N\b", re.IGNORECASE)


def sin_diacriticos(texto: str) -> str:
    texto = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def con_cuerpo(lineas: list[str], inicio: int) -> bool:
    """Un encabezado cuenta si debajo tiene al menos una línea con contenido."""
    for linea in lineas[inicio + 1:]:
        if linea.startswith("#"):
            return False
        if linea.strip() and linea.strip() not in {"---", "```"}:
            return True
    return False


def tema_blocks(track: str) -> list[dict]:
    """Cada tema de la ruta con su bloque de texto, en los dos formatos."""
    blocks = []
    for path in sorted((CONTENT / track).glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1])):
        lineas = path.read_text(encoding="utf-8").splitlines()
        topicos = [i for i, linea in enumerate(lineas) if linea.startswith("### ")]
        cortes = [i for i, linea in enumerate(lineas) if linea.startswith("## ")]
        for numero, inicio in enumerate(topicos):
            fin = topicos[numero + 1] if numero + 1 < len(topicos) else len(lineas)
            # El cierre del módulo (`## …`) no es parte del último tema: si no se corta aquí,
            # sus fuentes y su proyecto cuentan como del tema y el porcentaje sale inflado.
            fin = min(fin, next((i for i in cortes if i > inicio), len(lineas)))
            titulo = lineas[inicio][4:].strip()
            cuerpo = lineas[inicio + 1:fin]
            es_estandar = bool(re.match(r"^Tema\s+\d+\s*:", titulo, re.I))
            es_ficha = any(linea.startswith("#### ") and FICHA_1.match(linea[5:]) for linea in cuerpo)
            if not (es_estandar or es_ficha):
                continue
            blocks.append({"modulo": int(path.stem.split("-")[1]), "titulo": titulo,
                           "formato": "estandar" if es_estandar else "ficha",
                           "lineas": lineas[inicio:fin], "cuerpo": cuerpo})
    return blocks


def medir(bloque: dict) -> dict:
    """Los doce puntos de un tema. Devuelve {P1..P12: True/False} y las piezas de los compuestos."""
    lineas = bloque["lineas"]
    texto = "\n".join(lineas)
    sin_codigo = "\n".join(l for l in lineas if not l.startswith("```"))

    def prefijo(linea: str) -> str:
        """Una línea reduced a su etiqueta: sin `#`, `**`, `>`, `-`, ni el `Paso 3 ·` / `4. ` inicial."""
        limpio = re.sub(r"^[#>*\-\s]+", "", linea)
        return re.sub(r"^(?:paso\s+\d+\s*[·•\-]?\s*|\d+\.\s*)", "", limpio, flags=re.I)

    def etiqueta(alternativa: str) -> bool:
        """La función está escrita como rótulo con contenido: encabezado `#### … Rótulo …` o
        renglón `**Rótulo:** texto`. Una mención suelta dentro de una frase no cuenta."""
        # 1) Como encabezado de sección (formatos Paso, Subtema y ficha).
        for indice, linea in enumerate(lineas):
            if linea.startswith("#"):
                cabeza = prefijo(linea)
                if re.match(r"^(?:[^\w]*?)(?:" + alternativa + r")\b", cabeza, re.I):
                    if con_cuerpo(lineas, indice):
                        return True
        # 2) Como rótulo: `**Rótulo:** texto`, `**Rótulo?** texto` o `Rótulo: texto`. Un rótulo
        #    escrito dentro de una frase normal («los prerrequisitos de este tema son…») no cuenta.
        for linea in lineas:
            if linea.startswith("```"):
                continue
            for resto in re.findall(r"\*\*[^*]{0,20}?\b(?:" + alternativa + r")\b[^*]{0,20}\*\*\s*(.+)",
                                    linea, re.I):
                if len(resto.strip().strip("*_` ")) >= 8:
                    return True
            for coincidencia in re.finditer(r"\b(?:" + alternativa + r")\b\s*(?:\*\*)?\s*[:·]", linea, re.I):
                if len(linea[coincidencia.end():].strip().strip("*_` ")) >= 8:
                    return True
        return False

    lenguajes = [g or "sin-lenguaje" for g in FENCE.findall(texto)]
    archivos = bool(ARCHIVO.search(sin_diacriticos(sin_codigo)))
    capturas = IMG.findall(texto)
    hay_diagrama = "```mermaid" in texto or bool(IMG.search(texto)) or "<svg" in texto
    nivel_ok = bool(NIVEL.search(bloque["titulo"]))
    piezas = {
        "nivel_y_duracion": nivel_ok,
        "prerrequisitos": etiqueta(PRERREQUISITOS),
        "objetivo": etiqueta(OBJETIVO),
        "por_que_importa": etiqueta(PORQUE),
        "analogia": etiqueta(ANALOGIA),
        "codigo_con_archivo": bool(lenguajes) and archivos,
        "por_bloques": etiqueta(BLOQUES),
        "captura_con_texto_alternativo": any(alt.strip() for alt in capturas),
        "salida_en_texto": bool(re.search(r"^\s*(?:\*\*)?(Salida|Resultado)(?:\*\*)?[:·]", texto, re.M | re.I)),
        "fallo_deliberado": etiqueta(FALLO),
        "ejercicio_guiado": etiqueta(EJERCICIO_GUIADO),
        "ejercicio_independiente": etiqueta(EJERCICIO_INDEP),
        "cierre": etiqueta(CIERRE),
        "proyecto": bool(PROYECTO.search(texto)),
        "fuentes": bool(FUENTES.search(texto)),
        "fecha": bool(FECHA.search(texto)),
    }
    return {
        "P1": piezas["nivel_y_duracion"] and piezas["prerrequisitos"],
        "P2": piezas["objetivo"],
        "P3": piezas["por_que_importa"],
        "P4": piezas["analogia"],
        "P5": hay_diagrama,
        "P6": piezas["codigo_con_archivo"],
        "P7": piezas["por_bloques"],
        "P8": piezas["captura_con_texto_alternativo"] and piezas["salida_en_texto"],
        "P9": piezas["fallo_deliberado"],
        "P10": piezas["ejercicio_guiado"] and piezas["ejercicio_independiente"],
        "P11": piezas["cierre"],
        "P12": piezas["proyecto"] and piezas["fuentes"] and piezas["fecha"],
        "piezas": piezas,
    }


def medir_curso(track: str) -> list[dict]:
    filas = []
    for bloque in tema_blocks(track):
        filas.append({"track": track, "modulo": bloque["modulo"], "titulo": bloque["titulo"],
                      "formato": bloque["formato"], **medir(bloque)})
    return filas


def generar() -> tuple[dict, str, str, str]:
    index = json.loads((CONTENT / "topic-index.json").read_text(encoding="utf-8"))
    por_curso = {track: medir_curso(track) for track in sorted(index)}
    todas = [fila for filas in por_curso.values() for fila in filas]
    total = len(todas)

    resumen = {}
    for punto in ITEMS:
        cumple = sum(1 for f in todas if f[punto])
        resumen[punto] = {"cumplen": cumple, "total": total, "porcentaje": round(100 * cumple / total) if total else 0}

    datos = {"temas_medidos": total, "puntos": ITEMS, "resumen": resumen,
             "por_curso": {t: {punto: sum(1 for f in filas if f[punto]) for punto in ITEMS}
                           for t, filas in por_curso.items()},
             "temas_por_curso": {t: len(filas) for t, filas in por_curso.items()}}

    lineas = [
        "# Auditoría de los 12 ítems del prompt maestro (sección 4)",
        "",
        "> Generado por `scripts/audit_master_prompt_items.py` sobre `topic-index.json`"
        f" ({total} temas en {len(por_curso)} cursos).",
        "> Medición estructural: comprueba que el punto **existe y tiene cuerpo**, no que esté bien",
        "> escrito. La rúbrica de la sección 6 (exactitud, claridad, profundidad) es de revisión humana",
        "> y este informe no la sustituye.",
        "",
        "| Punto | Qué exige la sección 4 | Temas que lo tienen | % |",
        "|---|---|---:|---:|",
    ]
    for punto, nombre in ITEMS.items():
        r = resumen[punto]
        lineas.append(f"| {punto} | {nombre} | {r['cumplen']}/{r['total']} | {r['porcentaje']} % |")
    lineas += ["", "## Por curso", "",
               "| Curso | Temas | " + " | ".join(ITEMS) + " |",
               "|---|---:|" + "---:|" * len(ITEMS)]
    for track, filas in por_curso.items():
        n = len(filas)
        celdas = [f"{sum(1 for f in filas if f[p])}/{n}" for p in ITEMS]
        lineas.append(f"| {track} | {n} | " + " | ".join(celdas) + " |")
    lineas += ["", "## Cómo se usa", "",
               "`docs/auditoria/prompt-maestro-items.csv` tiene una fila por tema con la columna",
               "`faltan`: ese es el trabajo pendiente, ordenable por curso y módulo. Un tema con",
               "`faltan` vacío ya pasa los doce puntos estructurales.", ""]
    markdown = "\n".join(lineas)

    bufer = io.StringIO()
    # lineterminator explícito: el separador de csv es `\r\n` por defecto, y al leer el archivo
    # otra vez Python lo convierte en `\n`, así que `--check` siempre lo vería desactualizado.
    escritor = csv.writer(bufer, lineterminator="\n")
    escritor.writerow(["curso", "modulo", "titulo", "formato"] + list(ITEMS) + ["faltan"])
    for fila in todas:
        faltan = [p for p in ITEMS if not fila[p]]
        escritor.writerow([fila["track"], fila["modulo"], fila["titulo"], fila["formato"]]
                          + ["si" if fila[p] else "no" for p in ITEMS] + [" ".join(faltan)])
    csv_texto = bufer.getvalue()

    return datos, markdown, json.dumps(datos, ensure_ascii=False, indent=2) + "\n", csv_texto


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--resumen", action="store_true")
    args = parser.parse_args()
    datos, markdown, json_texto, csv_texto = generar()

    if args.resumen:
        for punto, nombre in ITEMS.items():
            r = datos["resumen"][punto]
            print(f"{punto} {r['cumplen']:>5}/{r['total']} ({r['porcentaje']:>3} %)  {nombre}")
        print(f"temas medidos: {datos['temas_medidos']}")
        return 0

    nuevas = [(OUT_MD, markdown), (OUT_JSON, json_texto), (OUT_CSV, csv_texto)]
    if args.check:
        desactualizadas = [p.name for p, texto in nuevas if not p.is_file() or p.read_text(encoding="utf-8") != texto]
        print("audit_master_prompt_items: " + (f"desactualizado {desactualizadas}" if desactualizadas else "al día"))
        return 1 if desactualizadas else 0
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for path, texto in nuevas:
        path.write_text(texto, encoding="utf-8")
    peor = min(ITEMS, key=lambda p: datos["resumen"][p]["cumplen"])
    print(f"audit_master_prompt_items: {datos['temas_medidos']} temas medidos; "
          f"punto con menos cumplimiento {peor} "
          f"{datos['resumen'][peor]['cumplen']}/{datos['resumen'][peor]['total']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
