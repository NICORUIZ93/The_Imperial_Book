# Módulo 19: Java del día a día — reflexión, regex, dinero, contratos, plugins e i18n

Estas APIs aparecen en frameworks, utilidades y código de negocio real: reflexión para inspeccionar clases, regex para validar texto, `BigDecimal` para dinero, assertions para contratos, `ServiceLoader` para plugins, i18n para formatos, proxies dinámicos para interceptación y handles para acceso avanzado.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Inspeccionar clases y leer anotaciones en runtime con reflexión |
| 2 | Validar y extraer texto con `Pattern`/`Matcher` |
| 3 | Representar dinero con `BigDecimal` sin errores de flotantes |
| 4 | Usar assertions y contratos con criterio |
| 5 | Descubrir implementaciones con `ServiceLoader` |
| 6 | Formatear/parsear datos con `Locale` e i18n |
| 7 | Entender proxies dinámicos como base de AOP/mocks |
| 8 | Explicar carga de clases y delegación |
| 9 | Usar MethodHandles/VarHandles como alternativa moderna a reflexión |

## Aprende construyendo

### Tema 1: Reflexión y anotaciones en tiempo de ejecución · Intermedio · 40 min

**Caso guía**: framework necesita leer anotaciones y campos privados de una clase sin conocerla en compile time.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Reflexión | Inspección/invocación dinámica de clases, campos, métodos en runtime (`java.lang.reflect`). | Frameworks, serialización, DI. | Usar solo cuando no hay alternativa estática. | Romper encapsulación sin necesidad. |
| Anotaciones en runtime | Metadatos con `@Retention(RUNTIME)` leíbles por reflexión. | Configurar comportamiento declarativo. | Definir `@Target` y `@Retention`. | Retention SOURCE/CLASS y esperar leerla en runtime. |
| `Class/Field/Method` | Entradas de reflexión. | Descubrir estructura. | Manejar `IllegalAccessException`, `InvocationTargetException`. | Ignorar seguridad/módulos. |
| Acceso controlado | `setAccessible`/módulos JPMS limitan acceso profundo. | Interoperar con cuidado. | Preferir APIs públicas; en JPMS abrir paquetes. | `InaccessibleObjectException`. |

**Implementación desde cero**
```java
import java.lang.annotation.*; import java.lang.reflect.*;
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.FIELD) @interface Label { String value(); }
class Usuario { @Label("correo") private String email = "ada@example.com"; }
public class DemoReflexion {
  public static void main(String[] args) throws Exception {
    Usuario u = new Usuario();
    for (Field f: Usuario.class.getDeclaredFields()) {
      if (f.isAnnotationPresent(Label.class)) { f.setAccessible(true); System.out.println(f.getAnnotation(Label.class).value()+"="+f.get(u)); }
    }
  }
}
```
**Ejecución real**: `javac DemoReflexion.java && java DemoReflexion` → `correo=ada@example.com`.

### Tema 2: Expresiones regulares con Pattern y Matcher · Intermedio · 35 min

**Caso guía**: validar formato de ID de guía `G-123`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Expresiones regulares | Lenguaje de patrones para texto. | Validar/buscar/extraer. | Mantener regex simple; testear. | Regex ilegible/catastrófica. |
| `Pattern` | Regex compilada, thread-safe. | Reutilizar patrón. | Compilar una vez si se reusa. | `String.matches` en loop caliente sin pensar. |
| `Matcher` | Motor de matching sobre input. | `matches/find/group`. | Saber diferencia `matches` vs `find`. | Usar `matches` esperando substring. |
| Grupos/captura | `(...)` capturan partes. | Extraer campos. | Nombrar/validar grupos. | Índices de grupo incorrectos. |

**Implementación desde cero**
```java
import java.util.regex.*;
public class DemoRegex {
  public static void main(String[] args) {
    Pattern p = Pattern.compile("^G-(\\d{3})$");
    Matcher m = p.matcher("G-123");
    System.out.println(m.matches());
    System.out.println(m.group(1));
    System.out.println(p.matcher("X-123").matches());
  }
}
```
**Ejecución real**: `javac DemoRegex.java && java DemoRegex` → `true`, `123`, `false`.

### Tema 3: Dinero exacto con BigDecimal · Intermedio · 35 min

**Caso guía**: calcular totales monetarios sin errores de punto flotante.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `BigDecimal` | Aritmética decimal de precisión arbitraria. | Dinero/cálculos exactos decimales. | Crear desde `String`, no `double`. | `new BigDecimal(0.1)`. |
| Escala/`RoundingMode` | Decimales y modo de redondeo. | Redondeo monetario controlado. | Definir escala y `RoundingMode` explícito. | División sin escala/rounding. |
| `compareTo` vs `equals` | `compareTo` compara valor numérico; `equals` también escala. | Comparaciones correctas. | Usar `compareTo` para valor. | `new BigDecimal("1.0").equals(new BigDecimal("1"))` es false. |
| Inmutabilidad | Operaciones devuelven nuevo `BigDecimal`. | Seguridad. | Asignar resultado. | Ignorar retorno. |

