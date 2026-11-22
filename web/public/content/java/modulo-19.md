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

**Caso guía**

Quieres validar que campos marcados como obligatorios no estén vacíos, sin escribir un validador específico por clase. Los frameworks hacen esto con reflexión y anotaciones.

**Fundamento técnico y modelo mental**

**Definición formal.** La *reflexión* es la capacidad de inspeccionar y operar sobre metadatos de clases, campos, métodos y constructores en tiempo de ejecución (`java.lang.reflect`, `Class`). Una *anotación* es metadato adjunto a elementos del programa; su retención determina si está disponible en código fuente, bytecode o runtime (`@Retention`).

**Contrato / invariantes / reglas.** Para leer una anotación en runtime, debe tener `@Retention(RetentionPolicy.RUNTIME)`. `setAccessible(true)`/acceso profundo puede fallar bajo el módulo system (Java 9+ strong encapsulation) si no se abre el paquete. La reflexión es poderosa pero frágil: renombres no detectados por compilador, menor rendimiento y riesgos de seguridad. No usar reflexión cuando una interfaz, polimorfismo o generics resuelve el problema.

**Modelo mental.** La reflexión es mirar el plano de una máquina mientras está encendida: útil para herramientas genéricas, peligroso para lógica de negocio cotidiana.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `DemoReflexion.java`:
```java
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@interface Obligatorio {}

class Envio {
    @Obligatorio String guia;
    @Obligatorio String destino;
    String nota;
    Envio(String guia, String destino, String nota) {
        this.guia = guia; this.destino = destino; this.nota = nota;
    }
}

public class DemoReflexion {
    static List<String> validar(Object objeto) throws Exception {
        List<String> errores = new ArrayList<>();
        for (Field campo : objeto.getClass().getDeclaredFields()) {
            if (campo.isAnnotationPresent(Obligatorio.class)) {
                campo.setAccessible(true);
                Object valor = campo.get(objeto);
                if (valor == null || valor.toString().isBlank()) {
                    errores.add(campo.getName() + " es obligatorio");
                }
            }
        }
        return errores;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(validar(new Envio("G-1", "Medellin", null)).isEmpty());
        System.out.println(validar(new Envio("", "Medellin", null)));
    }
}
```

**Desglose del código**

- `@Retention(RUNTIME)` hace visible la anotación al ejecutar.
- `getDeclaredFields()` inspecciona todos los campos declarados.
- `isAnnotationPresent` filtra campos marcados.
- `setAccessible(true)` permite leer campos package/private en este ejemplo simple; en módulos JPMS puede requerir `opens`.

**Ejecución y salida real**

```bash
javac DemoReflexion.java
java DemoReflexion
```

```text
true
[guia es obligatorio]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Anotación no aparece en runtime | Falta `Retention(RUNTIME)` | Ajusta la retención |
| `InaccessibleObjectException` en Java 9+ | Encapsulación fuerte de módulo | Usa `opens`, API pública o MethodHandles apropiados |
| Código lento/frágil | Reflexión en ruta caliente | Cachea metadata o usa diseño directo |

**Verificación rápida**

Cambia `RUNTIME` por `SOURCE` y observa que la validación deja de detectar la anotación.

### Tema 2: Expresiones regulares con Pattern y Matcher · Intermedio · 35 min

**Caso guía**

Necesitas validar códigos de guía como `G-2026-001` y extraer partes. Una cadena de `if/contains` se vuelve ilegible y frágil.

**Fundamento técnico y modelo mental**

**Definición formal.** Una expresión regular es una notación formal para describir conjuntos de cadenas. `Pattern` es la representación compilada de la regex; `Matcher` aplica el patrón a una entrada concreta para buscar, validar o extraer grupos.

**Contrato / invariantes / reglas.** `Pattern.compile` es costoso relativo a un match simple; compilar una vez y reutilizar es buena práctica. `matches()` exige coincidencia completa; `find()` busca ocurrencia dentro del texto. Los grupos capturan subcadenas; índices empiezan en 1 para grupos capturados. Regex no es parser para lenguajes complejos (HTML, JSON anidados arbitrarios). La validación con regex debe complementarse con reglas de negocio.

**Modelo mental.** Una regex es un molde de texto: útil para formas regulares, pésima para estructuras profundamente anidadas.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `DemoRegex.java`:
```java
import java.util.regex.*;

