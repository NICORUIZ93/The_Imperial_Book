# Módulo 11: JVM interna — GC, profiling y JIT


## Aprende construyendo

### Tema 1: Generaciones de memoria y recolectores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás medir y comparar las pausas de G1 y ZGC bajo la misma carga de asignación de objetos, y decidir cuál recolector corresponde según throughput o latencia mínima. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un servicio de entregas reporta latencia creciente bajo carga, y el equipo "optimiza" cambiando el recolector a ciegas sin medir primero cuántas pausas de GC ocurren realmente ni cuánto duran, arriesgando cambiar algo que no era el cuello de botella real.

#### Paso 3 · Teoría, modelo mental y analogía
La heap se divide en una generación joven (donde nacen los objetos, recolectada frecuente y rápidamente) y una vieja (objetos que sobrevivieron, recolectada con menor frecuencia); G1 balancea throughput y pausas predecibles, ZGC prioriza pausas sub-milisegundo a costa de algo más de overhead. La analogía: revisar una flota con telemetría real antes de cambiar piezas — el ruido no se corrige a ciegas sin identificar primero el síntoma exacto.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-g1-vs-zgc
cd ejemplo-g1-vs-zgc
mkdir -p src/main/java/academia/perf
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `src/main/java/academia/perf/CargaAsignacion.java`: un bucle que crea millones de objetos pequeños de vida corta en un `while(true)` con un contador de iteraciones impreso cada segundo. Compílalo con `javac -d out src/main/java/academia/perf/CargaAsignacion.java` y ejecútalo primero con `java -Xlog:gc -XX:+UseG1GC -cp out academia.perf.CargaAsignacion`, luego con `-XX:+UseZGC`.

#### Paso 5 · Práctica guiada
Pista: reduce deliberadamente el heap máximo (`-Xmx64m`) con G1 para provocar pausas de GC visibles y más frecuentes en el log; lee las líneas `[gc]` que muestran duración de pausa. Resultado esperado: aumentar `-Xmx` reduce la frecuencia de pausas para la misma carga.

#### Paso 6 · Práctica independiente
Ejecuta la misma carga con `-Xlog:gc` bajo G1 y bajo ZGC, mide la pausa máxima reportada en cada log, y documenta cuál elegirías para un servicio de baja latencia frente a uno de alto throughput por lotes.

#### Paso 7 · Cierre y evidencia
Guarda ambos logs de GC (G1 y ZGC) con sus pausas máximas comparadas; como siguiente paso graba un perfil JFR de la misma carga. Errores comunes: tunear el recolector sin un baseline medido previamente, confundir uso de heap con memoria nativa (fuera del control del GC), y comparar recolectores bajo cargas de trabajo distintas en vez de la misma carga exacta. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/gctuning/.
**¿Por qué es importante?** Porque elegir un recolector sin medir primero es optimizar a ciegas; la decisión entre G1 y ZGC depende de si la aplicación prioriza throughput general o latencia mínima extrema, algo que solo una medición real responde.
**Evidencia de aprendizaje:** entrega ambos logs de GC (G1 y ZGC) con sus pausas máximas comparadas bajo la misma carga, y la justificación de cuál elegirías.
**Conceptos clave:** generación joven vs vieja, G1 frente a ZGC.

La heap de la JVM se divide típicamente en una generación joven (donde se crean los objetos recién instanciados, recolectada frecuentemente y de forma rápida) y una generación vieja (donde terminan los objetos que sobrevivieron varias rondas de recolección de la generación joven, recolectada con menor frecuencia pero de forma más costosa), una división basada en la observación empírica conocida como "hipótesis generacional débil": la gran mayoría de los objetos creados en cualquier programa mueren jóvenes (dejan de ser referenciados poco después de crearse), por lo que concentrar el esfuerzo de recolección frecuente específicamente en esa generación joven, donde efectivamente se encuentra la mayoría de la basura recolectable, es considerablemente más eficiente que recorrer la heap completa con la misma frecuencia sin distinción.

G1 (Garbage-First) ofrece un buen balance general entre throughput (cantidad total de trabajo útil que la aplicación puede realizar) y pausas predecibles y razonablemente cortas, apropiado para la gran mayoría de aplicaciones sin requisitos extremos de latencia; ZGC ofrece pausas ultra-cortas, del orden de sub-milisegundo, incluso con heaps extremadamente grandes, a cambio de algo más de overhead general de procesamiento, siendo la elección apropiada específicamente para aplicaciones muy sensibles a la latencia donde incluso una pausa breve de G1 sería inaceptable, aceptando a cambio un throughput total potencialmente algo menor.