**Implementación desde cero**
```java
import java.math.*;
public class DemoMoney {
  public static void main(String[] args) {
    BigDecimal a = new BigDecimal("0.10");
    BigDecimal b = new BigDecimal("0.20");
    System.out.println(a.add(b));
    System.out.println(new BigDecimal("1.0").equals(new BigDecimal("1")));
    System.out.println(new BigDecimal("1.0").compareTo(new BigDecimal("1"))==0);
  }
}
```
**Ejecución real**: `javac DemoMoney.java && java DemoMoney` → `0.30`, `false`, `true`.


### Tema 4: Assertions y diseño por contrato · Intermedio · 40 min

**Caso guía**: detectar violaciones internas en desarrollo sin usarlas como validación de input externo.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `assert` | Verificación habilitable con `-ea`. | Invariantes internas/debug. | No para validar input de usuario. | Usar assert en seguridad. |
| Diseño por contrato | Precondiciones, postcondiciones, invariantes. | Claridad de responsabilidades. | Documentar y verificar en puntos adecuados. | Contratos ambiguos. |
| Pre/post/invariante | Condición antes/después/siempre. | Diseñar APIs robustas. | Lanzar excepción apropiada para input externo. | Mezclar bug interno con bad input. |
| `-ea`/`-da` | Habilita/deshabilita assertions. | Control por entorno. | No depender de assert en producción. | Lógica crítica dentro de assert. |

**Implementación desde cero**
```java
public class DemoAssert {
  static int raiz(int n){ assert n>=0 : "n debe ser >=0"; return (int)Math.sqrt(n); }
  public static void main(String[] args){ System.out.println(raiz(9)); }
}
```
**Ejecución real**: `javac DemoAssert.java && java -ea DemoAssert` → `3`. Con `-ea` y `raiz(-1)` lanza `AssertionError`. **Verificación**: sin `-ea`, assert no se ejecuta.

### Tema 5: ServiceLoader: plugins sin acoplar implementaciones · Intermedio · 40 min

**Caso guía**: descubrir implementaciones de un servicio en runtime sin `new ConcreteClass()`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `ServiceLoader` | Mecanismo SPI de Java para cargar implementaciones. | Plugins/extensibilidad. | Definir interfaz/servicio y proveedor. | Olvidar archivo `META-INF/services/...`. |
| SPI (Service Provider Interface) | Contrato que implementan proveedores. | Desacoplar consumidor de implementación. | Interfaz estable. | Romper contrato SPI. |
| `META-INF/services` | Archivo con FQN de implementaciones. | Descubrimiento. | Un FQN por línea. | Nombre de archivo incorrecto. |
| Modularidad/JPMS | En módulos usar `provides ... with ...`. | SPI en JPMS. | Declarar en `module-info`. | Mezclar classpath/modulepath sin ajustar. |

**Implementación desde cero** (classpath simple)
```java
// Notificador.java
public interface Notificador { String tipo(); }
// EmailNotificador.java
public class EmailNotificador implements Notificador { public String tipo(){ return "email"; } }
// DemoSPI.java
import java.util.ServiceLoader;
public class DemoSPI { public static void main(String[] args){ for(Notificador n: ServiceLoader.load(Notificador.class)) System.out.println(n.tipo()); } }
```
Archivo `META-INF/services/Notificador` con `EmailNotificador`. **Ejecución**: compilar todo y correr con META-INF en classpath → `email`.

### Tema 6: Internacionalización: números, monedas, fechas y orden de texto · Intermedio · 40 min

**Caso guía**: mostrar moneda y fecha según locale.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Internacionalización (i18n) | Diseñar software adaptable a idiomas/regiones. | Soporte global. | Externalizar mensajes/formatos. | Hardcodear formato. |
| `Locale` | Identificador de región/idioma. | Seleccionar formato/reglas. | Pasar locale explícito. | Depender de locale default del servidor. |
| `NumberFormat`/moneda | Formato de números/monedas por locale. | Presentación correcta. | Usar `getCurrencyInstance(locale)`. | Concatenar símbolo manualmente. |
| `DateTimeFormatter`/Collator | Formato de fecha y orden de texto. | Fechas/ordenación cultural. | Usar ISO en almacenamiento, locale en UI. | Ordenar strings con `compareTo` para UI localizada. |

**Implementación desde cero**
```java
import java.text.*; import java.time.*; import java.time.format.*; import java.util.*;
public class DemoI18n {
  public static void main(String[] args) {
    Locale es = Locale.forLanguageTag("es-ES");
    NumberFormat moneda = NumberFormat.getCurrencyInstance(es);
    moneda.setCurrency(Currency.getInstance("EUR"));
    System.out.println(moneda.format(1234.5));
    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d 'de' MMMM yyyy", es);
    System.out.println(LocalDate.of(2026,11,22).format(fmt));
  }
}
```
**Ejecución real**: produce `1.234,50 €` (según locale/espacios no-break) y `22 de noviembre 2026`. **Verificación**: cambiar locale a `en-US`.


