# Módulo 19: Java del día a día — reflexión, regex, dinero, contratos, plugins e i18n

El JDK incluye muchas APIs que resuelven problemas cotidianos: inspeccionar clases en runtime, validar texto con patrones, calcular dinero sin errores de centavos, expresar contratos, cargar plugins, formatear datos por región, interceptar llamadas y acceder a miembros con APIs modernas. El riesgo es usarlas por intuición. Una regex sin límites puede validar mal; `double` produce errores monetarios; una assertion deshabilitada no protege nada; un proxy dinámico parece magia hasta que necesitas depurar una excepción.

Vas a construir `tienda-aurora-java-m19`, un proyecto pequeño y verificable donde cada concepto se ve en código real. No es un cajón de utilidades sueltas: el hilo conductor es que todas son APIs estándar del JDK que exigen conocer su contrato.

## Prerrequisitos y bootstrap

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m19/src/main/java/com/aurora/stdlib
mkdir -p tienda-aurora-java-m19/src/main/resources/META-INF/services
mkdir -p tienda-aurora-java-m19/src/plugin/java/com/aurora/plugin
mkdir -p tienda-aurora-java-m19/src/test/java/com/aurora/stdlib
cd tienda-aurora-java-m19
gradle wrapper --gradle-version 9.9.1
```

Estructura:

```text
tienda-aurora-java-m19/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/
    │   ├── java/com/aurora/stdlib/
    │   │   ├── App.java
    │   │   ├── AuditCampo.java
    │   │   ├── Auditor.java
    │   │   ├── CalculadoraPrecio.java
    │   │   ├── ClassLoaderDemo.java
    │   │   ├── Complemento.java
    │   │   ├── Contratos.java
    │   │   ├── EmailNotificador.java
    │   │   ├── FormateadorRegional.java
    │   │   ├── HandlesDemo.java
    │   │   ├── Notificador.java
    │   │   ├── Operacion.java
    │   │   ├── OperacionReal.java
    │   │   ├── Pedido.java
    │   │   ├── ProxyDemo.java
    │   │   ├── ServicioRegistro.java
    │   │   ├── ServicioRegistroImpl.java
    │   │   ├── SmsNotificador.java
    │   │   └── ValidadorCodigo.java
    │   └── resources/META-INF/services/
    │       └── com.aurora.stdlib.Notificador
    ├── plugin/java/com/aurora/plugin/
    │   └── ComplementoPlugin.java
    └── test/java/com/aurora/stdlib/
        └── StdlibTest.java
```

El plugin se compila en un JAR aparte (`build/plugin/complemento-plugin.jar`) con una tarea de Gradle y se carga con `URLClassLoader`; el JAR no se versiona en el proyecto, se genera durante el build.

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m19"
```

#### `build.gradle.kts`

Se habilita `-ea` en tests porque el Tema 4 usa `assert` para invariantes internas. También se agrega `-parameters` por si se inspeccionan nombres de parámetros con reflexión; es buena práctica en proyectos modernos.

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
application { mainClass = "com.aurora.stdlib.App" }
tasks.test {
    useJUnitPlatform()
    jvmArgs("-ea") // habilita assertions para Tema 4
    testLogging { events("passed","skipped","failed") }
}
tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-parameters", "-Werror"))
}