**Actualización de plataforma:** G1 es el recolector por defecto desde Java 9, pero solo en máquinas "server-class"; en entornos restringidos (un solo CPU, o menos de 1792&nbsp;MB de memoria física — típico de un contenedor pequeño) la JVM elegía Serial GC por defecto en su lugar. Desde JDK 27 (JEP 523), G1 es el default en **todos** los entornos sin excepción; una aplicación que corre en un contenedor pequeño sin especificar recolector explícitamente pasa a usar G1 donde antes usaba Serial, y conviene volver a medir si eso cambia algo relevante.

**Analogía:** la generación joven es como una bandeja de entrada que se revisa y se vacía frecuentemente, dado que la mayoría de sus elementos se resuelven o descartan rápidamente; la generación vieja es como un archivo de largo plazo revisado con mucha menor frecuencia, dado que lo que llega ahí ya demostró que probablemente permanecerá relevante por más tiempo. G1 es como un equipo de limpieza que hace rondas regulares y predecibles sin detener completamente las operaciones normales del edificio; ZGC es como un sistema de limpieza casi instantáneo e imperceptible, a costa de requerir algo más de recursos generales para operar de esa forma.

**¿Por qué es importante?** La división generacional concentra el esfuerzo de recolección frecuente donde efectivamente se encuentra la mayoría de la basura recolectable; elegir G1 frente a ZGC depende de si la aplicación prioriza throughput general o latencia mínima extrema.

**Prueba en terminal:**

```bash
java -XX:+UseZGC -jar mi-app.jar
```
```
Generación joven: objetos recién creados, recolectada frecuente y rápidamente
Generación vieja: objetos que sobrevivieron, recolectada con menor frecuencia
G1: buen balance throughput/pausas | ZGC: pausas sub-milisegundo, algo más de overhead
```

Elegir el recolector correcto es una decisión de infraestructura que documentarías igual para el Proyecto integrador (Módulo 13) antes de desplegarlo bajo carga real.

**Cuándo no usarlo:** para un script de corta vida o una prueba unitaria, tunear el recolector es tiempo perdido; solo importa en procesos de larga duración con carga sostenida.

### Tema 2: Java Flight Recorder y JIT compilation

#### Paso 1 · Objetivo y preparación
Al finalizar podrás grabar un perfil de JFR con overhead mínimo apto para producción, e identificar el método que realmente consume más CPU bajo una carga real. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Medir el rendimiento de un método justo al arrancar la aplicación, antes de que el JIT haya compilado el código caliente a código máquina optimizado, mide el intérprete lento de arranque, no el rendimiento real que esa misma aplicación tendrá en producción tras unos segundos de uso continuo.

#### Paso 3 · Teoría, modelo mental y analogía
La JVM interpreta bytecode inicialmente, pero identifica dinámicamente el código "caliente" (ejecutado con mucha frecuencia) y lo compila en caliente a código máquina optimizado (JIT); JFR graba eventos detallados de la JVM con overhead deliberadamente mínimo, pensado para usarse de forma segura en producción. La analogía: un traductor que al notar que ciertas frases se repiten constantemente, memoriza progresivamente una traducción óptima para ellas, acelerando esas partes recurrentes con el tiempo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-jfr-warmup
cd ejemplo-jfr-warmup
mkdir -p src/main/java/academia/perf
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `src/main/java/academia/perf/MetodoCaliente.java`: un método que hace una operación aritmética simple dentro de un bucle de 50 millones de iteraciones, imprimiendo el tiempo transcurrido cada 10 millones de iteraciones (deberías ver que las últimas mediciones son más rápidas que las primeras, evidencia del warm-up del JIT). Compílalo y ejecútalo con `java -XX:StartFlightRecording=filename=perfil.jfr -cp out academia.perf.MetodoCaliente`.

#### Paso 5 · Práctica guiada
Pista: ejecuta la misma clase con `-Xint` (fuerza modo interpretado puro, sin JIT) para provocar deliberadamente la ausencia de aceleración por warm-up; compara el tiempo total contra la ejecución normal. Resultado esperado: sin JIT, el tiempo por bloque de iteraciones se mantiene constante en vez de acelerarse.

#### Paso 6 · Práctica independiente
Abre `perfil.jfr` con `jfr print --events jdk.ExecutionSample perfil.jfr` y documenta qué método aparece con más muestras (el método "caliente" real).

