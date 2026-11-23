# Módulo 10: Módulos, JPMS y empaquetado

A medida que un proyecto Java crece, el classpath plano deja de ser suficiente para expresar límites. Cualquier paquete público queda accesible para cualquiera, y las dependencias reales entre componentes quedan implícitas. Java Platform Module System (JPMS), introducido en Java 9, agrega una capa de encapsulación fuerte: un módulo declara qué requiere y qué exporta.

Este módulo construye `tienda-aurora-jpms`, un proyecto multi-módulo Gradle con `core` y `app`. `core` exporta su API, mantiene un paquete interno no exportado y abre un paquete para reflexión controlada. `app` consume el módulo y demuestra reflexión permitida por `opens`.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-10-jpms.html"
    alt="JPMS con exports, opens y paquete interno no exportado"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>exports publica API, opens habilita reflexión controlada, y lo no exportado queda encapsulado.</figcaption>
</figure>

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-jpms/core/src/main/java/com/aurora/jpms/{core,internal}
mkdir -p tienda-aurora-jpms/app/src/main/java/com/aurora/jpms/app
cd tienda-aurora-jpms
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jpms"
include("core", "app")
```

#### `build.gradle.kts` (raíz)

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

#### `core/build.gradle.kts`

```kotlin
// El módulo core no necesita dependencias externas en esta demo.
```

#### `app/build.gradle.kts`

```kotlin
plugins { application }
dependencies { implementation(project(":core")) }
application { mainClass = "com.aurora.jpms.app.TiendaAuroraJpmsApp" }
```

## Módulo core

#### `core/src/main/java/module-info.java`

`exports` publica `com.aurora.jpms.core`. `opens` permite acceso reflexivo profundo al paquete core (útil para frameworks que inspeccionan miembros privados). El paquete `com.aurora.jpms.internal` no se exporta ni se abre: queda encapsulado.

```java
module com.aurora.jpms.core {
    exports com.aurora.jpms.core;
    opens com.aurora.jpms.core;
}
```

#### `Producto.java`

```java
package com.aurora.jpms.core;

import java.math.BigDecimal;

public record Producto(String sku, String nombre, BigDecimal precio) {
    private String etiquetaInterna() {
        return sku + ":" + nombre;
    }
}
```

#### `Catalogo.java`

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

#### `TokenInterno.java`

Clase en paquete no exportado. Existe para mostrar la intención de encapsulación: no forma parte de la API del módulo.

```java
package com.aurora.jpms.internal;

public final class TokenInterno {
    public static String valor() {
        return "secreto";
    }
}
```

## Módulo app

#### `app/src/main/java/module-info.java`

```java
module com.aurora.jpms.app {
    requires com.aurora.jpms.core;
}
```

#### `TiendaAuroraJpmsApp.java`

Usa la API exportada normalmente y también accede por reflexión a un método privado de `Producto`. Esto funciona porque `core` tiene `opens com.aurora.jpms.core`. Si quitas `opens`, la reflexión profunda falla con `InaccessibleObjectException`.

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

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 40 min

`module-info.java` declara el nombre del módulo, sus dependencias (`requires`) y los paquetes que expone (`exports`). A diferencia del classpath, donde todo `public` es accesible si está en el path, JPMS permite que un paquete sea público dentro del módulo pero invisible fuera si no se exporta.

`exports` expone tipos públicos para uso normal en compilación y runtime. `requires` declara dependencia. `requires transitive` reexporta una dependencia para consumidores del módulo. `provides ... with ...` y `uses` soportan ServiceLoader.

La encapsulación fuerte previene dependencias accidentales a internals. Es especialmente útil en librerías y plataformas grandes. El costo es la fricción de modularizar dependencias que no son módulos limpios.

### Tema 2: Migración incremental y cuándo JPMS aporta valor · Intermedio · 35 min

No todo proyecto necesita JPMS completo. Muchos proyectos Java funcionan bien con classpath y buena disciplina de paquetes. JPMS aporta valor cuando quieres límites explícitos entre componentes, empaquetado con `jlink`/runtime reducido, o protección contra uso de internals.

La migración puede ser incremental: empezar por el classpath, usar automatic modules, o modularizar solo bordes. El “unnamed module” permite que código no modular use el classpath. Los automatic modules permiten que jars no modularizados se usen como módulos por nombre derivado del jar, pero son un puente, no el estado final ideal.

**Criterio práctico:** adopta JPMS si el beneficio de encapsulación/packaging supera el costo de mantenimiento. Para apps Spring Boot típicas, el costo suele ser alto; para librerías o plataformas Java, puede valer.

### Tema 3: opens para acceso reflexivo controlado de frameworks · Avanzado · 35 min

La reflexión profunda (`setAccessible` sobre miembros no públicos) está restringida por JPMS. `exports` no alcanza para eso; se necesita `opens`. `opens com.aurora.jpms.core` permite reflexión en runtime a ese paquete. `opens ... to ...` lo limita a módulos específicos.

Esto importa para frameworks como Jackson, Hibernate o Spring, que inspeccionan campos, constructores o métodos privados. Abrir todo un módulo es fácil pero debilita encapsulación. Abrir solo paquetes necesarios, o preferir APIs públicas/records/constructores, es mejor.

**Confusión común:** `exports` y `opens` son lo mismo. No. `exports` es para acceso compilado/API; `opens` es para reflexión runtime. Puedes necesitar uno, otro o ambos.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m10` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q :app:run
```

Resultado observado:

- `productos=2`
- `primero=CAF-100`
- `reflexion=CAF-100:Cafe Aurora`

**Nota honesta:** la reflexión profunda funcionó porque `core` declara `opens com.aurora.jpms.core`. Sin `opens`, el mismo código debe fallar con `InaccessibleObjectException`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `InaccessibleObjectException` / warning acceso | Encapsulamiento fuerte de módulos/reflexión | Stack trace en runtime | Usar API pública, `--add-opens` solo si justificado |
| `ClassNotFoundException`/`NoClassDefFoundError` | Dependencia/runtime classpath/modularidad | Revisar classpath/module-path | Corregir dependencia, exports/requires |
| `ServiceConfigurationError` | `META-INF/services` mal formado | Falla al cargar ServiceLoader | Verificar nombre de archivo, implementación y constructor |
| Código frágil por reflection | Nombres de métodos/campos hardcodeados | Falla al refactorizar | Preferir interfaces, records, anotaciones controladas |
| Anotación no procesada | `@Retention` incorrecta | Valor null en runtime | Usar `RUNTIME` si se lee por reflection |

## Cierre

JPMS no es obligatorio para todo proyecto Java, pero sí es el modelo nativo de encapsulación del lenguaje/plataforma. Entender `module-info`, `exports`, `requires` y `opens` te permite diagnosticar problemas reales de modularidad y tomar una decisión informada sobre cuándo adoptar el sistema.

## Checklist

- [ ] Sé declarar `module-info.java` con `requires` y `exports`.
- [ ] Distingo `exports` de `opens`.
- [ ] Sé cuándo JPMS aporta valor y cuándo es sobrecosto.
- [ ] Entiendo el rol del unnamed/automatic module en migraciones.
- [ ] Evito abrir paquetes de más por comodidad.
