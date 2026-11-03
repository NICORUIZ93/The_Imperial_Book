# Módulo 3: Excepciones y manejo de recursos


## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions

Una excepción indica que una operación no pudo completarse. Practicarás cuándo declararla, cuándo manejarla y qué error no debes esconder.

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
        }
    }
}
```

Desde la carpeta del proyecto ejecuta:

```bash
javac -d out src/LeerConfig.java
java -cp out LeerConfig
```

**Resultado esperado:** si no existe `config.properties`, el programa muestra el mensaje de error y termina sin imprimir un stack trace completo.

**Fallo deliberado:** elimina `throws IOException` de la firma. **Diagnóstico:** el compilador exige capturar o declarar la excepción checked; restablece `throws` o añade un `try/catch`.

**3. Entiende**

`IOException` está checked: el compilador obliga a decidir qué hacer o a propagarla. El archivo es una entrada externa, así que informar el problema es útil.

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

public class LeerYPropagar {
    static String leer(Path ruta) throws IOException {
        return Files.readString(ruta);
    }

    static int contarLineas(Path ruta) throws IOException {
        return leer(ruta).lines().toList().size();
    }

    public static void main(String[] args) {
        try {
            System.out.println(contarLineas(Path.of("config.properties")));
        } catch (IOException error) {
            System.err.println("No se pudo contar: " + error.getMessage());
        }
    }
}
```

Crea `config.properties` con dos líneas y compila y ejecuta:

```bash
javac -d out src/LeerYPropagar.java
java -cp out LeerYPropagar
```

**Resultado esperado:** muestra `2`; si quitas el archivo, el método `main` presenta el error.

**Fallo deliberado:** borra `throws IOException` de `contarLineas`. **Diagnóstico:** la excepción sigue siendo checked aunque haya atravesado otro método; cada método que la propaga debe declararlo.

**3. Entiende**

Propagar no significa ignorar: la firma deja visible que la operación puede fallar y entrega la decisión a quien tiene contexto para responder.

**4. Cierra**

Dibuja el camino `leer → contarLineas → main` y marca dónde se atiende el error.

#### Subtema 1.3: Trata una entrada inválida como error de programa · 10 min

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

Checked no significa “buena” y unchecked no significa “ignorable”. Elige según quién puede recuperarse y si el compilador debe exigir una decisión.

**4. Cierra**

Clasifica `IOException` y `IllegalArgumentException` y explica qué capa puede responder a cada una.

**Fuentes oficiales:** [Java exceptions](https://dev.java/learn/exceptions/), [clases de excepción](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Exception.html).

### Tema 2: try-with-resources

El bloque `try-with-resources` cierra archivos y otros recursos incluso cuando el cuerpo termina con error.

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
            lector.lines().forEach(System.out::println);
        }
    }
}
```

Crea `guias.txt` con dos guías y ejecuta:

```bash
javac -d out src/LeerLineas.java
java -cp out LeerLineas
```

**Resultado esperado:** imprime las dos guías y cierra el archivo al salir del bloque.

**Fallo deliberado:** intenta abrir un archivo que no existe. **Diagnóstico:** aparece `IOException`; el fallo no impide que Java cierre cualquier recurso que sí hubiera alcanzado a abrirse.

**3. Entiende**

Los paréntesis del `try` declaran un recurso `AutoCloseable`. Java invoca `close()` automáticamente al abandonar el bloque.

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

**Fallo deliberado:** mueve la excepción a una línea anterior al `try`. **Diagnóstico:** el recurso todavía no se había abierto; vuelve a lanzarla dentro del bloque para observar el cierre automático.

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

**Fuente oficial:** [Java try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html).

### Tema 3: Excepciones personalizadas y no tragar excepciones

Usa una excepción propia para una regla del negocio y conserva suficiente información para diagnosticar el fallo.

**¿Por qué es importante?** Un error de negocio debe poder reconocerse y explicarse sin esconder el fallo real. **Modelo mental:** el tipo de excepción es la etiqueta del problema; el mensaje añade el dato que ayuda a resolverlo.

**Proyecto integrador:** informa saldo insuficiente antes de confirmar un retiro. **Límite:** no devuelvas detalles internos ni secretos al cliente. **Práctica:** compara el catch vacío con el mensaje visible.

```bash
javac -d out src/Billetera.java
java -cp out Billetera
```

#### Subtema 3.1: Representa un saldo insuficiente · 10 min

**1. Contexto**

Retirar más dinero del disponible es una condición concreta de una billetera, no un error técnico genérico.

**2. Hazlo tú**

Crea `src/Billetera.java`:

```java
public class Billetera {
    private int saldo;

    public Billetera(int saldoInicial) {
        saldo = saldoInicial;
    }

    public void retirar(int monto) {
        if (monto <= 0) throw new IllegalArgumentException("El monto debe ser positivo");
        if (monto > saldo) throw new SaldoInsuficienteException(monto, saldo);
        saldo -= monto;
    }

