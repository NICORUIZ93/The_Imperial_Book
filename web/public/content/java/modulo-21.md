# Módulo 21: APIs públicas, compatibilidad y evolución

Cuando publicas una librería o un módulo interno que usan otros equipos, cada clase pública, método, firma y comportamiento observable se vuelve un contrato. Cambiarlo puede compilar en tu repo y aun así romper a quienes dependen de tu artefacto. Ese tipo de rotura es caro porque ocurre lejos de tu cambio: en el build de otro equipo, en runtime, o sutilmente en la semántica.

En este módulo vas a construir `tienda-aurora-java-m21`, un proyecto multi-módulo con `api-v1`, `api-v2`, `api-v2-rompe`, `cliente-v1` y `app`. La idea es ver la evolución de una API pequeña: qué se considera superficie pública, la diferencia entre compatibilidad binaria y de fuente, cómo usar `default` y `@Deprecated`, por qué el borrado de genéricos genera bridge methods, qué ocurre cuando un cliente congelado se ejecuta contra una versión rota, y cómo verificar compatibilidad con `javap` y `javax.tools`.

## Prerrequisitos y bootstrap

```bash
java -version
javac -version
javap -version
gradle --version
mkdir -p tienda-aurora-java-m21/api-v1/src/main/java/com/aurora/api
mkdir -p tienda-aurora-java-m21/api-v2/src/main/java/com/aurora/api
mkdir -p tienda-aurora-java-m21/api-v2-rompe/src/main/java/com/aurora/api
mkdir -p tienda-aurora-java-m21/cliente-v1/src/main/java/com/aurora/cliente
mkdir -p tienda-aurora-java-m21/app/src/main/java/com/aurora/app
mkdir -p tienda-aurora-java-m21/app/src/test/java/com/aurora/app
cd tienda-aurora-java-m21
gradle wrapper --gradle-version 9.9.1
```

Estructura objetivo:

```text
tienda-aurora-java-m21/
├── build.gradle.kts
├── settings.gradle.kts
├── api-v1/src/main/java/com/aurora/api/          # contrato inicial
├── api-v2/src/main/java/com/aurora/api/          # evolución compatible
├── api-v2-rompe/src/main/java/com/aurora/api/    # versión incompatible deliberada
├── cliente-v1/src/main/java/com/aurora/cliente/  # cliente congelado contra v1
└── app/src/main/java/com/aurora/app/             # consumidor + verificador
```

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m21"
include("api-v1", "api-v2", "api-v2-rompe", "cliente-v1", "app")
```

#### `build.gradle.kts`

```kotlin
plugins { java }
allprojects { group = "com.aurora"; version = "1.0.0"; repositories { mavenCentral() } }
subprojects {
    apply(plugin = "java")
    java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf("-Xlint:all","-Xlint:-processing","-Werror"))
    }
}
project(":cliente-v1") {
    dependencies { implementation(project(":api-v1")) }
}
project(":app") {
    dependencies {
        implementation(project(":api-v2"))
        testImplementation(platform("org.junit:junit-bom:5.13.4"))
        testImplementation("org.junit.jupiter:junit-jupiter")
        testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    }
    tasks.named<Test>("test") {
        dependsOn(":api-v2:jar", ":api-v2-rompe:jar")
        useJUnitPlatform()
        testLogging { events("passed","skipped","failed") }
        systemProperty("api.v2.jar", project(":api-v2").tasks.named<Jar>("jar").get().archiveFile.get().asFile.absolutePath)
        systemProperty("api.rota.jar", project(":api-v2-rompe").tasks.named<Jar>("jar").get().archiveFile.get().asFile.absolutePath)
    }
}
```

`cliente-v1` depende de `api-v1`: sus `.class` quedan compilados contra la firma antigua. `app` depende de `api-v2` y, en tests, recibe las rutas de ambos JAR para que `VerificadorApi` compile un cliente de prueba contra cada uno.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-21-compatibilidad.html`; regeneración: editar el HTML/SVG en esa ruta):** [Compatibilidad: fuente frente a binaria](/visuals/temas/java/modulo-21-compatibilidad.html)

