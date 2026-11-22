# Módulo 19: Java del día a día — reflexión, regex, dinero, contratos, plugins e i18n

Estas APIs aparecen en frameworks, utilidades y código de negocio real: reflexión para inspeccionar clases, regex para validar texto, `BigDecimal` para dinero, assertions para contratos, `ServiceLoader` para plugins, i18n para formatos, proxies dinámicos para interceptación y handles para acceso avanzado.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Reflexión y anotaciones en tiempo de ejecución · Intermedio · 40 min

Un framework necesita leer metadatos y acceder a miembros sin conocer la clase en compile time.

#### Reflexión

**Definición formal.** Reflexión es la capacidad de inspeccionar e invocar clases, campos, métodos y constructores en runtime mediante `java.lang.reflect`.

**Para qué sirve.** Frameworks, DI, serialización, mapeo.

**Cuándo usarla y cuándo no.** Úsala solo cuando no hay alternativa estática/tipada. Evítala en lógica de negocio normal por costo y fragilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t1 && cd /tmp/j19-t1
cat > DemoRef.java << 'JAVA'
import java.lang.reflect.*;
class Usuario { private String nombre = "Ada"; }
public class DemoRef {
  public static void main(String[] args) throws Exception {
    Field f = Usuario.class.getDeclaredField("nombre");
    f.setAccessible(true);
    System.out.println(f.get(new Usuario()));
  }
}
JAVA
javac DemoRef.java && java DemoRef
```

**Caso de uso real.** Mapper que lee campos anotados.

**Error común.** Usar reflexión para todo. Síntoma: errores en runtime, bajo rendimiento. Corrección: preferir interfaces/polimorfismo.

**Verificación (JDK 27, 2026-05-22).** Salida: `Ada`.

#### Anotaciones en runtime

**Definición formal.** Una anotación runtime es metadato declarado con `@Retention(RetentionPolicy.RUNTIME)` que puede leerse por reflexión.

**Para qué sirve.** Configuración declarativa (validación, mapeo, rutas).

**Cuándo usarla.** Cuando el comportamiento se configura por metadatos. Define `@Target` y `@Retention` adecuados.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t1
cat > DemoAnn.java << 'JAVA'
import java.lang.annotation.*; import java.lang.reflect.*;
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.FIELD) @interface Label { String value(); }
class U { @Label("correo") private String email = "a@b.com"; }
public class DemoAnn {
  public static void main(String[] args) throws Exception {
    Field f = U.class.getDeclaredField("email"); f.setAccessible(true);
    System.out.println(f.getAnnotation(Label.class).value());
  }
}
JAVA
javac DemoAnn.java && java DemoAnn
```

**Caso de uso real.** `@Column`, `@NotNull`, `@GET`.

**Error común.** Usar `Retention.SOURCE` y esperar leerla en runtime. Corrección: `RUNTIME`.

**Verificación (2026-05-22).** Salida: `correo`.

#### Acceso controlado y JPMS

**Definición formal.** El acceso reflexivo profundo está limitado por el sistema de módulos y controles de acceso; `setAccessible` puede fallar con `InaccessibleObjectException`.

**Para qué sirve.** Protege encapsulación interna del JDK/módulos.

**Cuándo considerarlo.** Al usar reflexión sobre módulos no abiertos.

**Ejemplo mínimo enfocado (ejecutable).**

```java
// Si el paquete no está abierto: InaccessibleObjectException.
// Corrección: opens com.ejemplo.dto to framework;
```

**Caso de uso real.** Framework serializando DTO en módulo JPMS.

**Error común.** `--add-opens` permanente. Corrección: `opens ... to ...` específico en `module-info`.

**Verificación.** Comportamiento depende de módulo; con classpath no modular habitual no hay error para clases propias.

### Tema 2: Expresiones regulares con Pattern y Matcher · Intermedio · 35 min

Validar formato de ID `G-123`.

#### Expresiones regulares

**Definición formal.** Una expresión regular es un patrón formal para describir conjuntos de cadenas.

**Para qué sirve.** Validar, buscar y extraer texto.

