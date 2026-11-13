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

**Duración estimada:** 30 min.
**¿Por qué es importante?** Entender fuente, bytecode y classpath permite diagnosticar por qué un programa que compila no inicia.

**Prerrequisitos:** ninguno. Proyecto continuo del track: construir un motor de asignación de entregas. Usa JDK 21 o posterior y ejecuta `java --version` y `javac --version` antes de comenzar.

#### Subtema 1.1: Compila y ejecuta tu primera clase · 10 min

**1. Contexto**
El código que escribes y el archivo que ejecuta Java tienen formatos distintos. Verás esa traducción en una clase pequeña.

**2. Hazlo tú**
Crea `java-motor/src/Saludo.java` con este contenido:

```java
public final class Saludo {
    public static void main(String[] args) {
        System.out.println("Hola desde la JVM");
    }
}
```

Desde la carpeta `java-motor/`, ejecuta:

```bash
javac -d out src/Saludo.java
java -cp out Saludo
```

**Resultado esperado:** la terminal muestra `Hola desde la JVM`; el archivo compilado queda en `out/Saludo.class`.

**Fallo deliberado:** cambia el nombre del archivo a `saludo.java` y vuelve a compilar. **Error esperado:** el compilador indica que la clase pública `Saludo` debe estar en `Saludo.java`. **Diagnóstico:** el nombre de un archivo con una clase pública distingue mayúsculas y debe coincidir con el nombre de la clase.

**3. Entiende**
`javac` compila el archivo fuente `.java` y `java` ejecuta el bytecode `.class`. Compilar no ejecuta el programa.

**4. Cierra**
Guarda el fuente y anota qué archivo creó cada comando.

#### Subtema 1.2: Lee una instrucción del bytecode · 10 min

**1. Contexto**
Si el programa compila pero falla en otro entorno, saber inspeccionar el artefacto ayuda a encontrar dónde se rompió el recorrido.

**2. Hazlo tú**
Abre `java-motor/src/Saludo.java` y, desde `java-motor/`, ejecuta:

```bash
javap -c -classpath out Saludo
```

**Resultado esperado:** aparece el método `main` y varias instrucciones de bytecode, entre ellas llamadas asociadas a `System.out.println`.

**Fallo deliberado:** ejecuta `javap -c -classpath src Saludo`. **Error esperado:** no encuentra la clase. **Diagnóstico:** `javap` busca el `.class`; está en `out`, no en la carpeta `src`.

**3. Entiende**
El bytecode es un formato intermedio que la JVM puede ejecutar. `javap` lo muestra para inspección; no modifica el programa.

**4. Cierra**
Copia dos instrucciones que mostró `javap` y describe cuál llamada del programa ayudan a representar.

#### Subtema 1.3: Diagnostica dónde busca la JVM · 10 min

**1. Contexto**
La JVM necesita saber en qué carpeta están las clases compiladas. Una ruta equivocada produce un error de carga aunque el archivo fuente esté bien.

**2. Hazlo tú**
Desde `java-motor/`, ejecuta el comando correcto y el comando con el directorio equivocado:

```bash
java -cp out Saludo
java -cp src Saludo
```

**Resultado esperado:** el primero imprime `Hola desde la JVM`; el segundo falla con `Could not find or load main class Saludo` o `ClassNotFoundException`.

**Fallo deliberado:** borra `out/Saludo.class` y vuelve a ejecutar `java -cp out Saludo`. **Error esperado:** no puede cargar la clase. **Diagnóstico:** el bytecode fue eliminado; recompila con `javac -d out src/Saludo.java`.

**3. Entiende**
`-cp` señala el classpath: las carpetas donde Java busca las clases. La carpeta del fuente no sustituye la carpeta que contiene el `.class`.

**4. Cierra**
Entrega la salida correcta, el error reproducido y la ruta que corregiste.

**Hito del tema:**

- [ ] Compilé y ejecuté `Saludo`.
- [ ] Inspeccioné bytecode con `javap`.
- [ ] Reproduje el error de classpath y lo corregí.
- [ ] Conservé fuente, artefacto y salidas.

**Fuentes oficiales:** [manual de `javac`](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html) y [manual de `java`](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html).

**Proyecto integrador:** el motor de asignación de entregas parte de esta misma pareja `javac`/`java`: cada módulo del motor se compila una vez y se ejecuta muchas veces con distintos datos de entrada. **Límite:** `javac` recompila cuando cambia el código; no necesitas recompilar solo porque cambien los argumentos de entrada, y volver a compilar sin cambios reales no diagnostica ningún error de ejecución.