#### Paso 7 · Cierre y evidencia
Guarda el comportamiento con y sin `-Xint`, y el resumen de `jfr print` mostrando el método caliente; como siguiente paso investiga una retención de memoria con heap dump. Errores comunes: medir rendimiento sin dejar que el warm-up del JIT ocurra primero, asumir que JFR tiene overhead alto en producción sin haberlo medido, y confundir el método que aparece con más muestras con la causa raíz sin revisar su contexto de llamada. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html.
**¿Por qué es importante?** Porque medir antes del warm-up del JIT mide el intérprete lento de arranque, no el rendimiento real que la aplicación tendrá en producción tras los primeros segundos de ejecución continua.
**Evidencia de aprendizaje:** entrega la comparación con y sin `-Xint` (JIT desactivado), y el método caliente real identificado con `jfr print`.
**Conceptos clave:** perfilado de bajo overhead en producción, compilación en caliente.

Java Flight Recorder (JFR) graba eventos detallados de la JVM (uso de CPU por método, actividad de memoria, contención de locks) con un overhead deliberadamente mínimo, diseñado específicamente para poder usarse de forma segura en producción sin degradar significativamente el rendimiento de la aplicación mientras se graba: `java -XX:StartFlightRecording=filename=perfil.jfr -jar mi-app.jar` inicia una grabación que produce un archivo `.jfr` analizable posteriormente, permitiendo diagnosticar problemas reales de rendimiento observados directamente en producción bajo carga real, en vez de tener que intentar reproducir artificialmente esas condiciones en un entorno de pruebas separado, que frecuentemente no logra replicar exactamente las condiciones específicas que causan el problema real observado.

La JVM inicialmente interpreta el bytecode (Módulo 0) en vez de compilarlo directamente a código máquina, pero identifica dinámicamente el código "caliente" (métodos ejecutados con muchísima frecuencia durante la ejecución real) y lo compila en caliente a código máquina nativo altamente optimizado específicamente para el patrón de uso observado en esa ejecución concreta, un proceso llamado compilación JIT (Just-In-Time); esta es precisamente la razón por la que una aplicación Java típica suele acelerarse notablemente después de sus primeros segundos de ejecución (el período de "warm-up"): el código que efectivamente se ejecuta con mayor frecuencia progresivamente deja de interpretarse y pasa a ejecutarse como código máquina nativo ya optimizado por el JIT.

**Analogía:** JFR es como una caja negra de un avión, registrando datos detallados de la operación con un impacto mínimo en el propio funcionamiento del avión, permitiendo analizar exactamente qué ocurrió durante un vuelo real específico en vez de solo poder estudiar simulaciones de vuelo separadas; el JIT es como un traductor que inicialmente interpreta un discurso frase por frase en tiempo real, pero que, al notar que ciertas frases se repiten constantemente, memoriza y perfecciona progresivamente una traducción óptima específica para esas frases frecuentes, acelerando notablemente la traducción de esas partes recurrentes con el paso del tiempo.

**¿Por qué es importante?** JFR permite diagnosticar problemas de rendimiento con evidencia real de producción, con overhead mínimo; el JIT explica por qué el rendimiento de una aplicación Java mejora progresivamente tras sus primeros momentos de ejecución.

**Prueba en terminal:**

```bash
java -XX:StartFlightRecording=filename=perfil.jfr -jar mi-app.jar
```
```
JVM interpreta bytecode inicialmente → identifica código "caliente" → 
compila JIT a código máquina optimizado → la app se acelera tras el warm-up
```

Un benchmark del Proyecto integrador (Módulo 13) que no espera el warm-up del JIT mide el intérprete, no el rendimiento real de producción.

**Cuándo no usarlo:** para un script de un solo uso que se ejecuta y termina en milisegundos, el warm-up del JIT nunca llega a ocurrir; no tiene sentido optimizar pensando en código "caliente" que no existirá.

### Tema 3: Referencias especiales y heap dumps

#### Paso 1 · Objetivo y preparación
Al finalizar podrás provocar un `OutOfMemoryError` real, analizar el heap dump que genera, y corregirlo reemplazando referencias fuertes por `SoftReference` en una caché. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Una caché implementada con una lista que acumula objetos indefinidamente sin nunca liberarlos agota la heap disponible tarde o temprano; sin un heap dump del momento exacto del fallo, diagnosticar qué estaba acumulándose y desde dónde es mucho más difícil que con los logs normales de la aplicación.

