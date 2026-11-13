# The Imperial Book Repo Graph

Generated: 2026-11-13 14:50 UTC
Root: `The_Imperial_Book`
Indexed files: 1649
Import edges: 67

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 69 files
- `automation-script`: 51 files
- `course-content`: 331 files
- `documentation`: 149 files
- `example`: 962 files
- `local-infra`: 1 files
- `project-file`: 86 files

## File Types

- `.md`: 513
- `.java`: 417
- `.py`: 180
- `.json`: 124
- `.ts`: 72
- `.js`: 54
- `.html`: 50
- `.yml`: 37
- `.mjs`: 30
- `.rs`: 25
- `.dart`: 24
- `.go`: 24
- `.swift`: 20
- `.yaml`: 17
- `.sh`: 17
- `.kt`: 13
- `.scss`: 10
- `.jsx`: 6
- `.txt`: 4
- `Dockerfile`: 4
- `.tf`: 4
- `.example`: 3
- `.css`: 1

## High Signal Files

- `README.md` (388 lines, documentation)
  - headings: # The_Imperial_Book, ## Cómo empezar, ## Requisitos del sistema, ## Levantar Floci, # 1. Levantar todos los servicios
- `scripts/validate.sh` (220 lines, automation-script)
- `scripts/build_repo_graph.py` (477 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (891 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (158 lines, angular-app)
  - symbols: CourseCatalogComponent, query, category, backupStatus, cards, featuredTracks, foundationTracks, mobileTracks, filteredCards, resumableTracks
- `web/src/app/course/course-shell.ts` (83 lines, angular-app)
  - symbols: CourseShellComponent, track, officialPath, sidebarOpen, bookReading, trackLogo, percent
- `web/src/app/course/lesson-viewer.ts` (1816 lines, angular-app)
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
- `examples/node-messaging/kafka/consumer.mjs` -> `examples/node-messaging/kafka/client.mjs`
- `examples/node-messaging/kafka/producer.mjs` -> `examples/node-messaging/kafka/client.mjs`
- `examples/node-messaging/rabbit/producer.mjs` -> `examples/node-messaging/rabbit/topology.mjs`
- `examples/node-messaging/rabbit/worker.mjs` -> `examples/node-messaging/rabbit/topology.mjs`
- `examples/professional-bridges/node/pagina.test.mjs` -> `examples/professional-bridges/node/pagina.mjs`
- `examples/professional-bridges/rutaflow/contrato.test.mjs` -> `examples/professional-bridges/rutaflow/contrato.mjs`
- `examples/rutaflow-material/deployment-strategies/deployment.test.mjs` -> `examples/rutaflow-material/deployment-strategies/deployment.mjs`
- `examples/rutaflow-material/payments/contrato.test.mjs` -> `examples/rutaflow-material/payments/contrato.mjs`
- `examples/rutaflow-material/socketio/gateway.test.mjs` -> `examples/rutaflow-material/socketio/gateway.mjs`
- `examples/rutaflow-material/socketio/serve.mjs` -> `examples/rutaflow-material/socketio/gateway.mjs`
- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/curriculum-library.ts`
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
- `web/src/app/course-data.ts` -> `web/src/app/tracks/control-1.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/devops.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/flutter.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/foundations.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/ios.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/java.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/javascript.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/kotlin-multiplatform.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/microservices.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/node.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/react.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/rutaflow.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/spring-boot.track.ts`
- `web/src/app/course-module.model.spec.ts` -> `web/src/app/course-module.model.ts`
- `web/src/app/course/book-mode.service.spec.ts` -> `web/src/app/course/book-mode.service.ts`
- `web/src/app/course/course-shell.ts` -> `web/src/app/course/book-mode.service.ts`
- `web/src/app/course/course-shell.ts` -> `web/src/app/course/lesson-index.ts`
- `web/src/app/course/lesson-viewer.ts` -> `web/src/app/course/book-mode.service.ts`
- `web/src/app/learning-activities.spec.ts` -> `web/src/app/learning-activities.ts`
- `web/src/app/progress.service.spec.ts` -> `web/src/app/progress.service.ts`
- `web/src/app/progress.service.ts` -> `web/src/app/course-data.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/course-data.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/project-bootstrap.ts`
- `web/src/app/theme.service.spec.ts` -> `web/src/app/theme.service.ts`
- `web/src/main.ts` -> `web/src/app/app.config.ts`
- `web/src/main.ts` -> `web/src/app/app.ts`

## Most Connected Files

- `web/src/app/course-data.ts`: in=4, out=16
- `web/src/app/app.routes.ts`: in=2, out=5
- `web/src/app/app.spec.ts`: in=0, out=5
- `examples/javascript-master/src/main.ts`: in=0, out=5
- `examples/javascript-master/src/demo.ts`: in=0, out=5
- `web/src/app/command-palette.ts`: in=1, out=3
- `web/src/app/course/book-mode.service.ts`: in=3, out=0
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/course/course-shell.ts`: in=1, out=2
- `web/src/app/course-module.model.ts`: in=2, out=0
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
- `examples/rutaflow-material/socketio/gateway.mjs`: in=2, out=0
- `examples/node-messaging/rabbit/topology.mjs`: in=2, out=0
- `examples/node-messaging/kafka/client.mjs`: in=2, out=0
- `examples/javascript-master/src/ui/delivery-button.ts`: in=2, out=0
- `examples/javascript-master/src/domain/delivery-status.ts`: in=2, out=0
- `web/src/app/progress.service.ts`: in=1, out=1
- `web/src/app/course/lesson-viewer.ts`: in=1, out=1
- `web/src/app/app.config.ts`: in=1, out=1
- `web/src/main.ts`: in=0, out=2

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (19 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (4 lines)
- `web/src/app/app.routes.ts` (37 lines) - imports: @angular/router, ./catalog/course-catalog, ./catalog/curriculum-library, ./course/course-shell, ./course/track-overview, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (326 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog, ./content.service, ./course-data
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (35 lines) - symbols: main-content, catalog-title, first-session-title, continue-title, tracks-title, beginner-title, backup-title
- `web/src/app/catalog/course-catalog.scss` (243 lines)
- `web/src/app/catalog/course-catalog.ts` (158 lines) - symbols: CourseCatalogComponent, query, category, backupStatus, cards, featuredTracks, foundationTracks, mobileTracks; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../track-guides, ../command-palette.service, ../icon-registry
- `web/src/app/catalog/curriculum-library.html` (97 lines) - symbols: curriculum-title, stack-browser-title, implementation-title
- `web/src/app/catalog/curriculum-library.scss` (152 lines)
- `web/src/app/catalog/curriculum-library.ts` (219 lines) - symbols: CurriculumLibraryComponent, CurriculumStackComponent, query, scope, filteredStacks, topicScope, selectedModule, visibleCount; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../curriculum-library.service
- `web/src/app/catalog/curriculum-stack.html` (154 lines) - symbols: stack-title, ocr-title, course-source-title, topic-browser-title
- `web/src/app/command-palette.html` (29 lines) - symbols: palette-title, palette-results
- `web/src/app/command-palette.scss` (38 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (130 lines) - symbols: CommandPaletteComponent, query, activeIndex, activeResultId, index, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service, ./topic-index.service
- `web/src/app/content.service.ts` (78 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (891 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- ... 51 more files

### automation-script

- `scripts/audit_atomic_subtopics.py` (151 lines) - symbols: matches, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/audit_code_visual_quality.py` (226 lines) - symbols: student_visible_content, structural_text, blocks, official_source_urls, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib, urllib.parse, audit_topic_learning_quality
- `scripts/audit_course_depth.py` (148 lines) - symbols: signals, human_review_status, build, markdown, main; imports: __future__, argparse, collections, json, pathlib, re, audit_topic_learning_quality
- `scripts/audit_full.py` (278 lines) - symbols: Tema, structural_text, split_temas, evaluar, recolectar, shingles, detectar_duplicados, pct; imports: __future__, argparse, json, re, sys, collections, dataclasses, datetime
- `scripts/audit_lesson_substance.py` (346 lines) - symbols: norm, paragraphs, count_words, evaluate_topic, module_level_sections, topic_key, build, render_markdown; imports: __future__, argparse, hashlib, json, re, sys, collections, pathlib
- `scripts/audit_seven_step_methodology.py` (176 lines) - symbols: matches, evaluate, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_subtopic_depth.py` (164 lines) - symbols: semantic_headings, broad_title, build, render, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_topic_learning_quality.py` (266 lines) - symbols: student_visible_content, structural_text, topic_blocks, resolve_archify_visual_link, unresolved_archify_visual_links, canonical_practice, evaluate, classify; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/build_editorial_backlog.py` (100 lines) - symbols: render, main; imports: __future__, argparse, pathlib, audit_topic_learning_quality
- `scripts/build_full_review.py` (175 lines) - symbols: total_field, topic_count, build, main; imports: __future__, argparse, json, pathlib, audit_code_visual_quality, audit_course_depth, audit_lesson_substance, audit_seven_step_methodology
- `scripts/build_prerequisite_graph.py` (115 lines) - symbols: topics_for, build, render, main; imports: __future__, argparse, json, re, pathlib
- `scripts/build_priority_temarios.py` (191 lines) - symbols: build, main; imports: __future__, argparse, json, re, pathlib
- `scripts/build_repo_graph.py` (477 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, subprocess, collections, dataclasses
- `scripts/build_spring_topic_review.py` (96 lines) - symbols: build, main; imports: pathlib, argparse, json, re
- `scripts/build_total_book_topics.py` (129 lines) - symbols: normalized, main, render_item; imports: __future__, json, re, unicodedata, collections, pathlib
- `scripts/build_unified_curriculum.py` (211 lines) - symbols: norm, main; imports: __future__, json, re, unicodedata, collections, pathlib
- `scripts/build_web_curriculum_catalog.py` (191 lines) - symbols: build_assets, write_json, main; imports: __future__, json, collections, pathlib, typing
- `scripts/build_web_topic_index.py` (81 lines) - symbols: slugify, clean_topic_title, main; imports: __future__, json, re, sys, unicodedata, collections, pathlib
- ... 33 more files

### course-content

- `web/public/content/ATRIBUCION.md` (39 lines) - headings: # Atribucion y licencia, ## Fuentes consultadas para la ampliacion de DevOps
- `web/public/content/LICENCIA-CONTENIDO.md` (44 lines) - headings: # Licencia del contenido original, ## Exclusiones y avisos, ## Inventario de recursos de terceros de la aplicación
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (787 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Antes de comenzar: instala Android Studio y un dispositivo de prueba, ## Aprende construyendo, ### Tema 1: Estructura de un proyecto Android Studio
- `web/public/content/android/modulo-1.md` (343 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Aprende construyendo, ### Tema 1: Ciclo de vida de una Activity, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-10.md` (408 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Aprende construyendo, ### Tema 1: Detectar y corregir recomposición innecesaria, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-11.md` (343 lines) - headings: # Módulo 11: Publicación en Google Play, ## Aprende construyendo, ### Tema 1: Firma de la app, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-12.md` (336 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Aprende construyendo, ### Tema 1: Arquitectura MVVM completa con UDF, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-13.md` (628 lines) - headings: # Módulo 13: Android en producción — seguridad, sincronización y calidad, ## Aprende construyendo, ### Tema 1: El sistema operativo conecta tu app con entradas externas, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-14.md` (808 lines) - headings: # Módulo 14: Compose Master — pruebas, accesibilidad y animación, ## Aprende construyendo, ### Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible, #### Por qué una captura visual no basta
- `web/public/content/android/modulo-15.md` (556 lines) - headings: # Módulo 15: Android como plataforma — Intents, broadcasts, servicios y content providers, ## Aprende construyendo, ### Tema 1: Intents implícitos y Activity Result API, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-16.md` (537 lines) - headings: # Módulo 16: Android profesional — privacidad, datos, escala e identidad, ## Aprende construyendo, ### Tema 1: Permisos en tiempo de ejecución y alternativas sin permiso, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-17.md` (444 lines) - headings: # Módulo 17: Compose profesional — layouts, formularios, listas y efectos, ## Aprende construyendo, ### Tema 1: Constraints, Modifier y componentes con slots, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-18.md` (337 lines) - headings: # Módulo 18: Build profesional — variantes, módulos, optimización y CI, ## Aprende construyendo, ### Tema 1: Gradle, version catalogs y resolución de dependencias, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-2.md` (366 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Aprende construyendo, ### Tema 1: Composables y recomposición, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-3.md` (461 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Aprende construyendo, ### Tema 1: NavHost y NavController, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-4.md` (438 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Aprende construyendo, ### Tema 1: StateFlow en el ViewModel, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-5.md` (365 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Aprende construyendo, ### Tema 1: Retrofit con coroutines, #### Paso 1 · Objetivo y preparación
- ... 313 more files

### documentation

- `AGENTS.md` (92 lines) - headings: # The Imperial Book: trabajo con contenido y experiencia de estudio, ## Skills para el objetivo de la academia, ## Contrato de estudio desde cero, ### Profundidad obligatoria de temas y subtemas
- `CHANGELOG.md` (17 lines) - headings: # Changelog, ## Unreleased, ## 2026-10-13
- `CLAUDE.md` (119 lines) - headings: # CLAUDE.md, ## What this is, ## First step for any repo exploration, ## Commands
- `CODE_OF_CONDUCT.md` (25 lines) - headings: # Código de conducta, ## Compromiso, ## Conducta esperada, ## Aplicación
- `CONTRIBUTING.md` (41 lines) - headings: # Contribuir a The Imperial Book, ## Idioma y commits, ## Antes de abrir un cambio, ## Licencias
- `MASTER-PROMPT.md` (149 lines) - headings: # MASTER PROMPT — THE IMPERIAL BOOK · RECONSTRUCCIÓN COMPLETA, ## PARTE 1 · METODOLOGÍA EDITORIAL, ### 1.1 Las 12 pautas innegociables, ### 1.2 Regla de preservación
- `README.md` (388 lines) - headings: # The_Imperial_Book, ## Cómo empezar, ## Requisitos del sistema, ## Levantar Floci
- `docs/ACADEMIA-EXPERIENCIA-DE-ESTUDIO.md` (66 lines) - headings: # Experiencia de estudio: contrato editorial y de interfaz, ## Principios de aprendizaje, ## Contrato de cada tema, ## Contrato del lector
- `docs/ACADEMIA-PROTOTIPO-6-CONTEXTOS.md` (46 lines) - headings: # Prototipo editorial: seis contextos, ## Puerta de validación, ## Estado
- `docs/AUDITORIA-COBERTURA-SPRING-20261101.md` (157 lines) - headings: # Auditoría de cobertura — Track Spring Boot vs temario profesional, ## Resumen de huecos confirmados, ### ALTA (prerrequisitos del núcleo / imprescindibles), ### MEDIA
- `docs/CONTINUAR-7-PASOS.md` (26 lines) - headings: # Migración a cuatro pasos y subtemas atómicos, ## Formato que se aplica, ## Estado de migración
- `docs/CONTINUAR-EXPANSION-JAVA-Y-ACADEMIA.md` (1927 lines) - headings: # Continuidad: expansión Java y academia, ## Encargo y razón, ## Fuentes de verdad y rutas, ## Contrato de cada tema
- `docs/CONTINUIDAD-CHATGPT-PROMPTS-20261101.md` (182 lines) - headings: # Continuidad de ChatGPT: biblioteca, metodología y revisión de prompts, ## Punto exacto del repositorio, ## Qué ya está confirmado, ## Qué contiene la tanda local sin commit
- `docs/ESTADO-REVISION-MINUCIOSA-20261101.md` (1080 lines) - headings: # Estado verificable de la revisión minuciosa, ## 1. Objetivo obligatorio, ### Ejemplo normativo aportado por el usuario, ## 2. Fuentes persistentes de la regla
- `docs/ESTANDAR-DE-CODIGO.md` (56 lines) - headings: # Estándar transversal de código y diseño, ## Prioridades, ## Clean Code con criterio, ## SOLID cuando aporta valor
- `docs/INVENTARIO-CURSOS-TEMAS-SUBTEMAS.md` (11995 lines) - headings: # Inventario completo: cursos, módulos, temas y subtemas, ## 1. RutaFlow — Proyecto integrador logístico, ### Módulo 0 · RutaFlow desde cero: producto, entorno y dominio, #### Tema 1: El proceso logístico como sistema
- `docs/MATRIZ-CURRICULAR.md` (73 lines) - headings: # Matriz curricular auditable, ## Progresión de competencia, ## Cobertura por módulo, ## Método de evaluación
- `docs/METODOLOGIA-DE-APRENDIZAJE.md` (95 lines) - headings: # Metodología Aprende construyendo, ## Estructura de tema y subtema, ### Hito al final de cada tema, ### Ruta del proyecto
- ... 131 more files

### example

- `examples/README.md` (157 lines) - headings: # Ejemplos de referencia, ## Ejemplos por operación (node/, python/, java/, go/, rust/), # Node.js (requiere: npm install en examples/node/), # Python (requiere: pip install boto3)
- `examples/anatomy/outbox/build.mjs` (759 lines) - imports: node:fs, node:path, node:url, ../../../.agents/skills/anatomy/kit/iso-kit.mjs, ../../../.agents/skills/anatomy/scripts/inline-kit.mjs
- `examples/anatomy/outbox/outbox-light.html` (1050 lines) - symbols: ${id}
- `examples/anatomy/outbox/outbox.html` (1050 lines) - symbols: ${id}
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
- ... 944 more files

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
- `docs/app-flow-inspection.json` (16517 lines)
- `docs/archivo/main-2026-11-03/docs/subtopic-depth-reviewed-retirados.json` (3212 lines)
- `docs/archivo/main-2026-11-03/docs/topic-source-review-retirados.json` (203 lines)
- `docs/archivo/main-2026-11-03/examples/java/patrones-rutaflow/PrototypeDemo.java` (51 lines)
- `docs/archivo/main-2026-11-03/examples/spring-kafka-rutaflow/src/main/resources/application.yml` (42 lines)
- `docs/archivo/main-2026-11-03/examples/spring-kafka-rutaflow/src/test/resources/application-test.yml` (15 lines)
- `docs/atomic-subtopics.json` (19553 lines)
- `docs/biblioteca/catalogo.json` (564 lines)
- `docs/biblioteca/imagenes.json` (577 lines)
- `docs/book-curriculum-inventory.json` (527350 lines)
- ... 68 more files
