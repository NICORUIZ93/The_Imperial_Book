#!/usr/bin/env python3
"""Integra el HTML validado por Archify con controles móviles de la academia."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('validated_html', type=Path)
    args = parser.parse_args()
    original = args.validated_html.read_text(encoding='utf-8')
    if '</head>' not in original or 'academia-mobile-controls' in original:
        raise SystemExit('Usa el HTML original de una entrega Archify validada, sin adaptación previa.')
    css = (ROOT / 'examples/archify/mobile-controls.css').read_text(encoding='utf-8')
    integrated = original.replace('</head>', f'<style id="academia-mobile-controls">\n{css}</style>\n</head>', 1)
    output = ROOT / 'web/public/visuals/recorrido-estudio.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(integrated, encoding='utf-8')
    receipt = ROOT / 'examples/archify/verification.json'
    data = json.loads(receipt.read_text(encoding='utf-8'))
    data['baseArtifactSha256'] = hashlib.sha256(original.encode('utf-8')).hexdigest()
    data['artifactSha256'] = hashlib.sha256(integrated.encode('utf-8')).hexdigest()
    data['identicalToFinalizedArtifact'] = False
    if 'gates' in data:
        data['baseArtifactGates'] = data.pop('gates')
    data['adaptations'] = ['examples/archify/mobile-controls.css']
    data['integrationBrowserReview'] = 'pending'
    data['note'] = 'Los controles Archify corresponden al HTML original. La adaptación pública cambia únicamente CSS de controles a menos de 720px; requiere pruebas de integración propias.'
    receipt.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Diagrama integrado: {output.relative_to(ROOT)}; verificación de integración pendiente.')


if __name__ == '__main__':
    main()
