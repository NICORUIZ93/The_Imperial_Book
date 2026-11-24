# Mejoras a fondo para The Imperial Book

Complemento de [`PROPUESTA_V3.md`](PROPUESTA_V3.md) · 2026-11-24. Cada mejora dice qué problema resuelve, qué se
hace y cómo se sabe que funcionó.

## Resumen por prioridad

| # | Mejora | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | Reducir el catálogo y terminar una ruta completa | Muy alto | Bajo |
| 2 | Temarios anclados a certificaciones y documentación oficial | Muy alto | Medio |
| 3 | Código como archivos reales probados automáticamente | Muy alto | Medio |
| 4 | Evaluación que se corrige sola y repaso espaciado | Alto | Medio |
| 5 | Revisión independiente antes de cada commit | Alto | Bajo |
| 6 | Una sola fuente de verdad para el estándar | Alto | Bajo |
| 7 | Sección v3 refinada (cambios concretos abajo) | Alto | Bajo |
| 8 | Lectura: diseño, accesibilidad, móvil y búsqueda | Medio | Medio |
| 9 | Plataforma: progreso, repaso y simplificación del lector | Medio | Alto |
| 10 | Gobierno del contenido: versiones, cambios y métricas | Medio | Bajo |

---

## 1. Catálogo: menos cursos, terminados

**Problema.** 17 cursos y ~1.550 temas. Con la v3 serían más de 2 millones de palabras. El volumen obligó a
plantillas genéricas y a calidad desigual.

**Qué hacer.**
- Definir una **ruta principal**: Java → Spring Boot → Microservicios con Spring. Se trabaja solo en ella hasta
  terminarla.
- **Fusionar** lo duplicado:
  - Spring Boot + Microservicios con Spring → un curso «Backend con Spring» en dos partes.
  - DevOps + Cloud local → «Plataforma y despliegue».
  - Android + Kotlin Multiplatform → «Kotlin para móvil».
- **Congelar** el resto (visible como «En preparación») hasta que la ruta principal esté terminada.
- Retirar RutaFlow de la app y de los ejemplos.

**Cómo se mide.** Número de cursos «terminados» que pasan el validador v3 y la revisión; no número de cursos.

## 2. Temarios con autoridad

**Problema.** Los temarios actuales nacieron sin una referencia externa; por eso hay huecos y temas repetidos.

**Qué hacer.**
- **Java:** alinear el índice con los objetivos del examen Oracle Java SE 21 Developer Professional (1Z0-830) y la
  documentación oficial de Java 21/25. Las novedades de Java 25 se agregan como secciones propias.
- **Spring:** alinear con la guía del examen Spring Professional Develop (2V0-72.22), con Spring Boot como base.
- Cada capítulo lleva una **tabla de cobertura**: objetivo oficial → sección que lo enseña. Un objetivo sin sección es
  un hueco visible.
- Para los cursos sin certificación: documentación oficial más los índices de 2–3 libros de referencia de la
  biblioteca del usuario.

**Cómo se mide.** 100 % de objetivos oficiales cubiertos por alguna sección.

## 3. Código real, probado en cada cambio

**Problema.** El código vive pegado en Markdown. Por eso hubo salidas que no coincidían, Python en Java y listados que
no compilaban.

**Qué hacer.**
- Carpeta `examples/<curso>/<capitulo>/` con un proyecto Gradle (o el build propio del lenguaje) por capítulo.
- Cada listado de la lección es un archivo de ese proyecto. La lección lo incluye con una marca
  (`<!-- listado: examples/java/c02/ClaveSinContrato.java -->`) y un script lo copia y pega su salida real.
- Workflow de GitHub Actions que compila, ejecuta y prueba todos los ejemplos en cada push. Si una salida cambia,
  el build falla.
- Versiones fijas por curso en un solo archivo (`docs/VERSIONES.md`).

**Cómo se mide.** CI en verde; cero listados sin archivo de origen.

## 4. Evaluación y repaso basados en evidencia

**Fundamento.** La revisión de Dunlosky y colegas sobre técnicas de estudio califica la **práctica con pruebas** y
la **práctica distribuida** como las de mayor utilidad; releer y subrayar no mejoran el rendimiento de forma
consistente.

**Qué hacer.**
- **Ejercicios autocorregidos:** cada ejercicio trae pruebas JUnit; el estudiante ejecuta `gradle test` y sabe si
  está bien. Las soluciones están en una rama o carpeta aparte.
- **Compruébalo** en cada sección (ya en la v3): predecir antes de ejecutar.
- **Examen de capítulo:** 15–25 preguntas de opción múltiple y de lectura de código, con explicación de cada
  respuesta, al estilo de las certificaciones.