public class DemoRegex {
    private static final Pattern GUIA = Pattern.compile("^G-(\\d{4})-(\\d{3})$");

    public static void main(String[] args) {
        String[] datos = {"G-2026-001", "G-26-01", "X-2026-001"};
        for (String d : datos) {
            Matcher m = GUIA.matcher(d);
            if (m.matches()) {
                System.out.println(d + " año=" + m.group(1) + " seq=" + m.group(2));
            } else {
                System.out.println(d + " invalido");
            }
        }
    }
}
```

**Desglose del código**

- `^...$` obliga coincidencia completa.
- `(\\d{4})` captura año; `(\\d{3})` captura secuencia.
- `Pattern` se compila una vez como constante.
- `group(1)` y `group(2)` extraen capturas.

**Ejecución y salida real**

```bash
javac DemoRegex.java
java DemoRegex
```

```text
G-2026-001 año=2026 seq=001
G-26-01 invalido
X-2026-001 invalido
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Regex acepta texto extra | Usaste `find()` o faltan anclas | Usa `matches()` o `^$` |
| Rendimiento malo en loops | Compilas patrón dentro del bucle | Compila una vez como `static final` |
| Regex ilegible | Patrón demasiado complejo | Divide validación o usa parser dedicado |

**Verificación rápida**

Cambia `G-26-01` por `G-2026-001` y confirma que pasa. Agrega un caso con espacio final y verifica que falla.

### Tema 3: Dinero exacto con BigDecimal · Intermedio · 35 min

**Caso guía**

Sumas precios con `double` y obtienes `0.30000000000000004`. En dinero, ese error es inaceptable.

**Fundamento técnico y modelo mental**

**Definición formal.** `BigDecimal` representa números decimales con escala arbitraria y precisión controlada. A diferencia de `float/double` (IEEE 754 binario), permite representar exactamente valores decimales como `0.10` cuando se construye correctamente.

**Contrato / invariantes / reglas.** Crear desde `double` puede arrastrar error binario: `new BigDecimal(0.1)` es peligroso; preferir `new BigDecimal("0.1")` o `BigDecimal.valueOf`. Las divisiones no exactas requieren `MathContext` o `RoundingMode`. `equals` de `BigDecimal` considera escala (`1.0` != `1.00`); `compareTo` compara valor numérico. Para dinero, define escala y modo de redondeo explícitos.

**Modelo mental.** `double` es una regla de medición aproximada; `BigDecimal` es un libro contable: cada centavo cuenta.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `DemoDinero.java`:
```java
import java.math.BigDecimal;
import java.math.RoundingMode;

public class DemoDinero {
    public static void main(String[] args) {
        BigDecimal a = new BigDecimal("0.10");
        BigDecimal b = new BigDecimal("0.20");
        BigDecimal suma = a.add(b);
        System.out.println(suma);

        BigDecimal total = new BigDecimal("10.00");
        BigDecimal tercio = total.divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);
        System.out.println(tercio);
        System.out.println(new BigDecimal("1.0").equals(new BigDecimal("1.00")));
        System.out.println(new BigDecimal("1.0").compareTo(new BigDecimal("1.00")) == 0);
    }
}
```

**Desglose del código**

- Se construye desde strings para preservar valor decimal exacto.
- `add` devuelve un nuevo `BigDecimal` (inmutable).
- `divide` con escala y `RoundingMode` evita `ArithmeticException` en divisiones no exactas.
- `equals` vs `compareTo` muestra la trampa de la escala.

**Ejecución y salida real**

```bash
javac DemoDinero.java
java DemoDinero
```

