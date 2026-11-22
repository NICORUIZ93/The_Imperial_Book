# Módulo 0: Java desde cero — del primer programa al modelo de ejecución

Este módulo es el punto de partida real de la ruta Java. No asume experiencia previa en Java. El objetivo es que puedas instalar el JDK, escribir programas pequeños sin depender de un IDE, entender qué hace la JVM al ejecutarlos y leer errores comunes con criterio.

## Antes de comenzar: instalación guiada por sistema operativo

Necesitas un **JDK** (Java Development Kit). No alcanza con tener “Java” instalado para ejecutar aplicaciones: para programar necesitas el compilador `javac`, la JVM `java` y las herramientas básicas del kit.

| Herramienta | Qué hace | Cuándo la usas |
|---|---|---|
| `javac` | Compila código fuente `.java` a bytecode `.class` | Cada vez que cambias el código fuente |
| `java` | Inicia la JVM y ejecuta una clase | Para correr el programa compilado |
| `jar`, `jshell`, `jcmd`, `jfr` | Empaquetado, REPL, diagnóstico, profiling | Más adelante; conviene saber que vienen con el JDK |

#### Instalación por sistema operativo

| Sistema | Instalación recomendada | Verificación |
|---|---|---|
| Windows | Instala un JDK LTS (por ejemplo Temurin). Durante la instalación, habilita la opción que configura `JAVA_HOME` si está disponible. | Abre una terminal nueva y ejecuta `java -version` y `javac -version`. |
| macOS | `brew install --cask temurin` o instalador oficial. En Apple Silicon usa la variante ARM64. | `java -version`, `javac -version`, `/usr/libexec/java_home`. |
| Ubuntu/Debian | `sudo apt update && sudo apt install -y openjdk-21-jdk` (o la versión LTS disponible en tu distribución). | `java -version` y `javac -version`. |

#### Verificación mínima

```bash
java -version
javac -version
```

Ambos comandos deben responder. Si `java` funciona pero `javac` no, instalaste un runtime sin compilador.

#### Prueba de humo

Crea un archivo llamado `Hola.java`:

```java
public class Hola {
    public static void main(String[] args) {
        System.out.println("Mi entorno Java funciona");
    }
}
```

Compila y ejecuta:

```bash
javac Hola.java
java Hola
```

Salida esperada:

```text
Mi entorno Java funciona
```

Si ves `class Hola is public, should be declared in a file named Hola.java`, el nombre del archivo no coincide con el nombre de la clase pública. Si ves `Could not find or load main class Hola`, estás en la carpeta equivocada o escribiste `java Hola.class`.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Explicar qué es programar y qué aporta Java |
| 2 | Describir el flujo código fuente → bytecode → JVM |
| 3 | Verificar que el entorno JDK está correctamente instalado |
| 4 | Crear, compilar y ejecutar un programa sin IDE |
| 5 | Elegir tipos primitivos y hacer conversiones seguras |
| 6 | Trabajar con texto, salida, entrada y comparaciones correctas |
| 7 | Escribir expresiones y entender precedencia/división entera |
| 8 | Usar condicionales y bucles para controlar el flujo |
| 9 | Guardar varios valores en arreglos y extraer lógica a métodos |

## Aprende construyendo

### Tema 1: Qué es programar y qué problema resuelve Java · Básico · 25 min

**Caso guía**

Tienes que calcular el precio final de un producto con IVA. La regla es simple: tomar el precio base, aplicar el impuesto y mostrar el resultado. Es un caso pequeño, pero obliga a lo esencial de programar: datos, proceso, salida y una forma de verificar que el resultado es correcto.

**Concepto clave / modelo mental**

Programar es describir un procedimiento con precisión suficiente para que una máquina lo ejecute. Ese procedimiento suele tener cuatro partes:

1. **Entrada**: datos que llegan al programa (argumentos, teclado, archivo, red).
2. **Proceso**: reglas que transforman esos datos.
3. **Salida**: resultado observable (pantalla, archivo, respuesta).
4. **Casos de error**: qué ocurre cuando la entrada o el contexto no son los esperados.

