# 014 · Corrección de bloqueantes y errores técnicos verificados

**Estado:** en curso
**Origen:** el dueño eligió el 2026-11-18 «bloqueantes primero» tras la auditoría completa
([docs/auditoria/README.md](../docs/auditoria/README.md)).

## Alcance

En cada curso se corrige, sin reescribir el tema completo:

1. Lo que impide pasar de un tema: comandos que fallan tal como se pegan, archivos o dependencias que
   faltan, código que no compila, prerrequisitos de módulos posteriores u otros cursos sin aviso.
2. Las afirmaciones técnicas falsas o desactualizadas que la auditoría verificó por ejecución o fuente primaria.
3. Los restos editoriales visibles para el estudiante («Trazabilidad de la auditoría original», «página N del
   PDF», «El prompt menciona…»).

Cada corrección se verifica ejecutando el código cuando el entorno lo permite, o contra la documentación
oficial cuando no (Swift, Flutter, Android, Maven). Lo que no se pudo verificar queda marcado como tal.
La plantilla nueva, las soluciones y la reescritura por curso son trabajo posterior (specs/013 P5).

Cada informe de `docs/auditoria/` gana una sección «Correcciones aplicadas (specs/014)» con cada defecto
bloqueante y error técnico: `corregido`, `no reproducible` o `pendiente: motivo`.

## Criterios

- **B1** `pendiente` — Los 8 informes por curso tienen su sección de correcciones.
  Verificación: `test $(grep -l "Correcciones aplicadas (specs/014)" docs/auditoria/*.md | wc -l) -ge 8`
- **B2** `pendiente` — Los restos editoriales ya no aparecen en las lecciones.
  Verificación: `! grep -rqE "Trazabilidad de la auditoría original|El prompt menciona|merged\.pdf" web/public/content`
- **B3** `pendiente` — No quedan runtimes ni servicios retirados que la auditoría señaló.
  Verificación: `! grep -rqE "nodejs20\.x|App Mesh|jenkins:lts-jdk17" web/public/content`
- **B4** `pendiente` — Índice, catálogo y validación siguen en verde tras las correcciones.
  Verificación: `python3 scripts/build_curriculum_catalog.py --check && python3 scripts/validate_lesson_labs.py`
