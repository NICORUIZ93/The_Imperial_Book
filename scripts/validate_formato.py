#!/usr/bin/env python3
"""Formato educativo único (specs/021, docs/reestructuracion/FORMATO-UNICO.md).

Mide, por curso, cuántos temas cumplen las 12 secciones del formato (Microservicios: su ficha de 14 puntos,
que es equivalente) y que el encabezado declare nivel y minutos.

  python3 scripts/validate_formato.py            # informe por curso
  python3 scripts/validate_formato.py --write    # además actualiza docs/reestructuracion/AVANCE-FORMATO.md
  python3 scripts/validate_formato.py --check    # falla si un curso declarado «en formato» no está al 100 %

Los cursos declarados «en formato» están en docs/reestructuracion/cursos-en-formato.json; se añade un curso
cuando termina su migración, y desde entonces --check (dentro de validate.sh) no deja que retroceda.
"""
import argparse, json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
DECLARADOS = ROOT / "docs/reestructuracion/cursos-en-formato.json"
AVANCE = ROOT / "docs/reestructuracion/AVANCE-FORMATO.md"
SECCIONES = ["Ubicación y prerrequisitos", "Objetivo", "Por qué importa", "Analogía", "Diagrama", "Explicación",
             "Código ejecutable", "Mini-laboratorio", "Verificación", "Error común y diagnóstico",
             "Pregunta con respuesta modelo", "Cuándo usarlo y cuándo no"]
FICHA_14 = ["UBICACIÓN", "PRERREQUISITOS", "OBJETIVO DE APRENDIZAJE", "ANALOGÍA VISUAL", "DIAGRAMA TÉCNICO",
            "EXPLICACIÓN NIVEL 0", "EXPLICACIÓN INTERMEDIA", "EXPLICACIÓN MAESTRA", "CÓDIGO EJECUTABLE",
            "MINI-LABORATORIO", "VERIFICACIÓN", "ERROR COMÚN", "PREGUNTA DE ENTREVISTA", "ANTI-PATRÓN RELACIONADO"]
EDITORIAL = ["DE QUÉ TRATA", "LA IDEA EN UNA FRASE", "POR QUÉ EXISTE ESTO", "LA ANALOGÍA", "CÓMO FUNCIONA",
             "LO QUE PUEDE SALIR MAL", "TRADE-OFFS", "CUÁNDO NO USAR ESTO", "DE VUELTA A LA ANALOGÍA",
             "LO QUE DEBES RECORDAR", "PREGUNTAS PARA PENSAR"]


def norm(t: str) -> str:
    t = unicodedata.normalize("NFD", t.lower())
    return re.sub(r"[^a-z0-9]+", " ", "".join(c for c in t if unicodedata.category(c) != "Mn")).strip()


def temas(curso: str, texto: str):
    patron = r"^### (.+)$" if curso == "microservices" else r"^### Tema \d+: (.+)$"
    ms = list(re.finditer(patron, texto, re.M))
    for i, m in enumerate(ms):
        yield m.group(1).strip(), texto[m.end(): ms[i + 1].start() if i + 1 < len(ms) else len(texto)]


