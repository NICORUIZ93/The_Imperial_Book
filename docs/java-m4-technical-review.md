# Java M4 — revisión técnica de Streams, Optional y Gatherers

Fecha: 2026-11-13. Lección: `web/public/content/java/modulo-4.md`. Ejecución: Temurin 25.0.2 en macOS. Revisión de agente; no es una firma pedagógica humana ni una prueba con estudiantes.

## Cobertura comprobada

| Tema | Cobertura del tema | Subtemas críticos identificados | Ejecución | Pendiente de profundidad |
|---|---|---|---|---|
| 1. Stream API | 1/1 inspeccionado técnicamente | Etapas `filter`/`map`, terminales `toList`/`collect`, identidad de `reduce`, stream primitivo, consumo único | 3 programas completos; el tercero termina intencionalmente con `IllegalStateException` | Interferencia con la fuente, efectos laterales, desbordamiento con datos límite |
| 2. Optional | 1/1 inspeccionado técnicamente | Presencia/ausencia, `map`/`orElse`, frontera `ofNullable`/`of`, `get` vacío | 3 programas completos; búsqueda encontrada y ausente | Ejemplo de un **método que retorna** `Optional`, diferencia entre `orElse` y `orElseGet` con valor costoso |
| 3. Referencias y paralelismo | 1/1 inspeccionado técnicamente | Referencia frente a lambda, reducción paralela, orden de efectos | 3 programas completos | El riesgo de mutación compartida solo se describe; falta fallo reproducible y medición de rendimiento separada |
| 4. Gatherers | 1/1 inspeccionado técnicamente | Ventana móvil, ventana fija parcial, tamaño insuficiente, elección frente a filtro | 2 programas completos y fragmento 4.2 insertado en `main`; variantes con ventanas de tamaño 2 y entrada corta | Rendimiento y memoria con tamaños de ventana grandes |

**Temas:** 4/4 inspeccionados técnicamente; 0/4 con firma pedagógica humana registrada. **Subtemas críticos:** el mapa de arriba distingue mecanismos comprobados de huecos concretos; no se declara un porcentaje semántico cerrado porque una auditoría automática no puede probar que el mapa sea exhaustivo. Compilaron los 11 bloques Java completos. Diez salieron con código 0; `UnaVez` salió con código 1 después de imprimir `2`, que es el fallo que enseña. El fragmento 4.2 compiló y ejecutó al insertarlo en la clase del 4.1.

## Correcciones de esta revisión

- El ejemplo de `collect` crea explícitamente un `ArrayList` modificable. La suma usa centavos enteros y contrasta `reduce(0L, Long::sum)` con `mapToLong().sum()`, evitando presentar `double` como importe monetario exacto. Se reprodujo el total 550 y el error de identidad 100L queda descrito con resultado 650.
- Tras reemplazar `Buscar.java`, el estudiante recompila antes de ejecutar y así evita observar el `.class` antiguo.
- `windowSliding(2)` sobre la secuencia dada produce **dos** ventanas `[true, true]` solapadas; la pareja final es `[false, true]`. El texto anterior atribuía erróneamente un atraso a esa pareja.
- El ejercicio 4.3 ahora es un archivo completo y comprueba una entrada corta. En JDK 25, `windowSliding(3)` sobre `[true, true]` emite `[[true, true]]`; sin `ventana.size() == 3` había un falso positivo de tres atrasos. Se ejecutaron ambas variantes.
- La construcción guiada ya no exige una medición de tiempo que sus pasos no enseñan a producir.

## Puerta curricular pendiente antes de dar M4 por terminado

El módulo 4 comienza con `Envio::activo`, lambdas en `filter`, `Long::sum` y `ArrayList::new`, pero M0–M3 no tienen un tema completo de lambdas. El módulo 20 sí enseña interfaces funcionales y referencias, después de Streams, creando una dependencia invertida. Según `AGENTS.md`, antes de Streams debe existir un tema completo que cubra sintaxis y SAM, target typing, captura y `this`, referencias a métodos, ambigüedad por sobrecargas, excepciones checked y especializaciones primitivas, con explicación, ejecución, límite y transferencia por cada mecanismo crítico. La relación **lambdas → Streams/Optional/Gatherers** es un prerrequisito duro por los tipos que aceptan `filter`, `map`, `reduce` y `gather`; referencias y Streams paralelos pueden venir después. Falta redactar y revisar ese tema sin aumentar deuda de profundidad. No se ha publicado un tema nuevo ni se declara M4 listo para cierre.

**Verificaciones separadas:** se ejecutaron ejemplos Java, no hubo prueba de navegador tras estos cambios de Markdown, no se probaron Windows/Linux y no existe firma pedagógica humana. Las auditorías de estructura no sustituyen esos controles.

Fuentes primarias: [Stream API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html), [Collectors](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html), [Optional](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html), [Gatherers](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html), [expresiones lambda en JLS 25](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html).