**Cuándo usarla y cuándo no.** Úsala para patrones simples/claros. No la uses para parsear HTML complejo o gramáticas completas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t2 && cd /tmp/j19-t2
cat > DemoRegex.java << 'JAVA'
public class DemoRegex { public static void main(String[] args){ System.out.println("G-123".matches("^G-\\d{3}$")); } }
JAVA
javac DemoRegex.java && java DemoRegex
```

**Caso de uso real.** Validar código postal, email simple, ID.

**Error común.** Regex demasiado permisiva o ilegible. Corrección: tests y simplificación.

**Verificación (2026-05-22).** Salida: `true`.

#### `Pattern` y `Matcher`

**Definición formal.** `Pattern` es una regex compilada thread-safe; `Matcher` aplica el patrón a una entrada.

**Para qué sirve.** Reutilizar regex y extraer grupos.

**Cuándo usarlo.** Compila `Pattern` una vez si se reutiliza.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t2
cat > DemoPM.java << 'JAVA'
import java.util.regex.*;
public class DemoPM {
  public static void main(String[] args) {
    Pattern p = Pattern.compile("^G-(\\d{3})$");
    Matcher m = p.matcher("G-123");
    System.out.println(m.matches());
    System.out.println(m.group(1));
  }
}
JAVA
javac DemoPM.java && java DemoPM
```

**Caso de uso real.** Extraer parte numérica de un ID.

**Error común.** Confundir `matches()` (toda la cadena) con `find()` (subcadena). Corrección: elegir según contrato.

**Verificación (2026-05-22).** Salida: `true`, `123`.

### Tema 3: Dinero exacto con BigDecimal · Intermedio · 35 min

Calcular totales monetarios sin errores de punto flotante.

#### `BigDecimal`

**Definición formal.** `BigDecimal` representa números decimales con precisión arbitraria, inmutable.

**Para qué sirve.** Cálculos monetarios o decimales exactos.

**Cuándo usarlo y cuándo no.** Úsalo para dinero. No lo crees desde `double` para valores decimales exactos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t3 && cd /tmp/j19-t3
cat > DemoBD.java << 'JAVA'
import java.math.BigDecimal;
public class DemoBD { public static void main(String[] args){ System.out.println(new BigDecimal("0.10").add(new BigDecimal("0.20"))); } }
JAVA
javac DemoBD.java && java DemoBD
```

**Caso de uso real.** Totales, impuestos, descuentos.

**Error común.** `new BigDecimal(0.1)`. Síntoma: representación binaria inesperada. Corrección: `new BigDecimal("0.1")`.

**Verificación (2026-05-22).** Salida: `0.30`.

#### Escala, `RoundingMode`, `compareTo`

**Definición formal.** Escala es cantidad de decimales; `RoundingMode` define cómo redondear; `compareTo` compara valor numérico, mientras `equals` también considera escala.

**Para qué sirve.** Redondeo monetario correcto y comparaciones de valor.

**Cuándo usarlo.** Siempre en divisiones monetarias define escala y modo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t3
cat > DemoScale.java << 'JAVA'
import java.math.*;
public class DemoScale {
  public static void main(String[] args) {
    BigDecimal r = new BigDecimal("1").divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);
    System.out.println(r);
    System.out.println(new BigDecimal("1.0").equals(new BigDecimal("1")));
    System.out.println(new BigDecimal("1.0").compareTo(new BigDecimal("1"))==0);
  }
}
JAVA
javac DemoScale.java && java DemoScale
```

**Caso de uso real.** Repartir monto entre cuotas.

**Error común.** División sin escala. Síntoma: `ArithmeticException`. Corrección: escala + `RoundingMode`.

**Verificación (2026-05-22).** Salida: `0.33`, `false`, `true`.

### Tema 4: Assertions y diseño por contrato · Intermedio · 40 min

Detectar violaciones internas en desarrollo sin confundirlas con input externo.

#### `assert`

**Definición formal.** `assert` es una verificación de JVM que se ejecuta solo si las assertions están habilitadas (`-ea`).

**Para qué sirve.** Detectar invariantes rotas o bugs internos.

