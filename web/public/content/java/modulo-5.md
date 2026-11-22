# Módulo 5: Concurrencia — hilos y virtual threads


## Aprende construyendo


### Tema 1: ExecutorService y gestión de hilos · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por executorservice y gestión de hilos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender executorservice y gestión de hilos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en executorservice y gestión de hilos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que executorservice y gestión de hilos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| ExecutorService y gestión de hilos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar ExecutorService y gestión de hilos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses executorservice y gestión de hilos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: executorservice y gestión de hilos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- ExecutorService y gestión de hilos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve executorservice y gestión de hilos en tu contexto?
2. ¿Cómo sabrías que executorservice y gestión de hilos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar executorservice y gestión de hilos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
javac -d out src/ExecutorDemo.java
java -cp out ExecutorDemo
```

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

```java
var a = executor.submit(() -> "RT-1");
var b = executor.submit(() -> "RT-2");
executor.shutdown();
System.out.println(a.get());
System.out.println(b.get());
executor.awaitTermination(1, java.util.concurrent.TimeUnit.SECONDS);
System.out.println(executor.isTerminated());
```

</details>

### Tema 2: CompletableFuture · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por completablefuture con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender completablefuture te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en completablefuture como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que completablefuture resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| CompletableFuture se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar CompletableFuture | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses completablefuture por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: completablefuture funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- CompletableFuture existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve completablefuture en tu contexto?
2. ¿Cómo sabrías que completablefuture no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar completablefuture?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
javac -d out src/FuturoCompletable.java
java -cp out FuturoCompletable
```

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

```java
var respuesta = CompletableFuture.<String>supplyAsync(() -> {
    throw new IllegalStateException("servicio no disponible");
}).exceptionally(error -> "No se pudo consultar");
System.out.println(respuesta.join());
```

</details>

### Tema 3: Virtual threads · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por virtual threads con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender virtual threads te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en virtual threads como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que virtual threads resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Virtual threads se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Virtual threads | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses virtual threads por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: virtual threads funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Virtual threads existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve virtual threads en tu contexto?
2. ¿Cómo sabrías que virtual threads no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar virtual threads?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
javac -d out src/HilosVirtuales.java
java -cp out HilosVirtuales
```

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

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 1; i <= 3; i++) {
        int id = i;
        executor.submit(() -> System.out.println("tarea " + id));
    }
}
```

```java
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.Executors;

public class Anclaje {
    public static void main(String[] args) {
        Instant inicio = Instant.now();
        try (var hilos = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 8; i++) {
                Object candado = new Object();
                hilos.submit(() -> {
                    synchronized (candado) {
                        try {
                            Thread.sleep(200);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                });
            }
        }
        long ms = Duration.between(inicio, Instant.now()).toMillis();
        System.out.println("Java " + Runtime.version().feature() + ": 8 tareas en "
                + (ms < 600 ? "menos de 600 ms" : "600 ms o mas") + " (" + ms + " ms)");
    }
}
```

```bash
java -Djdk.virtualThreadScheduler.parallelism=2 -Djdk.virtualThreadScheduler.maxPoolSize=2 src/Anclaje.java
```

</details>

### Tema 4: Condiciones de carrera y sincronización · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por condiciones de carrera y sincronización con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender condiciones de carrera y sincronización te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en condiciones de carrera y sincronización como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que condiciones de carrera y sincronización resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Condiciones de carrera y sincronización se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Condiciones de carrera y sincronización | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses condiciones de carrera y sincronización por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: condiciones de carrera y sincronización funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Condiciones de carrera y sincronización existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve condiciones de carrera y sincronización en tu contexto?
2. ¿Cómo sabrías que condiciones de carrera y sincronización no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar condiciones de carrera y sincronización?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
javac -d out src/ContadorSeguro.java
java -cp out ContadorSeguro
```

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

```java
synchronized boolean retirar(int monto) {
    if (monto > saldo) return false;
    saldo -= monto;
    return true;
}
```

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

</details>

### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por structured concurrency (structuredtaskscope, java 25) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender structured concurrency (structuredtaskscope, java 25) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en structured concurrency (structuredtaskscope, java 25) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que structured concurrency (structuredtaskscope, java 25) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Structured Concurrency (StructuredTaskScope, Java 25) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Structured Concurrency (StructuredTaskScope, Java 25) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses structured concurrency (structuredtaskscope, java 25) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: structured concurrency (structuredtaskscope, java 25) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Structured Concurrency (StructuredTaskScope, Java 25) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve structured concurrency (structuredtaskscope, java 25) en tu contexto?
2. ¿Cómo sabrías que structured concurrency (structuredtaskscope, java 25) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar structured concurrency (structuredtaskscope, java 25)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
javac --enable-preview --release 25 -d out src/Cotizar.java
java --enable-preview -cp out Cotizar
```

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

