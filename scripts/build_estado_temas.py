#!/usr/bin/env python3
"""Genera el estado de TODOS los temas objetivo a partir de los temarios aprobados.

Lee docs/temarios/<curso>-objetivo.md y docs/reestructuracion/temas-escritos.txt y escribe:
  docs/reestructuracion/ESTADO-DE-TEMAS.csv  (una fila por tema objetivo)
  docs/reestructuracion/ESTADO-DE-TEMAS.md   (resumen por curso y por módulo)

Uso: python3 scripts/build_estado_temas.py [--check]
"""
import csv
import io
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TEMARIOS = RAIZ / "docs" / "temarios"
SALIDA = RAIZ / "docs" / "reestructuracion"
ESCRITOS = SALIDA / "temas-escritos.txt"
# Orden de trabajo fijado por el dueño (specs/021, sección 5).
CURSOS = ["java", "gradle", "spring", "microservicios", "flutter", "ios", "angular", "fundamentos"]
CAMPOS = ["id", "curso", "tramo", "modulo", "titulo_modulo", "n", "tema", "nivel",
          "estado_origen", "detalle_origen", "escrito_formato_unico", "verificado"]


def limpiar(texto):
    return re.sub(r"\s+", " ", texto.replace("**", "")).strip()


def clasificar(estado):
    e = estado.lower()
    if "pero básico" in e or "básico" in e and "está" in e:
        return "esta-pero-basico"
    if e.startswith("ya está") or "ya está" in e[:20]:
        return "ya-esta"
    if "falta" in e[:25]:
        return "falta"
    return "revisar"


def leer_escritos():
    """Cada línea: id[;verificado]. Ejemplo: java/M0/T1;verificado"""
    hechos = {}
    if ESCRITOS.exists():
        for linea in ESCRITOS.read_text(encoding="utf-8").splitlines():
            linea = linea.split("#")[0].strip()
            if linea:
                partes = [p.strip() for p in linea.split(";")]
                hechos[partes[0]] = len(partes) > 1 and partes[1] == "verificado"
    return hechos


def leer_temario(curso, hechos):
    filas, tramo, modulo, titulo, columnas = [], "", "", "", None
    for linea in (TEMARIOS / f"{curso}-objetivo.md").read_text(encoding="utf-8").splitlines():
        if re.match(r"^#{2,3} ", linea):
            m = re.match(r"^#{2,3} .*?(Tramo|Fase)\s*\d*\s*[·:.-]?\s*(.*)", linea)
            if m:
                tramo = limpiar(re.split(r" — | \(", linea.lstrip("# "))[0])
            modulo, columnas = "", None
            continue
        m = re.match(r"^#### (M\d+|Módulo [\d.]+[A-Z]?)\s*·\s*(.*)", linea)
        if m:
            modulo = m.group(1).replace("Módulo ", "M")
            titulo = limpiar(re.sub(r"\(\d+ temas\)|\([^()]*`[^()]*\)|\(módulo nuevo\)", "", m.group(2).replace("**", "")))
            columnas = None
            continue
        if linea.startswith("#### "):
            modulo, columnas = "", None
            continue
        if not modulo or not linea.startswith("|"):
            continue
        celdas = [c.strip() for c in re.split(r"(?<!\\)\|", linea.strip().strip("|"))]
        if columnas is None:
            bajas = [c.lower() for c in celdas]
            if "tema" in bajas and any(c.startswith("estado") for c in bajas):
                columnas = {"n": 0, "tema": bajas.index("tema"), "nivel": bajas.index("nivel"),
                            "estado": next(i for i, c in enumerate(bajas) if c.startswith("estado"))}
            continue
        if set(celdas[0]) <= set("-: ") or len(celdas) <= columnas["estado"]:
            continue
        n = re.sub(r"^M\d+\s*", "", celdas[0]).lstrip("T").strip()
        if not re.match(r"^\d+$", n):
            continue
        estado = limpiar(celdas[columnas["estado"]])
        ident = f"{curso}/{modulo}/T{n}"
        filas.append({
            "id": ident, "curso": curso, "tramo": tramo, "modulo": modulo, "titulo_modulo": titulo,
            "n": n, "tema": limpiar(celdas[columnas["tema"]]), "nivel": limpiar(celdas[columnas["nivel"]]),
            "estado_origen": clasificar(estado), "detalle_origen": estado,
            "escrito_formato_unico": "si" if ident in hechos else "no",
            "verificado": "si" if hechos.get(ident) else "no",
        })
    return filas