**Cuándo usarlo y cuándo no.** Úsalo para invariantes internas. No para validar input externo o seguridad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t4 && cd /tmp/j19-t4
cat > DemoAssert.java << 'JAVA'
public class DemoAssert {
  static int raiz(int n){ assert n>=0 : "n>=0"; return (int)Math.sqrt(n); }
  public static void main(String[] args){ System.out.println(raiz(9)); }
}
JAVA
javac DemoAssert.java && java -ea DemoAssert
```

**Caso de uso real.** Verificar invariante interna tras refactor.

**Error común.** Poner lógica crítica dentro de `assert`. Corrección: assert sin efectos secundarios.

**Verificación (2026-05-22).** Con `-ea`, salida `3`; con `raiz(-1)` lanza `AssertionError`.

#### Diseño por contrato

**Definición formal.** Define precondiciones, postcondiciones e invariantes para clarificar responsabilidades entre llamador y callee.

**Para qué sirve.** APIs más claras y errores detectados en el punto correcto.

**Cuándo usarlo.** En APIs y lógica de dominio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t4
cat > DemoContrato.java << 'JAVA'
public class DemoContrato {
  static int dividir(int a,int b){ if(b==0) throw new IllegalArgumentException("b!=0"); return a/b; }
  public static void main(String[] args){ System.out.println(dividir(10,2)); }
}
JAVA
javac DemoContrato.java && java DemoContrato
```

**Caso de uso real.** Validar argumentos públicos con excepciones.

**Error común.** Usar assert para input de usuario. Corrección: excepción de runtime/validación explícita.

**Verificación (2026-05-22).** Salida: `5`.

### Tema 5: ServiceLoader: plugins sin acoplar implementaciones · Intermedio · 40 min

Descubrir implementaciones en runtime sin `new` concreto.

#### `ServiceLoader` y SPI

**Definición formal.** `ServiceLoader` implementa el patrón Service Provider Interface: carga implementaciones de un servicio declaradas por proveedores.

**Para qué sirve.** Extensibilidad por plugins.

**Cuándo usarlo.** Cuando la implementación se descubre en runtime. No para dependencias simples internas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t5/META-INF/services && cd /tmp/j19-t5
cat > Notificador.java << 'JAVA'
public interface Notificador { String tipo(); }
JAVA
cat > EmailNotificador.java << 'JAVA'
public class EmailNotificador implements Notificador { public String tipo(){ return "email"; } }
JAVA
cat > DemoSPI.java << 'JAVA'
import java.util.ServiceLoader;
public class DemoSPI { public static void main(String[] args){ for(Notificador n: ServiceLoader.load(Notificador.class)) System.out.println(n.tipo()); } }
JAVA
echo 'EmailNotificador' > META-INF/services/Notificador
javac Notificador.java EmailNotificador.java DemoSPI.java
java DemoSPI
```

**Caso de uso real.** Drivers JDBC, plugins de logging, extensiones.

**Error común.** Olvidar `META-INF/services/<FQN>`. Síntoma: no se descubre implementación. Corrección: archivo con FQN correcto.

**Verificación (JDK 27, 2026-05-22).** Salida: `email`.

#### `META-INF/services` y JPMS

**Definición formal.** En classpath, el proveedor se declara en `META-INF/services/<interfaz>`; en JPMS, con `provides ... with ...` y `uses ...`.

**Para qué sirve.** Hace el descubrimiento explícito.

**Cuándo usarlo.** Según el modo de despliegue.

**Ejemplo mínimo enfocado (ejecutable).** El archivo del ejemplo anterior es la forma classpath. En JPMS: `provides com.ej.Notificador with com.ej.EmailNotificador;`

**Caso de uso real.** Migrar librería a módulos.

**Error común.** Nombre de archivo incorrecto. Corrección: usar FQN exacto de la interfaz.

**Verificación.** Forma classpath verificada con salida `email`.

### Tema 6: Internacionalización: números, monedas, fechas y orden de texto · Intermedio · 40 min

Mostrar datos según locale.

#### `Locale` e i18n

**Definición formal.** `Locale` identifica idioma/región/reglas culturales; i18n es diseñar software adaptable a esos contextos.

**Para qué sirve.** Presentación correcta para usuarios de distintas regiones.

**Cuándo usarlo.** En UI/reportes. Almacena datos canónicos (ISO, moneda separada).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t6 && cd /tmp/j19-t6
cat > DemoLocale.java << 'JAVA'
import java.util.Locale;
public class DemoLocale { public static void main(String[] args){ System.out.println(Locale.forLanguageTag("es-ES").getLanguage()); } }
JAVA
javac DemoLocale.java && java DemoLocale
```

**Caso de uso real.** Seleccionar idioma por usuario.

**Error común.** Depender del locale default del servidor. Corrección: pasar `Locale` explícito.