// Plugin real en un JAR aparte: se compila contra el API del núcleo y se carga con URLClassLoader.
val pluginClases = layout.buildDirectory.dir("plugin/classes")
val pluginDirectorio = layout.buildDirectory.dir("plugin")
val pluginJarArchivo = pluginDirectorio.map { it.file("complemento-plugin.jar") }
val compilarPlugin by tasks.registering(JavaCompile::class) {
    source = fileTree("src/plugin/java")
    classpath = sourceSets["main"].output
    destinationDirectory.set(pluginClases)
    options.encoding = "UTF-8"
    options.release.set(25)
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
val pluginJar by tasks.registering(Jar::class) {
    dependsOn(compilarPlugin)
    from(pluginClases)
    archiveFileName.set("complemento-plugin.jar")
    destinationDirectory.set(pluginDirectorio)
}
tasks.named("run") { dependsOn(pluginJar) }
tasks.named<Test>("test") {
    dependsOn(pluginJar)
    systemProperty("plugin.jar", pluginJarArchivo.get().asFile.absolutePath)
}
```

`options.release.set(25)` en la tarea del plugin evita que se compile contra la API del JDK 27 de la máquina y luego falle al cargarse en una JVM con toolchain Java 25: el error observado sin esta opción fue `UnsupportedClassVersionError: class file version 71.0 ... up to 69.0`.

## Visual del módulo

**Visual:** [Mapa de utilidades del día a día](/visuals/temas/java/modulo-19-dia-a-dia.html)

Lectura: cada mecanismo cubre un borde distinto; la herramienta correcta hace explícito el contrato y falla de forma comprobable.

### Tema 1: Reflexión y anotaciones en tiempo de ejecución · Intermedio · 45 min

La reflexión es la capacidad del programa para inspeccionar su propia estructura en tiempo de ejecución: clases, campos, métodos, constructores y anotaciones. En vez de llamar `pedido.getId()` directamente, puedes pedirle a la clase `Pedido` qué campos tiene, qué anotaciones llevan y leer sus valores dinámicamente. Esto es poderoso porque permite construir herramientas genéricas —serializadores, validadores, frameworks de inyección, ORMs— que trabajan sobre tipos que no conocían al compilar.

El costo también es real. La reflexión rompe encapsulación si se usa sin cuidado (`setAccessible`), es más lenta que una llamada directa, mueve errores de compilación a runtime, y hace más difícil refactorizar: renombrar un campo privado no rompe un `getDeclaredField("nombre")` en compilación. Por eso se usa en bordes de infraestructura/framework, no como reemplazo normal de diseño orientado a objetos.

Las anotaciones completan el modelo. Una anotación por sí sola es metadata; no hace nada. Su utilidad depende de quién la lea. `@Retention(RetentionPolicy.RUNTIME)` indica que la anotación estará disponible en runtime para que la reflexión la consulte. `@Target` limita dónde puede aplicarse. En este ejemplo, `@AuditCampo` marca qué campos deben entrar en una auditoría, y el auditor los lee dinámicamente.

#### `AuditCampo.java`

```java
package com.aurora.stdlib;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface AuditCampo {
    String nombre();
}
```

#### `Pedido.java`

```java
package com.aurora.stdlib;

import java.math.BigDecimal;

public class Pedido {
    @AuditCampo(nombre = "id")
    private final String id;
    @AuditCampo(nombre = "total")
    private final BigDecimal total;
    private final String notaInterna;

    public Pedido(String id, BigDecimal total, String notaInterna) {
        this.id = id;
        this.total = total;
        this.notaInterna = notaInterna;
    }
    public String id() { return id; }
    public BigDecimal total() { return total; }
    public String notaInterna() { return notaInterna; }
}
```

`notaInterna` no está anotada: el auditor no debe exponerla. Ese es el contrato explícito.

#### `Auditor.java`

```java
package com.aurora.stdlib;

import java.lang.reflect.Field;
import java.util.LinkedHashMap;
import java.util.Map;

public final class Auditor {
    private Auditor() {}

    public static Map<String, Object> auditar(Object obj) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (Field f : obj.getClass().getDeclaredFields()) {
            AuditCampo ann = f.getAnnotation(AuditCampo.class);
            if (ann == null) continue;
            try {
                f.setAccessible(true);
                out.put(ann.nombre(), f.get(obj));
            } catch (IllegalAccessException e) {
                throw new IllegalStateException("no se pudo leer campo " + f.getName(), e);
            }
        }
        return out;
    }
}
```

Resultado verificado: `AUDIT={id=P1, total=10.00}`. La nota interna no aparece. El caso de borde importante es el acceso: `setAccessible(true)` puede fallar con módulos/JPMS o security managers restrictivos. En código moderno, conviene preferir handles o exponer la información por diseño, pero hay que entender reflexión porque el ecosistema Java la usa ampliamente.

### Tema 2: Expresiones regulares con Pattern y Matcher · Intermedio · 40 min

Una expresión regular describe un patrón de texto. En Java, `Pattern` representa la regex compilada y `Matcher` aplica ese patrón a una entrada concreta. Separarlos importa: compilar una regex tiene costo; si vas a validar miles de strings con el mismo patrón, compilas una vez y reutilizas el `Pattern`.

La regex es útil para formatos bien definidos: códigos, placas, identificadores, fechas con forma conocida. No es buena herramienta para todo lo que parezca texto: no parsees HTML complejo con regex, no la uses como único validador de emails RFC-completos si el negocio no lo necesita, y no escribas patrones opacos sin tests. Otro riesgo es la complejidad catastrófica (ReDoS) en patrones ambiguos sobre input no confiable; en validaciones simples con anclas y clases acotadas, el riesgo es menor, pero conviene conocerlo.

#### `ValidadorCodigo.java`

```java
package com.aurora.stdlib;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ValidadorCodigo {
    private static final Pattern CODIGO = Pattern.compile("^(?<letras>[A-Z]{3})-(?<numero>\\d{4})$");
    private static final Pattern EN_TEXTO = Pattern.compile("(?<guia>[A-Z]{3}-)(?<digitos>\\d{4})");

    private ValidadorCodigo() {}

    public static boolean esValido(String codigo) {
        if (codigo == null) return false;
        return CODIGO.matcher(codigo).matches();
    }

    public static String extraerPrimerCodigo(String texto) {
        Matcher m = EN_TEXTO.matcher(texto == null ? "" : texto);
        return m.find() ? m.group("guia") + m.group("digitos") : null;
    }

    /** Grupos con nombre: el número se enmascara sin reconstruir la regex a mano. */
    public static String grupoNumero(String codigo) {
        Matcher m = CODIGO.matcher(codigo == null ? "" : codigo);
        return m.matches() ? m.group("numero") : null;
    }

    public static String enmascararGuias(String texto) {
        Matcher m = EN_TEXTO.matcher(texto == null ? "" : texto);
        return m.replaceAll(resultado ->
                resultado.group("guia") + "*".repeat(resultado.group("digitos").length()));
    }
}
```

`^` y `$` anclan el patrón completo: `ABC-1234` es válido, `abc-1234` no. `find()` busca una ocurrencia dentro de un texto mayor. Los grupos con nombre `(?<nombre>...)` permiten leer `m.group("numero")` o usar un `MatchResult` en `replaceAll` sin depender de índices posicionales: cambiar el orden de los grupos no cambia el código que los consume. Salidas verificadas: `CODIGO=true`, `EXTRA=ABC-1234`, `GRUPO=1234`, `ENMASC=ABC-**** y XYZ-****`.

Error común: usar `matches()` cuando querías `find()`, o al revés. `matches()` exige que toda la cadena cumpla el patrón; `find()` busca una subcadena que cumpla. Otro error es seguir usando `m.group(1)` en una regex que otra persona reordena: los grupos con nombre hacen explícito el contrato.

### Tema 3: Dinero exacto con BigDecimal · Básico · 40 min

`double` y `float` son tipos binarios de punto flotante. Representan eficientemente muchos valores, pero no pueden representar exactamente todos los decimales. `0.1 + 0.2` en binario no es exactamente `0.3`. Para gráficos o física eso puede ser aceptable; para dinero, no. Un centavo perdido o generado por redondeo binario se convierte en inconsistencia contable.

`BigDecimal` representa decimales con precisión arbitraria. El punto clave es construirlo desde `String` cuando el valor viene de un literal decimal: `new BigDecimal("0.10")` preserva la intención decimal; `new BigDecimal(0.10)` captura la aproximación binaria del double. También hay que definir escala y modo de redondeo al dividir o al presentar totales. `RoundingMode.HALF_UP` es común en cálculos comerciales, pero la regla depende del dominio; lo importante es que sea explícita.

#### `CalculadoraPrecio.java`

```java
package com.aurora.stdlib;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class CalculadoraPrecio {
    private CalculadoraPrecio() {}

    public static BigDecimal total(BigDecimal precioUnitario, int cantidad, BigDecimal iva) {
        if (precioUnitario == null || iva == null) throw new IllegalArgumentException("valor nulo");
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad inválida");
        if (precioUnitario.signum() < 0 || iva.signum() < 0) throw new IllegalArgumentException("negativo");
        BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        BigDecimal total = subtotal.add(subtotal.multiply(iva));
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
```

Salida verificada: `TOTAL=23.80` para `10.00 * 2 + IVA 19%`. El test también confirma `0.10 * 3 + IVA 19% = 0.36` con escala 2. 

Error común: comparar `BigDecimal` con `equals()` sin considerar escala (`new BigDecimal("1.0").equals(new BigDecimal("1.00"))` es `false`). Para valor numérico, usa `compareTo()`.

### Tema 4: Assertions y diseño por contrato · Intermedio · 35 min

Una assertion (`assert condición : mensaje`) expresa una invariante interna: algo que debería ser cierto si el código está bien. En Java, las assertions se habilitan con `-ea` (enable assertions) en la JVM. Si no las habilitas, no se ejecutan. Esa característica define su límite: **nunca uses `assert` para validar entrada externa** de usuario, red o archivo. Para eso usa excepciones explícitas como `IllegalArgumentException`.

El diseño por contrato va más allá de la palabra clave `assert`. Es la disciplina de definir precondiciones (lo que el llamador debe cumplir), postcondiciones (lo que el método garantiza) e invariantes (lo que siempre debe ser cierto en el estado válido). En Java no hay sintaxis nativa completa de DbC como en Eiffel, pero puedes expresarlo con validaciones, assertions, tipos, tests y documentación.

#### `Contratos.java`

```java
package com.aurora.stdlib;

public final class Contratos {
    private Contratos() {}

    public static int porcentaje(int parte, int total) {
        if (total <= 0) throw new IllegalArgumentException("total debe ser > 0"); // validación externa
        if (parte < 0 || parte > total) throw new IllegalArgumentException("parte fuera de rango");
        int r = (parte * 100) / total;
        assert r >= 0 && r <= 100 : "invariante roto: porcentaje=" + r; // invariante interna
        return r;
    }
}
```

La precondición se valida con excepción porque depende del llamador. La assertion cubre una invariante interna: dado el contrato de entrada, el resultado debe estar entre 0 y 100. En `build.gradle.kts` configuramos `jvmArgs("-ea")` en tests para que esta protección realmente se ejecute.

### Tema 5: ServiceLoader: plugins sin acoplar implementaciones · Avanzado · 45 min

`ServiceLoader` es el mecanismo estándar del JDK para descubrir implementaciones de una interfaz en tiempo de ejecución. En vez de hacer `new EmailNotificador()` dentro del núcleo, el núcleo depende de la interfaz `Notificador` y `ServiceLoader` busca implementaciones disponibles en el classpath/module path. Esto reduce acoplamiento: puedes agregar un notificador nuevo sin modificar el código que itera notificaciones.

El contrato tiene dos partes. La parte Java: una interfaz o clase abstracta, y una o más implementaciones con constructor público sin argumentos (o un proveedor estático en el modelo modular moderno). La parte de recursos: un archivo en `META-INF/services/` cuyo nombre es el nombre completo de la interfaz, y cuyo contenido lista las clases implementadoras, una por línea.

No es un contenedor de dependencias completo. No resuelve ciclos, scopes, inyección por constructor compleja, ni configuración avanzada. Para eso existen frameworks como Spring/CDI. `ServiceLoader` es útil cuando quieres extensibilidad simple y estándar.

#### `Notificador.java`

```java
package com.aurora.stdlib;
public interface Notificador {
    String canal();
    String enviar(String mensaje);
}
```

#### `EmailNotificador.java`

```java
package com.aurora.stdlib;
public class EmailNotificador implements Notificador {
    @Override public String canal() { return "email"; }
    @Override public String enviar(String mensaje) { return "EMAIL:" + mensaje; }
}
```

#### `SmsNotificador.java`

```java
package com.aurora.stdlib;
public class SmsNotificador implements Notificador {
    @Override public String canal() { return "sms"; }
    @Override public String enviar(String mensaje) { return "SMS:" + mensaje; }
}
```

#### `src/main/resources/META-INF/services/com.aurora.stdlib.Notificador`

```text
com.aurora.stdlib.EmailNotificador
com.aurora.stdlib.SmsNotificador
```

Salida verificada: `CANALES=email,sms`. Si olvidas el archivo de servicio, `ServiceLoader` simplemente no encuentra implementaciones; es un error silencioso frecuente, por eso el test lo cubre.

### Tema 6: Internacionalización: números, monedas, fechas y orden de texto · Intermedio · 45 min

Internacionalizar no es solo traducir strings. Un número, una moneda, una fecha o el orden alfabético cambian según la región. `1,234.50` en EE. UU. puede escribirse `1.234,50` en otros locales; una fecha `May 23, 2026` no se presenta igual en español; y ordenar texto requiere reglas de collation, no solo comparar bytes.

El JDK ofrece `Locale` para representar región/idioma, `NumberFormat` para números y monedas, `DateTimeFormatter` con `FormatStyle` y locale para fechas, y `Collator` para ordenamiento sensible a idioma. `Collator` es especialmente importante: comparar strings con `compareTo()` usa orden Unicode, que no coincide con las expectativas humanas de todos los idiomas. En español, `ñ` se considera letra propia entre `n` y `o` en reglas tradicionales; el `Collator` del locale aplica reglas lingüísticas.

#### `FormateadorRegional.java`

```java
package com.aurora.stdlib;

import java.math.BigDecimal;
import java.text.Collator;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class FormateadorRegional {
    private FormateadorRegional() {}

    public static String moneda(BigDecimal monto, Locale locale) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(locale);
        return nf.format(monto);
    }

    public static String fecha(LocalDate fecha, Locale locale) {
        return DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale).format(fecha);
    }

    public static List<String> ordenar(List<String> palabras, Locale locale) {
        Collator collator = Collator.getInstance(locale);
        collator.setStrength(Collator.PRIMARY); // ignora mayúsculas/acentos base según locale
        List<String> copia = new ArrayList<>(palabras);
        copia.sort(collator);
        return copia;
    }
}
```

Salida verificada: `FECHA_US=May 23, 2026`, `ORD=[n, ñ, o]` con `Locale.forLanguageTag("es-ES")`. Nota: el símbolo y formato de moneda dependen del locale y de los datos de ICU/JDK disponibles; por eso el test de moneda se debe hacer con cuidado o con expectativas del entorno.

Error común: construir `Locale` con el constructor `new Locale(String, String)`, que está deprecado en JDKs recientes. Usa `Locale.forLanguageTag(...)` o `Locale.of(...)` según la versión.

### Tema 7: Proxies dinámicos: así funcionan @Transactional y los mocks · Avanzado · 50 min

Un proxy dinámico es un objeto creado en runtime que implementa una o más interfaces y delega cada invocación a un `InvocationHandler`. No escribes la clase proxy a mano: la JVM la genera. Cuando llamas un método en el proxy, la JVM entra al handler, te da el método, los argumentos y el objeto proxy, y tú decides qué hacer: registrar, validar, abrir transacción, devolver un mock, o delegar al objeto real.

Este mecanismo está detrás de muchas herramientas. Spring AOP puede usar proxies JDK para interceptar métodos de beans con interfaces; los frameworks de mocking crean proxies que registran llamadas y devuelven valores configurados. Entenderlo quita la sensación de magia: `@Transactional` no “modifica” tu método, normalmente hay un proxy alrededor que abre/commitea/rollbackea la transacción.

El límite es importante: `java.lang.reflect.Proxy` solo funciona con **interfaces**. No puede proxyear una clase concreta sin interfaz. Para eso se usan otras técnicas como CGLIB/ByteBuddy. También hay que manejar bien `toString`, `equals`, `hashCode` si el proxy los intercepta.

#### `Operacion.java`

```java
package com.aurora.stdlib;
public interface Operacion {
    int aplicar(int a, int b);
}
```

#### `OperacionReal.java`

```java
package com.aurora.stdlib;
public class OperacionReal implements Operacion {
    @Override public int aplicar(int a, int b) { return a + b; }
}
```

#### `ServicioRegistro.java`

```java
package com.aurora.stdlib;

