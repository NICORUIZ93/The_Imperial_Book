#!/usr/bin/env python3
"""Extrae índices de la biblioteca técnica y los cruza con el currículo visible.

No interpreta una coincidencia textual como cobertura pedagógica. El resultado es un
inventario editorial para revisión: conserva libro, idioma, página y orden del índice.
Configura BOOK_LIBRARY_ROOT con la ruta local de la biblioteca antes de ejecutar.
"""

from __future__ import annotations

import json
import logging
import os
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

from pypdf import PdfReader

logging.getLogger("pypdf").setLevel(logging.ERROR)

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "docs" / "book-curriculum-inventory.json"
OUT_MD = ROOT / "docs" / "listado-maestro-temas-libros.md"
OUT_MAP = ROOT / "docs" / "mapa-integracion-temas-libros.md"

CURRENT_TRACKS = {
    "foundations", "javascript", "node", "angular", "react", "java",
    "spring-boot", "microservices", "kotlin-multiplatform", "android", "ios", "flutter",
    "devops", "cloud", "rutaflow",
}

STACK_ORDER = [
    "foundations", "javascript", "node", "angular", "react", "java",
    "spring-boot", "microservices", "kotlin-multiplatform", "android", "ios", "flutter",
    "devops", "cloud", "rutaflow", "python", "cpp", "data-ai",
    "cybersecurity", "databases", "iot-embedded", "robotics-drones",
    "ui-ux", "game-development", "quantum-computing", "electronics",
    "math-science", "general-technical",
]

CATEGORY_STACK = {
    "ANDROID Books": "android", "Kotlin Books": "kotlin-multiplatform",
    "IOS Books": "ios", "Flutter Books": "flutter", "React Native Books": "react",
    "Java Books": "java", "Python Books": "python", "C++ Books": "cpp",
    "WebDev Books": "javascript", "AI Books": "data-ai", "DataSci Books": "data-ai",
    "Cybersecurity Books": "cybersecurity", "IoT Books": "iot-embedded",
    "Arduino Books": "iot-embedded", "Robotics Books": "robotics-drones",
    "Drones Books": "robotics-drones", "UIUX Books": "ui-ux",
    "GameDev Books": "game-development", "3D Printing Books": "general-technical",
    "Xamarin Books": "general-technical", "Random Books": "general-technical",
    "Programación y lenguajes": "foundations", "Programación y lenguajes": "foundations",
    "Ciberseguridad y criptografía": "cybersecurity", "Ciberseguridad y criptografía": "cybersecurity",
    "Ingeniería de software": "foundations", "Ingeniería de software": "foundations",
    "Inteligencia artificial y visión": "data-ai", "Inteligencia artificial y visión": "data-ai",
    "Bases de datos y nube": "databases", "Electrónica y Arduino": "electronics",
    "Electrónica y Arduino": "electronics", "Computación cuántica": "quantum-computing",
    "Computación cuántica": "quantum-computing",
}


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def technical_pdfs(library: Path) -> list[Path]:
    tech = library / "Colecciones_Importadas_Mac" / "Tech-Books"
    tech_es = library / "Colecciones_Importadas_Mac" / "Libros_de_tecnologia"
    imported = list(tech.rglob("*.pdf")) + list(tech_es.rglob("*.pdf"))
    base = [
        path for path in library.rglob("*.pdf")
        if "Colecciones_Importadas_Mac" not in path.parts
        and "Metadatos_macOS" not in path.parts
    ]
    return sorted({p for p in imported + base if not p.name.startswith("._")})


def stack_for(path: Path, library: Path) -> str:
    for part in path.parts:
        if part in CATEGORY_STACK:
            return CATEGORY_STACK[part]
    rel = str(path.relative_to(library))
    key = normalized(rel)
    rules = [
        ("spring", "spring-boot"), ("angular", "angular"), ("node", "node"),
        ("javascript", "javascript"), ("typescript", "javascript"),
        ("react", "react"), ("java", "java"), ("kotlin", "kotlin-multiplatform"),
        ("android", "android"), ("ios", "ios"), ("flutter", "flutter"),
        ("docker", "devops"), ("linux", "devops"), ("devops", "devops"),
        ("cloud", "cloud"), ("nube", "cloud"), ("python", "python"),
        (" c ", "cpp"), ("cpp", "cpp"), ("machine learning", "data-ai"),
        ("inteligencia artificial", "data-ai"), ("seguridad", "cybersecurity"),
        ("hacking", "cybersecurity"), ("base datos", "databases"),
        ("sql", "databases"), ("robot", "robotics-drones"),
        ("drone", "robotics-drones"), ("arduino", "iot-embedded"),
        ("microcontrol", "iot-embedded"), ("electronica", "electronics"),
        ("circuit", "electronics"), ("matemat", "math-science"),
        ("fisica", "math-science"),
    ]
    padded = f" {key} "
    for token, stack in rules:
        if token in padded:
            return stack
    return "general-technical"


