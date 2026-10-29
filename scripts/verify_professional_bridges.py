#!/usr/bin/env python3
"""Comprueba que cada archivo de laboratorio coincide con el código visible de su tema."""
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'examples/professional-bridges/manifest.json').read_text())
tracks=set()
for item in manifest:
    tracks.add(item['track'])
    source=(ROOT/item['path']).read_text()
    start=source.index(item['title'])
    end=re.search(r'^### Tema ',source[start:],re.M)
    block=source[start:start+end.start()] if end else source[start:]
    snippets=[code.strip() for code in re.findall(r'^```\w*\n(.*?)^```',block,re.M|re.S)]
    for name in item['examples']:
        code=(ROOT/name).read_text().strip()
        if code not in snippets:raise SystemExit(f'Archivo distinto de la lección: {name}')
if len(manifest)!=14 or len(tracks)!=14:
    raise SystemExit('Se requiere un laboratorio trazado por cada una de las 14 rutas.')
print('Trazabilidad de laboratorios OK: 14 rutas; archivos iguales al Markdown. No implica ejecución ni revisión pedagógica.')
