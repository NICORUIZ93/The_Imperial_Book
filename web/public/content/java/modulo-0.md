# Módulo 0: Fundamentos de programación y entorno Java

Tienda Aurora comienza como un monolito modular: catálogo y pedidos en memoria. Antes de escribir esa aplicación, un desarrollador necesita dominar el ciclo completo: entender el problema, expresar la solución como código, compilarla, ejecutarla, observar el resultado y diagnosticar fallos. Este módulo construye esa base desde cero con Java 25, Gradle y código real.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los ejemplos Java puros se ejecutaron localmente.

### Tema 1: Del código fuente a la JVM · Básico · 25 min

## Del código fuente a la JVM

Un desarrollador escribe `System.out.println("Hola")`, lo ejecuta en un IDE y ve el resultado. No sabe qué archivo se generó, dónde quedó, ni qué pasó entre "Run" y la salida. Cuando algo falla fuera del IDE (CI, producción, otra máquina), no puede diagnosticar porque nunca entendió el ciclo real.

Compilar y ejecutar es como traducir y leer un libro. `javac` traduce tu texto (`.java`) a un lenguaje intermedio (bytecode `.class`). La JVM es el lector que interpreta ese bytecode. El IDE oculta ambos pasos, pero no los elimina.

```java
public class Hola {
    public static void main(String[] args) {
        System.out.println("Hola, JVM");
    }
}
```

```bash
mkdir -p java-m0-hola && cd java-m0-hola
javac Hola.java
ls
java Hola
```

Salida esperada:

```text
Hola.class
Hola, JVM
```

`javac` generó `Hola.class` (bytecode). `java Hola` carga y ejecuta. El nombre del archivo `.class` coincide con el nombre de la clase pública. El error más común es "funciona en mi IDE pero no en CI": `ClassNotFoundException` o versión incorrecta de Java. La causa es que el IDE usa un JDK distinto o rutas ocultas. La corrección es verificar `java -version`, `javac -version` y compilar en terminal. La señal observable es diferencia entre entorno local y pipeline.

En Tienda Aurora, el build usa Gradle que invoca `javac` internamente. Si el JDK del CI difiere del local, el build falla o se comporta distinto.

```kotlin
// build.gradle.kts (Tienda Aurora)
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}
```

### Tema 2: JDK, JRE y JVM · Básico · 30 min

## JDK, JRE y JVM

Un desarrollador instala "Java" y no sabe si tiene JDK o JRE. Intenta compilar y falla con `javac: command not found`. Otro usa una versión antigua porque no verificó. El entorno es la primera fuente de bugs.

JDK es la caja de herramientas completa (compilador + runtime). JRE es solo el runtime (para ejecutar, no compilar). JVM es el motor que ejecuta el bytecode. Como un auto: JDK es el taller completo, JRE es solo conducir, JVM es el motor.

```bash
java -version
javac -version
echo $JAVA_HOME
```

Salida esperada (2026-11-22):

```text
openjdk version "27.0.1.0.2" 2026-09-15
javac 27.0.1.0.2
```

Si `javac` existe, tienes JDK. Si solo `java` existe, tienes JRE. `JAVA_HOME` apunta a la instalación. El error más común es "funciona en mi máquina" por JDK distinto: compila local, falla en CI. La causa es versión de Java distinta. La corrección es fijar versión en `.java-version`, `build.gradle.kts` y CI. La señal observable es `UnsupportedClassVersionError`.

### Tema 3: public static void main — qué significa cada palabra · Básico · 35 min

## public static void main: qué significa cada palabra

Un desarrollador nuevo ve `public static void main(String[] args)` y lo memoriza sin entender. Cuando necesita un punto de entrada distinto (tests, plugins), no sabe qué cambiar.

`main` es la puerta de entrada del programa. `public` es "cualquiera puede entrar". `static` es "no necesita crear un objeto para entrar". `void` es "no devuelve nada". `String[] args` es "los argumentos de la línea de comandos".

```java
public class MainDemo {
    public static void main(String[] args) {
        System.out.println("Args: " + args.length);
        for (String a : args) System.out.println("  " + a);
    }
}
```

```bash
javac MainDemo.java
java MainDemo hola "mundo cruel"
```

Salida esperada:

```text
Args: 2
  hola
  mundo cruel
```

`main` recibe `String[] args` con los argumentos de línea de comandos. `System.out.println` imprime y salta de línea. El error más común es archivo y clase con nombres distintos: Java requiere que la clase pública coincida con el nombre del archivo. La señal observable es `class X is public, should be declared in a file named X.java`.

### Tema 4: Tipos primitivos vs referencias · Básico · 45 min

## Tipos primitivos vs referencias

Un desarrollador usa `int` para dinero y pierde centavos por truncamiento. Otro usa `double` para comparar igualdad y obtiene `false` por precisión de punto flotante. Los tipos primitivos parecen simples hasta que no lo son.

