#!/usr/bin/env python3
"""Valida que Clean Code y SOLID sean criterios transversales y no menciones aisladas."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
TRACKS = (
    "foundations", "cloud", "angular", "react", "java", "spring-boot",
    "kotlin-multiplatform", "android", "ios", "flutter", "node",
    "javascript", "devops", "rutaflow",
)
STANDARD = ROOT / "docs" / "ESTANDAR-DE-CODIGO.md"
errors: list[str] = []
files = 0

if not STANDARD.exists():
    errors.append("falta docs/ESTANDAR-DE-CODIGO.md")
else:
    standard = STANDARD.read_text(encoding="utf-8").lower()
    for term in ("corrección", "claridad", "cohesión", "dependencias", "errores", "verificación", "simplicidad", "solid"):
        if term not in standard:
            errors.append(f"estándar: falta {term}")

for track in TRACKS:
    for path in sorted((CONTENT / track).glob("modulo-*.md")):
        files += 1
        if not path.read_text(encoding="utf-8").strip():
            errors.append(f"{path.relative_to(ROOT)}: capítulo vacío")

if errors:
    print("Calidad de código FALLÓ:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"Calidad de código OK: estándar central verificado para {files} capítulos, sin repetirlo en cada lección.")