```bash
javac --enable-preview --release 25 -d out src/Cotizar.java
java --enable-preview -cp out Cotizar
```

</details>

### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por scoped values frente a threadlocal (java 25) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender scoped values frente a threadlocal (java 25) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en scoped values frente a threadlocal (java 25) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que scoped values frente a threadlocal (java 25) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Scoped Values frente a ThreadLocal (Java 25) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Scoped Values frente a ThreadLocal (Java 25) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses scoped values frente a threadlocal (java 25) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: scoped values frente a threadlocal (java 25) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Scoped Values frente a ThreadLocal (Java 25) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve scoped values frente a threadlocal (java 25) en tu contexto?
2. ¿Cómo sabrías que scoped values frente a threadlocal (java 25) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar scoped values frente a threadlocal (java 25)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
javac -d out src/Contexto.java
java -cp out Contexto
```

```java
ScopedValue.where(GUIA, "RT-8").run(() -> {
    System.out.println(GUIA.get());
    ScopedValue.where(GUIA, "RT-9").run(() -> System.out.println(GUIA.get()));
    System.out.println(GUIA.get());
});
```

```java
ThreadLocal<String> guiaLocal = new ThreadLocal<>();
try {
    guiaLocal.set("RT-8");
    System.out.println(guiaLocal.get());
} finally {
    guiaLocal.remove();
}
```

</details>

### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por timeouts y cancelación cooperativa sin abandonar recursos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender timeouts y cancelación cooperativa sin abandonar recursos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en timeouts y cancelación cooperativa sin abandonar recursos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que timeouts y cancelación cooperativa sin abandonar recursos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Timeouts y cancelación cooperativa sin abandonar recursos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Timeouts y cancelación cooperativa sin abandonar recursos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses timeouts y cancelación cooperativa sin abandonar recursos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: timeouts y cancelación cooperativa sin abandonar recursos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Timeouts y cancelación cooperativa sin abandonar recursos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve timeouts y cancelación cooperativa sin abandonar recursos en tu contexto?
2. ¿Cómo sabrías que timeouts y cancelación cooperativa sin abandonar recursos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar timeouts y cancelación cooperativa sin abandonar recursos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.util.concurrent.*;

public class Plazo {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor();
        CountDownLatch started = new CountDownLatch(1);
        Future<String> result = pool.submit(() -> {
            started.countDown();
            try {
                Thread.sleep(10_000);
                return "Respuesta";
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
                return "Cancelada";
            }
        });
        try {
            started.await();
            System.out.println(result.get(50, TimeUnit.MILLISECONDS));
        } catch (TimeoutException error) {
            result.cancel(true); // Solicita la interrupción de la tarea.
            System.out.println("Plazo agotado");
        } finally {
            pool.shutdownNow();
            if (!pool.awaitTermination(2, TimeUnit.SECONDS)) {
                throw new IllegalStateException("La tarea no cooperó");
            }
        }
        System.out.println("Executor terminado");
    }
}
```

```bash
javac -d out src/Plazo.java
java -cp out Plazo
```

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

```bash
javac -d out src/Cooperar.java
java -cp out Cooperar
```

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

```bash
javac -d out src/FuturoConPlazo.java
java -cp out FuturoConPlazo
```

</details>
