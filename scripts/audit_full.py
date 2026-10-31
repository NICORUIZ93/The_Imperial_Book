#!/usr/bin/env python3
"""Auditoría completa — The Imperial Book (v3: split determinista por '### Tema N:')."""
from __future__ import annotations
import argparse, json, re, sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path

from audit_code_visual_quality import official_source_urls

REPO = Path(__file__).resolve().parent.parent
CONTENT = REPO / "web" / "public" / "content"
OUT_MD = REPO / "docs" / "revision-completa.md"

# Convención del repo: ### Tema N: título, más los "### Tema complementario".
TEMA_H3 = re.compile(r"^###\s+(Tema\b.+)$", re.MULTILINE | re.IGNORECASE)
TEMA_PREFIX = re.compile(r"^Tema\s+\d+[:.]?\s*", re.IGNORECASE)
H2 = re.compile(r"^##\s+(.+)$", re.MULTILINE)

PASOS = {
    "P1_resultado":      r"(?i)\b(resultado|objetivo|al finalizar podrás|qué vas a (lograr|construir|aprender))\b",
    "P2_prerrequisitos": r"(?i)\b(prerrequisito|conocimiento previo|requisito|antes de empezar)\b",
    "P3_codigo":         r"```(?:python|py|js|javascript|java|kt|kotlin|swift|ts|typescript|dart|go|rs|rust|bash|sh|yaml|yml|json|xml|html|css|sql)",
    "P4_comando":        r"(?i)(```(?:bash|sh|shell|console|terminal)|^\s*\$\s+\w+|^\s*(npm|npx|python3?|java|go|dart|flutter|cargo|mvn|gradle|docker|kubectl|aws|az|gcloud|terraform|git)\s+\w+)",
    "P5_fallo":          r"(?i)\b(fallo deliberado|fallo intencional|error intencional|provoca|rompe|diagnóstico|qué falla)\b",
    "P6_modificacion":   r"(?i)\b(modifica|ejercicio|tu turno|reto|intenta|resuelve|amplía|práctica guiada)\b",
    "P7_rutaflow":       r"(?i)\bRutaFlow\b",
}

CASO_REAL = re.compile(r"(?i)\b(caso real|¿por qué es importante|en producción|en una empresa|en la industria|escenario real|caso de uso real|aplicación real|mundo real)\b")
MERMAID = re.compile(r"```mermaid")
# Mismo criterio que scripts/audit_code_visual_quality.py: diagrama marcado como ASCII.
ASCII_DIAGRAM = re.compile(r"\*\*Diagrama:\*\*\s*\n\s*```(?:text)?\s*\n")

@dataclass
class Tema:
    track: str; modulo: str; titulo: str; archivo: str; linea: int
    palabras: int = 0
    pasos: dict = field(default_factory=dict)
    faltantes: list = field(default_factory=list)
    tiene_fuente: bool = False
    tiene_caso_real: bool = False
    tiene_mermaid: bool = False
    tiene_ascii: bool = False
    prioridad: str = "OK"
    profundidad: str = "básica"
    urls: list = field(default_factory=list)
    def to_dict(self): return asdict(self)

def structural_text(text: str) -> str:
    """Blanquea bloques de código para que un '##' dentro de un ejemplo no corte el tema."""
    return re.sub(
        r"^```[^\n]*\n[\s\S]*?^```[ \t]*$",
        lambda match: re.sub(r"[^\n]", " ", match.group()),
        text,
        flags=re.MULTILINE,
    )


