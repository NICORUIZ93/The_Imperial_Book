# Módulo 21: APIs públicas, compatibilidad y evolución

Cuando publicas una librería o un módulo interno que usan otros equipos, cada clase pública, método, firma y comportamiento observable se vuelve un contrato. Cambiarlo puede compilar en tu repo y aun así romper a quienes dependen de tu artefacto. Ese tipo de rotura es caro porque ocurre lejos de tu cambio: en el build de otro equipo, en runtime, o sutilmente en la semántica.

En este módulo vas a construir `tienda-aurora-java-m21`, un proyecto multi-módulo con `api-v1`, `api-v2` y `app`. La idea es ver la evolución de una API pequeña: qué se considera superficie pública, la diferencia entre compatibilidad binaria y de fuente, cómo usar `default` y `@Deprecated`, por qué el borrado de genéricos genera bridge methods, y cómo verificar compatibilidad con pruebas y herramientas.

## Prerrequisitos y bootstrap

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m21/api-v1/src/main/java/com/aurora/api
mkdir -p tienda-aurora-java-m21/api-v2/src/main/java/com/aurora/api
mkdir -p tienda-aurora-java-m21/app/src/main/java/com/aurora/app
mkdir -p tienda-aurora-java-m21/app/src/test/java/com/aurora/app
cd tienda-aurora-java-m21
gradle wrapper --gradle-version 9.9.1
```

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m21"
include("api-v1", "api-v2", "app")
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
project(":app") {
    dependencies {
        implementation(project(":api-v2"))
        testImplementation(platform("org.junit:junit-bom:5.13.4"))
        testImplementation("org.junit.jupiter:junit-jupiter")
        testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    }
    tasks.test { useJUnitPlatform(); testLogging { events("passed","skipped","failed") } }
}
```

`api-v1` y `api-v2` representan la evolución del contrato. `app` consume `api-v2`; los tests fijan expectativas de compatibilidad.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-21-compatibilidad.html`; regeneración: editar el HTML/SVG en esa ruta):** [Compatibilidad: fuente frente a binaria](/visuals/temas/java/modulo-21-compatibilidad.html)

Lectura: cambiar una firma puede conservar la compatibilidad de fuente y romper la binaria; por eso la superficie pública se verifica con artefactos, no de memoria.

### Tema 1: Qué es la superficie pública de una API · Básico · 35 min

La superficie pública de una API es todo lo que un consumidor externo puede usar o observar y, por lo tanto, todo aquello que no puedes cambiar libremente sin evaluar impacto. No se limita a los nombres de clases públicas. Incluye firmas de métodos y constructores, tipos de parámetros y retornos, excepciones lanzadas o declaradas, constantes públicas, jerarquías de herencia, comportamiento observable, precondiciones/postcondiciones, reglas de nullabilidad, formato de datos expuestos y semántica documentada.

Esta definición importa porque muchos equipos creen que "API pública" es solo `public class`. En realidad, un cambio en un mensaje de excepción parseado por consumidores, un orden de iteración documentado, o una validación más estricta puede romper clientes. Por eso hay que distinguir entre detalle interno accidentalmente visible y contrato deliberado. Lo interno puede cambiar con libertad; lo público requiere estrategia de evolución.

En `api-v1` definimos una superficie mínima:

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
    public String estado(String id) { return "PENDIENTE:" + id; }
}
```

Aquí la superficie pública es: interfaz `Repositorio`, su método `porId`, la clase `ServicioEnvio` y su método `estado(String)`. Si mañana cambias `estado(String)` por `estado(String, boolean)` sin mantener la firma anterior, rompes clientes.

### Tema 2: Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min

Compatibilidad de fuente significa que el código cliente compila nuevamente contra la nueva versión. Compatibilidad binaria significa que artefactos ya compilados —JARs, clases— siguen enlazando y ejecutando sin recompilar. Pueden fallar de formas distintas.

Por ejemplo, agregar una sobrecarga puede ser compatible de fuente en muchos casos, pero hay casos donde afecta resolución de métodos. Quitar un método rompe ambas. Cambiar un tipo de retorno puede romper binario aunque el fuente se adapte. Renombrar un método rompe ambos. Agregar un `default` a una interfaz suele ser compatible binaria y de fuente para implementadores, pero tiene matices con herencia múltiple de interfaces.

La razón práctica: en ecosistemas con dependencias transitivas, no todos recompilan al mismo tiempo. Una librería usada por plugins, agentes o aplicaciones empaquetadas puede requerir compatibilidad binaria. Por eso no basta con "mi proyecto compila".

En el módulo, `api-v2` mantiene `estado(String)` y agrega `estado(String, boolean)`. Un cliente compilado contra v1 puede seguir llamando `estado(String)` si el bytecode de esa firma sigue existiendo.

### Tema 3: Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min

Evolucionar una API pública es gestionar el cambio en el tiempo. Dos herramientas comunes son los métodos `default` en interfaces y la deprecación.

Un método `default` permite agregar comportamiento a una interfaz sin obligar a todas las implementaciones existentes a recompilarse y modificar su código. Antes de Java 8, agregar un método a una interfaz rompía implementadores. Con `default`, la interfaz provee implementación por defecto. Debe usarse con cuidado: el default tiene que ser semánticamente correcto para implementaciones existentes, y puede generar conflictos de herencia múltiple (`implements A, B` con el mismo default).

