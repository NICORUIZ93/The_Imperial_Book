# Módulo 3: Excepciones y manejo de recursos


## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions

**Duración estimada:** 30 min. **Prerrequisitos:** M0 T1 (compilar y ejecutar), M2 T1 (listas y tamaño).

Una excepción indica que una operación no pudo completarse. Practicarás cuándo declararla, cuándo manejarla y qué error no debes esconder.

Trabaja desde `java-motor-poo/`, la carpeta del motor iniciada en M1 y ampliada en M2. Conserva sus archivos; crea los nuevos ejemplos en `src/` y ejecuta los comandos desde la raíz de esa carpeta.

**Mapa de subtemas críticos:** fallo de entrada externa y manejo de `IOException` (núcleo, 1.1); propagación checked a través de firmas (núcleo, 1.2); precondición inválida y excepción unchecked atendida en el límite adecuado (variante y diagnóstico, 1.3).

**¿Por qué es importante?** Clasificar el fallo permite responder a una entrada externa sin convertir cada bug en una excepción silenciosa. **Modelo mental:** una checked exception obliga a tomar una decisión visible; una unchecked no obliga al compilador, pero sigue necesitando diagnóstico.

**Proyecto integrador:** propaga errores de lectura hasta la capa que informa al operador. **Límite:** no captures una excepción si no puedes recuperarte ni añadir contexto. **Práctica:** quita temporalmente throws y observa el error de compilación.

#### Subtema 1.1: Maneja un archivo que no existe · 10 min

**1. Contexto**

La ruta del archivo viene del usuario; puede estar mal escrita o no existir.

**2. Hazlo tú**

Crea `src/LeerConfig.java`:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class LeerConfig {
    static String leer(Path ruta) throws IOException {
        return Files.readString(ruta);
    }

    public static void main(String[] args) {
        try {
            System.out.println(leer(Path.of("config.properties")));
        } catch (IOException error) {
            System.err.println("No pude leer la configuración: " + error.getMessage());
            System.exit(1);
        }
    }
}
```

Desde la carpeta del proyecto ejecuta:

```bash
mkdir -p out
javac -d out src/LeerConfig.java
java -cp out LeerConfig
```

**Resultado esperado:** si no existe `config.properties`, el programa muestra el mensaje de error, termina con código `1` y no imprime un stack trace completo. Consulta el código con `echo $?` inmediatamente después de ejecutar Java. Si el archivo ya existe por una práctica anterior, cámbiale temporalmente el nombre para reproducir el caso y restáuralo al terminar.

**Fallo deliberado:** elimina `throws IOException` de la firma. **Diagnóstico:** el compilador exige capturar o declarar la excepción checked; restablece `throws` o añade un `try/catch`.

**3. Entiende**

`IOException` está checked: el compilador obliga a decidir qué hacer o a propagarla. El archivo es una entrada externa, así que informar el problema es útil. `System.exit(1)` evita que un script interprete el fallo de lectura como ejecución exitosa.

**4. Cierra**

Guarda el archivo y explica qué decisión tomó el programa cuando faltó el archivo.

#### Subtema 1.2: Propaga una checked exception hasta quien puede resolverla · 10 min

**1. Contexto**

Una función auxiliar no siempre sabe qué hacer si falla la lectura. Puede dejar que la capa que presenta el resultado decida cómo informar.

**2. Hazlo tú**

En `src/LeerYPropagar.java`, compara estos métodos:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class LeerYPropagar {
    static List<String> leer(Path ruta) throws IOException {
        return Files.readAllLines(ruta);
    }

    static int contarLineas(Path ruta) throws IOException {
        return leer(ruta).size();
    }

    public static void main(String[] args) {
        try {
            System.out.println(contarLineas(Path.of("config.properties")));
        } catch (IOException error) {
            System.err.println("No se pudo contar: " + error.getMessage());
            System.exit(1);
        }
    }
}
```

Guarda `config.properties` en `java-motor-poo/` con estas dos líneas exactas:

```text
modo=demo
capacidad=2
```

Compila y ejecuta desde `java-motor-poo/`:

```bash
javac -d out src/LeerYPropagar.java
java -cp out LeerYPropagar
```

**Resultado esperado:** muestra `2` y termina con código `0`; si quitas el archivo, `main` presenta el error y termina con código `1`.