/** Interfaz proxyeada para demostrar el límite de la auto-invocación. */
public interface ServicioRegistro {
    String procesar();
    String etiqueta();
}
```

#### `ServicioRegistroImpl.java`

```java
package com.aurora.stdlib;

public final class ServicioRegistroImpl implements ServicioRegistro {
    @Override
    public String procesar() {
        return etiqueta() + ":OK"; // this.etiqueta(): no pasa por el proxy
    }

    @Override
    public String etiqueta() { return "REG"; }
}
```

#### `ProxyDemo.java`

```java
package com.aurora.stdlib;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;

public final class ProxyDemo {
    private ProxyDemo() {}

    public static class Resultado {
        public final int valor;
        public final List<String> log;
        public Resultado(int valor, List<String> log) { this.valor = valor; this.log = log; }
    }

    public static Resultado conLog(Operacion real) {
        List<String> log = new ArrayList<>();
        InvocationHandler h = (Object proxy, Method method, Object[] args) -> {
            log.add("before:" + method.getName());
            Object r = method.invoke(real, args);
            log.add("after:" + method.getName());
            return r;
        };
        Operacion proxy = (Operacion) Proxy.newProxyInstance(
                Operacion.class.getClassLoader(),
                new Class<?>[]{Operacion.class},
                h);
        int valor = proxy.aplicar(2, 3);
        return new Resultado(valor, log);
    }

