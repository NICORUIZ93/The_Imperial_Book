# Módulo 22: El objeto por dentro — copia, enums y tipos anidados

Un objeto en Java no es solo "una instancia con campos". Tiene identidad, estado, reglas de mutabilidad, relaciones con otros objetos y un ciclo de vida dentro del runtime. Muchos bugs de producción no vienen de algoritmos complicados, sino de asumir que copiar un objeto copia todo, que un enum es solo una constante, o que una clase anidada es solo organización visual.

En este módulo vas a construir `tienda-aurora-java-m22`, un proyecto pequeño donde cada concepto se ve con comportamiento observable: copia defensiva que protege invariantes, copia superficial vs profunda, enums con estado y comportamiento, y los cuatro tipos de clases anidadas.

## Prerrequisitos y bootstrap

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m22/src/main/java/com/aurora/obj
mkdir -p tienda-aurora-java-m22/src/test/java/com/aurora/obj
cd tienda-aurora-java-m22
gradle wrapper --gradle-version 9.9.1
```

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m22"
```

#### `build.gradle.kts`

```kotlin
plugins { java; application }
group = "com.aurora"; version = "1.0.0"
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
repositories { mavenCentral() }
dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
application { mainClass = "com.aurora.obj.App" }
tasks.test { useJUnitPlatform(); testLogging { events("passed","skipped","failed") } }
tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all","-Xlint:-processing","-Werror"))
}
```

### Tema 1: Copia defensiva para proteger invariantes · Intermedio · 40 min

La copia defensiva es una técnica para proteger el estado interno de un objeto cuando recibe o expone objetos mutables. Si tu clase guarda una `List` mutable que recibió desde afuera, el llamador puede seguir teniendo la referencia original y modificarla después del constructor. El objeto que parecía válido queda en un estado que nunca pasó por sus validaciones. Lo mismo ocurre al revés: si devuelves tu lista interna mutable, el consumidor puede alterarla sin pasar por la API.

La copia defensiva consiste en crear una copia al entrar (constructor/setter) y otra copia o vista inmutable al salir (getter). No es gratuita: tiene costo de memoria y CPU. Por eso se aplica en fronteras donde el invariante importa. Una alternativa es diseñar con objetos inmutables desde el inicio, lo que reduce la necesidad de copias defensivas.

#### `Direccion.java`

```java
package com.aurora.obj;

public final class Direccion {
    private final String ciudad;
    public Direccion(String ciudad) { this.ciudad = ciudad; }
    public String ciudad() { return ciudad; }
    @Override public String toString() { return ciudad; }
}
```

#### `ClienteInmutable.java`

```java
package com.aurora.obj;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class ClienteInmutable {
    private final String id;
    private final Direccion direccion;
    private final List<String> tags;

    public ClienteInmutable(String id, Direccion direccion, List<String> tags) {
        this.id = Objects.requireNonNull(id);
        this.direccion = new Direccion(Objects.requireNonNull(direccion).ciudad()); // copia defensiva entrada
        this.tags = new ArrayList<>(Objects.requireNonNull(tags)); // copia defensiva entrada
    }

    public String id() { return id; }
    public Direccion direccion() { return new Direccion(direccion.ciudad()); } // copia defensiva salida
    public List<String> tags() { return List.copyOf(tags); } // vista inmutable
}
```

La prueba verifica el caso de borde: modificar la lista original después de construir el cliente no cambia el estado interno, y la lista expuesta por `tags()` no permite mutación.

Salida verificada: `TAGS=[vip]` aunque el llamador agregó `"hack"` a la lista original.

### Tema 2: Copia superficial vs profunda y los problemas de clone() · Intermedio · 40 min

Copiar un objeto suena simple hasta que el objeto tiene referencias a otros objetos mutables. Una **copia superficial (shallow copy)** copia los campos del objeto, pero si un campo es una referencia, copia la referencia, no el objeto referenciado. El original y la copia quedan apuntando al mismo objeto interno. Una **copia profunda (deep copy)** también copia los objetos alcanzados, creando una estructura independiente.

`clone()` en Java es el mecanismo histórico para copia. Tiene varios problemas: requiere implementar `Cloneable` (una interfaz marcadora sin método clone público), `Object.clone()` hace shallow copy por defecto, obliga a manejar `CloneNotSupportedException`, y el contrato es confuso. En código moderno se prefiere copiar con constructores, factories estáticas, métodos `copy()` explícitos o records/inmutabilidad.

#### `DireccionMutable.java`

```java
package com.aurora.obj;

public class DireccionMutable implements Cloneable {
    private String ciudad;
    public DireccionMutable(String ciudad) { this.ciudad = ciudad; }
    public String ciudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    @Override public DireccionMutable clone() {
        try { return (DireccionMutable) super.clone(); }
        catch (CloneNotSupportedException e) { throw new AssertionError(e); }
    }
}
```

