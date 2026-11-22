#!/usr/bin/env python3
"""Audita prerrequisitos usados antes de definirse (specs/027 C6-C8).

Heurística determinista (medible, no semántica perfecta):
- Cada tema debe declarar prerrequisitos explícitos (sección 1 del formato único, o
  "#### 2. PRERREQUISITOS" en ficha 14, o una línea "Prerrequisitos:"/ "Para entender esto necesitas").
- Extrae términos técnicos de alta señal (comandos, protocolos, lenguajes, herramientas) usados en el
  cuerpo del tema; reporta los que no aparecen en los prerrequisitos declarados, en el glosario del
  mismo tema, ni en títulos/concepts de temas anteriores del mismo curso.

`--resumen` siempre informa y sale 0. `--check` falla solo para cursos declarados en
`docs/reestructuracion/cursos-desde-cero.json`, para que la migración sea por lotes (C7/C8).
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
INDEX = CONTENT / "topic-index.json"
DECLARADOS = ROOT / "docs/reestructuracion/cursos-desde-cero.json"
OUT_DIR = ROOT / "docs/auditoria"
OUT_JSON = OUT_DIR / "prerrequisitos.json"
OUT_CSV = OUT_DIR / "prerrequisitos.csv"
OUT_MD = OUT_DIR / "prerrequisitos.md"

# Términos de alta señal: solo los que suelen asumirse sin explicar en cursos intro.
TERMS = {
    "api": "API",
    "http": "HTTP",
    "https": "HTTPS",
    "json": "JSON",
    "yaml": "YAML",
    "sql": "SQL",
    "dns": "DNS",
    "tcp": "TCP",
    "ip": "IP",
    "url": "URL",
    "cli": "CLI",
    "ssh": "SSH",
    "git": "Git",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "rest": "REST",
    "grpc": "gRPC",
    "jwt": "JWT",
    "oauth": "OAuth",
    "regex": "expresión regular",
    "terminal": "terminal",
    "shell": "shell",
    "bash": "Bash",
    "python": "Python",
    "java": "Java",
    "node": "Node.js",
    "npm": "npm",
    "maven": "Maven",
    "gradle": "Gradle",
    "linux": "Linux",
    "proceso": "proceso",
    "hilo": "hilo",
    "concurrencia": "concurrencia",
    "latencia": "latencia",
    "puerto": "puerto",
    "endpoint": "endpoint",
    "microservicio": "microservicio",
}

TERM_RE = re.compile(r"\b(" + "|".join(re.escape(k) for k in sorted(TERMS, key=len, reverse=True)) + r")\b", re.I)


def load_declarados() -> list[str]:
    if not DECLARADOS.exists():
        return []
    data = json.loads(DECLARADOS.read_text(encoding="utf-8"))
    return data.get("cursos", data) if isinstance(data, dict) else data


def norm(s: str) -> str:
    s = re.sub(r"^Tema\s*\d+\s*:\s*", "", s, flags=re.I)
    s = re.sub(r"\s*·\s*(Básico|Intermedio|Avanzado|Experto)\s*·\s*\d+\s*min\s*$", "", s, flags=re.I)
    return re.sub(r"\s+", " ", s.lower().strip())


def topic_blocks(path: Path, indexed_titles: set[str] | None = None) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    parts = re.split(r"(?=^### )", text, flags=re.M)
    blocks = []
    for part in parts:
        if not part.startswith("### "):
            continue
        title = part.splitlines()[0][4:].strip()
        if indexed_titles is not None:
            n = norm(title)
            if n not in indexed_titles and norm(re.sub(r"^Tema\s*\d+\s*:\s*", "", title, flags=re.I)) not in indexed_titles:
                continue
        blocks.append({"title": title, "text": part})
    return blocks


def has_prereq_declaration(text: str) -> bool:
    patterns = [
        r"^####\s*(?:1\.\s*)?Ubicación y prerrequisitos\b",
        r"^####\s*2\.\s*PRERREQUISITOS\b",
        r"^####\s*Paso\s*1\b.*prerrequisit",
        r"\*\*Prerrequisitos?:\*\*",
        r"\bPrerrequisitos?:\s",
        r"\bPara entender esto necesitas\b",
        r"\bningún conocimiento previo\b",
        r"\bninguna experiencia\b",
        r"\bdesde cero\b",
    ]
    return any(re.search(p, text, re.I | re.M) for p in patterns)


def local_definitions(text: str) -> set[str]:
    found = set()
    for k, _ in TERMS.items():
        pats = [
            rf"\*\*[^*\n]*\b{re.escape(k)}\b[^*\n]*\*\*",  # bolded/emphasized
            rf"\b{re.escape(k)}\b\s*(?:es|significa|son)\b",
            rf"(?:se llama|llamamos|conocido como|se conoce como)\s+[^.\n]{{0,50}}\b{re.escape(k)}\b",
            rf"\b{re.escape(k)}\b\s*\([^)]+\)",
            rf"^\|\s*[^|\n]*\b{re.escape(k)}\b[^|\n]*\|",  # table row introduces concept
        ]
        if any(re.search(p, text, re.I | re.M) for p in pats):
            found.add(k.lower())
    m2 = re.search(r"(?:Glosario|Definiciones? clave)(.*?)(?:^####|\Z)", text, re.I | re.M | re.S)
    if m2:
        for k in TERM_RE.findall(m2.group(1)):
            found.add(k.lower())
    return found


def declared_terms(text: str) -> set[str]:
    found = set()
    m = re.search(
        r"(?:Ubicación y prerrequisitos|PRERREQUISITOS|Prerrequisitos?:|Para entender esto necesitas)(.*?)(?:^####|\Z)",
        text, re.I | re.M | re.S,
    )
    prereq_text = (m.group(1) if m else "") + "\n" + text[:800]
    for k in TERM_RE.findall(prereq_text):
        found.add(k.lower())
    found |= local_definitions(text)
    return found


def used_terms(text: str) -> set[str]:
    # Remove code fences, URLs, and citation/footer noise.
    body = re.sub(r"```.*?```", " ", text, flags=re.S)
    body = re.sub(r"https?://\S+", " ", body)
    body = re.sub(r"`[^`\n]*`", " ", body)  # inline code/filenames
    body = re.sub(r"^>.*$", " ", body, flags=re.M)
    body = re.sub(r"Fuentes? oficiales?.*$", " ", body, flags=re.I | re.S)
    body = re.sub(r"docs/auditoria/\S+", " ", body)
    return {k.lower() for k in TERM_RE.findall(body)}


def indexed_titles_for(course: str, idx: dict) -> set[str]:
    titles = set()
    mods = idx.get(course, {})
    for items in mods.values():
        for it in items:
            titles.add(norm(it["title"]))
            titles.add(norm(re.sub(r"^Tema\s*\d+\s*:\s*", "", it["title"], flags=re.I)))
    return titles


def audit_course(course: str, idx: dict) -> dict:
    course_dir = CONTENT / course
    files = sorted(course_dir.glob("modulo-*.md"), key=lambda p: int(re.search(r"(\d+)", p.stem).group(1)))
    known: set[str] = set()
    findings = []
    total_topics = 0
    indexed = indexed_titles_for(course, idx)
    for f in files:
        for block in topic_blocks(f, indexed):
            total_topics += 1
            text = block["text"]
            title = block["title"]
            declared = declared_terms(text)
            used = used_terms(text)
            missing_prereq = not has_prereq_declaration(text)
            unknown = sorted(t for t in used - known - declared)
            if course == "foundations" and f.name == "modulo-0.md":
                unknown = [t for t in unknown if t not in {"terminal", "proceso", "python", "linux", "shell", "bash"}]
            known |= used | declared | local_definitions(text) | {norm(title)}
            if missing_prereq or unknown:
                findings.append({
                    "file": str(f.relative_to(ROOT)),
                    "title": title,
                    "missing_prereq": missing_prereq,
                    "unknown_terms": unknown[:8],
                })
    return {"course": course, "topics": total_topics, "findings": findings}


def render(reports: list[dict]) -> tuple[str, str, str]:
    total = sum(r["topics"] for r in reports)
    total_findings = sum(len(r["findings"]) for r in reports)
    data = {"topics": total, "findings": total_findings, "courses": reports}
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["curso", "archivo", "titulo", "missing_prereq", "unknown_terms"])
    for r in reports:
        for f in r["findings"]:
            w.writerow([r["course"], f["file"], f["title"], int(f["missing_prereq"]), " ".join(f["unknown_terms"])])
    lines = [
        "# Auditoría de prerrequisitos / desde cero (specs/027)",
        "",
        f"Temas: {total}. Temas con señal: {total_findings}.",
        "",
        "Heurística determinista: detecta ausencia de declaración de prerrequisitos y términos técnicos de alta señal no vistos antes en el curso ni definidos localmente. No es comprensión semántica completa; sirve para priorizar la migración por lotes.",
        "",
        "| Curso | Temas | Con señal |",
        "|---|---:|---:|",
    ]
    for r in reports:
        lines.append(f"| {r['course']} | {r['topics']} | {len(r['findings'])} |")
    md = "\n".join(lines) + "\n"
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n", buf.getvalue(), md


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resumen", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--curso")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    idx = json.loads(INDEX.read_text(encoding="utf-8"))
    courses = [args.curso] if args.curso else sorted(idx.keys())
    declarados = set(load_declarados())
    reports = [audit_course(c, idx) for c in courses]
    total = sum(r["topics"] for r in reports)
    total_findings = sum(len(r["findings"]) for r in reports)
    json_text, csv_text, md_text = render(reports)

    if args.write:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        OUT_JSON.write_text(json_text, encoding="utf-8")
        OUT_CSV.write_text(csv_text, encoding="utf-8")
        OUT_MD.write_text(md_text, encoding="utf-8")

    if args.json:
        print(json_text, end="")
    else:
        print(f"audit_prerrequisitos: {total} temas en {len(reports)} curso(s); {total_findings} temas con señal de prerequisito/desde-cero")
        for r in reports:
            if r["findings"]:
                print(f"  {r['course']}: {len(r['findings'])}/{r['topics']} temas con hallazgos")
        if not declarados:
            print("  cursos declarados desde-cero: ninguno (C7/C8 pendientes)")
        else:
            print("  cursos declarados desde-cero: " + ", ".join(sorted(declarados)))

    if args.check:
        failures = [r for r in reports if r["course"] in declarados and r["findings"]]
        if failures:
            for r in failures:
                print(f"audit_prerrequisitos: FAIL {r['course']} tiene {len(r['findings'])} hallazgos", file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
