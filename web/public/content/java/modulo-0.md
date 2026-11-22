# Módulo 0: Fundamentos de programación y entorno Java

Este módulo establece el ciclo completo de trabajo en Java: preparar el entorno, comprender qué ocurre cuando se compila y ejecuta un programa, y dominar los elementos básicos del lenguaje. Cada tema parte de un problema concreto, presenta el concepto en prosa, desarrolla un ejemplo desde cero y cierra con ejecución real, errores frecuentes y verificación.

**Entorno de referencia verificado en esta máquina (2026-05-22):**

```bash
java -version
javac -version
```

```text
openjdk version "27.0.1.0.2" 2026-09-15
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27+13-7460)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27+13-7460, mixed mode, sharing)
javac 27.0.1.0.2
```

## Aprende construyendo

### Tema 1: Qué es programar y qué problema resuelve Java · Básico · 25 min

Supongamos que necesitamos calcular el precio final de un producto con IVA. La regla es simple: tomar un precio base, aplicar un porcentaje de impuesto y obtener el resultado. Aunque el problema parece pequeño, contiene los elementos esenciales de cualquier programa: datos de entrada, un proceso que transforma esos datos, una salida observable y una forma de verificar que el resultado sea correcto.

#### Qué es un programa y qué significa programar

Un programa es una especificación finita y ejecutable de un cómputo. A partir de un estado o unos datos de entrada, produce una salida o un nuevo estado siguiendo las reglas del lenguaje y del entorno de ejecución. Programar, en este sentido, no consiste solo en escribir código: consiste en definir con precisión una regla, expresarla en un lenguaje formal, ejecutarla y comprobar que su comportamiento es el esperado.

Cuando la regla es clara y repetible, un programa resulta útil porque automatiza el cálculo y evita repetirlo manualmente. En cambio, si la regla es ambigua, el primer problema no es técnico sino conceptual: antes de codificar hay que definir qué significa “correcto”. La verificación es parte del acto de programar; sin ella, el código es una hipótesis no comprobada.

#### Por qué Java

Java es un lenguaje orientado a objetos, de tipado estático, que se compila a bytecode y se ejecuta sobre la Java Virtual Machine (JVM). El tipado estático significa que muchas incompatibilidades de tipos se detectan durante la compilación. La compilación a bytecode permite separar el código fuente de la plataforma concreta donde se ejecuta. La JVM proporciona el entorno de ejecución que interpreta o compila ese bytecode en la máquina anfitriona.

Java se usa cuando interesa construir software mantenible, con buen tooling, bibliotecas maduras y portabilidad razonable: servicios backend, herramientas empresariales, aplicaciones Android, utilidades de línea de comandos, entre otros casos. No es la mejor opción para todo: un script pequeño de una sola vez puede resolverse con menos ceremonia, y ciertos sistemas de muy bajo nivel pueden requerir lenguajes con control más directo de memoria y hardware.

Para compilar código Java desde la terminal se utiliza `javac`, la herramienta del JDK. El resultado de la compilación es un archivo `.class`, que contiene bytecode. Para ejecutarlo se utiliza `java`, que inicia la JVM y busca el punto de entrada del programa. El punto de entrada estándar de una aplicación Java es el método `main`, cuya firma debe ser exactamente esta:

```java
public static void main(String[] args)
```

Si la firma cambia, la JVM no podrá usar ese método como inicio del programa.

#### Un primer ejemplo

Desde una carpeta vacía, creamos un archivo llamado `PrecioFinal.java`:

```bash
mkdir -p /tmp/java-m0-t1 && cd /tmp/java-m0-t1
```

El contenido del archivo es el siguiente:

```java
public class PrecioFinal {
    public static void main(String[] args) {
        double precioBase = 100.0;
        double iva = 0.21;
        double precioFinal = precioBase + (precioBase * iva);

        System.out.println("Precio base: " + precioBase);
        System.out.println("IVA: " + iva);
        System.out.println("Precio final: " + precioFinal);
    }
}
```

#### Recorrido del código

La primera línea declara la clase `PrecioFinal`. En Java, el código ejecutable vive dentro de clases. Como la clase es `public`, el archivo debe llamarse `PrecioFinal.java`; de lo contrario, el compilador rechazará el código.

Dentro de la clase se define el método `main`. La palabra clave `public` indica que puede ser invocado desde fuera de la clase; `static` permite que la JVM lo ejecute sin crear un objeto; `void` indica que no devuelve un valor; y `String[] args` recibe los argumentos de línea de comandos.

Las variables `precioBase` e `iva` son de tipo `double`, adecuado aquí para representar valores decimales. La expresión `precioBase + (precioBase * iva)` calcula el impuesto y lo suma al precio base. Finalmente, `System.out.println` escribe cada valor en la salida estándar, lo que nos permite observar el resultado.

#### Compilación y ejecución

Para compilar el programa:

```bash
javac PrecioFinal.java
```

Si la compilación es correcta, se generará `PrecioFinal.class`. Luego ejecutamos:

```bash
java PrecioFinal
```

Salida real observada en esta máquina (JDK 27, 2026-05-22):

```text
Precio base: 100.0
IVA: 0.21
Precio final: 121.0
```

#### Errores frecuentes

