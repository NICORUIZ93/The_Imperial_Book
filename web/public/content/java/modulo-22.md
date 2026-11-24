# Módulo 22: El objeto por dentro — copia, enums y tipos anidados

Un objeto en Java no es solo “una instancia con campos”. Tiene identidad, estado, reglas de mutabilidad, relaciones con otros objetos y un ciclo de vida dentro del runtime. Muchos bugs de producción no vienen de algoritmos complicados, sino de asumir que copiar un objeto copia todo, que `equals` basta para un `HashSet`, que un enum es solo una constante, o que una clase anidada es solo organización visual.

En este módulo vas a construir `tienda-aurora-java-m22`, un proyecto pequeño donde cada concepto se ve con comportamiento observable: copia defensiva, igualdad y claves hash, copia superficial frente a profunda, enums con estado/comportamiento y transiciones exhaustivas, y las cuatro formas de clases anidadas con `this$0` inspeccionado con `javap`.

## Prerrequisitos y bootstrap

```bash
java -version
javac -version
javap -version
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

## Visual del módulo

**Visual:** [Copia defensiva: proteger el estado interno](/visuals/temas/java/modulo-22-copia-defensiva.html)

Lectura: devolver la referencia interna permite que el llamador rompa el invariante; copiar al entrar y al salir lo conserva.

**Visual:** [Clases anidadas: quién captura `this$0`](/visuals/temas/java/modulo-22-clases-anidadas.html)

Lectura: una inner no estática conserva la referencia a la instancia exterior; eso explica fugas de memoria y errores de creación sin instancia.

## Código completo del proyecto

#### `Direccion.java`

```java
package com.aurora.obj;

import java.util.Objects;

public final class Direccion {
    private final String ciudad;
    public Direccion(String ciudad) { this.ciudad = ciudad; }
    public String ciudad() { return ciudad; }

    @Override
    public boolean equals(Object o) {
        return o instanceof Direccion d && Objects.equals(ciudad, d.ciudad);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ciudad);
    }

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

#### `SinHashCode.java`

```java
package com.aurora.obj;

import java.util.Objects;

/** MAL EJEMPLO deliberado: igualdad sin hashCode rompe la deduplicación en HashSet. */
@SuppressWarnings("overrides") // único sitio donde se tolera el aviso: es el contraejemplo
public final class SinHashCode {
    private final String id;

    public SinHashCode(String id) { this.id = id; }

    @Override
    public boolean equals(Object o) {
        return o instanceof SinHashCode otro && Objects.equals(id, otro.id);
    }
    // No se sobrescribe hashCode: dos objetos equals pueden caer en cubos distintos.
}
```

#### `ClaveMutable.java`

```java
package com.aurora.obj;

/** MAL EJEMPLO deliberado: hashCode depende de estado mutable. */
public final class ClaveMutable {
    private String valor;

    public ClaveMutable(String valor) { this.valor = valor; }

    public void setValor(String valor) { this.valor = valor; }

    @Override
    public boolean equals(Object o) {
        return o instanceof ClaveMutable otra && valor.equals(otra.valor);
    }

    @Override
    public int hashCode() {
        return valor.hashCode();
    }

    @Override
    public String toString() {
        return valor;
    }
}
```

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
    // MAL EJEMPLO: devuelve la lista interna mutable; en código real usar List.copyOf(tags).
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

`Perfil.tags()` y `direccion()` están marcados como mal ejemplo: este proyecto los expone a propósito para observar el efecto de la copia superficial. En código de producción, devuelve `List.copyOf(tags)` y una copia de `direccion`, o modela el agregado como inmutable desde el inicio.

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
    },
    FALLIDO(3) {
        @Override public EstadoEnvio siguiente() { return FALLIDO; }
    };

    private final int codigo;
    EstadoEnvio(int codigo) { this.codigo = codigo; }
    public int codigo() { return codigo; }
    public abstract EstadoEnvio siguiente();
}
```

#### `Transiciones.java`

```java
package com.aurora.obj;

/** Switch exhaustivo sobre el enum: sin default, el compilador exige cada constante. */
public final class Transiciones {
    private Transiciones() {}

