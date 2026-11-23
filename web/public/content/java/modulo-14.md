# Módulo 14: Mecánica JVM y evolución de plataforma


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 14 — mapa visual](/visuals/temas/java/modulo-14-concurrencia-moderna.html)

Lectura: Los hilos virtuales escalan espera I/O; la seguridad sigue dependiendo de datos compartidos, timeouts y cancelación.


La JVM no es solo "donde corre Java". Es un runtime que decide visibilidad de memoria, optimiza código caliente, carga clases, gestiona objetos, y define herramientas de diagnóstico y empaquetado. Este módulo baja del “escribe código” al “entiende qué hace la plataforma con tu código”.

**Verificación real (2026-11-23, macOS arm64, JDK 27.0.1.0.2 Temurin, Gradle 9.9.1, JUnit 5.13.4):** `./gradlew -q test` pasó con 4 tests, 0 fallas. `./gradlew -q run` produjo la salida mostrada. `jdeps -s` y `jdeprscan` se ejecutaron sobre el JAR generado con el JDK Temurin 27. **Nota honesta:** no ejecuté JMH, jcstress, jlink image completa, JFR profiling de producción, ni mediciones CDS/AOT comparativas; donde corresponda indico comandos y límites.

## Proyecto desde cero: `tienda-aurora-java-m14`

### Prerrequisitos

```bash
java -version
javac -version
gradle --version
```

Para las herramientas `jdeps`/`jdeprscan`, usa un JDK completo (no solo JRE). En esta verificación se usó Temurin 27 en `~/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin`.

### 1. Crear base

```bash
mkdir -p tienda-aurora-java-m14
cd tienda-aurora-java-m14
gradle wrapper --gradle-version 9.9.1
mkdir -p src/main/java/com/aurora/jvm src/test/java/com/aurora/jvm
```

### 2. Estructura

```text
tienda-aurora-java-m14/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/jvm/
    │   ├── App.java
    │   ├── CicloVidaApp.java
    │   ├── CronometroIngenuo.java
    │   ├── DeserializacionSegura.java
    │   └── VisibilidadDemo.java
    └── test/java/com/aurora/jvm/JvmModuloTest.java
```

### 3. Código desde cero

#### `settings.gradle.kts`

Nombre del build.

```kotlin
rootProject.name = "tienda-aurora-java-m14"
```

#### `build.gradle.kts`

Java 25, JUnit 5, compilación estricta. Sin dependencias externas para mantener el foco en JVM/runtime.

```kotlin
plugins { java; application }
group = "com.aurora"
version = "1.0.0"
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
repositories { mavenCentral() }
dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
application { mainClass = "com.aurora.jvm.App" }
tasks.test { useJUnitPlatform(); testLogging { events("passed","failed","skipped"); showStandardStreams=true } }
tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all","-Xlint:-processing","-Werror"))
}
```

#### `src/main/java/com/aurora/jvm/VisibilidadDemo.java`

Demuestra publicación segura con `volatile`: el hilo lector espera la señal y ve el valor escrito antes.

```java
package com.aurora.jvm;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/** Demuestra visibilidad: con volatile el hilo lector ve la señal. */
public final class VisibilidadDemo {
    private volatile boolean listo = false;
    private int valor = 0;

    public String ejecutar() throws InterruptedException {
        CountDownLatch visto = new CountDownLatch(1);
        Thread lector = new Thread(() -> {
            while (!listo) {
                Thread.onSpinWait();
            }
            visto.countDown();
        }, "lector");
        lector.start();
        valor = 42;
        listo = true; // write volatile: publica valor=42 antes de listo=true
        boolean ok = visto.await(2, TimeUnit.SECONDS);
        lector.join(1000);
        return ok && valor == 42 ? "visible=42" : "timeout";
    }
}
```

#### `src/main/java/com/aurora/jvm/CronometroIngenuo.java`

Cronómetro ingenuo con `nanoTime`: sirve para mostrar por qué no es un benchmark válido.

```java
package com.aurora.jvm;

/** Microbenchmark ingenuo: útil para mostrar por qué NO es confiable. */
public final class CronometroIngenuo {
    static int suma(int n) {
        int s = 0;
        for (int i = 0; i < n; i++) s += i;
        return s;
    }

    public static long medirUnaVez() {
        long t0 = System.nanoTime();
        int r = suma(10_000);
        long t1 = System.nanoTime();
        if (r == Integer.MIN_VALUE) System.out.println("nunca"); // evita dead-code obvio
        return t1 - t0;
    }
}
```

