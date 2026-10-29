#!/usr/bin/env python3
"""Valida trazabilidad entre módulos, marcos académicos y evaluación observable."""

import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
MATRIX_PATH = ROOT / "docs" / "curriculum-matrix.json"
SPECIALIZATION_PATH = ROOT / "docs" / "specialization-outcomes.json"
TRACK_PATH = ROOT / "web" / "src" / "app" / "tracks" / "foundations.track.ts"
CONTENT_DIR = ROOT / "web" / "public" / "content" / "foundations"

CS2023_AREAS = {
    "AI", "AL", "AR", "DM", "FPL", "GIT", "HCI", "MSF", "NC", "OS",
    "PDC", "SEC", "SEP", "SDF", "SE", "SPD", "SF",
}
SWEBOK_AREAS = {
    "Software Requirements", "Software Architecture", "Software Design",
    "Software Construction", "Software Testing", "Software Engineering Operations",
    "Software Maintenance", "Software Configuration Management",
    "Software Engineering Management", "Software Engineering Process",
    "Software Engineering Models and Methods", "Software Quality", "Software Security",
    "Software Professional Practice", "Software Engineering Economics",
    "Computing Foundations", "Mathematical Foundations", "Engineering Foundations",
}

matrix = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
source = TRACK_PATH.read_text(encoding="utf-8")
module_ids = [int(value) for value in re.findall(r"^\s*m\((\d+),", source, re.MULTILINE)]
entries = matrix.get("modules", [])
entry_ids = [entry.get("id") for entry in entries]

errors: list[str] = []
if matrix.get("schemaVersion") != 1:
    errors.append("schemaVersion debe ser 1")
if entry_ids != module_ids:
    errors.append(f"IDs de matriz {entry_ids} no coinciden con módulos {module_ids}")
if len(entry_ids) != len(set(entry_ids)):
    errors.append("la matriz contiene IDs duplicados")

covered_cs: set[str] = set()
covered_swebok: set[str] = set()
for entry in entries:
    module_id = entry.get("id")
    content_path = CONTENT_DIR / f"modulo-{module_id}.md"
    if not content_path.exists():
        errors.append(f"módulo {module_id}: falta {content_path.relative_to(ROOT)}")
        continue
    content = content_path.read_text(encoding="utf-8")
    cs_areas = set(entry.get("cs2023", []))
    swebok_areas = set(entry.get("swebok", []))
    covered_cs.update(cs_areas)
    covered_swebok.update(swebok_areas)
    if unknown := cs_areas - CS2023_AREAS:
        errors.append(f"módulo {module_id}: áreas CS2023 desconocidas {sorted(unknown)}")
    if unknown := swebok_areas - SWEBOK_AREAS:
        errors.append(f"módulo {module_id}: áreas SWEBOK desconocidas {sorted(unknown)}")
    for field in ("outcomes", "evidence"):
        values = entry.get(field, [])
        if not isinstance(values, list) or len(values) < 3 or any(not str(v).strip() for v in values):
            errors.append(f"módulo {module_id}: {field} requiere al menos tres elementos")
    if "## Aprende construyendo" not in content or not re.search(r"^### Tema(?:\s|:)", content, re.MULTILINE):
        errors.append(f"módulo {module_id}: falta un recorrido práctico observable")

if len(covered_cs) < 14:
    errors.append(f"cobertura CS2023 insuficiente: {len(covered_cs)} áreas")
if len(covered_swebok) < 14:
    errors.append(f"cobertura SWEBOK insuficiente: {len(covered_swebok)} áreas")

# Los resultados especializados prueban la transferencia de los fundamentos comunes a
# todas las plataformas. Cada módulo debe contribuir a por lo menos un resultado
# observable; no basta con que exista en el catálogo.
specializations = json.loads(SPECIALIZATION_PATH.read_text(encoding="utf-8"))
if specializations.get("schemaVersion") != 1:
    errors.append("specialization-outcomes: schemaVersion debe ser 1")