```text
0.30
3.33
false
true
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Error decimal inesperado | Construiste desde `double` | Usa string o `valueOf` cuidadosamente |
| `ArithmeticException` al dividir | División no exacta sin escala | Especifica escala y `RoundingMode` |
| Comparación falla por escala | Usaste `equals` | Usa `compareTo` para valor numérico |

**Verificación rápida**

Cambia `new BigDecimal("0.10")` por `new BigDecimal(0.10)` e imprime: verás el artefacto binario.

### Tema 4: Assertions y diseño por contrato · Intermedio · 40 min

**Caso guía**

Tienes invariantes internos: “este método nunca recibe null aquí” o “la lista ya viene ordenada”. Quieres detectar violaciones en desarrollo sin usar assertions como validación de usuario.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *assertion* (`assert`) es una comprobación de una condición que el programador considera verdadera en un punto del programa. El *diseño por contrato* modela precondiciones, postcondiciones e invariantes como obligaciones entre llamador y callee.

**Contrato / invariantes / reglas.** Las assertions se habilitan con `-ea` y se deshabilitan por defecto en la JVM; por tanto, no deben usarse para validar entrada externa o lógica de seguridad. Son útiles para invariantes internos y supuestos de desarrollo. Las precondiciones de API pública se validan con excepciones (`IllegalArgumentException`, `Objects.requireNonNull`). Una assertion fallida lanza `AssertionError`.

**Modelo mental.** La assertion es una alarma interna del taller: ayuda al mecánico, no es el control de seguridad de la puerta principal.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `DemoAssert.java`:
```java
public class DemoAssert {
    static int promedioPositivo(int[] valores) {
        assert valores != null : "valores no debe ser null";
        int suma = 0;
        for (int v : valores) {
            assert v >= 0 : "valor negativo: " + v;
            suma += v;
        }
        return valores.length == 0 ? 0 : suma / valores.length;
    }

    public static void main(String[] args) {
        System.out.println(promedioPositivo(new int[]{2, 4, 6}));
    }
}
```

**Desglose del código**

- `assert` documenta y verifica invariantes internos.
- El mensaje tras `:` ayuda a diagnosticar.
- La validación no reemplaza checks de entrada pública.
- Sin `-ea`, las assertions no se ejecutan.

**Ejecución y salida real**

```bash
javac DemoAssert.java
java DemoAssert
java -ea DemoAssert
```

```text
4
4
```

Si pasas datos inválidos y ejecutas con `-ea`, obtendrás `AssertionError`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Assertion nunca falla | Ejecutaste sin `-ea` | Habilita assertions en desarrollo/tests |
| Usaste assert para input de usuario | Mal uso | Usa excepciones explícitas |
| Efectos secundarios dentro de assert | Comportamiento cambia con/ sin `-ea` | No pongas lógica crítica dentro de assert |

**Verificación rápida**

Ejecuta con `java -ea DemoAssert` y prueba un caso que viole la precondición interna.

### Tema 5: ServiceLoader: plugins sin acoplar implementaciones · Intermedio · 40 min

**Caso guía**

Quieres soportar varios motores de cotización sin que el código principal haga `new Moto()` o `new Camion()`. Quieres descubrir implementaciones en tiempo de ejecución.

**Fundamento técnico y modelo mental**

**Definición formal.** `ServiceLoader` es el mecanismo estándar de Java para localizar e instanciar proveedores de una interfaz/servicio. Los proveedores se registran en `META-INF/services/<fqn-interfaz>` o, en JPMS, con `provides ... with ...`.

**Contrato / invariantes / reglas.** El proveedor debe tener un constructor público sin args (o ser un provider type compatible). El archivo de servicio debe llamarse exactamente como el FQN de la interfaz y contener FQNs de implementaciones. La carga es lazy en muchos flujos, pero iterar puede disparar errores de configuración del servicio. ServiceLoader desacopla descubrimiento, no elimina la necesidad de diseñar un buen contrato.

**Modelo mental.** Es un panel de enchufes: el sistema conoce el enchufe (interfaz); cualquiera que cumpla el enchufe puede conectarse.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `Cotizador.java`:
```java
import java.util.ServiceLoader;

interface Cotizador {
    String tipo();
    int cotizar(int km);
}

class CotizadorMoto implements Cotizador {
    public String tipo() { return "MOTO"; }
    public int cotizar(int km) { return 1000 * km; }
}

