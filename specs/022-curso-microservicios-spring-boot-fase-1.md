# 022 · Curso independiente de Microservicios con Spring Boot — Fase 1

**Estado:** diseño curricular autorizado para elaboración; no modifica la ruta `microservices` existente ni publica cambios en la aplicación.
**Solicitud:** diseñar dos cursos independientes Spring Boot y Node.js, cada uno de 20–24 semanas, con laboratorios construidos por el estudiante desde cero y fichas completas por tema. En esta entrega se trabaja únicamente el Curso A, Fase 1 (cinco semanas), por selección explícita del dueño.
**Fuente del alcance:** adjunto de la solicitud del 2026-11-21 y selección «2 — Spring Boot, empezando por Fase 1».

## 1. Alcance

Diseñar la Fase 1, «Fundamentos del stack y primer microservicio», con los módulos 1–4 y todos los temas enumerados en el adjunto: Java moderno; primer API REST y persistencia; testing y calidad; caching y rendimiento. El estudiante ya programa, conoce terminal/Git/editor y no necesita lecciones de sintaxis básica. Los conceptos de Spring y sistemas distribuidos sí se introducen desde cero.

Cada tema tendrá ficha con los 15 apartados solicitados por el dueño, analogía y diagrama accesibles antes del código, construcción guiada por archivos, referencia ejecutable, explicación de bloques/líneas, práctica reproducible, verificación, modificación, error diagnosticable, pregunta de entrevista y anti-patrón. Se identificarán expresamente las lagunas entre este estándar nuevo y los recursos existentes; no se declarará completo ningún criterio sin evidencia.

## 2. Límites y no-regresión

- Esta especificación no renumera módulos, no edita lecciones visibles, no modifica la aplicación, el índice de temas ni los laboratorios existentes.
- El repositorio ya contiene materiales relacionados en `web/public/content/microservices/modulo-5.md` a `modulo-8.md` y laboratorios Gradle `examples/microservicios/modulo-5/` a `modulo-8/`. Se usarán como referencia y se marcará cualquier contenido que no cumpla la nueva separación independiente o la construcción paso a paso.
- La ruta publicada actual declara Gradle Kotlin DSL como build principal y Maven como equivalencia (`docs/temarios/microservicios-objetivo.md`, regla 7 de `specs/021`). Por ello, la construcción principal de Spring usa Gradle Wrapper y catálogo de versiones. El tema Maven tendrá un proyecto explícito, reproducible y comparativo; el POM no se sustituye silenciosamente por Gradle ni se presenta como herramienta principal del repo.
- El inventario menciona Java 21 y Spring Boot 3.3+ como bases mínimas. Para mantener compatibilidad con CRaC, Native Image y la línea tecnológica ya documentada, el curso enseñará las características estables de Java 21 y anotará que el conjunto de laboratorios vigente usa JDK 25 LTS y Spring Boot 4.1.3, según `docs/microservicios/08-herramientas-y-versiones.md`. La aprobación final de la versión efectiva del curso se registra al consolidar el temario.
- El proyecto actual sigue un formato de 12 secciones (`docs/reestructuracion/FORMATO-UNICO.md`) y el dueño pidió en esta solicitud una ficha de 15 apartados. Para el documento de diseño prevalecen los 15 apartados de esta solicitud; la eventual migración al formato de producto requiere una tabla de equivalencias y una decisión explícita, no una pérdida de contenido.
- No se cambian los `verificar.sh` existentes. La solicitud pide `verify.sh`; la implementación futura deberá ofrecer ese nombre como entrada compatible o documentar una equivalencia que el dueño apruebe.
- No se inventan salidas de ejecución. Los laboratorios que dependan de registros de contenedores o Maven Central conservan el estado de verificación de `verificacion/microservicios/pendiente.md` hasta comprobarse en el Mac del dueño.

## 3. Entregable de esta especificación

Un documento curricular en `docs/temarios/spring-boot-microservicios-fase-1.md` con calendario de cinco semanas, mapa visual, contrato didáctico, 29 fichas atómicas correspondientes a cada bullet del inventario de Fase 1, mapa a los recursos de referencia existentes, riesgos y lista de brechas pendientes. Este documento es una especificación de curso, no certifica que todos los proyectos existentes ya hayan sido reescritos como repositorios independientes.

## 4. Criterios de aceptación del documento