`@Deprecated` marca un elemento como obsoleto. No lo elimina; avisa. La buena deprecación incluye desde qué versión (`since`), si está planeado para retiro (`forRemoval`), y qué alternativa usar en Javadoc. Deprecar sin camino de migración solo genera ruido. Retirar requiere un ciclo: deprecar, dar tiempo, comunicar, retirar en versión mayor.

#### `api-v2/src/main/java/com/aurora/api/Repositorio.java`

```java
package com.aurora.api;

public interface Repositorio<T> {
    T porId(String id);
    default String tipo() { return "generico"; } // método default: evolución compatible
}
```

#### `api-v2/src/main/java/com/aurora/api/ServicioEnvio.java`

```java
package com.aurora.api;

public class ServicioEnvio {
    /** @deprecated Use {@link #estado(String, boolean)}. Se mantiene para compatibilidad binaria/fuente. */
    @Deprecated(since = "2.0", forRemoval = false)
    public String estado(String id) { return estado(id, false); }

    public String estado(String id, boolean detallado) {
        return detallado ? "PENDIENTE:" + id + ":detalle" : "PENDIENTE:" + id;
    }
}
```

La firma antigua sigue existiendo. Eso preserva compatibilidad. El nuevo método cubre la necesidad nueva. `forRemoval=false` indica que no hay retiro inmediato; en una versión mayor futura podría pasar a `true`.

### Tema 4: Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 45 min

Cuando escribes código con genéricos, el compilador usa los tipos como `String` o `Integer` para verificar errores en tiempo de compilación. Pero al generar el bytecode, Java aplica *type erasure*: borra los parámetros genéricos y los reemplaza por sus límites (normalmente `Object`) o por el tipo concreto indicado. Esto existe por compatibilidad con código Java anterior a los genéricos.

El problema aparece en la superficie pública cuando una subclase concreta sobrescribe un método genérico. Después del borrado, la firma del método en la clase padre puede quedar como `Object porId(String)`, mientras que la subclase implementa `String porId(String)`. Para que el polimorfismo siga funcionando —que una llamada a través de la referencia base ejecute el método correcto— el compilador genera un **método puente (bridge method)**. Ese método puente tiene la firma borrada, es sintético, y dentro delega al método concreto, haciendo el cast necesario.

Esto importa en APIs públicas porque la presencia de bridge methods afecta reflexión, generación de proxies, frameworks que inspeccionan métodos declarados, y verificadores de compatibilidad binaria. Cambiar tipos genéricos en una clase o interfaz pública puede agregar, quitar o alterar bridge methods, rompiendo consumidores ya compilados aunque el código fuente "parezca" igual.

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

El test verifica el bridge method con reflexión:

```java
boolean hayBridge = Arrays.stream(RepositorioTexto.class.getDeclaredMethods())
        .anyMatch(m -> m.getName().equals("porId") && m.isBridge());
assertTrue(hayBridge, "se espera bridge method por erasure");
```

En la ejecución verificada, ese test pasó. Es evidencia real de que el compilador generó el método sintético.

### Tema 5: Verificar la compatibilidad en el build, no de memoria · Intermedio · 40 min

La compatibilidad no se “recuerda”, se verifica. El mínimo verificable es tener tests que ejerciten la firma antigua, la nueva y los casos de evolución. En equipos con librerías publicadas, se suman herramientas como japicmp o Revapi, que comparan dos versiones de JAR y reportan cambios binarios/fuente incompatibles.

En este módulo la verificación es ejecutable con JUnit: se llama al método deprecado, se usa el `default` method, y se inspecciona el bridge method. En un pipeline real, agregarías japicmp/Revapi como tarea Gradle/Maven que falle el build ante rupturas no autorizadas.

#### `app/src/main/java/com/aurora/app/App.java`

```java
package com.aurora.app;

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
import java.lang.reflect.Modifier;
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
}
```

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m21` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q :app:classes
java -cp app/build/classes/java/main:api-v2/build/classes/java/main com.aurora.app.App
```

`./gradlew -q test`: **3 tests, 0 fallas**.

Salida real de `App`:

```text
LEGACY=PENDIENTE:A1
NUEVO=PENDIENTE:A1:detalle
REPO=TXT:A1
TIPO=generico
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `NoSuchMethodError` en runtime | Se eliminó/cambió firma usada por binarios ya compilados | Revisar cambios de firma; ejecutar japicmp | Mantener sobrecarga antigua, deprecar, retirar en mayor |
| Código cliente no compila tras actualizar | Ruptura de fuente | Compilar cliente contra nueva versión | Documentar migración; ofrecer compatibilidad temporal |
| Conflicto de `default` methods | Dos interfaces proveen mismo default | Error de compilación en implementador | Sobrescribir explícitamente en la clase implementadora |
| Framework falla al inspeccionar métodos | Bridge/synthetic methods inesperados | Inspección por reflexión | Filtrar `isBridge()`/`isSynthetic()` según el caso |
| Deprecación ignorada | Sin mensaje ni alternativa | Revisar Javadoc/warnings | `@Deprecated(since, forRemoval)` + Javadoc con reemplazo |

## Checklist de cierre

- [ ] Puedo identificar la superficie pública real de un módulo.
- [ ] Distingo compatibilidad binaria de fuente.
- [ ] Sé usar `default` y `@Deprecated` con criterio.
- [ ] Entiendo por qué el erasure genera bridge methods.
- [ ] Verifico compatibilidad con tests/herramientas, no de memoria.

Siguiente paso natural: **Módulo 22 — El objeto por dentro: copia, enums y tipos anidados**, donde se baja al comportamiento real de objetos, copia, enums y clases anidadas.