public class DemoServiceLoader {
    public static void main(String[] args) {
        ServiceLoader<Cotizador> loader = ServiceLoader.load(Cotizador.class);
        for (Cotizador c : loader) {
            System.out.println(c.tipo() + "=" + c.cotizar(10));
        }
    }
}
```

Registro (en classpath): `META-INF/services/Cotizador` con contenido `CotizadorMoto`.

**Desglose del código**

- `Cotizador` es el contrato.
- `CotizadorMoto` es una implementación descubierta por configuración.
- `ServiceLoader.load` busca proveedores disponibles.
- En proyectos reales, el archivo va en `META-INF/services/com.ejemplo.Cotizador` con FQN completo.

**Ejecución y salida real**


```bash
javac Cotizador.java
java Cotizador
```

> **Nota:** requiere la estructura de `META-INF/services` en classpath. El ejemplo muestra el mecanismo; en un repo real se compila con esa estructura.

Salida esperada:

```text
MOTO=10000
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| No encuentra proveedores | Archivo mal nombrado/ubicado | Usa FQN exacto en `META-INF/services` |
| `ServiceConfigurationError` | Clase no instanciable o FQN incorrecto | Verifica constructor público sin args y nombre |
| Acoplamiento oculto | El contrato es demasiado específico | Diseña interfaz estable y pequeña |

**Verificación rápida**

Agrega otra implementación y su línea en el archivo de servicio; debe aparecer sin cambiar `DemoServiceLoader`.

### Tema 6: Internacionalización: números, monedas, fechas y orden de texto · Intermedio · 40 min

**Caso guía**

Muestras precios y fechas a usuarios de distintos países. “1,234.50” y “1.234,50” no significan lo mismo en todos los locales. El formato debe depender del `Locale`.

**Fundamento técnico y modelo mental**

**Definición formal.** *Internacionalización (i18n)* es diseñar software para adaptarse a idiomas/regiones sin cambios de ingeniería. *Localización (l10n)* es proveer datos/formato específicos de un locale. `Locale`, `NumberFormat`, `DateTimeFormatter` y `Collator` son piezas clave en Java.

**Contrato / invariantes / reglas.** El formato es presentación; el valor interno debe ser canónico (por ejemplo, `BigDecimal` para dinero, `Instant/LocalDate` para tiempo). Parsear y formatear deben usar el mismo locale esperado. No hardcodear separadores decimales, símbolos de moneda o formatos de fecha. `Locale` afecta formato/ordenamiento, no conversión de moneda.

**Modelo mental.** El valor es el hecho; el locale es el idioma en que lo cuentas.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `DemoI18n.java`:
```java
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DemoI18n {
    public static void main(String[] args) {
        BigDecimal monto = new BigDecimal("1234.50");
        NumberFormat us = NumberFormat.getCurrencyInstance(Locale.US);
        NumberFormat co = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-CO"));
        System.out.println(us.format(monto));
        System.out.println(co.format(monto));

        LocalDate fecha = LocalDate.of(2026, 5, 22);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.forLanguageTag("es-CO"));
        System.out.println(fmt.format(fecha));
    }
}
```

**Desglose del código**

- `NumberFormat.getCurrencyInstance` aplica formato monetario del locale.
- `Locale.forLanguageTag` crea locale BCP 47.
- `DateTimeFormatter` formatea fecha según patrón y locale.
- El valor interno `BigDecimal` no cambia con el locale.

**Ejecución y salida real**

```bash
javac DemoI18n.java
java DemoI18n
```

```text
$1,234.50
$ 1.234,50
22 may. 2026
```

(El espacio/símbolo exacto puede variar levemente por versión de datos de locale/JDK.)

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Formato numérico incorrecto | Locale equivocado o hardcoded | Usa `NumberFormat` con locale explícito |
| Parseo falla en otro país | Asumiste `.` o `,` | Parsea con el locale de entrada |
| Confundes moneda con conversión | Cambias símbolo, no valor | Conversión de moneda es otra lógica/datos |

**Verificación rápida**

Formatea el mismo monto con `Locale.US` y `es-CO`; deben diferir en formato, no en valor.

### Tema 7: Proxies dinámicos: así funcionan @Transactional y los mocks · Avanzado · 45 min

**Caso guía**

Quieres agregar logging o control transaccional alrededor de llamadas a una interfaz sin modificar cada implementación. Muchos frameworks usan proxies.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *proxy dinámico* (`java.lang.reflect.Proxy`) es un objeto generado en runtime que implementa interfaces dadas y delega invocaciones a un `InvocationHandler`. Es una forma de interceptación basada en interfaces.