Java es un lenguaje compilado a bytecode, de tipado estático y orientado a objetos. Eso lo hace útil cuando quieres código verificable antes de ejecutar, una base grande de librerías y una ejecución portable sobre la JVM. No es la herramienta para todo: para scripts muy pequeños o prototipos rápidos puede haber opciones más livianas; para sistemas con restricciones muy específicas puede convenir otro lenguaje.

**Implementación desde cero**

Crea `PrecioFinal.java`:

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

**Desglose del código**

- `public class PrecioFinal` define la clase. En Java, el código ejecutable vive dentro de clases.
- `main` es el punto de entrada que la JVM busca al iniciar el programa.
- `double` guarda números decimales. Aquí lo usamos para precio e IVA.
- `precioBase + (precioBase * iva)` expresa la regla de negocio: precio más impuesto.
- `System.out.println(...)` envía texto a la salida estándar. Es la forma más simple de observar el resultado.

**Ejecución y salida real**

```bash
javac PrecioFinal.java
java PrecioFinal
```

```text
Precio base: 100.0
IVA: 0.21
Precio final: 121.0
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `class PrecioFinal is public, should be declared in a file named PrecioFinal.java` | El archivo se llama distinto a la clase pública | Renombra el archivo o la clase para que coincidan |
| `Could not find or load main class PrecioFinal` | Ejecutaste desde otra carpeta o usaste `PrecioFinal.class` | Entra a la carpeta del `.class` y ejecuta `java PrecioFinal` |
| El resultado no cambia tras editar | Ejecutaste el `.class` viejo | Vuelve a compilar con `javac` antes de ejecutar |

**Verificación rápida**

Cambia `precioBase` a `200.0`, recompila y ejecuta. La salida debe mostrar `Precio final: 242.0`. Si cambia, el programa está calculando y no solo imprimiendo un texto fijo.

### Tema 2: JDK, JRE, JVM y bytecode (WORA) · Básico · 30 min

**Contexto y para qué sirve**

Muchos errores de principiantes no son de lógica, sino de entorno: confunden JDK con JRE, o ejecutan el `.class` como si fuera el `.java`. Entender el flujo de compilación y ejecución te permite ubicar dónde está el problema antes de tocar el código a ciegas.

**Concepto clave / modelo mental**

El flujo básico de Java es:

```text
Código fuente (.java)
        │
        │ javac
        ▼
Bytecode (.class)
        │
        │ java / JVM
        ▼
Ejecución en el sistema
```

- **JDK**: kit para desarrollar. Incluye compilador, JVM y herramientas.
- **JVM**: máquina virtual que ejecuta bytecode.
- **Bytecode**: formato intermedio. No es Java fuente ni código máquina nativo de tu CPU.
- **WORA** (“Write Once, Run Anywhere”): el mismo bytecode puede ejecutarse en distintas plataformas si existe una JVM compatible. La portabilidad es del bytecode/modelo de ejecución; el acceso a archivos, rutas, codificaciones o librerías nativas sigue dependiendo del entorno.

**Implementación desde cero**

Crea `HolaJVM.java`:

```java
public class HolaJVM {
    public static void main(String[] args) {
        System.out.println("Hola desde la JVM");
        System.out.println("Versión Java: " + System.getProperty("java.version"));
    }
}
```

Compila, lista archivos y ejecuta:

```bash
javac HolaJVM.java
ls
java HolaJVM
```

Para inspeccionar el bytecode:

```bash
javap -c HolaJVM
```

**Desglose del código**

- `javac HolaJVM.java` genera `HolaJVM.class`. Ese archivo contiene bytecode.
- `java HolaJVM` recibe el **nombre de la clase**, no el nombre del archivo `.class`.
- `System.getProperty("java.version")` consulta una propiedad del runtime. Sirve para observar qué JVM está ejecutando.
- `javap -c` desensambla el bytecode. No hace falta dominarlo ahora; basta con reconocer que existe una representación intermedia.

**Ejecución y salida real**

```text
Hola desde la JVM
Versión Java: 27.0.1.0.2
```

La versión puede variar en tu máquina. El punto importante es que el programa se compila a `.class` y luego lo ejecuta la JVM.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Error: Could not find or load main class HolaJVM.class` | Pasaste el nombre del archivo en lugar del nombre de la clase | Ejecuta `java HolaJVM` |
| Cambiaste el código pero la salida es igual | No recompilaste | Ejecuta `javac HolaJVM.java` y luego `java HolaJVM` |
| `javac: command not found` / no reconocido | JDK no instalado o PATH mal configurado | Revisa la instalación del JDK y la variable PATH |

