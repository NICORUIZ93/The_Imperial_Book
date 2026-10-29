#!/usr/bin/env python3
"""Evita que un concepto publicado por Floci desaparezca del currículo en español."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
registry = json.loads((ROOT / "docs/floci-official-curriculum.json").read_text(encoding="utf-8"))
content = "\n".join(path.read_text(encoding="utf-8") for path in sorted((ROOT / "web/public/content/cloud").glob("modulo-*.md"))).lower()
missing = []
for topic in registry["platformTopics"]:
    if topic.lower() not in content:
        missing.append(f"plataforma: {topic}")
for provider, services in registry["providers"].items():
    for service in services:
        if service.lower() not in content:
            missing.append(f"{provider}: {service}")
for lab in registry["officialLabs"]:
    if lab.lower() not in content:
        missing.append(f"laboratorio: {lab}")
if missing:
    raise SystemExit("Currículo oficial Floci incompleto:\n- " + "\n- ".join(missing))
print(f"Floci oficial OK: {len(registry['platformTopics'])} temas de plataforma, "
      f"{sum(map(len, registry['providers'].values()))} servicios y {len(registry['officialLabs'])} laboratorios trazados en español.")