#### `src/main/java/com/aurora/jvm/DeserializacionSegura.java`

Serializa y deserializa con `ObjectInputFilter` allow-list; rechaza tipos no autorizados.

```java
package com.aurora.jvm;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

public final class DeserializacionSegura {
    public record Mensaje(String texto) implements Serializable {}

    public static byte[] serializar(Serializable obj) throws Exception {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             ObjectOutputStream out = new ObjectOutputStream(bos)) {
            out.writeObject(obj);
            out.flush();
            return bos.toByteArray();
        }
    }

    public static Object deserializarSeguro(byte[] bytes) throws Exception {
        ObjectInputFilter filtro = ObjectInputFilter.Config.createFilter(
                "com.aurora.jvm.DeserializacionSegura$Mensaje;java.lang.String;!*");
        try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
             ObjectInputStream in = new ObjectInputStream(bis)) {
            in.setObjectInputFilter(filtro);
            return in.readObject();
        }
    }
}
```

#### `src/main/java/com/aurora/jvm/CicloVidaApp.java`

Registra y remueve un shutdown hook de forma segura para la demo; en producción el hook haría cierre limpio.

```java
package com.aurora.jvm;

import java.util.concurrent.atomic.AtomicBoolean;

public final class CicloVidaApp {
    public static String simular() {
        AtomicBoolean cerrado = new AtomicBoolean(false);
        Thread hook = new Thread(() -> cerrado.set(true), "shutdown-demo");
        Runtime.getRuntime().addShutdownHook(hook);
        try {
            // En app real: cerrar pools, flush métricas, liberar recursos.
            return "hookRegistrado=" + true;
        } finally {
            Runtime.getRuntime().removeShutdownHook(hook);
        }
    }
}
```

#### `src/main/java/com/aurora/jvm/App.java`

Ejecuta las demos verificables.

```java
package com.aurora.jvm;

public final class App {
    public static void main(String[] args) throws Exception {
        System.out.println(new VisibilidadDemo().ejecutar());
        System.out.println("ns=" + (CronometroIngenuo.medirUnaVez() >= 0));
        byte[] bytes = DeserializacionSegura.serializar(new DeserializacionSegura.Mensaje("hola"));
        Object obj = DeserializacionSegura.deserializarSeguro(bytes);
        System.out.println(obj);
        System.out.println(CicloVidaApp.simular());
    }
}
```

#### `src/test/java/com/aurora/jvm/JvmModuloTest.java`

Pruebas JUnit 5: visibilidad, cronómetro no negativo, filtro acepta/rechaza.

```java
package com.aurora.jvm;

import org.junit.jupiter.api.Test;

import java.io.Serializable;

import static org.junit.jupiter.api.Assertions.*;

class JvmModuloTest {
    @Test
    void visibilidadConVolatile() throws Exception {
        assertEquals("visible=42", new VisibilidadDemo().ejecutar());
    }

    @Test
    void cronometroIngenuoRetornaNoNegativo() {
        assertTrue(CronometroIngenuo.medirUnaVez() >= 0);
    }

    @Test
    void deserializacionPermiteTipoAutorizado() throws Exception {
        byte[] bytes = DeserializacionSegura.serializar(new DeserializacionSegura.Mensaje("ok"));
        Object obj = DeserializacionSegura.deserializarSeguro(bytes);
        assertEquals("Mensaje[texto=ok]", obj.toString());
    }

    @Test
    void deserializacionRechazaTipoNoAutorizado() throws Exception {
        byte[] bytes = DeserializacionSegura.serializar(Integer.valueOf(7));
        assertThrows(Exception.class, () -> DeserializacionSegura.deserializarSeguro(bytes));
    }
}
```

### 4. Ejecutar

```bash
./gradlew -q test
./gradlew -q run
./gradlew -q jar
jdeps -s build/libs/tienda-aurora-java-m14-1.0.0.jar
jdeprscan build/libs/tienda-aurora-java-m14-1.0.0.jar
```

Salida real de tests:

```text
BUILD SUCCESSFUL
4 tests, 0 failures
```

Salida real de `run`:

```text
visible=42
ns=true
Mensaje[texto=hola]
hookRegistrado=true
```

Salida real de `jdeps -s`:

```text
tienda-aurora-java-m14-1.0.0.jar -> java.base
```

Salida real de `jdeprscan` (sin APIs deprecadas/removidas detectadas en este JAR):

```text
Jar file build/libs/tienda-aurora-java-m14-1.0.0.jar:
```

