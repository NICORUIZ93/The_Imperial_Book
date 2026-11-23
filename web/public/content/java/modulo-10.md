# Módulo 10: Módulos (JPMS) y empaquetado con jlink

JPMS añade una capa de límites al classpath. El mecanismo es un descriptor, `module-info.java`, que declara el nombre del módulo, qué módulos lee (`requires`), qué paquetes publica (`exports`) y qué paquetes abre a reflexión (`opens`). En tiempo de compilación y ejecución, la JVM construye un grafo de módulos y solo permite acceso a los paquetes exportados por ese grafo; un tipo `public` en un paquete no exportado sigue siendo inaccesible desde fuera.

Este mecanismo existe porque en un classpath plano cualquier clase pública puede ser importada por cualquier otra clase, y las dependencias reales quedan implícitas. JPMS convierte esas relaciones en declaraciones verificables y permite además construir una imagen de ejecución reducida con `jlink`. La implicación es doble: ganas encapsulación fuerte y una forma de empaquetado que solo incluye los módulos necesarios, a cambio de tener que mantener los descriptores y lidiar con dependencias no modularizadas. La confusión frecuente es creer que JPMS sustituye a `public`/`private`: no los sustituye, los complementa con un límite entre módulos.

El proyecto verificado es `tienda-aurora-jpms` en `/tmp/opencode/aurora-m10`, con módulos `core` y `app`. Además se compilaron módulos pequeños con `javac` para demostrar `requires transitive`, `ServiceLoader` y automatic modules; ese código se muestra por separado y no forma parte del build Gradle.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-10-jpms.html`; regeneración: editar el HTML/SVG en esa ruta):** [JPMS con exports, opens y paquete interno no exportado](/visuals/temas/java/modulo-10-jpms.html)

Lectura: exports publica API, opens habilita reflexión controlada, y lo no exportado queda encapsulado.

## Proyecto verificado

```text
/tmp/opencode/aurora-m10/
├── settings.gradle.kts
├── build.gradle.kts
├── core/
│   ├── build.gradle.kts
│   └── src/main/java/
│       ├── module-info.java
│       ├── com/aurora/jpms/core/{Producto,Catalogo}.java
│       └── com/aurora/jpms/internal/TokenInterno.java
└── app/
    ├── build.gradle.kts
    └── src/main/java/
        ├── module-info.java
        └── com/aurora/jpms/app/TiendaAuroraJpmsApp.java
```

## Prerrequisitos

```bash
java -version
gradle --version
jlink --version
```

Las herramientas `jlink`, `jar`, `javac` y `java` usadas en la verificación están en `/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin`. Entorno observado: JDK 27.0.1.0.2 (Temurin), Gradle 9.9.1, toolchain Java 25, macOS arm64. `jlink` se ejecutó con la toolchain JDK 27 sobre clases compiladas para Java 25.

## Bootstrap

```bash
mkdir -p tienda-aurora-jpms/core/src/main/java/com/aurora/jpms/{core,internal}
mkdir -p tienda-aurora-jpms/app/src/main/java/com/aurora/jpms/app
cd tienda-aurora-jpms
gradle wrapper --gradle-version 9.9.1
```

## Código completo del proyecto Gradle

Ruta base: `/tmp/opencode/aurora-m10/`.

**`settings.gradle.kts`**

```kotlin
rootProject.name = "tienda-aurora-jpms"
include("core", "app")
```

**`build.gradle.kts`**

```kotlin
plugins { base }
allprojects {
    group = "com.aurora"
    version = "1.0.0"
    repositories { mavenCentral() }
}
subprojects {
    apply(plugin = "java-library")
    extensions.configure<JavaPluginExtension> {
        toolchain { languageVersion = JavaLanguageVersion.of(25) }
    }
    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
    }
}
```

**`core/build.gradle.kts`**

```kotlin
// El módulo core no necesita dependencias externas en esta demo.
```

**`app/build.gradle.kts`**

```kotlin
plugins { application }
dependencies { implementation(project(":core")) }
application { mainClass = "com.aurora.jpms.app.TiendaAuroraJpmsApp" }
```

**`core/src/main/java/module-info.java`**

```java
module com.aurora.jpms.core {
    exports com.aurora.jpms.core;
    opens com.aurora.jpms.core;
}
```

`exports` publica el paquete de API. `opens` habilita reflexión profunda en runtime sobre ese mismo paquete. `com.aurora.jpms.internal` no aparece en el descriptor: queda fuera del grafo de módulos para consumidores.

**`core/src/main/java/com/aurora/jpms/core/Producto.java`**

```java
package com.aurora.jpms.core;

