# Módulo 0: Sintaxis, tipos y el modelo de la JVM


## Antes de comenzar: instala Java correctamente

Necesitas un **JDK**, no solo “Java”. El JDK incluye el compilador `javac`, la JVM y herramientas de diagnóstico. Usaremos una versión LTS reciente (Java 25 o superior), Visual Studio Code con **Extension Pack for Java**, y Git.

| Sistema | Instalación | Nota importante |
|---|---|---|
| Windows | Instala Eclipse Temurin JDK y VS Code; marca la opción de configurar `JAVA_HOME` | Abre una terminal nueva después de instalar |
| macOS | `brew install --cask temurin` y `brew install git` | En Mac Apple Silicon usa el instalador ARM64 |
| Ubuntu/Debian | `sudo apt update && sudo apt install -y openjdk-21-jdk git` | No instales únicamente `jre` |

Verifica con `java --version` y `javac --version`: ambas versiones deben coincidir. Crea una carpeta `hola-java`, abre allí VS Code y guarda:

```java
public class Hola {
    public static void main(String[] args) {
        System.out.println("Mi entorno Java funciona");
    }
}
```

Ejecuta `javac Hola.java` y luego `java Hola`. El primer comando produce `Hola.class`; el segundo lo ejecuta en la JVM. En Windows, si `javac` no se reconoce, revisa `JAVA_HOME` y que `%JAVA_HOME%\bin` esté en `Path`.

## Aprende construyendo

### Tema 1: Del código fuente a la JVM

#### Paso 1 · Objetivo y preparación
Al finalizar podrás compilar un programa Java a bytecode, inspeccionar las instrucciones generadas con `javap` y ejecutar ese bytecode con la JVM, explicando qué hace cada herramienta. Prerrequisitos: JDK 25 instalado y un editor de texto o IDE. Comprueba `java --version` y `javac --version`.

#### Paso 2 · Contexto y caso real
Un equipo de una plataforma de entregas reporta que "el programa no corre en el servidor aunque compiló bien en mi máquina"; la causa casi siempre está en confundir dónde quedó el bytecode compilado (`.class`) con dónde se le pide a la JVM que lo busque. Entender el ciclo `javac`/`java` evita ese diagnóstico a ciegas.

#### Paso 3 · Teoría, modelo mental y analogía
`javac` traduce código fuente Java a bytecode (`.class`); `java` invoca la JVM, que carga ese bytecode y lo ejecuta. Son dos pasos separados y cada uno puede fallar por razones distintas. La analogía: `javac` es como imprimir un documento desde un procesador de texto, y `java` es como abrirlo después con un lector específico — si el lector busca el archivo impreso en la carpeta equivocada, no importa cuán bien se haya impreso.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/Saludo.java` y observa cada artefacto:
```bash
mkdir java-bytecode && cd java-bytecode
mkdir src out
```
```java
public final class Saludo {
    public static void main(String[] args) {
        // javac convierte esta instrucción en bytecode dentro de Saludo.class.
        System.out.println("Hola desde la JVM");
    }
}
```
```bash
javac -d out src/Saludo.java
find out -name '*.class'
javap -c -classpath out Saludo
java -cp out Saludo
```
**Resultado esperado:** existe `out/Saludo.class`, `javap` muestra instrucciones como `getstatic` e `invokevirtual`, y la JVM imprime `Hola desde la JVM`. **Fallo deliberado:** ejecuta `java -cp src Saludo`; aparece `ClassNotFoundException` porque el bytecode está en `out`, no en `src`. Corrige el *classpath*.

#### Paso 5 · Práctica guiada
Pista: ejecuta `javap -c -classpath out Saludo` y localiza la instrucción `invokevirtual` que corresponde a `System.out.println`. Luego borra `out/Saludo.class` a mano y ejecuta `java -cp out Saludo` sin recompilar. Resultado esperado: la JVM informa `Error: Could not find or load main class Saludo`, porque el bytecode ya no existe; recompílalo con `javac -d out src/Saludo.java` para restaurarlo.

#### Paso 6 · Práctica independiente
Crea una segunda clase `Version.java` que imprima `System.getProperty("java.version")`. Compílala junto a `Saludo.class` dentro de `out` y ejecuta `javap -c -classpath out Version`; identifica cuál instrucción de bytecode corresponde a la llamada a `getProperty`.

#### Paso 7 · Cierre y evidencia
Guarda `Saludo.java`, `out/Saludo.class`, la salida de `javap` y el `ClassNotFoundException` provocado junto a su corrección; como siguiente paso, en el Tema 2 identificarás exactamente qué significa cada palabra de la firma de `main` que la JVM buscó aquí. Errores comunes: ejecutar `java` apuntando con `-cp` a la carpeta del código fuente en vez de a la carpeta de salida compilada, olvidar recompilar después de modificar el `.java`, y asumir que `javac` ejecuta el programa en vez de solo compilarlo. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html y https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html.
**¿Por qué es importante?** Porque diagnosticar un `ClassNotFoundException` o un `NoClassDefFoundError` en producción exige saber, sin adivinar, que la JVM busca bytecode compilado en un classpath explícito, no código fuente.
**Evidencia de aprendizaje:** entrega `Saludo.java`, el `.class` generado, la salida de `javap -c` con al menos dos instrucciones identificadas, y el `ClassNotFoundException` provocado junto a su corrección.
**Conceptos clave:** bytecode, portabilidad, `javac`/`java`.

**Diagrama interactivo:** [Del código Java a la JVM](/visuals/temas/java/modulo-0-tema-1-bytecode.html).

Entender este ciclo `javac`/`java` es la base para diagnosticar cualquier error de compilación o de classpath que aparezca al construir el proyecto integrador de este track, mucho después de este tema.

**Cuándo no usarlo:** invocar `javac`/`java` manualmente como aquí es apropiado para entender el ciclo de compilación; en un proyecto real con múltiples clases y dependencias externas, Maven o Gradle (módulos posteriores) gestionan classpath y compilación automáticamente, evitando invocar el compilador archivo por archivo a mano.

Java no compila directamente a código máquina nativo específico de un procesador (como sí lo hacen C o C++), sino a bytecode: una representación intermedia (`Hola.class`) que no depende de ningún procesador específico, sino de una máquina virtual, la JVM (Java Virtual Machine), que interpreta o compila ese bytecode a código máquina real en el momento de la ejecución, específicamente para el procesador y sistema operativo donde esa JVM concreta se ejecuta. `javac Hola.java` realiza la compilación de código fuente a bytecode, generando el archivo `.class`; `java Hola` invoca la JVM, que carga ese archivo `.class` y lo ejecuta.

Esta arquitectura de dos pasos es la base del lema histórico de Java "write once, run anywhere" (escribe una vez, ejecuta en cualquier lugar): el mismo archivo `.class` compilado una única vez puede ejecutarse sin recompilar en cualquier sistema operativo o arquitectura de procesador que tenga una JVM disponible, dado que la JVM específica de cada plataforma es la responsable de traducir ese bytecode universal al código máquina específico de esa plataforma particular, en vez de que el desarrollador tenga que recompilar el código fuente por separado para cada plataforma de destino distinta (como sí sería necesario con un lenguaje que compila directamente a código máquina nativo).

**Analogía:** el bytecode es como una partitura musical universal, escrita una única vez, que distintos músicos (las JVMs de cada plataforma) pueden interpretar correctamente en sus propios instrumentos específicos, sin que el compositor original tenga que reescribir la partitura para cada instrumento distinto.

**¿Por qué es importante?** Compilar a bytecode en vez de código máquina nativo directamente es lo que permite que un mismo programa Java compilado una sola vez se ejecute sin recompilar en cualquier plataforma que tenga una JVM disponible.

**Código del ejemplo:**

```java
public class Hola {
    public static void main(String[] args) {
        System.out.println("Hola Java");
    }
}
```
```bash
javac Hola.java   # compila a bytecode: genera Hola.class
java Hola          # la JVM interpreta/compila el bytecode y lo ejecuta
```

### Tema 2: public static void main — qué significa cada palabra

#### Paso 1 · Objetivo y preparación
Al finalizar podrás explicar qué significa cada palabra de `public static void main(String[] args)` y diagnosticar por qué la JVM rechaza cualquier firma que se desvíe de ella. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version`.

