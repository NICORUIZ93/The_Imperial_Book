# Java M3 — revisión técnica de excepciones y recursos

Fecha: 2026-11-13. Lección: `web/public/content/java/modulo-3.md`. Ejecución: Temurin 25.0.2 en macOS. Esta revisión técnica de agente no equivale a una firma pedagógica humana ni a una prueba con estudiantes.

| Tema | Subtemas críticos identificados | Lectura técnica | Ejecución | Firma humana |
|---|---:|---|---|---|
| 1. Checked vs unchecked | 3/3 | Hecha | Tres programas y fallos de compilación, índice y lectura reproducidos | Pendiente |
| 2. try-with-resources | 4/4 | Hecha | Cuatro programas; cierre normal, cierre tras fallo y excepción suprimida observados | Pendiente |
| 3. Excepciones propias | 4/4 | Hecha | Dos programas completos y dos variantes de `main` ensambladas y ejecutadas | Pendiente |

**Cobertura de temas:** 3/3 inspeccionados técnicamente; 0/3 con firma humana en `docs/subtopic-depth-reviewed.json`. **Cobertura de subtemas críticos identificados:** 11/11 con explicación, resultado observable, límite o error y práctica de transferencia; la lista sigue abierta a revisión semántica por una persona. Se compilaron y ejecutaron los nueve programas completos de los temas y el incremento integrado del proyecto. Los dos fragmentos de `main` del Tema 3 se insertaron en la clase completa y ejecutaron: el manejo específico produjo código de salida 2; el `catch` vacío produjo código 0 sin explicar el rechazo.

Hallazgos y correcciones:

- T1 usaba `String.lines().toList()` antes de la enseñanza de Streams en M4; ahora cuenta líneas mediante `List` y documenta el límite de memoria. El caso de configuración incluye contenido, ruta y código de salida. El índice inválido se explica como precondición del método y como entrada que debe validarse en la frontera.
- T2 usaba `BufferedReader.lines().forEach(System.out::println)` antes de enseñar Streams y referencias a métodos; ahora lee línea por línea. El fallo propuesto en T2.2 se cambió por uno compilable que demuestra la falta de cierre al sacar el recurso de `try-with-resources`. Se añadió el caso en que falla el cuerpo y también `close()`: `principal=trabajo`, `suprimida=cierre`; sin fallo del cuerpo, `principal=cierre`.
- T3 cambió de una billetera ajena al proyecto a la regla de capacidad del motor. La excepción guarda cantidades solicitadas y disponibles, el manejo específico comunica el rechazo con código 2, el `catch` vacío muestra un falso éxito y la traducción de `IOException` conserva la causa con `super(mensaje, causa)`.
- El incremento `MotorSeguro.java` usa la `modelo.Guia` de M1, la deduplicación por código de M2, lectura con cierre de M3 y `Asignador`. Se ejecutaron éxito (código 0), capacidad insuficiente (2), capacidad no numérica (3), guía vacía (3) y guía duplicada sin aumento de cupo (0).

**Pendientes separados:** no se ejecutaron los comandos en Windows o Linux; no hubo prueba de navegador porque solo cambió contenido; no hay firma pedagógica humana de M3. La ejecución verifica ejemplos concretos, no garantiza que todos los prerrequisitos o subtemas posibles estén cubiertos.

Fuentes primarias: [excepciones en dev.java](https://dev.java/learn/exceptions/), [Files.readAllLines](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#readAllLines(java.nio.file.Path)), [AutoCloseable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html), [try-with-resources y excepciones suprimidas](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html), [Throwable.getCause](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html#getCause()).