def generar():
    hechos = leer_escritos()
    filas = [f for c in CURSOS for f in leer_temario(c, hechos)]
    desconocidos = sorted(set(hechos) - {f["id"] for f in filas})
    if desconocidos:
        sys.exit("temas-escritos.txt tiene identificadores que no existen: " + ", ".join(desconocidos[:10]))
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=CAMPOS, lineterminator="\n")
    w.writeheader()
    w.writerows(filas)

    md = ["# Estado de todos los temas objetivo", "",
          "Generado por `scripts/build_estado_temas.py` desde los temarios aprobados y",
          "`docs/reestructuracion/temas-escritos.txt`. No lo edites a mano. El detalle tema por tema está en",
          "`ESTADO-DE-TEMAS.csv`.", "",
          "- **Origen**: qué había en el curso antiguo (`ya-esta`, `esta-pero-basico`, `falta`).",
          "- **Escritos**: temas ya escritos en el formato único de 12 secciones.",
          "- **Verificados**: su laboratorio se ejecutó y pasó.", "",
          "| Curso | Temas | Módulos | Ya está | Básico | Falta | Escritos | Verificados | Por escribir |",
          "|---|---:|---:|---:|---:|---:|---:|---:|---:|"]
    tot = [0] * 8
    for c in CURSOS:
        fc = [f for f in filas if f["curso"] == c]
        v = [len(fc), len({f["modulo"] for f in fc})] + \
            [sum(f["estado_origen"] == e for f in fc) for e in ("ya-esta", "esta-pero-basico", "falta")] + \
            [sum(f["escrito_formato_unico"] == "si" for f in fc), sum(f["verificado"] == "si" for f in fc)]
        v.append(v[0] - v[5])
        tot = [a + b for a, b in zip(tot, v)]
        md.append(f"| {c} | " + " | ".join(str(x) for x in v) + " |")
    md.append("| **Total** | " + " | ".join(f"**{x}**" for x in tot) + " |")
    for c in CURSOS:
        md += ["", f"## {c}", "", "| Módulo | Título | Tramo | Temas | Escritos | Verificados |", "|---|---|---|---:|---:|---:|"]
        vistos = []
        for f in filas:
            if f["curso"] == c and f["modulo"] not in vistos:
                vistos.append(f["modulo"])
                fm = [x for x in filas if x["curso"] == c and x["modulo"] == f["modulo"]]
                md.append(f"| {f['modulo']} | {f['titulo_modulo']} | {f['tramo']} | {len(fm)} | "
                          f"{sum(x['escrito_formato_unico'] == 'si' for x in fm)} | "
                          f"{sum(x['verificado'] == 'si' for x in fm)} |")
    return buf.getvalue(), "\n".join(md) + "\n", filas


def main():
    texto_csv, texto_md, filas = generar()
    destino = {SALIDA / "ESTADO-DE-TEMAS.csv": texto_csv, SALIDA / "ESTADO-DE-TEMAS.md": texto_md}
    if "--check" in sys.argv:
        malos = [p.name for p, t in destino.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        if malos:
            sys.exit("Desactualizado: " + ", ".join(malos) + ". Ejecuta scripts/build_estado_temas.py")
        print(f"estado de temas: ok ({len(filas)} temas)")
        return
    for p, t in destino.items():
        p.write_text(t, encoding="utf-8")
    print(f"{len(filas)} temas escritos en ESTADO-DE-TEMAS.csv y .md")


if __name__ == "__main__":
    main()
