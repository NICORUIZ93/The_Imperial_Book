#!/usr/bin/env python3
"""Impide que las rutas tecnológicas pierdan sus fuentes oficiales o envejezcan silenciosamente."""

from datetime import date
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "docs" / "official-sources.json"
ATLAS = ROOT / "docs" / "official-topic-atlas.json"
EXPECTED = {
    "javascript", "node", "angular", "react", "java", "spring-boot",
    "kotlin-multiplatform", "android", "ios", "flutter", "devops", "cloud",
}
OFFICIAL_HOSTS = {
    "tc39.es", "nodejs.org", "angular.dev", "react.dev", "openjdk.org",
    "spring.io", "github.com", "kotlinlang.org", "developer.android.com",
    "swift.org", "www.swift.org", "developer.apple.com", "docs.flutter.dev",
    "dart.dev", "kubernetes.io", "opentelemetry.io", "developer.hashicorp.com",
    "aws.amazon.com", "azure.microsoft.com", "cloud.google.com",
}

data = json.loads(REGISTRY.read_text(encoding="utf-8"))
errors: list[str] = []
entries = data.get("tracks", [])
ids = [entry.get("id") for entry in entries]
if data.get("schemaVersion") != 1:
    errors.append("schemaVersion debe ser 1")
if set(ids) != EXPECTED or len(ids) != len(EXPECTED):
    errors.append(f"rutas encontradas {ids}; se esperaban {sorted(EXPECTED)}")

reviewed = date.fromisoformat(data["reviewedAt"])
age = (date.today() - reviewed).days
max_age = int(data.get("maxAgeDays", 120))
if age < 0:
    errors.append("reviewedAt está en el futuro")
if age > max_age:
    errors.append(f"revisión oficial vencida: {age} días (máximo {max_age})")

for entry in entries:
    track_id = entry.get("id")
    if not entry.get("baseline"):
        errors.append(f"{track_id}: falta versión o línea de referencia")
    sources = entry.get("sources", [])
    if len(sources) < 3:
        errors.append(f"{track_id}: requiere al menos tres fuentes oficiales")
    for source in sources:
        parsed = urlparse(source)
        if parsed.scheme != "https" or parsed.hostname not in OFFICIAL_HOSTS:
            errors.append(f"{track_id}: fuente no permitida {source}")
    content_path = ROOT / entry.get("content", "")
    if not content_path.exists():
        errors.append(f"{track_id}: no existe {entry.get('content')}")
        continue
    content = content_path.read_text(encoding="utf-8")
    for term in entry.get("requiredTerms", []):
        if term.lower() not in content.lower():
            errors.append(f"{track_id}: falta incorporar el término oficial {term!r}")
    for term in entry.get("forbiddenTerms", []):
        if term.lower() in content.lower():
            errors.append(f"{track_id}: conserva una referencia obsoleta {term!r}")

if not ATLAS.exists():
    errors.append("falta docs/official-topic-atlas.json")
    atlas_entries = []
else:
    atlas_entries = json.loads(ATLAS.read_text(encoding="utf-8")).get("tracks", [])
    atlas_ids = {entry.get("id") for entry in atlas_entries}
    if atlas_ids != EXPECTED:
        errors.append("el atlas no cubre exactamente los doce stacks oficiales")
    for item in atlas_entries:
        track_id = item.get("id")
        if item.get("topicCount", 0) < 35:
            errors.append(f"{track_id}: atlas con menos de 35 temas")
        atlas_content = ROOT / item.get("content", "")
        if not atlas_content.exists():
            errors.append(f"{track_id}: no existe el contenido del atlas")
            continue
        text = atlas_content.read_text(encoding="utf-8")
        if "## Atlas completo de temas oficiales" not in text or item.get("source", "") not in text:
            errors.append(f"{track_id}: el capítulo no publica atlas y fuente primaria")

if errors:
    print("Fuentes oficiales FALLÓ:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"Fuentes oficiales OK: {len(entries)} rutas, revisión de {age} días, {sum(len(e['sources']) for e in entries)} fuentes primarias y {sum(e.get('topicCount', 0) for e in atlas_entries)} temas auditados.")