def flatten_outline(reader: PdfReader) -> list[dict]:
    result: list[dict] = []

    def walk(items, depth=0):
        for item in items:
            if isinstance(item, list):
                walk(item, depth + 1)
                continue
            title = str(getattr(item, "title", item)).strip()
            try:
                page = reader.get_destination_page_number(item) + 1
            except Exception:
                page = None
            if useful_heading(title):
                result.append({"title": clean_heading(title), "page": page, "depth": depth})

    try:
        walk(reader.outline)
    except Exception:
        pass
    return result


def clean_heading(line: str) -> str:
    line = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", line)
    line = re.sub(r"\s+", " ", line).strip(" .\t-–—")
    line = re.sub(r"\.{3,}\s*\d+\s*$", "", line).strip()
    return line


def useful_heading(line: str) -> bool:
    line = clean_heading(line)
    low = normalized(line)
    if not 3 <= len(line) <= 180 or len(low.split()) > 24:
        return False
    noise = ("copyright", "isbn", "contents", "contenido", "indice", "index", "preface",
             "prologo", "acknowledg", "bibliograf", "cover", "titulo", "creditos")
    return not any(token in low for token in noise)


def headings_from_pages(reader: PdfReader) -> list[dict]:
    result: list[dict] = []
    pattern = re.compile(
        r"^(?:(?:chapter|cap[ií]tulo|unidad|unit|lesson|lecci[oó]n|parte|part)\s+\w+|"
        r"\d+(?:\.\d+){0,4}[.)]?\s+\S.+)$", re.I
    )
    for index, page in enumerate(reader.pages[:25]):
        try:
            text = page.extract_text() or ""
        except Exception:
            continue
        for raw in text.splitlines():
            title = clean_heading(raw)
            if pattern.match(title) and useful_heading(title):
                result.append({"title": title, "page": index + 1, "depth": title.count(".")})
    # Conserva orden y elimina repeticiones del índice multipágina.
    seen: set[str] = set()
    unique = []
    for item in result:
        key = normalized(item["title"])
        if key and key not in seen:
            seen.add(key)
            unique.append(item)
    return unique[:300]


def language_for(path: Path, headings: list[dict]) -> str:
    text = normalized(path.stem + " " + " ".join(x["title"] for x in headings[:30]))
    es = sum(text.count(w) for w in (" de ", " para ", " introduccion ", " capitulo ", " ejercicios "))
    en = sum(text.count(w) for w in (" the ", " and ", " introduction ", " chapter ", " programming "))
    return "es" if es > en else "en" if en > es else "indeterminado"


def academy_topics() -> list[dict]:
    source = ROOT / "web" / "public" / "content" / "topic-index.json"
    data = json.loads(source.read_text(encoding="utf-8"))
    topics = []
    for track_id, modules in data.items():
        for module_id, module_topics in modules.items():
            for topic in module_topics:
                topics.append({
                    "track": track_id, "module": module_id,
                    "title": topic["title"], "normalized": normalized(topic["title"]),
                })
    return topics


def topic_lookup(topics: list[dict]) -> dict[str, list[dict]]:
    lookup: dict[str, list[dict]] = defaultdict(list)
    for topic in topics:
        for word in set(topic["normalized"].split()):
            lookup[word].append(topic)
    return lookup


def best_existing(title: str, lookup: dict[str, list[dict]]) -> dict | None:
    words = set(normalized(title).split()) - {"de", "la", "el", "y", "a", "the", "and", "of", "to"}
    if len(words) < 2:
        return None
    best, score = None, 0.0
    candidates = {id(topic): topic for word in words for topic in lookup.get(word, [])}.values()
    for topic in candidates:
        other = set(topic["normalized"].split())
        overlap = len(words & other) / len(words | other) if words | other else 0
        if overlap > score:
            best, score = topic, overlap
    return {**best, "score": round(score, 3)} if best and score >= 0.5 else None


