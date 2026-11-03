# Módulo 5: Concurrencia — hilos y virtual threads


## Aprende construyendo

### Tema 1: ExecutorService y gestión de hilos

**¿Por qué es importante?** Un pool limita cuántos trabajos simultáneos compiten por los recursos del motor. **Modelo mental:** una cantidad fija de operadores atiende una fila de tareas.

**Proyecto integrador:** valida varias guías y recoge cada resultado con Future. **Límite:** cerrar el executor no cancela tareas que ya enviaste. **Práctica:** mueve shutdown antes del envío y observa el rechazo.

#### Subtema 1.1: Envía trabajos a un executor · 10 min

**1. Contexto**

El motor recibe varias guías para validar; puede repartir el trabajo a un grupo acotado de hilos.

**2. Hazlo tú**

Crea `src/ExecutorDemo.java`:

```java
import java.util.concurrent.Executors;

public class ExecutorDemo {
    public static void main(String[] args) throws Exception {
        var executor = Executors.newFixedThreadPool(2);
        try {
            var primero = executor.submit(() -> "RT-1 validada");
            var segundo = executor.submit(() -> "RT-2 validada");
            System.out.println(primero.get());
            System.out.println(segundo.get());
        } finally {
            executor.shutdown();
        }
    }
}
```

Desde la carpeta del proyecto compila y ejecuta:

```bash
javac -d out src/ExecutorDemo.java
java -cp out ExecutorDemo
```

**Resultado esperado:** aparecen las dos guías validadas.

**Fallo deliberado:** elimina `executor.shutdown()`. **Diagnóstico:** el programa puede no terminar porque el pool sigue aceptando trabajo; restaura el cierre.

**3. Entiende**

El executor reutiliza un número limitado de hilos. `submit` agenda trabajo y devuelve un `Future`.

**4. Cierra**

Anota cuántos hilos permite el pool y quién cierra el executor.

#### Subtema 1.2: Recoge el resultado con Future · 10 min

**1. Contexto**

Si una validación produce un valor, el hilo que coordina puede esperar el resultado.

**2. Hazlo tú**

En `src/Futuro.java` crea una tarea que devuelva `"RT-3"`, guárdala como `Future<String>`, imprime `future.get()` y cierra el executor en un `finally`.

```java
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Futuro {
    public static void main(String[] args) throws Exception {
        var executor = Executors.newSingleThreadExecutor();
        try {
            Future<String> guia = executor.submit(() -> "RT-3");
            System.out.println(guia.get());
        } finally {
            executor.shutdown();
        }
    }
}
```

Ejecuta `javac -d out src/Futuro.java` y `java -cp out Futuro`.

**Resultado esperado:** imprime `RT-3`.

**Fallo deliberado:** cambia `Future<String>` por `Future<Integer>`. **Diagnóstico:** la tarea devuelve texto; el tipo de `Future` debe coincidir con el resultado.

**3. Entiende**

`get()` espera si la tarea aún no termina y puede lanzar una excepción si falló. No bloquees el hilo principal sin una razón clara.

**4. Cierra**

Señala qué tipo de resultado entrega la tarea.

#### Subtema 1.3: Cierra el executor al completar todas las tareas · 10 min

**1. Contexto**

Cerrar un executor impide nuevas tareas, pero las que ya fueron enviadas pueden terminar.

**2. Hazlo tú**

En `src/CierreExecutor.java` llama `shutdown()` después de enviar dos tareas y espera su resultado con `get()`. Imprime `executor.isTerminated()` después de leer ambos resultados.

```java
var a = executor.submit(() -> "RT-1");
var b = executor.submit(() -> "RT-2");
executor.shutdown();
System.out.println(a.get());
System.out.println(b.get());
executor.awaitTermination(1, java.util.concurrent.TimeUnit.SECONDS);
System.out.println(executor.isTerminated());
```

**Resultado esperado:** muestra los dos resultados y luego `true`.

**Fallo deliberado:** llama a `shutdown()` antes de `submit`. **Diagnóstico:** después de cerrar, el executor rechaza nuevos trabajos; envía primero y cierra después.

**3. Entiende**

`shutdown()` inicia el cierre ordenado. No significa que el trabajo pendiente se haya cancelado.