**Verificación rápida**

```bash
javac HolaJVM.java
java HolaJVM
javap -c HolaJVM | head
```

Debes ver el archivo `.class`, la salida del programa y un encabezado de bytecode generado por `javap`.

### Tema 3: Instalar JDK y verificar entorno · Básico · 30 min

**Contexto y para qué sirve**

Un entorno mal configurado hace perder tiempo: el código puede estar bien, pero el sistema no encuentra el compilador o usa una versión distinta a la que esperas. Verificar el entorno antes de programar evita diagnósticos falsos y te da un punto de partida confiable.

**Concepto clave / modelo mental**

La verificación de entorno tiene tres capas:

1. **Binarios disponibles**: `java` y `javac` responden en la terminal.
2. **Coherencia**: ambos pertenecen al JDK que quieres usar.
3. **Ejecución real**: puedes compilar y ejecutar un programa simple.

`JAVA_HOME` es la variable de entorno que apunta al directorio del JDK. Muchas herramientas la usan (Gradle, Maven, IDEs, servidores CI). `PATH` es la lista de directorios donde el sistema busca ejecutables.

**Implementación desde cero**

Comandos de diagnóstico:

```bash
java -version
javac -version
```

En macOS, también es útil:

```bash
/usr/libexec/java_home
```

En Windows PowerShell:

```powershell
echo $env:JAVA_HOME
where.exe java
where.exe javac
```

Crea `EntornoOk.java` para confirmar el runtime:

```java
public class EntornoOk {
    public static void main(String[] args) {
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("Java vendor: " + System.getProperty("java.vendor"));
        System.out.println("OS: " + System.getProperty("os.name"));
    }
}
```

**Desglose del código**

- `System.getProperty("java.version")` muestra la versión de Java que está usando la JVM actual.
- `java.vendor` indica la distribución/proveedor del JDK.
- `os.name` confirma el sistema operativo desde el que se ejecuta.
- Este programa no prueba toda tu instalación, pero sí prueba el circuito completo: compilación + ejecución + propiedades del runtime.

**Ejecución y salida real**

Ejemplo verificado en esta máquina:

```text
Java version: 27.0.1.0.2
Java vendor: Eclipse Adoptium
OS: Mac OS X
```

Tu salida puede ser distinta. Lo relevante es que los tres valores aparezcan y tengan sentido para tu equipo.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `javac` no se reconoce | Instalaste JRE, o el JDK no está en PATH | Instala JDK y revisa `PATH`/`JAVA_HOME` |
| `java` y `javac` muestran versiones muy distintas | Hay múltiples instalaciones en PATH | Ajusta PATH para que apunte al JDK correcto |
| Cambiaste variables y sigue fallando | La terminal no recargó el entorno | Abre una terminal nueva y repite la verificación |

**Verificación rápida**

```bash
javac EntornoOk.java
java EntornoOk
```

Si compila y ejecuta, el entorno base está listo para los siguientes temas.

### Tema 4: Primer programa desde cero, sin IDE · Básico · 35 min

**Caso guía**

Quieres un programa pequeño que salude por nombre. Si el usuario no pasa un nombre, el programa debe indicar cómo usarlo. Este caso te obliga a cubrir el ciclo completo: archivo, clase, `main`, compilación, ejecución y argumentos.

**Concepto clave / modelo mental**

Un programa Java mínimo ejecutable necesita:

- un archivo `.java`;
- una clase;
- un método `main` con la firma que la JVM espera;
- una compilación exitosa;
- una ejecución con `java NombreDeClase`.

