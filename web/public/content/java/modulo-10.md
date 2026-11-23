# Módulo 10: Módulos (JPMS) y proyectos grandes


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 10 — mapa visual](/visuals/temas/java/modulo-10-io-nio.html)

Lectura: I/O mueve bytes/caracteres con buffering, charset y cierre explícito de recursos.


Cuando un proyecto Java crece, `public` deja de ser suficiente como límite. Un paquete interno puede ser `public` porque otra clase del mismo JAR lo necesita, pero eso no significa que deba ser API para todo el mundo. JPMS, el Java Platform Module System, agrega una frontera más: el módulo. Un módulo declara qué paquetes exporta, de qué módulos depende y qué paquetes abre a reflexión.

En Tienda Aurora, esto sirve para separar el dominio reusable (`core`) de la aplicación (`app`). `app` puede usar `com.aurora.jpms.core`, pero no debería tocar `com.aurora.jpms.internal`. Este módulo construye ese ejemplo con dos módulos JPMS y verifica tanto el caso feliz como el límite de encapsulación.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, macOS arm64. `./gradlew -q :app:run` ejecutó correctamente. La prueba de acceso a paquete no exportado se verificó con `javac --module-path ...` y falló como se esperaba.

## Proyecto desde cero: tienda-aurora-jpms

## Prerrequisitos

```bash
java -version
gradle --version
```

## Estructura del proyecto

```text
tienda-aurora-jpms/
├── build.gradle.kts
├── settings.gradle.kts
├── core/
│   ├── build.gradle.kts
│   └── src/main/java/
│       ├── module-info.java
│       └── com/aurora/jpms/
│           ├── core/
│           │   ├── Catalogo.java
│           │   └── Producto.java
│           └── internal/
│               └── TokenInterno.java
└── app/
    ├── build.gradle.kts
    └── src/main/java/
        ├── module-info.java
        └── com/aurora/jpms/app/
            └── TiendaAuroraJpmsApp.java
```

## Código completo

Declara el build multi-módulo con `core` y `app`.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jpms"
include("core", "app")
```

Configura Java 25, repositorios y compilación estricta para todos los subproyectos.

**Archivo:** `build.gradle.kts`

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

`core` no tiene dependencias externas en este ejemplo; expone el dominio.

**Archivo:** `core/build.gradle.kts`

```kotlin

```

`app` aplica `application` y depende de `project(":core")`.

**Archivo:** `app/build.gradle.kts`

```kotlin
plugins { application }
dependencies { implementation(project(":core")) }
application { mainClass = "com.aurora.jpms.app.TiendaAuroraJpmsApp" }
```

Descriptor del módulo `core`. `exports` publica `com.aurora.jpms.core`. `opens` permite acceso reflexivo profundo al paquete indicado; aquí se usa para demostrar reflexión controlada. En proyectos reales, `opens ... to` limita el acceso a módulos específicos cuando esos módulos están presentes en la resolución.

**Archivo:** `core/src/main/java/module-info.java`

```java
module com.aurora.jpms.core {
    exports com.aurora.jpms.core;
    opens com.aurora.jpms.core;
}
```

Record exportado. Tiene un método privado `etiquetaInterna()` que usaremos para mostrar la diferencia entre acceso normal y reflexión con `opens`.

**Archivo:** `core/src/main/java/com/aurora/jpms/core/Producto.java`

```java
package com.aurora.jpms.core;

import java.math.BigDecimal;

public record Producto(String sku, String nombre, BigDecimal precio) {
    private String etiquetaInterna() {
        return sku + ":" + nombre;
    }
}
```

API pública del módulo. Devuelve productos del dominio.

**Archivo:** `core/src/main/java/com/aurora/jpms/core/Catalogo.java`

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

Clase en paquete no exportado. Existe dentro del módulo, pero no forma parte de su API pública.

**Archivo:** `core/src/main/java/com/aurora/jpms/internal/TokenInterno.java`

```java
package com.aurora.jpms.internal;

public final class TokenInterno {
    public static String valor() {
        return "secreto";
    }
}
```

`app` requiere `core`. Sin `requires`, no podría compilar contra los tipos exportados por `core`.

**Archivo:** `app/src/main/java/module-info.java`

```java
module com.aurora.jpms.app {
    requires com.aurora.jpms.core;
}
```

App que consume la API exportada y demuestra reflexión sobre un miembro privado en un paquete abierto.

**Archivo:** `app/src/main/java/com/aurora/jpms/app/TiendaAuroraJpmsApp.java`

```java
package com.aurora.jpms.app;

import com.aurora.jpms.core.Catalogo;
import com.aurora.jpms.core.Producto;