**4. Cierra**

Guarda el orden de envío, espera y cierre. Fuente oficial: [ExecutorService](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html).

### Tema 2: CompletableFuture

**¿Por qué es importante?** CompletableFuture permite encadenar y combinar resultados sin anidar esperas manuales. **Modelo mental:** cada etapa entrega un sobre a la siguiente cuando llega su resultado.

**Proyecto integrador:** combina destino y tarifa para presentar una cotización. **Límite:** join espera y envuelve el fallo; define dónde se reporta. **Práctica:** elimina exceptionally y observa cómo se propaga el error.

```bash
javac -d out src/FuturoCompletable.java
java -cp out FuturoCompletable
```

#### Subtema 2.1: Transforma un resultado asíncrono · 10 min

**1. Contexto**

Una consulta remota entrega el código de una guía; después quieres crear el texto de confirmación.

**2. Hazlo tú**

Crea `src/FuturoCompletable.java`:

```java
import java.util.concurrent.CompletableFuture;

public class FuturoCompletable {
    public static void main(String[] args) {
        var confirmacion = CompletableFuture
            .supplyAsync(() -> "RT-8")
            .thenApply(guia -> "Guía " + guia + " lista");
        System.out.println(confirmacion.join());
    }
}
```

Compila y ejecuta `javac -d out src/FuturoCompletable.java` y `java -cp out FuturoCompletable`.

**Resultado esperado:** `Guía RT-8 lista`.

**Fallo deliberado:** cambia `thenApply` por `thenAccept` y conserva `join()` como si devolviera el texto. **Diagnóstico:** `thenAccept` consume el valor y produce `CompletableFuture<Void>`; usa `thenApply` para transformar y devolver.

**3. Entiende**

`supplyAsync` inicia una tarea que produce un valor; `thenApply` transforma ese valor cuando está disponible.

**4. Cierra**

Dibuja la secuencia proveedor → transformación → salida.

#### Subtema 2.2: Combina dos resultados independientes · 10 min

**1. Contexto**

Para mostrar una ruta se necesitan la dirección y la tarifa; las dos consultas no dependen entre sí.

**2. Hazlo tú**

Crea `src/Combinar.java` y usa dos `CompletableFuture.supplyAsync`: uno devuelve `"Cali"` y el otro `4500`. Combínalos con `thenCombine` para imprimir `Cali: 4500`.

```java
import java.util.concurrent.CompletableFuture;

public class Combinar {
    public static void main(String[] args) {
        var ciudad = CompletableFuture.supplyAsync(() -> "Cali");
        var tarifa = CompletableFuture.supplyAsync(() -> 4500);
        var resumen = ciudad.thenCombine(tarifa,
            (destino, valor) -> destino + ": " + valor);
        System.out.println(resumen.join());
    }
}
```

Ejecuta `javac -d out src/Combinar.java` y `java -cp out Combinar`.

**Resultado esperado:** `Cali: 4500`.

**Fallo deliberado:** reemplaza `thenCombine` por `thenApply` intentando usar dos valores. **Diagnóstico:** `thenApply` recibe un solo resultado; para combinar dos futuros usa `thenCombine`.

**3. Entiende**

Ambos cálculos pueden avanzar de forma independiente; la combinación espera a que estén listos.

**4. Cierra**

Explica por qué ninguno de los cálculos necesita esperar al otro para empezar.

#### Subtema 2.3: Convierte un fallo en una respuesta visible · 10 min

**1. Contexto**

Una consulta puede fallar. La pantalla debe recibir un estado entendible y no ocultar el problema.

**2. Hazlo tú**

En `src/ErrorFuturo.java` crea un `CompletableFuture` que lanza `IllegalStateException` y añade `exceptionally(error -> "No se pudo consultar")`. Imprime el resultado con `join()`.

```java
var respuesta = CompletableFuture.<String>supplyAsync(() -> {
    throw new IllegalStateException("servicio no disponible");
}).exceptionally(error -> "No se pudo consultar");
System.out.println(respuesta.join());
```

**Resultado esperado:** `No se pudo consultar`.

**Fallo deliberado:** quita `exceptionally`. **Diagnóstico:** `join()` propaga el fallo envuelto en `CompletionException`; vuelve a definir dónde se transforma el error para la interfaz.

