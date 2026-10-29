#!/usr/bin/env python3
"""Comprueba que toda ruta oficial sea trazable, progresiva y apunte a módulos reales."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDES = ROOT / "docs/official-learning-guides.json"
UI = ROOT / "web/src/app/official-learning-paths.ts"
TRACK_DIR = ROOT / "web/src/app/tracks"

expected = {"foundations", "rutaflow", "javascript", "node", "angular", "react", "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "devops", "cloud"}
required_stages = {"Preparar", "Comprender", "Construir", "Asegurar calidad", "Llevar a producción"}
errors: list[str] = []

data = json.loads(GUIDES.read_text(encoding="utf-8"))
guide_ids = {track["id"] for track in data.get("tracks", [])}
if guide_ids != expected:
    errors.append(f"registro de guías incompleto: faltan={sorted(expected-guide_ids)}, sobran={sorted(guide_ids-expected)}")

ui = UI.read_text(encoding="utf-8")
for track in data.get("tracks", []):
    track_id = track["id"]
    if not track.get("url", "").startswith("https://"):
        errors.append(f"{track_id}: URL oficial inválida")
    marker = f"trackId: '{track_id}'"
    start = ui.find(marker)
    end = ui.find("trackId: '", start + len(marker))
    block = ui[start:end if end >= 0 else len(ui)] if start >= 0 else ""
    if not block:
        errors.append(f"{track_id}: no tiene ruta visible")
        continue
    labels = set(re.findall(r"\['([^']+)',", block))
    missing_stages = required_stages - labels
    if missing_stages:
        errors.append(f"{track_id}: faltan etapas {sorted(missing_stages)}")

    if track_id == "cloud":
        module_text = (ROOT / "web/src/app/course-data.ts").read_text(encoding="utf-8")
        module_text = module_text[:module_text.find("export const TRACKS")]
    else:
        module_text = (TRACK_DIR / f"{track_id}.track.ts").read_text(encoding="utf-8")
    real_modules = {int(value) for value in re.findall(r"\bm\((\d+),", module_text)}
    referenced = {int(value) for group in re.findall(r"\[([\d, ]+)\]\]", block) for value in re.findall(r"\d+", group)}
    if referenced != real_modules:
        errors.append(f"{track_id}: módulos sin etapa={sorted(real_modules-referenced)}, referencias inválidas={sorted(referenced-real_modules)}")

if errors:
    raise SystemExit("Validación de rutas oficiales falló:\n- " + "\n- ".join(errors))

print(f"Validación OK: {len(expected)} tracks trazados desde guía oficial hasta preparación, práctica, calidad y producción.")