import java.lang.reflect.Method;

public final class TiendaAuroraJpmsApp {

    public TiendaAuroraJpmsApp() {
    }

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

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q :app:run
```

```text
productos=2
primero=CAF-100
reflexion=CAF-100:Cafe Aurora
```

## Encapsulación verificada

El paquete `com.aurora.jpms.internal` no está exportado por `core`. Al intentar compilar un módulo cliente que lo importa, el compilador falla:

```text

```

Ese error es la diferencia clave: el tipo puede ser `public` en Java, pero si su paquete no está exportado por el módulo, no es accesible fuera del módulo.

## Conceptos cubiertos

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 40 min

`module-info.java` es el descriptor de módulo. Vive en la raíz de fuentes del módulo y declara su nombre, dependencias y paquetes expuestos. En `core`:

```java
module com.aurora.jpms.core {
    exports com.aurora.jpms.core;
    opens com.aurora.jpms.core;
}
```

`exports com.aurora.jpms.core` significa que otros módulos pueden usar los tipos públicos de ese paquete. `com.aurora.jpms.internal` no se exporta, por lo que queda encapsulado a nivel de módulo. Esto es encapsulación fuerte: no depende solo de `private`/`public`, sino de la frontera declarada del módulo.

En `app`, el descriptor es:

```java
module com.aurora.jpms.app {
    requires com.aurora.jpms.core;
}
```

`requires` declara dependencia de lectura del módulo. Sin esto, `app` no puede compilar contra `Catalogo` aunque el JAR esté en el classpath/module path de forma ambigua. JPMS hace la dependencia explícita.

### Tema 2: Migración incremental y cuándo JPMS aporta valor · Intermedio · 35 min

Migrar un sistema grande a JPMS no suele ser “agrega module-info a todo”. La estrategia práctica es incremental. Primero, identifica límites reales: qué paquetes son API y cuáles son internos. Luego coloca JARs legados en el module path como automatic modules o, durante la transición, usa el classpath/unnamed module donde haga falta. Después introduce `module-info.java` en módulos con fronteras claras, empezando por los más estables.

JPMS aporta valor cuando el proyecto es grande, tiene varios equipos, librerías internas reutilizadas, o necesitas proteger APIs internas de uso accidental. También ayuda a razonar sobre dependencias. Aporta menos en aplicaciones pequeñas, scripts, o proyectos donde el costo de modularizar librerías no modularizadas supera el beneficio. No lo adoptes por moda: adóptalo cuando el límite de módulo resuelva un problema real de arquitectura.

### Tema 3: opens para acceso reflexivo controlado de frameworks · Avanzado · 35 min

La reflexión profunda permite acceder a miembros no públicos en runtime. JPMS la restringe. `exports` permite acceso a tipos públicos y miembros públicos; no permite `setAccessible` sobre privados. Para eso existe `opens`.

En el ejemplo, `Producto.etiquetaInterna()` es privado. La app lo invoca por reflexión:

```java
Method m = Producto.class.getDeclaredMethod("etiquetaInterna");
m.setAccessible(true);
System.out.println("reflexion=" + m.invoke(primero));
```

Esto funciona porque `core` abre `com.aurora.jpms.core`. Si no lo abriera, obtendrías un error de acceso reflexivo en runtime. La forma más precisa es `opens paquete to modulo.framework`, que limita quién puede reflejar. En este build verificado se usó `opens com.aurora.jpms.core;` para mantener el ejemplo simple y evitar acoplar el descriptor de `core` al nombre del módulo app durante compilaciones aisladas con `-Werror`; en producción, prefiere la forma calificada.

Frameworks como Jackson, Hibernate o Spring históricamente usan reflexión. Con JPMS, debes abrir solo los paquetes que necesitan, idealmente a módulos específicos. Abrir todo el módulo por comodidad debilita la encapsulación que JPMS te da.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m10` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados:

- `test`: 0 fallas.
- `run`: `productos=2`, `primero=CAF-100`, `reflexion=CAF-100:Cafe Aurora`.

## Cierre

JPMS no reemplaza el diseño de paquetes ni los modificadores de acceso; agrega una frontera arquitectónica. `exports` define API pública, `requires` define dependencias y `opens` controla reflexión. Úsalo donde los límites importan, y migra de forma incremental.

## Checklist

- Sé qué hace `module-info.java`: exports, requires y opens.
- Distingo “public en Java” de “exportado por el módulo”.
- Puedo explicar una migración incremental a JPMS.
- Uso `opens` solo para paquetes que realmente necesitan reflexión.
- Prefiero `opens ... to ...` cuando conozco el módulo consumidor.
