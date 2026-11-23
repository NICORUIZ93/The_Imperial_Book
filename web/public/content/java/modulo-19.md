# Módulo 19: Java avanzado


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 19 — mapa visual](/visuals/temas/java/modulo-19-build-tools.html)

Lectura: El build tool hace repetible resolver dependencias, compilar, testear y empaquetar.


Este módulo cubre capacidades avanzadas de la plataforma: reflexión, regex, dinero exacto, contratos, ServiceLoader, i18n, proxies dinámicos, class loading y MethodHandles/VarHandles. Son herramientas potentes; mal usadas crean código frágil, inseguro o difícil de mantener.

**Contexto Tienda Aurora.** Este módulo aporta bases para Tienda Aurora: los conceptos aquí se aplican en el monolito modular y luego en los microservicios.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2.

## Aprende construyendo

## Proyecto desde cero: tienda-aurora-java-m19

## Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

## Estructura del proyecto

```text
tienda-aurora-java-m19/
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
rootProject.name = "tienda-aurora-java-m19"
```

## Ejecutar

```bash
./gradlew run
# O directamente:
mkdir -p out
javac -d out src/main/java/com/aurora/java/**/*.java
java -cp out com.aurora.java.Main
```

### Tema 1: Reflexión y anotaciones en tiempo de ejecución · Intermedio · 40 min

**Caso guía.** un mini-framework necesita leer anotaciones en runtime.

Reflection y anotaciones runtime

**Definición.** Reflexión permite inspeccionar/modificar clases, campos y métodos en runtime. Las anotaciones con `@Retention(RUNTIME)` pueden leerse por reflexión.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m19-ref
cd java-m19-ref
```

Crea el archivo `DemoRef.java`:

```java
import java.lang.annotation.*;
import java.lang.reflect.*;
@Retention(RetentionPolicy.RUNTIME) @interface Label { String value(); }
class User { @Label("nombre") String name = "Ada"; }
public class DemoRef {
  public static void main(String[] args) throws Exception {
    Field f = User.class.getDeclaredField("name");
    System.out.println(f.getAnnotation(Label.class).value());
  }
}
```

```bash
javac DemoRef.java
java DemoRef
```

**Error común.** Usar reflexión para lógica normal. Rompe encapsulación, tipado y rendimiento. Corrección: usarla en bordes/frameworks.

**Verificación (JDK 27, 2026-05-22).** `nombre`.

### Tema 2: Expresiones regulares con Pattern y Matcher · Intermedio · 35 min

**Caso guía.** validar formato de código de guía.

Regex, `Pattern`, `Matcher`

**Definición.** Regex describe patrones textuales. `Pattern` compila; `Matcher` evalúa sobre input.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m19-regex
cd java-m19-regex
```

Crea el archivo `DemoRegex.java`:

```java
import java.util.regex.*;
public class DemoRegex {
  public static void main(String[] args) {
    Pattern p = Pattern.compile("G-\\d{3}");
    System.out.println(p.matcher("G-123").matches());
    System.out.println(p.matcher("X-123").matches());
  }
}
```

```bash
javac DemoRegex.java
java DemoRegex
```

**Error común.** Validar todo con regex complejas ilegibles. Corrección: regex simple + validación semántica en código.

**Verificación (JDK 27, 2026-05-22).** `true`, `false`.

### Tema 3: Dinero exacto con BigDecimal · Intermedio · 35 min

**Caso guía.** sumar precios monetarios sin errores de punto flotante.

`BigDecimal`

**Definición.** `BigDecimal` representa decimales de precisión arbitraria. Para dinero, usar constructor desde `String` y `MathContext`/`scale` explícitos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m19-money
cd java-m19-money
```

Crea el archivo `DemoMoney.java`:

```java
import java.math.BigDecimal;
public class DemoMoney {
  public static void main(String[] args) {
    BigDecimal a = new BigDecimal("0.10");
    BigDecimal b = new BigDecimal("0.20");
    System.out.println(a.add(b));
  }
}
```

```bash
javac DemoMoney.java
java DemoMoney
```

**Error común.** `new BigDecimal(0.1)`. Captura la representación binaria del double. Corrección: `new BigDecimal("0.1")`.

**Verificación (JDK 27, 2026-05-22).** `0.30`.

### Tema 4: Assertions y diseño por contrato · Intermedio · 40 min

**Caso guía.** invariantes internas que no deberían ocurrir si el código es correcto.

`assert`

**Definición.** `assert` verifica una condición interna; se habilita con `-ea`. No reemplaza validación de entrada externa.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m19-assert
cd java-m19-assert
```