**3. Entiende**

`exceptionally` da una respuesta alternativa para esa cadena de futuro. No debe convertir cualquier error en un éxito silencioso sin registro o contexto.

**4. Cierra**

Conserva el mensaje mostrado y anota qué dato de diagnóstico guardarías. Fuente oficial: [CompletableFuture](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html).

### Tema 3: Virtual threads

**¿Por qué es importante?** Virtual threads hacen más simple manejar muchas tareas que pasan tiempo esperando E/S. **Modelo mental:** hay muchos turnos livianos compartiendo un conjunto de trabajadores de plataforma.

**Proyecto integrador:** atiende consultas de seguimiento que esperan red. **Límite:** no aumentan CPU ni conexiones de base de datos. **Práctica:** limita a dos el acceso simulado a conexiones.

```bash
javac -d out src/HilosVirtuales.java
java -cp out HilosVirtuales
```

#### Subtema 3.1: Ejecuta una tarea en un virtual thread · 10 min

**1. Contexto**

Las llamadas que esperan red pasan mucho tiempo sin usar CPU. Los virtual threads ayudan a ejecutar muchas tareas bloqueantes con una API sencilla.

**2. Hazlo tú**

Crea `src/HilosVirtuales.java`:

```java
import java.util.concurrent.Executors;

public class HilosVirtuales {
    public static void main(String[] args) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var tarea = executor.submit(() ->
                Thread.currentThread().isVirtual());
            try {
                System.out.println(tarea.get());
            } catch (Exception error) {
                throw new RuntimeException(error);
            }
        }
    }
}
```

Con JDK 21 o posterior, ejecuta `javac -d out src/HilosVirtuales.java` y `java -cp out HilosVirtuales`.

**Resultado esperado:** imprime `true`.

**Fallo deliberado:** cambia `newVirtualThreadPerTaskExecutor()` por un executor de hilos tradicionales y repite. **Diagnóstico:** `isVirtual()` muestra `false`; volviste a un hilo de plataforma.

**3. Entiende**

Un virtual thread no es un núcleo nuevo; la JVM lo programa sobre hilos de plataforma. Es útil para muchas tareas que esperan, no para acelerar cálculo intensivo de CPU.

**4. Cierra**

Guarda la salida y explica qué clase de espera modelaría tu tarea.

#### Subtema 3.2: No limites virtual threads como si fueran conexiones · 10 min

**1. Contexto**

Crear muchos virtual threads no crea más conexiones de base de datos. El recurso externo sigue teniendo capacidad limitada.

**2. Hazlo tú**

En `src/LimiteConexiones.java` conserva el executor de virtual threads y agrega un `Semaphore(2)` alrededor de una operación simulada de conexión. Inicia cinco tareas y muestra al entrar y salir cuántas están usando el recurso.

```java
var conexiones = new java.util.concurrent.Semaphore(2);
try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 5; i++) {
        int id = i;
        executor.submit(() -> {
            conexiones.acquire();
            try {
                System.out.println("usando conexión " + id);
            } finally {
                conexiones.release();
            }
            return null;
        });
    }
}
```

**Resultado esperado:** cinco tareas se completan y como máximo dos pasan a la vez por el recurso protegido.

**Fallo deliberado:** elimina `conexiones.acquire()`. **Diagnóstico:** las tareas ya no respetan el límite simulado; devuelve el semáforo antes de usar el recurso compartido.

**3. Entiende**

Usa virtual threads para la cantidad de tareas; limita por separado conexiones, permisos o solicitudes al servicio remoto.

**4. Cierra**

Explica por qué el executor de virtual threads no sustituye al pool de conexiones.

#### Subtema 3.3: Libera las tareas cuando termina el bloque · 10 min

**1. Contexto**

El trabajo asíncrono debe terminar antes de que el programa abandone el alcance que administra al executor.

**2. Hazlo tú**