#### Paso 2 · Contexto y caso real
Un desarrollador junior copia un método `main` desde un tutorial y le agrega `private` "porque esta clase no debería exponerlo públicamente"; el programa compila sin ningún error, pero al ejecutarlo la JVM informa que no encuentra un punto de entrada válido. Entender qué papel cumple cada palabra de la firma evita ese tipo de "corrección" que en realidad rompe el programa.

#### Paso 3 · Teoría, modelo mental y analogía
La JVM no ejecuta cualquier método: busca específicamente uno llamado `main`, público, estático, sin retorno, que reciba un arreglo de `String`. Cualquier desviación de esa firma exacta lo vuelve invisible para la JVM, aunque el resto de la clase compile perfectamente. La analogía: es como una convocatoria con un formato de postulación obligatorio — una postulación correcta en el fondo pero distinta en el formato exigido simplemente no se procesa.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/PuntoEntrada.java`:
```bash
mkdir java-main && cd java-main
mkdir src out
```
```java
public final class PuntoEntrada {
    public static void main(String[] args) {
        // args recibe cada argumento escrito después del nombre de la clase.
        System.out.printf("argumentos=%d, primero=%s%n", args.length, args[0]);
    }
}
```
```bash
javac -d out src/PuntoEntrada.java
java -cp out PuntoEntrada guia-123
```
**Resultado esperado:** `argumentos=1, primero=guia-123`. **Fallo deliberado:** elimina `static`, recompila y ejecuta; la JVM informa que no encuentra un método `main` válido. `static` permite invocarlo sin crear antes un objeto.

#### Paso 5 · Práctica guiada
Pista: cambia la firma a `public static void main(String args)` (sin los corchetes, `args` como un `String` simple) y recompila. Resultado esperado: compila sin error, pero al ejecutar `java -cp out PuntoEntrada guia-123` la JVM vuelve a informar que no encuentra un método `main` válido — la firma exige específicamente `String[] args`, y esta variación tampoco cuenta como punto de entrada.

#### Paso 6 · Práctica independiente
Modifica `PuntoEntrada` para que espere dos argumentos (origen y destino de una guía) y valide `args.length >= 2` antes de leerlos. Documenta qué mensaje debería mostrar si falta alguno, en vez de dejar que el programa termine con `ArrayIndexOutOfBoundsException` sin ningún control.

#### Paso 7 · Cierre y evidencia
Guarda `PuntoEntrada.java`, la ejecución con un argumento real, y el intento sin `static` junto a su corrección; como siguiente paso, en el Tema 3 distinguirás qué herramienta exacta instalaste junto con esa JVM que acabas de invocar. Errores comunes: agregar modificadores de acceso distintos a `public`, omitir `static` asumiendo que Java creará una instancia automáticamente, y declarar `args` con un tipo distinto a `String[]`. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html y https://dev.java/learn/getting-started/.
**¿Por qué es importante?** Porque un error de firma en `main` no se reporta como un error de compilación, sino como un fallo al arrancar la JVM — un tipo de diagnóstico distinto que hay que saber reconocer.
**Evidencia de aprendizaje:** entrega `PuntoEntrada.java`, su ejecución con `args` reales, y el fallo de la JVM al quitar `static` junto a la explicación de por qué ocurre.
**Conceptos clave:** punto de entrada, pertenencia a la clase frente a instancia.

`public static void main(String[] args)` es la firma exacta que la JVM busca como punto de entrada de cualquier programa Java ejecutable, y cada palabra de esa firma tiene un significado preciso y necesario: `public` hace que el método sea accesible desde cualquier lugar, incluyendo desde fuera de la propia clase, necesario porque la JVM (que no es parte del código de la aplicación) necesita poder invocarlo desde el exterior; `static` indica que el método pertenece a la clase en sí, no a una instancia particular de esa clase, siendo esto crucial porque la JVM invoca `main` sin haber creado previamente ningún objeto de esa clase — si `main` no fuera `static`, la JVM necesitaría una instancia ya existente para invocarlo, pero no existe ninguna todavía en ese punto de la ejecución.

`void` indica que el método no devuelve ningún valor (el programa simplemente termina cuando `main` retorna, sin que la JVM espere ni use un valor de retorno de esa llamada específica); `main` es el nombre exacto que la JVM busca por convención estricta, sin el cual no reconocería ese método como el punto de entrada; `String[] args` es el arreglo de argumentos de línea de comandos que se pasan al ejecutar el programa (`java Hola argumento1 argumento2` haría que `args` contenga `["argumento1", "argumento2"]`), permitiendo parametrizar la ejecución del programa desde fuera sin necesidad de recompilarlo.

**Analogía:** `main` es como la puerta principal marcada específicamente para que cualquier visitante (la JVM) sepa exactamente por dónde entrar, sin necesidad de que alguien dentro del edificio (una instancia ya creada) lo reciba primero en la puerta.

**¿Por qué es importante?** Cada palabra de `public static void main(String[] args)` cumple un propósito necesario y preciso para que la JVM pueda localizar e invocar ese método como punto de entrada sin necesitar una instancia previamente existente de la clase.

**Diagrama interactivo:** [La firma que la JVM busca](/visuals/temas/java/modulo-0-tema-2-main.html).

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Crea un punto de entrada que reciba datos mínimos para asignar entregas. Ejecuta con argumentos válidos e incompletos y comprueba salida y código de terminación sin mezclar entrada con reglas del dominio.

### Tema 3: JDK, JRE y JVM

#### Paso 1 · Objetivo y preparación
Al finalizar podrás distinguir con precisión qué instala el JDK, qué incluye el JRE y qué ejecuta específicamente la JVM, y decidir cuál necesitas en cada máquina. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version` y `javac --version`.