La firma estándar es:

```java
public static void main(String[] args)
```

| Parte | Significado |
|---|---|
| `public` | La JVM puede invocarlo desde fuera de la clase |
| `static` | No requiere crear un objeto para ejecutarse |
| `void` | No devuelve un valor |
| `String[] args` | Recibe argumentos de línea de comandos |

**Implementación desde cero**

Crea `SaludoArgs.java`:

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

**Desglose del código**

- `args` contiene los argumentos pasados por terminal. Si ejecutas `java SaludoArgs Ada`, `args[0]` es `"Ada"`.
- `args.length == 0` detecta que no se pasó ningún argumento.
- `return;` termina la ejecución de `main` en ese punto.
- La concatenación `"Hola, " + nombre` construye el mensaje final.

**Ejecución y salida real**

```bash
javac SaludoArgs.java
java SaludoArgs
java SaludoArgs Ada
```

```text
Uso: java SaludoArgs <nombre>
```

```text
Hola, Ada
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Main method not found in class ...` | La firma de `main` no es correcta | Usa `public static void main(String[] args)` |
| `ArrayIndexOutOfBoundsException` al leer `args[0]` | Asumiste que siempre hay argumentos | Valida `args.length` antes de acceder |
| Compila pero no corre desde otra carpeta | El classpath/carpeta actual no contiene la clase | Ejecuta desde la carpeta donde está el `.class`, o usa `-cp` |

**Verificación rápida**

```bash
javac SaludoArgs.java
java SaludoArgs
java SaludoArgs Linus
```

Debes ver el mensaje de uso en el primer caso y el saludo personalizado en el segundo.

### Tema 5: Tipos primitivos, variables y conversiones · Básico · 45 min

**Contexto y para qué sirve**

Los tipos definen qué valores puede guardar una variable y qué operaciones tienen sentido. Elegir mal un tipo puede producir pérdida de datos, desbordamientos o errores de compilación. Este tema te da la base para representar números, caracteres y valores booleanos con criterio.

**Concepto clave / modelo mental**

Java tiene ocho tipos primitivos:

| Tipo | Qué representa | Ejemplo | Observación |
|---|---|---|---|
| `byte` | Entero pequeño | `byte b = 10;` | -128 a 127 |
| `short` | Entero corto | `short s = 300;` | Poco frecuente |
| `int` | Entero común | `int n = 42;` | Tipo entero por defecto |
| `long` | Entero grande | `long l = 9_000_000_000L;` | Sufijo `L` |
| `float` | Decimal simple precisión | `float f = 1.5f;` | Sufijo `f` |
| `double` | Decimal doble precisión | `double d = 1.5;` | Tipo decimal por defecto |
| `char` | Unidad UTF-16 | `char c = 'A';` | Comillas simples |
| `boolean` | Verdadero/falso | `boolean ok = true;` | No es 0/1 |

Conversión **amplia** (widening) ocurre cuando pasas a un tipo con más capacidad, por ejemplo `int` a `double`. Conversión **estrecha** (narrowing) ocurre al revés y puede perder información; por eso Java exige cast explícito.

**Implementación desde cero**

Crea `TiposYConversiones.java`:

```java
public class TiposYConversiones {
    public static void main(String[] args) {
        int entero = 42;
        long poblacion = 8_000_000_000L;
        double precio = 19.99;
        char inicial = 'J';
        boolean activo = true;

        double enteroComoDouble = entero;      // widening
        int precioTruncado = (int) precio;     // narrowing

        System.out.println(entero);
        System.out.println(poblacion);
        System.out.println(precio);
        System.out.println(inicial);
        System.out.println(activo);
        System.out.println(enteroComoDouble);
        System.out.println(precioTruncado);
    }
}
```

**Desglose del código**

- `8_000_000_000L` usa guiones bajos para legibilidad y sufijo `L` porque el valor no cabe en un `int`.
- `enteroComoDouble` es una conversión amplia: no hay pérdida de rango para ese valor.
- `(int) precio` trunca la parte decimal. No redondea; corta.
- `char` usa comillas simples; `String` usa comillas dobles.