En `src/AlcanceVirtual.java` envía tres tareas que impriman su número y usa el executor dentro de `try-with-resources`. Ejecuta varias veces.

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 1; i <= 3; i++) {
        int id = i;
        executor.submit(() -> System.out.println("tarea " + id));
    }
}
```

**Resultado esperado:** cada tarea imprime un número y el proceso termina después de completar las tareas.

**Fallo deliberado:** crea el executor y no lo cierra ni espera tareas. **Diagnóstico:** el ciclo de vida del recurso quedó suelto; usa `try-with-resources` para cerrar el executor y esperar el trabajo iniciado.

**3. Entiende**

El executor crea virtual threads por tarea y `close()` espera a que terminen las tareas enviadas antes de salir del bloque.

**4. Cierra**

Guarda una salida y señala qué límite de capacidad aún necesita tu sistema. Fuente oficial: [Virtual Threads](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html).

### Tema 4: Condiciones de carrera y sincronización

**¿Por qué es importante?** Una carrera puede aceptar dos retiros sobre el mismo saldo y romper una regla de negocio. **Modelo mental:** dos personas leen el mismo tablero antes de que ninguna escriba el cambio.

**Proyecto integrador:** hace atómico el chequeo y descuento del saldo. **Límite:** AtomicInteger sirve para una actualización simple; una regla de varias condiciones requiere sincronizar la operación completa. **Práctica:** compara el intercalado inseguro con synchronized.

```bash
javac -d out src/ContadorSeguro.java
java -cp out ContadorSeguro
```

#### Subtema 4.1: Reproduce un retiro duplicado de forma controlada · 10 min

**1. Contexto**

Dos solicitudes pueden leer el mismo saldo antes de que alguna lo actualice.

**2. Hazlo tú**

Crea `src/Carrera.java`. Usa un saldo compartido de `100`, dos tareas que intenten retirar `80` y dos `CountDownLatch`: ambas tareas anuncian que leyeron el saldo y esperan en una compuerta antes de restar.

```java
int[] saldo = {100};
boolean[] aceptado = new boolean[2];
var ambasLecturas = new java.util.concurrent.CountDownLatch(2);
var iniciarEscritura = new java.util.concurrent.CountDownLatch(1);
var turnoDos = new java.util.concurrent.CountDownLatch(1);
Runnable primero = () -> retirarConPausa(0, saldo, aceptado, ambasLecturas,
    iniciarEscritura, turnoDos);
Runnable segundo = () -> retirarConPausa(1, saldo, aceptado, ambasLecturas,
    iniciarEscritura, turnoDos);
```

Implementa `retirarConPausa`: cada tarea lee `saldo[0] >= 80` y guarda el resultado en `aceptado[id]`, baja `ambasLecturas` y espera en `iniciarEscritura`. La tarea `id == 1` espera además `turnoDos`; la primera resta 80 y libera `turnoDos`, y la segunda resta 80 si su lectura previa fue verdadera.

**Resultado esperado:** las dos solicitudes deciden aceptar el retiro con el mismo saldo inicial y el saldo final queda incorrecto. Repite para observar el intercalado controlado.

**Fallo deliberado:** quita la compuerta compartida y confía en que la carrera ocurra siempre. **Diagnóstico:** los hilos pueden ejecutarse en cualquier orden y el fallo deja de ser reproducible; la barrera sincroniza el punto exacto de intercalado.

**3. Entiende**

Una condición de carrera aparece cuando el resultado depende del orden de operaciones concurrentes sobre estado compartido.

**4. Cierra**

Dibuja los pasos leer saldo → validar → restar para cada solicitud.

#### Subtema 4.2: Protege la operación completa con synchronized · 10 min

**1. Contexto**

Proteger solo la resta no basta: la comprobación y el cambio deben formar una sola operación indivisible.

**2. Hazlo tú**

En `src/Carrera.java` cambia el retiro a un método `synchronized` que revise el saldo y lo descuente dentro del mismo método. Ejecuta las dos tareas anteriores.

```java
synchronized boolean retirar(int monto) {
    if (monto > saldo) return false;
    saldo -= monto;
    return true;
}
```

**Resultado esperado:** una solicitud retira `80`; la otra observa `20` y se rechaza. El saldo no queda negativo.

**Fallo deliberado:** sincroniza solo la línea `saldo -= monto`. **Diagnóstico:** las dos tareas pueden haber leído `100` antes de llegar a esa línea; protege el método completo.

**3. Entiende**

El monitor del objeto deja entrar una tarea a la vez en la sección sincronizada. La regla crítica incluye lectura, validación y actualización.

**4. Cierra**

Conserva los resultados de la versión insegura y la versión sincronizada.

#### Subtema 4.3: Usa AtomicInteger para un contador · 10 min

**1. Contexto**

Un contador compartido necesita actualizarse sin perder incrementos concurrentes.

**2. Hazlo tú**

Crea `src/ContadorSeguro.java`:

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

public class ContadorSeguro {
    public static void main(String[] args) {
        var contador = new AtomicInteger();
        IntStream.range(0, 10_000).parallel().forEach(i -> contador.incrementAndGet());
        System.out.println(contador.get());
    }
}
```

