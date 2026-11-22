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

**Fundamento técnico y modelo mental**

**Definición formal.** Un *programa* es una especificación finita y ejecutable de un cómputo: dado un estado de entrada `E`, produce una transformación determinista o controlada hacia un estado/salida `S`, sujeto a reglas del lenguaje y del entorno de ejecución. *Programar* es construir esa especificación en un lenguaje con sintaxis y semántica definidas.

**Contrato / invariantes / reglas.** En Java, el código fuente se escribe en unidades de compilación `.java`. Una clase pública `C` debe declararse en un archivo llamado `C.java`. El punto de entrada estándar de una aplicación es un método con firma exacta `public static void main(String[] args)`. El compilador (`javac`) valida sintaxis y tipos antes de generar bytecode; la JVM ejecuta ese bytecode bajo su modelo de ejecución y verificación.

**Modelo mental.** Piensa en un programa como una receta verificable: entrada (ingredientes), proceso (pasos), salida (plato) y manejo de errores (qué pasa si falta un ingrediente). Java agrega un “control de calidad” antes de cocinar: el compilador revisa la receta.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

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
- `double` guarda números decimales en formato IEEE 754 de doble precisión.
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

**Caso guía / Contexto**

Compilas `HolaJVM.java`, obtienes `HolaJVM.class` y lo ejecutas en tu máquina. La pregunta clave: ¿por qué no ejecutas el `.java` directamente, y por qué ese `.class` puede funcionar en otro sistema con una JVM compatible? Entender JDK, JRE, JVM, bytecode y WORA te permite ubicar si un fallo es de código, compilación o entorno.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo / tenerlo en cuenta | Error/riesgo común |
|---|---|---|---|---|
| **JDK** (Java Development Kit) | Kit de desarrollo: incluye compilador (`javac`), herramientas (`jar`, `javadoc`, `javap`, `jshell`, etc.) y un runtime/JVM para ejecutar. | Desarrollar, compilar, depurar y empaquetar aplicaciones Java. | Siempre que escribas/compiles código Java. | Instalar solo un runtime y luego no tener `javac`. |
| **JRE** (Java Runtime Environment) | Runtime histórico orientado a ejecutar aplicaciones Java: JVM + bibliotecas estándar de ejecución, sin herramientas de desarrollo completas. | Ejecutar programas Java ya compilados. | En despliegues antiguos; hoy muchos JDKs incluyen runtime y se distribuyen runtimes custom con `jlink`. | Confundir JRE con JDK y esperar poder compilar. |
| **JVM** (Java Virtual Machine) | Máquina virtual que carga, verifica e interpreta/compila (JIT) bytecode según la Java Virtual Machine Specification. | Ejecutar `.class`/JAR de forma portable sobre el sistema anfitrión. | Cada vez que corres `java ...`; también al entender rendimiento/memoria. | Creer que “la JVM es Java” y olvidar versión, flags, GC y entorno. |
| **Bytecode** | Formato intermedio de instrucciones (`.class`) generado por el compilador Java desde `.java`. | Separar compilación de ejecución; permitir verificación y portabilidad. | Al depurar comportamiento, inspeccionar con `javap`, o entender errores de carga/versionado. | Editar `.class` a mano o confundir bytecode con código fuente. |
| **WORA** (Write Once, Run Anywhere) | Propiedad objetivo de portabilidad: el mismo bytecode puede ejecutarse en cualquier plataforma con una JVM compatible. | Reducir acoplamiento a CPU/SO en aplicaciones portables. | Cuando el código usa APIs estándar y evita supuestos de plataforma. | Asumir portabilidad total: archivos, rutas, encoding, librerías nativas, versión de JVM pueden romperla. |

**Contrato / invariantes / reglas.** `javac` traduce `.java` a `.class` (bytecode). `java` recibe el **nombre de clase** con `main(String[])`, no la ruta del archivo `.class`. El bytecode es independiente de CPU/SO, pero la ejecución depende de una JVM compatible y del entorno (sistema de archivos, encoding, red, librerías nativas). Un `.class` compilado con una versión mayor puede fallar en una JVM más vieja (`UnsupportedClassFileError`).

**Modelo mental.** El `.java` es el guion; `javac` (JDK) lo traduce a bytecode, un idioma intermedio; la JVM es el actor que lo ejecuta en cada escenario (Windows/Linux/macOS). WORA funciona si el guion no depende de trucos específicos del escenario.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