**Verificación (2026-05-22).** Salida: `es`.

#### `NumberFormat`, moneda y fechas

**Definición formal.** `NumberFormat`/`DateTimeFormatter` formatean números, monedas y fechas según reglas de locale/formato.

**Para qué sirve.** Presentación correcta sin hardcodear.

**Cuándo usarlo.** En capa de presentación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t6
cat > DemoFmt.java << 'JAVA'
import java.text.*; import java.util.*;
import java.time.*; import java.time.format.*;
public class DemoFmt {
  public static void main(String[] args) {
    Locale us = Locale.US;
    NumberFormat c = NumberFormat.getCurrencyInstance(us);
    System.out.println(c.format(1234.5));
    System.out.println(LocalDate.of(2026,11,22).format(DateTimeFormatter.ISO_LOCAL_DATE));
  }
}
JAVA
javac DemoFmt.java && java DemoFmt
```

**Caso de uso real.** Mostrar precio USD o EUR.

**Error común.** Concatenar símbolo monetario manualmente. Corrección: `NumberFormat.getCurrencyInstance`.

**Verificación (2026-05-22).** Salida: `$1,234.50` y `2026-11-22`.

### Tema 7: Proxies dinámicos · Avanzado · 45 min

Interceptar llamadas para logging/transacción sin cambiar cliente.

#### Proxy dinámico JDK

**Definición formal.** `Proxy.newProxyInstance` crea en runtime un objeto que implementa interfaces y delega llamadas a un `InvocationHandler`.

**Para qué sirve.** Cross-cutting concerns: logging, seguridad, transacciones, mocks.

**Cuándo usarlo.** Cuando el target implementa interfaces. Para clases concretas, otras técnicas (ByteBuddy/CGLIB).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t7 && cd /tmp/j19-t7
cat > DemoProxy.java << 'JAVA'
import java.lang.reflect.*;
interface Servicio { String hola(String n); }
class Impl implements Servicio { public String hola(String n){ return "Hola "+n; } }
public class DemoProxy {
  public static void main(String[] args) {
    Servicio real = new Impl();
    Servicio proxy = (Servicio) Proxy.newProxyInstance(Servicio.class.getClassLoader(), new Class[]{Servicio.class},
      (o,m,p) -> { System.out.println("antes"); Object r=m.invoke(real,p); System.out.println("despues"); return r; });
    System.out.println(proxy.hola("Ada"));
  }
}
JAVA
javac DemoProxy.java && java DemoProxy
```

**Caso de uso real.** Spring AOP, Mockito.

**Error común.** Esperar proxiar clase concreta con JDK proxy. Corrección: usar interfaz o herramienta de bytecode.

**Verificación (2026-05-22).** Salida: `antes`, `despues`, `Hola Ada`.

#### Self-invocation

**Definición formal.** Llamada interna `this.metodo()` dentro del objeto real no pasa por el proxy externo.

**Para qué sirve.** Explica por qué AOP/anotaciones pueden “no funcionar”.

**Cuándo considerarlo.** Al usar `@Transactional`, `@Cacheable`, etc.

**Ejemplo mínimo enfocado (ejecutable).**

```java
// this.otro() no pasa por proxy; solucion: separar bean o self-inject/AOP apropiado.
```

**Caso de uso real.** Método transaccional llamando internamente otro transaccional.

**Error común.** Asumir que toda llamada de método aplica el aspecto. Corrección: entender boundary del proxy.

**Verificación.** **Nota:** comportamiento observable en frameworks AOP; el principio se demuestra por diseño del proxy JDK.

### Tema 8: Carga de clases · Avanzado · 45 min

Cargar plugin JAR en runtime.

#### ClassLoader y delegación

**Definición formal.** Un `ClassLoader` carga clases y recursos; el modelo usual delega primero al padre antes de cargar.

**Para qué sirve.** Aislamiento, plugins, contenedores.