#### `Perfil.java`

```java
package com.aurora.obj;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Perfil implements Cloneable {
    private final String nombre;
    private DireccionMutable direccion;
    private final List<String> tags;

    public Perfil(String nombre, DireccionMutable direccion, List<String> tags) {
        this.nombre = Objects.requireNonNull(nombre);
        this.direccion = Objects.requireNonNull(direccion);
        this.tags = new ArrayList<>(Objects.requireNonNull(tags));
    }

    public String nombre() { return nombre; }
    public DireccionMutable direccion() { return direccion; }
    public List<String> tags() { return tags; }

    @Override
    public Perfil clone() { // shallow
        try { return (Perfil) super.clone(); }
        catch (CloneNotSupportedException e) { throw new AssertionError(e); }
    }

    public Perfil deepCopy() {
        return new Perfil(nombre, direccion.clone(), new ArrayList<>(tags));
    }
}
```

Salida verificada:

```text
SHALLOW_DIR=MED
DEEP_DIR=BOG
SHALLOW_TAGS=2
DEEP_TAGS=1
```

Modificar la dirección/tags del original afecta la copia superficial porque comparten referencias; la copia profunda queda independiente. Ese es el comportamiento que hay que anticipar antes de elegir el mecanismo.

### Tema 3: Enums, clases anidadas e inner: identidad, estado y captura · Intermedio · 45 min

#### Enums con comportamiento

Un `enum` en Java es más que una lista de constantes. Es un tipo con instancias fijas conocidas en compilación. Cada constante es un objeto único. Los enums pueden tener campos, constructores, métodos y hasta comportamiento específico por constante. Esto los hace útiles para modelar estados finitos, estrategias cerradas o valores de dominio con reglas asociadas.

A diferencia de constantes `int` o `String`, un enum da seguridad de tipo: no puedes pasar cualquier string donde se espera un estado. Además, `==` es seguro para comparar enums porque cada constante es singleton en la JVM.

#### `EstadoEnvio.java`

```java
package com.aurora.obj;

public enum EstadoEnvio {
    PENDIENTE(0) {
        @Override public EstadoEnvio siguiente() { return EN_RUTA; }
    },
    EN_RUTA(1) {
        @Override public EstadoEnvio siguiente() { return ENTREGADO; }
    },
    ENTREGADO(2) {
        @Override public EstadoEnvio siguiente() { return ENTREGADO; }
    };

    private final int codigo;
    EstadoEnvio(int codigo) { this.codigo = codigo; }
    public int codigo() { return codigo; }
    public abstract EstadoEnvio siguiente();
}
```

Salida verificada: `ENUM=EN_RUTA`, `CODIGO=2`. El enum encapsula transición de estado; el consumidor no hardcodea reglas de paso.

#### Clases anidadas e inner

Java tiene cuatro formas de clases anidadas. La diferencia importante es si capturan el estado de la instancia externa.

- **Static nested class**: declarada `static` dentro de otra clase. No captura instancia externa. Es como una clase normal con namespace.
- **Inner class**: no estática, ligada a una instancia externa. Puede acceder a campos de la instancia externa y mantiene una referencia implícita (`this$0`).
- **Local class**: declarada dentro de un método/bloque. Puede capturar variables locales efectivamente finales.
- **Anonymous class**: local sin nombre, usada para implementar una interfaz o extender una clase en el punto de uso.

#### `Contenedor.java`

```java
package com.aurora.obj;

public class Contenedor {
    private final String prefijo = "AURORA";

    public static class Estatica {
        public String id(int n) { return "ID-" + n; }
    }

    public class Interna {
        public String etiqueta(String s) { return prefijo + ":" + s; } // captura this externo
    }

    public Runnable crearRunnableLocal(String msg) {
        class Local implements Runnable {
            @Override public void run() { System.out.println("LOCAL=" + prefijo + ":" + msg); }
        }
        return new Local();
    }

    public Runnable crearRunnableAnonimo(String msg) {
        return new Runnable() {
            @Override public void run() { System.out.println("ANON=" + prefijo + ":" + msg); }
        };
    }
}
```

Salida verificada:

```text
STATIC=ID-7
INNER=AURORA:X
LOCAL=AURORA:L
ANON=AURORA:A
```

La inner class accede a `prefijo` de la instancia externa. La static nested no podría hacerlo sin una referencia explícita. Este detalle importa por memoria y por fugas: una inner class retiene la instancia externa mientras viva.

#### `App.java`