Crea `HolaJVM.java`:

```java
public class HolaJVM {
    public static void main(String[] args) {
        System.out.println("Hola desde la JVM");
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("Java vendor: " + System.getProperty("java.vendor"));
        System.out.println("OS: " + System.getProperty("os.name"));
    }
}
```

Compila, inspecciona artefactos y ejecuta:

```bash
javac HolaJVM.java
ls
java HolaJVM
javap -c HolaJVM | head -20
```

**Desglose del código**

- `javac HolaJVM.java` (herramienta del **JDK**) genera `HolaJVM.class` (**bytecode**).
- `java HolaJVM` inicia la **JVM**, carga la clase y busca `main(String[])`.
- `System.getProperty(...)` muestra que el mismo bytecode observa el runtime/OS real donde corre; esto ilustra el límite práctico de **WORA**: el código es portable, pero el entorno puede variar.
- `javap -c` desensambla bytecode para inspección; confirma que existe una representación intermedia.

**Ejecución y salida real**

Ejemplo real (la versión/vendor/OS variarán en tu máquina):

```text
Hola desde la JVM
Java version: 27.0.1.0.2
Java vendor: Homebrew
OS: Mac OS X
```

Lo importante: se generó `.class`, la JVM lo ejecutó y `javap` mostró bytecode.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Error: Could not find or load main class HolaJVM.class` | Pasaste nombre de archivo en vez de clase | Ejecuta `java HolaJVM` |
| `javac: command not found` / no reconocido | JDK no instalado o PATH mal configurado | Instala JDK y verifica `javac -version` |
| `UnsupportedClassFileError` | Compilaste con JDK más nuevo que la JVM que ejecuta | Alinea versiones o compila con `--release` adecuado |
| Funciona en mi máquina, falla en otra | Supuesto no portable (ruta, encoding, versión, SO) | Revisa WORA: usa APIs portables y declara versión de runtime |

**Verificación rápida**

```bash
javac HolaJVM.java && java HolaJVM
javap -c HolaJVM | head
```

Verifica: existe `HolaJVM.class`, el programa imprime propiedades del runtime y `javap` muestra instrucciones bytecode.

### Tema 3: Instalar JDK y verificar entorno · Básico · 30 min

**Caso guía / Contexto**

Vas a compilar tu primer programa, pero antes necesitas confirmar dos cosas: que el JDK está instalado y que tu terminal está usando la versión correcta. Muchos fallos de “mi código no funciona” son en realidad fallos de entorno.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo aplica | Error/riesgo común |
|---|---|---|---|---|
| **Instalar JDK** | Instalar el Java Development Kit: binarios (`java`, `javac`, etc.), bibliotecas estándar y metadatos en el sistema. | Tener compilador y runtime para desarrollar Java. | Antes de compilar/ejecutar proyectos Java locales. | Instalar solo JRE/runtime o una versión distinta a la requerida. |
| **JDK/JRE/runtime** | JDK incluye herramientas de desarrollo; JRE/runtime se orienta a ejecutar. En distribuciones modernas suele instalarse JDK. | Elegir el paquete correcto. | Al instalar en máquina nueva o CI. | Creer que “ya tengo Java” implica que tengo `javac`. |
| **`JAVA_HOME`** | Variable de entorno que apunta al directorio raíz del JDK activo. | Herramientas (Maven, Gradle, IDEs, scripts) localizan el JDK. | Builds, CI, múltiples JDKs. | Apuntar a un JRE viejo o a una ruta inexistente. |
| **`PATH`** | Variable de entorno con directorios donde el shell busca ejecutables. | Permite invocar `java`/`javac` sin ruta absoluta. | Toda ejecución por terminal. | `PATH` apunta a otro Java; `java -version` y `javac -version` difieren. |
| **Verificar entorno** | Comprobar versión, ubicación y coherencia de `java`/`javac`/`JAVA_HOME`. | Evitar diagnósticos falsos y errores de versión. | Tras instalar, cambiar JDK, o antes de depurar un build. | Verificar solo `java` y olvidar `javac`. |

**Contrato / invariantes / reglas.** Para compilar y ejecutar desde terminal necesitas `javac` y `java` resolubles en `PATH` (o ruta absoluta). Deben ser coherentes en versión mayor para evitar `UnsupportedClassFileError`. `JAVA_HOME` debe apuntar al directorio raíz del JDK, no a `bin`. Los cambios de variables de entorno se ven en terminales nuevas; una terminal abierta puede conservar valores viejos.

**Modelo mental.** El JDK es la caja de herramientas; `JAVA_HOME` es la dirección donde está guardada; `PATH` es el acceso rápido en el escritorio; la verificación es mirar la etiqueta de la herramienta antes de usarla.

**Implementación desde cero**

#### 1) Instalar JDK (elige tu sistema)

Usa una versión LTS (por ejemplo 21 o 25). Ejemplos:

| Sistema | Comando/acción | Nota |
|---|---|---|
| macOS (Homebrew) | `brew install openjdk@21` | Sigue la salida de brew para enlazar/symlink si hace falta. |
| Ubuntu/Debian | `sudo apt update && sudo apt install -y openjdk-21-jdk` | Instala JDK, no solo JRE. |
| Windows (winget) | `winget install EclipseAdoptium.Temurin.21.JDK` | Abre una terminal nueva tras instalar. |

> Si tu organización exige una distribución específica (Temurin, Oracle, Corretto, Zulu), usa esa; lo importante es tener JDK y verificar versión.

#### 2) Verificar entorno

Desde una carpeta vacía de trabajo:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

Comandos de diagnóstico:

```bash
java -version
javac -version
```

En macOS, para ver el JDK activo:

```bash
/usr/libexec/java_home
```

En Linux/macOS (bash/zsh), verifica `JAVA_HOME` y el ejecutable:

```bash
echo "$JAVA_HOME"
which java
which javac
```

En Windows PowerShell:

```powershell
echo $env:JAVA_HOME
where.exe java
where.exe javac
```

#### 3) Prueba mínima de compilación

Crea `EntornoOk.java`:

```java
public class EntornoOk {
    public static void main(String[] args) {
        System.out.println("JDK OK");
        System.out.println(System.getProperty("java.version"));
    }
}
```

```bash
javac EntornoOk.java
java EntornoOk
```

**Desglose del código/comandos**

- `java -version` confirma el runtime en `PATH`.
- `javac -version` confirma el compilador; ambos deben ser coherentes.
- `JAVA_HOME` es consumido por Maven/Gradle/IDEs; no basta con que `java` funcione si `JAVA_HOME` apunta mal.
- `EntornoOk` prueba el ciclo completo: compilar + ejecutar.

**Ejecución y salida real**

Ejemplo (la versión variará):

```text
openjdk version "21.0.7" 2025-04-15
OpenJDK Runtime Environment ...
OpenJDK 64-Bit Server VM ...
```

```text
javac 21.0.7
```

```text
JDK OK
21.0.7
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `javac: command not found` / no reconocido | JDK no instalado o `PATH` incompleto | Instala JDK, revisa `PATH`, abre terminal nueva |
| `java -version` y `javac -version` muestran versiones distintas | Hay múltiples instalaciones | Ajusta `JAVA_HOME`/`PATH` a la misma instalación |
| `JAVA_HOME` apunta a carpeta incorrecta | Ruta manual mal definida | Debe apuntar a la raíz del JDK (contiene `bin`, `lib`, etc.) |
| `UnsupportedClassFileError` al ejecutar | Compilaste con JDK más nuevo que el runtime | Alinea versiones o compila con `javac --release N` |

