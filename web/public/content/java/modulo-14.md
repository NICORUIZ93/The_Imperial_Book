# Módulo 14: JVM, rendimiento y seguridad

El runtime de Java no es un detalle invisible: decide cómo se ve la memoria entre hilos, cuándo se optimiza un método, qué objetos pueden crearse al deserializar y cómo se construye y apaga un artefacto. Este módulo trabaja esos bordes con ejemplos pequeños y verificables, y cierra con migración entre versiones LTS usando `jdeprscan` y `jdeps`.

## Visual del módulo

**Visual:** [Mapa de runtime JVM: visibilidad, JIT, deserialización y ciclo de vida](/visuals/temas/java/modulo-14-jvm-runtime.html)

Lectura: Visibilidad, JIT, deserialización y ciclo de vida son comportamientos de runtime que se diseñan y verifican.

## Proyecto desde cero: `tienda-aurora-java-m14`

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### Bootstrap

Ejecuta estos comandos desde el directorio donde quieras crear el proyecto. Las rutas son completas y relativas a ese directorio.

```bash
mkdir -p tienda-aurora-java-m14/src/main/java/com/aurora/jvm
mkdir -p tienda-aurora-java-m14/src/test/java/com/aurora/jvm
cd tienda-aurora-java-m14
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, JUnit 5.13.4. Las herramientas `jlink`, `jdeps` y `jdeprscan` se invocan desde `$(/usr/libexec/java_home)/bin` porque no todas están en el `PATH` del shell.

#### Estructura final

```text
tienda-aurora-java-m14/
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew
└── src/
    ├── main/java/
    │   ├── module-info.java
    │   └── com/aurora/jvm/
    │       ├── ApiObsoletaDemo.java
    │       ├── App.java
    │       ├── CicloVidaApp.java
    │       ├── CronometroIngenuo.java
    │       ├── DeserializacionSegura.java
    │       └── VisibilidadDemo.java
    └── test/java/com/aurora/jvm/JvmModuloTest.java
```

El build genera, además, `build/libs/tienda-aurora-java-m14-1.0.0.jar`, el archive CDS `build/aurora.jsa`, la grabación JFR `build/recording.jfr` y la imagen `build/runtime-aurora/`.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m14"
```

#### `build.gradle.kts`

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

#### `src/main/java/module-info.java`

```java
/** Módulo JPMS de la app Aurora: superficie explícita para jlink. */
module com.aurora.jvm {
    requires java.base;
    exports com.aurora.jvm;
}
```

`module-info.java` convierte el JAR en un módulo JPMS explícito: `exports com.aurora.jvm` define la superficie pública y `requires java.base` declara la única dependencia de runtime. Eso es lo que permite pasar el JAR a `jlink` con `--module-path`. Como el paquete está exportado y el compilador usa `-Xlint:all -Werror`, las clases con constructor implícito produjeron `[missing-explicit-ctor]` y hubo que declarar constructores explícitos. `VisibilidadDemo` tiene constructor `public` porque `App` la instancia; las utilidades estáticas tienen constructor `private`.

#### `src/main/java/com/aurora/jvm/VisibilidadDemo.java`

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

    public VisibilidadDemo() {}
}
```

#### `src/main/java/com/aurora/jvm/CronometroIngenuo.java`

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

    private CronometroIngenuo() {}
}
```

#### `src/main/java/com/aurora/jvm/DeserializacionSegura.java`

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

    private DeserializacionSegura() {}
}
```

#### `src/main/java/com/aurora/jvm/CicloVidaApp.java`

```java
package com.aurora.jvm;

import java.util.concurrent.atomic.AtomicBoolean;

public final class CicloVidaApp {

    /** Variante de prueba: registra y retira el hook para no contaminar el test worker. */
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

    /** Variante de ejecución: mantiene el hook registrado hasta el apagado real de la JVM. */
    public static String registrarApagado() {
        Thread hook = new Thread(
                () -> System.out.println("shutdown-demo: limpieza ejecutada"),
                "shutdown-demo");
        Runtime.getRuntime().addShutdownHook(hook);
        return "hookRegistrado=" + true;
    }

    private CicloVidaApp() {}
}
```

#### `src/main/java/com/aurora/jvm/ApiObsoletaDemo.java`

```java
package com.aurora.jvm;

/** Demo controlada de APIs deprecadas para analizar con jdeprscan. */
@SuppressWarnings({"deprecation", "removal"})
public final class ApiObsoletaDemo {

    public static String explorar() {
        Integer numero = new Integer("7");
        SecurityManager manager = System.getSecurityManager();
        return "numero=" + numero + " securityManager=" + manager;
    }

