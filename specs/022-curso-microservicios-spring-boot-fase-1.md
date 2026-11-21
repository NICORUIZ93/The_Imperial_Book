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

1. Declara explícitamente duración, perfil del estudiante, prerrequisitos, versiones y resultados observables.
2. Incluye secuencia de cinco semanas y distribución de los 29 temas sin introducir sintaxis básica para principiantes.
3. Cada bullet de los módulos 1–4 tiene ficha individual con los 15 apartados en el orden indicado.
4. Cada ficha contiene analogía, Mermaid con texto alternativo, alternativas con trade-offs y criterio de «cuándo no usar».
5. Cada ficha nombra rutas exactas para construcción y código de referencia o identifica como brecha la ruta todavía inexistente.
6. Cada práctica cita el Compose, comando de ejecución, script de verificación, salida esperada y modificación guiada; no se afirma que la prueba pasó si no existe evidencia.
7. Se incluyen al menos tres decisiones/ejercicios con respuesta correcta «no añadir otra dependencia/abstracción o no introducir un patrón»; la prohibición explícita de microservicios se reserva además para las fases posteriores del curso según el temario maestro.
8. Documenta riesgos de densidad curricular y diferencia entre diseño, código ya existente y código pendiente de desarrollo/verificación.

## 5. Fuera de alcance en esta entrega

Construir o modificar los 29 proyectos, migrar el lector web, publicar una nueva ruta de curso, verificar las imágenes de contenedor en red, producir las fases 2–3 Spring o el Curso B Node.js. Esos cambios se especificarán y ejecutarán por lotes después de revisar este diseño.