**Verificación rápida**

```bash
javac -version
java -version
javac EntornoOk.java && java EntornoOk
```

Si ves `JDK OK` y la versión esperada, el entorno está listo.


### Tema 4: Primer programa desde cero, sin IDE · Básico · 35 min

**Caso guía**

Quieres un programa pequeño que salude por nombre. Si el usuario no pasa un nombre, debe indicar cómo usarlo. Este caso cubre el ciclo completo: archivo, clase, `main`, compilación, ejecución y argumentos.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Primer programa** | Unidad mínima ejecutable: código fuente `.java` compilable a `.class` con punto de entrada. | Validar entorno, sintaxis y ciclo de ejecución. | Al iniciar en Java o al probar un entorno nuevo. | Poner lógica compleja antes de confirmar el ciclo básico. |
| **Desde cero** | Crear archivo, escribir código, compilar y ejecutar manualmente, sin generación automática del IDE. | Entender qué hace el IDE por debajo. | Aprendizaje, diagnóstico, CI/scripts. | Depender del IDE sin saber compilar por terminal. |
| **Sin IDE** | Usar editor de texto + `javac` + `java` en terminal. | Controlar y observar cada paso. | Entornos mínimos, servidores, depuración de build. | Confundir “sin IDE” con “sin herramientas”; el JDK sí es necesario. |
| **`main`** | Método de entrada: `public static void main(String[] args)`. | Punto donde la JVM inicia la aplicación. | Aplicaciones Java standalone. | Firma incorrecta: falta `static`, `String[]`, o nombre distinto. |
| **Argumentos CLI** | `String[] args` recibe parámetros pasados al iniciar el programa. | Parametrizar ejecución sin recompilar. | Scripts, herramientas, configuración simple. | Acceder `args[0]` sin validar longitud (`ArrayIndexOutOfBoundsException`). |