def revisar(curso: str, titulo: str, cuerpo: str, editorial: bool=False) -> list[str]:
    faltas = []
    encabezados = [norm(re.sub(r"^\d+\.\s*", "", h).replace('►','').strip()) for h in re.findall(r"^#### (.+)$", cuerpo, re.M)]
    if editorial or "Capa 1 — Lectura" in cuerpo or "Capa 1 - Lectura" in cuerpo:
        esperadas = EDITORIAL
        pos = -1
        for sec in esperadas:
            n = norm(sec)
            try:
                pidx = next(i for i, h in enumerate(encabezados) if n in h and i > pos)
                pos = pidx
            except StopIteration:
                faltas.append(f"sección «{sec}»")
        if "Capa 2 — Construcción" not in cuerpo and "Capa 2 - Construcción" not in cuerpo and "<summary><strong>Capa 2" not in cuerpo:
            faltas.append("Capa 2 — Construcción")
        return faltas
    esperadas = FICHA_14 if curso == "microservices" else SECCIONES
    pos = -1
    for sec in esperadas:
        n = norm(sec)
        try:
            pidx = next(i for i, h in enumerate(encabezados) if h.startswith(n) and i > pos)
            pos = pidx
        except StopIteration:
            faltas.append(f"sección «{sec}»")
    if curso != "microservices" and len(titulo.split(" · ")) < 3:
        faltas.append("nivel y minutos en el encabezado")
    if "```mermaid" not in cuerpo and "![" not in cuerpo:
        faltas.append("diagrama o imagen")
    return faltas


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true"); ap.add_argument("--write", action="store_true")
    ap.add_argument("--editorial", action="store_true", help="valida estándar editorial Capa 1/Capa 2")
    a = ap.parse_args()
    filas, detalle = [], {}
    for d in sorted(p for p in CONTENT.iterdir() if p.is_dir() and any(p.glob("modulo-*.md"))):
        total = ok = 0; falt = {}
        for f in sorted(d.glob("modulo-*.md"), key=lambda p: int(re.search(r"(\d+)", p.stem).group(1))):
            for titulo, cuerpo in temas(d.name, f.read_text(encoding="utf-8")):
                total += 1; fs = revisar(d.name, titulo, cuerpo, editorial=a.editorial)
                if fs:
                    for x in fs: falt[x] = falt.get(x, 0) + 1
                else:
                    ok += 1
        filas.append((d.name, total, ok)); detalle[d.name] = falt
    declarados = json.loads(DECLARADOS.read_text(encoding="utf-8"))["cursos"] if DECLARADOS.exists() else []
    lineas = ["| Curso | Temas | En formato | % | Lo que más falta |", "|---|---|---|---|---|"]
    for c, t, ok in filas:
        top = ", ".join(f"{k} ({v})" for k, v in sorted(detalle[c].items(), key=lambda kv: -kv[1])[:3]) or "—"
        lineas.append(f"| {c} | {t} | {ok} | {100 * ok // t if t else 0} % | {top} |")
    tt, to = sum(f[1] for f in filas), sum(f[2] for f in filas)
    lineas.append(f"| **Total** | {tt} | {to} | {100 * to // tt} % | |")
    print("\n".join(lineas))
    if a.write:
        AVANCE.write_text("# Avance del formato único (specs/021)\n\nGenerado por `python3 scripts/validate_formato.py --write`. "
                          "Cursos declarados «en formato»: " + (", ".join(declarados) or "ninguno todavía") + ".\n\n" + "\n".join(lineas) + "\n", encoding="utf-8")
    if a.check:
        por_curso = {c: (t, ok) for c, t, ok in filas}
        if a.editorial:
            malos = [c for c, t, ok in filas if t and t != ok]
            if malos:
                print("validate_formato --editorial: cursos no cumplen 100%: " + ", ".join(malos))
                return 1
            print(f"validate_formato --editorial: ok ({len(filas)} cursos)")
            return 0
        # Un curso declarado sin temas reconocidos no puede aprobar por vacío (specs/025 C6).
        malos = [c for c in declarados
                 if c not in por_curso or por_curso[c][0] == 0 or por_curso[c][0] != por_curso[c][1]]
        if malos:
            print("validate_formato: cursos declarados «en formato» que no están al 100 %: " + ", ".join(malos)); return 1
        # specs/026 C7: el suelo lo fija scripts/umbrales.json y sube lote a lote.
        umbrales_path = ROOT / "scripts" / "umbrales.json"
        umbrales = json.loads(umbrales_path.read_text(encoding="utf-8")) if umbrales_path.exists() else {}
        minimo = umbrales.get("mas_es_mejor", {}).get("cursos_en_formato", 1)
        completos = [c for c, t, ok in filas if t and t == ok]
        if len(completos) < minimo:
            print(f"validate_formato: {len(completos)} curso(s) completos, se exigen {minimo}")
            return 1
        print(f"validate_formato: ok ({len(completos)} de {len(filas)} cursos completos; suelo {minimo})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