Si aparece el mensaje `class PrecioFinal is public, should be declared in a file named PrecioFinal.java`, la causa es un desajuste entre el nombre del archivo y el nombre de la clase pública. La corrección es renombrar uno de los dos para que coincidan.

Si aparece `Could not find or load main class PrecioFinal`, suele significar que la ejecución se hizo desde otra carpeta o que se pasó el nombre del archivo `.class`. Hay que ubicarse en el directorio donde está `PrecioFinal.class` y ejecutar `java PrecioFinal`.

Si el resultado no cambia después de modificar el código, es probable que se esté ejecutando una versión compilada anterior. En ese caso, debe compilarse nuevamente con `javac` antes de ejecutar.

#### Verificación

Una verificación simple consiste en cambiar `precioBase` a `200.0`, recompilar y ejecutar. La salida debe mostrar `Precio final: 242.0`. Si el valor cambia según lo esperado, el programa está calculando el resultado y no simplemente mostrando un texto fijo.

### Tema 2: JDK, JRE, JVM y bytecode (WORA) · Básico · 30 min

Al compilar `HolaJVM.java` se obtiene `HolaJVM.class`, y al ejecutar ese archivo la JVM produce una salida. Esto plantea dos preguntas importantes: por qué no se ejecuta directamente el archivo `.java`, y por qué el archivo compilado puede ejecutarse en otro sistema que tenga una JVM compatible. Responder estas preguntas permite distinguir entre problemas de código fuente, problemas de compilación y problemas de entorno.

#### JDK, JRE, JVM, bytecode y WORA

El **JDK** (Java Development Kit) es el kit de desarrollo. Incluye el compilador `javac`, herramientas como `jar`, `javadoc`, `javap` o `jshell`, y un entorno de ejecución para probar y ejecutar programas. Es lo que necesita quien desarrolla en Java. Si solo se instala un runtime sin compilador, será posible ejecutar programas ya compilados, pero no compilar código fuente.

El **JRE** (Java Runtime Environment) fue históricamente el entorno orientado a ejecutar aplicaciones Java. Incluía la JVM y bibliotecas estándar de ejecución, pero no el conjunto completo de herramientas de desarrollo. En la práctica moderna, muchas distribuciones entregan un JDK completo, y para despliegue se pueden construir runtimes personalizados. La distinción sigue siendo útil: desarrollar requiere herramientas de compilación; ejecutar requiere un runtime compatible.

La **JVM** (Java Virtual Machine) es la máquina virtual que carga, verifica e interpreta o compila bytecode según las reglas de la plataforma Java. No ejecuta directamente el `.java`, sino el artefacto intermedio generado por el compilador. Su comportamiento depende de la implementación y versión, por lo que “funciona en Java” siempre debe entenderse como “funciona en una JVM compatible con las características usadas”.

El **bytecode** es el formato intermedio contenido en los archivos `.class`. Es el resultado de compilar el código fuente. Su función es separar la compilación del lenguaje de la ejecución en una plataforma concreta. Se puede inspeccionar con `javap`, lo que resulta útil para entender qué generó el compilador o diagnosticar problemas de carga y versión.