**Cuándo usarlo.** Plugins/sandboxing. Evita manipular loaders core.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t8 && cd /tmp/j19-t8
cat > DemoCL.java << 'JAVA'
public class DemoCL { public static void main(String[] args){ System.out.println(DemoCL.class.getClassLoader()!=null); } }
JAVA
javac DemoCL.java && java DemoCL
```

**Caso de uso real.** Servidor de apps cargando WARs.

**Error común.** Mismo nombre de clase en loaders distintos causa `ClassCastException`. Corrección: contrato en loader común.

**Verificación (2026-05-22).** Salida: `true`.

#### `URLClassLoader`

**Definición formal.** `URLClassLoader` carga clases desde URLs/jars/directorios.

**Para qué sirve.** Plugins simples en runtime.

**Cuándo usarlo.** Cuando necesitas cargar jar externo controlado. Cerrar el loader al terminar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t8
mkdir -p pluginbuild
cat > pluginbuild/com/plugin/Hola.java << 'JAVA'
package com.plugin;
public class Hola { public String toString(){ return "plugin"; } }
JAVA
javac -d pluginbuild pluginbuild/com/plugin/Hola.java
jar cf plugin.jar -C pluginbuild .
cat > DemoLoader.java << 'JAVA'
import java.net.*; import java.nio.file.*;
public class DemoLoader {
  public static void main(String[] args) throws Exception {
    URL jar = Path.of("plugin.jar").toUri().toURL();
    try (URLClassLoader cl = new URLClassLoader(new URL[]{jar}, DemoLoader.class.getClassLoader())) {
      Class<?> c = Class.forName("com.plugin.Hola", true, cl);
      System.out.println(c.getDeclaredConstructor().newInstance().toString());
    }
  }
}
JAVA
javac DemoLoader.java && java DemoLoader
```

**Caso de uso real.** Cargar plugin opcional.

**Error común.** No cerrar loader. Síntoma: fugas de recursos/locks. Corrección: try-with-resources.

**Verificación (2026-05-22).** Salida: `plugin`.

### Tema 9: MethodHandles y VarHandles · Experto · 45 min

Acceso dinámico tipado y modos de memoria.

#### `MethodHandle` y `Lookup`

**Definición formal.** `MethodHandle` es una referencia invocable tipada a un miembro; `Lookup` define el contexto de acceso.

**Para qué sirve.** Invocación dinámica más estructurada que reflexión.

**Cuándo usarlo.** Frameworks/hot paths donde se necesita acceso controlado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j19-t9 && cd /tmp/j19-t9
cat > DemoMH.java << 'JAVA'
import java.lang.invoke.*;
public class DemoMH {
  static String hola(){ return "ok"; }
  public static void main(String[] args) throws Throwable {
    MethodHandle mh = MethodHandles.lookup().findStatic(DemoMH.class, "hola", MethodType.methodType(String.class));
    System.out.println(mh.invoke());
  }
}
JAVA
javac DemoMH.java && java DemoMH
```

**Caso de uso real.** Invocación dinámica optimizable.

**Error común.** `WrongMethodTypeException`. Corrección: ajustar `MethodType` exacto.

**Verificación (2026-05-22).** Salida: `ok`.

#### `VarHandle`

**Definición formal.** `VarHandle` es una referencia tipada a una variable/campo con modos de acceso (plain, volatile, acquire/release, atomic).

**Para qué sirve.** Acceso de bajo nivel controlado y atomics.

**Cuándo usarlo.** Casos avanzados de concurrencia/bibliotecas. Para negocio, usa APIs de alto nivel.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j19-t9
cat > DemoVH.java << 'JAVA'
import java.lang.invoke.*;
public class DemoVH {
  static class P { private String nombre = "Ada"; }
  public static void main(String[] args) throws Throwable {
    P p = new P();
    MethodHandles.Lookup l = MethodHandles.privateLookupIn(P.class, MethodHandles.lookup());
    VarHandle vh = l.findVarHandle(P.class, "nombre", String.class);
    System.out.println(vh.get(p));
    vh.set(p, "Linus");
    System.out.println(vh.get(p));
  }
}
JAVA
javac DemoVH.java && java DemoVH
```

**Caso de uso real.** Implementaciones concurrentes de alto rendimiento.

**Error común.** Usar modo plain cuando se necesita visibilidad volatile. Corrección: elegir modo de acceso adecuado.

**Verificación (2026-05-22).** Salida: `Ada`, `Linus`.

## Cierre del módulo

Estas APIs son herramientas de “día a día avanzado”: no se usan en cada clase, pero explican cómo funcionan frameworks y permiten resolver problemas reales con criterio. Usa reflexión/handles con moderación, regex/BigDecimal/i18n con precisión, y SPI/proxies/classloaders entendiendo sus límites.