#### Paso 2 · Contexto y caso real
Un pipeline de despliegue falla en el servidor con `javac: command not found`, aunque el programa ya compilado corre perfectamente en la máquina de desarrollo; el servidor de producción tiene instalado únicamente un JRE, porque ejecutar un `.class` ya compilado no exige el compilador.

#### Paso 3 · Teoría, modelo mental y analogía
La JVM ejecuta bytecode; el JRE agrega las librerías estándar que ese bytecode necesita en tiempo de ejecución; el JDK agrega además las herramientas para desarrollar, como `javac`. Cada nivel incluye al anterior. La analogía: la JVM es el motor de un vehículo, el JRE es el vehículo completo listo para circular, y el JDK es ese mismo vehículo más un taller de herramientas para repararlo — necesario solo para quien lo construye o modifica, no para quien simplemente lo conduce.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/Entorno.java` y relaciona cada comando con su responsabilidad:
```bash
mkdir java-entorno && cd java-entorno
mkdir src out
java --version
javac --version
```
```java
public final class Entorno {
    public static void main(String[] args) {
        // Estas propiedades describen la JVM que ejecuta el bytecode.
        System.out.println(System.getProperty("java.vm.name"));
        System.out.println(System.getProperty("java.version"));
    }
}
```
```bash
javac -d out src/Entorno.java
java -cp out Entorno
```
**Resultado esperado:** `javac` y `java` muestran la misma línea mayor, y el programa informa el nombre de la VM. **Fallo deliberado:** prueba `javacc --version`; “command not found” no es un error de Java sino un nombre de herramienta incorrecto. Si `java` existe pero `javac` no, instalaste un runtime sin compilador o el JDK no está en `PATH`.

#### Paso 5 · Práctica guiada
Pista: ejecuta `java -cp out Entorno` en una carpeta `out` vacía, sin haber corrido antes `javac -d out src/Entorno.java`. Resultado esperado: `Error: Could not find or load main class Entorno`, un mensaje distinto al `command not found` del Paso 4 — aquí la herramienta `java` sí existe, pero el bytecode compilado que debe cargar todavía no existe.

#### Paso 6 · Práctica independiente
Ejecuta `java -XshowSettings:properties -version` y localiza en la salida la propiedad `java.home`. Explica con tus palabras por qué esa ruta corresponde a la instalación completa del JDK y no a un JRE separado.

#### Paso 7 · Cierre y evidencia
Guarda la salida de `Entorno`, el error provocado por el nombre de herramienta incorrecto y la explicación de JDK/JRE/JVM; como siguiente paso, en el Tema 4 empezarás a distinguir qué guarda cada variable según su tipo. Errores comunes: instalar solo un JRE cuando se necesita compilar, escribir mal el nombre de una herramienta y asumir que es un error de Java, y mezclar instalaciones de distintos proveedores sin que `JAVA_HOME` apunte a la correcta. Fuentes oficiales: https://dev.java/learn/jvm/ y https://docs.oracle.com/en/java/javase/25/.
**¿Por qué es importante?** Porque un pipeline de CI/CD que falla por falta de `javac` en el servidor de build, o que instala de más un JDK completo en un servidor que solo ejecuta, es un error de configuración que se diagnostica en segundos si se distingue JDK de JRE.
**Evidencia de aprendizaje:** entrega la salida de `Entorno` con el nombre de la VM, el error provocado por el nombre de herramienta incorrecto, y una frase propia que distinga JDK, JRE y JVM.
**Conceptos clave:** desarrollo frente a ejecución, herramientas incluidas en cada nivel.

La JVM es específicamente la máquina virtual que ejecuta bytecode, el componente mínimo necesario para correr cualquier programa Java ya compilado; el JRE (Java Runtime Environment) incluye la JVM más las librerías estándar necesarias para que los programas Java se ejecuten correctamente (las clases básicas como `String`, `ArrayList`, etc., que un programa típico necesita en tiempo de ejecución, no solo el motor de ejecución del bytecode en sí); el JDK (Java Development Kit) incluye el JRE completo más las herramientas necesarias específicamente para desarrollar programas Java, no solo ejecutarlos (`javac` el compilador, un debugger, `javap` para inspeccionar bytecode, y otras herramientas de desarrollo).

Para escribir y compilar código Java se necesita el JDK completo, dado que incluye `javac`; para simplemente ejecutar un `.jar` ya compilado por alguien más, en principio bastaría con el JRE, aunque en la práctica moderna la mayoría de entornos instala directamente el JDK completo incluso para casos de solo ejecución, dado que las distribuciones actuales del JDK ya son razonablemente livianas y evitan tener que gestionar dos instalaciones separadas según el caso de uso específico.

**Analogía:** la JVM es como el motor de un vehículo (lo mínimo necesario para moverse); el JRE es el vehículo completo listo para conducir (motor más todo lo necesario para circular); el JDK es ese mismo vehículo más un taller completo de herramientas para repararlo y modificarlo, necesario solo para quien construye o modifica vehículos, no para quien simplemente los conduce.

**¿Por qué es importante?** Distinguir JDK, JRE y JVM aclara exactamente qué instalar según si el objetivo es desarrollar código Java (JDK) o simplemente ejecutar un programa ya compilado (JRE, aunque en la práctica se suele instalar el JDK completo de todas formas).

**Diagrama interactivo:** [Capas de la plataforma Java](/visuals/temas/java/modulo-0-tema-3-jdk-jre-jvm.html).

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Compila el motor y ejecuta su artefacto con el runtime previsto. Registra versiones del compilador y de ejecución y reproduce un fallo de incompatibilidad en un entorno de laboratorio separado.

### Tema 4: Tipos primitivos vs referencias

#### Paso 1 · Objetivo y preparación
Al finalizar podrás predecir, antes de ejecutar, si una variable copia un valor o comparte una referencia a un mismo objeto. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version`.

#### Paso 2 · Contexto y caso real
Un reporte de entregas muestra el mismo paquete con pesos distintos en dos pantallas que, según el código, debían ser independientes; la causa es que ambas pantallas comparten el mismo arreglo por referencia, y modificar una posición desde una de ellas también la modifica para la otra.

#### Paso 3 · Teoría, modelo mental y analogía
Un tipo primitivo guarda su valor directamente en la variable; copiarlo produce una copia independiente. Un tipo referencia guarda una dirección hacia un objeto en el heap; copiar la variable copia esa dirección, no el objeto, así que ambas variables terminan apuntando al mismo objeto compartido. La analogía: un primitivo es como llevar el efectivo en el bolsillo; una referencia es como llevar la llave de una caja fuerte — prestar una copia de la llave no crea una segunda caja fuerte.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/ValoresYReferencias.java`:
```bash
mkdir java-tipos && cd java-tipos
mkdir src out
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