### Tema 2: public static void main — qué significa cada palabra

**Duración estimada:** 30 min.
**¿Por qué es importante?** Este método conecta lo que escribes con el arranque del programa; entenderlo te permite recibir parámetros de ejecución y diagnosticar por qué el lanzador no encuentra la entrada.
**Prerrequisitos:** M0 T1. Proyecto continuo: el motor de asignación de entregas recibirá origen y destino por terminal. Usa JDK 21 o posterior. Java 25 admite formas adicionales de métodos `main`; aquí practicarás la firma clásica, compatible con versiones anteriores.

#### Subtema 2.1: Identifica cada parte de la firma clásica · 10 min

**1. Contexto**
El lanzador necesita una entrada reconocible para iniciar el motor sin pedirle al usuario que cree objetos primero.

**2. Hazlo tú**
Crea `java-motor/src/PuntoEntrada.java`:

```java
public final class PuntoEntrada {
    public static void main(String[] args) {
        System.out.println("Motor de entregas listo");
        System.out.println("Argumentos recibidos: " + args.length);
    }
}
```

Desde `java-motor/`, compila y ejecuta:

```bash
javac -d out src/PuntoEntrada.java
java -cp out PuntoEntrada
```

**Resultado esperado:** `Motor de entregas listo` y `Argumentos recibidos: 0`.

**Fallo deliberado:** cambia el nombre `main` por `iniciar`, recompila y lanza la clase. **Error esperado:** Java indica que no encuentra un método principal válido. **Diagnóstico:** el código sigue siendo un método Java válido, pero el lanzador busca una entrada reconocida llamada `main`.

**3. Entiende**
`public` permite que el lanzador acceda al método; `static` permite llamarlo en la clase antes de crear una instancia; `void` indica que no devuelve un resultado al lanzador. `String[] args` es una lista de textos que puede venir vacía.

**4. Cierra**
Señala en el archivo qué palabra permite el acceso, cuál evita crear un objeto y dónde aparecen los argumentos.

#### Subtema 2.2: Recibe argumentos sin recompilar · 10 min

**1. Contexto**
Una misma versión del motor debe poder asignar rutas distintas cambiando solo los datos de entrada.

**2. Hazlo tú**
Reemplaza el contenido de `java-motor/src/PuntoEntrada.java` por el siguiente código completo:

```java
public final class PuntoEntrada {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Uso: java PuntoEntrada <origen> <destino>");
            return;
        }

        String origen = args[0];
        String destino = args[1];
        System.out.printf("Ruta solicitada: %s -> %s%n", origen, destino);
    }
}
```

Desde `java-motor/`, ejecuta:

```bash
javac -d out src/PuntoEntrada.java
java -cp out PuntoEntrada Medellin Envigado
java -cp out PuntoEntrada Medellin
```

**Resultado esperado:** la primera ejecución muestra `Ruta solicitada: Medellin -> Envigado`; la segunda muestra el mensaje de uso y termina normalmente.

**Fallo deliberado:** elimina la condición `if` y ejecuta con un solo argumento. **Error esperado:** `ArrayIndexOutOfBoundsException`. **Diagnóstico:** `args[1]` no existe; valida la cantidad antes de leer posiciones.

**3. Entiende**
Los argumentos llegan en el mismo orden en que aparecen después del nombre de la clase: `args[0]` es el primero y `args[1]` el segundo. El `return` termina este método `void`; no devuelve datos.

**4. Cierra**
Guarda las dos salidas y explica por qué el programa maneja la entrada incompleta antes de acceder a `args[1]`.

#### Subtema 2.3: Compara una forma abreviada de Java 25 · 10 min

**1. Contexto**
Al leer ejemplos nuevos puedes encontrar programas de archivo único con menos sintaxis; debes reconocer qué versión requiere cada forma.

**2. Hazlo tú**
En una carpeta aparte `java-motor/java25/`, crea `Hola25.java` con este archivo completo:

```java
void main() {
    System.out.println("Hola, Java 25");
}
```

Con JDK 25, desde `java-motor/java25/`, ejecuta:

```bash
java Hola25.java
```

**Resultado esperado:** `Hola, Java 25`. El modo de archivo fuente permite este ejemplo compacto en Java 25.