**WORA** (Write Once, Run Anywhere) es el objetivo de portabilidad de Java: el mismo bytecode puede ejecutarse en cualquier plataforma donde exista una JVM compatible. Esta propiedad tiene límites reales. El código puede depender de rutas de archivos, separadores, codificaciones, librerías nativas, variables de entorno o versiones de JVM. Por eso WORA debe entenderse como portabilidad del bytecode bajo condiciones compatibles, no como ausencia total de diferencias de entorno.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t2 && cd /tmp/java-m0-t2
```

Creamos `HolaJVM.java`:

```java
public class HolaJVM {
    public static void main(String[] args) {
        System.out.println("Hola desde la JVM");
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("OS: " + System.getProperty("os.name"));
    }
}
```

#### Recorrido del código

`System.getProperty("java.version")` y `System.getProperty("os.name")` consultan propiedades del entorno de ejecución. Esto sirve para observar una idea importante: el mismo código fuente puede compilarse a bytecode portable, pero el resultado visible incluye información del runtime donde se ejecuta.

El comando `javac HolaJVM.java` invoca al compilador del JDK y genera `HolaJVM.class`. El comando `java HolaJVM` no recibe el archivo `.class` como ruta; recibe el nombre de la clase que contiene el método `main`. La JVM se encarga de localizar la clase, cargarla y ejecutarla. El comando `javap -c` desensambla el bytecode y permite confirmar que existe una representación intermedia entre el código fuente y la ejecución.

#### Compilación, ejecución e inspección

```bash
javac HolaJVM.java
java HolaJVM
javap -c HolaJVM | head -5
```

Salida real observada (JDK 27, 2026-05-22):

```text
Hola desde la JVM
Java version: 27.0.1.0.2
OS: Mac OS X
Compiled from "HolaJVM.java"
public class HolaJVM {
  public HolaJVM();
    Code:
       0: aload_0
```

La salida muestra tres cosas: el programa se ejecutó, la JVM reportó su versión y el sistema operativo, y `javap` confirmó la existencia de bytecode.

#### Errores frecuentes

Si se ejecuta `java HolaJVM.class`, la JVM intentará buscar una clase con un nombre incorrecto y aparecerá `Could not find or load main class`. La forma correcta es `java HolaJVM`.

Si aparece `UnsupportedClassFileError`, el bytecode fue compilado con una versión más nueva que la JVM que intenta ejecutarlo. La corrección es alinear versiones o compilar con una opción de release compatible.

Si el programa funciona en una máquina y falla en otra, conviene revisar la promesa de WORA con cuidado: versión de JVM, sistema operativo, rutas, codificación, dependencias nativas y configuración pueden ser diferentes.

#### Verificación

La verificación mínima consiste en confirmar que existe `HolaJVM.class` después de compilar, que `java HolaJVM` ejecuta el método `main`, y que `javap -c HolaJVM` muestra instrucciones de bytecode.

### Tema 3: Instalar JDK y verificar entorno · Básico · 30 min

Antes de escribir código, es necesario confirmar que el entorno puede compilar y ejecutar Java. Muchos problemas iniciales no provienen del programa, sino de una instalación incompleta, de una versión incorrecta o de variables de entorno mal configuradas. Verificar el entorno evita diagnosticar como error de código lo que en realidad es un problema de configuración.

#### Qué significa instalar y verificar el JDK

Instalar el **JDK** significa disponer de los binarios, bibliotecas y herramientas necesarias para desarrollar en Java. Para el trabajo desde terminal, lo mínimo es poder invocar `java` y `javac`. La presencia de `java` indica que hay un runtime disponible; la presencia de `javac` indica que hay compilador. No basta con que uno funcione: para compilar y ejecutar desde código fuente se necesitan ambos.

La variable **`JAVA_HOME`** apunta normalmente al directorio raíz del JDK activo. Herramientas como Maven, Gradle, IDEs y scripts la usan para localizar el JDK. Debe apuntar al directorio raíz, no a `bin`. La variable **`PATH`** contiene los directorios donde el sistema busca ejecutables. Si `PATH` apunta a una instalación diferente de la indicada por `JAVA_HOME`, pueden aparecer inconsistencias entre la versión que compila y la que ejecuta.

Verificar el entorno significa comprobar versión, ubicación y coherencia. Es una práctica que conviene repetir después de instalar un JDK, cambiar de versión o abrir un proyecto que exige una versión específica. En sistemas con múltiples JDKs instalados, esta verificación es especialmente importante.

#### Diagnóstico del entorno

Los comandos básicos de diagnóstico son:

```bash
java -version
javac -version
```

En macOS, además:

```bash
/usr/libexec/java_home
echo "$JAVA_HOME"
which java
which javac
```

En Linux:

```bash
echo "$JAVA_HOME"
which java
which javac
readlink -f "$(which java)"
```

En Windows PowerShell:

```powershell
echo $env:JAVA_HOME
where.exe java
where.exe javac
```

#### Prueba mínima de compilación

La verificación más confiable es compilar y ejecutar un programa pequeño. Creamos `EntornoOk.java`:

```java
public class EntornoOk {
    public static void main(String[] args) {
        System.out.println("JDK OK");
        System.out.println(System.getProperty("java.version"));
    }
}
```

Compilamos y ejecutamos:

```bash
javac EntornoOk.java
java EntornoOk
```

Salida real observada en esta máquina (2026-05-22):

```text
JDK OK
27.0.1.0.2
```

El valor de la versión variará según la instalación, pero el punto importante es que ambos pasos funcionen con la misma instalación esperada.

#### Errores frecuentes

Si `javac` no se reconoce, la causa habitual es que el JDK no está instalado o que `PATH` no incluye su directorio `bin`. La corrección es instalar un JDK completo, ajustar la configuración y abrir una terminal nueva.

Si `java -version` y `javac -version` muestran versiones diferentes, el sistema está usando instalaciones distintas. Esto puede provocar que el código se compile con un JDK y se ejecute con otro runtime. La corrección es alinear `JAVA_HOME` y `PATH`.

Si Maven o Gradle usan un JDK distinto del esperado, el problema suele estar en `JAVA_HOME`. La variable debe apuntar a la raíz del JDK correcto. Cambiar solo `PATH` no siempre resuelve el problema de herramientas que leen `JAVA_HOME`.

#### Verificación

El entorno está listo cuando `java -version` responde, `javac -version` responde y la prueba `EntornoOk` compila y ejecuta mostrando la versión esperada.

### Tema 4: Primer programa desde cero, sin IDE · Básico · 35 min

Crear un programa sin IDE obliga a ver el ciclo completo de trabajo: escribir el archivo, compilarlo, ejecutarlo y corregir errores a partir de los mensajes del compilador o del runtime. Este ejercicio es simple, pero revela qué tareas automatiza un entorno de desarrollo y cuáles siguen siendo responsabilidad del programador.

#### El ciclo mínimo: archivo, clase, `main`, compilación y ejecución

Un programa Java mínimo parte de un archivo fuente `.java`. Si el archivo declara una clase pública, su nombre debe coincidir con el de la clase. La clase puede contener el método `main`, que es el punto de entrada que la JVM busca al ejecutar el programa.

La compilación se realiza con `javac`. Si no hay errores de sintaxis o de tipos, el compilador genera un archivo `.class` con bytecode. La ejecución se realiza con `java`, indicando el nombre de la clase. Este ciclo parece trivial, pero es la base de todo lo demás: cuando algo falla, conviene saber en qué paso ocurrió. Un error de sintaxis impide compilar; un error de clase no encontrada suele ser de ejecución o de classpath; un resultado inesperado puede ser un problema lógico.

Trabajar sin IDE no significa trabajar sin herramientas. Significa usar directamente las herramientas básicas del JDK. Es útil para aprender, para diagnosticar problemas de build y para entender qué ocurre en entornos donde no hay un IDE gráfico disponible.

#### Argumentos de línea de comandos

El parámetro `String[] args` del método `main` recibe los argumentos pasados al ejecutar el programa. Permite parametrizar la ejecución sin modificar el código fuente. Por ejemplo, se puede pasar un nombre al programa y hacer que el saludo cambie según ese valor.

El arreglo `args` puede estar vacío. Por eso, antes de acceder a `args[0]`, hay que validar su longitud. Acceder a una posición inexistente provoca `ArrayIndexOutOfBoundsException`. Este es un caso simple de validación de entrada: incluso en un programa pequeño, la entrada externa no debe asumirse válida.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t4 && cd /tmp/java-m0-t4
```

Creamos `SaludoArgs.java`:

```java
public class SaludoArgs {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Uso: java SaludoArgs <nombre>");
            return;
        }

        String nombre = args[0];
        System.out.println("Hola, " + nombre);
    }
}
```

#### Recorrido del código

La condición `args.length == 0` comprueba si el usuario ejecutó el programa sin argumentos. En ese caso, el programa imprime un mensaje de uso y termina con `return`. Esta salida temprana evita que el código intente leer `args[0]` cuando no existe.

Si hay al menos un argumento, el programa toma el primero y lo asigna a `nombre`. Después imprime el saludo. El comportamiento es simple, pero cubre un contrato básico: con entrada válida produce un saludo; con entrada faltante, indica cómo usar el programa.

#### Compilación y ejecución

```bash
javac SaludoArgs.java
java SaludoArgs
java SaludoArgs Ada
```

Salida real observada (JDK 27, 2026-05-22):

```text
Uso: java SaludoArgs <nombre>
Hola, Ada
```

#### Errores frecuentes

Si se accede a `args[0]` sin validar, el programa falla con `ArrayIndexOutOfBoundsException` cuando no se pasan argumentos. La corrección es comprobar `args.length` antes de leer la posición.

Si aparece `Could not find or load main class`, conviene revisar que se está ejecutando desde la carpeta correcta y que se usa el nombre de la clase, no el nombre del archivo.

Si se modifica el código pero la salida no cambia, el problema suele ser que no se recompiló. El archivo `.class` anterior sigue siendo el que ejecuta la JVM.

#### Verificación

La verificación consiste en probar los dos caminos: ejecutar sin argumentos y obtener el mensaje de uso; ejecutar con `Ada` y obtener `Hola, Ada`. Como ejercicio adicional, se puede ejecutar `java SaludoArgs "Ada Lovelace"` y observar que las comillas permiten pasar un argumento con espacios.

### Tema 5: Tipos primitivos, variables y conversiones · Básico · 45 min

Cuando un programa manipula datos, necesita representarlos con tipos adecuados. En Java, la elección del tipo no es solo una formalidad sintáctica: define qué valores son posibles, qué operaciones tienen sentido, cuánta memoria se usa y qué conversiones son seguras o peligrosas.

#### Tipos primitivos y variables

Java define ocho tipos primitivos: `byte`, `short`, `int`, `long`, `float`, `double`, `char` y `boolean`. Son tipos de valor, no objetos. `byte`, `short`, `int` y `long` representan enteros con distintos rangos; `float` y `double` representan números en punto flotante; `char` representa un carácter UTF-16; `boolean` representa `true` o `false`.

Una variable es un nombre asociado a un tipo, un alcance y un valor compatible. Java es de tipado estático: el compilador verifica la compatibilidad de tipos. Esto permite detectar errores antes de ejecutar, pero también exige elegir el tipo correcto. Por ejemplo, `int` sirve para contadores comunes, mientras que `long` es necesario cuando el rango de `int` no alcanza. `double` es útil para ciertos cálculos decimales, pero no debe usarse para dinero en sistemas reales, donde `BigDecimal` suele ser más adecuado por el control de precisión decimal.

#### Conversiones, cast y overflow

Una conversión *widening* ocurre cuando se asigna un valor a un tipo más amplio compatible, como de `int` a `double`. En estos casos, la conversión puede ser implícita. Una conversión *narrowing* ocurre en sentido inverso, por ejemplo de `double` a `int`; como puede haber pérdida de información, Java exige un cast explícito. El cast no redondea mágicamente al valor “más cercano” según la intención del negocio: en el caso de `double` a `int`, se trunca la parte decimal.

Los literales enteros son de tipo `int` por defecto. Si un valor excede el rango de `int`, debe indicarse con el sufijo `L` para tratarlo como `long`. Otro punto importante es el overflow de enteros: en operaciones con `int`, si el resultado excede el rango, Java no lanza excepción por defecto; el valor se desborda. Para detectar esta situación existen métodos como `Math.addExact`, que lanzan `ArithmeticException`.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t5 && cd /tmp/java-m0-t5
```

Creamos `TiposYConversiones.java`:

```java
public class TiposYConversiones {
    public static void main(String[] args) {
        byte edad = 30;
        long poblacion = 8_000_000_000L;
        double precio = 19.99;
        char inicial = 'J';
        boolean activo = true;

        double desdeInt = edad;          // widening
        int precioEntero = (int) precio; // narrowing

        System.out.println(edad);
        System.out.println(poblacion);
        System.out.println(precio);
        System.out.println(inicial);
        System.out.println(activo);
        System.out.println(desdeInt);
        System.out.println(precioEntero);
    }
}
```

Y `Desbordamiento.java`:

```java
public class Desbordamiento {
    public static void main(String[] args) {
        int maximo = Integer.MAX_VALUE;
        System.out.println(maximo);
        System.out.println(maximo + 1);
        try {
            System.out.println(Math.addExact(maximo, 1));
        } catch (ArithmeticException e) {
            System.out.println("overflow detectado");
        }
    }
}
```

#### Recorrido del código

En `TiposYConversiones`, la variable `poblacion` usa el sufijo `L` porque el valor `8_000_000_000` no cabe en un `int`. La asignación `double desdeInt = edad` es un widening implícito: no hay riesgo de perder la parte entera en ese rango. En cambio, `(int) precio` es un narrowing explícito; el valor `19.99` se trunca a `19`.

En `Desbordamiento`, `Integer.MAX_VALUE` contiene el valor máximo de un `int`. Al sumar 1 con aritmética normal, el resultado se desborda y produce un valor negativo. `Math.addExact` detecta el desbordamiento y lanza `ArithmeticException`, lo que permite reaccionar de forma explícita.

#### Ejecución

```bash
javac TiposYConversiones.java Desbordamiento.java
java TiposYConversiones
java Desbordamiento
```

Salida real observada (JDK 27, 2026-05-22):

```text
30
8000000000
19.99
J
true
30.0
19
2147483647
-2147483648
overflow detectado
```

#### Errores frecuentes

Si el compilador indica `integer number too large`, la causa es un literal entero fuera del rango de `int` sin sufijo `L`. La corrección es usar `long` y agregar `L`.

Si aparece `possible lossy conversion from double to int`, se está intentando un narrowing sin cast. Debe hacerse explícito solo si la pérdida es aceptable y está comprendida.

Si un cálculo entero produce un valor negativo inesperado, puede haber overflow. En esos casos conviene usar `long` o métodos `*Exact`.

#### Verificación

La verificación consiste en confirmar que `19.99` se trunca a `19`, que el literal largo compila con `L` y que `Math.addExact` detecta el desbordamiento.

### Tema 6: String, entrada/salida y formato · Básico · 40 min

Muchos programas interactúan con personas o con otros sistemas a través de texto. En Java, esto implica entender cómo se representan las cadenas, cómo se leen datos desde la entrada estándar, cómo se escriben resultados y cómo se formatea la salida.

#### `String` como objeto inmutable

`String` es una clase de `java.lang` que representa una secuencia de caracteres. Un objeto `String` es inmutable: una vez creado, su contenido no cambia. Métodos como `trim()`, `toUpperCase()` o `replace()` no modifican la cadena original; devuelven una nueva cadena con el resultado.

Esta inmutabilidad tiene consecuencias prácticas. Después de llamar `nombre.trim()`, el valor limpio existe solo si se guarda o se usa. También afecta la comparación: `==` compara referencias, es decir, si dos variables apuntan al mismo objeto. Para comparar contenido textual debe usarse `equals` o `equalsIgnoreCase`. Una forma segura ante `null` es `"si".equals(respuesta)`, porque evita invocar un método sobre una referencia nula.

#### Entrada, salida y formato

La entrada estándar se representa por `System.in`. Para leer texto de forma simple se puede usar `Scanner`. La salida estándar se representa por `System.out`, y la salida de error por `System.err`. `System.out.println` imprime una línea; `System.out.printf` permite formatear con plantillas.

El formato es útil para presentar datos de manera legible y consistente. En `printf`, especificadores como `%s`, `%d` o `%n` controlan la representación. `%n` es preferible a `\n` cuando se quiere un salto de línea portable.

Al leer entrada, hay que considerar el tipo de lectura. `nextLine()` lee hasta el final de la línea, mientras que métodos como `nextInt()` leen tokens y pueden dejar pendiente el salto de línea. Mezclar estas estrategias sin cuidado produce comportamientos confusos. Para ejercicios simples, leer líneas y luego convertir el valor suele ser más predecible.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t6 && cd /tmp/java-m0-t6
```

Creamos `CompararStrings.java`:

```java
public class CompararStrings {
    public static void main(String[] args) {
        String a = "java";
        String b = new String("java");

        System.out.println(a == b);          // referencia
        System.out.println(a.equals(b));     // contenido
        System.out.println("si".equalsIgnoreCase("SI"));
        String respuesta = null;
        System.out.println("si".equals(respuesta)); // null-safe
    }
}
```

Y `TextoIO.java`:

```java
import java.util.Scanner;

public class TextoIO {
    public static void main(String[] args) {
        String lenguaje = "Java";
        System.out.println("Lenguaje: " + lenguaje);
        System.out.println("Longitud: " + lenguaje.length());
        System.out.println("Mayúsculas: " + lenguaje.toUpperCase());
        System.out.printf("Formato: %-10s | v%d%n", lenguaje, 25);

        Scanner scanner = new Scanner(System.in);
        System.out.print("Escribe tu nombre: ");
        String nombre = scanner.nextLine().trim();
        if (nombre.isEmpty()) {
            System.out.println("Nombre vacío");
        } else {
            System.out.println("Hola, " + nombre);
        }
        scanner.close();
    }
}
```

#### Recorrido del código

En `CompararStrings`, `a` y `b` contienen el mismo texto, pero `b` se crea explícitamente con `new String(...)`, por lo que es otro objeto. La comparación `a == b` devuelve `false` porque compara referencias. En cambio, `a.equals(b)` devuelve `true` porque compara contenido. `equalsIgnoreCase` permite aceptar mayúsculas o minúsculas, y `"si".equals(respuesta)` evita un `NullPointerException` cuando la variable es `null`.

En `TextoIO`, `toUpperCase()` devuelve una nueva cadena; `lenguaje` conserva su valor original. `printf` usa `%-10s` para alinear el texto a la izquierda, `%d` para el número y `%n` para el salto de línea portable. La lectura con `nextLine().trim()` toma la línea completa y elimina espacios extremos. Si el resultado queda vacío, el programa responde con un mensaje claro.

#### Ejecución

```bash
javac CompararStrings.java
java CompararStrings
```

Salida real observada (JDK 27, 2026-05-22):

```text
false
true
true
false
```

`TextoIO` es interactivo. Una sesión esperada es:

```text
Lenguaje: Java
Longitud: 4
Mayúsculas: JAVA
Formato: Java       | v25
Escribe tu nombre:  Ada 
Hola, Ada
```

#### Errores frecuentes

Comparar cadenas con `==` es un error clásico. Compila, pero verifica identidad de objeto, no igualdad de contenido. La corrección es usar `equals` o `equalsIgnoreCase`.

Invocar `respuesta.equals("si")` cuando `respuesta` es `null` provoca `NullPointerException`. La forma segura es poner el literal conocido primero.

Mezclar `nextInt()` y `nextLine()` sin consumir el fin de línea puede hacer que `nextLine()` lea una cadena vacía. Para evitarlo, conviene usar una estrategia consistente de lectura.

#### Verificación

La verificación de `CompararStrings` es observar los cuatro booleanos. La verificación de `TextoIO` consiste en probar un nombre con espacios alrededor y una entrada vacía.

### Tema 7: Operadores, expresiones y precedencia · Básico · 35 min

Las expresiones son el mecanismo con el que un programa calcula valores y toma decisiones. Una expresión puede ser aritmética, relacional o lógica, y su resultado depende no solo de los operadores usados, sino también de la precedencia, la asociatividad y el tipo de los operandos.

#### Operadores y expresiones

Un operador es un símbolo que aplica una operación sobre uno o más operandos. Los operadores aritméticos (`+`, `-`, `*`, `/`, `%`) producen resultados numéricos; los relacionales (`<`, `>`, `<=`, `>=`, `==`, `!=`) producen valores booleanos; los lógicos (`&&`, `||`, `!`) combinan o niegan condiciones booleanas.

Una expresión es cualquier construcción que se evalúa para producir un valor. `a + b`, `edad >= 18` y `(edad >= 18) && tienePermiso` son expresiones. La legibilidad importa: una expresión correcta pero críptica es difícil de revisar y mantener. Cuando la intención no es obvia, conviene usar paréntesis o extraer variables intermedias con nombres claros.

#### Precedencia, asociatividad y cortocircuito

La precedencia define qué operador se evalúa primero. La asociatividad define cómo se agrupan operadores de la misma precedencia. En la práctica, la regla más útil es no depender de memoria frágil: si la expresión puede generar dudas, los paréntesis hacen explícita la intención.

Un caso común es la división entera. Si ambos operandos son enteros, `a / b` trunca la parte decimal. Por eso, `10 / 3` produce `3`. Para obtener un promedio decimal, hay que forzar una operación en punto flotante, por ejemplo `(5 + 4) / 2.0`.

Los operadores `&&` y `||` tienen evaluación en cortocircuito. En `nombre != null && nombre.length() > 0`, la segunda parte solo se evalúa si la primera es verdadera. Esto permite escribir guardas seguras contra `null`. Sin embargo, no conviene colocar efectos secundarios importantes en el lado derecho esperando que siempre se ejecuten.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t7 && cd /tmp/java-m0-t7
```

Creamos `Operadores.java`:

```java
public class Operadores {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        System.out.println(a + b);
        System.out.println(a - b);
        System.out.println(a * b);
        System.out.println(a / b); // división entera
        System.out.println(a % b);