Compila y ejecuta `javac -d out src/ContadorSeguro.java` y `java -cp out ContadorSeguro`.

**Resultado esperado:** imprime `10000`.

**Fallo deliberado:** reemplaza `AtomicInteger` por un `int[]` compartido y vuelve a ejecutar varias veces. **Diagnóstico:** la lectura y escritura no forman una operación atómica y pueden perder incrementos; restaura `AtomicInteger`.

**3. Entiende**

`incrementAndGet` combina lectura y suma como una sola operación atómica. Para reglas con varias condiciones, como retirar saldo, una sección crítica puede ser más apropiada.

**4. Cierra**

Explica por qué el contador admite una operación atómica y el retiro necesita proteger una regla completa. Fuente oficial: [concurrencia en Java](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html).

### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25)

**Aviso de versión:** `StructuredTaskScope` es una API preview en Java 25. Compila y ejecuta con `--enable-preview --release 25`; no la trates como API estable.

#### Subtema 5.1: Espera resultados de tareas relacionadas · 10 min

**1. Contexto**

Para cotizar una entrega necesitas conocer distancia y disponibilidad antes de responder.

**2. Hazlo tú**

Crea `src/Cotizar.java`:

```java
import java.util.concurrent.StructuredTaskScope;

public class Cotizar {
    public static void main(String[] args) throws InterruptedException {
        try (var scope = StructuredTaskScope.open(
                StructuredTaskScope.Joiner.<String>allSuccessfulOrThrow())) {
            var distancia = scope.fork(() -> "12 km");
            var conductor = scope.fork(() -> "disponible");
            scope.join();
            System.out.println(distancia.get() + ", " + conductor.get());
        }
    }
}
```

Desde la carpeta del proyecto compila y ejecuta:

```bash
javac --enable-preview --release 25 -d out src/Cotizar.java
java --enable-preview -cp out Cotizar
```

**Resultado esperado:** muestra ambos resultados; el bloque no termina antes de que las tareas finalicen.

**Fallo deliberado:** quita `scope.join()` e intenta leer los resultados. **Diagnóstico:** falta esperar a que las subtareas completen; vuelve a unir el scope antes de llamar a `get()`.

**3. Entiende**

El scope agrupa subtareas dentro de un alcance. `join()` espera por ellas y el bloque de recursos mantiene su ciclo de vida contenido.

**4. Cierra**

Anota qué resultados deben estar listos antes de responder al cliente.

#### Subtema 5.2: Propaga el fallo y cancela trabajo hermano · 10 min

**1. Contexto**

Si la distancia falla, la cotización completa no se puede entregar. La otra subtarea no debe seguir trabajando sin que nadie use el resultado.

**2. Hazlo tú**

En `src/Cotizar.java`, reemplaza las tareas por estas y conserva el mismo `scope.join()`:

```java
var distancia = scope.fork(() -> {
    throw new IllegalStateException("no hay ruta");
});
var conductor = scope.fork(() -> {
    try {
        Thread.sleep(5000);
        return "disponible";
    } catch (InterruptedException cancelada) {
        System.out.println("consulta cancelada");
        throw cancelada;
    }
});
```

Envuelve `scope.join()` en un `catch (StructuredTaskScope.FailedException error)` que imprima `error.getCause().getMessage()`. Compila con las banderas preview.

**Resultado esperado:** se informa `no hay ruta`; la segunda tarea recibe interrupción, imprime `consulta cancelada` y termina antes del cierre del scope.

**Fallo deliberado:** captura `InterruptedException` dentro de la segunda tarea y no termina ni vuelve a lanzar. **Diagnóstico:** la tarea ignora la cancelación y puede retrasar el cierre; coopera con la interrupción.