    private ApiObsoletaDemo() {}
}
```

#### `src/main/java/com/aurora/jvm/App.java`

```java
package com.aurora.jvm;

public final class App {

    public static void main(String[] args) throws Exception {
        System.out.println(new VisibilidadDemo().ejecutar());
        System.out.println("ns=" + (CronometroIngenuo.medirUnaVez() >= 0));
        byte[] bytes = DeserializacionSegura.serializar(new DeserializacionSegura.Mensaje("hola"));
        Object obj = DeserializacionSegura.deserializarSeguro(bytes);
        System.out.println(obj);
        System.out.println(CicloVidaApp.registrarApagado());
        System.out.println(ApiObsoletaDemo.explorar());
    }

    private App() {}
}
```

#### `src/test/java/com/aurora/jvm/JvmModuloTest.java`

```java
package com.aurora.jvm;

import org.junit.jupiter.api.Test;

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

    @Test
    void demoDeApisDeprecadasEjecuta() {
        assertEquals("numero=7 securityManager=null", ApiObsoletaDemo.explorar());
    }
}
```

### Tema 1: Compartir memoria requiere orden y visibilidad · Avanzado · 45 min

**Mecanismo.** `VisibilidadDemo` escribe `valor = 42` y después `listo = true`, donde `listo` es `volatile`. Esa escritura volatile establece una relación *happens-before* con la lectura del hilo lector: al observar `listo == true`, el lector ve `valor == 42`. `CountDownLatch` da la espera acotada y `Thread.onSpinWait()` evita un bucle ocupado agresivo.

**Por qué existe.** Dos hilos comparten heap, pero el JIT y la CPU pueden reordenar instrucciones y cachear valores. Sin una garantía de orden, un booleano plano “eventualmente se verá” puede fallar bajo carga aunque pase en pruebas.

**Implicaciones.** `volatile` aporta visibilidad y orden, no atomicidad compuesta: `contador++` sigue siendo una secuencia no atómica. Para actualizaciones atómicas se usan `AtomicInteger`/`VarHandle`; para coordinación rica, locks, colas o barreras.

**Confusión común.** Usar `volatile` como sustituto de `synchronized`. Aquí basta porque solo hay una señal y una publicación; en cuanto aparezca una operación de varios pasos, hace falta una primitiva más fuerte.

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenua · Avanzado · 45 min

**Mecanismo.** `CronometroIngenuo.medirUnaVez()` rodea una sola llamada a `suma(10_000)` con `System.nanoTime()`. La comparación con `Integer.MIN_VALUE` evita que el compilador elimine el resultado por dead-code obvio.

**Por qué existe.** El JIT compila código caliente con inlining y optimizaciones; el GC, el scheduler y la carga de clases añaden ruido. Una sola medición sin warmup mide el arranque, no el algoritmo.

**Implicaciones.** El número obtenido (`ns=true` solo indica que es no negativo) no sirve para comparar implementaciones ni para decidir arquitectura. Para medir de verdad se usa JMH: warmup, forks, modos de medición y blackholes. Para diagnosticar se usa JFR (en este proyecto se genera `build/recording.jfr`) y logs de GC.

**Confusión común.** Repetir `nanoTime()` en un bucle casero y creer que eso arregla el problema. Repetir sin controlar warmup, forks ni dead-code solo produce un número más estable, no un benchmark válido.

**Nota honesta y no verificable en este entorno.** JMH y jcstress **no están instalados ni declarados** en el proyecto verificado: `./gradlew -q dependencies --configuration testRuntimeClasspath | grep -iE "jmh|jcstress"` no devuelve coincidencias y `command -v jmh` / `command -v jcstress` fallan. No se muestra una salida de benchmark JMH ni de estrés jcstress porque no se ejecutaron. Para hacerlos ejecutables habría que añadir `org.openjdk.jmh:jmh-core`, `org.openjdk.jmh:jmh-generator-annprocess` y la dependencia de jcstress al build, y ejecutarlos como tareas separadas; esa ampliación no forma parte de esta verificación.

### Tema 3: Deserializar es permitir construcción y comportamiento · Avanzado · 45 min

**Mecanismo.** `DeserializacionSegura.serializar()` usa `ObjectOutputStream`; `deserializarSeguro()` instala un `ObjectInputFilter` con allow-list (`Mensaje` y `String`, `!*` para el resto) antes de `readObject()`.

**Por qué existe.** La deserialización Java nativa reconstruye grafos y puede ejecutar código durante la lectura. Si la entrada no es confiable, el problema no es solo dato malo: es permitir tipos inesperados dentro del proceso.

**Implicaciones.** El test `deserializacionPermiteTipoAutorizado` obtiene `Mensaje[texto=ok]`; `deserializacionRechazaTipoNoAutorizado` comprueba que un `Integer` serializado es rechazado. La defensa preferida es no usar Java serialization con datos no confiables; el filtro es la segunda línea.

**Confusión común.** Creer que un filtro convierte serialization en un formato seguro por diseño. Sigue siendo un mecanismo que instancia tipos; JSON con mapeo explícito es una frontera más estrecha cuando es posible.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Intermedio · 40 min

**Mecanismo.** `CicloVidaApp.registrarApagado()` mantiene un shutdown hook registrado hasta que la JVM termina; al apagarse imprime `shutdown-demo: limpieza ejecutada`. `simular()` es la variante de prueba que registra y retira el hook para no contaminar el worker de JUnit. A partir del JAR modular se construye una imagen con `jlink` que contiene `com.aurora.jvm`, `java.base` y `jdk.jfr`.

**Por qué existe.** Una aplicación necesita arranque, dependencias, señales de apagado y limpieza. Además, distribuir el JDK completo para una app de consola es innecesario: `jlink` genera solo los módulos requeridos.

**Implicaciones.** La imagen verificada ocupa 33 Mbytes y se ejecuta con `id -u -un = nicolasruiz` (usuario no root, el mismo que invoca el comando: jlink no añade privilegios). Se ejecutó con `-Xmx64m`, `-XX:MaxMetaspaceSize=64m` y `-XX:StartFlightRecording:filename=build/recording.jfr,duration=2s`; se generó `build/recording.jfr` de 343 Kbytes y el hook se ejecutó al terminar. `jlink` no actualiza vulnerabilidades: quien publica la imagen debe reconstruirla con cada JDK parcheado.

**Confusión común.** Pensar que el shutdown hook cubre `kill -9`, un crash o un corte de energía. No los cubre. Debe ser breve e idempotente y combinarse con timeouts, persistencia segura y observabilidad.

### Tema 5: Arranque reproducible con CDS y el límite de AOT · Intermedio · 35 min

**Mecanismo.** Con el JAR en el classpath (no un directorio de clases), `-XX:ArchiveClassesAtExit=build/aurora.jsa` crea un archive dinámico al terminar la app; `-Xshare:on -XX:SharedArchiveFile=build/aurora.jsa` lo reutiliza en una segunda ejecución.

**Por qué existe.** El arranque incluye carga, verificación y linking de clases. CDS reutiliza metadatos precalculados y puede reducir ese costo en CLIs y procesos de vida corta.

**Implicaciones.** En esta corrida se generó `build/aurora.jsa` de 816 Kbytes y la segunda ejecución con `-Xshare:on` terminó con la misma salida funcional. El primer intento con `-cp build/classes/java/main` falló con este error real:

```text
[0.191s][error][cds] Error: non-empty directory 'build/classes/java/main'
Error occurred during CDS dumping
Cannot have non-empty directory in paths
```

La corrección fue usar el JAR como classpath. CDS depende de JDK, flags y classpath: hay que medir en el runtime objetivo, no asumir ganancia.

**Confusión común.** Confundir CDS con AOT. En el JDK 27 instalado `command -v jaotc` no encuentra la herramienta AOT clásica, así que no se muestra una compilación AOT. CDS sí quedó reproducible con los comandos de la sección de verificación.

### Tema 6: Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps · Avanzado · 45 min

**Mecanismo.** `jdeprscan --release 17|21|25` contrasta el JAR con el conjunto de APIs deprecadas de cada release; `jdeps -s` resume dependencias de módulo y `jdeps --jdk-internals` busca uso de APIs internas de JDK. `ApiObsoletaDemo` usa deliberadamente `new Integer("7")` y `System.getSecurityManager()` con `@SuppressWarnings` para que `-Werror` no oculte el hallazgo de `jdeprscan`.

**Por qué existe.** Antes de subir de LTS hay que saber si el código usa APIs marcadas para eliminación o detalles internos del JDK. Los avisos de compilación solo cubren lo que compila tu JDK actual; estas herramientas cruzan la superficie de cada release.

**Implicaciones.** Los tres escaneos encontraron las dos APIs deprecadas con `forRemoval=true` en 17 y 21; en 25 `Integer(String)` aparece como deprecada (sin el marcador `forRemoval` en ese release) y `getSecurityManager()` sigue `forRemoval=true`. `jdeps -s` dice `com.aurora.jvm -> java.base` y `--jdk-internals` no imprime nada. La migración real consiste en sustituir esas dos llamadas y volver a escanear.

**Confusión común.** Creer que `jdeprscan --release 17` implica compilar con un JDK 17. Solo selecciona el conjunto de APIs contra el que se escanea. En este entorno solo hay JDK 26 y 27 (`/usr/libexec/java_home -V`), por lo que **no se compiló ni ejecutó con JDK 17, 21 o 25**; no se muestra salida de esas versiones. Para una certificación completa hace falta una matriz de CI con esos JDK.

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m14` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25). `JH=$(/usr/libexec/java_home)` apunta al JDK 27. Salida observada:

```text
$ ./gradlew -q test
(salida vacía: Gradle -q solo muestra errores)
$ grep -h "<testsuite " build/test-results/test/*.xml
<testsuite name="com.aurora.jvm.JvmModuloTest" tests="5" skipped="0" failures="0" errors="0" timestamp="2026-11-23T08:20:32.047Z" hostname="MacBook-Pro-de-Nicolas.local" time="0.019">
$ ./gradlew -q run
visible=42
ns=true
Mensaje[texto=hola]
hookRegistrado=true
numero=7 securityManager=null
shutdown-demo: limpieza ejecutada
$ ./gradlew -q jar
$ JH=$(/usr/libexec/java_home)
$ "$JH/bin/jdeps" -s build/libs/tienda-aurora-java-m14-1.0.0.jar
com.aurora.jvm -> java.base
$ "$JH/bin/jdeps" --jdk-internals build/libs/tienda-aurora-java-m14-1.0.0.jar
$ "$JH/bin/jdeprscan" --release 17 build/libs/tienda-aurora-java-m14-1.0.0.jar
Jar file build/libs/tienda-aurora-java-m14-1.0.0.jar:
class com/aurora/jvm/ApiObsoletaDemo uses deprecated method java/lang/Integer::<init>(Ljava/lang/String;)V (forRemoval=true)
class com/aurora/jvm/ApiObsoletaDemo uses deprecated method java/lang/System::getSecurityManager()Ljava/lang/SecurityManager; (forRemoval=true)
$ "$JH/bin/jdeprscan" --release 21 build/libs/tienda-aurora-java-m14-1.0.0.jar
Jar file build/libs/tienda-aurora-java-m14-1.0.0.jar:
class com/aurora/jvm/ApiObsoletaDemo uses deprecated method java/lang/Integer::<init>(Ljava/lang/String;)V (forRemoval=true)
class com/aurora/jvm/ApiObsoletaDemo uses deprecated method java/lang/System::getSecurityManager()Ljava/lang/SecurityManager; (forRemoval=true)
$ "$JH/bin/jdeprscan" --release 25 build/libs/tienda-aurora-java-m14-1.0.0.jar
Jar file build/libs/tienda-aurora-java-m14-1.0.0.jar:
class com/aurora/jvm/ApiObsoletaDemo uses deprecated method java/lang/Integer::<init>(Ljava/lang/String;)V 
class com/aurora/jvm/ApiObsoletaDemo uses deprecated method java/lang/System::getSecurityManager()Ljava/lang/SecurityManager; (forRemoval=true)
$ "$JH/bin/jlink" --module-path build/libs/tienda-aurora-java-m14-1.0.0.jar --add-modules com.aurora.jvm,jdk.jfr --output build/runtime-aurora --strip-debug --no-header-files --no-man-pages --compress=zip-6
$ du -sh build/runtime-aurora
 33M	build/runtime-aurora
$ build/runtime-aurora/bin/java --list-modules
com.aurora.jvm
java.base@27.0.1.0.2
jdk.jfr@27.0.1.0.2
$ build/runtime-aurora/bin/java -Xmx64m -XX:MaxMetaspaceSize=64m -XX:StartFlightRecording:filename=build/recording.jfr,duration=2s --module com.aurora.jvm/com.aurora.jvm.App
[0.194s][info][jfr,startup] Started recording 1. The result will be written to:
[0.194s][info][jfr,startup] 
[0.194s][info][jfr,startup] /Users/tu-usuario/labs/aurora-m14/build/recording.jfr
visible=42
ns=true
Mensaje[texto=hola]
hookRegistrado=true
numero=7 securityManager=null
shutdown-demo: limpieza ejecutada
$ ls -lh build/recording.jfr
-rw-r--r--@ 1 nicolasruiz  wheel   343K Nov 23 03:22 build/recording.jfr
$ id -u -un
nicolasruiz
$ "$JH/bin/java" -cp build/libs/tienda-aurora-java-m14-1.0.0.jar -XX:ArchiveClassesAtExit=build/aurora.jsa com.aurora.jvm.App
visible=42
ns=true
Mensaje[texto=hola]
hookRegistrado=true
numero=7 securityManager=null
shutdown-demo: limpieza ejecutada
$ ls -lh build/aurora.jsa
-rw-r--r--@ 1 nicolasruiz  wheel   816K Nov 23 03:22 build/aurora.jsa
$ "$JH/bin/java" -cp build/libs/tienda-aurora-java-m14-1.0.0.jar -Xshare:on -XX:SharedArchiveFile=build/aurora.jsa com.aurora.jvm.App
visible=42
ns=true
Mensaje[texto=hola]
hookRegistrado=true
numero=7 securityManager=null
shutdown-demo: limpieza ejecutada
```

