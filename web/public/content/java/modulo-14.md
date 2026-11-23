# Módulo 14: JVM, rendimiento y seguridad

El runtime de Java no es un detalle invisible: decide cómo se ve la memoria entre hilos, cuándo se optimiza un método, qué objetos pueden crearse al deserializar y cómo se apaga una aplicación. Muchos bugs “imposibles” aparecen porque el código se probó como si la JVM fuera un intérprete simple y determinista. Este módulo trabaja esos bordes con ejemplos pequeños y verificables.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-14-jvm-runtime.html"
    alt="Mapa de runtime JVM: visibilidad, JIT, deserialización y ciclo de vida"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Visibilidad, JIT, deserialización y ciclo de vida son comportamientos de runtime que se diseñan y verifican.</figcaption>
</figure>

## Proyecto desde cero: `tienda-aurora-java-m14`

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### Bootstrap

```bash
mkdir -p tienda-aurora-java-m14/src/main/java/com/aurora/jvm
mkdir -p tienda-aurora-java-m14/src/test/java/com/aurora/jvm
cd tienda-aurora-java-m14
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

#### Estructura final

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

#### `VisibilidadDemo.java`

Demuestra visibilidad entre hilos. `listo` es `volatile`: la escritura en el hilo principal establece una relación happens-before con la lectura en el hilo lector. Sin esa garantía, el lector podría no ver el cambio o ver `valor` desactualizado. El patrón es didáctico; en producción se usan primitivas de concurrencia de más alto nivel cuando son adecuadas.

```java
package com.aurora.jvm;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

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
        listo = true;
        boolean ok = visto.await(2, TimeUnit.SECONDS);
        lector.join(1000);
        return ok && valor == 42 ? "visible=42" : "timeout";
    }
}
```

#### `CronometroIngenuo.java`

Microbenchmark ingenuo: mide una sola ejecución con `nanoTime`. Sirve para mostrar por qué no es confiable. El JIT puede no haber optimizado, el GC puede interferir, el scheduler puede pausar el hilo, y el costo medido puede incluir warmup o ruido. La corrección no es “hacer más `nanoTime` casero”, sino usar JMH para warmup/forks/medición o JFR para observar el runtime.

```java
package com.aurora.jvm;

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
        if (r == Integer.MIN_VALUE) System.out.println("nunca");
        return t1 - t0;
    }
}
```

#### `DeserializacionSegura.java`

Deserializar datos Java nativos es una frontera de seguridad: puede instanciar tipos y disparar comportamiento durante la reconstrucción. La defensa base es no deserializar datos no confiables; cuando no hay alternativa, usar `ObjectInputFilter` para permitir tipos concretos y rechazar el resto.

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

#### `CicloVidaApp.java`

Una aplicación real tiene ciclo de vida: arranca, acepta trabajo, se apaga. El shutdown hook permite registrar limpieza al recibir señal de terminación, pero no es garantía mágica: el proceso puede morir por `kill -9`, crash o corte de energía. Aun así, es útil para cerrar pools, hacer flush de métricas o liberar recursos en apagados normales.

```java
package com.aurora.jvm;

import java.util.concurrent.atomic.AtomicBoolean;