    /** Una auto-invocación this.etiqueta() dentro del real NO vuelve a entrar al proxy. */
    public static String autoInvocacion() {
        List<String> log = new ArrayList<>();
        ServicioRegistro proxy = (ServicioRegistro) Proxy.newProxyInstance(
                ServicioRegistro.class.getClassLoader(),
                new Class<?>[]{ServicioRegistro.class},
                (Object p, Method m, Object[] args) -> {
                    log.add(m.getName());
                    return m.invoke(new ServicioRegistroImpl(), args);
                });
        proxy.procesar();
        String interna = String.join(",", log);
        log.clear();
        proxy.etiqueta();
        return "INTERNA=" + interna + ",EXTERNA=" + String.join(",", log);
    }
}
```

Salida verificada: `PROXY=5:2` y log `[before:aplicar, after:aplicar]`. El proxy no cambia el resultado; agrega comportamiento alrededor.

La auto-invocación es el límite que explica por qué `@Transactional` no aplica cuando un método llama a otro método de la misma instancia: el `this` del objeto real no es el proxy. `ServicioRegistroImpl.procesar()` llama a `etiqueta()` directamente, así que el handler registra solo `procesar`. En cambio, una llamada externa `proxy.etiqueta()` sí entra al handler. Salida verificada: `AUTO=INTERNA=procesar,EXTERNA=etiqueta`. Para que la auto-invocación pase por el interceptor hace falta reestructurar el código (otro bean, `AspectJ` con weaving, o exponer el propio proxy), no “añadir una anotación”.

### Tema 8: Carga de clases: cargadores, delegación y plugins con URLClassLoader · Avanzado · 50 min

Un `ClassLoader` carga bytes de clase y los define como `Class<?>` en la JVM. La identidad de una clase no es solo su nombre completamente calificado: también importa el class loader que la definió. La misma clase cargada por dos loaders distintos puede ser incompatible en runtime (`ClassCastException`).

El modelo clásico usa delegación padre-hijo. Cuando un loader recibe una petición, normalmente delega primero a su padre antes de intentar cargar él mismo. Esto evita que código de aplicación reemplace clases fundamentales como `java.lang.String`. En JDKs modernos el bootstrap loader está representado de forma particular y `getParent()` puede devolver `null`; el platform class loader y el application/system class loader son visibles.

`URLClassLoader` permite cargar clases desde JARs o directorios en rutas indicadas. Es la base histórica de muchos sistemas de plugins. En producción, los plugins traen retos: aislamiento, versiones, cierre de recursos, y seguridad. Aquí se genera un JAR aparte durante el build con la tarea `pluginJar`, se carga con `URLClassLoader.newInstance(...)` y se comprueba que la clase del plugin fue definida por un loader distinto al de la aplicación.

#### `Complemento.java`

```java
package com.aurora.stdlib;