```java
public final class ValoresYReferencias {
    public static void main(String[] args) {
        int original = 5;
        int copia = original;
        copia = 9; // Cambia la copia del primitivo.

        int[] rutaA = {1, 2};
        int[] rutaB = rutaA;
        rutaB[0] = 99; // Ambas variables alcanzan el mismo arreglo.
        System.out.printf("%d %d | %d %d%n", original, copia, rutaA[0], rutaB[0]);
    }
}
```
Ejecuta `javac -d out src/ValoresYReferencias.java && java -cp out ValoresYReferencias`. **Salida esperada:** `5 9 | 99 99`. **Fallo deliberado:** declara `Integer intentos = null;` y suma `int total = intentos + 1`; aparece `NullPointerException` durante *unboxing*. Valida la ausencia antes de convertir el wrapper a primitivo.

#### Paso 5 · Práctica guiada
Pista: en `ValoresYReferencias`, después de `rutaB[0] = 99;` agrega `rutaA = new int[]{5, 6};` y vuelve a imprimir `rutaA[0]` y `rutaB[0]`. Resultado esperado: `rutaA[0]` pasa a ser `5` (ahora apunta a un arreglo nuevo), mientras `rutaB[0]` sigue siendo `99` (sigue apuntando al arreglo original); reasignar una variable de referencia no mueve ni afecta el objeto al que apuntaba antes.

#### Paso 6 · Práctica independiente
Declara `Long totalGuias = null;` dentro de un método que calcule `totalGuias + 1`, sin ejecutarlo todavía. Predice por escrito si lanzará `NullPointerException` y en qué línea exacta; luego ejecútalo para confirmar tu predicción.

#### Paso 7 · Cierre y evidencia
Guarda `ValoresYReferencias.java`, la salida `5 9 | 99 99`, y el `NullPointerException` del wrapper `null` junto a su corrección; como siguiente paso, en el Tema 5 aplicarás esta misma distinción a conversiones entre tipos y a `String`. Errores comunes: asumir que copiar un arreglo copia sus elementos, usar un wrapper (`Integer`) con `null` como si fuera un primitivo sin validar antes, y confundir reasignar una referencia con mutar el objeto al que apunta. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html y https://dev.java/learn/language-basics/.
**¿Por qué es importante?** Porque un `NullPointerException` durante *unboxing* automático, o una mutación compartida de un arreglo que "nadie modificó", son errores de producción que solo se explican entendiendo esta distinción, nunca adivinando.
**Evidencia de aprendizaje:** entrega `ValoresYReferencias.java`, la salida que demuestra el aliasing del arreglo, y el `NullPointerException` del wrapper `null` junto a la corrección que lo evita.
**Conceptos clave:** valor directo frente a apuntador a un objeto, wrappers.

Un tipo primitivo (`int edad = 30;`) almacena su valor directamente en la variable (típicamente en la pila de ejecución, un área de memoria de acceso rápido y de ciclo de vida ligado al alcance donde la variable se declara), sin ninguna capa de indirección adicional; un tipo referencia (`String nombre = "Ana";`) almacena en la variable no el dato en sí, sino una referencia (conceptualmente un apuntador) hacia un objeto real ubicado en el heap (un área de memoria separada, gestionada por el recolector de basura, Módulo 11), de modo que la variable "apunta hacia" ese objeto en vez de contenerlo directamente.

Los tipos wrapper (`Integer edadObjeto = 30;`, la versión objeto correspondiente al primitivo `int`) existen específicamente para los casos donde Java requiere que un valor se trate como un objeto (por ejemplo, para almacenarlo dentro de una colección genérica como `List<Integer>`, dado que los genéricos de Java no admiten directamente tipos primitivos, Módulo 2), a costa de la sobrecarga adicional de memoria e indirección que un objeto conlleva frente a un primitivo puro, siendo esta la razón por la que Java sigue ofreciendo primitivos además de sus wrappers correspondientes, en vez de usar únicamente objetos para todo: los primitivos son más eficientes en memoria y velocidad para el caso extremadamente común de valores numéricos simples usados directamente.

**Analogía:** un tipo primitivo es como llevar el efectivo directamente en el bolsillo; un tipo referencia es como llevar una llave de una caja fuerte donde el objeto real está guardado en otro lugar — acceder al contenido real requiere primero seguir esa referencia hasta la caja fuerte correspondiente.

**¿Por qué es importante?** Los tipos primitivos almacenan su valor directamente, siendo más eficientes; los tipos referencia apuntan a objetos en el heap, necesarios cuando Java requiere tratar ese valor como un objeto completo (por ejemplo, dentro de colecciones genéricas).

**Código del ejemplo:**

```java
int edad = 30;              // primitivo: valor directo en la pila
String nombre = "Ana";       // referencia: variable apunta a un objeto en el heap
Integer edadObjeto = 30;     // wrapper: versión objeto del primitivo int
```

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Distingue cantidad de paquetes de referencias a conductores. Prueba dos variables que apuntan al mismo objeto y documenta cuándo una modificación compartida puede alterar una asignación ya calculada.

### Tema 5: Variables, conversiones y `String`

#### Paso 1 · Objetivo y preparación
Al finalizar podrás convertir texto externo a tipos numéricos de forma segura, elegir `BigDecimal` para dinero en vez de `double`, y comparar `String` por contenido en vez de por identidad. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version`.

#### Paso 2 · Contexto y caso real
Una tarifa de envío calculada con `double` acumula diferencias de centavos tras miles de operaciones, y al final del mes el total facturado no coincide con la suma manual de cada guía; el origen es representar dinero con un tipo binario de punto flotante en vez de con `BigDecimal`.

#### Paso 3 · Teoría, modelo mental y analogía
Una conversión ampliadora (`int` a `long`) nunca pierde información; una conversión reductora necesita un *cast* explícito porque puede descartarla. Para texto externo, `Integer.parseInt` convierte o lanza una excepción clara; nunca asumas que el texto ya es válido. La analogía: convertir un `long` a `int` es como intentar guardar el contenido de un depósito grande en uno pequeño — el recipiente no se agranda, y lo que no entra simplemente se pierde.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/Conversiones.java`:
```bash
mkdir java-conversiones && cd java-conversiones
mkdir src out
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

```java
import java.math.BigDecimal;