public final class CicloVidaApp {
    public static String simular() {
        AtomicBoolean cerrado = new AtomicBoolean(false);
        Thread hook = new Thread(() -> cerrado.set(true), "shutdown-demo");
        Runtime.getRuntime().addShutdownHook(hook);
        try {
            return "hookRegistrado=" + true;
        } finally {
            Runtime.getRuntime().removeShutdownHook(hook);
        }
    }
}
```

#### `App.java`

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

#### `JvmModuloTest.java`

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

### Tema 1: Compartir memoria requiere orden y visibilidad · Avanzado · 45 min

Dos hilos pueden compartir heap, pero eso no significa que vean los mismos valores en el mismo orden sin coordinación. La JVM y el CPU pueden reordenar instrucciones y cachear valores. El Java Memory Model define garantías de visibilidad y orden a través de relaciones *happens-before*. `volatile`, `synchronized`, locks, atomics y utilidades concurrentes establecen esas garantías.

En `VisibilidadDemo`, `listo` es `volatile`. Escribirlo después de `valor = 42` hace visible esa escritura para el hilo que observa `listo == true`. El error común es usar un booleano plano entre hilos y asumir que “eventualmente se verá”. Puede funcionar en pruebas y fallar bajo carga. La corrección es usar la primitiva de concurrencia adecuada al contrato: `volatile` para flags simples, atomics para actualizaciones atómicas, locks/colas/barreras para coordinación más rica.

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo · Avanzado · 45 min

El JIT observa código caliente y lo compila a nativo con optimizaciones: inlining, eliminación de dead code, loop optimizations, entre otras. Esto mejora rendimiento real, pero rompe cronómetros ingenuos. Si mides una sola iteración sin warmup, puedes medir carga de clases, interpretación o ruido del sistema. Si el resultado no se usa, el JIT puede incluso eliminar trabajo.

`CronometroIngenuo` ilustra el anti-patrón: `nanoTime` alrededor de una llamada. Su salida no debe interpretarse como rendimiento estable. Para medir, usa JMH, que maneja warmup, forks, blackholes y modos de medición. Para diagnosticar, usa JFR y GC logs. El error común es comparar dos implementaciones con un microbenchmark casero y tomar decisiones de arquitectura basadas en ese número.

### Tema 3: Deserializar es permitir construcción y comportamiento · Avanzado · 45 min

La deserialización Java nativa reconstruye grafos de objetos. Eso implica crear instancias y, en ciertos casos, ejecutar caminos de código durante la lectura. Si la entrada viene de una fuente no confiable, es una superficie de ataque. El problema no es solo “leer datos malos”; es permitir que tipos inesperados entren al proceso.

La defensa en capas es: evitar deserialización nativa de datos no confiables, preferir formatos de datos como JSON con mapeo explícito, y si hay que usar Java serialization, aplicar `ObjectInputFilter` con allow-list. En `DeserializacionSegura`, el filtro permite `Mensaje` y `String` y rechaza todo lo demás. El test confirma que `Integer` serializado es rechazado.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Intermedio · 40 min

Una aplicación no solo “corre”; tiene arranque, estado, dependencias, señales de apagado y limpieza. Ignorar el ciclo de vida genera fugas de recursos, pérdida de métricas o cortes abruptos. Un shutdown hook puede cerrar pools, hacer flush de buffers y liberar recursos cuando la JVM recibe una señal normal.

Pero el hook no cubre todos los casos: `kill -9`, crash de JVM, fallo de hardware o apagado forzado no ejecutan hooks. Por eso el diseño robusto combina hooks con timeouts, idempotencia, persistencia segura y observabilidad. El error común es poner lógica crítica o larga en el hook; debe ser breve y tolerante a fallos.

### Tema 5: Arranque más rápido: archivos CDS y la caché AOT · Intermedio · 35 min

El arranque de la JVM incluye carga de clases, verificación, linking y warmup. Class Data Sharing (CDS) y la caché AOT (dependiendo de la versión/JDK) permiten reutilizar metadatos precalculados para reducir tiempo de arranque. Es útil en CLIs, funciones serverless, contenedores y procesos de vida corta.

La ganancia no es universal: depende de classpath, flags, versión de JDK y configuración. Hay que medir el arranque real. En este entorno, al intentar generar un archivo CDS con `-XX:ArchiveClassesAtExit` sin base CDS cargada, la JVM emitió warning y no generó el archive; por eso el arranque con `-XX:SharedArchiveFile` falló. **Nota de verificación honesta:** no se obtuvo una medición CDS/AOT reproducible en esta corrida específica; el comportamiento depende de la configuración de CDS base del JDK. El concepto válido es: CDS/AOT puede mejorar arranque, pero debe validarse con los flags y artefactos soportados por el runtime objetivo.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m14` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados:

- `test`: 4 pruebas, 0 fallas.
- `run`: `visible=42`, `ns=true`, `Mensaje[texto=hola]`, `hookRegistrado=true`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Hilo no ve cambio | Falta happens-before | Revisar sincronización | `volatile`, lock, atomic, estructura concurrente |
| Benchmark “demuestra” mejora irreal | Warmup/JIT/GC no controlados | Repetir con JMH | Usar JMH/JFR, no cronómetro casero |
| Vulnerabilidad por deserialización | `ObjectInputStream` sobre datos no confiables | Revisar fuentes y filtros | Evitar Java serialization; allow-list con `ObjectInputFilter` |
| Recursos no se liberan al apagar | No hay hook/close ordenado | Simular SIGTERM, revisar logs | Shutdown hook corto, try-with-resources, timeouts |
| CDS/AOT no mejora arranque | Flags/JDK/base archive incompatibles | `-Xlog:cds`, medir arranque real | Validar soporte del JDK objetivo y medir antes/después |

## Checklist de cierre

- [ ] Puedo explicar por qué compartir memoria requiere happens-before.
- [ ] Sé por qué un cronómetro ingenuo no es un benchmark confiable.
- [ ] Sé aplicar `ObjectInputFilter` y cuándo evitar Java serialization.
- [ ] Entiendo límites de shutdown hooks.
- [ ] Sé que CDS/AOT requiere verificación por JDK/flags, no supuestos.