/** Contrato mínimo que el plugin implementa y el núcleo conoce. */
public interface Complemento {
    String etiqueta();
}
```

#### `src/plugin/java/com/aurora/plugin/ComplementoPlugin.java`

```java
package com.aurora.plugin;

import com.aurora.stdlib.Complemento;

/** Implementación que vive en un JAR aparte, descubierto con URLClassLoader. */
public final class ComplementoPlugin implements Complemento {
    @Override
    public String etiqueta() { return "COMPLEMENTO:v2"; }
}
```

#### `ClassLoaderDemo.java`

```java
package com.aurora.stdlib;

import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;

public final class ClassLoaderDemo {
    private ClassLoaderDemo() {}

    public static String identidad() {
        ClassLoader app = ClassLoaderDemo.class.getClassLoader();
        ClassLoader platform = ClassLoader.getPlatformClassLoader();
        ClassLoader boot = platform.getParent(); // null en la JVM verificada
        return "app=" + (app != null) +
                ",platform=" + (platform != null) +
                ",bootNull=" + (boot == null);
    }

    /** Carga el plugin desde un JAR real con URLClassLoader y comprueba su loader. */
    public static String cargarPlugin(Path jar) throws Exception {
        if (jar == null || !Files.exists(jar)) return "PLUGIN=JAR_NO_ENCONTRADO";
        try (URLClassLoader loader = URLClassLoader.newInstance(
                new URL[]{jar.toUri().toURL()}, ClassLoaderDemo.class.getClassLoader())) {
            Class<?> tipo = Class.forName("com.aurora.plugin.ComplementoPlugin", true, loader);
            Complemento instancia = (Complemento) tipo.getDeclaredConstructor().newInstance();
            ClassLoader definidor = tipo.getClassLoader();
            return "PLUGIN=" + instancia.etiqueta()
                    + ":urlLoader=" + (definidor instanceof URLClassLoader)
                    + ":distinto=" + (definidor != ClassLoaderDemo.class.getClassLoader());
        }
    }
}
```

Salida verificada en JDK 27: `CL=app=true,platform=true,bootNull=true` y `PLUGIN=COMPLEMENTO:v2:urlLoader=true:distinto=true`. El valor `bootNull` puede variar según implementación; la prueba del plugin afirma la identidad del loader definidor, no solo la jerarquía.

El `URLClassLoader` se usa en `try-with-resources` porque implementa `Closeable`: cerrarlo libera los JARs abiertos. El contrato `Complemento` vive en el núcleo para que ambos loaders puedan ver el mismo tipo; si el contrato también estuviera dentro del JAR del plugin, el cast fallaría con `ClassCastException` pese a tener el mismo nombre. El contenido real del JAR generado se inspecciona en la sección de verificación.

### Tema 9: MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado · Avanzado · 45 min

`MethodHandles` y `VarHandles` son APIs modernas introducidas para acceso más controlado y optimizable que la reflexión tradicional. `MethodHandle` es una referencia invocable a un método, constructor o campo; se obtiene mediante `Lookup` y `MethodType`, y puede ser optimizada por la JVM. `VarHandle` da acceso a variables/campos con semánticas claras, incluyendo modos de acceso atómico/volátil cuando aplica.

La diferencia práctica con reflexión es de modelo. Reflexión inspecciona y opera con objetos `Method/Field` de forma muy general; MethodHandles/VarHandles están diseñados para ser más eficientes y expresivos en semántica de bajo nivel. Aun así, siguen siendo APIs avanzadas: si puedes resolver con una llamada normal, hazlo normal.

Para acceder a un miembro privado, `privateLookupIn` permite obtener un lookup con privilegios adecuados, sujeto a reglas de módulos. En este ejemplo se accede a un campo privado dentro del mismo módulo.

#### `HandlesDemo.java`

```java
package com.aurora.stdlib;

