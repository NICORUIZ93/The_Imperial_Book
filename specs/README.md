# Especificaciones (SDD)

Este repositorio se trabaja con **desarrollo guiado por especificación** (Spec-Driven Development).
La especificación es la única fuente de verdad: primero se escribe o corrige el criterio aquí, y
solo después se cambia el código o el contenido. Así ninguna sesión (humana o de IA) repite un
arreglo que ya está hecho ni reinterpreta una regla que ya se acordó.

## Ciclo

1. **Especificar:** agrega o edita un archivo `specs/NNN-nombre.md` con criterios numerados.
2. **Implementar:** el agente o la persona trabaja solo contra los criterios en estado `pendiente`.
3. **Verificar:** cada criterio declara un comando ejecutable; `scripts/validate.sh` comprueba la
   trazabilidad y CI ejecuta las verificaciones.
4. **Cerrar o mejorar:** si la revisión descubre un caso nuevo, primero se agrega un criterio y
   después se cambia el código. Un criterio cumplido pasa a `hecho`; nunca se borra.

## Formato de un criterio

```text
- **C3** `hecho` — Ningún enlace de lección sale de `web/public/content` con rutas relativas.
  Verificación: `python3 scripts/audit_lesson_links.py`
```

- Identificador único dentro del archivo (`C1`, `C2`… o `V1`, `V2`…).
- Estado entre comillas invertidas: `pendiente`, `en-curso`, `hecho` o `descartado`.
- Una línea `Verificación:` con un comando entre comillas invertidas. Si el comando cita un
  archivo del repositorio (`scripts/…`, `web/…`), ese archivo debe existir.

## Comandos

```bash
python3 scripts/validate_specs.py          # estructura y trazabilidad (corre en validate.sh)
python3 scripts/validate_specs.py --run    # además ejecuta cada verificación de criterios `hecho`
```

## Índice

| Spec | Tema | Estado |
|---|---|---|
| [001](001-correcciones-revision-2026-11-18.md) | Correcciones de la revisión completa del 2026-11-18 | hecho |
| [002](002-estandar-temas-con-capturas-y-ayudas.md) | Estándar para crear temas con capturas, ayudas de código y ayudas visuales | vigente |
| [003](003-prompt-maestro-v2-de-cero-a-master.md) | Prompt maestro v2, ingreso de capturas y cobertura de cero a master | vigente |
| [004](004-programa-cursos-de-cero-a-master.md) | Programa: todas las rutas con temas reales y el estándar del prompt maestro | vigente |
| [005](005-integracion-total-capturas-y-skillevaluator.md) | Integración total de capturas, video Flutter y SkillEvaluator | hecho |
| [006](006-integridad-del-temario-sin-fantasmas-ni-huecos.md) | Integridad del temario: cero temas fantasma y cero huecos | vigente |
| [tracks/](tracks/) | Una spec por ruta con criterios T1–T7 y sus temas reales pendientes | en-curso |