        double promedio = (5 + 4) / 2.0;
        System.out.println(promedio);

        int edad = 20;
        boolean tienePermiso = true;
        boolean puedeEntrar = (edad >= 18) && tienePermiso;
        System.out.println(puedeEntrar);

        String nombre = null;
        boolean seguro = nombre != null && nombre.length() > 0;
        System.out.println(seguro);
    }
}
```

#### Recorrido del código

La primera parte muestra aritmética básica con enteros. La división `a / b` produce `3` porque ambos operandos son `int`. Luego, `(5 + 4) / 2.0` fuerza un resultado decimal: primero se suma, después se divide por `2.0`, que es `double`.

La expresión `(edad >= 18) && tienePermiso` combina una comparación relacional con un valor booleano. El resultado es `true` solo cuando ambas condiciones se cumplen. La última expresión usa cortocircuito: como `nombre != null` es falso, Java no evalúa `nombre.length()`, evitando un `NullPointerException`.

#### Ejecución

```bash
javac Operadores.java
java Operadores
```

Salida real observada (JDK 27, 2026-05-22):

```text
13
7
30
3
1
4.5
true
false
```

#### Errores frecuentes

Esperar `4.5` y obtener `4` es consecuencia de la división entera. La corrección es convertir uno de los operandos a `double` o usar un literal decimal.

Evaluar `nombre.length()` sin comprobar `null` provoca `NullPointerException`. La guarda con cortocircuito evita el problema.

Confundir `=` con `==` es otro error habitual. En Java, `=` asigna; `==` compara primitivos por valor y objetos por referencia.

#### Verificación

Se puede cambiar `(5 + 4) / 2.0` por `5 + 4 / 2.0` para observar el efecto de la precedencia. También se puede quitar la guarda `nombre != null &&` para comprobar el `NullPointerException`.

### Tema 8: Control de flujo: decisiones y repeticiones · Básico · 45 min

Un programa rara vez ejecuta todas sus líneas de forma lineal. Para resolver problemas reales necesita tomar decisiones y repetir acciones. Las estructuras de control de flujo permiten expresar esas decisiones y repeticiones de forma clara.

#### Decisiones

La estructura `if/else` evalúa una condición booleana y selecciona una rama. Su contrato es simple: la condición debe evaluarse a `true` o `false`. A diferencia de otros lenguajes, Java no acepta enteros como condición booleana.

La estructura `switch` es adecuada cuando se quiere seleccionar entre casos discretos. En su forma moderna con `->`, evita el *fall-through* accidental típico del `switch` clásico. El caso `default` es importante porque define qué ocurre ante valores no contemplados. Omitirlo puede dejar el programa sin respuesta clara frente a una entrada inesperada.

#### Repeticiones

El bucle `for` es adecuado cuando se conoce o se controla claramente la inicialización, la condición y el avance. El bucle `while` repite mientras la condición sea verdadera; es útil cuando no se sabe de antemano cuántas iteraciones habrá, pero sí la condición de continuidad. El bucle `do/while` ejecuta el cuerpo al menos una vez y luego evalúa la condición.

Todo bucle debe tener una condición de terminación alcanzable o una salida explícita. De lo contrario, produce un bucle infinito. Otro error frecuente es el *off-by-one*, es decir, iterar una vez de más o de menos por usar mal `<`, `<=` o los límites inicial/final.

Las sentencias `break` y `continue` permiten control fino. `break` sale del bucle o `switch`; `continue` salta a la siguiente iteración. Son útiles, pero conviene usarlas con moderación: si ocultan la lógica principal, es mejor reescribir la condición.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t8 && cd /tmp/java-m0-t8
```

