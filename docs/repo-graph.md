# The Imperial Book Repo Graph

Generated: 2026-10-31 16:22 UTC
Root: `Academia_Floci`
Indexed files: 965
Import edges: 57

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 60 files
- `automation-script`: 39 files
- `course-content`: 251 files
- `documentation`: 62 files
- `example`: 490 files
- `local-infra`: 1 files
- `project-file`: 62 files

## File Types

- `.md`: 322
- `.py`: 165
- `.json`: 73
- `.java`: 73
- `.ts`: 67
- `.js`: 54
- `.html`: 38
- `.rs`: 25
- `.go`: 24
- `.dart`: 22
- `.swift`: 20
- `.mjs`: 18
- `.kt`: 13
- `.yaml`: 9
- `.yml`: 8
- `.scss`: 8
- `.sh`: 7
- `.jsx`: 6
- `.tf`: 4
- `.example`: 3
- `.txt`: 3
- `Dockerfile`: 2
- `.css`: 1

## High Signal Files

- `README.md` (364 lines, documentation)
  - headings: # The_Imperial_Book, ## Cómo empezar, ## Requisitos del sistema, ## Levantar Floci, # 1. Levantar todos los servicios
- `scripts/validate.sh` (182 lines, automation-script)
- `scripts/build_repo_graph.py` (477 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (887 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (158 lines, angular-app)
  - symbols: CourseCatalogComponent, query, category, backupStatus, cards, featuredTracks, foundationTracks, mobileTracks, filteredCards, resumableTracks
- `web/src/app/course/course-shell.ts` (68 lines, angular-app)
  - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent
- `web/src/app/course/lesson-viewer.ts` (1230 lines, angular-app)
  - symbols: LessonViewerComponent, focusedTopicIndex, track, module, officialSource, courseGuide, trackProject, projectStep, projectProgress, showTrackProject

## Internal Import Graph

- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/binary/decode-gps.js`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/domain/delivery-status.ts`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/platform/time.js`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/routing/route-strategy.js`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/validation/tracking-code.js`
- `examples/javascript-master/src/domain/contracts.test.ts` -> `examples/javascript-master/src/domain/delivery-status.ts`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/location/watch-location.js`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/realtime/tracking-socket.js`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/route-client.ts`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/storage/delivery-draft.js`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/ui/delivery-button.ts`
- `examples/javascript-master/src/ui/delivery-button.test.ts` -> `examples/javascript-master/src/ui/delivery-button.ts`
- `examples/node-federation/federation.test.mjs` -> `examples/node-federation/server.mjs`
- `examples/professional-bridges/node/pagina.test.mjs` -> `examples/professional-bridges/node/pagina.mjs`
- `examples/professional-bridges/rutaflow/contrato.test.mjs` -> `examples/professional-bridges/rutaflow/contrato.mjs`
- `examples/rutaflow-material/deployment-strategies/deployment.test.mjs` -> `examples/rutaflow-material/deployment-strategies/deployment.mjs`
- `examples/rutaflow-material/payments/contrato.test.mjs` -> `examples/rutaflow-material/payments/contrato.mjs`
- `examples/rutaflow-material/socketio/gateway.test.mjs` -> `examples/rutaflow-material/socketio/gateway.mjs`
- `examples/rutaflow-material/socketio/serve.mjs` -> `examples/rutaflow-material/socketio/gateway.mjs`
- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/course-shell.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/lesson-viewer.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/track-overview.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/content.service.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/course-data.ts`
- `web/src/app/app.ts` -> `web/src/app/command-palette.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/command-palette.service.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/course-data.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/topic-index.service.ts`
- `web/src/app/course-data.ts` -> `web/src/app/course-module.model.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/android.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/angular.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/devops.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/flutter.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/foundations.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/ios.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/java.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/javascript.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/kotlin-multiplatform.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/node.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/react.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/rutaflow.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/spring-boot.track.ts`
- `web/src/app/course-module.model.spec.ts` -> `web/src/app/course-module.model.ts`
- `web/src/app/course/course-shell.ts` -> `web/src/app/course/lesson-index.ts`
- `web/src/app/learning-activities.spec.ts` -> `web/src/app/learning-activities.ts`
- `web/src/app/learning-prompts.spec.ts` -> `web/src/app/learning-prompts.ts`
- `web/src/app/progress.service.spec.ts` -> `web/src/app/progress.service.ts`
- `web/src/app/progress.service.ts` -> `web/src/app/course-data.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/course-data.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/project-bootstrap.ts`
- `web/src/main.ts` -> `web/src/app/app.config.ts`
- `web/src/main.ts` -> `web/src/app/app.ts`

## Most Connected Files

- `web/src/app/course-data.ts`: in=4, out=14
- `web/src/app/app.routes.ts`: in=2, out=4
- `web/src/app/app.spec.ts`: in=0, out=5
- `examples/javascript-master/src/main.ts`: in=0, out=5
- `examples/javascript-master/src/demo.ts`: in=0, out=5
- `web/src/app/command-palette.ts`: in=1, out=3
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/course-module.model.ts`: in=2, out=0
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
- `examples/rutaflow-material/socketio/gateway.mjs`: in=2, out=0
- `examples/javascript-master/src/ui/delivery-button.ts`: in=2, out=0
- `examples/javascript-master/src/domain/delivery-status.ts`: in=2, out=0
- `web/src/app/progress.service.ts`: in=1, out=1
- `web/src/app/course/course-shell.ts`: in=1, out=1
- `web/src/app/app.config.ts`: in=1, out=1
- `web/src/main.ts`: in=0, out=2
- `web/src/app/project-bootstrap.spec.ts`: in=0, out=2
- `web/src/app/tracks/spring-boot.track.ts`: in=1, out=0
- `web/src/app/tracks/rutaflow.track.ts`: in=1, out=0
- `web/src/app/tracks/react.track.ts`: in=1, out=0

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (19 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (4 lines)
- `web/src/app/app.routes.ts` (29 lines) - imports: @angular/router, ./catalog/course-catalog, ./course/course-shell, ./course/track-overview, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (182 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog, ./content.service, ./course-data
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (35 lines) - symbols: main-content, catalog-title, first-session-title, continue-title, tracks-title, beginner-title, backup-title
- `web/src/app/catalog/course-catalog.scss` (133 lines)
- `web/src/app/catalog/course-catalog.ts` (158 lines) - symbols: CourseCatalogComponent, query, category, backupStatus, cards, featuredTracks, foundationTracks, mobileTracks; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../track-guides, ../command-palette.service, ../icon-registry
- `web/src/app/command-palette.html` (29 lines) - symbols: palette-title, palette-results
- `web/src/app/command-palette.scss` (31 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (129 lines) - symbols: CommandPaletteComponent, query, activeIndex, activeResultId, index, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service, ./topic-index.service
- `web/src/app/content.service.ts` (40 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (887 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.spec.ts` (14 lines) - imports: ./course-module.model
- `web/src/app/course-module.model.ts` (37 lines) - symbols: CourseModule, Track
- `web/src/app/course/course-shell.html` (42 lines) - symbols: main-content
- `web/src/app/course/course-shell.scss` (79 lines)
- ... 42 more files

### automation-script

- `scripts/audit_code_visual_quality.py` (226 lines) - symbols: student_visible_content, structural_text, blocks, official_source_urls, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib, urllib.parse, audit_topic_learning_quality
- `scripts/audit_course_depth.py` (140 lines) - symbols: signals, human_review_status, build, markdown, main; imports: __future__, argparse, collections, json, pathlib, re, audit_topic_learning_quality
- `scripts/audit_lesson_substance.py` (346 lines) - symbols: norm, paragraphs, count_words, evaluate_topic, module_level_sections, topic_key, build, render_markdown; imports: __future__, argparse, hashlib, json, re, sys, collections, pathlib
- `scripts/audit_seven_step_methodology.py` (174 lines) - symbols: matches, evaluate, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_topic_learning_quality.py` (233 lines) - symbols: student_visible_content, structural_text, topic_blocks, resolve_archify_visual_link, unresolved_archify_visual_links, evaluate, classify, demo_signature; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/build_editorial_backlog.py` (99 lines) - symbols: render, main; imports: __future__, argparse, pathlib, audit_topic_learning_quality
- `scripts/build_full_review.py` (175 lines) - symbols: total_field, topic_count, build, main; imports: __future__, argparse, json, pathlib, audit_code_visual_quality, audit_course_depth, audit_lesson_substance, audit_seven_step_methodology
- `scripts/build_prerequisite_graph.py` (114 lines) - symbols: topics_for, build, render, main; imports: __future__, argparse, json, re, pathlib
- `scripts/build_repo_graph.py` (477 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, subprocess, collections, dataclasses
- `scripts/build_web_topic_index.py` (75 lines) - symbols: slugify, clean_topic_title, main; imports: __future__, json, re, sys, unicodedata, collections, pathlib
- `scripts/catalog_external_library.py` (49 lines) - symbols: main; imports: argparse, hashlib, json, pathlib, pymupdf
- `scripts/clean_legacy_tails.py` (182 lines) - symbols: legacy_candidates, trim_topic, dedupe_topic, fences_balanced, topic_slice, safe_trim, clean_file, main; imports: __future__, argparse, re, sys, pathlib, audit_lesson_substance, audit_seven_step_methodology, audit_topic_learning_quality
- `scripts/dedupe_example_code.py` (153 lines) - symbols: topic_slice, dedupe, guard, improve_topic, main; imports: __future__, argparse, re, sys, difflib, pathlib, audit_lesson_substance
- `scripts/extract_pdf_toc.py` (33 lines) - imports: sys, pathlib, pymupdf
- `scripts/fix_lessons.py` (114 lines) - symbols: safe_print, iter_text_check_files, find_text_quality_issues, main; imports: ast, glob, os, re
- `scripts/merge_duplicate_sections.py` (178 lines) - symbols: topic_slice, paragraph_span, normalized, merge_marker, merge_topic, drop_generic_scaffold, fences_balanced, guard; imports: __future__, argparse, re, sys, pathlib, audit_lesson_substance, audit_seven_step_methodology, audit_topic_learning_quality
- `scripts/prepare_study_diagram.py` (39 lines) - symbols: main; imports: argparse, hashlib, json, pathlib
- `scripts/rebuild_topic_source_review.py` (148 lines) - symbols: topic_blocks, prose_urls, check_url, is_reachable, rebuild, main; imports: __future__, argparse, json, re, subprocess, concurrent.futures, datetime, pathlib
- ... 21 more files

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENCIA-CONTENIDO.md` (44 lines) - headings: # Licencia del contenido original, ## Exclusiones y avisos, ## Inventario de recursos de terceros de la aplicación
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (648 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Antes de comenzar: instala Android Studio y un dispositivo de prueba, ## Aprende construyendo, ### Tema 1: Estructura de un proyecto Android Studio
- `web/public/content/android/modulo-1.md` (343 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Aprende construyendo, ### Tema 1: Ciclo de vida de una Activity, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-10.md` (408 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Aprende construyendo, ### Tema 1: Detectar y corregir recomposición innecesaria, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-11.md` (343 lines) - headings: # Módulo 11: Publicación en Google Play, ## Aprende construyendo, ### Tema 1: Firma de la app, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-12.md` (336 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Aprende construyendo, ### Tema 1: Arquitectura MVVM completa con UDF, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-13.md` (626 lines) - headings: # Módulo 13: Android en producción — seguridad, sincronización y calidad, ## Aprende construyendo, ### Tema 1: El sistema operativo conecta tu app con entradas externas, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-14.md` (813 lines) - headings: # Módulo 14: Compose Master — pruebas, accesibilidad y animación, ## Aprende construyendo, ### Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-15.md` (556 lines) - headings: # Módulo 15: Android como plataforma — Intents, broadcasts, servicios y content providers, ## Aprende construyendo, ### Tema 1: Intents implícitos y Activity Result API, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-2.md` (366 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Aprende construyendo, ### Tema 1: Composables y recomposición, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-3.md` (461 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Aprende construyendo, ### Tema 1: NavHost y NavController, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-4.md` (438 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Aprende construyendo, ### Tema 1: StateFlow en el ViewModel, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-5.md` (365 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Aprende construyendo, ### Tema 1: Retrofit con coroutines, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-6.md` (406 lines) - headings: # Módulo 6: Persistencia local con Room, ## Aprende construyendo, ### Tema 1: Entities, DAOs y Database, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-7.md` (388 lines) - headings: # Módulo 7: Inyección de dependencias con Hilt, ## Aprende construyendo, ### Tema 1: Configuración básica de Hilt, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-8.md` (376 lines) - headings: # Módulo 8: Trabajo en segundo plano, ## Aprende construyendo, ### Tema 1: CoroutineWorker y garantía de ejecución, #### Paso 1 · Objetivo y preparación
- ... 233 more files

### documentation

- `AGENTS.md` (47 lines) - headings: # The Imperial Book: trabajo con contenido y experiencia de estudio, ## Skills para el objetivo de la academia, ## Contrato de estudio desde cero, ## Verificación
- `CHANGELOG.md` (17 lines) - headings: # Changelog, ## Unreleased, ## 2026-10-13
- `CLAUDE.md` (119 lines) - headings: # CLAUDE.md, ## What this is, ## First step for any repo exploration, ## Commands
- `CODE_OF_CONDUCT.md` (25 lines) - headings: # Código de conducta, ## Compromiso, ## Conducta esperada, ## Aplicación
- `CONTRIBUTING.md` (41 lines) - headings: # Contribuir a The Imperial Book, ## Idioma y commits, ## Antes de abrir un cambio, ## Licencias
- `README.md` (364 lines) - headings: # The_Imperial_Book, ## Cómo empezar, ## Requisitos del sistema, ## Levantar Floci
- `docs/CONTINUAR-7-PASOS.md` (76 lines) - headings: # Continuación de la metodología de siete pasos, ## Qué se corrigió en el auditor (no repetir), ## Regla de oro, ## Los 5 temas que faltaban (resueltos)
- `docs/ESTANDAR-DE-CODIGO.md` (56 lines) - headings: # Estándar transversal de código y diseño, ## Prioridades, ## Clean Code con criterio, ## SOLID cuando aporta valor
- `docs/MATRIZ-CURRICULAR.md` (73 lines) - headings: # Matriz curricular auditable, ## Progresión de competencia, ## Cobertura por módulo, ## Método de evaluación
- `docs/METODOLOGIA-DE-APRENDIZAJE.md` (45 lines) - headings: # Metodología Aprende construyendo, ## Ciclo de cada capítulo, ## Tamaño de las experiencias, ## Regla para mostrar soluciones
- `docs/PLAN-TOTAL-DE-CAMBIO.md` (388 lines) - headings: # Plan total de mejora de profundidad, ## Diagnóstico, ## Objetivo de salida — todavía no acreditado, ## Fases
- `docs/PLANTILLA-LECCION.md` (109 lines) - headings: # Plantilla de Lección — Prompt Maestro para Claude / Codex, ## PROMPT MAESTRO (copiar desde aquí), ## DATOS DE LA LECCIÓN, ## REGLAS DE ESTILO
- `docs/PROMPTS-FORMACION.md` (30 lines) - headings: # Prompts de formación profesional a partir de merged.pdf, ## Tutor paso a paso (página 1), ## Ruta de 30 pasos (página 21), ## Revisión profesional (página 55)
- `docs/RUNBOOKS-CLOUD.md` (1633 lines) - headings: # Cloud Runbooks — Troubleshooting Operacional, ## Runbook 1: DynamoDB Throttling, ### Síntomas, ### Diagnosis
- `docs/RUNBOOKS-DEVOPS.md` (1409 lines) - headings: # DevOps Runbooks — Troubleshooting Operacional, ## Runbook 1: Docker Image Build Failures, ### Síntomas, ### Diagnosis
- `docs/SKILLS-VISUALES-Y-ESTUDIO.md` (94 lines) - headings: # Skills para visuales y estudio desde cero, ## Selección y uso, ## Recorrido que debe comprobarse, ## Cómo usar las skills en una revisión
- `docs/auditoria-profundidad-cobertura.md` (235 lines) - headings: # Auditoría de profundidad y cobertura — The Imperial Book, ## Corrección de estado — 2026-10-30, ## Resumen ejecutivo (sin adornos), ## Eje 1 — PROFUNDIDAD (¿el Paso 4 es ejecutable de cero a profesional?)
- `docs/biblioteca-externa-gaps-android.md` (31 lines) - headings: # Huecos del track Android frente a la biblioteca externa, ## Estado (2026-10-28), ## Libros cotejados, ## Huecos
- ... 44 more files

### example

- `examples/README.md` (157 lines) - headings: # Ejemplos de referencia, ## Ejemplos por operación (node/, python/, java/, go/, rust/), # Node.js (requiere: npm install en examples/node/), # Python (requiere: pip install boto3)
- `examples/archify/README.md` (10 lines) - headings: # Primer mapa Archify de la academia
- `examples/archify/mobile-controls.css` (11 lines)
- `examples/archify/recorrido-estudio.workflow.json` (235 lines)
- `examples/archify/temas/cloud/modulo-10-tema-1-secrets-manager.architecture.json` (37 lines)
- `examples/archify/temas/cloud/modulo-10-tema-1-secrets-manager.review-1/modulo-10-tema-1-secrets-manager.browser-check.json` (723 lines)
- `examples/archify/temas/cloud/modulo-10-tema-1-secrets-manager.review-1/modulo-10-tema-1-secrets-manager.finalize-summary.json` (48 lines)
- `examples/archify/temas/cloud/modulo-10-tema-1-secrets-manager.review-1/modulo-10-tema-1-secrets-manager.finalize.json` (1009 lines)
- `examples/archify/temas/cloud/modulo-16-tema-2-retry-catch.workflow.json` (142 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.architecture.json` (166 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.review-1/modulo-22-tema-5-edge-routes.browser-check.json` (723 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.review-1/modulo-22-tema-5-edge-routes.finalize-summary.json` (48 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.review-1/modulo-22-tema-5-edge-routes.finalize.json` (1012 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.review-2/modulo-22-tema-5-edge-routes.browser-check.json` (723 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.review-2/modulo-22-tema-5-edge-routes.finalize-summary.json` (48 lines)
- `examples/archify/temas/cloud/modulo-22-tema-5-edge-routes.review-2/modulo-22-tema-5-edge-routes.finalize.json` (1012 lines)
- `examples/archify/temas/foundations/modulo-12-tema-10-lazo-p.workflow.json` (183 lines)
- `examples/archify/temas/foundations/modulo-12-tema-17-plc-scan.workflow.json` (189 lines)
- ... 472 more files

### local-infra

- `docker-compose.yml` (47 lines)

### project-file

- `.env.example` (15 lines)
- `.github/ISSUE_TEMPLATE/bug_report.yml` (80 lines)
- `.github/workflows/ci.yml` (62 lines)
- `docs/app-flow-inspection-dedup.json` (8267 lines)
- `docs/app-flow-inspection-devops.json` (1617 lines)
- `docs/app-flow-inspection-evidence.json` (8798 lines)
- `docs/app-flow-inspection-order.json` (1617 lines)
- `docs/app-flow-inspection-relocate.json` (11319 lines)
- `docs/app-flow-inspection.json` (13830 lines)
- `docs/biblioteca/catalogo.json` (564 lines)
- `docs/biblioteca/imagenes.json` (577 lines)
- `docs/browser-course-review.json` (2712 lines)
- `docs/code-visual-quality.json` (1876 lines)
- `docs/course-depth-review.json` (13672 lines)
- `docs/curriculum-matrix.json` (394 lines)
- `docs/floci-official-curriculum.json` (14 lines)
- `docs/lesson-substance-baseline.json` (819 lines)
- `docs/lesson-substance.json` (9437 lines)
- ... 44 more files