**Fallo deliberado:** ejecuta `javac -d out Hola25.java` con un JDK 21. **Error esperado:** errores de sintaxis cerca de `void main()`. **Diagnóstico:** la forma compacta mostrada depende de las capacidades incorporadas en Java 25; el estilo clásico del subtema anterior funciona en JDK 21 y posteriores.

**3. Entiende**
Java 25 amplió las formas de entrada válidas para facilitar programas pequeños; la firma clásica sigue siendo útil en proyectos y versiones anteriores. Al elegir una forma, comprueba la versión mínima declarada por el proyecto.

**4. Cierra**
Anota las versiones con las que verificaste cada archivo y conserva las salidas. No cambies la firma clásica del motor por una forma que el JDK objetivo no soporte.

**Hito del tema:**

- [ ] Identifiqué el papel de `public`, `static`, `void`, `main` y `String[] args`.
- [ ] Recibí y mostré dos argumentos en el orden correcto.
- [ ] Controlé el caso en que faltaba un argumento y reproduje el fallo sin validación.
- [ ] Distinguí la firma clásica de la forma compacta disponible en Java 25.

**Fuentes oficiales:** [guía de lanzamiento de aplicaciones Java](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html) y [JEP 512: Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512).

**Diagrama interactivo:** [La firma que la JVM busca](/visuals/temas/java/modulo-0-tema-2-main.html).

**Proyecto integrador:** el motor de entregas recibirá origen y destino exactamente como en el Subtema 2.2, por terminal y sin recompilar entre rutas distintas. **Límite:** no conviene usar la forma compacta de Java 25 (`void main()`) en el motor real, porque el proyecto debe seguir compilando en JDK 21; úsala solo para scripts de un solo archivo que no se distribuyen. **Práctica:** modifica `PuntoEntrada.java` para aceptar un tercer argumento opcional con el peso del paquete y valida que `args.length` lo cubra antes de leerlo.

### Tema 3: JDK, JRE y JVM

**¿Por qué es importante?** Saber qué herramienta compila y cuál ejecuta evita buscar un bug en el código cuando falta el JDK. **Modelo mental:** el compilador es el taller que fabrica el bytecode; la JVM es el motor que lo pone en marcha.

**Proyecto integrador:** el motor de entregas se compila en desarrollo y CI, y se ejecuta en el servidor. **Límite:** no asumas que todas las distribuciones traen un JRE separado. **Práctica:** registra las versiones de java y javac para comparar equipos.

```bash
javac -d out src/Entorno.java
java -cp out Entorno
```

#### Subtema 3.1: Comprueba qué herramientas instalaste · 10 min

**1. Contexto**

Para compilar necesitas el JDK. Comprobar los ejecutables evita confundir un problema de instalación con un error del programa.

**2. Hazlo tú**

Crea `java-motor/src/versiones.txt`. En una terminal ejecuta:

```bash
java --version
javac --version
```

**Resultado esperado:** los dos comandos muestran la misma versión mayor.

Registra en `java-motor/src/versiones.txt` la versión que imprimió cada comando.

**Fallo deliberado:** escribe `javacc --version`. **Diagnóstico:** la terminal no encuentra el comando porque el nombre está mal; si solo falta `javac`, instala un JDK o corrige `PATH`.

**3. Entiende**

`java` ejecuta; `javac` compila. El JDK incluye herramientas de desarrollo y el entorno que necesita el programa para ejecutarse.

**4. Cierra**

Guarda las dos salidas e identifica cuál comando usarás para cada tarea.

#### Subtema 3.2: Inspecciona la VM que ejecuta tu clase · 10 min

**1. Contexto**

El nombre de la máquina virtual y la versión activa ayudan a resolver diferencias entre equipos.

**2. Hazlo tú**

Crea `java-motor/src/Entorno.java`:

```java
public class Entorno {
    public static void main(String[] args) {
        System.out.println(System.getProperty("java.vm.name"));
        System.out.println(System.getProperty("java.version"));
    }
}
```

Desde `java-motor` ejecuta:

```bash
javac -d out src/Entorno.java
java -cp out Entorno
```

**Resultado esperado:** se imprimen el nombre de la VM y la versión de Java del proceso.

**Fallo deliberado:** lanza `java -cp src Entorno`. **Diagnóstico:** la clase está en `out` porque la compilaste allí; corrige el classpath.

**3. Entiende**

La JVM carga y ejecuta bytecode. La propiedad consultada describe la VM activa; no es el compilador.

**4. Cierra**

Conserva archivo, comandos y las dos líneas de salida.