import java.math.BigDecimal;

public record Producto(String sku, String nombre, BigDecimal precio) {
    private String etiquetaInterna() {
        return sku + ":" + nombre;
    }
}
```

**`core/src/main/java/com/aurora/jpms/core/Catalogo.java`**

```java
package com.aurora.jpms.core;

import java.math.BigDecimal;
import java.util.List;

public final class Catalogo {
    public Catalogo() {
    }

    public List<Producto> productos() {
        return List.of(
                new Producto("CAF-100", "Cafe Aurora", new BigDecimal("14.90")),
                new Producto("MOL-200", "Molino Manual", new BigDecimal("79.90"))
        );
    }
}
```

**`core/src/main/java/com/aurora/jpms/internal/TokenInterno.java`**

```java
package com.aurora.jpms.internal;

public final class TokenInterno {
    public static String valor() {
        return "secreto";
    }
}
```

**`app/src/main/java/module-info.java`**

```java
module com.aurora.jpms.app {
    requires com.aurora.jpms.core;
}
```

**`app/src/main/java/com/aurora/jpms/app/TiendaAuroraJpmsApp.java`**

```java
package com.aurora.jpms.app;

import com.aurora.jpms.core.Catalogo;
import com.aurora.jpms.core.Producto;

import java.lang.reflect.Method;

public final class TiendaAuroraJpmsApp {

    public static void main(String[] args) throws Exception {
        Catalogo catalogo = new Catalogo();
        Producto primero = catalogo.productos().getFirst();
        System.out.println("productos=" + catalogo.productos().size());
        System.out.println("primero=" + primero.sku());

        Method m = Producto.class.getDeclaredMethod("etiquetaInterna");
        m.setAccessible(true);
        System.out.println("reflexion=" + m.invoke(primero));
    }
}
```

## Código de la verificación aislada con javac

Estos archivos se crearon solo bajo `/tmp/opencode/aurora-m10/build/jpms-demo/` para ejecutar las demostraciones de `requires transitive` y `ServiceLoader`. No se añadieron al build Gradle del proyecto.

**`src/demo.api/module-info.java`**

```java
module demo.api {
    exports demo.api;
    uses demo.api.Saludo;
}
```

**`src/demo.api/demo/api/Saludo.java`**

```java
package demo.api;
public interface Saludo { String mensaje(); }
```

**`src/demo.impl/module-info.java`**

```java
module demo.impl {
    requires demo.api;
    provides demo.api.Saludo with demo.impl.SaludoAurora;
}
```

**`src/demo.impl/demo/impl/SaludoAurora.java`**

```java
package demo.impl;
public final class SaludoAurora implements demo.api.Saludo {
    @Override public String mensaje() { return "hola desde ServiceLoader"; }
}
```

**`src/demo.fachada/module-info.java`**

```java
module demo.fachada {
    requires transitive demo.api;
    exports demo.fachada;
    uses demo.api.Saludo;
}
```

**`src/demo.fachada/demo/fachada/Fachada.java`**

```java
package demo.fachada;
import demo.api.Saludo;
import java.util.ServiceLoader;
public final class Fachada {
    public static Saludo cargar() {
        return ServiceLoader.load(Saludo.class).findFirst().orElseThrow();
    }
}
```

**`src/demo.app/module-info.java`**

```java
module demo.app {
    requires demo.fachada;
}
```

**`src/demo.app/demo/app/App.java`**

```java
package demo.app;
import demo.api.Saludo;
import demo.fachada.Fachada;
public final class App {
    public static void main(String[] args) {
        Saludo saludo = Fachada.cargar();
        System.out.println(saludo.mensaje());
    }
}
```

`demo.app` importa `demo.api.Saludo` sin declarar `requires demo.api`: solo declare `requires demo.fachada`. Eso compila porque `demo.fachada` usa `requires transitive demo.api`. El módulo `demo.fachada` también declara `uses` porque es quien llama a `ServiceLoader.load`.

## Comandos ejecutados y salida observada

#### Ejecución de la aplicación modular

```bash
cd /tmp/opencode/aurora-m10
./gradlew -q :app:run
```

```text
productos=2
primero=CAF-100
reflexion=CAF-100:Cafe Aurora
```

El descriptor del jar de `core` muestra exactamente qué se exporta y qué se abre:

```bash
cd /tmp/opencode/aurora-m10
jar --describe-module --file core/build/libs/core-1.0.0.jar
```

```text
com.aurora.jpms.core jar:file:///private/tmp/opencode/aurora-m10/core/build/libs/core-1.0.0.jar!/module-info.class
exports com.aurora.jpms.core
requires java.base mandated
opens com.aurora.jpms.core
```

#### Paquete no exportado: acceso denegado

Se creó `/tmp/opencode/aurora-m10/build/intruder-src/Intruder.java`:

```java
import com.aurora.jpms.internal.TokenInterno;