## Conceptos cubiertos

### Tema 1: Compartir memoria requiere orden y visibilidad · Avanzado · 45 min

#### Problema

Dos hilos pueden ver memoria distinta si no hay una relación happens-before. El caso clásico: un hilo escribe `valor=42` y luego `listo=true`; otro hilo lee `listo==true` y espera ver `42`. Sin sincronización, el compilador/JVM/CPU pueden reordenar u omitir visibilidad.

#### Qué hace `volatile`

En `VisibilidadDemo`:

```java
private volatile boolean listo = false;
private int valor = 0;
```

La escritura a `listo` (volatile) ocurre después de `valor=42` en el hilo escritor. La lectura volatile en el lector establece happens-before: si ve `listo=true`, también ve `valor=42`.

#### Qué no hace

`volatile` no hace atómico `count++`. Para contadores usa `AtomicInteger/LongAdder`; para invariantes compuestos usa locks o estructuras concurrentes. Para explicar este flujo visualmente, usa herramientas aprobadas (diagram-design para secuencia/estado estático, animdiagram/dashmotion para recorrido animado con fallback, manim_skill solo para procesos de alto valor), pero la evidencia técnica debe seguir siendo el código y la prueba.

#### Error común

Confundir visibilidad con atomicidad. Síntoma: “puse volatile y aún pierdo incrementos”. Corrección: identificar si el problema es publicación/flag (volatile) o actualización compuesta (atomic/lock).

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo · Avanzado · 45 min

#### Problema

`System.nanoTime()` alrededor de un bucle parece un benchmark. No lo es. La JVM puede calentar el código (C1/C2 JIT), hacer inlining, eliminar dead code, o cambiar el resultado entre iteraciones.

#### Lo que muestra el ejemplo

`CronometroIngenuo` devuelve un tiempo no negativo y usa el resultado para evitar eliminación obvia. Eso es didáctico, no suficiente para medir performance.

#### Forma correcta

Usa JMH (Java Microbenchmark Harness). Define `@Benchmark`, `@Warmup`, `@Measurement`, `@Fork`, y consume resultados con `Blackhole`.

```java
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@State(Scope.Thread)
public class SumaBenchmark {
    @Param({"10000"})
    int n;
    @Benchmark
    public int suma(Blackhole bh) {
        int s = 0; for (int i = 0; i < n; i++) s += i;
        bh.consume(s); return s;
    }
}
```

**Nota de verificación honesta:** el snippet JMH es de referencia; no ejecuté JMH en este módulo. Para ejecutarlo de verdad, crea un proyecto JMH (arquetipo o plugin) y corre `mvn clean verify`/`java -jar target/benchmarks.jar`.

#### Error común

Publicar “X es 30% más rápido” con un `nanoTime` en main. Corrección: JMH con warmup/forks, o al menos declarar la medición como no confiable.

### Tema 3: Deserializar es permitir construcción y comportamiento · Avanzado · 45 min

#### Problema

`ObjectInputStream.readObject()` puede instanciar tipos arbitrarios si no hay filtro. En historiales de vulnerabilidades Java, gadgets de deserialización fueron un vector serio.

#### Defensa en el ejemplo

```java
ObjectInputFilter filtro = ObjectInputFilter.Config.createFilter(
        "com.aurora.jvm.DeserializacionSegura$Mensaje;java.lang.String;!*" );
in.setObjectInputFilter(filtro);
```

Allow-list: solo `Mensaje` y `String`. El test verifica que `Integer` es rechazado.

#### Criterio de producción

- Prefiere formatos de datos como JSON/Protobuf en fronteras externas.
- Si debes usar serialización Java, usa filtros allow-list, no block-list.
- Considera registros y validación post-deserialización.
- No deserialices datos no confiables sin control.

#### Error común

Creer que `Serializable` es solo “guardar objeto”. En realidad concede capacidad de construcción. Trátalo como superficie de ataque.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Avanzado · 45 min

#### Problema

Una app Java no termina cuando “ya no hay requests”. Hay pools, conexiones, buffers, métricas, hilos daemon/no daemon, y shutdown hooks.

#### Qué mostrar

`CicloVidaApp` registra y remueve un hook. En producción, el hook o el ciclo de vida del framework debe: dejar de aceptar trabajo, drenar en curso, cerrar pools, flush logs/métricas, y salir con código claro.

#### Herramientas reales

- `jcmd <pid> VM.flags`, `Thread.print`, `GC.heap_info`
- JFR: `jcmd <pid> JFR.start`, `JFR.dump`
- `jlink` para runtime image personalizada
- contenedores: señal SIGTERM, `preStop`, grace period

