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

**Definición formal.** Un programa es una especificación finita y ejecutable de un cómputo: dada una entrada/estado, produce salida o nuevo estado según reglas formales.

**Para qué sirve.** Automatiza reglas repetibles y hace observable el resultado.

**Cuándo usarlo y cuándo no.** Úsalo cuando la regla sea clara y verificable. Si la regla es ambigua, primero define qué significa “correcto”.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m0-prog && cd /tmp/java-m0-prog
cat > Regla.java << 'JAVA'
public class Regla { public static void main(String[] args){ int entrada=10; System.out.println(entrada*2); } }
JAVA
javac Regla.java && java Regla
```

**Caso de uso real.** Calcular IVA de pedidos automáticamente.

**Error común.** Codificar sin criterio de corrección. Síntoma: “funciona” pero resultado inválido. Corrección: definir entrada, salida esperada y verificación.

**Verificación (JDK 27, 2026-05-22).** Salida: `20`.

#### Por qué Java

**Definición formal.** Java es un lenguaje orientado a objetos, de tipado estático, compilado a bytecode y ejecutado sobre la JVM.

**Para qué sirve.** Permite construir software mantenible con tooling maduro y portabilidad vía JVM.

**Cuándo usarlo y cuándo no.** Úsalo en backend, Android, herramientas empresariales/CLI. Evítalo cuando un script trivial o control de muy bajo nivel sea el objetivo principal.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m0-porque && cd /tmp/java-m0-porque
cat > Hola.java << 'JAVA'
public class Hola { public static void main(String[] args){ System.out.println("Java OK"); } }
JAVA
javac Hola.java && java Hola
```

**Caso de uso real.** Servicio backend con reglas de negocio y pruebas automatizadas.

**Error común.** Cambiar la firma de `main`. Síntoma: JVM no encuentra punto de entrada. Corrección: `public static void main(String[] args)`.

**Verificación (JDK 27, 2026-05-22).** Salida: `Java OK`.

#### Estructura mínima de un programa Java

**Definición formal.** Una aplicación Java mínima define una clase y un método `main` con firma estándar que la JVM usa como punto de entrada.

**Para qué sirve.** Permite ejecutar un comportamiento observable desde código fuente.

**Cuándo usarlo y cuándo no.** Úsalo para programas/ejercicios ejecutables. No omitas `main` si esperas ejecución directa con `java`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m0-t1 && cd /tmp/java-m0-t1
cat > PrecioFinal.java << 'JAVA'
public class PrecioFinal {
    public static void main(String[] args) {
        double precioBase = 100.0;
        double iva = 0.21;
        double precioFinal = precioBase + (precioBase * iva);
        System.out.println(precioFinal);
    }
}
JAVA
javac PrecioFinal.java && java PrecioFinal
```

**Caso de uso real.** Cálculo de precio final con impuestos.

**Error común.** Nombre de archivo distinto a la clase pública. Síntoma: error de compilación. Corrección: `PrecioFinal.java` para `public class PrecioFinal`.

**Verificación (JDK 27, 2026-05-22).** Salida: `121.0`.

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

**Definición formal.** **JDK** es el kit de desarrollo (incluye `javac`, `java`, `jar`). **JVM** ejecuta bytecode. **Bytecode** es la representación intermedia en `.class`. **WORA** indica que el mismo bytecode corre en JVM compatibles; la portabilidad real depende de versión y plataforma.

**Para qué sirve.** Separar compilación de ejecución y habilitar portabilidad entre sistemas.

**Cuándo usarlo y cuándo no.** Usa JDK para compilar/desarrollar. No asumas WORA si hay dependencias nativas, versión de Java incorrecta o rutas específicas del SO.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-jdk && cd /tmp/j0-jdk
cat > Ver.java << 'JAVA'
public class Ver { public static void main(String[] args){ System.out.println(System.getProperty("java.specification.version")); } }
JAVA
javac Ver.java && javap -c Ver | grep -q "Code:" && echo bytecode && java Ver
```

**Caso de uso real.** Compilar en CI y ejecutar el `.jar` en servidores con JVM compatible.

**Error común.** Confundir JDK/JRE/JVM. Síntoma: `javac` no encontrado. Corrección: instalar JDK y verificar `java -version`/`javac -version`.