- **Repaso espaciado:** al abrir un capítulo, 3 preguntas de capítulos anteriores. Las fallidas vuelven a salir.
- **Práctica mezclada:** los ejercicios de cierre combinan temas del capítulo y de capítulos previos.

**Cómo se mide.** Porcentaje de aciertos por capítulo y preguntas más falladas (para mejorar la explicación).

## 5. Revisión independiente

**Problema.** Quien escribía un módulo era quien lo daba por bueno.

**Qué hacer.**
- Cada módulo pasa por un **revisor** distinto del autor, con una lista fija: exactitud técnica contra la
  especificación, código ejecutado, ausencia de relleno, nivel de los ejemplos, concisión y tono profesional.
- El revisor devuelve hallazgos concretos; el autor corrige; solo entonces hay commit.
- El usuario revisa una sección al azar por capítulo.

## 6. Una sola fuente de verdad

**Problema.** En `docs/` conviven 8 guías que se contradicen (`EDITORIAL_GUIDE_5_STEPS`, `CONTENT_QUALITY_CHECKLIST`,
`PLANTILLA_CURSO`, `PLAN_PLANTILLA`, `VISUAL_DIAGRAM_GUIDE`, `COURSE_DESIGN_…`, `CONTENT_AUDIT_…`, `PROPUESTA_V3`).

**Qué hacer.** Un solo `docs/ESTANDAR.md` (estándar v3) y un solo `docs/PLAN.md`. Lo viejo se mueve a
`docs/historico/`. `INSTRUCCIONES_AGENTE.md` remite solo al estándar.

## 7. La sección v3, refinada

Cambios sobre la muestra aprobada:
- **Siempre mostrar la solución correcta escrita a mano** antes del atajo del lenguaje (en la muestra falta el
  `equals`/`hashCode` manual antes del `record`).
- **Caso aplicado con prueba**: cada caso aplicado lleva al menos una prueba automática, como en una empresa.
- **Diagramas que dibujan el mecanismo**, no flujos genéricos: cubetas reales, pila de llamadas, línea de tiempo.
- **«Lo que dice la especificación»**: una cita corta y enlazada a la JLS, el Javadoc o la documentación oficial
  cuando la regla viene de ahí.
- **Errores literales**: cada advertencia muestra el mensaje exacto y cómo leerlo.
- **Para profundizar**: 1–3 enlaces oficiales al final de la sección.
- **Cabecera de requisitos**: «Necesitas: 2.1» enlazado, en una línea, para que el orden sea explícito.

## 8. Lectura

- Modo oscuro y claro con el mismo diseño sobrio.
- Lectura cómoda en móvil: el índice se vuelve un menú, los listados se desplazan sin romper la página.
- Botón «Copiar» en cada listado y número de línea enlazable.
- Búsqueda global por términos del glosario.
- Exportar un capítulo a PDF con buena tipografía.
- Accesibilidad: contraste AA, foco visible, encabezados ordenados, textos alternativos en diagramas.

## 9. Plataforma

- **Lector más simple.** `lesson-viewer.ts` tiene ~1.900 líneas que reinterpretan el Markdown. Con la v3 sobran las
  capas, chips, marcadores y fichas: se pueden eliminar y dejar un lector pequeño y probado.
- **Progreso sincronizado.** Hoy vive solo en el navegador (`localStorage`); se pierde al cambiar de equipo. Opción:
  exportar/importar el progreso o guardarlo en un almacenamiento propio.
- **Motor de repaso espaciado** para las preguntas del punto 4.
- **CI de la app**: build, pruebas unitarias y e2e en cada push (hoy no hay workflow).

## 10. Gobierno del contenido

- **Registro de cambios** por curso: qué cambió, cuándo y por qué.
- **Política de versiones**: cada capítulo declara versión del lenguaje y del framework; una revisión al año o con
  cada LTS.
- **Métricas visibles** en `PENDIENTES.md`: secciones terminadas, revisadas y con ejemplos en CI.

---

## Plan propuesto

| Fase | Qué | Resultado |
|---|---|---|
| 0 | Aprobar estándar v3 con estas mejoras | `ESTANDAR.md` único |
| 1 | Limpieza: retirar RutaFlow, congelar cursos, unificar `docs/` | Catálogo enfocado |
| 2 | Infraestructura: `examples/` + CI + validador v3 + lector simplificado | Todo listado probado |
| 3 | Temario de Java desde 1Z0-830 + tabla de cobertura | Índice aprobado |
| 4 | Capítulo piloto de Java completo (secciones, ejercicios con pruebas, examen) | Revisado por el usuario |
| 5 | Resto de Java, luego Spring | Ruta principal terminada |