**3. Entiende**

El scope coordina el fallo, pero no puede obligar a terminar un cálculo que ignora interrupciones.

**4. Cierra**

Registra cuál tarea falló y cómo respondió la otra a la interrupción.

#### Subtema 5.3: Activa preview para la versión correcta · 10 min

**1. Contexto**

El compilador solo permite APIs preview si declaras que las aceptas para esa versión.

**2. Hazlo tú**

Compila `src/Cotizar.java` primero sin preview y luego con:

```bash
javac --enable-preview --release 25 -d out src/Cotizar.java
java --enable-preview -cp out Cotizar
```

**Resultado esperado:** sin la bandera, Java rechaza el uso de preview; con ella, compila y ejecuta.

**Fallo deliberado:** usa `--release 21` con JDK 25. **Diagnóstico:** la API no existía en esa versión objetivo; compila para Java 25 y habilita preview.

**3. Entiende**

Preview puede cambiar o retirarse en una versión futura. Registra la versión de JDK y las banderas en el build.

**4. Cierra**

Guarda el comando reproducible y la versión usada. Fuente oficial: [StructuredTaskScope, Java 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/StructuredTaskScope.html).

### Tema 6: Scoped Values frente a ThreadLocal (Java 25)

#### Subtema 6.1: Comparte contexto durante una llamada · 10 min

**1. Contexto**

Varios métodos que atienden una solicitud necesitan consultar su guía sin pasarla por cada firma.

**2. Hazlo tú**

Crea `src/Contexto.java`:

```java
import java.lang.ScopedValue;

public class Contexto {
    static final ScopedValue<String> GUIA = ScopedValue.newInstance();

    static void registrar() {
        System.out.println("registro " + GUIA.get());
    }

    public static void main(String[] args) {
        ScopedValue.where(GUIA, "RT-8").run(Contexto::registrar);
        System.out.println(GUIA.isBound());
    }
}
```

Compila y ejecuta `javac -d out src/Contexto.java` y `java -cp out Contexto`.

**Resultado esperado:** imprime `registro RT-8` y después `false`; el valor solo está ligado durante la llamada.

**Fallo deliberado:** llama `GUIA.get()` después del bloque. **Diagnóstico:** el valor ya no está ligado; mueve la lectura dentro del alcance.

**3. Entiende**

ScopedValue comparte un valor de solo lectura durante un alcance dinámico y lo desliga cuando el bloque termina.

**4. Cierra**

Identifica qué método leyó el valor sin recibirlo como parámetro.

#### Subtema 6.2: Anida un valor y vuelve al anterior · 10 min

**1. Contexto**

Una operación interna puede necesitar un contexto temporal distinto y luego regresar al contexto original.

**2. Hazlo tú**

En `src/Contexto.java`, ejecuta estos bloques dentro de `main`:

```java
ScopedValue.where(GUIA, "RT-8").run(() -> {
    System.out.println(GUIA.get());
    ScopedValue.where(GUIA, "RT-9").run(() -> System.out.println(GUIA.get()));
    System.out.println(GUIA.get());
});
```

Compila y ejecuta de nuevo.

**Resultado esperado:** imprime `RT-8`, `RT-9`, `RT-8`.

**Fallo deliberado:** espera que la llamada interna cambie permanentemente el valor externo. **Diagnóstico:** la ligadura anidada dura solo en su propio bloque y al salir se restaura la anterior.

**3. Entiende**

La re-ligadura tiene alcance limitado; evita mutar un contexto global compartido.

**4. Cierra**

Dibuja el alcance exterior y el interior y marca cuándo termina cada valor.

#### Subtema 6.3: Compara el ciclo de vida con ThreadLocal · 10 min

**1. Contexto**

ThreadLocal conserva un valor por hilo hasta que se quite; con hilos reutilizados puede filtrarse contexto entre solicitudes.

**2. Hazlo tú**

En `src/Contexto.java`, añade una operación con `ThreadLocal<String>`: llama `set("RT-8")`, imprime `get()` y llama `remove()` en un `finally`. Compárala con `ScopedValue.where`.

