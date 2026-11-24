# Propuesta v3 · Diseño y metodología de los cursos

Estado: propuesta para aprobar · 2026-11-24. Reemplaza a la plantilla v1/v2 si se aprueba.

## Por qué cambiar

La plantilla v1/v2 falló en tres cosas que el usuario señaló:

| Problema | Causa en la v1/v2 |
|---|---|
| Mucho ruido visual | Capas desplegables, marcadores «►», etiquetas de bloque, fichas de 5 puntos, 5 colores de recuadro, chips, números «§» |
| Explicación poco profesional | Fragmentada en fichas y casillas («Dónde se rompe la comparación»); la teoría quedaba en 80–250 palabras |
| Ejemplos muy básicos | Un ejemplo de juguete por concepto, sin validación, pruebas ni condiciones reales |

## Referencias

La v3 combina cuatro referencias, cada una por lo que hace mejor:

| Referencia | Qué se toma |
|---|---|
| Libro técnico (O'Reilly, Manning, *The Rust Programming Language*, Deitel) | Prosa continua y rigurosa; listados numerados y comentados; pocos recuadros |
| Documentación oficial (dev.java, Spring, Flutter, Kotlin) | Diseño sobrio, una sola columna, precisión terminológica, enlaces a la fuente oficial |
| Curso premium (Educative, Frontend Masters, JetBrains Academy) | Lecciones con ritmo, proyecto que crece, comprobación inmediata |
| Material universitario (MIT OCW, Stanford) | Profundidad: cómo funciona por dentro, casos límite, problemas graduados |

## Principios

1. **Prosa primero.** Cada tema se lee como un capítulo de libro, de principio a fin. Las palabras técnicas se
   definen dentro del texto la primera vez que aparecen (en negrita), no en casillas aparte.
2. **Una voz técnica y sencilla a la vez.** Se explica con el vocabulario profesional correcto y, en la misma frase o
   la siguiente, con una explicación directa. Sin infantilizar: nada de «hacer de computador» ni metáforas largas.
3. **Dos ejemplos por concepto.** Primero un **ejemplo mínimo** que aísla el concepto. Después la **aplicación en el
   proyecto** con calidad de producción: validación, errores reales, pruebas y decisiones de diseño.
4. **Todo listado es real.** Numerado, con nombre de archivo, ejecutado y con su salida. Código solo en el lenguaje del
   curso.
5. **Ruido visual mínimo.** Un solo estilo de recuadro con tres variantes (Nota, Advertencia, En producción), usado
   solo cuando aporta. Sin capas, sin marcadores, sin chips, sin etiquetas.

## Estructura de un módulo (capítulo)

```text
Apertura del capítulo
  · Qué vas a construir (resultado concreto del proyecto al terminar)
  · Requisitos previos (enlaces)
  · Objetivos de aprendizaje (4–6, verbos medibles)

Sección 1 … Sección N        ← cada tema (estructura abajo)

Cierre del capítulo
  · Resumen (6–10 ideas, una frase cada una)
  · Glosario del capítulo (término → definición, con enlace a la sección)
  · Ejercicios: Fundamentales · Aplicados · Desafío (con soluciones desplegables)
  · Hito del proyecto (qué debe funcionar y cómo se comprueba)
  · Para profundizar (documentación oficial y especificación)
```

## Estructura de una sección (tema)

| Parte | Contenido | Extensión orientativa |
|---|---|---|
| **Motivación** | El problema real que este concepto resuelve; qué falla sin él | 1–2 párrafos |
| **Concepto** | Definición formal (como la especificación) y explicación clara; términos en negrita definidos en el texto | 300–600 palabras |
| **Ejemplo mínimo** | Listado N.M aislado, ejecutable, con salida y explicación de las líneas que importan | 1 listado |
| **Cómo funciona por dentro** | Mecanismo: qué hace el compilador, la JVM, el framework o la máquina; diagrama cuando ayuda | 300–700 palabras |
| **Reglas y casos límite** | Lo que dice la especificación; qué cambia entre versiones; errores reales con su mensaje literal | 150–400 palabras |
| **En el proyecto** | La misma idea aplicada en RutaFlow con calidad profesional: validación, pruebas, decisiones | 1–2 listados |
| **Compruébalo** | 2–3 preguntas cortas con respuesta oculta | — |

Total orientativo: 1.500–3.000 palabras por sección, sin contar código.

## Recuadros permitidos (solo tres)

| Recuadro | Cuándo |
|---|---|
| **Nota** | Precisión o dato que no interrumpe el hilo |
| **Advertencia** | Error frecuente o comportamiento peligroso, con el mensaje literal |
| **En producción** | Cómo se hace esto en un equipo real: convenciones, rendimiento, seguridad |

## Diseño visual

- Una columna de lectura de 680–720 px; título, subtítulo y metadatos discretos.
- Tipografía: Inter para texto, Fira Mono para código; jerarquía por tamaño y peso, no por color.
- Un solo color de acento (índigo) para enlaces y elementos interactivos.
- Listados con encabezado: «Listado 2.3 · Guia.java», números de línea, fondo neutro.
- Salidas de consola en un bloque oscuro debajo del listado.
- Diagramas en tinta, sin rellenos de colores; animados solo en flujos.
- Índice del capítulo a la izquierda (escritorio) y progreso de lectura arriba.
- Se eliminan: capas desplegables, «►», «§», chips de términos, fichas de 5 puntos, recuadros de colores múltiples.

## Metodología de estudio del estudiante

Cada sección sigue el mismo ciclo, que el diseño hace visible:

1. **Leer** la motivación y el concepto.
2. **Ejecutar** el ejemplo mínimo y comparar con la salida mostrada.
3. **Modificar** el ejemplo según las preguntas de «Compruébalo» (predecir antes de ejecutar).
4. **Aplicar** en el proyecto.
5. **Repasar** al cierre del capítulo: resumen, glosario y ejercicios; el hito del proyecto confirma que se domina.

## Plan si se aprueba

1. Muestra completa de una sección de Java (equals y hashCode) en el diseño nuevo (lista en la vista previa).
2. Ajustar el lector de la app: quitar capas y marcadores, estilos nuevos de listados y recuadros.
3. Reescribir una sección real en la app y revisarla en local antes de migrar nada más.
4. Actualizar `PLANTILLA_CURSO.md`, `INSTRUCCIONES_AGENTE.md` y el validador a la v3.
5. Migrar por prioridad: Java, Spring Boot, Microservicios, Flutter, iOS, Angular, Fundamentos y el resto.