Los tipos primitivos son como contenedores de tamaño fijo: `byte` es una caja pequeña, `long` es un camión. Elegir el contenedor correcto evita desbordamiento. La conversión implícita (widening) es segura porque el contenedor grande cabe el pequeño. La conversión explícita (narrowing) puede perder datos. Las referencias son como direcciones: apuntan a objetos en el heap.

```java
public class Tipos {
    public static void main(String[] args) {
        int a = 10;
        double b = a; // widening implícito
        int c = (int) 3.9; // narrowing explícito (trunca)
        System.out.println(b);
        System.out.println(c);
        System.out.println(0.1 + 0.2); // 0.30000000000000004
    }
}
```

```bash
javac Tipos.java
java Tipos
```

Salida esperada:

```text
10.0
3
0.30000000000000004
```

`int`→`double` es widening (seguro). `double`→`int` es narrowing (trunca, no redondea). `0.1 + 0.2` demuestra el problema de punto flotante. El error más común es `double` para dinero: centavos perdidos o comparaciones fallidas. La causa es punto flotante binario. La corrección es `BigDecimal` con escala y `RoundingMode`. Para Tienda Aurora, `InvoiceService` usa `BigDecimal` para calcular totales con IVA.

### Tema 5: Variables, conversiones y `String` · Básico · 40 min

## Variables, conversiones y String

Un desarrollador concatena strings en un loop de 10.000 iteraciones y la app se vuelve lenta. Otro usa `Scanner` sin cerrarlo. Otro formatea fechas con `String.format` y obtiene resultados inesperados por locale.

`String` es inmutable: cada concatenación crea un nuevo objeto. `StringBuilder` es como un borrador reutilizable: modificas sin crear objetos nuevos. `Scanner` lee input token por token. `java.time` es el reloj moderno; `Date`/`Calendar` son relojes rotos del pasado.

```java
public class Strings {
    public static void main(String[] args) {
        String s = "Hola";
        s = s + " mundo";
        System.out.println(s);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) sb.append(i).append(" ");
        System.out.println(sb.toString().trim());

        System.out.printf(java.util.Locale.US, "Precio: %.2f%n", 19.99);
    }
}
```

```bash
javac Strings.java
java Strings
```

Salida esperada:

```text
Hola mundo
0 1 2
Precio: 19.99
```

El error más común es concatenar strings en loop con `+`: lentitud con muchos datos. La causa es que crea N objetos String. La corrección es `StringBuilder` o `String.join`. Para Tienda Aurora, `ReportService` usa `StringBuilder` para generar CSV de 50.000 líneas.

### Tema 6: Operadores, precedencia y control de flujo · Básico · 35 min

## Operadores, precedencia y control de flujo

Un desarrollador escribe `if (a == b & c == d)` pensando que es `&&`. Otro escribe `switch` sin `break` y obtiene fall-through. La precedencia de operadores causa bugs silenciosos.

La precedencia es como las reglas de una calculadora: multiplicación antes que suma. `&&`/`||` son cortocircuito: si el primer operando ya determina el resultado, el segundo no se evalúa. `switch` con arrow labels (`->`) no tiene fall-through. `switch` moderno puede ser expresión (retorna valor).

```java
public class OpsControl {
    public static void main(String[] args) {
        int a = 5, b = 10;
        System.out.println(a + b * 2);     // 25
        System.out.println((a + b) * 2);   // 30

        boolean x = true, y = false;
        System.out.println(x && y);        // false (cortocircuito)
        System.out.println(x || y);        // true

        int p, q, r;
        p = q = r = 5;
        System.out.println(p + " " + q + " " + r);

        int score = 85;
        String grade = score >= 90 ? "A" : score >= 80 ? "B" : "C";
        System.out.println(grade);

        int day = 3;
        String name = switch (day) {
            case 1 -> "Lun";
            case 2 -> "Mar";
            case 3 -> "Mie";
            default -> "Otro";
        };
        System.out.println(name);

        int sum = 0;
        for (int i = 1; i <= 5; i++) sum += i;
        System.out.println(sum);
    }
}
```

```bash
javac OpsControl.java
java OpsControl
```

Salida esperada:

```text
25
30
false
true
5 5 5
B
Mie
15
```

El error más común es `&` en vez de `&&`: evaluación innecesaria o excepciones. La causa es confundir bitwise con lógico. La corrección es usar `&&`/`||` para condiciones. Otro error común es `switch` sin `break` (fall-through): ejecución de múltiples casos. La corrección es usar arrow labels (`->`) de Java 14+.

### Tema 7: Arreglos, wrappers y paso de argumentos · Básico · 50 min

## Arreglos, wrappers y paso de argumentos

Un desarrollador pasa un arreglo a un método y lo modifica, esperando que el original no cambie. No cambia la referencia, pero sí los elementos. Otro usa `==` para comparar arreglos y obtiene `false` aunque tengan los mismos elementos.