expected_tracks = {
    "javascript", "node", "angular", "react", "java", "spring-boot",
    "android", "kotlin-multiplatform", "ios", "flutter", "devops", "cloud",
}
track_entries = specializations.get("tracks", [])
track_ids = [entry.get("id") for entry in track_entries]
if set(track_ids) != expected_tracks or len(track_ids) != len(expected_tracks):
    errors.append(
        "specialization-outcomes: tracks deben coincidir exactamente con "
        f"{sorted(expected_tracks)}; encontrados {track_ids}"
    )

levels = {"Fundamentos", "Aplicación", "Integración", "Experto"}
specialized_outcomes = 0
specialized_module_links = 0
seen_outcome_ids: set[str] = set()

for track in track_entries:
    track_id = track.get("id")
    if track_id not in expected_tracks:
        continue
    if track_id == "cloud":
        track_source = (ROOT / "web" / "src" / "app" / "course-data.ts").read_text(encoding="utf-8")
        # COURSE_MODULES termina antes de los grupos de servicios; limitar la
        # búsqueda impide confundir otros números de la aplicación con módulos.
        track_source = track_source.split("export const SERVICE_GROUPS", 1)[0]
    else:
        track_source = (ROOT / "web" / "src" / "app" / "tracks" / f"{track_id}.track.ts").read_text(encoding="utf-8")
    actual_ids = set(int(value) for value in re.findall(r"^\s*m\((\d+),", track_source, re.MULTILINE))
    mapped_ids: set[int] = set()
    outcomes = track.get("outcomes", [])
    if not isinstance(outcomes, list) or len(outcomes) < 4:
        errors.append(f"track {track_id}: requiere al menos cuatro resultados observables")
        continue
    for outcome in outcomes:
        specialized_outcomes += 1
        outcome_id = outcome.get("id")
        if not isinstance(outcome_id, str) or not outcome_id.strip():
            errors.append(f"track {track_id}: resultado sin ID")
        elif outcome_id in seen_outcome_ids:
            errors.append(f"resultado especializado duplicado: {outcome_id}")
        else:
            seen_outcome_ids.add(outcome_id)
        if outcome.get("level") not in levels:
            errors.append(f"resultado {outcome_id}: nivel desconocido {outcome.get('level')}")
        statement = outcome.get("statement", "")
        if not isinstance(statement, str) or len(statement.split()) < 8:
            errors.append(f"resultado {outcome_id}: statement demasiado débil")
        module_links = outcome.get("moduleIds", [])
        if not isinstance(module_links, list) or not module_links or any(not isinstance(value, int) for value in module_links):
            errors.append(f"resultado {outcome_id}: moduleIds debe contener enteros")
            module_links = []
        mapped_ids.update(module_links)
        specialized_module_links += len(module_links)
        for field, minimum in (("evidence", 2), ("cs2023", 1), ("swebok", 1)):
            values = outcome.get(field, [])
            if not isinstance(values, list) or len(values) < minimum or any(not str(value).strip() for value in values):
                errors.append(f"resultado {outcome_id}: {field} requiere al menos {minimum} elemento(s)")
        if unknown := set(outcome.get("cs2023", [])) - CS2023_AREAS:
            errors.append(f"resultado {outcome_id}: áreas CS2023 desconocidas {sorted(unknown)}")
        if unknown := set(outcome.get("swebok", [])) - SWEBOK_AREAS:
            errors.append(f"resultado {outcome_id}: áreas SWEBOK desconocidas {sorted(unknown)}")
    if mapped_ids != actual_ids:
        errors.append(
            f"track {track_id}: módulos trazados {sorted(mapped_ids)} no coinciden con catálogo {sorted(actual_ids)}"
        )
    for module_id in actual_ids:
        content_path = ROOT / "web" / "public" / "content" / track_id / f"modulo-{module_id}.md"
        if not content_path.exists():
            errors.append(f"track {track_id}: falta contenido del módulo {module_id}")

if errors:
    print("Validación curricular FALLÓ:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(
    f"Currículo OK: {len(entries)} módulos trazados, "
    f"{len(covered_cs)}/17 áreas CS2023 y {len(covered_swebok)}/18 áreas SWEBOK; "
    f"{sum(len(entry['outcomes']) for entry in entries)} resultados comunes; "
    f"{specialized_outcomes} resultados especializados conectan "
    f"{specialized_module_links} módulos de {len(expected_tracks)} tracks."
)