Lectura: cambiar una firma puede conservar la compatibilidad de fuente y romper la binaria; por eso la superficie pública se verifica con artefactos, no de memoria.

## Código completo del proyecto

#### `api-v1/src/main/java/com/aurora/api/Repositorio.java`

```java
package com.aurora.api;

public interface Repositorio<T> {
    T porId(String id);
}
```

#### `api-v1/src/main/java/com/aurora/api/ServicioEnvio.java`

```java
package com.aurora.api;

public class ServicioEnvio {
    public static final String ETIQUETA = "v1";

    public String estado(String id) { return "PENDIENTE:" + id; }
}
```

#### `api-v1/src/main/java/com/aurora/api/InterfazEvolucion.java`

```java
package com.aurora.api;

public interface InterfazEvolucion {
    default String etiqueta() { return "base"; }
}
```

#### `api-v1/src/main/java/com/aurora/api/ImplEvolucion.java`

```java
package com.aurora.api;

public final class ImplEvolucion implements InterfazEvolucion {
}
```

#### `api-v2/src/main/java/com/aurora/api/Repositorio.java`

```java
package com.aurora.api;

public interface Repositorio<T> {
    T porId(String id);
    default String tipo() { return "generico"; } // método default: evolución compatible
}
```

#### `api-v2/src/main/java/com/aurora/api/RepositorioTexto.java`

```java
package com.aurora.api;

public class RepositorioTexto implements Repositorio<String> {
    @Override
    public String porId(String id) {
        return "TXT:" + id;
    }
}
```

#### `api-v2/src/main/java/com/aurora/api/ServicioEnvio.java`

```java
package com.aurora.api;

public class ServicioEnvio {
    public static final String ETIQUETA = "v2";

    /** @deprecated Use {@link #estado(String, boolean)}. Se mantiene para compatibilidad binaria/fuente. */
    @Deprecated(since = "2.0", forRemoval = false)
    public String estado(String id) { return estado(id, false); }

    public String estado(String id, boolean detallado) {
        return detallado ? "PENDIENTE:" + id + ":detalle" : "PENDIENTE:" + id;
    }
}
```

#### `api-v2/src/main/java/com/aurora/api/InterfazEvolucion.java`

```java
package com.aurora.api;

public interface InterfazEvolucion {
    default String etiqueta() { return "base"; }
}
```

#### `api-v2/src/main/java/com/aurora/api/ImplEvolucion.java`

```java
package com.aurora.api;

public final class ImplEvolucion implements InterfazEvolucion {
}
```

#### `api-v2-rompe/src/main/java/com/aurora/api/ServicioEnvio.java`

```java
package com.aurora.api;

/** Versión deliberadamente incompatible: eliminó estado(String) y cambió la constante. */
public class ServicioEnvio {
    public static final String ETIQUETA = "v2";

    public String estado(String id, boolean detallado) {
        return detallado ? "PENDIENTE:" + id + ":detalle" : "PENDIENTE:" + id;
    }
}
```

#### `api-v2-rompe/src/main/java/com/aurora/api/InterfazEvolucion.java`

```java
package com.aurora.api;

/** Versión deliberadamente incompatible: el default pasó a ser abstracto. */
public interface InterfazEvolucion {
    String etiqueta();
}
```

#### `cliente-v1/src/main/java/com/aurora/cliente/ClienteCongelado.java`

```java
package com.aurora.cliente;

import com.aurora.api.ServicioEnvio;

/** Compilado contra api-v1: la firma y la constante quedan grabadas en su bytecode. */
public final class ClienteCongelado {
    @SuppressWarnings("deprecation")
    public static void main(String[] args) {
        System.out.println("ESTADO=" + new ServicioEnvio().estado("A1"));
        System.out.println("ETIQUETA=" + ServicioEnvio.ETIQUETA);
    }
}
```

#### `cliente-v1/src/main/java/com/aurora/cliente/ClienteAbstracto.java`