#### Subtema 3.3: Separa desarrollo de ejecución · 10 min

**1. Contexto**

La computadora que compila y el servidor que ejecuta el resultado no necesariamente necesitan las mismas herramientas.

**2. Hazlo tú**

Desde `java-motor` usa el archivo anterior:

```bash
javac -d out src/Entorno.java
java -cp out Entorno
```

Anota: en desarrollo y CI necesitas `javac`; el proceso de ejecución necesita una JVM y las clases de Java compatibles con la versión objetivo.

**Resultado esperado:** `Entorno.class` aparece en `out` y se ejecuta con `java`.

**Fallo deliberado:** intenta compilar en una máquina que solo ofrece el comando `java`. **Diagnóstico:** ese runtime ejecuta, pero no compila; lleva la compilación a CI o instala un JDK.

**3. Entiende**

“JRE” se usa para hablar del runtime necesario para ejecutar Java, pero las distribuciones actuales no siempre ofrecen un paquete separado con ese nombre. Revisa qué incluye el proveedor elegido.

**4. Cierra**

Escribe dónde compilas, qué artefacto despliegas y qué versión lo ejecutará. Consulta [la documentación del JDK](https://docs.oracle.com/en/java/javase/25/) para el proveedor de tu entorno.

### Tema 4: Tipos primitivos vs referencias

**¿Por qué es importante?** Distinguir valores y referencias ayuda a evitar nulos y comparaciones equivocadas en datos de RutaFlow. **Modelo mental:** un primitivo es el valor escrito en una tarjeta; una referencia es una dirección que apunta al objeto.

**Proyecto integrador:** representa una guía con campos y comprueba su igualdad. **Límite:** == no compara el contenido de objetos. **Práctica:** compara dos guías iguales con equals y con ==.

#### Subtema 4.1: Guarda una cantidad primitiva · 10 min

**1. Contexto**

Una cantidad pequeña como el número de entregas se representa con un valor entero.

**2. Hazlo tú**

Crea `java-motor/src/Tipos.java`:

```java
public class Tipos {
    public static void main(String[] args) {
        int entregas = 3;
        double distanciaKm = 12.5;
        System.out.println(entregas + " entregas, " + distanciaKm + " km");
    }
}
```

Desde `java-motor` compila y ejecuta:

```bash
javac -d out src/Tipos.java
java -cp out Tipos
```

**Resultado esperado:** `3 entregas, 12.5 km`.

**Fallo deliberado:** asigna el texto `"tres"` a `int entregas`. **Diagnóstico:** `int` guarda números enteros; el texto pertenece a `String`.

**3. Entiende**

Un primitivo guarda directamente un valor simple. No puede ser `null`.

**4. Cierra**

Anota cuál dato usa `int` y cuál usa `double`.

#### Subtema 4.2: Usa una referencia para describir un envío · 10 min

**1. Contexto**

Un envío agrupa varios datos y puede no existir todavía. Para representarlo usamos una clase y una referencia.

**2. Hazlo tú**

Reemplaza el contenido de `java-motor/src/Tipos.java` por este archivo completo:

```java
public class Tipos {
    record Envio(String guia, String destino) {}

    public static void main(String[] args) {
        Envio envio = new Envio("RT-8", "Cali");
        System.out.println(envio.guia() + " -> " + envio.destino());
    }
}
```

Desde `java-motor`, compila y ejecuta `javac -d out src/Tipos.java` y `java -cp out Tipos`.

**Resultado esperado:** `RT-8 -> Cali`.

**Fallo deliberado:** antes de crear el record, asigna `null` a `envio` y llama `envio.guia()`. **Diagnóstico:** `NullPointerException` aparece porque la referencia no apunta a un objeto; crea el objeto o comprueba que exista antes de usarlo.

**3. Entiende**

Una referencia apunta a un objeto; puede valer `null`. El objeto y la variable que lo referencia son conceptos distintos.

**4. Cierra**

Dibuja una variable primitiva con su valor y una referencia que apunta a `Envio`.

#### Subtema 4.3: Compara valores, no direcciones por accidente · 10 min

**1. Contexto**

Dos textos pueden contener la misma guía aunque sean objetos distintos.

**2. Hazlo tú**

Reemplaza `java-motor/src/Tipos.java` por este archivo completo:

```java
public class Tipos {
    public static void main(String[] args) {
        String a = new String("RT-8");
        String b = new String("RT-8");
        System.out.println(a.equals(b));
        System.out.println(a == b);
    }
}
```

Desde `java-motor`, compila y ejecuta `javac -d out src/Tipos.java` y `java -cp out Tipos`.

**Resultado esperado:** imprime `true` y luego `false`.

**Fallo deliberado:** cambia `a.equals(b)` por `a == b` como comparación de contenido. **Diagnóstico:** `==` compara si las referencias apuntan al mismo objeto; para igualdad de texto usa `equals`.

**3. Entiende**

Para primitivos `==` compara valores. Para objetos compara identidad de referencia; cada clase puede definir igualdad de contenido mediante `equals`.

**4. Cierra**

Explica por qué las dos comparaciones imprimen resultados distintos. Revisa [tipos primitivos de Java](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html).

### Tema 5: Variables, conversiones y `String`

**¿Por qué es importante?** La conversión incorrecta pierde peso o rechaza entradas válidas antes de cotizar un envío. **Modelo mental:** convertir double a int es recortar decimales, no redondear automáticamente.

**Proyecto integrador:** lee el peso entregado por el operador y conserva su precisión. **Límite:** parsear texto puede fallar si el formato no es numérico. **Práctica:** ejecuta el caso numérico y el caso inválido.

```bash
javac -d out src/LeerPeso.java
java -cp out LeerPeso 2.75
```

#### Subtema 5.1: Declara y actualiza una variable · 10 min

**1. Contexto**

El total de paquetes cambia durante una jornada, así que su variable puede actualizarse.

**2. Hazlo tú**

Crea `java-motor/src/Variables.java`:

```java
public class Variables {
    public static void main(String[] args) {
        int paquetes = 2;
        paquetes = paquetes + 1;
        final String zona = "Norte";
        System.out.println(zona + ": " + paquetes);
    }
}
```

Desde `java-motor` ejecuta `javac -d out src/Variables.java` y `java -cp out Variables`.

**Resultado esperado:** `Norte: 3`.

**Fallo deliberado:** asigna otro valor a `zona`. **Diagnóstico:** `final` permite asignar la variable una sola vez; elimina la segunda asignación.

**3. Entiende**

Una variable guarda un valor o una referencia. `final` impide reasignar esa variable; no vuelve inmutable cualquier objeto al que apunte.

**4. Cierra**

Identifica en tu archivo la variable modificable y la que no puede reasignarse.

#### Subtema 5.2: Convierte un dato sin perderlo · 10 min

**1. Contexto**

Un peso puede tener decimales. Guardarlo en un entero quitaría información.

**2. Hazlo tú**

En `java-motor/src/Conversion.java`, crea una variable `double pesoKg = 2.75` y conviértela a `int` con `(int) pesoKg`. Imprime ambos valores.

```java
public class Conversion {
    public static void main(String[] args) {
        double pesoKg = 2.75;
        int pesoEntero = (int) pesoKg;
        System.out.println(pesoKg);
        System.out.println(pesoEntero);
    }
}
```

Ejecuta `javac -d out src/Conversion.java` y `java -cp out Conversion`.

**Resultado esperado:** imprime `2.75` y `2`.

**Fallo deliberado:** usa el entero para facturar el peso. **Diagnóstico:** el cast descartó la parte decimal; conserva `double` o elige una regla explícita de redondeo.

**3. Entiende**

Una conversión explícita a un tipo más pequeño puede perder datos. Java no puede restaurarlos después.

**4. Cierra**

Anota el dato perdido y qué regla de negocio decidiría cómo redondear.

#### Subtema 5.3: Lee texto y conviértelo con control · 10 min

**1. Contexto**

Los argumentos de terminal llegan como texto, aunque representen números.

**2. Hazlo tú**

Crea `java-motor/src/LeerPeso.java`:

```java
public class LeerPeso {
    public static void main(String[] args) {
        try {
            double peso = Double.parseDouble(args[0]);
            System.out.println("Peso: " + peso + " kg");
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException error) {
            System.out.println("Uso: java LeerPeso <número>");
        }
    }
}
```

Desde `java-motor` compila y ejecuta `javac -d out src/LeerPeso.java`, `java -cp out LeerPeso 2.75` y `java -cp out LeerPeso pesado`.

**Resultado esperado:** la entrada numérica se convierte; el texto inválido muestra el mensaje de uso.

**Fallo deliberado:** elimina el `try/catch` y ejecuta con `pesado`. **Diagnóstico:** `parseDouble` no puede convertir esa palabra y lanza `NumberFormatException`; valida la entrada en el borde del programa.

**3. Entiende**

`String` representa texto. `parseDouble` convierte texto válido a número y lanza una excepción cuando el formato no es numérico.

**4. Cierra**

Guarda las dos salidas y explica qué dato llegó originalmente como texto. Consulta [conversión de datos](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/converting.html).

### Tema 6: Operadores, precedencia y control de flujo

**¿Por qué es importante?** Una condición mal agrupada puede aceptar un paquete inválido o detener todo el cálculo. **Modelo mental:** el cortocircuito revisa cada puerta y deja de avanzar cuando una ya está cerrada.

**Proyecto integrador:** valida peso y estado antes de asignar un conductor. **Límite:** un ciclo con <= puede acceder fuera del arreglo. **Práctica:** cambia el límite y diagnostica el índice que falla.

```bash
javac -d out src/Condicion.java
java -cp out Condicion
```

#### Subtema 6.1: Protege una comprobación con cortocircuito · 10 min

**1. Contexto**

Antes de leer el peso de un envío, comprueba que el envío exista.

**2. Hazlo tú**

Crea `java-motor/src/Condicion.java`:

```java
public class Condicion {
    record Paquete(double pesoKg) {}

    static boolean pesoValido(Paquete paquete) {
        return paquete != null && paquete.pesoKg() > 0 && paquete.pesoKg() <= 50;
    }

    public static void main(String[] args) {
        System.out.println(pesoValido(null));
        System.out.println(pesoValido(new Paquete(12.5)));
    }
}
```

Desde `java-motor` compila y ejecuta `javac -d out src/Condicion.java` y `java -cp out Condicion`.

**Resultado esperado:** `false` y `true`.

**Fallo deliberado:** cambia `&&` por `&` entre la comprobación de `null` y el acceso al peso. **Diagnóstico:** `&` evalúa ambos lados y aparece `NullPointerException`; restaura `&&` para que la segunda parte solo se evalúe si el paquete existe.

**3. Entiende**

`&&` hace cortocircuito: si el lado izquierdo ya es falso, no evalúa el derecho. `&` sobre booleanos no tiene esa protección.

**4. Cierra**

Señala qué parte impide desreferenciar `null`.

#### Subtema 6.2: Elige una acción con switch · 10 min

**1. Contexto**

El motor muestra un mensaje según el estado de la entrega.

**2. Hazlo tú**

Crea `java-motor/src/MensajeEstado.java`:

```java
enum Estado { CREADO, EN_RUTA, ENTREGADO }

public class MensajeEstado {
    static String mensaje(Estado estado) {
        return switch (estado) {
            case CREADO -> "Guía registrada";
            case EN_RUTA -> "Conductor en recorrido";
            case ENTREGADO -> "Entrega confirmada";
        };
    }

    public static void main(String[] args) {
        System.out.println(mensaje(Estado.EN_RUTA));
    }
}
```

Compila y ejecuta `javac -d out src/MensajeEstado.java` y `java -cp out MensajeEstado`.

**Resultado esperado:** `Conductor en recorrido`.

**Fallo deliberado:** agrega `CANCELADO` al enum y no agregues su caso al switch. **Diagnóstico:** el compilador indica que la expresión dejó de cubrir todos los estados; define el mensaje para el nuevo estado.

**3. Entiende**

Un `switch` expresión produce un valor. Con un enum cerrado, el compilador puede avisar si falta una alternativa.

**4. Cierra**

Agrega el estado `CANCELADO` y conserva el mensaje correspondiente.

#### Subtema 6.3: Recorre una lista sin salir de sus límites · 10 min

**1. Contexto**

Las posiciones de un arreglo empiezan en cero. La última posición es su longitud menos uno.

**2. Hazlo tú**

Crea `java-motor/src/Recorrido.java`:

```java
public class Recorrido {
    public static void main(String[] args) {
        String[] guias = {"RT-1", "RT-2", "RT-3"};
        for (int i = 0; i < guias.length; i++) {
            System.out.println(i + ": " + guias[i]);
        }
    }
}
```

Compila y ejecuta `javac -d out src/Recorrido.java` y `java -cp out Recorrido`.

**Resultado esperado:** imprime los índices 0, 1 y 2 sin error.

**Fallo deliberado:** cambia `i < guias.length` por `i <= guias.length`. **Diagnóstico:** la iteración intenta leer el índice 3, que no existe; devuelve el límite a `<`.

**3. Entiende**

La longitud cuenta elementos; no es un índice válido. Comprueba el límite antes de cada acceso.

**4. Cierra**

Anota cuántas guías hay y cuál es su último índice. Fuente oficial: [control de flujo](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html).

### Tema 7: Arreglos, wrappers y paso de argumentos

**¿Por qué es importante?** Arreglos y wrappers aparecen al leer datos externos, pero un índice incorrecto o un wrapper nulo detiene la operación. **Modelo mental:** un arreglo es una fila con longitud fija y casillas numeradas desde cero.

**Proyecto integrador:** conserva varias guías y convierte sus cantidades. **Límite:** usa una colección si el tamaño debe cambiar. **Práctica:** prueba un índice fuera de rango y una conversión inválida.

#### Subtema 7.1: Guarda y recorre varias guías · 10 min

**1. Contexto**

Un arreglo reúne varios valores del mismo tipo bajo una sola variable.

**2. Hazlo tú**

Crea `java-motor/src/Guias.java`:

```java
public class Guias {
    public static void main(String[] args) {
        String[] guias = {"RT-1", "RT-2"};
        for (String guia : guias) System.out.println(guia);
        System.out.println("Total: " + guias.length);
    }
}
```

Compila y ejecuta `javac -d out src/Guias.java` y `java -cp out Guias`.

**Resultado esperado:** aparecen las dos guías y `Total: 2`.

**Fallo deliberado:** intenta leer `guias[2]`. **Diagnóstico:** los índices válidos son 0 y 1; para agregar o quitar elementos en ejecución usa una colección, no un arreglo de tamaño fijo.

**3. Entiende**

Un arreglo tiene una longitud fija después de crearse. Su índice inicial es cero.

**4. Cierra**

Entrega la salida y señala el primer y el último índice válido.

#### Subtema 7.2: Convierte entre primitivos y wrappers con cuidado · 10 min

**1. Contexto**

Un formulario entrega números como texto y puede dejar un campo vacío. Convertirlo requiere validar ambos casos.

**2. Hazlo tú**

Crea `java-motor/src/Wrapper.java`:

```java
public class Wrapper {
    public static void main(String[] args) {
        Integer cajas = Integer.valueOf(args[0]);
        int total = cajas + 1;
        System.out.println(total);
    }
}
```

Compila y ejecuta `javac -d out src/Wrapper.java` y `java -cp out Wrapper 4`.

**Resultado esperado:** `5`.

**Fallo deliberado:** ejecuta `java -cp out Wrapper cuatro` y luego sin argumento. **Diagnóstico:** el primer caso no se puede convertir a entero; el segundo no tiene `args[0]`. Valida entrada antes de convertir o desenvolver el wrapper.

**3. Entiende**

`Integer` es un objeto que puede ser `null`; `int` es un primitivo. Al sumar, Java desenvuelve el wrapper automáticamente; desenvolver `null` causa `NullPointerException`.

**4. Cierra**

Explica el autoboxing y por qué un wrapper nulo no se debe sumar. Fuente oficial: [clases wrapper](https://docs.oracle.com/javase/tutorial/java/data/numberclasses.html).

#### Subtema 7.3: Observa qué cambia al pasar una referencia · 10 min

**1. Contexto**

Java pasa argumentos por valor. Para un objeto, el valor copiado es una referencia; el método puede cambiar el objeto, pero reasignar su copia no cambia la variable del llamador.

**2. Hazlo tú**

Crea `java-motor/src/PasoValor.java`:

```java
public class PasoValor {
    static void cambiar(StringBuilder texto) {
        texto.append(" listo");
        texto = new StringBuilder("otro");
    }

    public static void main(String[] args) {
        StringBuilder estado = new StringBuilder("pedido");
        cambiar(estado);
        System.out.println(estado);
    }
}
```

Compila y ejecuta `javac -d out src/PasoValor.java` y `java -cp out PasoValor`.

**Resultado esperado:** `pedido listo`.

**Fallo deliberado:** espera que imprima `otro`. **Diagnóstico:** el método reasignó su copia local de la referencia; la mutación del objeto compartido sí permanece. Para evitar efectos laterales, prefiere valores inmutables cuando encajen.

**3. Entiende**

Java siempre pasa una copia del argumento. En el caso de un objeto esa copia apunta al mismo objeto, hasta que el parámetro se reasigna.

**4. Cierra**

Dibuja las dos referencias antes y después de llamar a `cambiar`.

### Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`)

**¿Por qué es importante?** Fechas y horas incorrectas cambian promesas de entrega y registros de auditoría. **Modelo mental:** LocalDate es una fecha del calendario; Instant es un momento único del reloj mundial.

**Proyecto integrador:** guarda el día prometido y la hora real de entrega con tipos distintos. **Límite:** una fecha local no incluye zona horaria. **Práctica:** parsea una fecha ISO y muestra el mismo instante en Bogotá.

```bash
javac -d out src/FechaEntrega.java
java -cp out FechaEntrega 2026-11-03
```

#### Subtema 8.1: Lee una entrada y valida el número · 10 min

**1. Contexto**

El operador introduce la cantidad de paquetes por terminal. La entrada puede faltar o no ser un número.

**2. Hazlo tú**

Crea `java-motor/src/Entrada.java`:

```java
import java.util.Scanner;

public class Entrada {
    public static void main(String[] args) {
        try (Scanner entrada = new Scanner(System.in)) {
            System.out.print("Paquetes: ");
            if (!entrada.hasNextInt()) {
                System.out.println("Escribe un número entero");
                return;
            }
            System.out.println("Recibidos: " + entrada.nextInt());
        }
    }
}
```

Compila y ejecuta `javac -d out src/Entrada.java` y `java -cp out Entrada`. Escribe `3` y luego repite escribiendo `tres`.

**Resultado esperado:** el primer caso muestra `Recibidos: 3`; el segundo informa que se esperaba un número.

**Fallo deliberado:** elimina `hasNextInt()` y escribe `tres`. **Diagnóstico:** `nextInt()` lanza `InputMismatchException` porque la entrada no tiene el formato solicitado.

**3. Entiende**

Leer una línea no garantiza que el texto sea un número. Comprueba el dato antes de convertirlo.

**4. Cierra**

Guarda ambas salidas. Fuente oficial: [Scanner](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Scanner.html).

#### Subtema 8.2: Parsea una fecha de entrega · 10 min

**1. Contexto**

Una fecha de calendario como “2026-11-03” no representa por sí sola una hora ni una zona horaria.

**2. Hazlo tú**

Crea `java-motor/src/FechaEntrega.java`:

```java
import java.time.LocalDate;

public class FechaEntrega {
    public static void main(String[] args) {
        LocalDate entrega = LocalDate.parse(args[0]);
        System.out.println(entrega.plusDays(1));
    }
}
```

Compila y ejecuta `javac -d out src/FechaEntrega.java` y `java -cp out FechaEntrega 2026-11-03`.

**Resultado esperado:** `2026-11-04`.

**Fallo deliberado:** ejecuta con `03/11/2026`. **Diagnóstico:** `LocalDate.parse` usa ISO `yyyy-MM-dd` por defecto; usa un `DateTimeFormatter` explícito si ese es el formato externo.

**3. Entiende**

`LocalDate` representa una fecha civil sin hora ni zona. No la conviertas a una fecha/hora si el dominio solo necesita el día.

**4. Cierra**

Guarda la fecha original, la calculada y el formato de entrada.

#### Subtema 8.3: Distingue un instante de una hora local · 10 min

**1. Contexto**

La hora “09:00” en Bogotá no es necesariamente el mismo instante que “09:00” en Madrid.

**2. Hazlo tú**

Crea `java-motor/src/Instantes.java`:

```java
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class Instantes {
    public static void main(String[] args) {
        Instant ahora = Instant.now();
        ZonedDateTime bogota = ahora.atZone(ZoneId.of("America/Bogota"));
        System.out.println(ahora);
        System.out.println(bogota);
    }
}
```

Compila y ejecuta `javac -d out src/Instantes.java` y `java -cp out Instantes`.

**Resultado esperado:** imprime un instante UTC y la representación del mismo momento en Bogotá.

**Fallo deliberado:** reemplaza la zona por `America/Desconocida`. **Diagnóstico:** `ZoneId` no reconoce ese identificador; usa un nombre de zona disponible, no una diferencia horaria inventada.

**3. Entiende**

`Instant` identifica un momento global; `ZonedDateTime` muestra ese instante con reglas de una zona. `Date` y `Calendar` son APIs antiguas; para código nuevo usa tipos de `java.time`.

**4. Cierra**

Explica cuál valor guardarías para registrar el momento de una entrega y cuál para guardar el día prometido. Fuente oficial: [java.time](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html).

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
