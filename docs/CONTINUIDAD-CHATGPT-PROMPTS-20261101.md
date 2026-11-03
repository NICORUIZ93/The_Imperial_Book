# Continuidad de ChatGPT: biblioteca, metodología y revisión de prompts

Fecha de corte: 2026-11-01, zona horaria America/Bogota.

Documento de entrega principal: `docs/ESTADO-REVISION-MINUCIOSA-20261101.md`.
Debe leerse completo antes de continuar: contiene evidencia, comandos, deuda,
prioridades y el primer punto pendiente.

## Punto exacto del repositorio

- Rama: `main`.
- Commit confirmado y publicado en `origin/main`: `404bcdf4 feat(curriculum): integrate book and Angular Native topics`.
- Ese commit incorporó el inventario bibliográfico, el temario unificado, la biblioteca curricular navegable y el primer prompt maestro.
- El área de trabajo contiene una tanda posterior todavía sin commit. No debe descartarse ni mezclarse ciegamente con nuevas ediciones.

## Qué ya está confirmado

- 14 tracks publicados, 254 módulos y 1.144 temas editoriales tras iniciar la revisión desde Foundations 0 y añadir temas profundos de lambdas en Java y Android/Kotlin.
- El inventario unificado regenerado conserva 1.144 temas actuales, 73.027 candidatos bibliográficos únicos y 18 temas de cursos externos: 74.189 entradas provisionales. Los candidatos no equivalen a lecciones publicables.
- La biblioteca curricular permite inspeccionar candidatos por stack; no los presenta como lecciones completas.
- Las imágenes de la primera revisión tienen manifiesto e informe individual.
- Los huecos prioritarios de libros para tracks existentes fueron documentados en `docs/biblioteca-externa-gaps*.md`.
- Los tracks candidatos principales son Python, bases de datos, ciberseguridad e IA; todavía no son tracks publicados.

## Qué contiene la tanda local sin commit

- Profundización de Java, módulos 0–7.
- Ajustes en Foundations, módulos 3–5, incluido el proyecto web accesible y prácticas de SQL/pruebas.
- Ajustes puntuales en Node 0, Flutter 0 y Spring Boot 15.
- Cambios en el índice de temas, el track de Foundations, pruebas E2E y reportes derivados.
- No asumir autoría ni intención por el diff: revisar cada archivo antes de editarlo y preservar cambios no relacionados.

## Estado verificable de la metodología

- `audit_topic_learning_quality`: 1.143/1.144 temas tienen las nueve señales estructurales detectadas; el pendiente exige inspección, no relleno automático.
- `audit_seven_step_methodology`: 907/1.144 contienen los 16 marcadores textuales del formato legacy `Paso 1…Paso 7`. Los demás incluyen lecciones en `Aprende/Practica/Aplica` y estructuras narrativas; no pueden declararse incompletos sin revisarlas en su formato real.
- `audit_lesson_substance`: 0 temas señalados por el detector actual, pero 179/254 módulos conservan apéndices heredados.
- `audit_course_depth`: 104 temas tienen señales que requieren inspección de profundidad.
- Estas cifras no acreditan ejecución de todos los ejemplos, pruebas de navegador de todas las rutas ni revisión pedagógica humana.

## Revisión del prompt maestro

El primer prompt tenía una fortaleza y un riesgo:

- Fortaleza: exige archivos, código, comandos, resultados, errores, práctica, proyecto, evidencia, accesibilidad y fuentes.
- Riesgo: “conservar todos los temas” podía interpretarse como publicar los 73.027 encabezados. Muchos son subtemas, títulos alternativos, metadatos, fragmentos defectuosos o material fuera de alcance.

La revisión de 2026-11-01 añadió:

1. fase de reanudación y manifiesto por lote;
2. clasificación obligatoria antes de secuenciar;
3. conservación de descartes con motivo y trazabilidad;
4. separación entre inventario máximo y currículo publicable;
5. correspondencia objetivo → evidencia → práctica → explicación;
6. prohibición de secuenciar por orden alfabético o de extracción;
7. controles contra contenido genérico repetido;
8. verificación separada de estructura, ejecución, navegador y revisión humana;
9. condiciones explícitas para pausar o rechazar un lote;
10. manifiesto de continuidad con primer identificador pendiente.

## Skills y límites

- Se aplicó `academia-educational-ui` y su rúbrica de calidad.
- El manifiesto afirma que `scope-and-sequence-designer`, `backwards-design-unit-planner` y `competency-unpacker` estaban instaladas, pero sus `SKILL.md` no existen actualmente en `/Users/nicolasruiz/.codex/skills/`. No declarar que fueron ejecutadas.
- Sus principios se aplican mediante los contratos documentados en `AGENTS.md`, `docs/SKILLS-VISUALES-Y-ESTUDIO.md` y `docs/PROMPTS-FORMACION.md`.