Crea el archivo `DemoAssert.java`:

```java
public class DemoAssert {
  static int dup(int x){ int r=x*2; assert r>=x; return r; }
  public static void main(String[] args){ System.out.println(dup(2)); }
}
```

```bash
javac DemoAssert.java
java -ea DemoAssert
```

**Error común.** Usar `assert` para validar input de usuario. Corrección: validar con excepciones; `assert` para invariantes internas.

**Verificación (JDK 27, 2026-05-22).** `4`.

### Tema 5: ServiceLoader: plugins sin acoplar implementaciones · Intermedio · 40 min

**Caso guía.** cargar implementaciones de un servicio por SPI.

ServiceLoader/SPI

**Definición.** `ServiceLoader` carga implementaciones de una interfaz declaradas en `META-INF/services/`.

**Ejemplo mínimo (concepto).** Requiere archivo de servicio y providers en classpath/module path. Útil para plugins.

**Error común.** Asumir orden estable o única implementación sin validar. Corrección: iterar, seleccionar por criterio explícito.

**Nota de verificación.** Ejemplo completo requiere estructura de recursos; patrón estándar de JDK (`ServiceLoader.load`).

### Tema 6: Internacionalización: números, monedas, fechas y orden de texto · Intermedio · 40 min

**Caso guía.** mostrar monto y fecha según locale.

i18n/l10n con `Locale`, `NumberFormat`, `DateTimeFormatter`

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m19-i18n
cd java-m19-i18n
```

Crea el archivo `DemoI18n.java`:

```java
import java.text.NumberFormat;
import java.util.Locale;
public class DemoI18n {
  public static void main(String[] args) {
    NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);
    System.out.println(nf.format(1234.5));
  }
}
```

```bash
javac DemoI18n.java
java DemoI18n
```

**Error común.** Concatenar símbolos de moneda manualmente. Corrección: `NumberFormat`/`Locale`.

**Verificación (JDK 27, 2026-05-22).** `$1,234.50`.

### Tema 7: Proxies dinámicos: así funcionan @Transactional y los mocks · Avanzado · 45 min

**Caso guía.** interceptar llamadas a una interfaz para logging o validación.

`InvocationHandler` y `Proxy`

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p java-m19-proxy
cd java-m19-proxy
```

Crea el archivo `DemoProxy.java`:

```java
import java.lang.reflect.*;
interface Api { String ping(); }
public class DemoProxy {
  public static void main(String[] args) {
    Api api = (Api) Proxy.newProxyInstance(Api.class.getClassLoader(), new Class[]{Api.class},
      (p,m,a) -> m.getName().equals("ping") ? "pong" : null);
    System.out.println(api.ping());
  }
}
```

```bash
javac DemoProxy.java
java DemoProxy
```

**Error común.** Usar proxies para todo; dificulta debug. Corrección: usarlos en concerns transversales claros.

**Verificación (JDK 27, 2026-05-22).** `pong`.

### Tema 8: Carga de clases: cargadores, delegación y plugins con URLClassLoader · Avanzado · 45 min

**Caso guía.** entender por qué dos clases “iguales” pueden ser incompatibles si las cargó distinto ClassLoader.

ClassLoader

**Definición.** Un `ClassLoader` carga clases en la JVM. La identidad de una clase en runtime incluye su nombre y su loader.

**Error común.** `ClassCastException` entre la misma clase en loaders distintos. Corrección: entender jerarquía de loaders y aislamiento.

### Tema 9: MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado · Experto · 45 min

**Caso guía.** acceso de bajo nivel más tipado/performante que reflexión en ciertos casos.

MethodHandles/VarHandles

**Definición.** MethodHandles ofrece referencias invocables a métodos/campos; VarHandles ofrece acceso con semánticas de memoria a variables/fields.

**Ejemplo mínimo (conceptual).** Requiere `Lookup`; útil en frameworks y librerías de alto rendimiento.

**Error común.** Usarlo sin necesidad. Corrección: preferir APIs de alto nivel; usar en infraestructura cuando se justifique.

## Cierre

Java avanzado es un set de herramientas de precisión. Úsalas con criterio, pruebas y documentación.

## Checklist

- Uso reflexión/proxies solo en bordes.
- Manejo dinero con `BigDecimal` string.
- Uso i18n con Locale/formatters.
- Entiendo riesgos de class loading y serialización/reflexión.
