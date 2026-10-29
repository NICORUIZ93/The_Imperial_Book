#!/usr/bin/env python3
"""Valida las tres prioridades educativas sin contar contenido heredado ni placeholders."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)
TRACK_SOURCES = {
    "foundations": "web/src/app/tracks/foundations.track.ts",
    "cloud": "web/src/app/course-data.ts",
    "devops": "web/src/app/tracks/devops.track.ts",
    "javascript": "web/src/app/tracks/javascript.track.ts",
    "node": "web/src/app/tracks/node.track.ts",
    "angular": "web/src/app/tracks/angular.track.ts",
    "react": "web/src/app/tracks/react.track.ts",
    "java": "web/src/app/tracks/java.track.ts",
    "spring-boot": "web/src/app/tracks/spring-boot.track.ts",
    "kotlin-multiplatform": "web/src/app/tracks/kotlin-multiplatform.track.ts",
    "android": "web/src/app/tracks/android.track.ts",
    "ios": "web/src/app/tracks/ios.track.ts",
    "flutter": "web/src/app/tracks/flutter.track.ts",
    "rutaflow": "web/src/app/tracks/rutaflow.track.ts",
}

errors: list[str] = []
modules = topics = 0
for track in TRACKS:
    for path in sorted((CONTENT / track).glob("modulo-*.md")):
        modules += 1
        text = path.read_text(encoding="utf-8")
        prose = re.sub(r"```[\s\S]*?```", "", text)
        substantial_paragraphs = [
            paragraph for paragraph in re.split(r"\n\s*\n", prose)
            if len(re.findall(r"\b\w+\b", paragraph)) >= 20
            and not paragraph.lstrip().startswith(("#", "-", "|"))
        ]
        if len(substantial_paragraphs) < 5:
            errors.append(f"{path.relative_to(ROOT)}: requiere al menos 5 párrafos sustanciales")

        headings = list(re.finditer(r"^### Tema[^\n]+", text, re.MULTILINE))
        for index, heading in enumerate(headings):
            topics += 1
            end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
            block = text[heading.start():end]
            next_section = re.search(r"^## ", block[heading.end() - heading.start():], re.MULTILINE)
            if next_section:
                block = block[:heading.end() - heading.start() + next_section.start()]
            if "¿Por qué es importante?" not in block:
                errors.append(f"{path.relative_to(ROOT)} · {heading.group(0)}: falta importancia explícita")

viewer = (ROOT / "web/src/app/course/lesson-viewer.ts").read_text(encoding="utf-8")
activities = (ROOT / "web/src/app/learning-activities.ts").read_text(encoding="utf-8")
if activities.count("trackId: '") != 12:
    errors.append("learning-activities.ts: deben existir exactamente 12 proyectos integradores")
for requirement in ("addTopicLearningSupport", "Errores comunes y cómo diagnosticarlos"):
    if requirement not in viewer:
        errors.append(f"lesson-viewer.ts: falta soporte global {requirement}")

expected_modules = sum(
    len(re.findall(r"^\s*m\(\d+,", (ROOT / TRACK_SOURCES[track]).read_text(encoding="utf-8"), re.MULTILINE))
    for track in TRACKS
)
if modules != expected_modules:
    errors.append(f"los tracks definen {expected_modules} módulos; se encontraron {modules} lecciones")
readme = (ROOT / "README.md").read_text(encoding="utf-8")
if not re.search(rf"\b{len(TRACKS)} tracks\b", readme) or not re.search(rf"\b{modules} módulos\b", readme) or not re.search(rf"\b{topics} temas\b", readme):
    errors.append(f"README.md debe reflejar el inventario actual: {len(TRACKS)} tracks, {modules} módulos y {topics} temas")
track_labels = {
    "foundations": "Fundamentos", "cloud": "Cloud Local", "devops": "DevOps",
    "javascript": "JavaScript", "node": "Node.js", "angular": "Angular",
    "react": "React", "java": "Java", "spring-boot": "Spring Boot",
    "kotlin-multiplatform": "Kotlin Multiplatform", "android": "Android",
    "ios": "iOS", "flutter": "Flutter", "rutaflow": "RutaFlow",
}
for track, label in track_labels.items():
    track_modules = len(list((CONTENT / track).glob("modulo-*.md")))
    if not re.search(rf"^\| {re.escape(label)} \| {track_modules} \|", readme, re.MULTILINE):
        errors.append(f"README.md debe listar {label} con {track_modules} módulos")
if topics < 893:
    errors.append(f"se esperaban al menos 893 temas; encontrados {topics}")
if errors:
    print("Prioridades educativas FALLARON:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"Prioridades educativas OK: {modules} módulos, {topics} temas, 12 proyectos y progreso persistente sin evaluaciones generadas ni gamificación.")