## Validación de esta tanda

Ejecutado el 2026-11-01:

```sh
./scripts/validate.sh
```

Resultado: código 0 después de regenerar los reportes afectados. Las 34 pruebas Python pasaron. Esto prueba consistencia estructural; no sustituye build Angular, E2E, ejecución de todos los ejemplos ni revisión humana.

También se ejecutaron:

- `npm run build`: código 0; bundle inicial de 637,86 kB.
- `npm test -- --watch=false`: 7 archivos y 26 pruebas correctas.
- `PLAYWRIGHT_CHANNEL=chrome npm run e2e`: la primera ejecución expuso un test obsoleto en modo libro. Java 12 ya dice “Al terminar podrás”, mientras el test esperaba la redacción histórica “Al finalizar construirás”. Se actualizó la prueba para comparar el objetivo visible con la fuente real. La repetición dirigida terminó 6/6 y la suite completa mostró 96/96 casos correctos en escritorio y móvil. El proceso de Playwright no devolvió el resumen ni finalizó después de completar el caso 96; se cerraron el runner y su servidor. Registrar las aserciones como aprobadas y el cierre del runner como incidencia pendiente de infraestructura.

## Cómo continuar

1. Revisar el diff local por módulo y confirmar que cada ampliación es específica, ejecutable y no una cola genérica.
2. Ejecutar los ejemplos modificados de Java, Foundations, Node, Flutter y Spring Boot según disponibilidad del entorno; registrar los no ejecutados.
3. Revisar los 234 temas que no coinciden con el detector legacy y evaluar su formato real con la rúbrica educativa; migrar o ampliar sólo donde falte sustancia.
4. Aplicar el prompt revisado al inventario bibliográfico: clasificar antes de crear temas o tracks.
5. Resolver OCR y revisión visual de los libros pendientes antes de declarar la biblioteca completa.
6. Después de cambios de contenido, regenerar índices/reportes y ejecutar `./scripts/validate.sh`; si cambia la aplicación, ejecutar build, pruebas y E2E en Chrome.

## Siguiente lote recomendado

Cerrar primero la tanda local existente: inspección humana del diff, ejecución proporcional de ejemplos y build/E2E. Después revisar los 234 temas no reconocidos por el detector legacy, empezando por módulos completos y usando conjuntamente `migration-status.json`, la rúbrica educativa y el Markdown real. No añadir encabezados artificiales sólo para subir la métrica ni mezclar todavía la creación masiva de tracks nuevos.

## Continuación: Java módulo 8

La revisión del primer módulo no reconocido por el detector legacy confirmó que `java/modulo-8.md` ya usa `Aprende/Practica/Aplica` con sustancia específica. No se convirtió al formato antiguo para maquillar la métrica.

- Actualizadas referencias ejecutables a Jackson 2.21.8, JUnit 6.0.1 y Surefire 3.6.1.
- Contrastados Maven 3.10.0, Gradle 9.8/Java 27, Jackson 2.21 LTS y JUnit 6 con fuentes primarias.
- Ejecutados los ejemplos Maven de dependencia, prueba, empaquetado y reactor multi-módulo con Java 27.0.1.
- Reproducidos los fallos por versión inexistente y dependencia `api → core` ausente.
- Gradle permanece sin ejecutar porque no existe instalación global ni wrapper disponible en el entorno de revisión.

## Regla permanente: profundidad de subtemas

El usuario detectó que un tema podía aparentar amplitud mientras subtemas esenciales quedaban sólo mencionados. La regla quedó persistida en `AGENTS.md`, `docs/METODOLOGIA-DE-APRENDIZAJE.md` y el prompt maestro.

- Cada tema debe empezar por un mapa de prerrequisitos, núcleo, variantes, límites, diagnóstico y profundización.
- Un subtema crítico necesita explicación causal, evidencia observable, error o límite y práctica de transferencia.
- Una mención o aparición en código no cuenta como explicación.
- Si los subtemas requieren objetivos o evidencias distintas, se convierten en temas separados.
- La cobertura humana se registra en `docs/subtopic-depth-reviewed.json`; el informe generado no certifica profundidad automáticamente.

El corte actual de la auditoría registra 1 tema revisado y 1.143 pendientes. Esta cifra mide revisión humana documentada, no afirma que los pendientes carezcan de todo contenido. Android/Kotlin ya tiene el tema profundo equivalente, pero su ejecución Gradle está pendiente porque el entorno no incluye un proyecto Android generado ni `kotlinc`.