#### Paso 3 · Teoría, modelo mental y analogía
Un heap dump es un volcado completo del contenido de la heap en el instante de un fallo, mostrando exactamente qué objetos consumían la memoria; `WeakReference`/`SoftReference` permiten que el recolector libere un objeto si ya no hay otras referencias fuertes hacia él, cooperando con el recolector en vez de impedir siempre su trabajo. La analogía: una fotografía forense tomada exactamente en el momento de un colapso, mostrando con precisión qué había acumulado — algo que un registro de eventos anteriores no puede ofrecer con el mismo nivel de detalle del instante exacto.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-heap-dump-oom
cd ejemplo-heap-dump-oom
mkdir -p src/main/java/academia/perf
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `src/main/java/academia/perf/FugaCache.java`: una `List<byte[]>` estática donde un bucle agrega arreglos de 1MB indefinidamente sin nunca liberarlos, hasta agotar la heap. Compílalo y ejecútalo con `java -Xmx128m -XX:+HeapDumpOnOutOfMemoryError -cp out academia.perf.FugaCache`.

#### Paso 5 · Práctica guiada
Pista: deja correr el programa para provocar deliberadamente un `OutOfMemoryError`; el flag `-XX:+HeapDumpOnOutOfMemoryError` genera automáticamente un archivo `.hprof` en ese momento. Resultado esperado: el heap dump muestra `byte[]` como el tipo dominante en memoria.

#### Paso 6 · Práctica independiente
Reescribe `FugaCache` usando `List<SoftReference<byte[]>>` en vez de referencias fuertes, ejecuta de nuevo con el mismo `-Xmx128m` y confirma que ya no se produce `OutOfMemoryError` porque el recolector libera las referencias suaves bajo presión de memoria.

#### Paso 7 · Cierre y evidencia
Guarda el `.hprof` generado, el análisis de qué tipo dominaba la memoria, y la versión corregida con `SoftReference` que ya no falla; como siguiente paso construye el laboratorio completo del capítulo. Errores comunes: usar referencias fuertes para una caché que debería poder liberarse bajo presión de memoria, intentar una corrección a ciegas sin analizar primero el heap dump, y capturar un heap dump de producción con datos sensibles sin sanearlo antes de compartirlo. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jhsdb.html.
**¿Por qué es importante?** Porque un heap dump muestra exactamente qué objetos consumían la memoria en el instante del fallo, información mucho más específica que los logs normales; una caché con referencias fuertes que nunca se liberan es una causa común y evitable de ese mismo fallo.
**Evidencia de aprendizaje:** entrega el `.hprof` generado por el `OutOfMemoryError`, el análisis de qué tipo dominaba la memoria, y la corrección con `SoftReference` que ya no falla bajo el mismo límite de heap.
**Conceptos clave:** `WeakReference`/`SoftReference`/`PhantomReference`, análisis de un heap dump.

`WeakReference` permite mantener una referencia a un objeto sin impedir que el recolector de basura lo elimine si esa es la única referencia restante hacia él (a diferencia de una referencia normal, "fuerte", que sí impide la recolección mientras exista), apropiada para estructuras como cachés donde se desea que ciertos objetos puedan liberarse automáticamente si la memoria se vuelve escasa y ya no hay otras referencias reales activas hacia ellos; `SoftReference` es similar pero más conservadora, permitiendo que el recolector la elimine solo bajo presión real de memoria, no tan agresivamente como una `WeakReference`; `PhantomReference`, junto con una `ReferenceQueue` asociada, permite ejecutar cierta lógica de limpieza específica justo después de que un objeto ha sido efectivamente finalizado por el recolector, un mecanismo más avanzado y de uso considerablemente menos común que los dos anteriores.

Provocar intencionalmente un `OutOfMemoryError` (acumulando objetos indefinidamente en una estructura sin nunca liberar sus referencias) y analizar el heap dump generado en ese momento (un volcado completo del contenido de la heap en el instante del error) permite identificar exactamente qué objetos específicos consumían la memoria disponible en el momento del fallo, y con qué frecuencia y desde qué puntos del código se estaban creando, información considerablemente más específica y accionable que la que los logs normales de la aplicación proporcionarían, dado que los logs típicamente no capturan el estado completo detallado de la memoria en el instante exacto de un fallo de memoria.

**Analogía:** una `WeakReference` es como una nota adhesiva que recuerda dónde está un objeto, pero que no impide que ese objeto se deseche si nadie más lo necesita realmente; un heap dump es como una fotografía forense detallada tomada exactamente en el momento de un colapso, mostrando con precisión qué había acumulado y en qué cantidades exactas, información que un simple registro de eventos anteriores al colapso no podría ofrecer con el mismo nivel de detalle específico del instante del fallo.