def split_temas(texto, archivo, track, modulo):
    """Split determinista: H3 '### Tema …'. Fin = siguiente H2 o H3."""
    estructura = structural_text(texto)
    matches = list(TEMA_H3.finditer(estructura))
    if not matches:
        # Fallback último: un solo tema = módulo entero
        t = Tema(track=track, modulo=modulo, titulo=modulo, archivo=archivo, linea=1, palabras=len(texto.split()))
        t._cuerpo = texto
        return [t]
    # Marcadores de fin: cualquier H2 o H3 posterior, ignorando bloques de código.
    all_headers = sorted(
        [m.start() for m in H2.finditer(estructura)] + [m.start() for m in TEMA_H3.finditer(estructura)],
    )
    temas = []
    for m in matches:
        titulo = TEMA_PREFIX.sub("", m.group(1).strip())
        inicio = m.end()
        fin = len(texto)
        for h in all_headers:
            if h > m.start():
                fin = h; break
        cuerpo = texto[inicio:fin]
        linea = texto[: m.start()].count("\n") + 1
        t = Tema(track=track, modulo=modulo, titulo=titulo, archivo=archivo, linea=linea, palabras=len(cuerpo.split()))
        t._cuerpo = cuerpo
        temas.append(t)
    return temas

def evaluar(t):
    c = getattr(t, "_cuerpo", "")
    t.pasos = {k: bool(re.search(p, c, re.MULTILINE)) for k, p in PASOS.items()}
    t.faltantes = [k for k, v in t.pasos.items() if not v]
    urls = official_source_urls(c)
    t.tiene_fuente = bool(urls)
    t.tiene_caso_real = bool(CASO_REAL.search(c))
    t.tiene_mermaid = bool(MERMAID.search(c))
    t.tiene_ascii = bool(ASCII_DIAGRAM.search(c))
    t.urls = urls[:3]
    w = t.palabras
    t.profundidad = "insuficiente" if w < 150 else "básica" if w < 400 else "adecuada" if w < 800 else "profunda"
    if not t.pasos["P3_codigo"] and not t.pasos["P4_comando"]:
        t.prioridad = "P0"
    elif t.faltantes:
        t.prioridad = "P1"
    elif not t.tiene_fuente or not t.tiene_caso_real:
        t.prioridad = "P2"
    elif t.tiene_ascii and not t.tiene_mermaid:
        t.prioridad = "P3"
    else:
        t.prioridad = "OK"

def recolectar(track_filter=None):
    if not CONTENT.exists(): sys.exit(f"No existe {CONTENT}")
    temas = []
    for md in sorted(CONTENT.glob("*/modulo-*.md")):
        track = md.parent.name
        if track_filter and track != track_filter: continue
        texto = md.read_text(encoding="utf-8")
        rel = str(md.relative_to(REPO))
        for t in split_temas(texto, rel, track, md.stem):
            evaluar(t); temas.append(t)
    return temas

def shingles(texto, k=5):
    words = re.findall(r"\w+", texto.lower())
    if len(words) < k: return set(words)
    return {" ".join(words[i:i+k]) for i in range(len(words)-k+1)}

def detectar_duplicados(temas, umbral=0.6):
    idx = [t for t in temas if getattr(t, "_cuerpo", None) and t.palabras > 100]
    sets = {id(t): shingles(t._cuerpo) for t in idx}
    dups = []
    for i, a in enumerate(idx):
        sa = sets[id(a)]
        if not sa: continue
        for b in idx[i+1:]:
            if a.track == b.track: continue
            sb = sets[id(b)]
            if not sb: continue
            inter = len(sa & sb); union = len(sa | sb)
            if union and inter/union >= umbral:
                dups.append((a, b, round(inter/union, 3)))
    dups.sort(key=lambda x: -x[2])
    return dups

def pct(n, d): return f"{100*n//d}%" if d else "0%"