**Contrato / invariantes / reglas.** `Proxy.newProxyInstance` requiere interfaces, no clases concretas. Toda llamada a método de interfaz pasa por `invoke`. El handler debe manejar correctamente `toString/hashCode/equals` si es relevante. La interceptación agrega complejidad y overhead; debe ser observable y justificada. Los proxies no interceptan llamadas internas `this.metodo()` que no pasan por el proxy.

**Modelo mental.** El proxy es un recepcionista: recibe todas las llamadas a la interfaz, decide qué hacer antes/después y luego pasa la llamada al objeto real.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `Servicio.java`:
```java
import java.lang.reflect.*;

interface Servicio {
    String saludar(String nombre);
}

class ServicioReal implements Servicio {
    public String saludar(String nombre) { return "Hola " + nombre; }
}

public class DemoProxy {
    public static void main(String[] args) {
        Servicio real = new ServicioReal();
        Servicio proxy = (Servicio) Proxy.newProxyInstance(
            Servicio.class.getClassLoader(),
            new Class<?>[]{Servicio.class},
            (obj, method, params) -> {
                System.out.println("antes:" + method.getName());
                Object r = method.invoke(real, params);
                System.out.println("despues:" + method.getName());
                return r;
            });
        System.out.println(proxy.saludar("Ada"));
    }
}
```

**Desglose del código**

- El proxy implementa `Servicio`.
- `InvocationHandler.invoke` intercepta cada llamada.
- `method.invoke(real, params)` delega al objeto real.
- Se puede agregar métricas, seguridad, transacciones o mocks.

**Ejecución y salida real**

```bash
javac DemoProxy.java
java DemoProxy
```

```text
antes:saludar
despues:saludar
Hola Ada
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| No puedes proxyear una clase | JDK Proxy solo soporta interfaces | Usa interfaz o librería de bytecode (con cuidado) |
| Interceptación no ocurre | Llamada interna no pasa por proxy | Reestructura o usa weaving adecuado |
| `StackOverflowError`/bugs en invoke | Handler mal implementado | Maneja métodos especiales y delega con criterio |

**Verificación rápida**

Agrega otro método a `Servicio` y verifica que también pasa por el handler.

### Tema 8: Carga de clases: cargadores, delegación y plugins con URLClassLoader · Avanzado · 45 min

**Caso guía**

Quieres cargar un plugin JAR en runtime. Para entender por qué a veces falla con `ClassNotFoundException` o conflictos de versiones, necesitas el modelo de carga de clases.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *ClassLoader* carga clases/recursos en la JVM. El modelo clásico usa *delegación padre*: un loader pide primero a su padre antes de intentar cargar. Esto evita cargar versiones duplicadas inconsistentes de clases base y define espacios de nombres de clases.

**Contrato / invariantes / reglas.** Una clase se identifica por su nombre completamente calificado **y** su ClassLoader. Dos clases con mismo nombre cargadas por loaders distintos no son la misma clase. `URLClassLoader` puede cargar desde JARs/rutas. Cerrar loaders es importante para liberar recursos. Cargar clases no confiables desde ubicaciones arbitrarias es un riesgo de seguridad.

**Modelo mental.** Los ClassLoaders son bibliotecarios en jerarquía: antes de buscar en su estante, le preguntan al bibliotecario jefe; si hay dos bibliotecas separadas, el mismo título puede ser otra edición.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `DemoClassLoader.java`:
```java
public class DemoClassLoader {
    public static void main(String[] args) throws Exception {
        ClassLoader app = DemoClassLoader.class.getClassLoader();
        System.out.println(app != null);
        System.out.println(String.class.getClassLoader() == null); // bootstrap
        Class<?> c = Class.forName("java.util.ArrayList");
        System.out.println(c.getName());
    }
}
```

Ejemplo de `URLClassLoader` (requiere un JAR en ruta):

```java
import java.net.*;
import java.nio.file.*;