```java
package com.aurora.cliente;

import com.aurora.api.ImplEvolucion;
import com.aurora.api.InterfazEvolucion;

/** Compilado contra api-v1: etiqueta() era default en la interfaz. */
public final class ClienteAbstracto {
    public static void main(String[] args) {
        InterfazEvolucion x = new ImplEvolucion();
        System.out.println("EVOLUCION=" + x.etiqueta());
    }
}
```

#### `app/src/main/java/com/aurora/app/App.java`

```java
package com.aurora.app;

import com.aurora.api.ImplEvolucion;
import com.aurora.api.InterfazEvolucion;
import com.aurora.api.Repositorio;
import com.aurora.api.RepositorioTexto;
import com.aurora.api.ServicioEnvio;

public final class App {
    @SuppressWarnings("deprecation")
    public static void main(String[] args) {
        ServicioEnvio s = new ServicioEnvio();
        System.out.println("LEGACY=" + s.estado("A1"));
        System.out.println("NUEVO=" + s.estado("A1", true));
        Repositorio<String> repo = new RepositorioTexto();
        System.out.println("REPO=" + repo.porId("A1"));
        System.out.println("TIPO=" + repo.tipo());
        InterfazEvolucion evolucion = new ImplEvolucion();
        System.out.println("EVOLUCION=" + evolucion.etiqueta());
    }
}
```

#### `app/src/main/java/com/aurora/app/VerificadorApi.java`

```java
package com.aurora.app;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;

/** Verificador de fuente con javax.tools: compila un cliente contra el JAR indicado. */
public final class VerificadorApi {
    public record Resultado(boolean ok, String detalle) {}

    private static final String FUENTE = """
            package com.aurora.verif;
            import com.aurora.api.Repositorio;
            import com.aurora.api.RepositorioTexto;
            import com.aurora.api.ServicioEnvio;
            public class Verificacion {
                @SuppressWarnings("deprecation")
                public static void main(String[] args) {
                    Repositorio<String> r = new RepositorioTexto();
                    String a = r.porId("A1");
                    String b = r.tipo();
                    ServicioEnvio s = new ServicioEnvio();
                    String c = s.estado("A1");
                    System.out.println(a + b + c);
                }
            }
            """;

    private VerificadorApi() {}

    public static Resultado verificar(Path jar) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) return new Resultado(false, "sin JavaCompiler (JRE)");
        DiagnosticCollector<JavaFileObject> diagnosticos = new DiagnosticCollector<>();
        JavaFileObject fuente = new SimpleJavaFileObject(
                URI.create("string:///Verificacion.java"), JavaFileObject.Kind.SOURCE) {
            @Override
            public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                return FUENTE;
            }
        };
        try {
            Path salida = Files.createTempDirectory("api-verif");
            try (StandardJavaFileManager manager = compiler.getStandardFileManager(diagnosticos, Locale.ROOT, null)) {
                List<String> opciones = List.of("-classpath", jar.toAbsolutePath().toString(),
                        "-d", salida.toString());
                boolean compilo = compiler.getTask(null, manager, diagnosticos, opciones,
                        null, List.of(fuente)).call();
                if (compilo) return new Resultado(true, "cliente de prueba compila");
                String detalle = diagnosticos.getDiagnostics().stream()
                        .filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
                        .map(d -> d.getMessage(Locale.ROOT))
                        .findFirst()
                        .orElse("error sin detalle");
                return new Resultado(false, detalle.lines().findFirst().orElse(detalle));
            }
        } catch (Exception e) {
            return new Resultado(false, e.toString());
        }
    }

    public static void main(String[] args) {
        if (args.length != 1) throw new IllegalArgumentException("uso: VerificadorApi <jar>");
        Resultado r = verificar(Path.of(args[0]));
        System.out.println("API=" + (r.ok() ? "OK" : "FALLA:" + r.detalle()));
    }
}
```

#### `app/src/test/java/com/aurora/app/ApiCompatTest.java`