public class Intruder {
    public static void main(String[] args) {
        System.out.println(TokenInterno.valor());
    }
}
```

```bash
cd /tmp/opencode/aurora-m10
javac --module-path core/build/libs/core-1.0.0.jar \
  --add-modules com.aurora.jpms.core \
  -d build/intruder-out build/intruder-src/Intruder.java
```

```text
build/intruder-src/Intruder.java:1: error: package com.aurora.jpms.internal is not visible
import com.aurora.jpms.internal.TokenInterno;
                      ^
  (package com.aurora.jpms.internal is declared in module com.aurora.jpms.core, which does not export it)
1 error
```

Sin `--add-modules` el error previo es distinto —`which is not in the module graph`— porque el módulo ni siquiera estaba en el grafo. Con el módulo en el grafo, el fallo se debe exclusivamente a la falta de `exports`. `TokenInterno` es `public`, y aun así no puede importarse: esa es la encapsulación fuerte.

#### Empaquetado con jlink

```bash
cd /tmp/opencode/aurora-m10
JH=/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin
$JH/jlink \
  --module-path "core/build/libs/core-1.0.0.jar:app/build/classes/java/main" \
  --add-modules com.aurora.jpms.app \
  --output build/jlink-aurora \
  --strip-debug --no-man-pages --no-header-files --compress=zip-9 \
  --launcher aurora=com.aurora.jpms.app/com.aurora.jpms.app.TiendaAuroraJpmsApp
build/jlink-aurora/bin/aurora
build/jlink-aurora/bin/java --list-modules
du -sh build/jlink-aurora
```

Salida de `build/jlink-aurora/bin/aurora`:

```text
productos=2
primero=CAF-100
reflexion=CAF-100:Cafe Aurora
```

Salida de `build/jlink-aurora/bin/java --list-modules`:

```text
com.aurora.jpms.app
com.aurora.jpms.core
java.base@27.0.1.0.2
```

`du -sh build/jlink-aurora` devolvió `32M`. La imagen contiene el launcher `aurora`, `java` y `keytool` en `bin/`. El tamaño depende del JDK y de la plataforma; no es una constante del proyecto.

#### requires transitive y ServiceLoader

```bash
cd /tmp/opencode/aurora-m10
D=build/jpms-demo
JH=/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin
MP=$D/out/demo.api:$D/out/demo.impl:$D/out/demo.fachada:$D/out/demo.app
for m in demo.api demo.impl demo.fachada demo.app; do
  $JH/javac --module-path "$MP" -d $D/out/$m $(find $D/src/$m -name '*.java')
done
$JH/java --module-path "$MP" --module demo.app/demo.app.App
```

```text
hola desde ServiceLoader
```

Para comprobar el efecto de `transitive`, se recompiló `demo.fachada` con `requires demo.api;` (sin `transitive`) y se compiló `demo.app` contra esa versión:

```text
build/jpms-demo/plain-src/demo.app/demo/app/App.java:2: error: package demo.api is not visible
import demo.api.Saludo;
           ^
  (package demo.api is declared in module demo.api, but module demo.app does not read it)
1 error
```

`app` no declara `requires demo.api`, pero con `requires transitive` sí puede usar `Saludo`; sin esa palabra clave, la compilación falla. En paralelo, `provides ... with ...` en `demo.impl` registró el proveedor y `uses` en `demo.fachada` permitió descubrirlo mediante `ServiceLoader`.

#### Automatic module en migración

Se compiló una clase en un jar sin descriptor y se describió con `jar`:

```bash
cd /tmp/opencode/aurora-m10
JH=/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin
$JH/jar --describe-module --file build/jpms-demo/auto/aurora-util-1.2.3.jar
```

```text
No module descriptor found. Derived automatic module.