Primer piloto: `java/modulo-20`, tema 1, “Lambdas a fondo”. Incluye SAM, sintaxis, tipo objetivo, captura efectivamente final, `this`, cuatro referencias a métodos, sobrecargas, excepciones checked, especializaciones primitivas e identidad. El ejemplo principal y tres fallos de compilación fueron ejecutados con Java 27.0.1.

### Instrucción literal que debe sobrevivir a futuros chats

El nivel del análisis de lambdas es el mínimo para **cada tema de cada curso**.
Antes de una dependencia avanzada, crear un tema completo del fundamento y
enumerar su mapa concreto de subtemas. No basta con «explicar a fondo» ni con
mencionar conceptos dentro de otro ejemplo. La revisión debe comenzar desde el
primer curso y el primer módulo, y continuar en orden de prerrequisitos.

Patrón normativo solicitado por el usuario: «Crear antes de las interfaces
funcionales un tema completo de lambdas que cubra sintaxis, SAM, target typing,
captura, `this`, referencias a métodos, sobrecargas ambiguas, excepciones checked
y especializaciones primitivas». Para los demás temas se conserva la profundidad,
pero se descubre y utiliza el mapa propio del dominio.

La instrucción fue reafirmada como obligatoria: desde 1.144 temas y 1.143
pendientes se aplica un trinquete anti-regresión en `validate.sh`. La deuda de
revisión humana puede bajar, nunca subir. Un tema nuevo debe incorporarse ya
revisado; un mapa o una tabla sin explicaciones individuales no cuenta como cierre.

### Prioridad editorial ordenada por el usuario

Desde este punto, la prioridad es: **Java → Spring Boot → Microservicios como
curso independiente → Flutter**. Foundations queda conservado en el punto ya
corregido, pero no continúa antes de cerrar estos cuatro frentes. Microservicios
no puede quedar como un módulo grande dentro de Spring: debe tener track, secuencia,
proyecto y contenido propios. Spring conserva las implementaciones específicas
del framework; el curso de Microservicios enseña las decisiones distribuidas sin
atar el concepto a una sola tecnología.

Se añade otro track independiente prioritario: **Docker y Kubernetes: de cero a
experto**. No puede permanecer reducido a los módulos 2, 3, 6, 7 y 15 de DevOps.
DevOps conserva CI/CD, cultura y operación transversal; el nuevo curso desarrolla
contenedores y Kubernetes desde namespaces/cgroups y OCI hasta seguridad,
almacenamiento, red, scheduling, extensión, GitOps, upgrades y recuperación.

### Cursos separados adicionales solicitados (2026-11-01)

El usuario señaló que **Maven/Gradle y JDBC están cortos** en el track Java (se ven
por encima) y pidió enseñarlos **de cero a experto en cursos separados**, igual que
Microservicios y Docker/Kubernetes.

- `docs/PLAN-CURSO-BUILD-MAVEN-GRADLE.md`: 17 módulos (0–16), de compilar a mano a
  build multi-módulo reproducible con BOM/version catalogs, caché, publicación,
  plugins propios, SBOM y CI. El track Java conserva el uso básico (M8, M15).
- `docs/PLAN-CURSO-JDBC-BASES-DATOS.md`: 16 módulos (0–15), del modelo
  `Driver`/`Connection`/`ResultSet` a DAO con pool, transacciones y aislamiento,
  batch, streaming/keyset, tipos exactos, metadata/RowSet, operación y migraciones.
  El track Java conserva la intro JDBC (M17) y Spring Boot conserva JPA.

Estado: **planes aprobados, no publicados**. Se construirán módulo a módulo con la
puerta de calidad completa. Lista total de cursos separados aprobados: Microservicios,
Docker/Kubernetes, Build (Maven/Gradle), JDBC/Bases de datos.

## Orden explícita posterior: aplicar íntegramente el MASTER PROMPT

Fecha: 2026-11-02. El usuario ordenó que el documento de 3066 líneas entregado como
`pasted_content.txt` sea el contrato operativo. Desde este punto no basta el formato
`Aprende/Practica/Aplica` ni un mapa de subtemas: cada tema nuevo o corregido debe usar título con
verbo, 20–45 minutos, prerrequisito exacto y los siete pasos completos. También exige cinco tipos
de práctica guiada, reto independiente, fallo con error exacto y diagnóstico, checklist, proyecto
por módulo con rúbrica y capstone por track. Microservicios M0–M1, publicados antes de esta orden,
deben corregirse antes de avanzar a M2; su estado actual no acredita cumplimiento del prompt.