import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.invoke.VarHandle;

public final class HandlesDemo {
    private HandlesDemo() {}

    public static class Caja { private int valor = 10; }

    public static int invocarLength(String s) throws Throwable {
        MethodHandles.Lookup lookup = MethodHandles.lookup();
        MethodHandle mh = lookup.findVirtual(String.class, "length", MethodType.methodType(int.class));
        return (int) mh.invoke(s);
    }

    public static int leerYEscribir() throws Throwable {
        Caja c = new Caja();
        MethodHandles.Lookup lookup = MethodHandles.privateLookupIn(Caja.class, MethodHandles.lookup());
        VarHandle vh = lookup.findVarHandle(Caja.class, "valor", int.class);
        int antes = (int) vh.get(c);
        vh.set(c, 42);
        return antes + (int) vh.get(c);
    }
}
```

Salida verificada: `MH=4`, `VH=52` (10 + 42). `invoke` puede lanzar `Throwable`; en APIs reales hay que decidir si envolverlo o declararlo.

#### `App.java`

```java
package com.aurora.stdlib;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.ServiceLoader;

public final class App {
    public static void main(String[] args) throws Throwable {
        Pedido p = new Pedido("P1", new BigDecimal("10.00"), "interna");
        System.out.println("AUDIT=" + Auditor.auditar(p));
        System.out.println("CODIGO=" + ValidadorCodigo.esValido("ABC-1234"));
        System.out.println("EXTRA=" + ValidadorCodigo.extraerPrimerCodigo("id ABC-1234 ok"));
        System.out.println("GRUPO=" + ValidadorCodigo.grupoNumero("ABC-1234"));
        System.out.println("ENMASC=" + ValidadorCodigo.enmascararGuias("ABC-1234 y XYZ-9876"));
        System.out.println("TOTAL=" + CalculadoraPrecio.total(new BigDecimal("10.00"), 2, new BigDecimal("0.19")));
        System.out.println("PCT=" + Contratos.porcentaje(1, 4));

        StringBuilder canales = new StringBuilder();
        for (Notificador n : ServiceLoader.load(Notificador.class)) {
            if (canales.length() > 0) canales.append(",");
            canales.append(n.canal());
        }
        System.out.println("CANALES=" + canales);

        System.out.println("FECHA_US=" + FormateadorRegional.fecha(LocalDate.of(2026, 5, 23), Locale.US));
        System.out.println("ORD=" + FormateadorRegional.ordenar(List.of("ñ", "o", "n"), Locale.forLanguageTag("es-ES")));

        ProxyDemo.Resultado r = ProxyDemo.conLog(new OperacionReal());
        System.out.println("PROXY=" + r.valor + ":" + r.log.size());
        System.out.println("AUTO=" + ProxyDemo.autoInvocacion());

        System.out.println("MH=" + HandlesDemo.invocarLength("hola"));
        System.out.println("VH=" + HandlesDemo.leerYEscribir());
        System.out.println("CL=" + ClassLoaderDemo.identidad());
        System.out.println(ClassLoaderDemo.cargarPlugin(Path.of("build/plugin/complemento-plugin.jar")));
    }
}
```

#### `StdlibTest.java`

El test cubre los 9 temas con aserciones concretas. `-ea` está activo por configuración de Gradle y el JAR del plugin se genera antes de ejecutar la suite.

```java
package com.aurora.stdlib;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.junit.jupiter.api.Assertions.*;