Creamos `Flujo.java`:

```java
public class Flujo {
    public static void main(String[] args) {
        int edad = 20;
        if (edad >= 18) {
            System.out.println("Mayor de edad");
        } else {
            System.out.println("Menor de edad");
        }

        int dia = 3;
        String nombreDia = switch (dia) {
            case 1 -> "Lunes";
            case 2 -> "Martes";
            case 3 -> "Miércoles";
            default -> "Día no válido";
        };
        System.out.println(nombreDia);

        for (int i = 1; i <= 3; i++) {
            if (i == 2) continue;
            System.out.println("for:" + i);
        }

        int n = 3;
        while (n > 0) {
            System.out.println("while:" + n);
            n--;
        }

        int intentos = 0;
        do {
            intentos++;
        } while (intentos < 1);
        System.out.println("intentos:" + intentos);
    }
}
```

#### Recorrido del código

El primer bloque usa `if/else` para clasificar la edad. La condición es booleana y solo una de las ramas se ejecuta. El `switch` asigna un nombre al día; el caso `default` cubre valores fuera del rango esperado.

En el bucle `for`, la variable `i` avanza desde 1 hasta 3. Cuando `i == 2`, `continue` salta el resto de la iteración y pasa a la siguiente. El bucle `while` imprime una cuenta regresiva; la sentencia `n--` garantiza progreso hacia la condición de salida. El `do/while` incrementa `intentos` antes de evaluar la condición, por eso ejecuta al menos una vez.