def main() -> None:
    library_setting = os.environ.get("BOOK_LIBRARY_ROOT")
    if not library_setting:
        raise ValueError("Define BOOK_LIBRARY_ROOT con la ruta local de la biblioteca técnica.")
    library = Path(library_setting).expanduser().resolve()
    if not library.is_dir():
        raise FileNotFoundError("La biblioteca técnica configurada no está disponible.")
    pdfs = technical_pdfs(library)
    if not pdfs:
        raise FileNotFoundError("No se encontraron libros PDF en la biblioteca configurada.")

    current = academy_topics()
    current_lookup = topic_lookup(current)
    books = []
    errors = []
    for number, path in enumerate(pdfs, 1):
        try:
            reader = PdfReader(str(path), strict=False)
            headings = flatten_outline(reader)
            method = "outline"
            if len(headings) < 3:
                headings = headings_from_pages(reader)
                method = "first-pages"
            for heading in headings:
                heading["existing"] = best_existing(heading["title"], current_lookup)
            books.append({
                "path": path.relative_to(library).as_posix(),
                "title": path.stem, "stack": stack_for(path, library),
                "language": language_for(path, headings), "pages": len(reader.pages),
                "extraction": method, "topics": headings,
            })
        except Exception as exc:
            error = str(exc).replace(f"{library}/", "")
            errors.append({
                "path": path.relative_to(library).as_posix(),
                "error": f"{type(exc).__name__}: {error}",
            })
        if number % 25 == 0:
            print(f"{number} libros procesados", flush=True)

    payload = {
        "summary": {
            "candidateBooks": len(books) + len(errors), "processedBooks": len(books),
            "failedBooks": len(errors), "languages": dict(Counter(b["language"] for b in books)),
            "stacks": dict(Counter(b["stack"] for b in books)),
            "booksWithTopics": sum(1 for b in books if b["topics"]),
            "booksRequiringOcr": sum(1 for b in books if not b["topics"]),
            "extractedTopics": sum(len(b["topics"]) for b in books),
            "matchedHeadings": sum(1 for b in books for t in b["topics"] if t["existing"]),
        },
        "books": books, "errors": errors,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    grouped = defaultdict(list)
    for book in books:
        grouped[book["stack"]].append(book)
    lines = [
        "# Listado maestro de temas extraídos de libros técnicos", "",
        "> Inventario editorial automático. Una coincidencia textual no acredita que el tema esté explicado ni practicable.", "",
        "## Resumen", "",
        f"- Libros candidatos: {payload['summary']['candidateBooks']}",
        f"- Libros procesados: {payload['summary']['processedBooks']}",
        f"- Libros con error de lectura: {payload['summary']['failedBooks']}",
        f"- Libros con índice o encabezados recuperables: {payload['summary']['booksWithTopics']}",
        f"- Libros que requieren OCR/revisión visual: {payload['summary']['booksRequiringOcr']}",
        f"- Encabezados/temas extraídos: {payload['summary']['extractedTopics']}",
        f"- Encabezados con posible correspondencia actual: {payload['summary']['matchedHeadings']}", "",
    ]
    for stack in STACK_ORDER:
        stack_books = grouped.get(stack, [])
        if not stack_books:
            continue
        lines.extend([f"## Stack: {stack}", "", f"Libros: {len(stack_books)}", ""])
        for book in sorted(stack_books, key=lambda b: normalized(b["title"])):
            lines.extend([
                f"### {book['title']}", "",
                f"- Idioma detectado: {book['language']}",
                f"- Páginas: {book['pages']}",
                f"- Fuente: `{book['path']}`", "",
            ])
            if not book["topics"]:
                lines.extend(["- Sin índice textual recuperable; requiere revisión visual/OCR.", ""])
                continue
            for topic in book["topics"]:
                indent = "  " * min(topic["depth"], 3)
                match = topic["existing"]
                status = ""
                if match:
                    status = f" — posible actual: `{match['track']}/módulo-{match['module']}` ({match['score']})"
                page = f" (p. {topic['page']})" if topic["page"] else ""
                lines.append(f"{indent}- {topic['title']}{page}{status}")
            lines.append("")
    if errors:
        lines.extend(["## Pendientes de lectura", ""])
        for error in errors:
            lines.append(f"- `{error['path']}` — {error['error']}")
    OUT_MD.write_text("\n".join(line.rstrip() for line in lines).rstrip() + "\n", encoding="utf-8")

    topic_index = json.loads(
        (ROOT / "web" / "public" / "content" / "topic-index.json").read_text(encoding="utf-8")
    )
    map_lines = [
        "# Mapa de integración de temas obtenidos de los libros", "",
        "> Este mapa organiza la evidencia extraída; no afirma que cada encabezado sea un tema único ni que ya exista una lección completa.", "",
        "## Cobertura del inventario", "",
        "| Stack | Estado en la web | Libros | ES | EN | Idioma por confirmar | Encabezados | Requieren OCR |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for stack in STACK_ORDER:
        stack_books = grouped.get(stack, [])
        if not stack_books:
            continue
        languages = Counter(book["language"] for book in stack_books)
        headings = sum(len(book["topics"]) for book in stack_books)
        ocr = sum(not book["topics"] for book in stack_books)
        state = "actual" if stack in CURRENT_TRACKS else "propuesto"
        map_lines.append(
            f"| `{stack}` | {state} | {len(stack_books)} | {languages['es']} | {languages['en']} | "
            f"{languages['indeterminado']} | {headings} | {ocr} |"
        )

    map_lines.extend(["", "## Stacks actuales: módulos existentes y material localizado", ""])
    for stack in STACK_ORDER:
        if stack not in CURRENT_TRACKS:
            continue
        modules = topic_index.get(stack, {})
        stack_books = grouped.get(stack, [])
        map_lines.extend([
            f"### {stack}", "",
            f"- Base actual: {len(modules)} módulos y {sum(len(items) for items in modules.values())} temas.",
            f"- Biblioteca localizada: {len(stack_books)} libros y {sum(len(book['topics']) for book in stack_books)} encabezados.",
            "- Módulos actuales:",
        ])
        for module_id, topics in sorted(modules.items(), key=lambda item: int(item[0])):
            titles = "; ".join(topic["title"] for topic in topics)
            map_lines.append(f"  - Módulo {module_id}: {titles}")
        map_lines.extend(["", f"- Temas completos extraídos por libro: [sección `{stack}`](listado-maestro-temas-libros.md#stack-{stack}).", ""])

    map_lines.extend(["## Stacks nuevos propuestos por la biblioteca", ""])
    for stack in STACK_ORDER:
        if stack in CURRENT_TRACKS or not grouped.get(stack):
            continue
        stack_books = grouped[stack]
        map_lines.extend([
            f"### {stack}", "",
            f"- {len(stack_books)} libros; {sum(len(book['topics']) for book in stack_books)} encabezados recuperados; "
            f"{sum(not book['topics'] for book in stack_books)} libros pendientes de OCR.",
            f"- Temas completos extraídos por libro: [sección `{stack}`](listado-maestro-temas-libros.md#stack-{stack}).", "",
        ])

    map_lines.extend([
        "## Orden de reorganización antes de integrar", "",
        "1. Resolver los 109 libros sin índice textual mediante OCR o revisión visual.",
        "2. Normalizar y deduplicar encabezados conservando todas sus fuentes y páginas.",
        "3. Separar prerrequisitos, núcleo, práctica profesional y especialización por stack.",
        "4. Comparar cada candidato con la lección real, no sólo con su título.",
        "5. Diseñar módulos nuevos y reubicar temas sólo después de validar dependencias.",
        "6. Convertir cada tema aprobado en explicación, entorno, ejemplo, práctica guiada, ejercicio independiente, diagnóstico, evidencia y proyecto.", "",
        "## Archivos de evidencia", "",
        "- [Listado exhaustivo por stack y libro](listado-maestro-temas-libros.md)",
        "- [Inventario estructurado JSON](book-curriculum-inventory.json)",
    ])
    OUT_MAP.write_text("\n".join(line.rstrip() for line in map_lines).rstrip() + "\n", encoding="utf-8")
    print(json.dumps(payload["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