**Contrato / invariantes / reglas.** La clase pública debe llamarse igual que el archivo. `args` no es `null` en la invocación normal, pero puede estar vacío. La validación de entrada es responsabilidad del programa. Compilar genera `.class`; ejecutar usa el nombre de clase.

**Modelo mental.** `main` es la puerta de entrada; `args` es la bandeja de notas que deja quien ejecuta el comando. Si la bandeja viene vacía, el programa debe responder con un mensaje útil, no con una excepción.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

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

- `public class SaludoArgs` coincide con el nombre del archivo.
- `args.length` permite verificar si llegaron argumentos.
- `return;` termina `main` temprano cuando falta el dato requerido.
- `args[0]` toma el primer argumento. Solo se accede después de validar.

**Ejecución y salida real**

```bash
javac SaludoArgs.java
java SaludoArgs Ada
```

```text
Hola, Ada
```

Sin argumentos:

```bash
java SaludoArgs
```

```text
Uso: java SaludoArgs <nombre>
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | Leíste `args[0]` sin validar | Verifica `args.length` antes de acceder |
| `Could not find or load main class` | Nombre de clase mal escrito o carpeta incorrecta | Ejecuta desde donde está el `.class` y usa el nombre de clase |
| No aparece salida nueva | No recompilaste | Corre `javac` antes de `java` |

**Verificación rápida**

```bash
javac SaludoArgs.java
java SaludoArgs
java SaludoArgs Ada
```

Debes ver primero el uso y luego el saludo. Si cambias el nombre, la salida debe cambiar.


### Tema 5: Tipos primitivos, variables y conversiones · Básico · 45 min

**Caso guía**

Necesitas representar edad (`int`), saldo (`double`/`BigDecimal` en sistemas reales; aquí `double` para aprender), inicial (`char`) y si un usuario está activo (`boolean`). También necesitas convertir un `double` a `int` y entender qué se pierde.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Tipos primitivos** | 8 tipos de valor definidos por el lenguaje: `byte, short, int, long, float, double, char, boolean`. | Representar valores simples con tamaño/semántica conocida. | Contadores, flags, caracteres, números; rendimiento/memoria predecible. | Usar `float/double` para dinero; overflow en enteros. |
| **Variables** | Nombre asociado a un tipo estático, alcance y valor compatible. | Guardar y nombrar estado/datos intermedios. | Siempre que necesites reutilizar un valor con significado. | Nombres ambiguos, tipo demasiado amplio/estrecho, variable sin inicializar. |
| **Conversión widening** | Conversión implícita a un tipo con mayor capacidad/rango compatible (`int`→`long`→`double`). | Combinar tipos sin perder representación en el rango esperado. | Cálculos mixtos seguros. | Asumir precisión infinita: `int` grande a `float` puede perder precisión. |
| **Conversión narrowing/cast** | Conversión explícita a tipo más pequeño/menos preciso (`double`→`int`). | Adaptar valores cuando aceptas la regla de pérdida. | Al integrar APIs o formateos controlados. | Pérdida silenciosa de decimales o desbordamiento. |
| **Literal/overflow** | Literal entero es `int` por defecto; `L` indica `long`. Overflow entero ocurre al exceder el rango. | Escribir valores correctos y detectar límites. | IDs grandes, timestamps, cálculos acumulados. | `2147483648` sin `L`; esperar excepción en overflow de `int`. |

**Contrato / invariantes / reglas.** Java es de tipado estático: compatibilidad verificada en compilación. Widening puede ser implícito; narrowing requiere cast explícito. `int` es 32-bit con signo; `long` 64-bit con signo; `double` IEEE 754 64-bit. El desbordamiento de enteros no lanza excepción por defecto; para detectar usa `Math.addExact`, `Math.multiplyExact`.

**Modelo mental.** Los tipos son moldes: un molde pequeño no acepta cualquier pieza. Convertir de molde grande a chico (narrowing) puede recortar la pieza; convertir a más grande (widening) normalmente cabe.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

Crea `TiposYConversiones.java`:

```java
public class TiposYConversiones {
    public static void main(String[] args) {
        byte edad = 30;                 // primitivo entero pequeño
        long poblacion = 8_000_000_000L; // L requerido: literal long
        double precio = 19.99;
        char inicial = 'J';
        boolean activo = true;

        double desdeInt = edad;         // widening implícito
        int precioEntero = (int) precio; // narrowing explícito: trunca decimales

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

Crea `Desbordamiento.java` en la misma carpeta:

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

**Desglose del código**

- `long poblacion = 8_000_000_000L;` usa `L` porque el literal supera el rango de `int`.
- `double desdeInt = edad;` es widening: seguro, implícito.
- `(int) precio` es narrowing: trunca a `19`, no redondea.
- `Integer.MAX_VALUE + 1` desborda a negativo; `Math.addExact` lanza `ArithmeticException`.

**Ejecución y salida real**

```bash
javac TiposYConversiones.java Desbordamiento.java
java TiposYConversiones
java Desbordamiento
```

Salida `TiposYConversiones`:

```text
30
8000000000
19.99
J
true
30.0
19
```

Salida `Desbordamiento`:

```text
2147483647
-2147483648
overflow detectado
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `integer number too large` | Literal entero fuera de rango `int` sin `L` | Usa `long` y sufijo `L` |
| `possible lossy conversion from double to int` | Narrowing sin cast | Haz cast explícito solo si aceptas la pérdida |
| Resultado negativo inesperado | Overflow de `int` | Usa `long` o `Math.*Exact` |
| Precisión rara en decimales | `float/double` son binarios IEEE 754 | Para dinero, usa `BigDecimal` (tema avanzado) |

**Verificación rápida**

```bash
javac TiposYConversiones.java Desbordamiento.java && java TiposYConversiones && java Desbordamiento
```

Confirma: `19.99` se trunca a `19`; `Math.addExact` detecta overflow.


### Tema 6: String, entrada/salida y formato · Básico · 40 min

**Caso guía**

Pides el nombre de una persona por consola, normalizas espacios, muestras un saludo con formato y comparas respuestas textuales. Es el caso típico donde aparecen las trampas de `String`, entrada/salida y formato.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **String** | Objeto inmutable de `java.lang` que representa secuencia de caracteres UTF-16. | Manejar texto: nombres, mensajes, IDs textuales. | Casi todo I/O textual. | Usar `==` para contenido; asumir que métodos mutan el original. |
| **Entrada (I/O)** | Lectura desde `System.in` (InputStream) mediante `Scanner`/`BufferedReader`. | Recibir datos del usuario o de otro proceso. | CLIs, ejercicios, pipes. | Mezclar `nextInt()` y `nextLine()`; no manejar encoding/localidad. |
| **Salida (I/O)** | Escritura a `System.out`/`System.err` (PrintStream). | Mostrar resultados, prompts, errores. | Feedback al usuario/log simple. | Usar salida para depurar en producción sin logging adecuado. |
| **Formato** | Representar datos como texto con plantilla: concatenación, `printf`/`format`, text blocks + formatted. | Mensajes legibles, columnas, decimales, reportes. | UI consola, logs legibles, exportes simples. | Concatenar todo sin controlar decimales/localidad. |
| **Comparación de texto** | `equals`/`equalsIgnoreCase` comparan contenido; `==` compara referencia. | Validar respuestas, comandos, IDs. | Validaciones, parsing, routing simple. | `==` devuelve `false` con mismo contenido. |

**Contrato / invariantes / reglas.** `String` es inmutable: `trim()`, `toUpperCase()`, `replace()` devuelven nuevos objetos. `Scanner` tokeniza por delimitadores; `nextLine()` lee hasta fin de línea. Cierra recursos que envuelven I/O cuando corresponda (`Scanner` sobre `System.in` suele cerrarse al final del programa; en apps grandes evita cerrarlo si lo compartes). `printf` usa formato de `Formatter`; `%n` es separador de línea portable.

**Modelo mental.** `String` es un texto impreso: no lo editas, generas otra copia. `==` pregunta por el mismo papel; `equals` pregunta por el mismo texto. La entrada es un sobre que llega por `System.in`; la salida es lo que imprimes en `System.out`.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

Crea `TextoIO.java`:

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

Crea `CompararStrings.java`:

```java
public class CompararStrings {
    public static void main(String[] args) {
        String a = "java";
        String b = new String("java");

        System.out.println(a == b);                 // referencia
        System.out.println(a.equals(b));            // contenido
        System.out.println("si".equalsIgnoreCase("SI"));

        String respuesta = null;
        System.out.println("si".equals(respuesta)); // seguro ante null
    }
}
```

**Desglose del código**

- `toUpperCase()` crea otro `String`; `lenguaje` sigue siendo `"Java"`.
- `printf` con `%-10s` alinea a la izquierda, `%d` número, `%n` salto de línea portable.
- `trim()` elimina espacios extremos de la entrada.
- `new String("java")` fuerza otro objeto: `==` falla, `equals` acierta.
- `"si".equals(respuesta)` evita `NullPointerException`.

**Ejecución y salida real**

```bash
javac CompararStrings.java
java CompararStrings
```

Salida real:

```text
false
true
true
false
```

`TextoIO` es interactivo:

```bash
javac TextoIO.java
java TextoIO
```

Ejemplo de sesión (entrada ` Ada `):

```text
Lenguaje: Java
Longitud: 4
Mayúsculas: JAVA
Formato: Java       | v25
Escribe tu nombre:  Ada 
Hola, Ada
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `==` da `false` para textos iguales | Comparaste referencias | Usa `equals`/`equalsIgnoreCase` |
| `NullPointerException` en `respuesta.equals(...)` | Variable nula | Usa `"literal".equals(variable)` |
| Salto de línea raro en Windows/Linux | Usaste `\n` hardcodeado | Prefiere `%n` en `printf` o `System.lineSeparator()` |
| `Scanner` se salta entrada | Mezcla `nextInt()`/`nextLine()` | Consume el fin de línea o usa `nextLine()` + parseo |

**Verificación rápida**

```bash
javac TextoIO.java CompararStrings.java
java CompararStrings
```

Confirma los cuatro booleanos y prueba `TextoIO` con nombre vacío y con espacios.


### Tema 7: Operadores, expresiones y precedencia · Básico · 35 min

**Caso guía**

Calculas un total con descuento, verificas si un usuario puede acceder (edad y permiso) y obtienes un promedio. Un paréntesis mal puesto o una división entera pueden cambiar el resultado sin romper la compilación.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Operadores** | Símbolos/keywords que aplican operaciones: aritméticos (`+ - * / %`), relacionales (`< > ==`), lógicos (`&& || !`), asignación (`= +=`), etc. | Transformar y comparar valores. | Cualquier cálculo o condición. | Confundir `=` con `==`; usar `/` entero esperando decimal. |
| **Expresiones** | Construcción que se evalúa a un valor (`a + b * c`, `edad >= 18`). | Componer lógica y cálculos. | Asignaciones, condiciones, argumentos. | Efectos secundarios ocultos; expresiones difíciles de leer. |
| **Precedencia** | Reglas que determinan qué operador se evalúa primero. | Interpretar correctamente expresiones compuestas. | Siempre que mezcles operadores. | Asumir orden izquierdo-a-derecho para todo. |
| **Asociatividad** | Regla de evaluación cuando operadores tienen la misma precedencia (izq-der o der-izq). | Resolver empates de precedencia. | `a = b = 0`, `a - b - c`. | Malinterpretar asignaciones encadenadas. |
| **Cortocircuito** | `&&` y `||` no evalúan el lado derecho si el izquierdo determina el resultado. | Evitar evaluaciones innecesarias/peligrosas. | `obj != null && obj.valido()`. | Poner efectos secundarios en el lado derecho esperando que siempre ocurra. |

**Contrato / invariantes / reglas.** División entre enteros trunca hacia cero. División entera por cero lanza `ArithmeticException`; en punto flotante produce `Infinity/NaN`. `==` compara valor en primitivos y referencia en objetos. Precedencia: unaria/aritmética > relacional > igualdad > lógicos > asignación (simplificación práctica; ante duda, usa paréntesis).

**Modelo mental.** Una expresión es una frase matemática con reglas de puntuación: precedencia/asociatividad son la gramática; los paréntesis hacen explícita la intención.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

Crea `Operadores.java`:

```java
public class Operadores {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        System.out.println(a + b); // 13
        System.out.println(a - b); // 7
        System.out.println(a * b); // 30
        System.out.println(a / b); // 3 (división entera)
        System.out.println(a % b); // 1

        double promedio = (5 + 4) / 2.0; // paréntesis + promoción a double
        System.out.println(promedio); // 4.5

        int edad = 20;
        boolean tienePermiso = true;
        boolean puedeEntrar = (edad >= 18) && tienePermiso; // relacional + lógico
        System.out.println(puedeEntrar);

        String nombre = null;
        boolean seguro = nombre != null && nombre.length() > 0; // cortocircuito
        System.out.println(seguro);
    }
}
```

**Desglose del código**

- `a / b` con enteros trunca: `3`, no `3.33...`.
- `(5 + 4) / 2.0` fuerza promedio real: los paréntesis controlan la suma antes de dividir.
- `&&` evalúa el lado derecho solo si el izquierdo es `true`; evita NPE en `nombre.length()`.
- Usa paréntesis para dejar clara la intención, incluso cuando la precedencia lo permite.

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
4.5
true
false
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Esperabas `4.5` y obtuviste `4` | División entera / precedencia mal asumida | Usa `2.0` o cast y paréntesis |
| `NullPointerException` en condición | Evaluaste lado derecho sin cortocircuito seguro | Usa `obj != null && obj...` |
| Condición confusa | Precedencia poco clara | Agrega paréntesis y extrae variables booleanas |
| Bug por `=` | Asignación en vez de comparación | Usa `==` para primitivos; el compilador suele avisar en booleanos |

**Verificación rápida**

```bash
javac Operadores.java && java Operadores
```

Cambia `(5 + 4) / 2.0` por `5 + 4 / 2.0` y observa el cambio: evidencia de precedencia.


### Tema 8: Control de flujo: decisiones y repeticiones · Básico · 45 min

**Caso guía**

Validas la edad de un usuario, traduces un número de día a nombre y cuentas hacia atrás. Necesitas elegir caminos (decisiones) y repetir acciones (repeticiones) con condiciones claras.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Control de flujo** | Sentencias que determinan el orden de ejecución: secuencia, selección, iteración, salto controlado. | Implementar lógica real más allá de líneas lineales. | Cualquier programa con reglas. | Flujo enredado, difícil de leer/probar. |
| **Decisiones (`if/else`, `switch`)** | Seleccionan una rama según condición booleana o caso discreto. | Validar, clasificar, elegir comportamiento. | Reglas de negocio, menús, validaciones. | Condiciones incompletas, `switch` sin `default`. |
| **Repeticiones (`for`, `while`, `do/while`)** | Ejecutan un bloque repetidamente mientras se cumpla condición/iteración. | Procesar rangos, colecciones, reintentos. | Contadores, búsqueda, acumulación. | Bucle infinito, off-by-one. |
| **`break`/`continue`** | `break` sale del bucle/switch; `continue` salta a la siguiente iteración. | Control fino de iteración. | Salida temprana, saltar casos inválidos. | Uso excesivo que oculta la lógica. |
| **Condición booleana** | Expresión que evalúa a `true/false`. | Determinar rama o continuación. | `if`, `while`, `for`. | Usar `=`; asumir enteros como booleanos (no en Java). |

**Contrato / invariantes / reglas.** La condición de `if/while/do/while/for` debe ser `boolean`. `switch` moderno (`->`) evita fall-through accidental; `switch` clásico requiere `break` si no se desea caer al siguiente caso. Todo bucle debe tener progreso hacia terminación o una salida explícita. `do/while` ejecuta el cuerpo al menos una vez.

**Modelo mental.** Las decisiones son bifurcaciones en una ruta; las repeticiones son rotondas: necesitas una señal clara de salida.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

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
            default -> "Día no válido";
        };
        System.out.println(nombreDia);