```java
package com.aurora.obj;

import java.util.ArrayList;
import java.util.List;

public final class App {
    public static void main(String[] args) {
        List<String> tags = new ArrayList<>(List.of("vip"));
        ClienteInmutable c = new ClienteInmutable("C1", new Direccion("BOG"), tags);
        tags.add("hack");
        System.out.println("TAGS=" + c.tags());

        Perfil p = new Perfil("Ana", new DireccionMutable("BOG"), new ArrayList<>(List.of("a")));
        Perfil shallow = p.clone();
        Perfil deep = p.deepCopy();
        p.direccion().setCiudad("MED");
        p.tags().add("b");
        System.out.println("SHALLOW_DIR=" + shallow.direccion().ciudad());
        System.out.println("DEEP_DIR=" + deep.direccion().ciudad());
        System.out.println("SHALLOW_TAGS=" + shallow.tags().size());
        System.out.println("DEEP_TAGS=" + deep.tags().size());

        System.out.println("ENUM=" + EstadoEnvio.PENDIENTE.siguiente().name());
        System.out.println("CODIGO=" + EstadoEnvio.ENTREGADO.codigo());

        Contenedor cont = new Contenedor();
        System.out.println("STATIC=" + new Contenedor.Estatica().id(7));
        System.out.println("INNER=" + cont.new Interna().etiqueta("X"));
        cont.crearRunnableLocal("L").run();
        cont.crearRunnableAnonimo("A").run();
    }
}
```

#### `ObjetoTest.java`

```java
package com.aurora.obj;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ObjetoTest {

    @Test
    void copiaDefensivaProtegeInvariantes() {
        List<String> tags = new ArrayList<>(List.of("vip"));
        ClienteInmutable c = new ClienteInmutable("C1", new Direccion("BOG"), tags);
        tags.add("externo");
        assertEquals(List.of("vip"), c.tags());
        assertThrows(UnsupportedOperationException.class, () -> c.tags().add("x"));
    }

    @Test
    void shallowVsDeep() {
        Perfil p = new Perfil("Ana", new DireccionMutable("BOG"), new ArrayList<>(List.of("a")));
        Perfil shallow = p.clone();
        Perfil deep = p.deepCopy();
        p.direccion().setCiudad("MED");
        p.tags().add("b");
        assertEquals("MED", shallow.direccion().ciudad());
        assertEquals("BOG", deep.direccion().ciudad());
        assertEquals(2, shallow.tags().size());
        assertEquals(1, deep.tags().size());
    }

    @Test
    void enumConComportamiento() {
        assertEquals(EstadoEnvio.EN_RUTA, EstadoEnvio.PENDIENTE.siguiente());
        assertEquals(2, EstadoEnvio.ENTREGADO.codigo());
        assertEquals(EstadoEnvio.ENTREGADO, EstadoEnvio.ENTREGADO.siguiente());
    }

    @Test
    void clasesAnidadas() {
        Contenedor c = new Contenedor();
        assertEquals("ID-1", new Contenedor.Estatica().id(1));
        assertEquals("AURORA:X", c.new Interna().etiqueta("X"));
    }
}
```

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m22` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

`./gradlew -q test`: **4 tests, 0 fallas**.

Salida real de `./gradlew -q run`:

```text
TAGS=[vip]
SHALLOW_DIR=MED
DEEP_DIR=BOG
SHALLOW_TAGS=2
DEEP_TAGS=1
ENUM=EN_RUTA
CODIGO=2
STATIC=ID-7
INNER=AURORA:X
LOCAL=AURORA:L
ANON=AURORA:A
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Estado interno cambia desde afuera | Falta copia defensiva en entrada/salida | Revisar getters/setters/constructores con objetos mutables | Copiar al entrar; exponer copia o vista inmutable |
| `clone()` copia “a medias” | Shallow copy por defecto | Modificar objeto anidado y ver efecto en copia | Deep copy explícita, constructor de copia o rediseño inmutable |
| Enum usado como int/string mágico | No modelar dominio con tipo | Revisar validaciones y switches dispersos | Enum con campos/métodos o sealed types según caso |
| Fuga de memoria con inner class | Inner retiene `this$0` | Heap dump, retención inesperada | Usar static nested class si no necesita instancia externa |
| `UnsupportedOperationException` al mutar lista devuelta | Getter devuelve `List.copyOf`/`unmodifiable` | Leer contrato del getter | Mutar a través de API del objeto, no de la vista |

## Checklist de cierre

- [ ] Sé cuándo aplicar copia defensiva y cuál es su costo.
- [ ] Distingo copia superficial, profunda y limitaciones de `clone()`.
- [ ] Puedo modelar comportamiento finito con enums.
- [ ] Distingo static nested, inner, local y anonymous classes.
- [ ] Probé el comportamiento con ejecución real.

Siguiente paso natural: volver a la deuda previa de Java (M0-M2, M8 y pulido/verificación de M3-M16) con el mismo estándar canónico y verificación ejecutada.