```java
package com.aurora.app;

import com.aurora.api.Repositorio;
import com.aurora.api.RepositorioTexto;
import com.aurora.api.ServicioEnvio;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class ApiCompatTest {

    @Test
    @SuppressWarnings("deprecation")
    void metodoLegacySigueFuncionando() {
        ServicioEnvio s = new ServicioEnvio();
        assertEquals("PENDIENTE:A1", s.estado("A1"));
        assertEquals("PENDIENTE:A1:detalle", s.estado("A1", true));
    }

    @Test
    void defaultMethodNoRompeImplementaciones() {
        Repositorio<String> repo = new RepositorioTexto();
        assertEquals("TXT:A1", repo.porId("A1"));
        assertEquals("generico", repo.tipo());
    }

    @Test
    void bridgeMethodExistePorErasure() {
        Set<String> nombres = Arrays.stream(RepositorioTexto.class.getDeclaredMethods())
                .map(Method::getName)
                .collect(Collectors.toSet());
        assertTrue(nombres.contains("porId"));
        boolean hayBridge = Arrays.stream(RepositorioTexto.class.getDeclaredMethods())
                .anyMatch(m -> m.getName().equals("porId") && m.isBridge());
        assertTrue(hayBridge, "se espera bridge method por erasure");
    }

    @Test
    void verificadorJavaxToolsAceptaV2YRechazaRuptura() {
        VerificadorApi.Resultado compatible = VerificadorApi.verificar(
                Path.of(System.getProperty("api.v2.jar")));
        VerificadorApi.Resultado roto = VerificadorApi.verificar(
                Path.of(System.getProperty("api.rota.jar")));
        assertTrue(compatible.ok(), compatible.detalle());
        assertFalse(roto.ok());
        assertTrue(roto.detalle().contains("cannot find symbol")
                || roto.detalle().contains("estado"), roto.detalle());
    }
}
```

## Los 5 temas del módulo

### Tema 1: Qué es la superficie pública de una API · Básico · 35 min

La superficie pública de una API es todo lo que un consumidor externo puede usar o observar y, por lo tanto, todo aquello que no puedes cambiar libremente sin evaluar impacto. No se limita a los nombres de clases públicas. Incluye firmas de métodos y constructores, tipos de parámetros y retornos, excepciones lanzadas o declaradas, constantes públicas, jerarquías de herencia, comportamiento observable, precondiciones/postcondiciones, reglas de nullabilidad, formato de datos expuestos y semántica documentada.

Muchos equipos creen que “API pública” es solo `public class`. En realidad, un cambio en un mensaje de excepción parseado por consumidores, un orden de iteración documentado o una validación más estricta puede romper clientes. Por eso hay que distinguir entre detalle interno accidentalmente visible y contrato deliberado. Lo interno puede cambiar con libertad; lo público requiere estrategia de evolución.

La superficie inicial de `api-v1` es `Repositorio<T>.porId(String)`, `ServicioEnvio.estado(String)`, `ServicioEnvio.ETIQUETA`, `InterfazEvolucion.etiqueta()` y `ImplEvolucion`. `javap -public` permite verla sin leer el fuente, como se hace en la verificación.

### Tema 2: Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min

Compatibilidad de fuente significa que el código cliente compila nuevamente contra la nueva versión. Compatibilidad binaria significa que artefactos ya compilados —JARs, clases— siguen enlazando y ejecutando sin recompilar. Pueden fallar de formas distintas.

Agregar una sobrecarga puede ser compatible de fuente en muchos casos, pero hay casos donde afecta resolución de métodos. Quitar un método rompe ambas. Cambiar un tipo de retorno puede romper binario aunque el fuente se adapte. Renombrar un método rompe ambos. Agregar un `default` a una interfaz suele ser compatible binaria y de fuente para implementadores, pero convertir un `default` en abstracto rompe a quien no lo implementa.

En ecosistemas con dependencias transitivas, no todos recompilan al mismo tiempo. `api-v2` mantiene `estado(String)` y agrega `estado(String, boolean)`: un cliente compilado contra v1 puede seguir ejecutando la firma vieja porque esa firma sigue existiendo en el bytecode de v2. `api-v2-rompe` la elimina y produce `NoSuchMethodError` en el cliente congelado; también convierte `etiqueta()` en abstracta y produce `AbstractMethodError`. Ambas fallas se observan en la verificación real.