class StdlibTest {

    @Test
    void reflexionLeeSoloCamposAuditados() {
        Pedido p = new Pedido("P1", new BigDecimal("10.00"), "secreto");
        Map<String, Object> audit = Auditor.auditar(p);
        assertEquals(2, audit.size());
        assertEquals("P1", audit.get("id"));
        assertFalse(audit.containsKey("notaInterna"));
    }

    @Test
    void regexValidaYExtrae() {
        assertTrue(ValidadorCodigo.esValido("ABC-1234"));
        assertFalse(ValidadorCodigo.esValido("abc-1234"));
        assertEquals("ABC-1234", ValidadorCodigo.extraerPrimerCodigo("xx ABC-1234 yy"));
        assertNull(ValidadorCodigo.extraerPrimerCodigo("sin codigo"));
        assertEquals("1234", ValidadorCodigo.grupoNumero("ABC-1234"));
        assertEquals("ABC-**** y XYZ-****", ValidadorCodigo.enmascararGuias("ABC-1234 y XYZ-9876"));
    }

    @Test
    void bigDecimalNoPierdeCentavos() {
        BigDecimal total = CalculadoraPrecio.total(new BigDecimal("0.10"), 3, new BigDecimal("0.19"));
        assertEquals(new BigDecimal("0.36"), total);
        assertThrows(IllegalArgumentException.class,
                () -> CalculadoraPrecio.total(new BigDecimal("1.00"), 0, new BigDecimal("0.19")));
    }

    @Test
    void contratoValidaEntrada() {
        assertEquals(25, Contratos.porcentaje(1, 4));
        assertThrows(IllegalArgumentException.class, () -> Contratos.porcentaje(1, 0));
        assertThrows(IllegalArgumentException.class, () -> Contratos.porcentaje(5, 4));
    }

    @Test
    void serviceLoaderDescubreImplementaciones() {
        List<String> canales = StreamSupport.stream(ServiceLoader.load(Notificador.class).spliterator(), false)
                .map(Notificador::canal)
                .sorted()
                .collect(Collectors.toList());
        assertEquals(List.of("email", "sms"), canales);
    }

    @Test
    void i18nFormateaYOrdena() {
        String fecha = FormateadorRegional.fecha(LocalDate.of(2026, 5, 23), Locale.US);
        assertTrue(fecha.contains("2026"));
        List<String> ord = FormateadorRegional.ordenar(List.of("ñ", "o", "n"), Locale.forLanguageTag("es-ES"));
        assertEquals("n", ord.get(0));
        assertEquals("ñ", ord.get(1));
    }

    @Test
    void proxyIntercepta() {
        ProxyDemo.Resultado r = ProxyDemo.conLog(new OperacionReal());
        assertEquals(5, r.valor);
        assertEquals(List.of("before:aplicar", "after:aplicar"), r.log);
        assertEquals("INTERNA=procesar,EXTERNA=etiqueta", ProxyDemo.autoInvocacion());
    }

    @Test
    void methodHandleYVarHandle() throws Throwable {
        assertEquals(4, HandlesDemo.invocarLength("hola"));
        assertEquals(52, HandlesDemo.leerYEscribir()); // 10 + 42
    }