Un arreglo es como una fila de casilleros numerados: la referencia es la dirección de la fila. Pasar el arreglo pasa la dirección (la fila es compartida). Comparar con `==` compara direcciones, no contenido. Para contenido, usa `Arrays.equals`.

```java
import java.util.Arrays;

public class Arr {
    static void modify(int[] arr) { arr[0] = 99; }
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        modify(a);
        System.out.println("modified=" + a[0]);
        System.out.println("equals=" + Arrays.equals(a, new int[]{99, 2, 3}));
        System.out.println("ref-equals=" + (a == new int[]{99, 2, 3}));
    }
}
```

```bash
javac Arr.java
java Arr
```

Salida esperada:

```text
modified=99
equals=true
ref-equals=false
```

Los arreglos se pasan por valor la referencia. Los elementos son mutables. Para comparar contenido, usa `Arrays.equals`. Para copiar, usa `Arrays.copyOf`. Para Tienda Aurora, `OrderService` recibe `String[] productIds` y los valida sin modificar el original usando `Arrays.copyOf`.

### Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`) · Básico · 50 min

## Entrada, java.time y por qué evitar Date/Calendar

Un desarrollador usa `java.util.Date` y `Calendar` para manejar fechas. El código es verboso, mutable y propenso a errores de mes (enero = 0). Otro usa `SimpleDateFormat` que no es thread-safe. Las fechas son una fuente constante de bugs.

`java.time` (Java 8+) es como un reloj digital moderno: inmutable, thread-safe, con nombres claros (`LocalDate`, `LocalTime`, `Instant`). `Date`/`Calendar` son relojes mecánicos del pasado: mutables, confusos y no thread-safe.

```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class Time {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        System.out.println("today=" + today);

        LocalDate future = today.plusDays(30);
        System.out.println("future=" + future);
        System.out.println("today-unchanged=" + today);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        System.out.println("formatted=" + today.format(fmt));

        Instant now = Instant.now();
        System.out.println("instant=" + now);
    }
}
```

```bash
javac Time.java
java Time
```

Salida esperada (varía por fecha):

```text
today=2026-11-22
future=2026-06-21
today-unchanged=2026-11-22
formatted=22/05/2026
instant=2026-11-22T...Z
```

`LocalDate` es inmutable: `plusDays` retorna un nuevo objeto. `DateTimeFormatter` es thread-safe. `Instant` es para timestamps UTC. El error más común es usar `SimpleDateFormat` en múltiples hilos: fechas corruptas o parseos fallidos. La causa es que `SimpleDateFormat` no es thread-safe. La corrección es `DateTimeFormatter`. Para Tienda Aurora, `OrderService` usa `Instant.now()` para `createdAt` y `DateTimeFormatter` para mostrar fechas al usuario.

### Tema 9: Java 25 para programas pequeños: `IO`, archivos compactos e `import module` · Básico · 30 min

## Java 25 para programas pequeños: IO, archivos compactos e import module

Un programa pequeño (script, CLI, utilidad) requiere boilerplate: clase pública, método main, imports. En Java 25, `java.io.IO` y los archivos compactos reducen ese boilerplate, mejorando la experiencia de "Java como lenguaje de scripting".

Java 25 introduce `IO` (en `java.io`) con métodos estáticos `print`/`println`/`readln` para simplificar I/O en programas pequeños. Los archivos compactos permiten escribir código sin declaración de clase explícita. `import module` permite importar un módulo completo.

```java
// Archivo compacto (Java 25+): sin clase explícita
void main() {
    var name = IO.readln("Nombre: ");
    IO.println("Hola, " + name);
}
```

```bash
# Requiere JDK 25+
javac Script.java
java Script
```

**Nota de verificación:** no se ejecutó en esta sesión. Verificación propuesta: crear `Script.java` compacto y compilar con `javac Script.java` en JDK 25+.

El error más común es asumir que archivos compactos funcionan en cualquier JDK. El síntoma es error de compilación en JDK < 25. La causa es feature no disponible. La corrección es verificar versión de JDK o usar forma clásica.

## Cierre

Los fundamentos de Java no son "tema de principiantes": son la base sobre la que se construye todo lo demás. Tipos, control de flujo, arreglos, el ciclo de compilación/ejecución y las APIs modernas de fecha son prerrequisitos para cualquier framework o microservicio. Tienda Aurora se construye sobre esta base: Gradle coordina el build, Java 25 provee las features modernas, y las APIs estándar (`java.time`, `HttpClient`) evitan dependencias innecesarias.

## Checklist

- Entiendo el ciclo fuente → bytecode → JVM.
- Verifico JDK/JRE/JVM antes de programar.
- Elijo tipos primitivos y BigDecimal correctamente.
- Uso String/StringBuilder con criterio.
- Controlo flujo con if/switch/loops sin fall-through ni off-by-one.
- Comparo arreglos con Arrays.equals, no ==.
- Uso java.time, no Date/Calendar.
- Conozco las features de Java 25 para programas pequeños.
- Uso Gradle para builds reproducibles.
