# Pendientes del proyecto

Lista generada en la revisión completa del 2026-11-24. Marcar con `[x]` al cerrar cada punto.

## P1 · Contenido (prioridad Java, Spring Boot, Microservicios)

- [x] **Quitar el texto de relleno repetido** (2026-11-24: 8 secciones de plantilla en 1.301 temas, más las plantillas «Entender X te permite…», «Este tema te guía por…» y la frase genérica de analogías; −53.000 líneas).
- [ ] **Reescribir con contenido propio de cada tema** las secciones quitadas (por qué existe, qué puede salir mal, regla práctica, preguntas), curso por curso: Flutter, iOS, Angular y luego el resto. Antes: el relleno era Unos 1.300 temas tienen exactamente las mismas frases: «Resuelve un problema real de diseño o implementación y evita decisiones a ciegas», «Verifica con evidencia observable», «Mide antes de adoptar complejidad», «Conoce el caso donde NO usarlo» y «Dónde se rompe la analogía: en software, los efectos dependen del contexto…» (1.146 veces). Cada tema necesita su propio porqué, su riesgo y su límite.

- [x] **Quitar notas internas de las lecciones.** (2026-11-24: rutas cambiadas a `~/labs/…`, notas de visual eliminadas, nombres `floci-` de Angular corregidos.) 38 archivos (23 de Java) citan rutas temporales como `/tmp/opencode/aurora-m16`; además hay textos como "No hay visual aprobado para M1 todavía" (Spring Boot M1–M2). Buscar con `grep -rnE '/tmp/|opencode|No hay visual aprobado' web/public/content`.
- [ ] **Revisar las 106 "Nota de verificación: no se ejecutó…"** (41 archivos): ejecutar el laboratorio y poner la salida real, o reescribir la nota para el estudiante.
- [ ] **Spring Boot: decidir Maven o Gradle.** M0–M2 están reescritos con Spring Boot 4.2 pero en Maven; la decisión del proyecto es Gradle.
- [ ] **Spring Boot M3–M20: reescribir.** Son esqueletos de 280 a 900 palabras sobre Spring Boot 3.5. Promedio del curso: ~1.000 palabras por módulo (Java: ~4.300).
- [ ] **Spring Boot M3–M20: corregir la fecha falsa de verificación.** Dicen "verificado el 2026-05-22 con JDK 27", que no existía en mayo.
- [ ] **Microservicios con Spring Boot (16 módulos): ampliar.** ~1.500 palabras por módulo; debe ser el curso más completo.
- [ ] **Microservicios con Node.js (16 módulos): ampliar.** ~1.300 palabras por módulo; M12–M15 anuncian 5 temas y desarrollan 4.
- [ ] **Alinear lo que se anuncia con lo que se escribe.** En 85 de 319 módulos la lista de temas de `web/src/app/tracks/*.track.ts` no coincide con los temas del `.md` (Spring Boot M15: anuncia 9, escribe 3).
- [ ] **Aplicar el formato único a todos los cursos.** Hoy conviven al menos 4 estructuras; el estilo nuevo (Mecanismo, Regla práctica) solo está en 7 módulos de Java y 3 de Spring Boot.
- [ ] **Agregar pantallazos reales.** Solo Control 1 tiene imágenes; el resto usa Mermaid o visuales HTML.

## P2 · Índice y navegación

- [ ] **Sacar las secciones que no son temas del índice.** ~90 entradas son "Prerrequisitos", "Estructura del proyecto", "settings.gradle.kts", "build.gradle.kts", "application.yml", "Comprueba lo construido", etc. (sobre todo en Microservicios Spring y JavaScript). Ajustar `scripts/build_web_topic_index.py` y regenerar; el conteo "1.759 temas" del README bajará.
- [ ] **Arreglar el chequeo de paridad de `scripts/validate.sh`.** Dice que verifica cada módulo pero solo exige que el curso tenga al menos un `.md`; hacerlo módulo por módulo.

## P3 · Visuales

- [ ] **Decidir qué hacer con los 34 visuales HTML sin usar** (de 63; ~9,5 MB, 23 de Java): enlazarlos desde su lección o moverlos a la rama `archivo`.
- [ ] **Reducir el peso de los visuales** (~800 KB cada uno por fuentes incrustadas).
- [x] **Piloto de visuales animados** con Dashmotion y Animdiagram (ver `docs/referencias/REPOS_HERRAMIENTAS.md`).
- [ ] **Extender las figuras animadas** a más temas de Java, Spring Boot y Microservicios.

## P4 · Repositorio y herramientas

- [ ] **Quitar o restaurar la insignia de CI del README.** Apunta a `ci.yml`, borrado en el commit `f6a0b0ff`. Opción: volver a crear un workflow que corra `validate.sh` y los tests.
- [ ] **Crear la sincronización con Notion** (GitHub Action) que se había decidido; no existe en el repo.
- [ ] **Dejar el prompt de continuación para otra IA** (pedido el 2026-11-20); no existe.
- [ ] **Dejar el repo solo con `main`.** Borrar 7 ramas locales ya integradas, el stash del 2026-11-20 y el worktree abandonado `/private/tmp/gate-t7` (`git worktree prune`).
- [ ] **Decidir el cambio sin commitear de `web/package.json`** (bloque `allowScripts`): commitear o descartar.
- [ ] **Quitar locks viejos de git:** `.git/gc.log.lock` (julio) y `.git/stale-maintenance-lock-claude`.
- [ ] **Limpiar `.gitignore`:** reserva espacio para skills que ya no existen (`academy-flow-inspector`, `archify`).
- [ ] **Carpetas vacías:** `scripts/tests/` y `docs/course-design/`; llenarlas o quitarlas.
- [ ] **Actualizar el comentario de `web/src/app/course-data.ts`:** dice que Cloud llega al módulo 31 y tiene 35.
- [ ] **Actualizar `docs/CONTENT_AUDIT_2026-05-22.md`** o reemplazarlo por esta lista.

## P5 · Código de la app

- [ ] **Partir `web/src/app/course/lesson-viewer.ts`** (1.863 líneas, casi todo manipulación manual del DOM) en servicios más pequeños.
- [ ] **Agregarle tests al lector de lecciones** (hoy no tiene spec propio).
- [ ] **Correr y dejar verde** `npm test -- --watch=false`, `npm run build` y `npm run e2e` (no se pudieron ejecutar en la revisión).
