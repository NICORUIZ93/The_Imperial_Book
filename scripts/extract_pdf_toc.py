#!/usr/bin/env python3
"""Extrae la tabla de contenidos (outline/bookmarks) de uno o varios PDFs.
No copia el contenido de las páginas: solo la estructura de capítulos/secciones.
Uso: python3 scripts/_extract_toc.py "<ruta.pdf>" ["<ruta2.pdf>" ...]
"""
import sys
from pathlib import Path
import pymupdf

for arg in sys.argv[1:]:
    path = Path(arg)
    print("=" * 80)
    print(path.name)
    print("=" * 80)
    try:
        doc = pymupdf.open(path)
    except Exception as e:
        print(f"  [no se pudo abrir: {type(e).__name__}]")
        continue
    toc = doc.get_toc()
    if toc:
        for level, title, page in toc:
            indent = "  " * (level - 1)
            print(f"{indent}{title.strip()}  ·p{page}")
    else:
        print("  [sin outline; muestro primeras páginas con texto como pista de índice]")
        for i in range(min(14, len(doc))):
            text = doc[i].get_text().strip()
            if text:
                print(f"  --- página {i+1} ---")
                print("  " + text[:1200].replace("\n", "\n  "))
    doc.close()