public final class Conversiones {
    public static void main(String[] args) {
        int cantidad = Integer.parseInt("12"); // Convierte texto validable en número.
        BigDecimal tarifa = new BigDecimal("19.90");
        String estado = new String("ENTREGADO");
        System.out.println(tarifa.multiply(BigDecimal.valueOf(cantidad)));
        System.out.println(estado.equals("ENTREGADO"));
    }
}
```
Ejecuta `javac -d out src/Conversiones.java && java -cp out Conversiones`. **Resultado esperado:** `238.80` y `true`. **Fallo deliberado:** cambia `"12"` por `"doce"`; `NumberFormatException` identifica una entrada que no puede convertirse. Captúrala en la frontera y pide un dato válido, sin inventar cero como valor silencioso.

#### Paso 5 · Práctica guiada
Pista: cambia `new BigDecimal("19.90")` por `new BigDecimal(19.90)` (literal `double`, sin comillas) y recompila. Resultado esperado: compila y ejecuta sin lanzar ninguna excepción, pero el resultado ya no es exactamente `238.80`: aparecen dígitos decimales adicionales de imprecisión binaria heredados del `double` — la razón exacta por la que este Tema exige construir `BigDecimal` desde texto, nunca desde un `double`.

#### Paso 6 · Práctica independiente
Agrega una segunda tarifa escrita con coma decimal (`"19,90"` en vez de `"19.90"`). Predice por escrito si `new BigDecimal("19,90")` lanza una excepción o produce un valor incorrecto; ejecútalo para confirmar tu predicción y explica por qué el formato del texto importa.

#### Paso 7 · Cierre y evidencia
Guarda `Conversiones.java`, la salida `238.80`/`true`, y el `NumberFormatException` provocado por `"doce"` junto a su corrección; como siguiente paso, en el Tema 6 usarás tipos y comparaciones similares dentro de condiciones y ciclos. Errores comunes: usar `double` para dinero, comparar `String` con `==` en vez de `equals`, y asumir que un texto externo siempre llega en el formato numérico esperado. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html y https://dev.java/learn/language-basics/.
**¿Por qué es importante?** Porque un error de redondeo en dinero causado por `double`, o una comparación de `String` con `==` que "funciona en pruebas" por el *string pool* y falla con datos reales, son errores silenciosos que solo una conversión y comparación correctas evitan desde el origen.
**Evidencia de aprendizaje:** entrega `Conversiones.java`, la salida `238.80`/`true`, y el `NumberFormatException` provocado por una entrada no numérica junto a su corrección.

Convertir con `BigDecimal` desde texto (nunca `double`) para valores monetarios es exactamente la regla que aplicará el proyecto integrador de este track en cualquier campo de precio o tarifa, evitando errores de precisión que un `double` introduciría silenciosamente.

**Cuándo no usarlo:** `BigDecimal` es más lento y verboso que `double`; para cálculos donde la precisión decimal exacta no importa (una posición en pantalla, un porcentaje aproximado de progreso), `double` sigue siendo la opción correcta — resérvalo para dinero y cualquier cálculo donde un error de redondeo tenga consecuencias reales.

**Conceptos clave:** inferencia local, conversión segura, precisión e inmutabilidad.

Una variable tiene un tipo estático que limita qué valores y operaciones son válidos. `var` permite que el compilador infiera ese tipo a partir del inicializador, pero no vuelve dinámica la variable: después de `var intentos = 3`, `intentos` continúa siendo `int` y no puede recibir un `String`. Usa `var` cuando el tipo resulte evidente en la misma línea; escribe el tipo explícito cuando comunique una unidad o contrato importante.

Una conversión ampliadora, como `int` a `long`, conserva todos los valores posibles y Java puede aplicarla implícitamente. Una conversión reductora necesita un *cast* porque puede descartar información. `(int) 3_000_000_000L` no “convierte correctamente” el número: conserva solo los bits que caben y produce otro valor. Para datos externos usa `Integer.parseInt` y maneja `NumberFormatException`; para cálculos monetarios evita `double` y modela decimales con `BigDecimal` construido desde texto.

`String` es una referencia a un objeto inmutable. Métodos como `toUpperCase()` devuelven otra cadena; no modifican la original. Compara contenido con `equals`, no con `==`: `==` compara si dos referencias apuntan al mismo objeto, algo que puede parecer funcionar con literales por el *string pool* y fallar cuando una cadena llega desde entrada o red.

```java
package academia.fundamentos;

import java.math.BigDecimal;

public final class Conversiones {
    public static void main(String[] args) {
        var textoCantidad = "12";                 // el tipo inferido sigue siendo String
        int cantidad = Integer.parseInt(textoCantidad);
        long cantidadAmpliada = cantidad;          // ampliación segura
        BigDecimal tarifa = new BigDecimal("19.90");

        String estado = new String("ENTREGADO");
        System.out.println(estado == "ENTREGADO");      // false: identidad
        System.out.println(estado.equals("ENTREGADO")); // true: contenido
        System.out.println(tarifa.multiply(BigDecimal.valueOf(cantidadAmpliada)));
    }
}
```

**Ejecución y diagnóstico:** guarda el ejemplo en `src/main/java/academia/fundamentos/Conversiones.java`, compílalo con `javac -d out src/main/java/academia/fundamentos/Conversiones.java` y ejecútalo con `java -cp out academia.fundamentos.Conversiones`. Cambia `"12"` por `"doce"`: el error esperado es `NumberFormatException`. Corrígelo validando la entrada en la frontera, no ocultando la excepción con un valor arbitrario.

**Analogía:** convertir un `long` a `int` es intentar guardar el contenido de un depósito grande en uno pequeño: el recipiente no amplía su capacidad y parte de la información queda fuera.

**¿Por qué es importante?** Tipos, conversiones e igualdad determinan si el programa conserva el dato real o toma una decisión silenciosamente equivocada.

### Tema 6: Operadores, precedencia y control de flujo

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escribir una expresión `switch` exhaustiva sobre un `enum` y explicar por qué `&&` evita un `NullPointerException` que `&` no evita. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version`.

#### Paso 2 · Contexto y caso real
Un equipo agrega un nuevo estado `CANCELADA` a las entregas y despliega sin tocar el código que decide qué mensaje mostrar; en producción, cada entrega cancelada pasa silenciosamente sin ningún mensaje, porque el `switch` que las procesa nunca se actualizó para contemplar el caso nuevo.

#### Paso 3 · Teoría, modelo mental y analogía
La precedencia decide qué operación se evalúa primero, pero depender de memorizarla dificulta leer el código: los paréntesis explícitos comunican la intención. `&&`/`||` hacen cortocircuito — si el resultado ya está decidido, el lado derecho no se evalúa. Un `switch` exhaustivo sobre un `enum` sin `default` deja que el compilador detecte un caso nuevo sin manejar. La analogía: el cortocircuito es un control de acceso por etapas — si la primera condición ya rechaza la entrada, los controles que necesitan que esa entrada exista nunca llegan a ejecutarse.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/ControlEntrega.java`:
```bash
mkdir java-control && cd java-control
mkdir src out
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