#### Ejecución

```bash
javac Flujo.java
java Flujo
```

Salida real observada (JDK 27, 2026-05-22):

```text
Mayor de edad
Miércoles
for:1
for:3
while:3
while:2
while:1
intentos:1
```

#### Errores frecuentes

Un bucle infinito ocurre cuando la condición nunca deja de ser verdadera o no hay progreso. Antes de ejecutar un bucle, conviene identificar qué lo hace avanzar.

Un `switch` clásico sin `break` puede ejecutar casos siguientes por fall-through. La forma moderna con `->` reduce este riesgo.

El off-by-one aparece al confundir límites. Ante duda, conviene probar los bordes: primer valor, último valor y un caso fuera de rango.

#### Verificación

Cambiar `edad` a 16 debe producir `Menor de edad`. Cambiar `dia` a 9 debe producir `Día no válido`. El programa debe terminar sin bucles infinitos.

### Tema 9: Arreglos y métodos básicos · Básico · 50 min

Cuando un programa necesita manejar varios valores del mismo tipo, usar una variable por cada valor deja de ser práctico. Los arreglos permiten agrupar esos valores en una estructura única. Los métodos, por su parte, permiten darle nombre y reutilizar una operación, como calcular un promedio.

#### Arreglos

Un arreglo es un objeto que contiene una cantidad fija de elementos del mismo tipo. Su tamaño se define al crearlo y no cambia después. Los índices comienzan en 0 y llegan hasta `length - 1`. El campo `length` indica la cantidad de elementos; no es un método.