aurora.util@1.2.3 automatic
requires java.base mandated
contains com.ejemplo.util
```

El nombre deriva del nombre del archivo (`aurora-util-1.2.3.jar` → `aurora.util`). Es un puente para dependencias no modularizadas, no un descriptor real.

## Conceptos cubiertos

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 40 min

**Mecanismo.** `module-info.java` declara nombre, `requires`, `exports`, `opens`, `uses` y `provides`. En compilación, `javac` resuelve tipos solo desde paquetes exportados por módulos que el módulo actual lee. En ejecución, la JVM aplica el mismo grafo. `requires transitive` añade una arista indirecta: si A requiere transitivamente B, quien requiere A también lee B. La combinación `provides ... with ...` en el proveedor y `uses` en el consumidor es la interfaz de ServiceLoader.

**Por qué existe.** Un classpath plano trata todo `public` como accesible; JPMS permite que un tipo público sea invisible fuera de su módulo. `requires transitive` existe para APIs cuyo tipo de retorno o parámetro pertenece a otra dependencia: los consumidores necesitan leer ese tipo para usar la API. ServiceLoader existe para desacoplar la interfaz de sus implementaciones.

**Implicaciones verificadas.** El jar de `core` declara `exports com.aurora.jpms.core` y no menciona `com.aurora.jpms.internal`. El compilador rechaza `Intruder.java` con “which does not export it” aunque `TokenInterno` sea `public`. En la demostración aislada, `hola desde ServiceLoader` se imprimió con `provides`/`uses`, y quitar `transitive` produjo un error de compilación en `demo.app`.

**Confusión común.** Creer que `public` basta para acceder a una clase. Fuera del módulo, `public` solo es visible si el paquete está exportado. Otra confusión es pensar que `uses` registra proveedores: `provides ... with ...` los registra; `uses` declara que el módulo consumidor los busca.

### Tema 2: Migración incremental y cuándo JPMS aporta valor · Intermedio · 35 min

**Mecanismo.** Una aplicación no modularizada se ejecuta en el *unnamed module*, que lee todos los módulos resueltos y no impone exports propios. Un jar sin `module-info.class` puede colocarse en el module path: la JVM deriva un automatic module a partir del nombre del archivo, como se observó con `aurora.util@1.2.3 automatic`. Esos módulos exportan todos sus paquetes, por lo que son un puente y no un estado final estricto.

**Por qué existe.** Migrar un proyecto grande de una vez suele ser inviable porque dependencias externas no están modularizadas. El unnamed module y los automatic modules permiten avanzar por partes sin detener el desarrollo.

**Implicaciones.** Aquí la migración se demostró en dos niveles: el proyecto Gradle usa descriptores reales en `core` y `app`, y un jar común se transformó en automatic module por su nombre. La decisión de adopción debe basarse en beneficio concreto: límites entre componentes, protección de internals o una imagen `jlink` reducida. En aplicaciones Spring Boot típicas, el costo de mantener descriptores suele ser alto; en librerías o plataformas, puede compensar.

**Confusión común.** Pensar que hay que modularizar todo el ecosistema antes de empezar. El unnamed module permite mezclar código no modular, y un automatic module permite poner un jar heredado en el module path. La consecuencia es que la encapsulación es gradual: mientras haya automatic modules, esos paquetes siguen abiertos.

### Tema 3: opens para acceso reflexivo controlado de frameworks · Avanzado · 35 min

**Mecanismo.** `exports` autoriza acceso compilado a los tipos públicos del paquete. `opens` autoriza reflexión profunda en runtime, incluida la modificación de accesibilidad con `setAccessible(true)`. `opens ... to Modulo` limita esa autorización a un módulo concreto. Las formas sin argumento (`open module`) abren todos los paquetes del módulo.

**Por qué existe.** Frameworks como Jackson, Hibernate o Spring inspeccionan campos, constructores y métodos privados. Un `exports` no basta para esa operación; sin `opens`, la JVM lanza `InaccessibleObjectException`.

**Implicaciones observables.** `core` declara `opens com.aurora.jpms.core` y la app invoca `Producto.class.getDeclaredMethod("etiquetaInterna")` seguido de `setAccessible(true)`. La salida `reflexion=CAF-100:Cafe Aurora` confirma que la reflexión profunda funcionó. El descriptor del jar muestra `opens com.aurora.jpms.core` junto al `exports`. Abrir menos paquetes preserva más encapsulación; preferir APIs públicas o records evita depender de nombres privados que cambian en un refactor.

**Confusión común.** Tratar `exports` y `opens` como sinónimos. No lo son: uno habilita acceso en compilación y ejecución al API pública; el otro habilita reflexión en runtime. Puede bastar uno, otro o hacer falta ambos, como en este paquete.

## Verificación real

Ejecutado el 2026-11-23 en `/tmp/opencode/aurora-m10` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25). `jlink`, `javac`, `jar` y `java` se invocaron desde el JDK de Temurin indicado en Prerrequisitos.

| Comando | Resultado observado |
|---|---|
| `./gradlew -q :app:run` | `productos=2`, `primero=CAF-100`, `reflexion=CAF-100:Cafe Aurora` |
| `jar --describe-module --file core/build/libs/core-1.0.0.jar` | `exports com.aurora.jpms.core`, `opens com.aurora.jpms.core` |
| `javac` sobre `Intruder.java` con el módulo en el grafo | error: paquete no exportado; `TokenInterno` resulta inaccesible |
| `jlink ... --compress=zip-9` | imagen en `build/jlink-aurora` de 32M; launcher ejecuta la app sin errores |
| `java --list-modules` en la imagen | `com.aurora.jpms.app`, `com.aurora.jpms.core`, `java.base@27.0.1.0.2` |
| Compilación y ejecución de `demo.api`/`demo.impl`/`demo.fachada`/`demo.app` | `hola desde ServiceLoader` |
| Recompilación de `demo.fachada` sin `transitive` | `demo.app` no compila: “module demo.app does not read it” |
| `jar --describe-module` sobre `aurora-util-1.2.3.jar` | `aurora.util@1.2.3 automatic` |

El empaquetado con `jlink` sí se pudo ejecutar en este entorno; no hay una limitación de JDK 27 que impida generar la imagen. El tamaño y la lista de módulos corresponden a esta máquina y a esta versión del JDK.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `package ... is not visible` con “does not export it” | Paquete ausente en `exports` | Error de `javac` al importar | Exportar el paquete o usar una API pública |
| `package ... is not visible` con “not in the module graph” | Falta `requires` o `--add-modules` | Error previo a la comprobación de exports | Añadir `requires` o `--add-modules` |
| `InaccessibleObjectException` | Reflexión profunda sin `opens` | Stack trace en runtime | `opens ... to Modulo` o usar API pública |
| `module X does not read it` | Dependencia indirecta sin `requires transitive` | Error de compilación en el consumidor | Declarar `requires transitive` en la fachada |
| `ServiceConfigurationError` | `uses`/`provides` ausentes o provedor sin constructor accesible | Falla al cargar ServiceLoader | Declarar ambos lados y revisar el archivo de servicios |
| `jlink` no incluye una dependencia | Módulo ausente en `--add-modules` o en el module path | `java --list-modules` dentro de la imagen | Añadir el módulo al module path y a `--add-modules` |
| Automatic module con nombre inesperado | Nombre de jar con guiones o versión | `jar --describe-module` | Usar `Automatic-Module-Name` en el manifiesto |

## Cierre

JPMS no es obligatorio para todo proyecto Java, pero sí es el modelo nativo de encapsulación de la plataforma. `exports`, `requires`, `opens`, `requires transitive` y `provides`/`uses` explican tanto los límites del código como la composición de una imagen `jlink`. La evidencia de este módulo muestra cada una de esas declaraciones con una salida ejecutada.

## Checklist

- Declaro `module-info.java` con `requires` y `exports`.
- Distingo `exports` de `opens` y sé por qué la reflexión profunda necesita el segundo.
- Puedo demostrar que un paquete no exportado es inaccesible aunque contenga una clase pública.
- Entiendo `requires transitive` y el par `provides`/`uses` de ServiceLoader.
- Sé cuándo JPMS aporta valor y cómo usar un jar heredado como automatic module.
- Genero y ejecuto una imagen `jlink` con un launcher explícito.