```java
public final class ControlEntrega {
    enum Estado { CREADA, EN_RUTA, ENTREGADA }

    static String mensaje(Estado estado) {
        return switch (estado) {
            case CREADA -> "Guía creada";
            case EN_RUTA -> "Conductor en recorrido";
            case ENTREGADA -> "Entrega confirmada";
        };
    }

    public static void main(String[] args) { System.out.println(mensaje(Estado.EN_RUTA)); }
}
```
Ejecuta `javac -d out src/ControlEntrega.java && java -cp out ControlEntrega`. **Resultado esperado:** `Conductor en recorrido`. **Fallo deliberado:** agrega `CANCELADA` al enum y recompila sin agregar una rama; el compilador detecta que la expresión `switch` dejó de ser exhaustiva. Añade el comportamiento del nuevo estado.

#### Paso 5 · Práctica guiada
Pista: en vez de agregar la rama para `CANCELADA`, agrega una rama `default -> "Estado desconocido"` al `switch`. Resultado esperado: el programa vuelve a compilar, pero ahora `CANCELADA` cae silenciosamente en esa rama genérica sin que el compilador señale nada — la exhaustividad que detectó el olvido en el Paso 4 queda anulada por el propio `default`, el mismo riesgo descrito en el Paso 2.

#### Paso 6 · Práctica independiente
Agrega un nuevo estado `DEVUELTA` al `enum Estado`. Antes de tocar el `switch`, predice por escrito el mensaje de error exacto que dará el compilador; luego agrega la rama faltante y confirma que el mensaje predicho coincide con el real.

#### Paso 7 · Cierre y evidencia
Guarda `ControlEntrega.java`, el error de exhaustividad provocado por `CANCELADA` y su corrección; como siguiente paso, en el Tema 7 aplicarás límites de ciclo igualmente explícitos al recorrer arreglos. Errores comunes: agregar un `default` "por si acaso" que oculta casos nuevos sin manejar, usar `&` en vez de `&&` cuando el lado derecho depende de que el izquierdo ya haya validado algo, y usar `<=` en una condición de ciclo pensada para `<`. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/specs/jls/se21/html/jls-14.html y https://dev.java/learn/language-basics/switch-expressions/.
**¿Por qué es importante?** Porque un `switch` con `default` oculta en silencio cualquier estado nuevo que el negocio agregue después, mientras un `switch` exhaustivo sin `default` convierte ese mismo olvido en un error de compilación inmediato.
**Evidencia de aprendizaje:** entrega `ControlEntrega.java`, el mensaje `Conductor en recorrido`, y el error de exhaustividad provocado al agregar `CANCELADA` junto a su corrección.
**Conceptos clave:** agrupación explícita, cortocircuito, ramas exhaustivas y ciclos terminables.

La precedencia determina qué operación se evalúa primero, pero depender de que el lector memorice toda la tabla dificulta mantener el código. Usa paréntesis para expresar la intención cuando se combinan operadores. `&&` y `||` realizan cortocircuito: la expresión derecha no se evalúa si el resultado ya está decidido. Ese mecanismo permite verificar `paquete != null && paquete.pesoKg() > 0` sin desreferenciar `null`; usar `&` obliga a evaluar ambos lados y produciría `NullPointerException`.

Elige `if` para rangos o reglas heterogéneas y `switch` para decidir según un conjunto discreto. Un `switch` moderno puede ser una expresión que devuelve un valor y evita variables mutables temporales. En ciclos, define antes la condición de salida y comprueba los límites: `i < elementos.length` visita índices válidos; `i <= elementos.length` intenta acceder una posición inexistente.

```java
enum Estado { CREADO, EN_RUTA, ENTREGADO, CANCELADO }

static String mensaje(Estado estado) {
    return switch (estado) {
        case CREADO -> "Guía registrada";
        case EN_RUTA -> "Conductor en recorrido";
        case ENTREGADO -> "Entrega confirmada";
        case CANCELADO -> "Envío cancelado";
    };
}

static boolean pesoValido(Paquete paquete) {
    return paquete != null && paquete.pesoKg() > 0 && paquete.pesoKg() <= 50;
}
```

**Fallo deliberado:** reemplaza el primer `&&` por `&` y llama `pesoValido(null)`. Lee la línea exacta del *stack trace* y explica por qué se evaluó `paquete.pesoKg()`. Después agrega un nuevo valor al `enum`: el compilador señalará que el `switch` dejó de ser exhaustivo, convirtiendo una evolución del dominio en feedback inmediato.

**Analogía:** el cortocircuito es un control de acceso por etapas: si la primera condición ya rechaza la entrada, no se ejecutan controles que requieren que esa entrada exista.

**¿Por qué es importante?** Una condición correcta no solo produce `true` o `false`; también controla qué operaciones llegan a ejecutarse y qué fallos quedan imposibilitados.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Implementa capacidad y prioridad con expresiones sin ambigüedad. Construye casos límite de capacidad exacta y exceso de una unidad y verifica que ninguna entrega queda asignada por precedencia accidental.

### Tema 7: Arreglos, wrappers y paso de argumentos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás predecir exactamente qué puede modificar un método al recibir un arreglo, y recorrer una secuencia sin salirte de sus límites válidos. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version`.

#### Paso 2 · Contexto y caso real
Un método que "limpia" un arreglo de paradas reasignando el parámetro a un arreglo vacío no limpia nada desde el punto de vista del código que lo llamó; el arreglo original sigue intacto, porque reasignar la referencia local no afecta la variable del llamador — solo mutar el contenido del arreglo sí se observa desde afuera.

#### Paso 3 · Teoría, modelo mental y analogía
Java siempre pasa argumentos por valor: al pasar un objeto, el método recibe una copia de la referencia, no una segunda referencia independiente ni el objeto mismo. Ambas copias apuntan al mismo objeto, así que mutar el contenido se observa desde ambos lados, pero reasignar el parámetro solo cambia la copia local. La analogía: copiar una referencia es entregar una segunda dirección de la misma bodega, no construir otra bodega — cambiar la mercancía se ve desde ambas direcciones, pero cambiar el papel con la dirección no mueve la bodega original.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/Argumentos.java`:
```bash
mkdir java-argumentos && cd java-argumentos
mkdir src out
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

```java
import java.util.Arrays;

public final class Argumentos {
    static void modificar(int[] referenciaCopiada) {
        referenciaCopiada[0] = 99;       // Muta el arreglo compartido.
        referenciaCopiada = new int[]{7}; // Solo reasigna el parámetro local.
    }
    public static void main(String[] args) {
        int[] paradas = {1, 2, 3};
        modificar(paradas);
        System.out.println(Arrays.toString(paradas));
    }
}
```
Ejecuta `javac -d out src/Argumentos.java && java -cp out Argumentos`. **Salida esperada:** `[99, 2, 3]`, no `[7]`. **Fallo deliberado:** recorre con `i <= paradas.length`; aparece `ArrayIndexOutOfBoundsException` al intentar el índice 3, mientras el último válido es 2.