Los arreglos son útiles cuando el tamaño es conocido y la estructura es homogénea. Para colecciones que crecen o se reducen dinámicamente, más adelante conviene usar estructuras como `ArrayList`. Acceder a un índice fuera del rango válido provoca `ArrayIndexOutOfBoundsException`.

Se puede recorrer un arreglo con un `for` clásico cuando se necesita el índice, o con un `for-each` cuando solo interesa el valor. Elegir uno u otro depende de la necesidad: leer todos los elementos suele ser claro con `for-each`; modificar posiciones o comparar índices requiere `for`.

#### Métodos básicos

Un método es un bloque de código con nombre, parámetros, tipo de retorno y cuerpo. Sirve para encapsular una operación, evitar duplicación y hacer más legible el programa. Un método `static` puede invocarse sin crear una instancia de la clase, lo que resulta adecuado para utilidades simples como las de este módulo.

En Java, los argumentos se pasan por valor. Cuando se pasa un arreglo, lo que se copia por valor es la referencia al objeto arreglo. Por eso, un método que recibe un arreglo puede leer sus elementos y también modificarlos si el código lo hace. Este detalle importa al diseñar el contrato del método: si no debe modificar el arreglo, hay que evitarlo y dejarlo claro.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m0-t9 && cd /tmp/java-m0-t9
```

Creamos `Notas.java`:

```java
public class Notas {
    static double promedio(int[] valores) {
        if (valores.length == 0) {
            return 0.0;
        }
        int suma = 0;
        for (int i = 0; i < valores.length; i++) {
            suma += valores[i];
        }
        return (double) suma / valores.length;
    }