**Ejecución y salida real**

```bash
javac TiposYConversiones.java
java TiposYConversiones
```

```text
42
8000000000
19.99
J
true
42.0
19
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `integer number too large` | Literal entero fuera de rango de `int` sin sufijo `L` | Usa `long` y agrega `L` |
| `possible lossy conversion from double to int` | Intentaste narrowing sin cast | Haz cast explícito solo si aceptas la pérdida |
| Overflow silencioso: `Integer.MAX_VALUE + 1` da negativo | El `int` se desborda | Usa `long` o `Math.addExact` para detectar |

Ejemplo de overflow:

```java
public class Desbordamiento {
    public static void main(String[] args) {
        int maximo = Integer.MAX_VALUE;
        System.out.println(maximo);
        System.out.println(maximo + 1);
    }
}
```

Salida real:

```text
2147483647
-2147483648
```

**Verificación rápida**

```bash
javac TiposYConversiones.java && java TiposYConversiones
javac Desbordamiento.java && java Desbordamiento
```

Confirma que `19.99` se trunca a `19` y que el desbordamiento de `int` no lanza excepción, sino que da vuelta al rango.

### Tema 6: String, entrada/salida y formato · Básico · 40 min

**Caso guía**

Necesitas pedir el nombre de una persona, mostrar un saludo y comparar una respuesta textual. Es un caso cotidiano en aplicaciones de consola y te expone a las trampas más comunes de `String`: inmutabilidad, espacios y comparación por contenido.

**Concepto clave / modelo mental**

- `System.out.println` imprime y agrega salto de línea; `System.out.print` imprime sin salto.
- `String` es una clase inmutable: sus métodos devuelven nuevos strings, no modifican el original.
- La comparación de contenido entre strings se hace con `.equals()`, no con `==`.
- `Scanner` lee texto desde una fuente, por ejemplo `System.in`.

```java
String a = "java";
String b = new String("java");
a == b      // compara referencias
a.equals(b) // compara contenido
```

**Implementación desde cero**

Crea `TextoIO.java`:

```java
import java.util.Scanner;

public class TextoIO {
    public static void main(String[] args) {
        String lenguaje = "Java";
        System.out.println("Lenguaje: " + lenguaje);
        System.out.println("Longitud: " + lenguaje.length());
        System.out.println("Mayúsculas: " + lenguaje.toUpperCase());

        Scanner scanner = new Scanner(System.in);
        System.out.print("Escribe tu nombre: ");
        String nombre = scanner.nextLine();
        System.out.println("Hola, " + nombre.trim());
        scanner.close();
    }
}
```

Crea `CompararStrings.java`:

```java
public class CompararStrings {
    public static void main(String[] args) {
        String a = "java";
        String b = new String("java");

        System.out.println(a == b);
        System.out.println(a.equals(b));
        System.out.println("si".equalsIgnoreCase("SI"));
    }
}
```

**Desglose del código**

- `lenguaje.length()` devuelve la cantidad de caracteres.
- `toUpperCase()` devuelve otro `String`; `lenguaje` sigue valiendo `"Java"`.
- `scanner.nextLine()` lee una línea completa de entrada.
- `trim()` quita espacios al inicio y final, útil para entrada de usuario.
- `equalsIgnoreCase` compara contenido ignorando mayúsculas/minúsculas.

**Ejecución y salida real**

Para `CompararStrings`:

```bash
javac CompararStrings.java
java CompararStrings
```

```text
false
true
true
```

Para `TextoIO`, la salida depende de la entrada. Si escribes ` Ada `:

```text
Lenguaje: Java
Longitud: 4
Mayúsculas: JAVA
Escribe tu nombre:  Ada 
Hola, Ada
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Dos strings iguales dan `false` con `==` | Comparaste referencias, no contenido | Usa `equals()` o `equalsIgnoreCase()` |
| `NullPointerException` al hacer `respuesta.equals("si")` | `respuesta` es `null` | Usa `"si".equals(respuesta)` |
| `Scanner` mezcla `nextInt()` y `nextLine()` | Queda un salto de línea pendiente | Consume el salto con `nextLine()` o usa una estrategia consistente |