**Fallo deliberado:** borra `throws IOException` de `contarLineas`. **Diagnóstico:** la excepción sigue siendo checked aunque haya atravesado otro método; cada método que la propaga debe declararlo.

**3. Entiende**

Propagar no significa ignorar: la firma deja visible que la operación puede fallar y entrega la decisión a quien tiene contexto para responder. `Files.readAllLines` devuelve una lista, así que `size()` cuenta las dos líneas sin introducir Streams antes de M4. Este método carga todo el archivo en memoria y sirve aquí porque la configuración es diminuta; para un archivo grande usa lectura incremental y cierre explícito en el siguiente tema.

**4. Cierra**

Dibuja el camino `leer → contarLineas → main` y marca dónde se atiende el error.

#### Subtema 1.3: Rechaza un argumento inválido antes de acceder a la lista · 10 min

**1. Contexto**

Una posición inexistente en una lista suele indicar que el programa no comprobó sus límites; capturarla como si fuera un fallo normal puede ocultar el bug.

**2. Hazlo tú**

Crea `src/IndiceSeguro.java`:

```java
import java.util.List;

public class IndiceSeguro {
    static String obtener(List<String> guias, int indice) {
        if (indice < 0 || indice >= guias.size()) {
            throw new IllegalArgumentException("Índice fuera de rango: " + indice);
        }
        return guias.get(indice);
    }

    public static void main(String[] args) {
        System.out.println(obtener(List.of("RT-1", "RT-2"), 1));
    }
}
```

Ejecuta desde la carpeta del proyecto:

```bash
javac -d out src/IndiceSeguro.java
java -cp out IndiceSeguro
```

**Resultado esperado:** imprime `RT-2`. El método informa claramente una entrada inválida en vez de fallar más adelante con un acceso accidental fuera de rango.

**Fallo deliberado:** llama `obtener(List.of("RT-1"), 2)`. **Diagnóstico:** `IllegalArgumentException` es unchecked; no exige `throws`, pero el método la lanza con una razón útil para quien lo llamó.

**3. Entiende**

Checked no significa “buena” y unchecked no significa “ignorable”. Aquí `IllegalArgumentException` denuncia que un llamador pasó un índice fuera del contrato del método. Si ese índice llega de una persona o de una API, la frontera que recibe la petición debe validarlo y comunicar un rechazo claro; no debe mostrar el stack trace como respuesta normal. La elección de checked o unchecked no sustituye la decisión de manejo en esa frontera.

**4. Cierra**

Clasifica `IOException` y `IllegalArgumentException` y explica qué capa puede responder a cada una.

