#!/usr/bin/env python3
"""Inventario portable; no copia PDFs ni texto de sus páginas al repositorio."""
import argparse
import hashlib
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path('docs/biblioteca/catalogo.json'))
    args = parser.parse_args()
    if not args.root.is_dir():
        parser.error('La raíz de la biblioteca no existe; conecta el disco o cambia --root.')
    import pymupdf
    folders = ['Programacion', 'Bases_Datos', 'Inteligencia_Artificial',
               'Matematicas/Matematicas_Discretas']
    entries = []
    for folder in folders:
        for path in sorted((args.root / folder).rglob('*')):
            if path.suffix.lower() != '.pdf' or path.name.startswith('._'):
                continue
            digest = hashlib.sha256()
            with path.open('rb') as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(block)
            entry = dict(path=path.relative_to(args.root).as_posix(),
                         bytes=path.stat().st_size, sha256=digest.hexdigest())
            try:
                with pymupdf.open(path) as document:
                    entry['pages'] = len(document)
                    entry['encrypted'] = bool(document.needs_pass)
                    # Disponibilidad técnica no significa lectura ni revisión editorial.
                    entry['first_pages_have_text'] = any(
                        page.get_text().strip() for page in list(document.pages(0, min(8, len(document))))
                    ) if not document.needs_pass else False
            except Exception as error:
                entry['error'] = type(error).__name__
            entries.append(entry)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({'schema': 1, 'scope': folders, 'files': entries},
                                     ensure_ascii=False, indent=2) + '\n')
    print(f'{len(entries)} PDFs catalogados en {args.output}; no implica revisión editorial.')


if __name__ == '__main__':
    main()
