#!/usr/bin/env python3
"""Auditoría transversal de calidad por curso (complementa audit_plantilla.py).

Mide, por tema: longitud, código, ejercicios con solución, voseo, duración declarada,
restos de trabajo (TODO, lorem), enlaces internos rotos, imágenes inexistentes y temas
duplicados dentro del curso. Escribe un resumen en Markdown y, con --json, el detalle.

Uso: python3 scripts/audit_calidad.py [--json salida.json] [--md salida.md]
"""
import argparse
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "web/public/content"
INDEX = json.loads((CONTENT / "topic-index.json").read_text())

VOSEO = re.compile(
    r"\b(vos|tenés|podés|querés|sabés|hacés|tenés|necesitás|usás|corrés|escribís|abrís|"
    r"hacé|mirá|fijate|usá|corré|creá|escribí|abrí|agregá|probá|ejecutá|revisá|guardá|copiá|"
    r"pegá|cambiá|elegí|anotá|instalá|compará|comprobá|verificá|intentá|empezá|seguí|pensá|"
    r"imaginá|recordá|buscá|leé|respondé|explicá|completá|añadí|definí|reemplazá|borrá|"
    r"quitá|volvé|poné|decí|salí|vení|andá|esperá|confirmá|calculá|dibujá|medí|ajustá)\b",
    re.IGNORECASE,
)
RESTOS = re.compile(r"\b(TODO|FIXME|XXX|lorem ipsum|TBD)\b|\[pendiente\]|<!--", re.IGNORECASE)
TEMA = re.compile(r"^### (Tema \d+.*)$", re.MULTILINE)
DURACION = re.compile(r"(\d{1,3})\s*min\b")
CODE = re.compile(r"^```([\w+-]*)", re.MULTILINE)
LINK_INTERNO = re.compile(r"\]\((/curso/[^)\s#]+)")
IMG = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")


def norm(t):
    t = unicodedata.normalize("NFKD", t.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"^tema \d+\s*[:·.-]\s*", "", t)
    t = re.sub(r"·.*$", "", t)
    return re.sub(r"[^a-z0-9 ]", "", t).strip()


def module_ids(curso):
    return {str(m.get("moduleId", m.get("id"))) for m in INDEX[curso]} if isinstance(INDEX[curso], list) else set(map(str, INDEX[curso]))


def temas(md):
    pos = [m.start() for m in TEMA.finditer(md)]
    for i, p in enumerate(pos):
        fin = pos[i + 1] if i + 1 < len(pos) else len(md)
        yield md[p:fin]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    ap.add_argument("--md")
    a = ap.parse_args()
    cursos = sorted(p.name for p in CONTENT.iterdir() if p.is_dir() and list(p.glob("modulo-*.md")))
    resumen, detalle = [], defaultdict(list)
    for c in cursos:
        mods = sorted(CONTENT.joinpath(c).glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1]))
        validos = {p.stem.split("-")[1] for p in mods}
        st = Counter()
        titulos = defaultdict(list)
        for p in mods:
            md = p.read_text()
            st["voseo"] += len(VOSEO.findall(md))
            for r in RESTOS.finditer(md):
                ln = md[: r.start()].count("\n") + 1
                detalle[c].append(f"resto `{r.group(0)}` en {p.name}:{ln}")
            for l in LINK_INTERNO.findall(md):
                partes = l.strip("/").split("/")
                if len(partes) >= 3 and (partes[1] not in cursos or partes[2] not in {q.stem.split('-')[1] for q in CONTENT.joinpath(partes[1]).glob('modulo-*.md')}):
                    st["enlaces_rotos"] += 1
                    detalle[c].append(f"enlace interno roto {l} en {p.name}")
            for img in IMG.findall(md):
                if img.startswith("http"):
                    continue
                cands = [ROOT / "web/public" / img.lstrip("/"), p.parent / img]
                if not any(x.exists() for x in cands):
                    st["imagenes_rotas"] += 1
                    detalle[c].append(f"imagen inexistente {img} en {p.name}")
            for t in temas(md):
                st["temas"] += 1
                cab = t.splitlines()[0]
                titulos[norm(cab)].append(f"{p.name}")
                palabras = len(re.findall(r"\w+", t))
                st["palabras"] += palabras
                if palabras < 500:
                    st["temas_cortos"] += 1
                    detalle[c].append(f"tema corto ({palabras} palabras): {p.name} · {cab[4:80]}")
                if palabras > 7000:
                    st["temas_largos"] += 1
                    detalle[c].append(f"tema muy largo ({palabras} palabras): {p.name} · {cab[4:80]}")
                langs = [l for l in CODE.findall(t)]
                if not any(l and l not in ("text", "txt", "mermaid", "plaintext") for l in langs[::2]):
                    st["sin_codigo"] += 1
                if "<details" not in t:
                    st["sin_solucion"] += 1
                m = re.search(r"Duración estimada:\*{0,2}\s*(\d{1,3})\s*min", t) or DURACION.search(cab)
                d = [int(m.group(1))] if m else []
                if d and max(d) > 45:
                    st["duracion_mayor_45"] += 1
                if not d:
                    st["sin_duracion"] += 1
        dup = {k: v for k, v in titulos.items() if len(v) > 1 and k}
        for k, v in dup.items():
            detalle[c].append(f"título repetido «{k}» en {', '.join(v)}")
        st["titulos_repetidos"] = len(dup)
        st["modulos"] = len(mods)
        resumen.append((c, st))

    cols = ["modulos", "temas", "palabras", "temas_cortos", "temas_largos", "sin_codigo", "sin_solucion",
            "sin_duracion", "duracion_mayor_45", "voseo", "titulos_repetidos", "enlaces_rotos", "imagenes_rotas"]
    lineas = ["| Curso | " + " | ".join(cols) + " |", "|---|" + "---:|" * len(cols)]
    for c, st in resumen:
        lineas.append(f"| {c} | " + " | ".join(str(st[k]) for k in cols) + " |")
    tabla = "\n".join(lineas)
    print(tabla)
    if a.md:
        out = ["# Auditoría transversal de calidad", "", "Generado por `scripts/audit_calidad.py`.", "", tabla, ""]
        for c, _ in resumen:
            if detalle[c]:
                out += [f"## {c}", ""] + [f"- {d}" for d in detalle[c][:80]]
                if len(detalle[c]) > 80:
                    out.append(f"- … {len(detalle[c]) - 80} más")
                out.append("")
        Path(a.md).write_text("\n".join(out))
    if a.json:
        Path(a.json).write_text(json.dumps({"resumen": {c: dict(st) for c, st in resumen}, "detalle": detalle}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