    static class SaldoInsuficienteException extends RuntimeException {
        SaldoInsuficienteException(int monto, int saldo) {
            super("No alcanza: retiro " + monto + ", saldo " + saldo);
        }
    }

    public static void main(String[] args) {
        new Billetera(5000).retirar(8000);
    }
}
```

Ejecuta `javac -d out src/Billetera.java` y `java -cp out Billetera`.

**Resultado esperado:** el programa señala `SaldoInsuficienteException` y explica el monto solicitado y el saldo actual.

**Fallo deliberado:** cambia la excepción específica por `RuntimeException`. **Diagnóstico:** el error pierde el nombre del evento de negocio; restaura la clase específica.

**3. Entiende**

Un tipo propio permite distinguir este caso de otros fallos. El mensaje añade datos útiles para diagnosticar, pero no debe incluir secretos.

**4. Cierra**

Explica qué regla protege `retirar` y qué información lleva la excepción.

#### Subtema 3.2: Atiende el error donde puedes informar al usuario · 10 min

**1. Contexto**

La billetera protege la regla; la capa que muestra el resultado decide cómo comunicar que no se pudo retirar.

**2. Hazlo tú**

Modifica `src/Billetera.java` para envolver la llamada de `main` con un `try/catch` específico:

```java
try {
    new Billetera(5000).retirar(8000);
    System.out.println("Retiro completado");
} catch (SaldoInsuficienteException error) {
    System.err.println("No se realizó el retiro: " + error.getMessage());
}
```

Compila y ejecuta la clase.

**Resultado esperado:** aparece el motivo de rechazo y no aparece `Retiro completado`.

**Fallo deliberado:** captura `IllegalArgumentException` en vez de `SaldoInsuficienteException`. **Diagnóstico:** el tipo capturado no coincide y el error de saldo se propaga; captura la excepción que lanza la regla.

**3. Entiende**

Atrapa el tipo que sabes manejar. Si una capa no puede recuperarse, deja que la excepción llegue a una capa que sí pueda informar o decidir.

**4. Cierra**

Guarda la salida del caso rechazado y explica por qué no se anunció un retiro exitoso.

#### Subtema 3.3: No ocultes fallos con un catch vacío · 10 min

**1. Contexto**

Un `catch` vacío hace parecer que la operación funcionó, aunque haya fallado.

**2. Hazlo tú**

En `src/Billetera.java`, sustituye temporalmente el manejo anterior por:

```java
try {
    new Billetera(5000).retirar(8000);
} catch (RuntimeException error) {
    // intencionalmente vacío para observar el antipatrón
}
System.out.println("El proceso sigue, pero el retiro falló");
```

Ejecuta y luego cambia el `catch` por uno que capture `SaldoInsuficienteException` e imprima el mensaje.

**Resultado esperado:** el primer caso no informa la causa; el segundo la muestra y permite distinguir el rechazo del éxito.

**Fallo deliberado:** vuelve a dejar vacío el `catch`. **Diagnóstico:** la salida termina sin explicar por qué se rechazó la operación; restaura un manejo visible o propaga el error.

**3. Entiende**

Capturar una excepción y no hacer nada no repara el problema. Evita atrapar `RuntimeException` de forma general salvo que una frontera de la aplicación tenga una respuesta deliberada.

**4. Cierra**

Conserva ambas salidas y señala cuál deja evidencia útil para quien da soporte.

**Fuentes oficiales:** [Java exceptions](https://dev.java/learn/exceptions/) y [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un lector de archivos con manejo robusto de excepciones y try-with-resources.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Provocar una excepción checked y una unchecked | Ver Tema 1 | Compara cómo el compilador trata cada una |
| 2 | Leer un archivo con try-with-resources | Ver Tema 2 | Verifica el cierre automático incluso ante error |
| 3 | Crear `SaldoInsuficienteException` | Ver Tema 3 | Extiende `RuntimeException` |
| 4 | Escribir un catch vacío y explicar el problema | Ver Tema 3 | Antipatrón de tragar excepciones |
| 5 | Corregir el catch vacío registrando el error | Ver Tema 3 | Decide explícitamente relanzar o manejar |

**Verificación:** el laboratorio se considera exitoso si el lector de archivos cierra correctamente el recurso incluso cuando el archivo no existe, y si ninguna excepción se descarta silenciosamente sin al menos un registro explícito del error.

**Errores comunes y soluciones**

- **Olvidar declarar `throws` para una excepción checked.** El compilador exige declararla o manejarla con try/catch.
- **Cerrar recursos manualmente en un `finally` en vez de usar try-with-resources.** Prefiere try-with-resources para código más simple y con la misma garantía.
- **Capturar `Exception` genérico y descartarlo silenciosamente.** Registra siempre el error como mínimo, y decide explícitamente cómo proceder.

---