    public static String ruta(EstadoEnvio estado) {
        return switch (estado) {
            case PENDIENTE -> "PENDIENTE->EN_RUTA";
            case EN_RUTA -> "EN_RUTA->ENTREGADO";
            case ENTREGADO -> "ENTREGADO";
            case FALLIDO -> "FALLIDO";
        };
    }
}
```

#### `Contenedor.java`

```java
package com.aurora.obj;

public class Contenedor {
    // No es constante de compilación: la inner debe retener la instancia exterior para leerlo.
    private final String prefijo;

    public Contenedor() { this("AURORA"); }
    public Contenedor(String prefijo) { this.prefijo = prefijo; }

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

`prefijo` no es una constante de compilación: se asigna en el constructor. Por eso la inner necesita retener la instancia exterior para leerlo. Si fuera `private static final String prefijo = "AURORA"`, el compilador podría inlinearlo y `this$0` desaparecería; aquí se conserva para que la retención sea observable.

#### `App.java`

```java
package com.aurora.obj;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class App {
    public static void main(String[] args) {
        List<String> tags = new ArrayList<>(List.of("vip"));
        ClienteInmutable c = new ClienteInmutable("C1", new Direccion("BOG"), tags);
        tags.add("hack");
        System.out.println("TAGS=" + c.tags());

        SinHashCode x = new SinHashCode("X");
        SinHashCode y = new SinHashCode("X");
        Set<SinHashCode> sinHash = new HashSet<>();
        sinHash.add(x);
        sinHash.add(y);
        System.out.println("IGUALES=" + x.equals(y));
        System.out.println("HASHSET_SIN=" + sinHash.size());
        System.out.println("HASHSET_CON=" + new HashSet<>(List.of(new Direccion("BOG"), new Direccion("BOG"))).size());

        ClaveMutable clave = new ClaveMutable("A");
        Map<ClaveMutable, String> mapa = new HashMap<>();
        mapa.put(clave, "valor");
        System.out.println("CLAVE_ANTES=" + mapa.get(new ClaveMutable("A")));
        clave.setValor("B");
        System.out.println("CLAVE_DESPUES=" + mapa.get(new ClaveMutable("B")));
        System.out.println("CLAVE_ITER=" + mapa);

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
        System.out.println("RUTA=" + Transiciones.ruta(EstadoEnvio.PENDIENTE));

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
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
        assertEquals("MED", shallow.direccion().ciudad()); // comparte referencia
        assertEquals("BOG", deep.direccion().ciudad());
        assertEquals(2, shallow.tags().size());
        assertEquals(1, deep.tags().size());
    }

    @Test
    void enumConComportamiento() {
        assertEquals(EstadoEnvio.EN_RUTA, EstadoEnvio.PENDIENTE.siguiente());
        assertEquals(2, EstadoEnvio.ENTREGADO.codigo());
        assertEquals(EstadoEnvio.ENTREGADO, EstadoEnvio.ENTREGADO.siguiente());
        assertEquals(EstadoEnvio.ENTREGADO, EstadoEnvio.EN_RUTA.siguiente().siguiente());
        assertEquals(3, EstadoEnvio.FALLIDO.codigo());
        assertEquals("PENDIENTE->EN_RUTA", Transiciones.ruta(EstadoEnvio.PENDIENTE));
    }

    @Test
    void igualdadYHashSet() {
        SinHashCode a = new SinHashCode("X");
        SinHashCode b = new SinHashCode("X");
        assertTrue(a.equals(b));
        Set<SinHashCode> sinHash = new HashSet<>();
        sinHash.add(a);
        sinHash.add(b);
        assertEquals(2, sinHash.size()); // equals sin hashCode no deduplica
        Set<Direccion> conHash = new HashSet<>(
                List.of(new Direccion("BOG"), new Direccion("BOG")));
        assertEquals(1, conHash.size());
    }

    @Test
    void claveMutablePierdeEntradaEnHashMap() {
        ClaveMutable clave = new ClaveMutable("A");
        Map<ClaveMutable, String> mapa = new HashMap<>();
        mapa.put(clave, "valor");
        assertEquals("valor", mapa.get(new ClaveMutable("A")));
        clave.setValor("B");
        assertNull(mapa.get(new ClaveMutable("B")));
        assertTrue(mapa.entrySet().stream().anyMatch(e -> e.getKey() == clave)); // sigue en el bucket, inalcanzable por clave nueva
    }

    @Test
    void innerCapturaThis0YStaticNestedNo() {
        boolean inner = Arrays.stream(Contenedor.Interna.class.getDeclaredFields())
                .anyMatch(f -> f.getName().equals("this$0"));
        boolean estatica = Arrays.stream(Contenedor.Estatica.class.getDeclaredFields())
                .anyMatch(f -> f.getName().equals("this$0"));
        assertTrue(inner);
        assertFalse(estatica);
    }

    @Test
    void clasesAnidadas() {
        Contenedor c = new Contenedor();
        assertEquals("ID-1", new Contenedor.Estatica().id(1));
        assertEquals("AURORA:X", c.new Interna().etiqueta("X"));
    }
}
```

## Los 3 temas del módulo

### Tema 1: Copia defensiva, igualdad y claves de hash · Intermedio · 60 min

La copia defensiva protege el estado interno cuando recibes o expones objetos mutables. Guardar la `List` que te pasaron sin copiarla permite que el llamador la modifique después del constructor; devolver la lista interna permite que el consumidor altere el objeto sin pasar por su API. `ClienteInmutable` copia al entrar (`new ArrayList<>(tags)`, `new Direccion(...)`) y al salir (`List.copyOf(tags)`, nueva `Direccion`). Salida verificada: `TAGS=[vip]` aunque el llamador agregó `"hack"` a la lista original.

La igualdad es la otra mitad del contrato de un objeto de valor. `Direccion` sobrescribe `equals` **y** `hashCode` con los mismos campos: dos direcciones iguales caen en el mismo cubo y `new HashSet<>(List.of(new Direccion("BOG"), new Direccion("BOG"))).size()` es `1`. `SinHashCode` es el mal ejemplo deliberado: `equals` dice que dos instancias con `"X"` son iguales, pero al no sobrescribir `hashCode` probablemente caen en cubos distintos. Salida verificada: `IGUALES=true`, `HASHSET_SIN=2`, `HASHSET_CON=1`. Con `-Xlint:all -Werror`, javac avisa de este descuido; el contraejemplo lleva `@SuppressWarnings("overrides")` en el único sitio donde se tolera.

Una clave de `HashMap` debe ser inmutable. `ClaveMutable` calcula `hashCode` desde `valor`, que cambia con `setValor`: al mutarla después de `put`, la entrada sigue en el mapa pero ya no se encuentra por clave equivalente. Salidas verificadas: `CLAVE_ANTES=valor`, `CLAVE_DESPUES=null`, `CLAVE_ITER={B=valor}`. El `toString()` del mapa muestra el nuevo valor de la clave porque la entrada conserva la misma referencia; `get(new ClaveMutable("B"))` devuelve `null` porque busca otro cubo. Regla práctica: usa claves inmutables —`String`, `record` con componentes inmutables, enum, o una clase con `equals`/`hashCode` sobre campos finales—.

### Tema 2: Copia superficial, profunda, enums y switch exhaustivo · Intermedio · 55 min

Copiar un objeto con referencias mutables obliga a elegir. Una copia superficial copia campos: si el campo es una referencia, copia la referencia. Una copia profunda copia también los objetos alcanzados. `Perfil.clone()` es superficial y comparte `DireccionMutable` y `List`; `Perfil.deepCopy()` crea otra dirección y otra lista. Salidas verificadas: `SHALLOW_DIR=MED`, `DEEP_DIR=BOG`, `SHALLOW_TAGS=2`, `DEEP_TAGS=1`.

`clone()` es el mecanismo histórico y tiene limitaciones reales: requiere `Cloneable`, `Object.clone()` hace shallow copy por defecto, obliga a manejar `CloneNotSupportedException` y su contrato es confuso. En código moderno prefiere constructores de copia, factories explícitas `copy()` o inmutabilidad. `Perfil.tags()` y `Perfil.direccion()` están marcados como mal ejemplo: exponen la referencia interna a propósito para observar el aliasing.

Un `enum` da seguridad de tipo y permite estado/comportamiento por constante. `EstadoEnvio` guarda un `codigo` estable y define `siguiente()` por constante. Salidas verificadas: `ENUM=EN_RUTA`, `CODIGO=2`, `RUTA=PENDIENTE->EN_RUTA`. `Transiciones.ruta` usa un switch expression sin `default`: el compilador exige las cuatro constantes. Para demostrarlo se compiló una variante con una quinta constante `CANCELADO` y el compilador respondió `the switch expression does not cover all possible input values`, con `missing patterns: EstadoEnvio.CANCELADO`. Guardar el enum por su `ordinal()` sería frágil: reordenar constantes cambiaría el valor persistido; el `codigo()` explícito es parte del contrato.

### Tema 3: Clases anidadas, `this$0` y retención · Intermedio · 50 min

Java tiene cuatro formas de clases anidadas. La diferencia que importa en memoria es si capturan la instancia exterior:

- **Static nested class**: no captura instancia externa; es una clase normal con namespace.
- **Inner class**: no estática; conserva una referencia implícita `this$0` a la instancia exterior.
- **Local class**: declarada dentro de un método o bloque; puede capturar variables efectivamente finales.
- **Anonymous class**: local sin nombre, usada en el punto de consumo.

`Contenedor` tiene las cuatro formas. Salidas verificadas: `STATIC=ID-7`, `INNER=AURORA:X`, `LOCAL=AURORA:L`, `ANON=AURORA:A`. La inner y las clases local/anónima leen `prefijo` de la instancia exterior; la static nested no podría hacerlo sin una referencia explícita.

`javap` confirma la retención:

```text
Compiled from "Contenedor.java"
public class com.aurora.obj.Contenedor$Interna {
  final com.aurora.obj.Contenedor this$0;
  public com.aurora.obj.Contenedor$Interna(com.aurora.obj.Contenedor);
  public java.lang.String etiqueta(java.lang.String);
}
```

La static nested no tiene ese campo:

```text
Compiled from "Contenedor.java"
public class com.aurora.obj.Contenedor$Estatica {
  public com.aurora.obj.Contenedor$Estatica();
  public java.lang.String id(int);
}
```

Y el constructor de la inner lo asigna con `putfield` (`javap -c -p` completo):

```text
Compiled from "Contenedor.java"
public class com.aurora.obj.Contenedor$Interna {
  final com.aurora.obj.Contenedor this$0;

  public com.aurora.obj.Contenedor$Interna(com.aurora.obj.Contenedor);
    Code:
         0: aload_0
         1: aload_1
         2: dup
         3: invokestatic  #1                  // Method java/util/Objects.requireNonNull:(Ljava/lang/Object;)Ljava/lang/Object;
         6: pop
         7: putfield      #7                  // Field this$0:Lcom/aurora/obj/Contenedor;
        10: aload_0
        11: invokespecial #13                 // Method java/lang/Object."<init>":()V
        14: return

  public java.lang.String etiqueta(java.lang.String);
    Code:
         0: aload_0
         1: getfield      #7                  // Field this$0:Lcom/aurora/obj/Contenedor;
         4: getfield      #19                 // Field com/aurora/obj/Contenedor.prefijo:Ljava/lang/String;
         7: aload_1
         8: invokedynamic #25,  0             // InvokeDynamic #0:makeConcatWithConstants:(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
        13: areturn
}
```

Consecuencias prácticas: una inner class mantiene viva la instancia exterior mientras viva, lo que importa en callbacks, listeners y tareas diferidas; además, no puedes crearla sin una instancia exterior. El test `innerCapturaThis0YStaticNestedNo` comprueba por reflexión que `this$0` existe en `Interna` y no en `Estatica`.

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m22` (macOS arm64, JDK 27.0.1.0.2 con toolchain Java 25, Gradle 9.9.1):

```bash
./gradlew -q test
./gradlew -q run
javap -p -cp build/classes/java/main 'com.aurora.obj.Contenedor$Interna'
javap -p -cp build/classes/java/main 'com.aurora.obj.Contenedor$Estatica'
javap -c -p -cp build/classes/java/main 'com.aurora.obj.Contenedor$Interna'
javac -cp build/classes/java/main -d verif/out verif/sin-instancia/com/aurora/obj/ErrorInner.java
javac -d verif/out verif/switch-incompleto/com/aurora/obj/*.java
```

`./gradlew -q test`: **7 tests, 0 fallas** (`build/test-results/test/TEST-com.aurora.obj.ObjetoTest.xml`).

Salida real de `./gradlew -q run`:

```text
TAGS=[vip]
IGUALES=true
HASHSET_SIN=2
HASHSET_CON=1
CLAVE_ANTES=valor
CLAVE_DESPUES=null
CLAVE_ITER={B=valor}
SHALLOW_DIR=MED
DEEP_DIR=BOG
SHALLOW_TAGS=2
DEEP_TAGS=1
ENUM=EN_RUTA
CODIGO=2
RUTA=PENDIENTE->EN_RUTA
STATIC=ID-7
INNER=AURORA:X
LOCAL=AURORA:L
ANON=AURORA:A
```

Las dos verificaciones de compilación usaron estos archivos temporales:

#### `verif/sin-instancia/com/aurora/obj/ErrorInner.java`

```java
package com.aurora.obj;
public class ErrorInner {
    Contenedor.Interna i = new Contenedor.Interna();
}
```

Salida real de `javac -cp build/classes/java/main -d verif/out verif/sin-instancia/com/aurora/obj/ErrorInner.java`:

```text
verif/sin-instancia/com/aurora/obj/ErrorInner.java:3: error: an enclosing instance that contains Contenedor.Interna is required
    Contenedor.Interna i = new Contenedor.Interna();
                           ^
1 error
```

#### `verif/switch-incompleto/com/aurora/obj/EstadoEnvio.java`

```java
package com.aurora.obj;
public enum EstadoEnvio {
    PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO, CANCELADO
}
```

Se copió `Transiciones.java` del proyecto a ese directorio y se compilaron los tres fuentes. Salida real de `javac -d verif/out verif/switch-incompleto/com/aurora/obj/*.java`:

```text
verif/switch-incompleto/com/aurora/obj/Transiciones.java:8: error: the switch expression does not cover all possible input values
        return switch (estado) {
               ^
  missing patterns:
      EstadoEnvio.CANCELADO
1 error
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Estado interno cambia desde afuera | Falta copia defensiva en entrada/salida | Revisar getters/constructores con objetos mutables | Copiar al entrar; exponer copia o vista inmutable |
| `HashSet` no deduplica objetos “iguales” | `equals` sin `hashCode` | Comparar `equals` y `size()` del set | Sobrescribir ambos con los mismos campos |
| Entrada de `HashMap` desaparece tras mutar clave | `hashCode` depende de estado mutable | `get` con clave equivalente devuelve `null`; `entrySet()` la muestra | Claves inmutables: `String`, record inmutable, enum |
| `clone()` copia “a medias” | Shallow copy por defecto | Modificar objeto anidado y ver efecto en copia | Deep copy explícita, constructor de copia o rediseño inmutable |
| Enum usado como int/string mágico | No modelar dominio con tipo | Revisar validaciones y switches dispersos | Enum con campos/métodos; persistir `codigo()`, no `ordinal()` |
| Switch no cubre un estado nuevo | Se añadió una constante sin actualizar el switch | Error del compilador con `missing patterns` | Mantener switch exhaustivo sin `default` |
| Fuga de memoria con inner class | Inner retiene `this$0` | `javap -p` o heap dump | Usar static nested class si no necesita instancia exterior |
| `an enclosing instance ... is required` | Crear inner sin instancia exterior | Revisar `new Contenedor.Interna()` | `cont.new Interna()` o hacerla `static` |
| `UnsupportedOperationException` al mutar lista devuelta | Getter devuelve `List.copyOf`/`unmodifiable` | Leer contrato del getter | Mutar a través de la API del objeto, no de la vista |

## Checklist de cierre

- [ ] Aplico copia defensiva donde el invariante importa y conozco su costo.
- [ ] `equals` y `hashCode` usan los mismos campos y se prueban en un `HashSet`.
- [ ] Ninguna clave de `HashMap` depende de estado mutable.
- [ ] Distingo copia superficial, profunda y limitaciones de `clone()`.
- [ ] Modelo transiciones con enum y switch exhaustivo sin `default`.
- [ ] Sé cuándo una clase anidada debe ser `static` y cómo detectar `this$0` con `javap`.
- [ ] Probé el comportamiento con ejecución real y errores de compilación reproducidos.

Siguiente paso natural: cerrar el recorrido de Java con una auditoría final del contrato público, la semántica de objetos y la verificación ejecutada en cada módulo.