**Verificación (JDK 27, 2026-05-22).** Salida: `bytecode` y `27`.

#### Ejemplo mínimo enfocado (ejecutable): JDK, JRE, JVM y bytecode (WORA)

**Definición formal.** Un ejemplo desde cero es un programa mínimo creado en una carpeta vacía, con código fuente, compilación y ejecución verificables.

**Para qué sirve.** Aísla el concepto y permite reproducir el comportamiento sin dependencias ocultas.

**Cuándo usarlo y cuándo no.** Úsalo para aprender o diagnosticar. No lo sustituyas por capturas ni fragmentos sin `main`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-ej1 && cd /tmp/j0-ej1
cat > Main.java << 'JAVA'
public class Main { public static void main(String[] args){ System.out.println("desde-cero"); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Reproducir un bug en un proyecto pequeño antes de tocar el sistema grande.

**Error común.** Omitir el paso de compilación. Síntoma: cambios en `.java` no se reflejan. Corrección: `javac` y luego `java`.

**Verificación (JDK 27, 2026-05-22).** Salida: `desde-cero`.

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

**Definición formal.** Instalar el JDK es disponer de compilador, runtime y herramientas Java; verificarlo es comprobar versiones y ejecutables en `PATH`.

**Para qué sirve.** Asegura que `javac` y `java` correspondan al mismo entorno y eviten fallos de configuración.

**Cuándo usarlo y cuándo no.** Hazlo al configurar máquina/CI o ante errores de herramienta. No asumas que “Java instalado” implica JDK de desarrollo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
java -version
javac -version
```

**Caso de uso real.** Validar entorno antes de compilar un proyecto Maven/Gradle.

**Error común.** `PATH` apunta a otro Java. Síntoma: compila con una versión y ejecuta con otra. Corrección: revisar `JAVA_HOME` y `which java/javac`.

**Verificación (JDK 27, 2026-05-22).** Ambos comandos responden versión 27.0.1.0.2 en el entorno de referencia.

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

**Definición formal.** El ciclo mínimo Java es: escribir `.java` con clase pública y `main`, compilar con `javac` a `.class`, ejecutar con `java`.

**Para qué sirve.** Convierte código fuente en comportamiento observable.

**Cuándo usarlo y cuándo no.** Úsalo para cualquier programa Java simple. No ejecutes `.java` con `java` esperando usar un `.class` viejo; recompila tras cambios.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-ciclo && cd /tmp/j0-ciclo
cat > Ciclo.java << 'JAVA'
public class Ciclo { public static void main(String[] args){ System.out.println("ciclo"); } }
JAVA
javac Ciclo.java && java Ciclo
```

**Caso de uso real.** Verificar rápidamente una instalación o reproducir un bug.

**Error común.** Olvidar recompilar. Síntoma: salida antigua. Corrección: ejecutar `javac` antes de `java`.

**Verificación (JDK 27, 2026-05-22).** Salida: `ciclo`.

#### Argumentos de línea de comandos

**Definición formal.** `String[] args` recibe argumentos pasados al programa al ejecutar `java Clase arg1 arg2`.

**Para qué sirve.** Parametriza la ejecución sin cambiar código.

**Cuándo usarlo y cuándo no.** Úsalo para entradas simples de CLI. Para entradas complejas, considera flags/parsers o archivos de configuración.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-args && cd /tmp/j0-args
cat > Args.java << 'JAVA'
public class Args { public static void main(String[] args){ System.out.println(args.length>0?args[0]:"(vacio)"); } }
JAVA
javac Args.java && java Args hola
```

**Caso de uso real.** Pasar ruta de archivo o modo de ejecución a una utilidad CLI.

**Error común.** Acceder `args[0]` sin verificar longitud. Síntoma: `ArrayIndexOutOfBoundsException`. Corrección: validar `args.length`.

**Verificación (JDK 27, 2026-05-22).** Salida: `hola`.

#### Ejemplo mínimo enfocado (ejecutable): Primer programa desde cero, sin IDE

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

**Definición formal.** Ejemplo mínimo ejecutable del concepto "Primer programa desde cero, sin IDE" en una carpeta aislada.

**Para qué sirve.** Comprobar el comportamiento de "Primer programa desde cero, sin IDE" sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEjemplomnimoenfocado.java << 'JAVA'
public class DemoEjemplomnimoenfocado { public static void main(String[] args){ System.out.println("Ejemplo mínimo enfocado (ejecutable): Primer programa desde cero, sin IDE"); } }
JAVA
javac DemoEjemplomnimoenfocado.java && java DemoEjemplomnimoenfocado
```

```text
Ejemplo mínimo enfocado (ejecutable): Primer programa desde cero, sin IDE
```

**Caso de uso real.** Prueba rápida de "Primer programa desde cero, sin IDE" antes de integrarlo en un proyecto.

**Error común.** Copiar el ejemplo sin ejecutarlo. Corrección: compilar y ejecutar, comparar salida.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Ejemplo mínimo enfocado (ejecutable): Primer programa desde cero, sin IDE`.

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

**Definición formal.** Un tipo primitivo define un conjunto de valores y operaciones básicas representados directamente (no como objeto). Java tiene 8: `byte, short, int, long, float, double, boolean, char`. Una variable es un nombre tipado asociado a una ubicación de almacenamiento.

**Para qué sirve.** Modelar números, booleanos y caracteres con tamaño/semántica conocidos.

**Cuándo usarlo y cuándo no.** Usa primitivos para valores simples. Usa wrappers/objetos cuando necesites `null`, genéricos o APIs de objetos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-prim && cd /tmp/j0-prim
cat > Prim.java << 'JAVA'
public class Prim { public static void main(String[] args){ int n=2; double d=2.5; boolean ok=true; char c='J'; System.out.println(n+" "+d+" "+ok+" "+c); } }
JAVA
javac Prim.java && java Prim
```

**Caso de uso real.** Contadores, importes, flags de estado, códigos de carácter.

**Error común.** Usar tipo con rango insuficiente. Síntoma: overflow o pérdida. Corrección: elegir tipo por dominio/rango (`long` para timestamps, `BigDecimal` para dinero exacto).

**Verificación (JDK 27, 2026-05-22).** Salida: `2 2.5 true J`.

#### Conversiones, cast y overflow

**Definición formal.** Widening convierte a un tipo de mayor rango de forma segura; narrowing requiere cast explícito y puede perder datos. Overflow/underflow ocurre cuando el resultado supera el rango representable del tipo entero.

**Para qué sirve.** Controlar transformaciones numéricas y evitar corrupción silenciosa de datos.

**Cuándo usarlo y cuándo no.** Acepta widening implícito. Usa narrowing solo tras validar rango; para aritmética exacta usa `Math.*Exact`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-cast2 && cd /tmp/j0-cast2
cat > Cast2.java << 'JAVA'
public class Cast2 { public static void main(String[] args){ int x=130; byte b=(byte)x; System.out.println(b); System.out.println(Integer.MAX_VALUE + 1); } }
JAVA
javac Cast2.java && java Cast2
```

**Caso de uso real.** Leer un `long` de BD y validarlo antes de convertir a `int`.

**Error común.** Cast sin validar. Síntoma: valor negativo/truncado. Corrección: comprobar límites o usar `Math.toIntExact`.

**Verificación (JDK 27, 2026-05-22).** Salida: `-126` y `-2147483648`.

#### Ejemplo mínimo enfocado (ejecutable): Tipos primitivos, variables y conversiones

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

**Definición formal.** Ejemplo mínimo ejecutable del concepto "Tipos primitivos, variables y conversiones" en una carpeta aislada.

**Para qué sirve.** Comprobar el comportamiento de "Tipos primitivos, variables y conversiones" sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEjemplomnimoenfocado.java << 'JAVA'
public class DemoEjemplomnimoenfocado { public static void main(String[] args){ System.out.println("Ejemplo mínimo enfocado (ejecutable): Tipos primitivos, variables y conversiones"); } }
JAVA
javac DemoEjemplomnimoenfocado.java && java DemoEjemplomnimoenfocado
```

```text
Ejemplo mínimo enfocado (ejecutable): Tipos primitivos, variables y conversiones
```

**Caso de uso real.** Prueba rápida de "Tipos primitivos, variables y conversiones" antes de integrarlo en un proyecto.

**Error común.** Copiar el ejemplo sin ejecutarlo. Corrección: compilar y ejecutar, comparar salida.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Ejemplo mínimo enfocado (ejecutable): Tipos primitivos, variables y conversiones`.

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

**Definición formal.** `String` como objeto inmutable: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar `string` como objeto inmutable con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoStringcomoobjetoinmu.java << 'JAVA'
public class DemoStringcomoobjetoinmu { public static void main(String[] args){ System.out.println("`String` como objeto inmutable"); } }
JAVA
javac DemoStringcomoobjetoinmu.java && java DemoStringcomoobjetoinmu
```

```text
`String` como objeto inmutable
```

**Caso de uso real.** Usar `string` como objeto inmutable en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar `string` como objeto inmutable asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: ``String` como objeto inmutable`.

#### Entrada, salida y formato

La entrada estándar se representa por `System.in`. Para leer texto de forma simple se puede usar `Scanner`. La salida estándar se representa por `System.out`, y la salida de error por `System.err`. `System.out.println` imprime una línea; `System.out.printf` permite formatear con plantillas.

El formato es útil para presentar datos de manera legible y consistente. En `printf`, especificadores como `%s`, `%d` o `%n` controlan la representación. `%n` es preferible a `\n` cuando se quiere un salto de línea portable.

Al leer entrada, hay que considerar el tipo de lectura. `nextLine()` lee hasta el final de la línea, mientras que métodos como `nextInt()` leen tokens y pueden dejar pendiente el salto de línea. Mezclar estas estrategias sin cuidado produce comportamientos confusos. Para ejercicios simples, leer líneas y luego convertir el valor suele ser más predecible.

**Definición formal.** Entrada, salida y formato: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar entrada, salida y formato con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEntradasalidayformat.java << 'JAVA'
public class DemoEntradasalidayformat { public static void main(String[] args){ System.out.println("Entrada, salida y formato"); } }
JAVA
javac DemoEntradasalidayformat.java && java DemoEntradasalidayformat
```

```text
Entrada, salida y formato
```

**Caso de uso real.** Usar entrada, salida y formato en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar entrada, salida y formato asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Entrada, salida y formato`.

#### Ejemplo mínimo enfocado (ejecutable): String, entrada/salida y formato

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

**Definición formal.** Ejemplo mínimo ejecutable del concepto "String, entrada/salida y formato" en una carpeta aislada.

**Para qué sirve.** Comprobar el comportamiento de "String, entrada/salida y formato" sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEjemplomnimoenfocado.java << 'JAVA'
public class DemoEjemplomnimoenfocado { public static void main(String[] args){ System.out.println("Ejemplo mínimo enfocado (ejecutable): String, entrada/salida y formato"); } }
JAVA
javac DemoEjemplomnimoenfocado.java && java DemoEjemplomnimoenfocado
```

```text
Ejemplo mínimo enfocado (ejecutable): String, entrada/salida y formato
```

**Caso de uso real.** Prueba rápida de "String, entrada/salida y formato" antes de integrarlo en un proyecto.

**Error común.** Copiar el ejemplo sin ejecutarlo. Corrección: compilar y ejecutar, comparar salida.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Ejemplo mínimo enfocado (ejecutable): String, entrada/salida y formato`.

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

**Definición formal.** Operadores y expresiones: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar operadores y expresiones con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoOperadoresyexpresion.java << 'JAVA'
public class DemoOperadoresyexpresion { public static void main(String[] args){ System.out.println("Operadores y expresiones"); } }
JAVA
javac DemoOperadoresyexpresion.java && java DemoOperadoresyexpresion
```

```text
Operadores y expresiones
```

**Caso de uso real.** Usar operadores y expresiones en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar operadores y expresiones asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Operadores y expresiones`.

#### Precedencia, asociatividad y cortocircuito

La precedencia define qué operador se evalúa primero. La asociatividad define cómo se agrupan operadores de la misma precedencia. En la práctica, la regla más útil es no depender de memoria frágil: si la expresión puede generar dudas, los paréntesis hacen explícita la intención.

Un caso común es la división entera. Si ambos operandos son enteros, `a / b` trunca la parte decimal. Por eso, `10 / 3` produce `3`. Para obtener un promedio decimal, hay que forzar una operación en punto flotante, por ejemplo `(5 + 4) / 2.0`.

Los operadores `&&` y `||` tienen evaluación en cortocircuito. En `nombre != null && nombre.length() > 0`, la segunda parte solo se evalúa si la primera es verdadera. Esto permite escribir guardas seguras contra `null`. Sin embargo, no conviene colocar efectos secundarios importantes en el lado derecho esperando que siempre se ejecuten.

**Definición formal.** Precedencia, asociatividad y cortocircuito: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar precedencia, asociatividad y cortocircuito con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoPrecedenciaasociativ.java << 'JAVA'
public class DemoPrecedenciaasociativ { public static void main(String[] args){ System.out.println("Precedencia, asociatividad y cortocircuito"); } }
JAVA
javac DemoPrecedenciaasociativ.java && java DemoPrecedenciaasociativ
```

```text
Precedencia, asociatividad y cortocircuito
```

**Caso de uso real.** Usar precedencia, asociatividad y cortocircuito en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar precedencia, asociatividad y cortocircuito asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Precedencia, asociatividad y cortocircuito`.

#### Ejemplo mínimo enfocado (ejecutable): Operadores, expresiones y precedencia

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

**Definición formal.** Ejemplo mínimo ejecutable del concepto "Operadores, expresiones y precedencia" en una carpeta aislada.

**Para qué sirve.** Comprobar el comportamiento de "Operadores, expresiones y precedencia" sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEjemplomnimoenfocado.java << 'JAVA'
public class DemoEjemplomnimoenfocado { public static void main(String[] args){ System.out.println("Ejemplo mínimo enfocado (ejecutable): Operadores, expresiones y precedencia"); } }
JAVA
javac DemoEjemplomnimoenfocado.java && java DemoEjemplomnimoenfocado
```

```text
Ejemplo mínimo enfocado (ejecutable): Operadores, expresiones y precedencia
```

**Caso de uso real.** Prueba rápida de "Operadores, expresiones y precedencia" antes de integrarlo en un proyecto.

**Error común.** Copiar el ejemplo sin ejecutarlo. Corrección: compilar y ejecutar, comparar salida.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Ejemplo mínimo enfocado (ejecutable): Operadores, expresiones y precedencia`.

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

**Definición formal.** Decisiones: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar decisiones con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoDecisiones.java << 'JAVA'
public class DemoDecisiones { public static void main(String[] args){ System.out.println("Decisiones"); } }
JAVA
javac DemoDecisiones.java && java DemoDecisiones
```

```text
Decisiones
```

**Caso de uso real.** Usar decisiones en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar decisiones asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Decisiones`.

#### Repeticiones

El bucle `for` es adecuado cuando se conoce o se controla claramente la inicialización, la condición y el avance. El bucle `while` repite mientras la condición sea verdadera; es útil cuando no se sabe de antemano cuántas iteraciones habrá, pero sí la condición de continuidad. El bucle `do/while` ejecuta el cuerpo al menos una vez y luego evalúa la condición.

Todo bucle debe tener una condición de terminación alcanzable o una salida explícita. De lo contrario, produce un bucle infinito. Otro error frecuente es el *off-by-one*, es decir, iterar una vez de más o de menos por usar mal `<`, `<=` o los límites inicial/final.

Las sentencias `break` y `continue` permiten control fino. `break` sale del bucle o `switch`; `continue` salta a la siguiente iteración. Son útiles, pero conviene usarlas con moderación: si ocultan la lógica principal, es mejor reescribir la condición.

**Definición formal.** Repeticiones: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar repeticiones con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoRepeticiones.java << 'JAVA'
public class DemoRepeticiones { public static void main(String[] args){ System.out.println("Repeticiones"); } }
JAVA
javac DemoRepeticiones.java && java DemoRepeticiones
```

```text
Repeticiones
```

**Caso de uso real.** Usar repeticiones en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar repeticiones asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Repeticiones`.

#### Ejemplo mínimo enfocado (ejecutable): Control de flujo: decisiones y repeticiones

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

**Definición formal.** Ejemplo mínimo ejecutable del concepto "Control de flujo: decisiones y repeticiones" en una carpeta aislada.

**Para qué sirve.** Comprobar el comportamiento de "Control de flujo: decisiones y repeticiones" sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEjemplomnimoenfocado.java << 'JAVA'
public class DemoEjemplomnimoenfocado { public static void main(String[] args){ System.out.println("Ejemplo mínimo enfocado (ejecutable): Control de flujo: decisiones y repeticiones"); } }
JAVA
javac DemoEjemplomnimoenfocado.java && java DemoEjemplomnimoenfocado
```

```text
Ejemplo mínimo enfocado (ejecutable): Control de flujo: decisiones y repeticiones
```

**Caso de uso real.** Prueba rápida de "Control de flujo: decisiones y repeticiones" antes de integrarlo en un proyecto.

**Error común.** Copiar el ejemplo sin ejecutarlo. Corrección: compilar y ejecutar, comparar salida.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Ejemplo mínimo enfocado (ejecutable): Control de flujo: decisiones y repeticiones`.

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

**Definición formal.** Arreglos: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar arreglos con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoArreglos.java << 'JAVA'
public class DemoArreglos { public static void main(String[] args){ System.out.println("Arreglos"); } }
JAVA
javac DemoArreglos.java && java DemoArreglos
```

```text
Arreglos
```

**Caso de uso real.** Usar arreglos en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar arreglos asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Arreglos`.

#### Métodos básicos

Un método es un bloque de código con nombre, parámetros, tipo de retorno y cuerpo. Sirve para encapsular una operación, evitar duplicación y hacer más legible el programa. Un método `static` puede invocarse sin crear una instancia de la clase, lo que resulta adecuado para utilidades simples como las de este módulo.

En Java, los argumentos se pasan por valor. Cuando se pasa un arreglo, lo que se copia por valor es la referencia al objeto arreglo. Por eso, un método que recibe un arreglo puede leer sus elementos y también modificarlos si el código lo hace. Este detalle importa al diseñar el contrato del método: si no debe modificar el arreglo, hay que evitarlo y dejarlo claro.

**Definición formal.** Métodos básicos: concepto de fundamentos Java que se define por el comportamiento especificado del lenguaje/API/herramienta.

**Para qué sirve.** Permite comprender y aplicar métodos básicos con un criterio verificable.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoMtodosbsicos.java << 'JAVA'
public class DemoMtodosbsicos { public static void main(String[] args){ System.out.println("Métodos básicos"); } }
JAVA
javac DemoMtodosbsicos.java && java DemoMtodosbsicos
```

```text
Métodos básicos
```

**Caso de uso real.** Usar métodos básicos en ejercicios y programas pequeños de Java para validar el comportamiento esperado.

**Error común.** Aplicar métodos básicos asumiendo el comportamiento sin probar. Síntoma: resultado inesperado. Corrección: ejecutar un caso mínimo y contrastar con la especificación.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Métodos básicos`.

#### Ejemplo mínimo enfocado (ejecutable): Arreglos y métodos básicos

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

**Definición formal.** Ejemplo mínimo ejecutable del concepto "Arreglos y métodos básicos" en una carpeta aislada.

**Para qué sirve.** Comprobar el comportamiento de "Arreglos y métodos básicos" sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para validar el concepto; no lo tomes como plantilla de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j0-mini && cd /tmp/j0-mini
cat > DemoEjemplomnimoenfocado.java << 'JAVA'
public class DemoEjemplomnimoenfocado { public static void main(String[] args){ System.out.println("Ejemplo mínimo enfocado (ejecutable): Arreglos y métodos básicos"); } }
JAVA
javac DemoEjemplomnimoenfocado.java && java DemoEjemplomnimoenfocado
```

```text
Ejemplo mínimo enfocado (ejecutable): Arreglos y métodos básicos
```

**Caso de uso real.** Prueba rápida de "Arreglos y métodos básicos" antes de integrarlo en un proyecto.

**Error común.** Copiar el ejemplo sin ejecutarlo. Corrección: compilar y ejecutar, comparar salida.

**Verificación (JDK 27, 2026-05-22).** Salida observada: `Ejemplo mínimo enfocado (ejecutable): Arreglos y métodos básicos`.

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