        for (int i = 1; i <= 3; i++) {
            if (i == 2) continue; // salta el 2
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

**Desglose del código**

- `if/else` selecciona una sola rama.
- `switch` con `->` mapea un caso discreto a valor; `default` cubre lo inesperado.
- `for` concentra inicio/condición/avance; `continue` salta una iteración.
- `while` repite mientras la condición sea true; `n--` garantiza progreso.
- `do/while` ejecuta al menos una vez, útil para “intentar y luego validar”.

**Ejecución y salida real**

```bash
javac Flujo.java
java Flujo
```

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

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Bucle infinito | Condición nunca cambia / falta avance | Verifica avance (`n--`, `i++`) y condición de salida |
| `switch` cae en casos no deseados | `switch` clásico sin `break` | Usa `switch` con `->` o agrega `break` |
| Off-by-one | Límite `<`/`<=` mal definido | Prueba bordes: 0, 1, N-1, N |
| Condición inválida | `=` en vez de comparación o tipo no booleano | Usa `==`/comparadores; Java exige boolean |

**Verificación rápida**

```bash
javac Flujo.java && java Flujo
```

Cambia `dia` a 9 y `edad` a 16. Predice la salida antes de ejecutar.


### Tema 9: Arreglos y métodos básicos · Básico · 50 min

**Caso guía**

Tienes varias notas de un alumno y quieres mostrar cada una y calcular el promedio. También quieres reutilizar la lógica de promedio. Necesitas una estructura para varios valores (arreglo) y una unidad reutilizable (método).

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Arreglos** | Objeto de tamaño fijo, elementos del mismo tipo, índice 0-based; `length` indica cantidad. | Guardar colección fija de valores homogéneos. | Notas, buffers, datos pequeños de tamaño conocido. | `ArrayIndexOutOfBoundsException`; asumir tamaño dinámico. |
| **Índice y `length`** | Índices válidos: `0 <= i < length`. `length` es campo, no método. | Recorrer/acceder con seguridad. | `for`, validaciones, bordes. | Off-by-one (`i <= length`). |
| **Métodos básicos** | Bloque nombrado con parámetros, tipo de retorno y cuerpo; `static` o de instancia. | Reutilizar, nombrar intención, probar. | Cálculos, validaciones, utilidades. | Métodos largos o con efectos secundarios ocultos. |
| **Parámetros y retorno** | Parámetros reciben valores; retorno entrega resultado. Java pasa argumentos por valor; la referencia del arreglo se copia por valor. | Definir contrato entrada/salida. | Diseñar APIs claras. | Mutar arreglo recibido sin documentarlo. |
| **Recorrido (`for` / `for-each`)** | `for` controla índice; `for-each` itera elementos directamente. | Procesar todos los elementos. | Suma, búsqueda, impresión. | Usar for-each cuando necesitas el índice. |

**Contrato / invariantes / reglas.** El tamaño del arreglo es fijo después de creado. Acceso fuera de rango lanza `ArrayIndexOutOfBoundsException`. Un método `static` no necesita instancia. Si pasas un arreglo a un método, el contenido puede ser modificado desde el método (se comparte el objeto).

**Modelo mental.** Arreglo = fila de casilleros numerados desde 0. Método = máquina: entrada (parámetros), proceso, salida (return).

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-0 && cd ~/academia-java/modulo-0
```

Crea `Notas.java`:

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
        return (double) suma / valores.length; // cast evita división entera
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

**Desglose del código**

- `int[] notas = {10, 8, 9, 7}` crea un arreglo de tamaño 4.
- `promedio` valida vacío y castea a `double` antes de dividir.
- `imprimir` usa `for-each` porque solo lee valores.
- `notas.length` permite recorrer sin hardcodear el tamaño.

**Ejecución y salida real**

```bash
javac Notas.java
java Notas
```

```text
Nota: 10
Nota: 8
Nota: 9
Nota: 7
Promedio: 8.5
Cantidad: 4
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | Índice fuera de `0..length-1` | Usa `i < valores.length`; revisa bordes |
| Promedio `8` en vez de `8.5` | División entera | Convierte a `double` antes de dividir |
| `NullPointerException` | Arreglo `null` | Valida precondición o retorna error controlado |
| Método difícil de reutilizar | Hace I/O y cálculo mezclado | Separa cálculo (`promedio`) de presentación (`imprimir`) |

**Verificación rápida**

```bash
javac Notas.java && java Notas
```

Prueba con `{10, 10, 9}`; el promedio debe ser `9.666...`.


## Cierre del módulo

En este módulo pasaste de “no tengo Java instalado” a entender el ciclo completo de trabajo: entorno, compilación, ejecución, tipos básicos, texto, operadores, flujo, arreglos y métodos. En el siguiente módulo ese código deja de ser una secuencia suelta y empieza a organizarse en clases y objetos.