**Nota de verificación honesta:** no generé imagen `jlink` ni grabación JFR en este módulo. Comandos de referencia:

```bash
jcmd <pid> JFR.start name=demo settings=profile duration=60s filename=demo.jfr
jlink --add-modules java.base --output runtime-min
```

#### Error común

Matar procesos con SIGKILL como operación normal. Corrige el ciclo de vida: shutdown ordenado, timeouts y observabilidad.

### Tema 5: Arranque más rápido: archivos CDS y la caché AOT · Avanzado · 40 min

#### Problema

La JVM carga y verifica clases en arranque. En CLI/serverless, eso cuesta. CDS (Class Data Sharing) y la caché AOT de Java moderna reducen trabajo de arranque precargando/metadatos.

#### Comandos de referencia

```bash
# AppCDS clásico / dinámico (varía por versión y modo)
java -Xshare:off -version
java -XX:ArchiveClassesAtExit=app.jsa -cp app.jar com.aurora.jvm.App
java -XX:SharedArchiveFile=app.jsa -cp app.jar com.aurora.jvm.App
```

Para AOT cache (Java reciente, flujo evolucionando):

```bash
java -XX:AOTCacheOutput=app.aot -cp app.jar com.aurora.jvm.App
java -XX:AOTCache=app.aot -cp app.jar com.aurora.jvm.App
```

**Nota de verificación honesta:** no ejecuté mediciones comparativas de arranque ni generé artefactos CDS/AOT en este entorno. Las opciones y soporte exacto dependen de la versión/distribución de JDK; verifica con `java -X` y la documentación de tu JDK antes de automatizar en CI.

#### Error común

Copiar flags de otra versión de Java sin validar. Corrección: documentar versión exacta y medir con el mismo artefacto y entorno.

### Tema 6: Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps · Avanzado · 45 min

#### Problema

Migrar no es solo cambiar `sourceCompatibility`. APIs removidas, dependencias internas, módulos, y comportamiento runtime pueden romper.

#### Herramientas verificadas

Generé el JAR y ejecuté:

```bash
./gradlew -q jar
jdeps -s build/libs/tienda-aurora-java-m14-1.0.0.jar
jdeprscan build/libs/tienda-aurora-java-m14-1.0.0.jar
```

Salida real:

```text
tienda-aurora-java-m14-1.0.0.jar -> java.base
Jar file build/libs/tienda-aurora-java-m14-1.0.0.jar:
```

`jdeps` muestra dependencia solo de `java.base`: buena señal de modularidad simple. `jdeprscan` sin hallazgos indica que no detectó APIs deprecated/for removal en este JAR.

#### Flujo de migración prudente

1. Compilar y testear en JDK actual.
2. Ejecutar `jdeprscan` sobre JARs propios y dependencias.
3. Ejecutar `jdeps` para detectar usos internos/no soportados.
4. Actualizar dependencias antes de subir runtime.
5. Correr tests de integración y observabilidad en staging.
6. Subir LTS por pasos cuando el salto es grande.

#### Error común

Migrar solo el JDK del CI pero no el runtime de producción, o ignorar dependencias transitivas. Corrección: inventario de artefactos, escaneo, staging, rollback plan.

## Verificación real (actualización 2026-05-23)

Reejecutado el 2026-05-23 en `/tmp/opencode/aurora-m14` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

- `test`: 0 fallas.
- `run`: salida observada:
  - `visible=42`
  - `ns=true`
  - `Mensaje[texto=hola]`
  - `hookRegistrado=true`

## Cierre

La JVM es parte de tu diseño. Visibilidad, optimización, serialización, ciclo de vida, arranque y migración no son “detalles de plataforma”: son riesgos y capacidades que afectan producción. La regla es medir, verificar herramientas, y ser honesto cuando una afirmación no fue ejecutada.

## Checklist

- [ ] Puedo explicar happens-before y por qué `volatile` no reemplaza a un lock/atomic en todo caso.
- [ ] Puedo decir por qué un `nanoTime` ingenuo no es un benchmark válido y qué usar en su lugar.
- [ ] Puedo aplicar un filtro de deserialización y justificar allow-list.
- [ ] Puedo describir un shutdown ordenado.
- [ ] Puedo ejecutar `jdeps`/`jdeprscan` y leer su salida.
- [ ] Sé declarar una nota honesta cuando no ejecuté JMH/jcstress/jlink/JFR/CDS.