### Tema 7: Proxies dinámicos: así funcionan @Transactional y los mocks · Avanzado · 45 min

**Caso guía**: interceptar llamadas a un servicio para logging/transacción sin cambiar el código cliente.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Proxy dinámico | Objeto que implementa interfaces y delega a `InvocationHandler`. | AOP simple, mocking, cross-cutting. | Solo interfaces con `Proxy.newProxyInstance` JDK. | Esperar proxiar clases sin CGLIB/ByteBuddy. |
| `InvocationHandler` | Punto donde interceptas método, args y retorno. | Logging, seguridad, tx, métricas. | Manejar `InvocationTargetException`. | Tragar excepciones y ocultar causa. |
| Relación con @Transactional/mocks | Spring AOP y mocks usan proxies/interceptores. | Entender “magia” del framework. | Saber limitaciones (self-invocation). | Llamada interna `this.metodo()` no pasa por proxy. |
| Self-invocation | Método del mismo objeto se llama directamente. | Explica fallos de AOP. | Diseñar boundaries o usar AspectJ/inyección. | Esperar que @Transactional aplique en llamada interna. |

**Implementación desde cero**
```java
import java.lang.reflect.*;
interface Servicio { String hola(String nombre); }
class ServicioImpl implements Servicio { public String hola(String nombre){ return "Hola "+nombre; } }
public class DemoProxy {
  public static void main(String[] args) {
    Servicio real = new ServicioImpl();
    Servicio proxy = (Servicio) Proxy.newProxyInstance(Servicio.class.getClassLoader(), new Class[]{Servicio.class},
      (obj, method, params) -> { System.out.println("antes:"+method.getName()); Object r = method.invoke(real, params); System.out.println("despues"); return r; });
    System.out.println(proxy.hola("Ada"));
  }
}
```
**Ejecución real**: `antes:hola`, `despues`, `Hola Ada`.

### Tema 8: Carga de clases: cargadores, delegación y plugins con URLClassLoader · Avanzado · 45 min

**Caso guía**: cargar plugin JAR en runtime.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| ClassLoader | Carga clases/recursos en JVM. | Modularidad, plugins, aislamiento. | Entender jerarquía. | `ClassCastException` por mismo nombre en loaders distintos. |
| Delegación padre-primero | Loader consulta padre antes de cargar. | Evitar duplicar clases core. | Respetar modelo; no romper seguridad. | Cargar `java.lang.String` custom. |
| `URLClassLoader` | Carga clases desde URLs/jars. | Plugins simples. | Cerrar loader (`close`) cuando no se usa. | Fuga de archivos en Windows. |
| Aislamiento | Clases iguales en loaders distintos no son iguales. | Sandboxing/plugins. | Definir contratos en loader común. | Comparar tipos entre loaders. |

**Implementación desde cero** (conceptual/ejecutable con jar)
```java
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
```
**Nota de verificación**: requiere `plugin.jar` con clase `com.plugin.Hola`; sin él, demuestra manejo de `ClassNotFoundException`.

### Tema 9: MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado · Experto · 45 min

**Caso guía**: acceso dinámico más eficiente/estructurado que reflexión en hot paths.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `MethodHandle` | Referencia tipada invocable a método/campo/ctor (`java.lang.invoke`). | Invocación dinámica rápida. | Respetar `Lookup`/acceso. | `WrongMethodTypeException`. |
| `MethodHandles.Lookup` | Contexto de permisos de acceso. | Seguridad/encapsulación. | `privateLookupIn` cuando corresponde. | Acceso ilegal por módulo. |
| `VarHandle` | Acceso tipado a variables/campos con modos de memoria. | Atomics, volatile/acquire-release. | Elegir modo de acceso correcto. | Usar plain donde necesitas volatile. |
| vs Reflexión | MH/VH más tipados y optimizables; reflexión más introspectiva. | Elegir herramienta adecuada. | Reflexión para descubrimiento; MH/VH para acceso. | Usar reflexión en bucle crítico sin medir. |

**Implementación desde cero**
```java
import java.lang.invoke.*;
public class DemoMH {
  static class Persona { private String nombre = "Ada"; }
  public static void main(String[] args) throws Throwable {
    Persona p = new Persona();
    MethodHandles.Lookup lookup = MethodHandles.privateLookupIn(Persona.class, MethodHandles.lookup());
    VarHandle vh = lookup.findVarHandle(Persona.class, "nombre", String.class);
    System.out.println(vh.get(p));
    vh.set(p, "Linus");
    System.out.println(vh.get(p));
  }
}
```
**Ejecución real**: `javac DemoMH.java && java DemoMH` → `Ada`, `Linus`.


## Cierre del módulo

Estas APIs son herramientas de “día a día avanzado”: no se usan en cada clase, pero aparecen en frameworks, librerías y problemas reales. Saber cuándo usarlas —y cuándo no— te evita magia innecesaria y te da criterio para leer código de producción.