Reescritos el 2026-11-21 al formato que parsea `scripts/validate_specs.py` (regla 1 de la constitución:
criterio numerado + comando). El estado de cada uno no es una opinión: es el resultado de ejecutar su
`Verificación:` en esta máquina el 2026-11-21 sobre `docs/temarios/spring-boot-microservicios-fase-1.md`
(907 líneas, 29 fichas).

- **C1** `hecho` — Declara explícitamente duración, perfil del estudiante, prerrequisitos, versiones y
  resultados observables.
  Verificación: `python3 -c "import sys,io;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read().lower();sys.exit(0 if all(k in t for k in ['perfil','prerrequisitos','versiones','resultados de aprendizaje','calendario']) else 1)"`
- **C2** `hecho` — Incluye la secuencia de cinco semanas y la distribución de los 29 temas, sin sintaxis
  básica para principiantes.
  Verificación: `python3 -c "import sys,io,re;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read();tl=t.lower();sys.exit(0 if len(re.findall(r'^## Ficha ',t,re.M))==29 and all('semana %d'%s in tl for s in range(1,6)) else 1)"`
- **C3** `hecho` — Cada bullet de los módulos 1–4 tiene ficha individual con los 15 apartados en el orden
  indicado.
  Verificación: `python3 -c "import sys,io,re;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read();b=re.split(chr(10)+'## Ficha ',t)[1:];sys.exit(0 if len(b)==29 and all(len(re.findall(r'^[0-9]+[.] [*]{2}',x,re.M))==15 for x in b) else 1)"`
- **C4** `pendiente` — Cada ficha contiene analogía, Mermaid con texto alternativo, alternativas con
  trade-offs y el criterio de «cuándo no usar». Medido: analogía, diagrama, texto alternativo y anti-patrón
  están en las 29 fichas, pero «trade-off» aparece en 2 de 29 y la frase «cuándo no usar» en ninguna; la
  sección 2 del documento prometía los cinco en cada una. Falta escribirlos, no relajar el detector.
  Verificación: `python3 -c "import sys,io,re;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read();b=re.split(chr(10)+'## Ficha ',t)[1:];sys.exit(0 if all(all(k in x.lower() for k in ['analogo','diagrama','texto alternativo','trade-off','cuando no usar','cuándo no usar']) for x in b) else 1)"`
- **C5** `pendiente` — Cada ficha nombra rutas exactas de construcción y de código de referencia, o
  identifica como brecha la ruta inexistente. Medido: 12 de las 29 fichas no citan ninguna ruta de
  `examples/` ni declaran la brecha (S2.02, S2.03, S2.04, S2.05, S2.07, S2.08, entre otras).
  Verificación: `python3 -c "import sys,io,re;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read();b=re.split(chr(10)+'## Ficha ',t)[1:];sys.exit(0 if all(re.search('examples/|no existe|pendiente|brecha',x,re.I) for x in b) else 1)"`
- **C6** `pendiente` — Cada práctica cita el Compose, el comando de ejecución, el script de verificación, la
  salida esperada y la modificación guiada, sin afirmar que la prueba pasó donde no hay evidencia. Medido:
  Compose en 26 de 29 y verificación/modificación en 29, pero la salida esperada solo en 3 de 29.
  Verificación: `python3 -c "import sys,io,re;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read();b=re.split(chr(10)+'## Ficha ',t)[1:];sys.exit(0 if all(all(k in x.lower() for k in ['compose','salida','verificaci','modificaci']) for x in b) else 1)"`
- **C7** `hecho` — Al menos tres decisiones o ejercicios cuya respuesta correcta es «no añadir otra
  dependencia/abstracción ni introducir un patrón».
  Verificación: `python3 -c "import sys,io;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read().lower();sys.exit(0 if t.count('no anadir')+t.count('no añadir')>=3 else 1)"`
- **C8** `hecho` — Documenta los riesgos de densidad curricular y distingue diseño, código existente y código
  pendiente (secciones 7, 9 y 10 del documento).
  Verificación: `python3 -c "import sys,io;t=io.open('docs/temarios/spring-boot-microservicios-fase-1.md',encoding='utf-8').read().lower();sys.exit(0 if 'densidad' in t and 'brecha' in t and 'pendiente' in t else 1)"`

## 5. Fuera de alcance en esta entrega

Construir o modificar los 29 proyectos, migrar el lector web, publicar una nueva ruta de curso, verificar las imágenes de contenedor en red, producir las fases 2–3 Spring o el Curso B Node.js. Esos cambios se especificarán y ejecutarán por lotes después de revisar este diseño.