public class DemoURLClassLoader {
    public static void main(String[] args) throws Exception {
        Path jar = Path.of("plugin.jar");
        try (URLClassLoader loader = new URLClassLoader(new URL[]{jar.toUri().toURL()})) {
            Class<?> clazz = loader.loadClass("com.ejemplo.Plugin");
            System.out.println(clazz.getName());
        }
    }
}
```

**Desglose del código**

- `String.class.getClassLoader()` suele ser `null` por bootstrap loader.
- `Class.forName` carga usando resolución normal.
- `URLClassLoader` permite cargar desde JAR externo; se cierra con try-with-resources.
- La identidad de clase incluye el loader: cuidado con casts entre loaders.

**Ejecución y salida real**

```bash
javac DemoClassLoader.java
java DemoClassLoader
```

```text
true
true
java.util.ArrayList
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ClassNotFoundException` | Clase no está en ese loader/classpath | Verifica ruta/JAR y loader usado |
| `ClassCastException` entre mismo nombre | Misma clase cargada por loaders distintos | Revisa jerarquía y aislamiento |
| Fuga de recursos | Loader no cerrado | Usa try-with-resources en `URLClassLoader` |

**Verificación rápida**

Ejecuta `DemoClassLoader` y confirma que el bootstrap loader se representa como `null`.

### Tema 9: MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado · Experto · 45 min

**Caso guía**

Necesitas acceso dinámico a un campo o método con mejor control que reflexión clásica, respetando reglas de acceso y con mejor potencial de optimización. MethodHandles/VarHandles son la API moderna.

**Fundamento técnico y modelo mental**

**Definición formal.** `MethodHandle` es una referencia tipada y ejecutable a un método/constructor/campo/operación. `VarHandle` es una referencia tipada a una variable/campo con modos de acceso (plain, volatile, acquire/release, opaque). Ambas viven en `java.lang.invoke`.

**Contrato / invariantes / reglas.** El acceso está gobernado por `Lookup` y reglas de visibilidad/módulos. `privateLookupIn` puede requerir apertura de módulo. `VarHandle` permite operaciones atómicas/ordenadas según modo; elegir el modo incorrecto rompe garantías de concurrencia. Los handles son más estructurados que reflexión, pero también más complejos; úsalos cuando el caso lo justifique (frameworks, librerías, rendimiento/control fino).

**Modelo mental.** Reflexión es buscar por nombre en un directorio genérico; MethodHandle/VarHandle es obtener un puntero tipado con permisos claros.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-19 && cd ~/academia-java/modulo-19
```

Crea `Persona.java`:
```java
import java.lang.invoke.*;

class Persona {
    private String nombre = "Ada";
}

public class DemoHandles {
    public static void main(String[] args) throws Throwable {
        MethodHandles.Lookup lookup = MethodHandles.privateLookupIn(Persona.class, MethodHandles.lookup());
        VarHandle vh = lookup.findVarHandle(Persona.class, "nombre", String.class);

        Persona p = new Persona();
        System.out.println(vh.get(p));
        vh.set(p, "Grace");
        System.out.println(vh.get(p));
    }
}
```

**Desglose del código**

- `privateLookupIn` obtiene un lookup con acceso privado a `Persona` (mismo módulo/reglas aplicables).
- `findVarHandle` localiza el campo `nombre`.
- `get/set` acceden al campo con la semántica del handle.
- `VarHandle` también soporta modos atómicos en campos adecuados.

**Ejecución y salida real**

```bash
javac DemoHandles.java
java DemoHandles
```

```text
Ada
Grace
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `IllegalAccessException` | Lookup sin permisos/módulo no abierto | Revisa módulo, `opens` o estrategia de acceso |
| `NoSuchFieldException` | Nombre/tipo incorrecto | Verifica firma exacta del campo |
| Uso concurrente incorrecto | Modo de acceso inadecuado | Usa modo atómico/ordenado apropiado |

**Verificación rápida**

Cambia el tipo en `findVarHandle` a `int.class` y observa el fallo: el handle es tipado.

## Cierre del módulo

Estas APIs son herramientas de “día a día avanzado”: no se usan en cada clase, pero aparecen en frameworks, librerías y problemas reales. Saber cuándo usarlas —y cuándo no— te evita magia innecesaria y te da criterio para leer código de producción.
