# Deuda editorial verificable

Este inventario se genera desde el Markdown real mediante detectores heurísticos de presencia. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial. Un criterio detectado no demuestra que la explicación sea correcta o suficiente ni que el código se haya ejecutado.

El estado «completo» de este reporte solo significa que aparecen los criterios de esta auditoría; no equivale a completar los siete pasos editoriales. La auditoría independiente de siete pasos evalúa otros 16 marcadores y registra su propio resultado en `seven-step-methodology.md`.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 1164 | 0 |
| Código | 1164 | 0 |
| Ruta | 1164 | 0 |
| Ejecución | 1162 | 2 |
| Resultado | 1164 | 0 |
| Modificación | 1164 | 0 |
| Conexión con un proyecto | 1152 | 12 |
| Modelo mental | 1164 | 0 |
| Límites | 1162 | 2 |
| **Perfil de criterios detectado** | **1150** | **14** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin proyecto | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 74 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| angular | 71 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cloud | 156 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| devops | 129 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| flutter | 63 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| foundations | 100 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ios | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| java | 109 | 0 | 0 | 0 | 0 | 0 | 12 | 2 |
| javascript | 88 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| kotlin-multiplatform | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| node | 77 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| react | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| rutaflow | 29 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| spring-boot | 98 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |

## Pendientes por tema

- [java · módulo 0](../web/public/content/java/modulo-0.md) · Tema 0: Instalar Eclipse Temurin JDK 27 en macOS, Windows y Ubuntu · Básico · 15 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 1: Lambdas a fondo — tipo objetivo, captura y referencias a métodos · Intermedio · 120 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 5: Function y BiFunction — transformar con una o dos entradas · Básico · 30 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 6: UnaryOperator y BinaryOperator — cuando entrada y salida comparten tipo · Básico · 20 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 7: Referencias a métodos — las cuatro formas · Básico · 25 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 8: Optional — ausencia explícita sin null · Intermedio · 30 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 9: Streams intermedios — map, filter, flatMap y sorted · Intermedio · 35 min: conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 10: Streams terminales — collect, reduce, forEach y find · Intermedio · 35 min: conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 11: Collectors — toList, toMap, groupingBy y joining · Intermedio · 35 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 12: Streams paralelos — cuándo ayudan y cuándo engañan · Avanzado · 30 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 13: Pureza y efectos secundarios — razonar sobre funciones · Intermedio · 30 min: conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 14: Flow API — reactive streams en la biblioteca estándar · Avanzado · 30 min: conexión con un proyecto.
- [spring-boot · módulo 0](../web/public/content/spring-boot/modulo-0.md) · Tema 4: Ciclo de vida de un bean y BeanPostProcessor · Intermedio · 30 min: ejecución.
- [spring-boot · módulo 0](../web/public/content/spring-boot/modulo-0.md) · Tema 5: AOP con @Aspect y @Around — preocupaciones transversales · Avanzado · 40 min: ejecución.

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas. El resultado de esta comprobación debe complementarse con la auditoría de siete pasos y una revisión humana; los indicadores de presencia no certifican calidad, aprendizaje ni ejecución.
