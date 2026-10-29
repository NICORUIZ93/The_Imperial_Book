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
valid_levels = {"Fundamentos", "Aplicación", "Integración", "Experto"}
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
    end = ui.find("{ trackId: '", start + len(marker))
    block = ui[start:end if end >= 0 else len(ui)] if start >= 0 else ""
    if not block:
        errors.append(f"{track_id}: no tiene cita a guía oficial en official-learning-paths.ts")
        continue
    source_match = re.search(r"sourceUrl: '(https://[^']+)'", block)
    if not source_match:
        errors.append(f"{track_id}: falta sourceUrl válida en official-learning-paths.ts")

    if track_id == "cloud":
        module_text = (ROOT / "web/src/app/course-data.ts").read_text(encoding="utf-8")
        module_text = module_text[:module_text.find("export const TRACKS")]
    else:
        module_text = (TRACK_DIR / f"{track_id}.track.ts").read_text(encoding="utf-8")
    real_modules = {int(value) for value in re.findall(r"\bm\((\d+),", module_text)}
    # id + level son el 1er y 4to argumento posicional de createModule(id, title, shortTitle, level, ...).
    # title/shortTitle son strings de comilla simple sin comillas simples sin escapar en su interior.
    leveled = {
        int(module_id): level
        for module_id, level in re.findall(
            r"\bm\((\d+),\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*'(Fundamentos|Aplicación|Integración|Experto)'",
            module_text,
        )
    }
    missing_level = real_modules - leveled.keys()
    if missing_level:
        errors.append(f"{track_id}: módulos sin nivel (Fundamentos/Aplicación/Integración/Experto) asignado={sorted(missing_level)}")
    invalid_level = {mid: lvl for mid, lvl in leveled.items() if lvl not in valid_levels}
    if invalid_level:
        errors.append(f"{track_id}: módulos con nivel inválido={invalid_level}")

if errors:
    raise SystemExit("Validación de rutas oficiales falló:\n- " + "\n- ".join(errors))

print(f"Validación OK: {len(expected)} tracks trazados desde guía oficial hasta nivel (Fundamentos/Aplicación/Integración/Experto) de cada módulo real.")