    @Test
    void classLoadersVisibles() {
        String id = ClassLoaderDemo.identidad();
        assertTrue(id.contains("app=true"));
        assertTrue(id.contains("platform=true"));
    }

    @Test
    void urlClassLoaderCargaPluginDesdeJar() throws Exception {
        String salida = ClassLoaderDemo.cargarPlugin(Path.of(System.getProperty("plugin.jar")));
        assertEquals("PLUGIN=COMPLEMENTO:v2:urlLoader=true:distinto=true", salida);
    }
}
```

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m19` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
unzip -l build/plugin/complemento-plugin.jar
```

`./gradlew -q test`: **10 tests, 0 fallas** (`build/test-results/test/TEST-com.aurora.stdlib.StdlibTest.xml`).

Salida real de `./gradlew -q run`:

```text
AUDIT={id=P1, total=10.00}
CODIGO=true
EXTRA=ABC-1234
GRUPO=1234
ENMASC=ABC-**** y XYZ-****
TOTAL=23.80
PCT=25
CANALES=email,sms
FECHA_US=May 23, 2026
ORD=[n, ñ, o]
PROXY=5:2
AUTO=INTERNA=procesar,EXTERNA=etiqueta
MH=4
VH=52
CL=app=true,platform=true,bootNull=true
PLUGIN=COMPLEMENTO:v2:urlLoader=true:distinto=true
```

Salida real de `unzip -l build/plugin/complemento-plugin.jar`:

```text
Archive:  ~/labs/aurora-m19/build/plugin/complemento-plugin.jar
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  02-01-1980 00:00   META-INF/
       25  02-01-1980 00:00   META-INF/MANIFEST.MF
        0  02-01-1980 00:00   com/
        0  02-01-1980 00:00   com/aurora/
        0  02-01-1980 00:00   com/aurora/plugin/
      462  02-01-1980 00:00   com/aurora/plugin/ComplementoPlugin.class
---------                     -------
      487                     6 files
```

El JAR contiene solo la clase del plugin; el contrato `Complemento` se resuelve desde el classloader de la aplicación, que es padre del `URLClassLoader`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `ServiceLoader` no encuentra implementaciones | Falta `META-INF/services/<interfaz>` o nombre mal escrito | Revisar ruta y contenido exacto | Archivo con FQN de interfaz y FQNs de implementaciones |
| Error de centavos | `double` para dinero | Comparar cálculos con decimales | `BigDecimal` desde String, escala y `RoundingMode` explícitos |
| Assertion no salta | JVM sin `-ea` | Revisar flags de ejecución | Habilitar `-ea` en tests/dev; no usar assert para input externo |
| Regex valida de más/menos | Falta ancla o patrón ambiguo | Probar casos límite | Usar `^$` para match completo, tests de casos inválidos |
| `m.group(1)` apunta a otro dato | Se reordenaron grupos posicionales | Imprimir los grupos de la regex | Usar grupos con nombre `(?<numero>...)` y `group("numero")` |
| `@Transactional` no se aplica | Auto-invocación `this.metodo()` dentro del bean | Registrar qué métodos entra el handler | Llamar desde otro bean o usar weaving; no basta con anotar |
| `UnsupportedClassVersionError` al cargar plugin | Plugin compilado con JDK distinto al runtime | `javap -verbose` / versión de class file | Compilar plugin con `options.release.set(25)` |
| `ClassCastException` entre clases “iguales” | Cargadas por ClassLoaders distintos, o contrato duplicado en el JAR | Inspeccionar `getClassLoader()` | Mantener la interfaz en el núcleo; aislar solo la implementación |
| `ServiceLoader` no encuentra el plugin de URLClassLoader | Confundir los dos mecanismos | Revisar `META-INF/services` frente a `Class.forName` | `ServiceLoader` usa el descriptor; `URLClassLoader` carga una clase concreta por nombre |
| Proxy no intercepta clase concreta | `Proxy` JDK solo soporta interfaces | Revisar tipo proxyeado | Usar interfaz o herramienta de bytecode si realmente hace falta |

## Checklist de cierre

- [ ] Sé cuándo usar reflexión y cuál es su costo.
- [ ] Compilo/uso regex con intención (`matches` vs `find`) y casos límite, con grupos con nombre cuando el dato importa.
- [ ] Uso `BigDecimal` correctamente para dinero.
- [ ] Distingo validación externa de invariante interna con assertions.
- [ ] Diferencio `ServiceLoader` de `URLClassLoader` y mantengo el contrato fuera del JAR del plugin.
- [ ] Sé que la auto-invocación limita la interceptación de proxies y cómo verificarlo.
- [ ] Puedo explicar ServiceLoader, proxies, class loaders y MethodHandles/VarHandles a nivel de contrato.

Siguiente paso natural: **Módulo 20 — Java funcional: interfaces que componen comportamiento**, donde la composición de funciones y la demanda en `Flow API` pasan a ser el eje del proyecto.
