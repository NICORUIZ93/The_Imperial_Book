# Módulo 21: Evolución de API y compatibilidad

Publicar una librería o módulo interno compartido crea una promesa: otros códigos dependen de tu superficie pública. Cambiarla sin criterio rompe compilaciones, binarios o comportamiento. Este módulo trata la evolución de APIs con compatibilidad fuente/binaria, deprecación, generics/erasure y verificación en build.

**Contexto Tienda Aurora.** Este módulo aporta bases para Tienda Aurora: los conceptos aquí se aplican en el monolito modular y luego en los microservicios.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2.

## Aprende construyendo

## Proyecto desde cero: tienda-aurora-java-m21

## Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

## Estructura del proyecto

```text
tienda-aurora-java-m21/
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
rootProject.name = "tienda-aurora-java-m21"
```

## Ejecutar

```bash
./gradlew run
# O directamente:
mkdir -p out
javac -d out src/main/java/com/aurora/java/**/*.java
java -cp out com.aurora.java.Main
```

### Tema 1: Qué es la superficie pública de una API · Básico · 40 min

**Caso guía.** una librería expone `public` y otros equipos la usan. Cualquier cambio en esa superficie tiene costo.

Superficie pública

**Definición.** La superficie pública incluye tipos, métodos, campos, constructores, firmas, excepciones declaradas, comportamiento observable y semántica documentada accesibles por consumidores.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m21-api
cd java-m21-api
```

Crea el archivo `Api.java`:

```java
public class Api { public static String greet(String name){ return "Hi " + name; } }
```

Crea el archivo `Main.java`:

```java
public class Main { public static void main(String[] args){ System.out.println(Api.greet("Ada")); } }
```

```bash
javac Api.java Main.java
java Main
```

**Error común.** Hacer `public` por conveniencia. Corrección: minimizar superficie; “public” es un compromiso.

**Verificación (JDK 27, 2026-05-22).** `Hi Ada`.

### Tema 2: Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min

**Caso guía.** recompilar clientes funciona, pero clientes ya compilados fallan; o al revés.

Source vs binary compatibility

**Definición.** Compatibilidad de fuente: el código cliente recompila. Compatibilidad binaria: artefactos ya compilados siguen enlazando/ejecutando sin recompilar.

**Diagrama (diagram-design, estático):** [Compatibilidad: fuente vs binaria](/visuals/temas/java/modulo-21-compatibilidad.html)

Lectura: compatibilidad binaria afecta bytecode ya compilado; compatibilidad de fuente afecta recompilar. Evalúa ambas antes de publicar un cambio.

**Ejemplo mínimo (conceptual ejecutable).** Agregar método con default en interfaz suele ser binario compatible; cambiar firma rompe ambos.

**Error común.** Asumir “si compila mi repo, no rompí nada”. Corrección: pruebas de compatibilidad binaria para librerías.

### Tema 3: Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min

**Caso guía.** agregar capacidad a una interfaz sin obligar a todos a implementar.

`default`, `@Deprecated`, `forRemoval`

**Definición.** Un método `default` en interfaz provee implementación. `@Deprecated` señala obsolescencia; `forRemoval` indica intención de retiro futuro.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m21-default
cd java-m21-default
```

Crea el archivo `DemoDefault.java`:

```java
interface Greeting { String hi(); default String hiLoud(){ return hi().toUpperCase(); } }
class G implements Greeting { public String hi(){ return "hola"; } }
public class DemoDefault { public static void main(String[] args){ System.out.println(new G().hiLoud()); } }
```

```bash
javac DemoDefault.java
java DemoDefault
```

**Error común.** Deprecar sin alternativa ni plan. Corrección: documentar reemplazo, versión y timeline.

**Verificación (JDK 27, 2026-05-22).** `HOLA`.

### Tema 4: Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 45 min

**Caso guía.** un override genérico genera bridge methods y puede afectar compatibilidad.

Erasure y bridge methods

**Definición.** Por type erasure, el compilador puede generar métodos puente (bridge) para preservar polimorfismo con genéricos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m21-bridge
cd java-m21-bridge
```

Crea el archivo `DemoBridge.java`:

```java
class Box<T> { T get(){ return null; } }
class SBox extends Box<String> { @Override String get(){ return "s"; } }
public class DemoBridge {
  public static void main(String[] args) {
    for (var m : SBox.class.getDeclaredMethods()) System.out.println(m.getName());
  }
}
```

```bash
javac DemoBridge.java
java DemoBridge
```

**Error común.** Cambiar tipos genéricos en API pública sin analizar erasure. Corrección: pruebas de compatibilidad y conocimiento de firmas borradas.

**Verificación (JDK 27, 2026-05-22).** Salida incluye `get` (puede aparecer método puente según compilador; observar nombres).

### Tema 5: Verificar la compatibilidad en el build · Avanzado · 45 min

**Caso guía.** impedir que un PR rompa API accidentalmente.

Herramientas de compatibilidad

**Definición.** Herramientas como japicmp/Revapi comparan versiones de API y fallan el build ante incompatibilidades.

**Ejemplo mínimo (nota operativa).** En Maven, configurar plugin japicmp entre versión base y actual.

**Error común.** Depender solo de revisión humana. Corrección: gate automático en CI para librerías compartidas.

**Nota de verificación.** La ejecución requiere configurar versiones base/publicadas; se documenta el gate, no se finge salida.

## Cierre

Evolucionar una API es gestión de contratos. Minimiza superficie, versiona con disciplina y automatiza verificación.

## Checklist

- Distingo compatibilidad fuente y binaria.
- Uso `default`/deprecación con plan.
- Entiendo erasure/bridge en APIs públicas.
- Automatizo chequeo de compatibilidad.
