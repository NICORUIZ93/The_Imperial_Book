#!/usr/bin/env python3
"""Comprueba trazabilidad y código visible del material del usuario; no califica aprendizaje."""
import json
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
index=json.loads((ROOT/'docs/rutaflow-source-index.json').read_text())
rows=index['files']; sources={x['file'] for x in rows}
assert len(rows)==index['summary']['files']
assert len({x['sha256'] for x in rows})==index['summary']['uniqueFiles']
for row in rows:
    for path in row['destinations']:assert (ROOT/path).is_file(),path
    if 'duplicateOf' in row:assert row['duplicateOf'] in sources
manifest=json.loads((ROOT/'examples/rutaflow-material/manifest.json').read_text())
verification=json.loads((ROOT/'examples/rutaflow-material/verification.json').read_text())
assert {x['title'] for x in manifest} == {x['title'] for x in verification['results']}
for item in manifest:
    text=(ROOT/item['lesson']).read_text()
    start=text.index(item['title']);end=re.search(r'^### Tema ',text[start:],re.M)
    block=text[start:start+end.start()] if end else text[start:]
    snippets=[s.strip() for s in re.findall(r'^```\w*\n(.*?)^```',block,re.M|re.S)]
    for name in item['examples']:
        assert (ROOT/name).read_text().strip() in snippets, f'Archivo y Markdown difieren: {name}'
    for source in item['sourceFiles']:assert source in sources,source
print(f'Material RutaFlow trazado: {len(rows)} archivos, {len(manifest)} temas nuevos y código coincidente. No acredita ejecución.')