Listado de pruebas (`./gradlew test --rerun-tasks`, filtrado):

```text
JvmModuloTest > cronometroIngenuoRetornaNoNegativo() PASSED
JvmModuloTest > demoDeApisDeprecadasEjecuta() PASSED
JvmModuloTest > visibilidadConVolatile() PASSED
JvmModuloTest > deserializacionPermiteTipoAutorizado() PASSED
JvmModuloTest > deserializacionRechazaTipoNoAutorizado() PASSED
BUILD SUCCESSFUL in 981ms
```

#### No verificable en esta corrida

```text
$ ./gradlew -q dependencies --configuration testRuntimeClasspath | grep -iE "jmh|jcstress"
(sin coincidencias)
$ for t in jmh jcstress; do command -v "$t" || echo "$t: no instalado"; done
jmh: no instalado
jcstress: no instalado
$ cd ~/labs/aurora-m13 && git remote -v
fatal: not a git repository (or any of the parent directories): .git
$ command -v jaotc || echo "jaotc: no disponible en el JDK 27 instalado"
jaotc: no disponible en el JDK 27 instalado
```

Esto explica tres límites: no hay benchmark JMH ni estrés jcstress ejecutados; no hay repositorio remoto que clonar en el módulo 13; y no hay compilación con JDK 17/21/25 ni tool AOT `jaotc`. No se ha inventado salida para ninguno de ellos.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Hilo no ve un cambio | Falta *happens-before* | Revisar sincronización | `volatile`, lock, atómico o estructura concurrente |
| `volatile` no arregla `contador++` | Falta atomicidad compuesta | Revisar la operación completa | `AtomicInteger`, `VarHandle` o lock |
| Benchmark “demuestra” una mejora irreal | Warmup, JIT o GC no controlados | Repetir con JMH | Declarar dependencias JMH y usar sus modos; JFR para diagnosticar |
| `jlink` falla con un JAR no modular | Falta `module-info.java` | `jar --describe-module --file build/libs/tienda-aurora-java-m14-1.0.0.jar` | Declarar módulo y pasar el JAR con `--module-path` |
| `jlink` avisa de `--compress 2` | Valor deprecado en JDK 27 | Leer `jlink --help` | Usar `--compress=zip-6` |
| Imagen “segura” sin actualizaciones | Runtime congelado | Revisar procedimiento de release | Reconstruir la imagen con cada JDK parcheado |
| Hook de apagado no corre | `kill -9`, crash o hook retirado | Revisar señal y registro | Hook corto, idempotente; probar apagado normal |
| CDSdump falla por directorio de clases | Classpath con directorio no vacío | Leer `[error][cds]` | Usar el JAR como classpath |
| Esperar AOT con `jaotc` | Herramienta no disponible en JDK 27 | `command -v jaotc` | Documentar CDS como mecanismo reproducible |
| API deprecada pasa desapercibida | `@SuppressWarnings` o JDK distinto | `jdeprscan --release 17/21/25` | Sustituir la API y volver a escanear |
| Uso de API interna del JDK | Dependencia a `jdk.internal.*` | `jdeps --jdk-internals` | Sustituir por API pública soportada |

## Checklist de cierre

- [ ] Puedo explicar por qué compartir memoria requiere *happens-before*.
- [ ] Sé por qué un cronómetro ingenua no es un benchmark y qué aportaría JMH.
- [ ] Sé aplicar `ObjectInputFilter` y cuándo evitar Java serialization.
- [ ] Generé una imagen `jlink` modular, la ejecuté con JFR y límites y vi el hook de apagado.
- [ ] Generé y reutilicé un archive CDS con comandos reproducibles.
- [ ] Ejecuté `jdeps` y `jdeprscan --release 17/21/25` y sé qué límites tienen.
- [ ] Ejecuté `./gradlew -q test` y `./gradlew -q run` con salida real.
