# Módulo 22: Fundamentos avanzados de objetos

Este módulo cierra Java con fundamentos de objetos que suelen causar bugs sutiles: copia defensiva vs superficial vs clone, enums ricos de dominio y clases anidadas con captura de `this$0`. Dominar esto evita fugas de mutabilidad, modelos pobres y memory leaks inesperados.

**Contexto Tienda Aurora.** Este módulo aporta bases para Tienda Aurora: los conceptos aquí se aplican en el monolito modular y luego en los microservicios.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2.

## Aprende construyendo

## Proyecto desde cero: tienda-aurora-java-m22

## Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

## Estructura del proyecto

```text
tienda-aurora-java-m22/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/com/aurora/java/
            └── Main.java
```

## build.gradle.kts

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass.set("com.aurora.java.Main")
}

repositories {
    mavenCentral()
}
```

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-java-m22"
```

## Ejecutar

```bash
./gradlew run
# O directamente:
mkdir -p out
javac -d out src/main/java/com/aurora/java/**/*.java
java -cp out com.aurora.java.Main
```

### Tema 1: Copia defensiva, copia superficial y clone · Intermedio · 40 min

**Caso guía.** un pedido expone su lista de items; si devuelves la lista interna mutable, el llamador rompe invariantes.

Copia defensiva

**Definición.** Copia defensiva es crear copias de objetos mutables al entrar o salir de una frontera para proteger invariantes internos.

**Diagrama (diagram-design, estático):** [Copia defensiva: proteger el estado interno](/visuals/temas/java/modulo-22-copia-defensiva.html)

Lectura: no expongas la colección mutable interna. Devuelve copia o vista inmutable para preservar invariantes.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m22-def
cd java-m22-def
```

Crea el archivo `DemoDef.java`:

```java
import java.util.*;
class Pedido {
  private final List<String> items;
  Pedido(List<String> items){ this.items = new ArrayList<>(items); }
  List<String> items(){ return List.copyOf(items); }
}
public class DemoDef {
  public static void main(String[] args) {
    Pedido p = new Pedido(new ArrayList<>(List.of("A")));
    System.out.println(p.items());
    try { p.items().add("B"); } catch (UnsupportedOperationException e) { System.out.println("protegido"); }
  }
}
```

```bash
javac DemoDef.java
java DemoDef
```

**Error común.** Devolver la colección mutable interna. Corrección: `List.copyOf`/copia defensiva.

**Verificación (JDK 27, 2026-05-22).** `[A]`, `protegido`.

Shallow vs deep copy y `clone`

**Definición.** Shallow copy copia referencias de objetos anidados; deep copy copia también la estructura anidada. `clone()` es el mecanismo histórico de Java, con muchas trampas (Cloneable, casting, shallow por defecto).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m22-clone
cd java-m22-clone
```

Crea el archivo `DemoClone.java`:

```java
import java.util.*;
class Caja implements Cloneable {
  List<String> items = new ArrayList<>(List.of("A"));
  public Caja clone() { try { return (Caja) super.clone(); } catch (CloneNotSupportedException e) { throw new AssertionError(e); } }
}
public class DemoClone {
  public static void main(String[] args) {
    Caja a = new Caja();
    Caja b = a.clone(); // shallow
    b.items.add("B");
    System.out.println(a.items);
  }
}
```

```bash
javac DemoClone.java
java DemoClone
```

**Error común.** Asumir que `clone()` hace deep copy. Síntoma: mutación compartida. Corrección: copiar explícitamente campos mutables o preferir constructores/factorías de copia.

**Verificación (JDK 27, 2026-05-22).** `[A, B]` (prueba de shallow copy).

### Tema 2: Enums de dominio: estado, código y comportamiento · Intermedio · 45 min

**Caso guía.** estados de pedido con transición válida y código.

Enum rico

**Definición.** Un `enum` define un conjunto cerrado de constantes. Puede llevar campos, constructor y métodos para modelar comportamiento de dominio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m22-enum
cd java-m22-enum
```

Crea el archivo `DemoEnum.java`:

```java
enum Estado {
  CREADO(1), PAGADO(2), ENVIADO(3);
  final int code;
  Estado(int c){ code=c; }
  boolean puedeEnviar(){ return this == PAGADO; }
}
public class DemoEnum {
  public static void main(String[] args) {
    System.out.println(Estado.PAGADO.puedeEnviar());
    System.out.println(Estado.CREADO.puedeEnviar());
  }
}
```

```bash
javac DemoEnum.java
java DemoEnum
```

**Error común.** Usar strings sueltos para estados cerrados. Corrección: enum con comportamiento/invariantes.

**Verificación (JDK 27, 2026-05-22).** `true`, `false`.

### Tema 3: Clases anidadas, this$0 y la referencia que retiene · Avanzado · 45 min

**Caso guía.** una inner class no estática captura referencia a la instancia externa, lo que puede impedir GC.

Clases anidadas

**Definición.** Java tiene static nested classes, inner classes, local classes y anonymous classes. Las inner no estáticas capturan `this` de la clase externa (`this$0`).

**Diagrama (diagram-design, estático):** [Clases anidadas: quién captura this$0](/visuals/temas/java/modulo-22-clases-anidadas.html)

Lectura: la inner no estática captura `this$0`; la static nested no. Esto impacta GC, serialización y acoplamiento.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m22-nested
cd java-m22-nested
```

Crea el archivo `DemoNested.java`:

```java
class Outer {
  private String v = "ok";
  class Inner { String read(){ return v; } }
  static class StaticNested { String hi(){ return "static"; } }
}
public class DemoNested {
  public static void main(String[] args) {
    System.out.println(new Outer().new Inner().read());
    System.out.println(new Outer.StaticNested().hi());
  }
}
```

```bash
javac DemoNested.java
java DemoNested
```

**Error común.** Usar inner class en listeners/callbacks de larga vida que retienen la actividad/objeto externo. Corrección: static nested + referencia explícita débil o contexto mínimo.

**Verificación (JDK 27, 2026-05-22).** `ok`, `static`.

## Cierre

La corrección de objetos no termina en “usar clases”: mutabilidad, copia, enums y anidamiento determinan seguridad y mantenibilidad.

## Checklist

- Protejo invariantes con copia defensiva/inmutabilidad.
- Distingo shallow vs deep copy; evito `clone` por defecto.
- Uso enums para estados cerrados.
- Prefiero static nested cuando no necesito capturar `this$0`.