#### Paso 5 · Práctica guiada
Pista: cambia la firma de `modificar` para que reciba `int primerElemento` (el valor `paradas[0]`, no el arreglo) e intenta que el método lo modifique igual que antes modificaba el arreglo completo. Resultado esperado: tras llamar `modificar(paradas[0])`, `paradas[0]` sigue siendo `1` — un `int` primitivo se pasa por valor y el método solo modifica su copia local, a diferencia del arreglo, donde la copia de la referencia sigue apuntando al mismo objeto mutable.

#### Paso 6 · Práctica independiente
Crea un segundo arreglo `int[] pesos` con una posición menos que `paradas`, e intenta recorrer ambos arreglos con el mismo índice `i` dentro de un único ciclo. Identifica en qué iteración exacta ocurre `ArrayIndexOutOfBoundsException` sobre `pesos`, y corrige el límite del ciclo para que use el tamaño correcto de cada arreglo.

#### Paso 7 · Cierre y evidencia
Guarda `Argumentos.java`, la salida `[99, 2, 3]` y el `ArrayIndexOutOfBoundsException` provocado por `<=` junto a su corrección; como siguiente paso, en el Tema 8 aplicarás esta misma frontera de validación a entradas externas como fechas y texto. Errores comunes: decir que Java pasa objetos por referencia, usar `<=` en el límite de un ciclo sobre `length`, y asumir que reasignar un parámetro arreglo cambia el arreglo del llamador. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html y https://dev.java/learn/arrays/.
**¿Por qué es importante?** Porque confundir "pasar por referencia" con cómo Java realmente pasa argumentos lleva a predecir mutaciones que no ocurren, o a no anticipar las que sí ocurren, en cualquier método que reciba un arreglo u objeto mutable.
**Evidencia de aprendizaje:** entrega `Argumentos.java`, la salida `[99, 2, 3]` explicada, y el `ArrayIndexOutOfBoundsException` provocado por recorrer con `<=` junto a su corrección.
**Conceptos clave:** tamaño fijo, autoboxing, aliasing y Java siempre pasa por valor.

Un arreglo conserva una secuencia contigua de elementos de un mismo tipo y su longitud no cambia después de crearlo. Los índices comienzan en cero; el último índice válido es `length - 1`. Para una colección que crece o decrece usa `ArrayList` (Módulo 2), no copies arreglos manualmente en cada inserción.

Java **siempre pasa argumentos por valor**. Al pasar un `int`, el método recibe una copia del número. Al pasar un objeto, recibe una copia de la referencia: ambas referencias apuntan inicialmente al mismo objeto, por lo que el método puede mutarlo si el tipo es mutable, pero reasignar su parámetro no cambia la variable del llamador. Decir “Java pasa objetos por referencia” oculta esta diferencia y produce predicciones equivocadas.

Los wrappers permiten representar primitivos como objetos y admitir `null`, pero el autounboxing puede fallar. `Integer intentos = null; int total = intentos + 1;` lanza `NullPointerException` al intentar extraer el `int`. No uses `null` como un tercer estado implícito: valida o modela la ausencia explícitamente.

```java
static void reemplazar(int[] copiaReferencia) {
    copiaReferencia[0] = 99;       // muta el mismo arreglo observado por el llamador
    copiaReferencia = new int[]{7}; // solo reasigna la copia local de la referencia
}

int[] paradas = {1, 2, 3};
reemplazar(paradas);
System.out.println(java.util.Arrays.toString(paradas)); // [99, 2, 3]
```

**Predicción antes de ejecutar:** explica por qué el resultado no es `[7]`. Luego cambia el ciclo que recorre `paradas` de `< paradas.length` a `<= paradas.length`; identifica `ArrayIndexOutOfBoundsException`, el índice solicitado y el rango válido informado por el error.

**Analogía:** copiar una referencia es entregar una segunda dirección de la misma bodega, no construir otra bodega; cambiar mercancía se observa desde ambas direcciones, pero sustituir el papel con la dirección no mueve la bodega original.

**¿Por qué es importante?** Entender qué se copia permite anticipar mutaciones, aliasing y errores de límites antes de ejecutar el programa.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Procesa un arreglo de entregas sin modificar la entrada del llamador. Prueba valores ausentes y wrappers nulos, explicando qué se copia al pasar referencias a un método.

### Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`)

#### Paso 1 · Objetivo y preparación
Al finalizar podrás validar una fecha recibida como texto con `java.time`, y elegir entre `Random` y `SecureRandom` según si el valor generado protege algo. Prerrequisitos: JDK 25 y un editor de texto o IDE. Comprueba `java --version`.

#### Paso 2 · Contexto y caso real
Un formulario de reprogramación de entregas acepta la nueva fecha como texto sin validarla antes de guardarla; un cliente escribe `31/02/2026` (un día que no existe) y el sistema lo acepta sin error, hasta que otro proceso que sí usa `java.time` para calcular plazos falla de forma inesperada semanas después.

#### Paso 3 · Teoría, modelo mental y analogía
Convertir y validar en la frontera significa que el dominio nunca recibe texto sin interpretar: `LocalDate.parse` rechaza una fecha imposible con una excepción clara en el momento de la conversión, no más adelante en un cálculo distinto. La analogía: las APIs de `java.time` son instrumentos de medición distintos — una fecha civil, un instante global y una fecha con zona responden preguntas diferentes, aunque todas parezcan simplemente "tiempo".

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/FechaEntrega.java`:
```bash
mkdir java-fechas && cd java-fechas
mkdir src out
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

```java
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public final class FechaEntrega {
    public static void main(String[] args) {
        try {
            LocalDate fecha = LocalDate.parse(args[0]); // ISO: año-mes-día.
            System.out.println("fecha válida=" + fecha);
        } catch (DateTimeParseException | ArrayIndexOutOfBoundsException error) {
            System.out.println("Usa una fecha como 2026-07-22");
        }
    }
}
```
Ejecuta `javac -d out src/FechaEntrega.java && java -cp out FechaEntrega 2026-07-22`. **Resultado esperado:** `fecha válida=2026-07-22`. **Fallo deliberado:** usa `2026-02-31`; `LocalDate.parse` rechaza la fecha imposible y el programa presenta la ayuda controlada. En una aplicación real conserva también la causa técnica en logs internos.

#### Paso 5 · Práctica guiada
Pista: ejecuta el programa sin ningún argumento (`java -cp out FechaEntrega`). Resultado esperado: el mismo `catch` multi-tipo captura también `ArrayIndexOutOfBoundsException` (declarada junto a `DateTimeParseException`) y muestra el mismo mensaje de ayuda, en vez de que el programa termine abruptamente con una traza sin controlar.

#### Paso 6 · Práctica independiente
Agrega una segunda validación con `Integer.parseInt(args[1])` para un número de intentos de reentrega, y maneja también `NumberFormatException` dentro del mismo `catch` multi-tipo junto a `DateTimeParseException` y `ArrayIndexOutOfBoundsException`.