**¿Por qué es importante?** Las referencias especiales (`WeakReference`, `SoftReference`) permiten estructuras que cooperan con el recolector de basura en vez de impedir siempre su trabajo; un heap dump proporciona información detallada y específica sobre el estado exacto de la memoria en el momento de un fallo, información que los logs normales no capturan.

**Diagrama:**

```mermaid
flowchart LR
    ROOT["GC roots"] --> LIVE["objetos alcanzables"]
    CACHE["caché fuerte accidental"] --> LIVE
    WEAK["WeakReference"] -. "no impide recolección" .-> CANDIDATE["objeto sin raíz fuerte"]
    DUMP["heap dump"] --> DOMINATOR["retained size y dominators"]
```

Diagnosticar una fuga de memoria con heap dump es la habilidad que usarías si el Proyecto integrador (Módulo 13) empezara a consumir memoria creciente en producción.

**Cuándo no usarlo:** capturar un heap dump completo en un servicio de producción con datos sensibles puede exponer información confidencial en el volcado; sanea o restringe el acceso al archivo `.hprof` antes de compartirlo.

### Tema 4: Foreign Function & Memory API (Java 22)

#### Paso 1 · Objetivo y preparación
Al finalizar vas a llamar una función nativa de C (`strlen` de la libc) desde Java con el Foreign Function & Memory API, sin escribir ningún código JNI. Prerrequisitos: JDK 22+ y Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
El equipo necesita invocar una librería nativa C ya probada en producción (no quiere reescribirla en Java); hacerlo con JNI tradicional requeriría generar cabeceras, compilar código C intermedio, y mantener ese puente nativo.

#### Paso 3 · Teoría, modelo mental y analogía
El FFM API (finalizado en Java 22) reemplaza JNI con un modelo seguro: un `Linker` resuelve símbolos nativos, un `MethodHandle` los invoca, y un `Arena` controla explícitamente el ciclo de vida de la memoria nativa asignada — esa memoria, fuera del heap de Java, no la gestiona el recolector. La analogía: pedir prestada una herramienta de un taller ajeno con un control de devolución explícito, en vez de confiar en que alguien la devuelva sola.

#### Paso 4 · Demostración guiada desde cero
Crea `src/main/java/academia/interop/LongitudNativa.java`:
```java
Linker linker = Linker.nativeLinker();
MethodHandle strlen = linker.downcallHandle(
    linker.defaultLookup().find("strlen").get(),
    FunctionDescriptor.of(JAVA_LONG, ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment texto = arena.allocateUtf8String("entrega-RF-4471");
    long longitud = (long) strlen.invoke(texto);
}
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Resultado esperado: `longitud` devuelve 15, obtenido invocando directamente la función `strlen` de la libc del sistema operativo desde Java puro, sin ningún código C ni JNI intermedio compilado por separado.

#### Paso 5 · Práctica guiada
Pista: movés `MemorySegment texto` fuera del bloque `try (Arena ...)` guardándolo en un campo para "reusarlo después" en una segunda llamada nativa posterior. Ese es el fallo deliberado: el `Arena` confinado se cierra automáticamente al salir del bloque `try`, liberando la memoria nativa que respaldaba a `texto`; la segunda llamada que intenta usar ese segmento lanza `IllegalStateException: Already closed`.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 asegurando que toda llamada nativa que use `texto` ocurra dentro del mismo bloque `try (Arena ...)` que lo asignó; si genuinamente necesitás reusar el segmento entre varias llamadas, usá un `Arena.ofShared()` con un ciclo de vida explícitamente más largo y documentado.

#### Paso 7 · Cierre y evidencia
Entregá la llamada nativa exitosa del Paso 4, el `IllegalStateException` por memoria liberada del Paso 5, y la corrección de ciclo de vida del Paso 6; explicá por qué la memoria nativa fuera del heap necesita un dueño explícito (el `Arena`) en vez de depender del recolector de basura de Java. Siguiente paso: cerrá el módulo con el laboratorio completo del capítulo. Errores comunes: usar memoria de un Arena confinado después de que se cerró, no liberar nunca un Arena de vida larga (fuga de memoria nativa), y preferir JNI tradicional para casos donde el FFM API ya cubre la necesidad de forma más segura. Fuentes oficiales: https://openjdk.org/jeps/454 y https://docs.oracle.com/en/java/javase/22/core/foreign-function-and-memory-api.html.
**¿Por qué es importante?** La memoria nativa asignada fuera del heap de Java no la libera el recolector de basura; un Arena con ciclo de vida explícito es la única garantía de que esa memoria se libera correctamente, ni antes ni después de tiempo.
**Evidencia de aprendizaje:** entrega llamada nativa funcionando con FFM API, IllegalStateException por memoria liberada reproducido y corrección de ciclo de vida confirmada.
**Conceptos clave:** Foreign Function & Memory API, Linker, MethodHandle, MemorySegment, Arena, ciclo de vida de memoria nativa, reemplazo de JNI.

Cada integración del proyecto integrador de este track con una librería nativa existente (en vez de reescribirla en Java) se beneficia del FFM API en vez de JNI tradicional.

**Cuándo no usarlo:** para funcionalidad que ya existe como librería Java pura, agregar una dependencia nativa con FFM API introduce una dependencia del sistema operativo y complejidad de ciclo de vida de memoria sin ningún beneficio real.

El FFM API reemplaza JNI con un modelo considerablemente más simple y seguro de tipos: un `Linker` resuelve un símbolo nativo por nombre y describe su firma (`FunctionDescriptor`), produciendo un `MethodHandle` invocable directamente desde Java; un `Arena` controla explícitamente cuándo se libera la memoria nativa asignada (`MemorySegment`), reemplazando el manejo manual de punteros y la generación de código C intermedio que JNI tradicional requería.

**Diagrama:**

```mermaid
flowchart LR
    A["Arena.ofConfined()"] --> M[MemorySegment asignado]
    M --> C["strlen invocado via MethodHandle"]
    C --> R[resultado]
    A -->|cierra el bloque try| L["memoria liberada: M ya inválido"]