**Verificación rápida**

```bash
javac CompararStrings.java && java CompararStrings
```

Verifica que `==` devuelva `false` y `equals()` devuelva `true` para el mismo contenido creado con `new String(...)`.

### Tema 7: Operadores, expresiones y precedencia · Básico · 35 min

**Contexto y para qué sirve**

Las expresiones combinan valores y operadores para producir un resultado. Si no entiendes precedencia, tipos numéricos y operadores lógicos, puedes escribir código que compila pero calcula mal. Este tema fija las reglas que después vas a usar en condiciones, bucles y cálculos.

**Concepto clave / modelo mental**

Grupos de operadores que usarás desde el inicio:

| Grupo | Operadores | Ejemplo | Resultado |
|---|---|---|---|
| Aritméticos | `+ - * / %` | `10 / 3` | `3` si ambos son `int` |
| Comparación | `== != < > <= >=` | `a > b` | `boolean` |
| Lógicos | `&& || !` | `edad >= 18 && activo` | `boolean` |
| Asignación compuesta | `+= -= *= /=` | `x += 2` | modifica `x` |

Dos reglas prácticas:

- La división entre enteros descarta decimales.
- Cuando una expresión tenga varias operaciones, usa paréntesis para hacer explícita la intención.

**Implementación desde cero**

Crea `Operadores.java`:

```java
public class Operadores {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;

        System.out.println(a + b);
        System.out.println(a - b);
        System.out.println(a * b);
        System.out.println(a / b);
        System.out.println(a % b);

        double promedio = 5 / 2.0;
        System.out.println(promedio);

        boolean puedeEntrar = (a > 5) && (b < 5);
        System.out.println(puedeEntrar);
    }
}
```

**Desglose del código**

- `a / b` con dos `int` produce división entera: `3`.
- `%` devuelve el resto: `10 % 3` es `1`.
- `5 / 2.0` fuerza una operación con decimal, por eso el resultado es `2.5`.
- `&&` solo es `true` cuando ambas condiciones son verdaderas.
- Los paréntesis en `puedeEntrar` no son obligatorios aquí, pero hacen la intención visible.

**Ejecución y salida real**

```bash
javac Operadores.java
java Operadores
```

```text
13
7
30
3
1
2.5
true
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Esperabas `2.5` y obtuviste `2` | División entera entre `int` | Convierte uno de los operandos a `double` |
| Condición difícil de leer o con bug | Precedencia poco clara | Agrega paréntesis |
| `=` en vez de `==` | Confusión entre asignación y comparación | Usa `==` para comparar primitivos; en booleanos Java suele detectar el error de tipo |

**Verificación rápida**

```bash
javac Operadores.java && java Operadores
```

Cambia `5 / 2.0` por `5 / 2` y observa la diferencia. Ese cambio pequeño explica muchos bugs reales.

### Tema 8: Control de flujo: decisiones y repeticiones · Básico · 45 min

**Caso guía**

Imagina un programa que valida la edad de una persona, traduce un número de día y cuenta hacia atrás. Son tareas distintas, pero todas dependen de la misma capacidad: decidir qué ejecutar y repetir instrucciones con una condición clara.

**Concepto clave / modelo mental**

Las estructuras básicas son:

- `if / else`: ejecuta una rama según una condición booleana.
- `switch`: elige entre casos discretos.
- `for`: repite cuando conoces o controlas el ciclo de iteración.
- `while`: repite mientras una condición sea verdadera.
- `do/while`: ejecuta al menos una vez y luego evalúa.
- `break` y `continue`: alteran el ciclo, pero conviene usarlos con moderación.

**Implementación desde cero**

Crea `Flujo.java`:

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
            default -> "Otro día";
        };
        System.out.println(nombreDia);

        for (int i = 1; i <= 3; i++) {
            System.out.println("for:" + i);
        }

        int n = 3;
        while (n > 0) {
            System.out.println("while:" + n);
            n--;
        }
    }
}
```

**Desglose del código**

