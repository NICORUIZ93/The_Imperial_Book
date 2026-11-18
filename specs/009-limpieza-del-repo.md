# 009 · Limpieza del repositorio

**Estado:** vigente
**Origen:** specs/008, fase 1. Regla de la constitución v3: nada sale del repo sin inventario escrito y
aprobación del dueño; lo aprobado se mueve a la rama `archivo` (copia de `main` antes de limpiar).

## Inventario (2026-11-18)

El dueño aprobó los seis grupos el 2026-11-18.

Criterio: archivo que ninguna lección, script, prueba, flujo de CI ni documento vigente usa, o que
quedó de una migración de un solo uso. Se midió buscando el nombre de cada archivo en todo el repo.

| Grupo | Qué es | Archivos | Tamaño |
|---|---|---:|---:|
| A | Inventario de libros sacado por OCR de PDFs (origen de las 73.027 entradas fantasma de specs/006) y sus scripts; el temario unificado se regenera sin libros | 6 + regenerar 2 | 33,5 MB + reducir 63,1 MB |
| B | Resultados viejos de barridos del navegador (`app-flow-inspection-*.json`, no el actual) | 5 | 1,0 MB |
| C | `docs/archivo/`: informes ya archivados de octubre y noviembre | 65 | 3,1 MB |
| D | Inventarios y revisiones antiguas sin referencia (`INVENTARIO-CURSOS-TEMAS-SUBTEMAS.md`, `temas-inventario.md`, revisiones técnicas de Java M2–M4, métricas y revisiones por curso) | 8 | 0,5 MB |
| E | Scripts de migraciones de un solo uso (deduplicar, mover colas, fusionar secciones, preparar un diagrama, auditoría completa vieja) | 5 | < 0,1 MB |
| F | Ejemplos que ninguna lección usa (`cloud-http`, `flutter-testing`, `ios-lab`), una copia duplicada de un visual y una imagen que la web no muestra | 5 | 3,1 MB |

Se conserva, aunque parezca sobrar: los wrappers `gradlew` y `mvnw` de cada laboratorio (cada
proyecto los necesita), las skills de `.claude/`, `scripts/tests/` (los ejecuta `validate.sh`),
`scripts/verify_control1_snippets.py` (verificador útil), `scripts/start.sh`, los runbooks de Cloud y
DevOps (insumo para los cursos de Docker y Kubernetes) y `docs/propuesta-pagina-nueva-academia.md`
(insumo para la web académica).

## Criterios

- **L1** `pendiente` — Existe la rama `archivo` con el estado de `main` anterior a la limpieza.
  Verificación: `git rev-parse --verify archivo`
- **L2** `pendiente` — Los grupos aprobados ya no están en `main` y nada que siga en el repo los cita.
  Verificación: `python3 scripts/validate_repo_cleanup.py`
- **L3** `pendiente` — El temario unificado se construye sin el inventario de libros y la validación
  completa sigue en verde.
  Verificación: `./scripts/validate.sh`
