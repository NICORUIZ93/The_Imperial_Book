# Java M2 — revisión técnica de colecciones y genéricos

Fecha: 2026-11-13. Fuente de la lección: `web/public/content/java/modulo-2.md`. Entorno ejecutado: Temurin 25.0.2 en macOS. Este registro separa lectura técnica, ejecución y firma pedagógica humana; ninguna de las primeras sustituye la última.

| Tema | Subtemas críticos identificados | Lectura técnica | Ejecución | Firma humana |
|---|---:|---|---|---|
| 1. List, Set, Map | 3/3 con explicación, salida, límite y transferencia | Hecha | 3 programas y 3 fallos reproducidos | Pendiente |
| 2. Genéricos, wildcards, borrado | 4/4 con explicación, salida, límite y transferencia | Hecha | 4 programas, 4 fallos y diagnóstico raw reproducidos | Pendiente |
| 3. Comparable, Comparator, Iterator | 3/3 con explicación, salida, límite y transferencia | Hecha | 3 programas y 3 fallos reproducidos | Pendiente |

**Cobertura del tema:** 3/3 temas inspeccionados técnicamente; 0/3 con firma humana en `docs/subtopic-depth-reviewed.json`. **Cobertura de subtemas críticos identificados:** 10/10 inspeccionados en el texto y con una observación ejecutable; esto no prueba que la descomposición semántica sea exhaustiva. Se ejecutaron los 10 programas Java completos de la lección. El bloque adicional de tres líneas sobre tipos raw se insertó en su programa y reprodujo una advertencia `unchecked` seguida de `ClassCastException`. La integración `MotorAsignacion.java` compiló junto con la `modelo.Guia` exacta de M1 T4.3, produjo una duplicada y dos asignables y reprodujo el fallo de modificación directa del `LinkedHashMap`.

Correcciones verificadas en este avance:

- T1 separa `LinkedHashSet` del contrato de orden de `TreeSet`, que aparece después en T3. El caso `List` conserva cuatro entradas frente a dos códigos únicos; `getOrDefault` devuelve `null` cuando la clave existe con ese valor, y `containsKey` distingue el caso ausente.
- T2 explica invariancia y la diferencia entre los límites `extends` y `super`; el fallo `List<Double>` fue rechazado por `javac`. Un `instanceof Caja<String>` sobre una referencia de tipo `Caja<String>` puede compilar; sobre `Object` se rechazó. La mezcla raw/parametrizado emitió el aviso y falló al leer.
- T3 ordena sin usar `record`, lambdas ni referencias a métodos que se enseñan más adelante; comprueba desempate, equivalencia en `TreeSet`, eliminación con `Iterator.remove` y los errores `ConcurrentModificationException` e `IllegalStateException`.

**Límites:** `Guia` de T3.1 hereda igualdad por identidad y su orden natural usa código; la lección señala expresamente que esa clase didáctica no debe combinarse como modelo de dominio entre `TreeSet` y `HashSet` hasta alinear `equals`, `hashCode` y `compareTo` (M22). No se ejecutaron los comandos en Windows ni Linux ni se hizo prueba de navegador en este avance de contenido. La revisión pedagógica con una persona sigue pendiente y el registro de profundidad permanece sin cambios para M2.

Fuentes primarias contrastadas: [TreeSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html), [Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html), [List.sort](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)), [Iterator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html), [tipos raw](https://docs.oracle.com/javase/tutorial/java/generics/rawTypes.html), [wildcards](https://dev.java/learn/generics/wildcards/) y [JLS §15.20.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.20.2).
