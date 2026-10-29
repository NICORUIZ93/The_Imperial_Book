#!/usr/bin/env python3
"""Valida las 75 filas reales del adjunto (su resumen declaraba 74)."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
registry=ROOT/"docs/requested-master-topics.json"
errors=[]
if not registry.exists(): errors.append("falta docs/requested-master-topics.json")
else:
    data=json.loads(registry.read_text(encoding="utf-8"))
    tracks=data.get("tracks",[])
    if len(tracks)!=12: errors.append(f"se esperaban 12 tracks; encontrados {len(tracks)}")
    total=sum(len(item.get("requestedTopics",[])) for item in tracks)
    if total!=75: errors.append(f"las filas del adjunto suman 75; registradas {total}")
    for item in tracks:
        path=ROOT/item["content"]
        if not path.exists(): errors.append(f"{item['track']}: contenido ausente"); continue
        text=path.read_text(encoding="utf-8").lower()
        for topic in item["requestedTopics"]:
            if topic.lower() not in text: errors.append(f"{item['track']}: falta hacer visible {topic}")
        for heading in ("## Trazabilidad de la auditoría original",):
            if heading.lower() not in text: errors.append(f"{item['track']}: falta {heading}")
if errors:
    print("Temas Master solicitados FALLÓ:")
    for error in errors: print(f"- {error}")
    raise SystemExit(1)
print("Temas Master solicitados OK: 75 filas visibles y practicables en 12 tracks.")