#### Paso 7 · Cierre y evidencia
Guarda `FechaEntrega.java`, la ejecución con una fecha válida y con `2026-02-31`; como siguiente paso, aplica esta misma validación en la frontera al proyecto progresivo del track. Errores comunes: aceptar una fecha como texto sin validarla antes de usarla, usar `Date`/`Calendar` para código nuevo, y usar una semilla fija de `Random` para generar un valor con implicaciones de seguridad. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/LocalDate.html y https://dev.java/learn/date-time/.
**¿Por qué es importante?** Porque una fecha imposible aceptada sin validar, o un valor sensible generado con una semilla fija predecible, son errores que solo se previenen eligiendo la API correcta en la frontera, no corrigiéndolos después de que ya causaron daño.
**Evidencia de aprendizaje:** entrega `FechaEntrega.java`, la ejecución con `2026-07-22` y con `2026-02-31`, y una frase propia que explique cuándo usar `Random` frente a `SecureRandom`.

Elegir `java.time` sobre `Date`/`Calendar`, y recibir el reloj como dependencia en vez de llamar `LocalDate.now()` directamente, es exactamente lo que necesitará el proyecto integrador de este track para que su lógica de fechas sea probable de forma determinista.

**Cuándo no usarlo:** `Random` con semilla fija es apropiado para pruebas reproducibles; usar esa misma semilla fija para generar tokens, contraseñas o cualquier valor con implicaciones de seguridad es exactamente el error que `SecureRandom` existe para prevenir — la elección depende de si el valor generado protege algo o no.

**Conceptos clave:** validación en la frontera, `java.time`, configuración y aleatoriedad apropiada.

`Scanner` es adecuado para ejercicios de consola si verificas `hasNextInt()` antes de `nextInt()` y consumes correctamente el salto de línea antes de llamar `nextLine()`. En aplicaciones reales, la entrada puede venir de HTTP, mensajería o archivos, pero la regla se conserva: convierte y valida en la frontera; el dominio debe recibir tipos válidos, no texto sin interpretar.

Para fechas nuevas prefiere `java.time`: `LocalDate` representa una fecha sin hora ni zona; `Instant`, un punto global en el tiempo; `ZonedDateTime`, una fecha-hora asociada a reglas de zona. `Date` y `Calendar` siguen existiendo por compatibilidad, pero su mutabilidad y API difícil de razonar no los convierten en el punto de partida recomendado. Para dinero, fechas y medidas, el tipo debe expresar la semántica y evitar valores ambiguos.

`System.getenv()` lee configuración del entorno; no registres secretos al imprimir su contenido. `Math.random()` sirve para demostraciones simples, `Random` para simulaciones reproducibles con semilla y `SecureRandom` para tokens u otros valores sensibles. Una semilla fija es una ventaja en pruebas porque reproduce el mismo escenario, y una vulnerabilidad si se usa para generar credenciales.

```java
import java.time.LocalDate;
import java.time.Period;
import java.util.Random;

LocalDate nacimiento = LocalDate.parse("1995-08-17");
int edad = Period.between(nacimiento, LocalDate.now()).getYears();
Random simulacion = new Random(42); // reproducible para una prueba
int demoraMinutos = simulacion.nextInt(5, 31);
System.out.printf("edad=%d, demora=%d min%n", edad, demoraMinutos);
```

**Decisión profesional:** no uses `LocalDate.now()` directamente dentro de una regla que debas probar de forma determinista; recibe un `Clock` o la fecha actual como dependencia. Provoca una fecha inválida (`"31/02/2025"`), observa `DateTimeParseException` y muestra un mensaje de dominio sin perder la causa técnica en el registro interno.

**Analogía:** las APIs estándar son instrumentos de medición distintos: una fecha civil, un instante global y una fecha con zona responden preguntas diferentes, aunque todas parezcan “tiempo”.

**¿Por qué es importante?** Elegir el tipo y la API según la semántica evita pruebas inestables, fechas ambiguas, secretos expuestos y números supuestamente aleatorios que no cumplen su propósito.

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con `mkdir academia-java && cd academia-java && git init && gradle init --type java-application`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | dominio y colecciones. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | I/O, concurrencia y datos. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | testing, profiling y seguridad. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.


## Construcción guiada del capítulo

**Objetivo del laboratorio:** compilar y ejecutar un programa Java que procese entrada del usuario con validación de tipos, inspeccionando el bytecode generado.

**Requisitos previos:** ninguno (módulo introductorio del track).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir y compilar `Hola.java` | Ver Tema 1 | Observa el `.class` generado |
| 2 | Declarar los 8 tipos primitivos y un `String` | Ver Tema 4 | Distingue primitivos de referencias |
| 3 | Leer un número con `Scanner` y validar | — | Maneja el caso de entrada incorrecta |
| 4 | Investigar JDK vs JRE vs JVM | Ver Tema 3 | Documenta cuál necesitas para cada caso |
| 5 | Inspeccionar el bytecode con `javap -c` | Ver Tema 1 | Observa las instrucciones generadas |
| 6 | Procesar cantidad y tarifa sin perder precisión | Ver Tema 5 | Compara `double` y `BigDecimal` construido desde texto |
| 7 | Modelar estados del envío con `enum` y `switch` | Ver Tema 6 | Agrega un estado y observa la exhaustividad |
| 8 | Predecir mutaciones y reasignaciones de un arreglo | Ver Tema 7 | Explica valor frente a copia de referencia |
| 9 | Calcular una fecha con `java.time` | Ver Tema 8 | Prueba una entrada válida y una fecha imposible |

**Verificación:** el laboratorio se considera exitoso si el programa compila y ejecuta correctamente, si maneja apropiadamente una entrada inválida del usuario sin terminar abruptamente, y si puedes explicar al menos tres instrucciones del bytecode generado por `javap`.

**Errores comunes y soluciones**

- **Confundir `JRE` con `JDK` al instalar el entorno de desarrollo.** Para desarrollar necesitas el JDK, que incluye `javac`.
- **Olvidar que `main` debe ser exactamente `public static void main(String[] args)`.** Cualquier desviación de esa firma exacta impide que la JVM lo reconozca como punto de entrada.
- **Asumir que un tipo primitivo puede usarse directamente en una colección genérica.** Usa el wrapper correspondiente (`Integer`, no `int`, dentro de `List<Integer>`).
- **Comparar texto con `==`.** Usa `equals` para contenido; `==` solo responde si las referencias son idénticas.
- **Afirmar que Java pasa objetos por referencia.** Java copia la referencia por valor; se puede mutar el objeto apuntado, pero no reasignar la variable del llamador.
- **Usar `double` para una tarifa monetaria.** Usa `BigDecimal` desde una representación decimal textual y define la política de redondeo.

---
