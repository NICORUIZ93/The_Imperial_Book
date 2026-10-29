#!/usr/bin/env python3
"""Valida trazabilidad del PDF y reproduce los ejemplos nuevos contra sus lecciones."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    data = json.loads((ROOT / 'docs/merged-pdf-index.json').read_text())
    pages = data['pages']
    if [page['page'] for page in pages] != list(range(1, 70)):
        raise SystemExit('El índice debe contener una sola entrada para cada una de las 69 páginas.')
    for page in pages:
        destination = page['destination']
        if destination and not (ROOT / destination).is_file():
            raise SystemExit(f"Página {page['page']}: falta destino {destination}")
    if len(sys.argv) > 1:
        source = Path(sys.argv[1])
        if hashlib.sha256(source.read_bytes()).hexdigest() != data['source']['sha256']:
            raise SystemExit('El PDF no coincide con el ejemplar revisado.')
    lesson = (ROOT / 'web/public/content/foundations/modulo-12.md').read_text()
    matches = re.findall(r'Ubicación: `([^`]+)`\.[\s\S]*?```python\n(.*?)\n```[\s\S]*?\*\*Salida esperada:\*\*\s*```text\n(.*?)\n```', lesson, flags=re.DOTALL)
    if len(matches) != 17:
        raise SystemExit(f'Se esperaban 17 modelos con salida; encontrados {len(matches)}.')
    for relative, code, expected in matches:
        path = ROOT / relative
        if path.read_text().strip() != code.strip():
            raise SystemExit(f'Código de la lección distinto del archivo {relative}.')
        result = subprocess.run([sys.executable, str(path)], capture_output=True, text=True, timeout=10)
        if result.returncode or result.stdout.strip() != expected.strip():
            raise SystemExit(f'{relative}: salida diferente de la documentada. {result.stderr}')
    subprocess.run([sys.executable, str(ROOT / 'examples/electronics/diodos-pdf.py')], check=True, capture_output=True, timeout=10)
    print('Integración PDF OK: 69 páginas trazadas, 17 modelos reproducidos y estados de diodos comprobados.')


if __name__ == '__main__':
    main()