def generar_informe(temas, duplicados, track_filter=None):
    L = []; a = L.append
    total = len(temas)
    por_track = defaultdict(list)
    for t in temas: por_track[t.track].append(t)
    completos = sum(1 for t in temas if not t.faltantes)
    cf = sum(1 for t in temas if t.tiene_fuente)
    cc = sum(1 for t in temas if t.tiene_caso_real)
    cm = sum(1 for t in temas if t.tiene_mermaid)
    ca = sum(1 for t in temas if t.tiene_ascii)
    insuf = sum(1 for t in temas if t.profundidad == "insuficiente")
    pr = Counter(t.prioridad for t in temas)
    fg = Counter()
    for t in temas:
        for f in t.faltantes: fg[f] += 1

    a("# Revisión completa — The Imperial Book\n")
    a(f"Generado: `{datetime.now().isoformat(timespec='seconds')}`\n")
    if track_filter: a(f"Filtro: track = `{track_filter}`\n")
    a("> Mide PRESENCIA de marcadores, no calidad pedagógica ni ejecución real.")
    a("> Fuentes oficiales y ASCII usan el detector de `scripts/audit_code_visual_quality.py`;")
    a("> profundidad y duplicados usan los umbrales de este script.\n")
    a("## Resumen ejecutivo\n")
    a("| Métrica | Valor |\n|---|---:|")
    a(f"| Temas totales | **{total}** |")
    a(f"| Completos (7/7 pasos) | **{completos}/{total}** ({pct(completos, total)}) |")
    a(f"| Con fuente oficial | **{cf}/{total}** ({pct(cf, total)}) |")
    a(f"| Con caso real | **{cc}/{total}** ({pct(cc, total)}) |")
    a(f"| Con Mermaid | **{cm}/{total}** |")
    a(f"| ASCII pendiente | **{ca}** |")
    a(f"| Profundidad insuficiente | **{insuf}** |")
    a(f"| Duplicados cross-track | **{len(duplicados)}** |\n")
    a("## Distribución por prioridad\n")
    a("| Prioridad | Significado | Temas |\n|---|---|---:|")
    a(f"| P0 | Sin código NI comando | {pr['P0']} |")
    a(f"| P1 | Falta ≥1 paso de los 7 | {pr['P1']} |")
    a(f"| P2 | Sin fuente o sin caso real | {pr['P2']} |")
    a(f"| P3 | ASCII sin Mermaid | {pr['P3']} |")
    a(f"| OK | Cumple los 4 ejes | {pr['OK']} |\n")
    a("## Pasos faltantes (global)\n")
    a("| Paso | Temas que lo omiten |\n|---|---:|")
    for k, v in fg.most_common(): a(f"| {k} | {v} |")
    a("\n## Cobertura por track\n")
    a("| Track | Módulos | Temas | 7/7 | Fuente | Caso | Mermaid | ASCII | P0 | P1 |")
    a("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
    for track, ts in sorted(por_track.items()):
        mods = len({t.modulo for t in ts})
        a(f"| {track} | {mods} | {len(ts)} | {sum(1 for t in ts if not t.faltantes)} | "
          f"{sum(1 for t in ts if t.tiene_fuente)} | {sum(1 for t in ts if t.tiene_caso_real)} | "
          f"{sum(1 for t in ts if t.tiene_mermaid)} | {sum(1 for t in ts if t.tiene_ascii and not t.tiene_mermaid)} | "
          f"{sum(1 for t in ts if t.prioridad == 'P0')} | {sum(1 for t in ts if t.prioridad == 'P1')} |")
    a("\n## Listado de temas por curso\n")
    for track, ts in sorted(por_track.items()):
        a(f"### Track: {track} ({len(ts)} temas en {len({t.modulo for t in ts})} módulos)\n")
        actual = None
        for t in ts:
            if t.modulo != actual:
                actual = t.modulo
                a(f"**{t.modulo}**\n")
                a("| # | Tema | Línea | Palabras | Prioridad | Faltantes |")
                a("|---|---|---:|---:|---|---|")
            falta = ", ".join(t.faltantes) if t.faltantes else "—"
            a(f"| {t.linea} | {t.titulo} | {t.linea} | {t.palabras} | {t.prioridad} | {falta} |")
        a("")
    def tabla(lista, cols):
        a("| " + " | ".join(cols) + " |")
        a("|" + "|".join("---" for _ in cols) + "|")
        for t in lista:
            fila = []
            for c in cols:
                if c == "Falta": fila.append(", ".join(t.faltantes) or "—")
                elif c == "Profundidad": fila.append(t.profundidad)
                elif c == "Archivo:Línea": fila.append(f"{t.archivo}:{t.linea}")
                else: fila.append(str(getattr(t, c.lower(), "—")))
            a("| " + " | ".join(fila) + " |")
        a("")
    for prio, titulo, cols in [
        ("P0", "Temas P0 — sin código NI comando", ["Track", "Módulo", "Tema", "Archivo:Línea"]),
        ("P1", "Temas P1 — incompletos", ["Track", "Módulo", "Tema", "Profundidad", "Falta"]),
        ("P2", "Temas P2 — sin fuente o sin caso real", ["Track", "Módulo", "Tema", "Archivo:Línea"]),
        ("P3", "Temas P3 — ASCII pendiente", ["Track", "Módulo", "Tema", "Archivo:Línea"]),
    ]:
        lst = [t for t in temas if t.prioridad == prio]
        if lst: a(f"## {titulo} ({len(lst)})\n"); tabla(lst, cols)
    if duplicados:
        a(f"## Posibles duplicados entre tracks ({len(duplicados)})\n")
        a("| Track A | Tema A | Track B | Tema B | Jaccard |\n|---|---|---|---|---:|")
        for a_t, b_t, j in duplicados[:200]:
            a(f"| {a_t.track} | {a_t.titulo} | {b_t.track} | {b_t.titulo} | {j} |")
        a("")
    a("## Recomendaciones priorizadas\n")
    recs = []
    if pr['P0']: recs.append(f"1. **Corregir {pr['P0']} temas P0** (sin código ni comando).")
    if pr['P1']: recs.append(f"2. **Completar {pr['P1']} temas P1** (falta ≥1 paso).")
    if cf < total: recs.append(f"3. **Añadir fuente oficial a {total-cf} temas**.")
    if cc < total: recs.append(f"4. **Añadir caso real a {total-cc} temas**.")
    if ca: recs.append(f"5. **Convertir {ca} ASCII a Mermaid**.")
    if duplicados: recs.append(f"6. **Revisar {len(duplicados)} duplicados cross-track**.")
    if insuf: recs.append(f"7. **Ampliar {insuf} temas insuficientes**.")
    recs.append(f"8. **Iniciar revisión humana**: 0/{total} revisados pedagógicamente.")
    a("\n".join(recs)); a("")
    a("## Límites\n\n- Mide presencia, no calidad ni ejecución.\n- Similitud = Jaccard sobre shingles de 5 palabras.\n- No sustituye revisión humana.\n")
    return "\n".join(L)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--track"); ap.add_argument("--out", default=str(OUT_MD))
    ap.add_argument("--json", action="store_true"); ap.add_argument("--check", action="store_true")
    ap.add_argument("--no-similarity", action="store_true"); ap.add_argument("--threshold", type=float, default=0.6)
    args = ap.parse_args()
    temas = recolectar(args.track)
    if not temas: sys.exit("No hay temas")
    dups = [] if args.no_similarity else detectar_duplicados(temas, args.threshold)
    if args.json:
        print(json.dumps({"temas": [t.to_dict() for t in temas],
                          "duplicados": [(a.track, a.titulo, b.track, b.titulo, j) for a, b, j in dups]},
                         ensure_ascii=False, indent=2)); return
    informe = generar_informe(temas, dups, args.track)
    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(informe, encoding="utf-8")
    pr = Counter(t.prioridad for t in temas)
    print(f"Informe: {out}")
    print(f"Temas: {len(temas)} | 7/7: {sum(1 for t in temas if not t.faltantes)} | "
          f"P0: {pr['P0']} | P1: {pr['P1']} | P2: {pr['P2']} | P3: {pr['P3']} | OK: {pr['OK']}")
    print(f"Duplicados cross-track: {len(dups)}")
    if args.check and pr["P0"] > 0:
        print(f"FAIL: {pr['P0']} temas P0", file=sys.stderr); sys.exit(1)

if __name__ == "__main__":
    main()