```java
ThreadLocal<String> guiaLocal = new ThreadLocal<>();
try {
    guiaLocal.set("RT-8");
    System.out.println(guiaLocal.get());
} finally {
    guiaLocal.remove();
}
```

**Resultado esperado:** ambas técnicas permiten leer el valor durante la operación; ThreadLocal requiere que el código limpie el estado manualmente.

**Fallo deliberado:** quita `remove()` y reutiliza el mismo hilo para una segunda operación. **Diagnóstico:** la segunda operación puede ver el valor anterior; restaura la limpieza o usa un valor de alcance limitado.

**3. Entiende**

ScopedValue es de solo lectura y ligado a un bloque; ThreadLocal permite mutación y su limpieza es responsabilidad del código. No son intercambiables en todos los casos.

**4. Cierra**

Elige una opción para un identificador de solicitud inmutable y explica tu decisión. Fuentes oficiales: [ScopedValue, Java 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html) y [ThreadLocal](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un servicio concurrente que procese N tareas en paralelo usando virtual threads, corrigiendo una condición de carrera provocada intencionalmente.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Lanzar un `Thread` manual y luego con `ExecutorService` | Ver Tema 1 | Compara la reutilización de hilos |
| 2 | Provocar una condición de carrera y corregirla | Ver Tema 4 | Con `synchronized` |
| 3 | Componer llamadas con `CompletableFuture` | Ver Tema 2 | `thenCompose` + `exceptionally` |
| 4 | Crear 100,000 virtual threads | Ver Tema 3 | Compara el uso de memoria contra threads de plataforma |
| 5 | Medir latencia de I/O con threads de plataforma vs virtuales | Ver Tema 3 | Con 1000 tareas de I/O bloqueante |
| 6 | Agrupar subtareas relacionadas con `StructuredTaskScope` | Ver Tema 5 | Cancelación conjunta si una falla |
| 7 | Propagar contexto con `ScopedValue` a virtual threads hijos | Ver Tema 6 | Sin el crecimiento de heap de ThreadLocal heredable |

**Verificación:** el laboratorio se considera exitoso si el contador sin sincronizar muestra un resultado incorrecto reproducible, corregido correctamente con `synchronized`, si la comparación de virtual threads muestra una diferencia mensurable de uso de memoria o de capacidad de concurrencia frente a threads de plataforma, y si el scope de structured concurrency cancela correctamente una subtarea hermana cuando la otra falla.

**Errores comunes y soluciones**

- **Crear un `Thread` nuevo por cada tarea en cargas con muchas tareas.** Usa un `ExecutorService` para reutilizar hilos.
- **Modificar estado compartido sin sincronización.** Usa `synchronized`, `ReentrantLock`, o estructuras concurrentes como `ConcurrentHashMap`.
- **Usar virtual threads para código CPU-intensivo puro sin I/O.** Los virtual threads no aceleran cálculo puro; su beneficio es específico para I/O bloqueante.
- **Lanzar subtareas relacionadas con `CompletableFuture` suelto en vez de `StructuredTaskScope`.** Sin un scope que las agrupe, una subtarea puede quedar huérfana corriendo en segundo plano si su hermana falla.
- **Usar `ThreadLocal` heredable para propagar contexto a virtual threads masivos.** Cada hilo retiene su copia heredada; `ScopedValue` libera el valor automáticamente al salir del scope.

---


## Laboratorio de transferencia

### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos

**¿Por qué es importante?** Una pantalla no debe esperar indefinidamente, y cancelar una espera no garantiza que el trabajo de fondo se haya detenido.

#### Subtema 7.1: Limita cuánto espera el hilo coordinador · 10 min

**1. Contexto**

El motor solicita una tarifa; si no llega pronto, debe mostrar que el servicio está demorando.

**2. Hazlo tú**

Crea `src/Plazo.java`:

```java
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Plazo {
    public static void main(String[] args) throws Exception {
        var executor = Executors.newSingleThreadExecutor();
        var futuro = executor.submit(() -> {
            Thread.sleep(5000);
            return "tarifa lista";
        });
        try {
            System.out.println(futuro.get(100, TimeUnit.MILLISECONDS));
        } catch (TimeoutException tarde) {
            futuro.cancel(true);
            System.out.println("consulta cancelada");
        } finally {
            executor.shutdownNow();
            executor.awaitTermination(1, TimeUnit.SECONDS);
        }
    }
}
```

Compila y ejecuta `javac -d out src/Plazo.java` y `java -cp out Plazo`.

**Resultado esperado:** imprime `consulta cancelada` y el proceso termina sin esperar cinco segundos.

**Fallo deliberado:** quita el argumento de timeout de `get`. **Diagnóstico:** `get()` espera sin límite hasta que la tarea termine; restaura el límite explícito.

**3. Entiende**

El timeout limita cuánto espera quien llama. `cancel(true)` solicita interrupción; la tarea debe cooperar para terminar.

**4. Cierra**

Registra la duración aproximada y distingue timeout de respuesta exitosa.

#### Subtema 7.2: Haz que el trabajo responda a una interrupción · 10 min

**1. Contexto**

Cancelar una tarea es una petición. Si el código ignora la interrupción, el recurso puede seguir ocupado.

**2. Hazlo tú**

En `src/Cooperar.java`, inicia una tarea que duerma en un ciclo, espera a que señale que comenzó y cancélala con `cancel(true)`. Dentro de `catch (InterruptedException)` imprime `trabajo detenido` y termina.

```java
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

public class Cooperar {
    public static void main(String[] args) throws Exception {
        var inicio = new CountDownLatch(1);
        try (var executor = Executors.newSingleThreadExecutor()) {
            var tarea = executor.submit(() -> {
                inicio.countDown();
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException cancelada) {
                    System.out.println("trabajo detenido");
                }
            });
            inicio.await();
            tarea.cancel(true);
        }
    }
}
```

Compila y ejecuta `javac -d out src/Cooperar.java` y `java -cp out Cooperar`.

**Resultado esperado:** imprime `trabajo detenido` y sale del bloque sin esperar los cinco segundos.

**Fallo deliberado:** captura `InterruptedException` y continúa con otro `Thread.sleep`. **Diagnóstico:** el trabajo desatiende la cancelación; termina al capturar la interrupción o vuelve a propagarla.

**3. Entiende**

La cancelación no mata un hilo a la fuerza. El código debe revisar o propagar la interrupción y liberar sus recursos.

**4. Cierra**

Entrega la salida y señala dónde se atendió la interrupción.

#### Subtema 7.3: Distingue timeout de CompletableFuture y cancelación real · 10 min

**1. Contexto**

Una interfaz puede necesitar una respuesta límite, pero el proveedor remoto puede seguir procesando después de que tu futuro haya expirado.

**2. Hazlo tú**

Crea `src/FuturoConPlazo.java` con `CompletableFuture.supplyAsync` que espere un segundo, aplica `orTimeout(100, TimeUnit.MILLISECONDS)` y maneja `TimeoutException` con `exceptionally` para mostrar `servicio lento`.

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class FuturoConPlazo {
    public static void main(String[] args) {
        var respuesta = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000);
                return "tarifa lista";
            } catch (InterruptedException cancelada) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(cancelada);
            }
        }).orTimeout(100, TimeUnit.MILLISECONDS)
          .exceptionally(error -> "servicio lento");
        System.out.println(respuesta.join());
    }
}
```

Compila y ejecuta `javac -d out src/FuturoConPlazo.java` y `java -cp out FuturoConPlazo`.

**Resultado esperado:** la salida para el llamador es `servicio lento`. El timeout completa el futuro excepcionalmente; no prueba por sí solo que una operación externa se haya cancelado.

**Fallo deliberado:** interpreta `orTimeout` como confirmación de que el servicio remoto dejó de trabajar. **Diagnóstico:** el futuro limita el resultado local; usa la cancelación propia del cliente de red y comprueba cómo libera recursos.

**3. Entiende**

`orTimeout` completa el futuro con un error cuando vence el plazo. Para llamadas HTTP o base de datos, configura también un timeout en el cliente que realiza la operación.

**4. Cierra**

Explica qué terminó: la espera del llamador, el futuro local o el trabajo remoto. Fuente oficial: [CompletableFuture](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html).

**Proyecto integrador:** aplica límites a las consultas de tarifa y ubicación, y registra si hubo respuesta, timeout o cancelación cooperativa.