**Regla práctica:** para saber si un cambio es seguro, pregunta primero si rompe binario (¿un JAR ya compilado sigue enlazando?) y luego si rompe fuente (¿el cliente recompila sin tocar código?); quitar o renombrar un método rompe ambos, pero cambiar un `default` a abstracto rompe binario sin que el fuente lo delate.

### Tema 3: Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min

Evolucionar una API pública es gestionar el cambio en el tiempo. Un método `default` permite agregar comportamiento a una interfaz sin obligar a todas las implementaciones existentes a recompilarse y modificar su código. Antes de Java 8, agregar un método a una interfaz rompía implementadores. El default tiene que ser semánticamente correcto para implementaciones existentes y puede generar conflictos de herencia múltiple (`implements A, B` con el mismo default).

`@Deprecated` marca un elemento como obsoleto. No lo elimina; avisa. La buena deprecación incluye desde qué versión (`since`), si está planeado para retiro (`forRemoval`) y qué alternativa usar en Javadoc. Deprecar sin camino de migración solo genera ruido. Retirar requiere un ciclo: deprecar, dar tiempo, comunicar, retirar en versión mayor.

`api-v2` mantiene la firma antigua con `@Deprecated(since = "2.0", forRemoval = false)` y documenta `@link #estado(String, boolean)` como reemplazo. `Repositorio` agrega `default String tipo()`, que devuelve `"generico"` para implementadores antiguos. Salida verificada de `App`: `LEGACY=PENDIENTE:A1`, `NUEVO=PENDIENTE:A1:detalle`, `TIPO=generico`, `EVOLUCION=base`.

### Tema 4: Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 45 min

El compilador usa los tipos genéricos para verificar errores en tiempo de compilación, pero al generar bytecode aplica *type erasure*: borra los parámetros genéricos y los reemplaza por sus límites (normalmente `Object`) o por el tipo concreto indicado. El problema aparece cuando una subclase concreta sobrescribe un método genérico: la interfaz borrada expone `Object porId(String)`, mientras `RepositorioTexto` implementa `String porId(String)`. Para que el polimorfismo siga funcionando, el compilador genera un **método puente (bridge method)** sintético con la firma borrada que delega al método concreto.

Esto afecta reflexión, generación de proxies, frameworks que inspeccionan métodos declarados y verificadores de compatibilidad binaria. Cambiar tipos genéricos en una clase o interfaz pública puede agregar, quitar o alterar bridge methods aunque el código fuente “parezca” igual. El test `bridgeMethodExistePorErasure` comprueba su existencia con reflexión; `javap -c -p` muestra el método `public java.lang.Object porId(java.lang.String)` en la clase compilada.

### Tema 5: Verificar la compatibilidad en el build, no de memoria · Intermedio · 40 min

La compatibilidad no se “recuerda”, se verifica. El mínimo verificable es tener tests que ejerciten la firma antigua, la nueva y los casos de evolución. En equipos con librerías publicadas, se suman herramientas como japicmp o Revapi, que comparan dos versiones de JAR y reportan cambios binarios/fuente incompatibles. Aquí se usa `javax.tools.JavaCompiler` directamente para compilar un cliente de prueba contra `api-v2-1.0.0.jar` y contra `api-v2-rompe-1.0.0.jar`.

`VerificadorApi` construye una fuente en memoria con `SimpleJavaFileObject`, recoge `Diagnostic`s y devuelve el primer error. El test `verificadorJavaxToolsAceptaV2YRechazaRuptura` exige que el JAR compatible compile y que el roto falle con `cannot find symbol`. Además, el cliente congelado se compila una sola vez contra `api-v1` y se ejecuta contra los dos JAR: esa es la prueba de compatibilidad binaria. La constante `public static final String ETIQUETA` es una constante de compilación: el bytecode del cliente contiene `ldc "ETIQUETA=v1"`, por lo que cambiarla a `"v2"` en la librería no llega hasta recompilar el cliente.