```

**Analogía:** el FFM API es como pedir prestada una herramienta de un taller ajeno con un control de devolución explícito y claro; JNI tradicional es como construir un puente completo de concreto entre dos talleres solo para pasar una herramienta una vez.

**¿Por qué es importante?** El FFM API permite invocar código nativo existente de forma segura y con tipos verificados, sin la ceremonia ni los riesgos de memoria de JNI tradicional.

**Código del ejemplo:**

```java
Linker linker = Linker.nativeLinker();
MethodHandle strlen = linker.downcallHandle(
    linker.defaultLookup().find("strlen").get(),
    FunctionDescriptor.of(JAVA_LONG, ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment texto = arena.allocateUtf8String("entrega-RF-4471");
    long longitud = (long) strlen.invoke(texto);
}
```

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** generar un reporte de profiling identificando un cuello de botella real, y analizar un heap dump tras un `OutOfMemoryError` provocado intencionalmente.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Ejecutar con G1 y con ZGC, comparar pausas | Ver Tema 1 | `-XX:+UseG1GC` vs `-XX:+UseZGC` |
| 2 | Grabar una sesión de JFR bajo carga | Ver Tema 2 | Analiza el método que más CPU consume |
| 3 | Provocar un `OutOfMemoryError` intencional | Ver Tema 3 | Analiza el heap dump generado |
| 4 | Documentar qué hace el JIT compiler | Ver Tema 2 | Compilación en caliente del código frecuente |
| 5 | Invocar una función nativa con el FFM API | Ver Tema 4 | Sin JNI, con ciclo de vida de memoria explícito vía Arena |

**Verificación:** el laboratorio se considera exitoso si el reporte de JFR identifica correctamente el método real que más tiempo de CPU consume bajo la carga simulada, si el heap dump analizado identifica correctamente qué objetos causaron el `OutOfMemoryError`, y si la llamada nativa con FFM API falla de forma diagnosticable al usar memoria de un Arena ya cerrado.

**Errores comunes y soluciones**

- **Asumir que ZGC siempre es mejor que G1 sin medir.** ZGC prioriza latencia mínima a costa de throughput; mide según las necesidades reales de tu aplicación.
- **Intentar diagnosticar un problema de producción solo con logs normales.** Usa JFR o un heap dump para obtener el detalle específico necesario.
- **Usar referencias fuertes normales para una caché que debería liberarse bajo presión de memoria.** Considera `SoftReference` para ese caso específico.
- **Usar memoria nativa de un `Arena` después de que se cerró.** El Arena controla el ciclo de vida explícitamente; usa la memoria solo dentro de su scope o uno de vida más larga.

---