    static void imprimir(int[] valores) {
        for (int nota : valores) {
            System.out.println("Nota: " + nota);
        }
    }

    public static void main(String[] args) {
        int[] notas = {10, 8, 9, 7};
        imprimir(notas);
        System.out.println("Promedio: " + promedio(notas));
        System.out.println("Cantidad: " + notas.length);
    }
}
```

#### Recorrido del código

El método `promedio` recibe un arreglo de enteros y devuelve un `double`. Primero considera el caso de arreglo vacío para evitar una división por cero. Luego acumula la suma con un `for` clásico y devuelve el promedio. El cast a `double` es necesario para evitar la división entera.

El método `imprimir` recorre el arreglo con `for-each` porque solo necesita leer cada valor. El método `main` crea el arreglo, delega la impresión y el cálculo, y finalmente muestra la cantidad de elementos usando `length`.

Separar el cálculo de la impresión es una decisión importante. `promedio` calcula y devuelve un valor; `imprimir` se encarga de la salida. Esta separación hace que el cálculo sea más fácil de reutilizar y probar.

#### Ejecución

```bash
javac Notas.java
java Notas
```

Salida real observada (JDK 27, 2026-05-22):

```text
Nota: 10
Nota: 8
Nota: 9
Nota: 7
Promedio: 8.5
Cantidad: 4
```

#### Errores frecuentes

Acceder a `valores[valores.length]` provoca `ArrayIndexOutOfBoundsException` porque el último índice válido es `length - 1`. La condición correcta en un recorrido por índice es `i < valores.length`.

Calcular el promedio con división entera devuelve un resultado truncado. Si la suma es 34 y la cantidad es 4, la división entera produce 8, no 8.5. El cast a `double` corrige el problema.

Si el arreglo recibido es `null`, acceder a `length` provocará `NullPointerException`. Dependiendo del contrato, se puede validar y lanzar una excepción clara o definir un comportamiento explícito.

#### Verificación

Una verificación simple es cambiar las notas a `{10, 10, 9}` y comprobar que el promedio sea `9.666...`. También conviene probar el caso vacío para confirmar que el método devuelve `0.0` según el contrato definido.

## Cierre del módulo

Este módulo recorrió el ciclo básico de trabajo en Java: instalar y verificar el entorno, comprender la relación entre código fuente, bytecode y JVM, escribir programas desde cero, y usar los elementos fundamentales del lenguaje. Con esta base, el siguiente paso natural es organizar el código en clases y objetos, y empezar a modelar comportamiento con mayor estructura.