## Verificación real

Ejecutado el 2026-11-23 en `/tmp/opencode/aurora-m21` (macOS arm64, JDK 27.0.1.0.2 con toolchain Java 25, Gradle 9.9.1):

```bash
./gradlew -q test
./gradlew -q classes :api-v2:jar :api-v2-rompe:jar
mkdir -p verif/cliente-v1
javac -cp api-v1/build/classes/java/main -d verif/cliente-v1 \
  cliente-v1/src/main/java/com/aurora/cliente/ClienteCongelado.java \
  cliente-v1/src/main/java/com/aurora/cliente/ClienteAbstracto.java
javap -public -cp api-v2/build/classes/java/main com.aurora.api.ServicioEnvio
javap -c -p -cp verif/cliente-v1 com.aurora.cliente.ClienteCongelado
java -cp verif/cliente-v1:api-v2/build/classes/java/main com.aurora.cliente.ClienteCongelado
java -cp verif/cliente-v1:api-v2-rompe/build/classes/java/main:api-v1/build/classes/java/main com.aurora.cliente.ClienteCongelado
java -cp verif/cliente-v1:api-v2-rompe/build/classes/java/main:api-v1/build/classes/java/main com.aurora.cliente.ClienteAbstracto
java -cp app/build/classes/java/main:api-v2/build/classes/java/main com.aurora.app.VerificadorApi api-v2/build/libs/api-v2-1.0.0.jar
java -cp app/build/classes/java/main:api-v2/build/classes/java/main:api-v2-rompe/build/classes/java/main com.aurora.app.VerificadorApi api-v2-rompe/build/libs/api-v2-rompe-1.0.0.jar
java -cp app/build/classes/java/main:api-v2/build/classes/java/main com.aurora.app.App
```

`./gradlew -q test`: **4 tests, 0 fallas** (`app/build/test-results/test/TEST-com.aurora.app.ApiCompatTest.xml`). El primer `javac` imprimió `JAVAC_OK`; el cliente quedó congelado contra `api-v1`.

Salida real de `javap -public -cp api-v2/build/classes/java/main com.aurora.api.ServicioEnvio`:

```text
Compiled from "ServicioEnvio.java"
public class com.aurora.api.ServicioEnvio {
  public static final java.lang.String ETIQUETA;
  public com.aurora.api.ServicioEnvio();
  public java.lang.String estado(java.lang.String);
  public java.lang.String estado(java.lang.String, boolean);
}
```

Salida real de `javap -c -p -cp verif/cliente-v1 com.aurora.cliente.ClienteCongelado`:

```text
Compiled from "ClienteCongelado.java"
public final class com.aurora.cliente.ClienteCongelado {
  public com.aurora.cliente.ClienteCongelado();
    Code:
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return

  public static void main(java.lang.String[]);
    Code:
         0: getstatic     #7                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: new           #13                 // class com/aurora/api/ServicioEnvio
         6: dup
         7: invokespecial #15                 // Method com/aurora/api/ServicioEnvio."<init>":()V
        10: ldc           #16                 // String A1
        12: invokevirtual #18                 // Method com/aurora/api/ServicioEnvio.estado:(Ljava/lang/String;)Ljava/lang/String;
        15: invokedynamic #22,  0             // InvokeDynamic #0:makeConcatWithConstants:(Ljava/lang/String;)Ljava/lang/String;
        20: invokevirtual #25                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
        23: getstatic     #7                  // Field java/lang/System.out:Ljava/io/PrintStream;
        26: ldc           #31                 // String ETIQUETA=v1
        28: invokevirtual #25                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
        31: return
}
```

Salida real de `javap -c -p -cp api-v2/build/classes/java/main com.aurora.api.RepositorioTexto`:

```text
Compiled from "RepositorioTexto.java"
public class com.aurora.api.RepositorioTexto implements com.aurora.api.Repositorio<java.lang.String> {
  public com.aurora.api.RepositorioTexto();
    Code:
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return

  public java.lang.String porId(java.lang.String);
    Code:
         0: aload_1
         1: invokedynamic #7,  0              // InvokeDynamic #0:makeConcatWithConstants:(Ljava/lang/String;)Ljava/lang/String;
         6: areturn

  public java.lang.Object porId(java.lang.String);
    Code:
         0: aload_0
         1: aload_1
         2: invokevirtual #11                 // Method porId:(Ljava/lang/String;)Ljava/lang/String;
         5: areturn
}
```

Ejecución del cliente congelado contra la versión compatible:

```text
ESTADO=PENDIENTE:A1
ETIQUETA=v1
```

Ejecución del cliente congelado contra `api-v2-rompe` (se añade `api-v1` al classpath solo para resolver `ImplEvolucion` en el segundo caso):

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'java.lang.String com.aurora.api.ServicioEnvio.estado(java.lang.String)'
	at com.aurora.cliente.ClienteCongelado.main(ClienteCongelado.java:9)
```

```text
Exception in thread "main" java.lang.AbstractMethodError: Receiver class com.aurora.api.ImplEvolucion does not define or inherit an implementation of the resolved method 'abstract java.lang.String etiqueta()' of interface com.aurora.api.InterfazEvolucion.
	at com.aurora.cliente.ClienteAbstracto.main(ClienteAbstracto.java:10)
```

Salidas reales de `VerificadorApi`:

```text
API=OK
API=FALLA:cannot find symbol
```

Salida real de `App`:

```text
LEGACY=PENDIENTE:A1
NUEVO=PENDIENTE:A1:detalle
REPO=TXT:A1
TIPO=generico
EVOLUCION=base
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `NoSuchMethodError` en runtime | Se eliminó/cambió una firma usada por binarios ya compilados | Ejecutar cliente congelado; comparar con `javap` | Mantener sobrecarga antigua, deprecar, retirar en versión mayor |
| `AbstractMethodError` en runtime | Un `default` pasó a abstracto | Inspeccionar interfaz con `javap -p` | Mantener el default o dar implementación a los implementadores |
| Constante cambia “demasiado tarde” o “nunca” | `public static final` con literal se inlina | `javap -c` del cliente: `ldc "ETIQUETA=v1"` | No cambies el valor para clientes ya compilados; nueva constante o método |
| Código cliente no compila tras actualizar | Ruptura de fuente | Compilar cliente contra nueva versión | Documentar migración; ofrecer compatibilidad temporal |
| Conflicto de `default` methods | Dos interfaces proveen el mismo default | Error de compilación en implementador | Sobrescribir explícitamente en la clase implementadora |
| Framework falla al inspeccionar métodos | Bridge/synthetic methods inesperados | `javap -c -p` o reflexión con `isBridge()` | Filtrar `isBridge()`/`isSynthetic()` según el caso |
| Deprecación ignorada | Sin mensaje ni alternativa | Revisar Javadoc/warnings | `@Deprecated(since, forRemoval)` + Javadoc con reemplazo |
| Verificador no detecta el JAR roto | Ruta incorrecta o compilador sin JDK | Imprimir ruta y comprobar `ToolProvider.getSystemJavaCompiler()` | Pasar JAR por `systemProperty` y fallar si no hay compilador |

## Checklist de cierre

- [ ] Puedo identificar la superficie pública real de un módulo con `javap`.
- [ ] Distingo compatibilidad binaria de fuente y sé cómo provocar cada rotura.
- [ ] Sé usar `default` y `@Deprecated` con criterio.
- [ ] Entiendo por qué el erasure genera bridge methods y cómo detectarlos.
- [ ] Sé que una constante congelada se inlina en el bytecode del cliente.
- [ ] Verifico compatibilidad con tests, `javap` y `javax.tools`, no de memoria.

Siguiente paso natural: **Módulo 22 — El objeto por dentro: copia, enums y tipos anidados**, donde se baja al comportamiento real de objetos, copia, enums y clases anidadas.
