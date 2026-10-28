# The Imperial Book Repo Graph

Generated: 2026-10-28 20:39 UTC
Root: `The_Imperial_Book`
Indexed files: 877
Import edges: 50

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 58 files
- `automation-script`: 27 files
- `course-content`: 242 files
- `documentation`: 75 files
- `example`: 425 files
- `local-infra`: 1 files
- `project-file`: 49 files

## File Types

- `.md`: 322
- `.py`: 147
- `.ts`: 64
- `.json`: 57
- `.js`: 53
- `.java`: 49
- `.html`: 36
- `.rs`: 25
- `.go`: 24
- `.dart`: 19
- `.swift`: 19
- `.kt`: 11
- `.yaml`: 9
- `.scss`: 8
- `.sh`: 6
- `.yml`: 5
- `.mjs`: 5
- `.jsx`: 5
- `.tf`: 4
- `.example`: 3
- `.txt`: 3
- `Dockerfile`: 2
- `.css`: 1

## High Signal Files

- `README.md` (301 lines, documentation)
  - headings: # The_Imperial_Book, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios, # 2. Verificar Floci AWS
- `scripts/validate.sh` (131 lines, automation-script)
- `scripts/build_repo_graph.py` (468 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (886 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (122 lines, angular-app)
  - symbols: CourseCatalogComponent, backupStatus, cards, featuredTracks, foundationTracks, mobileTracks, totalModules
- `web/src/app/course/course-shell.ts` (59 lines, angular-app)
  - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent
- `web/src/app/course/lesson-viewer.ts` (1076 lines, angular-app)
  - symbols: LessonViewerComponent, TocItem, track, module, officialSource, projectBootstrap, trackProject, projectStep, projectProgress, showProjectBootstrap

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
- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/course-shell.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/lesson-viewer.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/roadmaps/roadmaps.ts`
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
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
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
- `web/src/app/tracks/node.track.ts`: in=1, out=0
- `web/src/app/tracks/kotlin-multiplatform.track.ts`: in=1, out=0

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (19 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (4 lines)
- `web/src/app/app.routes.ts` (31 lines) - imports: @angular/router, ./catalog/course-catalog, ./roadmaps/roadmaps, ./course/course-shell, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (188 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog, ./content.service, ./course-data
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (129 lines) - symbols: main-content, catalog-title, beginner-title, backup-title, tracks-title, official-title
- `web/src/app/catalog/course-catalog.scss` (253 lines)
- `web/src/app/catalog/course-catalog.ts` (122 lines) - symbols: CourseCatalogComponent, backupStatus, cards, featuredTracks, foundationTracks, mobileTracks, totalModules; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../icon-registry, ../official-updates, ../progress.service
- `web/src/app/command-palette.html` (29 lines) - symbols: palette-title, palette-results
- `web/src/app/command-palette.scss` (31 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (129 lines) - symbols: CommandPaletteComponent, query, activeIndex, activeResultId, index, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service, ./topic-index.service
- `web/src/app/content.service.ts` (40 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (886 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.ts` (34 lines) - symbols: CourseModule, Track
- `web/src/app/course/course-shell.html` (53 lines) - symbols: official-path-title, main-content
- `web/src/app/course/course-shell.scss` (86 lines)
- `web/src/app/course/course-shell.ts` (59 lines) - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../command-palette.service
- ... 40 more files

### automation-script

- `scripts/audit_code_visual_quality.py` (138 lines) - symbols: student_visible_content, structural_text, blocks, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_seven_step_methodology.py` (138 lines) - symbols: matches, evaluate, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_topic_learning_quality.py` (233 lines) - symbols: student_visible_content, structural_text, topic_blocks, resolve_archify_visual_link, unresolved_archify_visual_links, evaluate, classify, demo_signature; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/build_30_step_roadmaps.py` (1042 lines) - symbols: Topic, Block, t, combine, render_steps, render_block, render_index, render_web_index; imports: __future__, argparse, json, re, sys, dataclasses, pathlib
- `scripts/build_editorial_backlog.py` (99 lines) - symbols: render, main; imports: __future__, argparse, pathlib, audit_topic_learning_quality
- `scripts/build_prerequisite_graph.py` (114 lines) - symbols: topics_for, build, render, main; imports: __future__, argparse, json, re, pathlib
- `scripts/build_repo_graph.py` (468 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, subprocess, collections, dataclasses
- `scripts/build_web_topic_index.py` (75 lines) - symbols: slugify, clean_topic_title, main; imports: __future__, json, re, sys, unicodedata, collections, pathlib
- `scripts/catalog_external_library.py` (49 lines) - symbols: main; imports: argparse, hashlib, json, pathlib, pymupdf
- `scripts/fix_lessons.py` (114 lines) - symbols: safe_print, iter_text_check_files, find_text_quality_issues, main; imports: ast, glob, os, re
- `scripts/prepare_study_diagram.py` (39 lines) - symbols: main; imports: argparse, hashlib, json, pathlib
- `scripts/start.sh` (10 lines)
- `scripts/tests/test_backup_verified.py` (104 lines) - symbols: BackupVerificationTests; imports: os, shutil, subprocess, tempfile, unittest, pathlib, shlex
- `scripts/tests/test_curriculum_roadmaps.py` (97 lines) - symbols: RevisedCurriculumTests; imports: sys, shutil, subprocess, unittest, pathlib, build_30_step_roadmaps
- `scripts/tests/test_editorial_validation.py` (90 lines) - symbols: EditorialValidationTests; imports: sys, tempfile, unittest, pathlib, unittest.mock, audit_topic_learning_quality, audit_code_visual_quality, fix_lessons
- `scripts/validate-floci.sh` (43 lines)
- `scripts/validate.sh` (131 lines)
- `scripts/validate_code_quality.py` (38 lines) - imports: pathlib
- ... 9 more files

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENCIA-CONTENIDO.md` (25 lines) - headings: # Licencia del contenido original, ## Exclusiones y avisos
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (537 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Antes de comenzar: instala Android Studio y un dispositivo de prueba, ## Aprende construyendo, ### Tema 1: Estructura de un proyecto Android Studio
- `web/public/content/android/modulo-1.md` (343 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Aprende construyendo, ### Tema 1: Ciclo de vida de una Activity, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-10.md` (408 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Aprende construyendo, ### Tema 1: Detectar y corregir recomposición innecesaria, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-11.md` (343 lines) - headings: # Módulo 11: Publicación en Google Play, ## Aprende construyendo, ### Tema 1: Firma de la app, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-12.md` (336 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Aprende construyendo, ### Tema 1: Arquitectura MVVM completa con UDF, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-13.md` (567 lines) - headings: # Módulo 13: Android en producción — seguridad, sincronización y calidad, ## Aprende construyendo, ### Tema 1: El sistema operativo conecta tu app con entradas externas, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-14.md` (813 lines) - headings: # Módulo 14: Compose Master — pruebas, accesibilidad y animación, ## Aprende construyendo, ### Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-2.md` (366 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Aprende construyendo, ### Tema 1: Composables y recomposición, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-3.md` (461 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Aprende construyendo, ### Tema 1: NavHost y NavController, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-4.md` (369 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Aprende construyendo, ### Tema 1: StateFlow en el ViewModel, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-5.md` (365 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Aprende construyendo, ### Tema 1: Retrofit con coroutines, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-6.md` (406 lines) - headings: # Módulo 6: Persistencia local con Room, ## Aprende construyendo, ### Tema 1: Entities, DAOs y Database, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-7.md` (388 lines) - headings: # Módulo 7: Inyección de dependencias con Hilt, ## Aprende construyendo, ### Tema 1: Configuración básica de Hilt, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-8.md` (376 lines) - headings: # Módulo 8: Trabajo en segundo plano, ## Aprende construyendo, ### Tema 1: CoroutineWorker y garantía de ejecución, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-9.md` (403 lines) - headings: # Módulo 9: Testing en Android, ## Aprende construyendo, ### Tema 1: Testing de ViewModels con fakes y runTest, #### Paso 1 · Objetivo y preparación
- ... 224 more files

### documentation

- `AGENTS.md` (47 lines) - headings: # The Imperial Book: trabajo con contenido y experiencia de estudio, ## Skills para el objetivo de la academia, ## Contrato de estudio desde cero, ## Verificación
- `CHANGELOG.md` (17 lines) - headings: # Changelog, ## Unreleased, ## 2026-10-13
- `CLAUDE.md` (119 lines) - headings: # CLAUDE.md, ## What this is, ## First step for any repo exploration, ## Commands
- `CODE_OF_CONDUCT.md` (25 lines) - headings: # Código de conducta, ## Compromiso, ## Conducta esperada, ## Aplicación
- `CONTRIBUTING.md` (31 lines) - headings: # Contribuir a The Imperial Book, ## Antes de abrir un cambio, ## Licencias
- `README.md` (301 lines) - headings: # The_Imperial_Book, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios
- `docs/ESTANDAR-DE-CODIGO.md` (56 lines) - headings: # Estándar transversal de código y diseño, ## Prioridades, ## Clean Code con criterio, ## SOLID cuando aporta valor
- `docs/MATRIZ-CURRICULAR.md` (73 lines) - headings: # Matriz curricular auditable, ## Progresión de competencia, ## Cobertura por módulo, ## Método de evaluación
- `docs/METODOLOGIA-DE-APRENDIZAJE.md` (57 lines) - headings: # Metodología Aprende construyendo, ## Ciclo de cada capítulo, ## Tamaño de las experiencias, ## Regla para mostrar soluciones
- `docs/PLANTILLA-LECCION.md` (109 lines) - headings: # Plantilla de Lección — Prompt Maestro para Claude / Codex, ## PROMPT MAESTRO (copiar desde aquí), ## DATOS DE LA LECCIÓN, ## REGLAS DE ESTILO
- `docs/PROMPTS-FORMACION.md` (30 lines) - headings: # Prompts de formación profesional a partir de merged.pdf, ## Tutor paso a paso (página 1), ## Ruta de 30 pasos (página 21), ## Revisión profesional (página 55)
- `docs/RUNBOOKS-CLOUD.md` (1633 lines) - headings: # Cloud Runbooks — Troubleshooting Operacional, ## Runbook 1: DynamoDB Throttling, ### Síntomas, ### Diagnosis
- `docs/RUNBOOKS-DEVOPS.md` (1409 lines) - headings: # DevOps Runbooks — Troubleshooting Operacional, ## Runbook 1: Docker Image Build Failures, ### Síntomas, ### Diagnosis
- `docs/SKILLS-VISUALES-Y-ESTUDIO.md` (94 lines) - headings: # Skills para visuales y estudio desde cero, ## Selección y uso, ## Recorrido que debe comprobarse, ## Cómo usar las skills en una revisión
- `docs/auditoria-profundidad-cobertura.md` (174 lines) - headings: # Auditoría de profundidad y cobertura — The Imperial Book, ## Resumen ejecutivo (sin adornos), ## Eje 1 — PROFUNDIDAD (¿el Paso 4 es ejecutable de cero a profesional?), ### Evidencia directa (leída, no inferida)
- `docs/biblioteca/clean-code.md` (30 lines) - headings: # Identificación e índice: Código limpio, ## Temas localizados en el índice, pendientes de lectura
- `docs/biblioteca/cola.md` (78 lines) - headings: # Cola de revisión libro por libro
- `docs/biblioteca/revision-imagenes-20261013.md` (118 lines) - headings: # Revisión individual de imágenes — 2026-10-13, ## Correcciones al registro anterior, ## Contraste puntual con fuentes oficiales, ## Registro completo
- ... 57 more files

### example

- `examples/README.md` (129 lines) - headings: # Ejemplos de referencia, ## Ejemplos por operación (node/, python/, java/, go/, rust/), # Node.js (requiere: npm install en examples/node/), # Python (requiere: pip install boto3)
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
- ... 407 more files

### local-infra

- `docker-compose.yml` (47 lines)

### project-file

- `.env.example` (8 lines)
- `.github/workflows/ci.yml` (60 lines)
- `docs/biblioteca/catalogo.json` (564 lines)
- `docs/biblioteca/imagenes.json` (577 lines)
- `docs/code-visual-quality.json` (2786 lines)
- `docs/curriculum-matrix.json` (329 lines)
- `docs/floci-official-curriculum.json` (14 lines)
- `docs/merged-pdf-index.json` (426 lines)
- `docs/official-learning-guides.json` (22 lines)
- `docs/official-sources.json` (195 lines)
- `docs/official-topic-atlas.json` (175 lines)
- `docs/prerequisite-graph.json` (11085 lines)
- `docs/requested-master-topics.json` (189 lines)
- `docs/seven-step-methodology.json` (26497 lines)
- `docs/skills-visual-learning.json` (120 lines)
- `docs/specialization-outcomes.json` (1249 lines)
- `docs/topic-learning-quality.json` (22425 lines)
- `install.sh` (99 lines)
- ... 31 more files