**Fuentes oficiales:** [Java exceptions](https://dev.java/learn/exceptions/), [clases de excepción](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Exception.html).

### Tema 2: try-with-resources

**Duración estimada:** 40 min. **Prerrequisitos:** M3 T1 (checked y propagación).

El bloque `try-with-resources` cierra archivos y otros recursos incluso cuando el cuerpo termina con error.

**Mapa de subtemas críticos:** apertura y cierre de `AutoCloseable` (núcleo, 2.1); cierre previo al `catch` tras un fallo del cuerpo (diagnóstico, 2.2); orden inverso de varios cierres (núcleo, 2.3); conservación del error principal y errores suprimidos del cierre (límite y diagnóstico, 2.4).

**¿Por qué es importante?** Archivos y conexiones que quedan abiertos pueden agotar recursos del proceso. **Modelo mental:** try-with-resources devuelve automáticamente lo que tomó prestado.

**Proyecto integrador:** cierra cada archivo temporal tras procesar una guía. **Límite:** el recurso debe implementar AutoCloseable. **Práctica:** fuerza una excepción dentro del bloque y confirma que close se ejecuta.

#### Subtema 2.1: Lee un archivo y deja que Java lo cierre · 10 min

**1. Contexto**

Un archivo abierto ocupa un recurso del sistema. Debe cerrarse al terminar de leerlo.

**2. Hazlo tú**

Crea `src/LeerLineas.java`:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class LeerLineas {
    public static void main(String[] args) throws IOException {
        try (BufferedReader lector = Files.newBufferedReader(Path.of("guias.txt"))) {
            String guia;
            while ((guia = lector.readLine()) != null) {
                System.out.println(guia);
            }
        }
    }
}
```

Guarda `guias.txt` en `java-motor-poo/` con el contenido exacto siguiente:

```text
RF-101
RF-102
```

Ejecuta desde `java-motor-poo/`:

```bash
javac -d out src/LeerLineas.java
java -cp out LeerLineas
```

**Resultado esperado:** imprime `RF-101` y `RF-102` en líneas separadas; el lector se cierra al salir del bloque.

**Fallo deliberado:** cambia el nombre a `guias-ausentes.txt`. **Diagnóstico:** aparece `NoSuchFileException` (subtipo de `IOException`) antes de entrar al cuerpo del `try`; este lector nunca llegó a abrirse. Si hubiera otros recursos ya creados en la misma cabecera, Java sí los cerraría.

**3. Entiende**

Los paréntesis del `try` declaran un recurso `AutoCloseable`. Java invoca `close()` automáticamente al abandonar el bloque. `readLine()` devuelve `null` al terminar el archivo; el `while` procesa línea por línea sin cargar todo el archivo ni adelantar la API de Streams.

**4. Cierra**

Señala la línea que abre el archivo y confirma que no escribiste una llamada manual a `close()`.

#### Subtema 2.2: Comprueba el cierre aunque ocurra un error · 10 min

**1. Contexto**

El cierre también debe ocurrir si el código que usa el recurso lanza una excepción.

**2. Hazlo tú**

Crea `src/RecursoDemo.java`:

```java
public class RecursoDemo {
    static class Aviso implements AutoCloseable {
        public void close() {
            System.out.println("recurso cerrado");
        }
    }

    public static void main(String[] args) {
        try (Aviso aviso = new Aviso()) {
            System.out.println("trabajo");
            throw new IllegalStateException("fallo de prueba");
        } catch (IllegalStateException error) {
            System.out.println("error atendido");
        }
    }
}
```

Compila y ejecuta:

```bash
javac -d out src/RecursoDemo.java
java -cp out RecursoDemo
```

**Resultado esperado:** aparecen, en orden, `trabajo`, `recurso cerrado` y `error atendido`.

**Fallo deliberado:** sustituye `try (Aviso aviso = new Aviso()) {` por dos líneas: `Aviso aviso = new Aviso();` y `try {`. Mantén el resto del archivo igual. **Resultado observado:** imprime `trabajo` y `error atendido`, pero no `recurso cerrado`. **Diagnóstico:** crear un objeto antes de un `try` ordinario no lo registra para cierre automático; restaura la declaración dentro de los paréntesis del `try`.

**3. Entiende**

Java cierra el recurso antes de entrar al `catch` asociado. El cierre no depende de que la salida del bloque sea normal.

**4. Cierra**

Entrega la salida con las tres líneas en el orden correcto.

#### Subtema 2.3: Cierra varios recursos en orden inverso · 10 min

**1. Contexto**

Un proceso puede abrir un lector y luego otro recurso que depende de él. Debe cerrar primero lo último que abrió.

**2. Hazlo tú**

En `src/OrdenDeCierre.java`, crea dos recursos que impriman su nombre desde `close()` y decláralos así:

```java
public class OrdenDeCierre {
    static class Recurso implements AutoCloseable {
        private final String nombre;
        Recurso(String nombre) { this.nombre = nombre; }
        public void close() { System.out.println("cierro " + nombre); }
    }

    public static void main(String[] args) {
        try (Recurso archivo = new Recurso("archivo");
             Recurso lector = new Recurso("lector")) {
            System.out.println("leo");
        }
    }
}
```

Compila y ejecuta `javac -d out src/OrdenDeCierre.java` y después `java -cp out OrdenDeCierre`.

**Resultado esperado:** imprime `leo`, `cierro lector` y `cierro archivo`.

**Fallo deliberado:** intercambia el orden esperado de las dos últimas líneas en tu nota. **Diagnóstico:** Java cierra en el orden inverso al de declaración; corrige tu predicción.

**3. Entiende**

El orden inverso permite liberar primero el recurso que se abrió después y que puede depender del anterior.

**4. Cierra**

Escribe el orden de apertura y cierre sin mirar el código.

#### Subtema 2.4: Conserva el fallo principal y examina los errores de cierre · 10 min

**1. Contexto**

El trabajo puede fallar y, al mismo tiempo, el cierre puede informar otro problema. El diagnóstico necesita ambos sin perder la causa inicial.

**2. Hazlo tú**

Crea `java-motor-poo/src/FallosAlCerrar.java`:

```java
import java.io.IOException;

public class FallosAlCerrar {
    static class Recurso implements AutoCloseable {
        @Override
        public void close() throws IOException {
            throw new IOException("cierre");
        }
    }

    public static void main(String[] args) {
        try (Recurso recurso = new Recurso()) {
            throw new IllegalStateException("trabajo");
        } catch (Exception error) {
            System.out.println("principal=" + error.getMessage());
            for (Throwable suprimida : error.getSuppressed()) {
                System.out.println("suprimida=" + suprimida.getMessage());
            }
            System.exit(1);
        }
    }
}
```

Desde `java-motor-poo/`, ejecuta `javac -d out src/FallosAlCerrar.java` y `java -cp out FallosAlCerrar`.

**Resultado esperado:** `principal=trabajo` y `suprimida=cierre`, en ese orden, con código de salida `1`. **Fallo deliberado:** elimina el ciclo de `getSuppressed()`; el programa solo imprime `principal=trabajo` y pierde el dato de que el cierre también falló. Restáuralo para conservar ambos diagnósticos.

**3. Entiende**

`try-with-resources` mantiene la excepción del cuerpo como principal y adjunta la del cierre como suprimida. Si el cuerpo termina normalmente pero `close()` falla, la excepción del cierre pasa a ser la principal. `getSuppressed()` permite consultar los fallos secundarios; no confundas «suprimida» con «resuelta». En una aplicación real, registra ambos fallos en la frontera adecuada y evita enviar trazas internas al usuario.

**4. Cierra**

Quita temporalmente el `throw` del cuerpo y deja `System.out.println("trabajo completado")`: ahora se observa `principal=cierre` y no hay líneas `suprimida=...`. Predice la salida antes de ejecutarla y vuelve al ejemplo original.

**Fuente oficial:** [Java try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html).

### Tema 3: Excepciones personalizadas y no tragar excepciones

**Duración estimada:** 40 min. **Prerrequisitos:** M1 T1 (clases y constructores), M3 T1 (checked y unchecked).

Usa una excepción propia para una regla de capacidad del motor y conserva información suficiente para diagnosticar un rechazo.

**¿Por qué es importante?** Una asignación que excede la capacidad debe rechazarse de forma reconocible, sin anunciar éxito ni esconder la causa. **Proyecto integrador:** proteger la capacidad antes de asignar guías. **Límite:** no envíes trazas internas ni datos sensibles al usuario; traduce el rechazo en la frontera de entrada.

**Mapa de subtemas críticos:** invariante y excepción de dominio con datos comprobables (núcleo, 3.1); manejo específico en la frontera que puede responder (aplicación, 3.2); pérdida de evidencia y falso éxito con un `catch` vacío (diagnóstico, 3.3); conservación de la causa original al traducir una excepción técnica (límite y diagnóstico, 3.4).

#### Subtema 3.1: Rechaza una asignación sin capacidad · 10 min

**1. Contexto**

Si una ruta admite dos guías y se intentan asignar tres, el motor debe impedir la operación antes de cambiar su contador.

**2. Hazlo tú**

Crea `java-motor-poo/src/Asignador.java` con el archivo completo:

```java
public class Asignador {
    private final int capacidad;
    private int ocupadas;

    Asignador(int capacidad) {
        if (capacidad < 0) throw new IllegalArgumentException("Capacidad negativa");
        this.capacidad = capacidad;
    }

    void asignar(int cantidad) {
        if (cantidad <= 0) throw new IllegalArgumentException("Cantidad no positiva");
        int disponibles = capacidad - ocupadas;
        if (cantidad > disponibles) {
            throw new CapacidadInsuficienteException(cantidad, disponibles);
        }
        ocupadas += cantidad;
    }

    static class CapacidadInsuficienteException extends RuntimeException {
        private final int solicitadas;
        private final int disponibles;

        CapacidadInsuficienteException(int solicitadas, int disponibles) {
            super("Solicitadas " + solicitadas + ", disponibles " + disponibles);
            this.solicitadas = solicitadas;
            this.disponibles = disponibles;
        }

        int solicitadas() { return solicitadas; }
        int disponibles() { return disponibles; }
    }

    public static void main(String[] args) {
        new Asignador(2).asignar(3);
    }
}
```

Desde `java-motor-poo/`, ejecuta:

```bash
javac -d out src/Asignador.java
java -cp out Asignador
```

**Resultado esperado:** el proceso termina con `CapacidadInsuficienteException: Solicitadas 3, disponibles 2`; el contador no se incrementa porque la comprobación ocurre antes de `ocupadas += cantidad`.

**Fallo deliberado:** reemplaza el `throw` de capacidad por `throw new RuntimeException("Solicitadas " + cantidad + ", disponibles " + disponibles);`. **Resultado:** se conserva el texto, pero el tipo deja de expresar el motivo del rechazo y no expone `solicitadas()` ni `disponibles()`. **Diagnóstico:** el llamador ya no puede capturar el rechazo de capacidad por su tipo ni consultar sus datos; restaura la excepción específica.

**3. Entiende**

`RuntimeException` no exige declarar `throws`. El tipo propio identifica la regla violada y sus campos conservan los datos para que la capa de presentación pueda responder sin analizar texto. Una cantidad no positiva es un argumento inválido y usa `IllegalArgumentException`; capacidad insuficiente es un resultado previsto de la regla de asignación. Ninguno debe dejar la capacidad en un estado parcialmente actualizado.

**4. Cierra**

Asigna una guía antes de intentar otras dos; predice cuántos cupos quedan y comprueba que el rechazo informa `disponibles=1`. Explica por qué el contador sigue valiendo uno.

#### Subtema 3.2: Atiende el rechazo donde puedes informar al operador · 10 min

**1. Contexto**

`Asignador` protege la regla; el punto de entrada decide qué mensaje mostrar si faltan cupos.

**2. Hazlo tú**

En `java-motor-poo/src/Asignador.java`, sustituye solo el método `main` por:

```java
public static void main(String[] args) {
    try {
        new Asignador(2).asignar(3);
        System.out.println("Asignación completada");
    } catch (CapacidadInsuficienteException error) {
        System.err.println("Asignación rechazada: solicitadas="
            + error.solicitadas() + ", disponibles=" + error.disponibles());
        System.exit(2);
    }
}
```

Desde `java-motor-poo/`, compila y ejecuta con `javac -d out src/Asignador.java` y `java -cp out Asignador`.

**Resultado esperado:** `Asignación rechazada: solicitadas=3, disponibles=2` en la salida de error, código de salida `2` y ningún `Asignación completada`. Después de `java -cp out Asignador`, consulta el código con `echo $?` en la misma terminal.

**Fallo deliberado:** sustituye `catch (CapacidadInsuficienteException error)` por `catch (IllegalArgumentException error)` y quita el acceso a `solicitadas()` y `disponibles()` para que el archivo compile. **Resultado:** la excepción de capacidad se propaga sin manejar. **Diagnóstico:** el tipo capturado no corresponde al rechazo; restaura el `catch` específico.

**3. Entiende**

La llamada a `asignar` solo regresa normalmente cuando la asignación es válida; por eso el mensaje de éxito va después de ella. El `catch` específico traduce los datos de dominio en un mensaje controlado y el código no nulo permite que un script detecte el rechazo. Capturar `RuntimeException` de forma general aquí también ocultaría errores de programación que esta frontera no sabe resolver.

**4. Cierra**

Ejecuta el caso válido `new Asignador(2).asignar(2)` y compara las salidas. Anota qué línea distingue éxito de rechazo.

#### Subtema 3.3: Detecta el falso éxito de un catch vacío · 10 min

**1. Contexto**

Si una frontera captura el rechazo y no hace nada, la operación falla pero el operador pierde la causa.

**2. Hazlo tú**

Sustituye temporalmente solo el método `main` de `java-motor-poo/src/Asignador.java` por:

```java
public static void main(String[] args) {
    try {
        new Asignador(2).asignar(3);
    } catch (CapacidadInsuficienteException error) {
        // vacío a propósito para observar el defecto
    }
    System.out.println("Proceso terminado sin explicar el rechazo");
}
```

Compila y ejecuta la clase desde `java-motor-poo/`.

**Resultado esperado:** solo aparece `Proceso terminado sin explicar el rechazo`; el proceso termina con código cero, aunque no se asignaron las guías. **Fallo deliberado:** deja ese `catch` vacío como versión final. **Diagnóstico:** la salida y el código de terminación no informan el fracaso; restaura el `main` del subtema 3.2 o propaga el error a una frontera que lo pueda comunicar.

**3. Entiende**

Capturar no equivale a resolver. Si el programa devuelve éxito tras ocultar una excepción, otro proceso podría creer que la asignación ocurrió. Un mensaje controlado, un resultado explícito o una propagación deliberada conserva el estado real. No registres secretos ni muestres trazas internas al operador; el detalle técnico puede conservarse en el registro interno cuando corresponda.

**4. Cierra**

Compara salida estándar, salida de error y código de terminación del caso vacío y del caso atendido. Explica qué información necesitaría el llamador para no anunciar éxito por error.

#### Subtema 3.4: Conserva la causa al traducir un fallo de lectura · 10 min

**1. Contexto**

El motor puede exponer «configuración no disponible» sin obligar a sus consumidores a conocer la API de archivos. Para diagnosticar por qué ocurrió, debe conservar la `IOException` original.

**2. Hazlo tú**

Crea `java-motor-poo/src/CausaDemo.java`:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class CausaDemo {
    static class ConfiguracionNoDisponibleException extends RuntimeException {
        ConfiguracionNoDisponibleException(String mensaje, Throwable causa) {
            super(mensaje, causa);
        }
    }

    static String cargar(Path ruta) {
        try {
            return Files.readString(ruta);
        } catch (IOException error) {
            throw new ConfiguracionNoDisponibleException(
                "Configuración no disponible", error);
        }
    }

    public static void main(String[] args) {
        try {
            cargar(Path.of("config-ausente.properties"));
        } catch (ConfiguracionNoDisponibleException error) {
            System.err.println("tipo=" + error.getClass().getSimpleName());
            System.err.println("causa=" + error.getCause().getClass().getSimpleName());
            System.exit(1);
        }
    }
}
```

Desde `java-motor-poo/`, ejecuta `javac -d out src/CausaDemo.java`, `java -cp out CausaDemo` y luego `echo $?`.

**Resultado esperado:** `tipo=ConfiguracionNoDisponibleException`, `causa=NoSuchFileException` y código `1`. **Fallo deliberado:** cambia el constructor a `super(mensaje);` sin pasar `causa`. El diagnóstico ahora falla con `NullPointerException` al consultar `getCause().getClass()`, porque se perdió la excepción original. Restaura `super(mensaje, causa)`.

**3. Entiende**

El segundo argumento de `super` conserva la causa original en `getCause()`. Traducir una excepción tiene sentido cuando cambia la abstracción que el llamador debe conocer; no conviertas toda excepción checked en unchecked solo para evitar declararla. En este ejemplo la causa tiene un tipo concreto y solo se muestra en el laboratorio; en una aplicación real protege rutas y detalles internos al presentar el error al usuario.

**4. Cierra**

Sustituye la llamada del `try` por `System.out.println(cargar(Path.of("config.properties")).contains("capacidad=2"));`, usando el archivo creado en T1.2. La salida debe ser `true`, sin ejecutar el `catch` y con código `0`. Luego restaura la llamada a `config-ausente.properties` para repetir el diagnóstico.

**Fuentes oficiales:** [excepciones en dev.java](https://dev.java/learn/exceptions/), [RuntimeException](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html) y [Throwable.getCause](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html#getCause()).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** leer las guías y la capacidad del motor, cerrar el archivo y rechazar una asignación que exceda el cupo.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Provocar una excepción checked y una unchecked | Ver Tema 1 | Compara cómo el compilador trata cada una |
| 2 | Leer un archivo con try-with-resources | Ver Tema 2 | Verifica el cierre automático incluso ante error |
| 3 | Crear `CapacidadInsuficienteException` | Ver Tema 3 | Protege el cupo antes de modificarlo |
| 4 | Escribir un catch vacío y explicar el problema | Ver Tema 3 | Antipatrón de tragar excepciones |
| 5 | Corregir el catch vacío y señalar el rechazo al llamador | Ver Tema 3 | Mensaje y código de salida coherentes |

**Verificación:** el laboratorio se considera exitoso si el lector cierra un recurso que sí alcanzó a abrir, los rechazos no modifican la capacidad y ningún fallo se comunica como éxito.

### Incremento del proyecto: leer guías y respetar capacidad

Usa `java-motor-poo/src/modelo/Guia.java` de M1, `java-motor-poo/guias.txt` de T2.1 y `java-motor-poo/config.properties` de T1.2. Conserva `java-motor-poo/src/Asignador.java` del T3.2, con el `main` que informa el rechazo. Crea `java-motor-poo/src/MotorSeguro.java`:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import modelo.Guia;

public class MotorSeguro {
    static int leerCapacidad(Path ruta) throws IOException {
        for (String linea : Files.readAllLines(ruta)) {
            if (linea.startsWith("capacidad=")) {
                return Integer.parseInt(linea.substring("capacidad=".length()).trim());
            }
        }
        throw new IllegalArgumentException("Falta capacidad");
    }

    static List<Guia> leerGuias(Path ruta) throws IOException {
        Map<String, Guia> unicas = new LinkedHashMap<>();
        try (BufferedReader lector = Files.newBufferedReader(ruta)) {
            String linea;
            while ((linea = lector.readLine()) != null) {
                String codigo = linea.trim();
                if (codigo.isEmpty()) {
                    throw new IllegalArgumentException("Código de guía vacío");
                }
                if (!unicas.containsKey(codigo)) {
                    unicas.put(codigo, new Guia(codigo));
                }
            }
        }
        return new ArrayList<>(unicas.values());
    }

    public static void main(String[] args) {
        try {
            int capacidad = leerCapacidad(Path.of("config.properties"));
            List<Guia> guias = leerGuias(Path.of("guias.txt"));
            Asignador asignador = new Asignador(capacidad);
            asignador.asignar(guias.size());
            System.out.println("asignables=" + guias.size());
        } catch (IOException error) {
            System.err.println("No se pudo leer la entrada: " + error.getMessage());
            System.exit(1);
        } catch (Asignador.CapacidadInsuficienteException error) {
            System.err.println("Capacidad insuficiente: solicitadas="
                + error.solicitadas() + ", disponibles=" + error.disponibles());
            System.exit(2);
        } catch (NumberFormatException error) {
            System.err.println("Capacidad no numérica");
            System.exit(3);
        } catch (IllegalArgumentException error) {
            System.err.println("Entrada inválida: " + error.getMessage());
            System.exit(3);
        }
    }
}
```

Desde `java-motor-poo/` ejecuta:

```bash
javac -d out src/modelo/Guia.java src/Asignador.java src/MotorSeguro.java
java -cp out MotorSeguro
echo $?
```

**Resultado esperado con los archivos ya creados:** `asignables=2` y código `0`. El mapa conserva una guía por código, como en M2, antes de comprobar la capacidad. Cambia solo `capacidad=2` a `capacidad=1` en `config.properties`, repite y observa `Capacidad insuficiente: solicitadas=2, disponibles=1` con código `2`; restaura el valor. **Diagnóstico de I/O:** cambia temporalmente el nombre del archivo a `guias-ausentes.txt`; la lectura falla con código `1`, sin anunciar asignación. **Práctica independiente:** añade `RF-103` a `guias.txt`, predice el rechazo, ajusta la capacidad a tres y comprueba el éxito. Duplica después `RF-101`: el número de guías asignables debe seguir en tres. Explica qué frontera convierte cada fallo en una salida y por qué `leerGuias` libera el lector incluso si detecta una línea vacía.

**Errores comunes y soluciones**

- **Olvidar declarar `throws` para una excepción checked.** El compilador exige declararla o manejarla con try/catch.
- **Cerrar recursos manualmente en un `finally` en vez de usar try-with-resources.** Prefiere try-with-resources para código más simple y con la misma garantía.
- **Capturar `Exception` genérico y descartarlo silenciosamente.** Informa o propaga el fallo desde una frontera que pueda actuar; un mensaje interno no sustituye el código de salida cuando otro proceso invoca el motor.

---