- `if (edad >= 18)` evalúa una condición booleana. Solo una rama se ejecuta.
- El `switch` moderno con `->` devuelve un valor y evita `break` en cada caso.
- `for (int i = 1; i <= 3; i++)` concentra inicialización, condición y avance.
- En el `while`, `n--` es esencial: sin avance hacia la condición de salida, el bucle sería infinito.

**Ejecución y salida real**

```bash
javac Flujo.java
java Flujo
```

```text
Mayor de edad
Miércoles
for:1
for:2
for:3
while:3
while:2
while:1
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El programa nunca termina | Bucle sin condición de salida o sin avance | Verifica que la condición pueda volverse falsa |
| `incompatible types: int cannot be converted to boolean` | Usaste `=` en vez de `==` | Corrige la comparación |
| `switch` no cubre valores esperados | Falta `default` o casos | Agrega `default` y revisa los valores posibles |

**Verificación rápida**

```bash
javac Flujo.java && java Flujo
```

Cambia `edad`, `dia` y el límite del `for`. Antes de ejecutar, predice la salida; luego confirma.

### Tema 9: Arreglos y métodos básicos · Básico · 50 min

**Caso guía**

Tienes varias notas de un alumno y quieres mostrar cada una y calcular el promedio. Podrías crear `nota1`, `nota2`, `nota3`, pero esa solución no escala. Este caso pide dos herramientas: una estructura para guardar varios valores y métodos para separar responsabilidades.

**Concepto clave / modelo mental**

Un **arreglo** es una estructura de tamaño fijo con elementos del mismo tipo. Se accede por índice, empezando en `0`.

```text
índices:  0   1   2   3
valores: [10,  8,  9,  7]
length = 4
```

Un **método** es un bloque con nombre que puede recibir parámetros y devolver un resultado. Permite nombrar una intención: `promedio`, `imprimir`, `calcularTotal`.

**Implementación desde cero**

Crea `ArreglosMetodos.java`:

```java
public class ArreglosMetodos {
    public static void main(String[] args) {
        int[] notas = {10, 8, 9, 7};

        imprimirNotas(notas);
        System.out.println("Promedio: " + promedio(notas));
    }

    static void imprimirNotas(int[] valores) {
        for (int i = 0; i < valores.length; i++) {
            System.out.println("nota[" + i + "]=" + valores[i]);
        }
    }

    static double promedio(int[] valores) {
        int suma = 0;
        for (int valor : valores) {
            suma += valor;
        }
        return (double) suma / valores.length;
    }
}
```

**Desglose del código**

- `int[] notas = {10, 8, 9, 7};` crea el arreglo con cuatro elementos.
- `valores.length` da el tamaño total; el último índice válido es `length - 1`.
- `imprimirNotas` no devuelve valor (`void`): su efecto es imprimir.
- `promedio` devuelve `double`. El cast `(double) suma` evita la división entera.
- El `for-each` en `promedio` es adecuado porque no necesitamos el índice.

**Ejecución y salida real**

```bash
javac ArreglosMetodos.java
java ArreglosMetodos
```

```text
nota[0]=10
nota[1]=8
nota[2]=9
nota[3]=7
Promedio: 8.5
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | Accediste a un índice fuera de `0..length-1` | Revisa el límite del bucle y el índice usado |
| Promedio `8` en vez de `8.5` | División entera | Convierte `suma` o `valores.length` a `double` |
| `ArithmeticException: / by zero` o resultado inválido | Arreglo vacío | Valida `valores.length == 0` antes de dividir |

**Verificación rápida**

```bash
javac ArreglosMetodos.java && java ArreglosMetodos
```

Prueba con `int[] notas = {10, 10, 9};`. El promedio debe ser `9.666...`, lo que confirma que la división no es entera.

## Cierre del módulo

En este módulo pasaste de “no tengo Java instalado” a entender el ciclo completo de trabajo: entorno, compilación, ejecución, tipos básicos, texto, operadores, flujo, arreglos y métodos. En el siguiente módulo ese código deja de ser una secuencia suelta y empieza a organizarse en clases y objetos.
