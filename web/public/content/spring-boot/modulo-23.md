# Módulo 23: Concurrencia avanzada en Spring

## Aprende construyendo

Construirás cotizaciones que combinan llamadas asíncronas con `CompletableFuture`, descubrirás por qué `@Async` deja de funcionar cuando una clase se llama a sí misma, provocarás un deadlock real con dos locks tomados en orden inverso y lo corregirás con un orden consistente, y acotarás concurrencia con un `Semaphore`. El hilo conductor es RutaFlow cotizando tarifas de varios proveedores a la vez.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** dos consultas `@Async` que se combinan con `thenCombine` en un total.
- **Caso RutaFlow:** cotizar con fallback si un proveedor falla, cotizar con un límite de tiempo que corta una respuesta lenta, y transferir saldo entre cuentas de ruta sin bloquear el sistema completo cuando dos transferencias cruzadas ocurren a la vez.

Compara ejecutar una llamada "asíncrona" que en realidad corre en el hilo que la invoca con una que realmente corre en otro hilo. No confundas "el código compila con `CompletableFuture`" con "el código efectivamente corre en paralelo".

### Tema 1: CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 1 h 20 min

**Prerrequisito:** Módulo 9 de este track (WebFlux y reactividad), JDK 27+ y Maven.

**Al terminar podrás:** combinar resultados asíncronos con `thenCombine`, aplicar fallback con `exceptionally` y timeout con `orTimeout`, y reconocer cuándo una llamada a un método `@Async` se ejecuta en realidad de forma síncrona.

#### Aprende

Un desarrollador agrega `@Async` a un método, lo llama desde otro método de la misma clase, y en producción las llamadas siguen tardando lo mismo que si fueran secuenciales: el paralelismo prometido nunca ocurrió.

**¿Por qué es importante?** Spring implementa `@Async` con un proxy; si la llamada no pasa por ese proxy, la anotación se ignora en silencio y el código sigue compilando y pasando pruebas superficiales mientras corre secuencial.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@Async` + `CompletableFuture` como tipo de retorno | Prerrequisito | `consultarTarifaBase`/`consultarRecargoCombustible` anotados con `@Async("tareaAsincrona")` devuelven `CompletableFuture<BigDecimal>`. |
| `thenCombine` para combinar dos futuros | Núcleo | `base.thenCombine(recargo, BigDecimal::add)` suma dos cotizaciones que corrieron en paralelo. |
| Autoinvocación rompe el proxy `@Async` | Error frecuente | `cotizarConFallbackAutoinvocado` llama a un método `@Async` de la misma clase; la excepción se lanza síncrona y `.exceptionally()` nunca la ve. |
| Bean orquestador separado restaura el proxy | Decisión/fix | `TarifaCotizacionService` inyecta `TarifaAsyncService` como bean distinto; la llamada cruza el proxy y sí corre async. |
| `exceptionally` como fallback | Núcleo | `cotizarConFallbackSiFalla` devuelve `BigDecimal.ZERO` cuando el proveedor simulado falla, sin propagar la excepción al llamador. |
| `orTimeout` corta una tarea lenta | Núcleo | `consultarTarifaLenta` tarda 800 ms; `orTimeout(200, MILLISECONDS)` fuerza un `TimeoutException` que `.exceptionally()` convierte en `BigDecimal.ZERO`. |
| Executor con hilos virtuales | Decisión | `SimpleAsyncTaskExecutor` con `setVirtualThreads(true)` evita agotar un pool fijo cuando las tareas son muchas y de E/S. |

Cada fila tiene su explicación individual a continuación.

**`@Async` + `CompletableFuture` como tipo de retorno (prerrequisito).** Un método anotado con `@Async` que declara `CompletableFuture<T>` como retorno permite que el llamador siga ejecutando mientras el trabajo corre en el executor configurado. En el laboratorio, `consultarTarifaBase` y `consultarRecargoCombustible` llevan `@Async("tareaAsincrona")`, el nombre del bean `AsyncTaskExecutor` que ambos comparten. Sin esa anotación, Spring ejecutaría el método en el hilo del llamador aunque el tipo de retorno fuera `CompletableFuture`.

**`thenCombine` para combinar dos futuros (núcleo).** `thenCombine` toma el resultado de dos `CompletableFuture` independientes y los combina en cuanto ambos terminan, sin que uno tenga que esperar al otro de forma secuencial. `TarifaCotizacionService.cotizarTotal` lanza `consultarTarifaBase` y `consultarRecargoCombustible` casi al mismo tiempo y suma los resultados con `base.thenCombine(recargo, BigDecimal::add)`. El tiempo total se acerca al de la consulta más lenta, no a la suma de ambas.

**Autoinvocación rompe el proxy `@Async` (error frecuente).** Spring implementa `@Async` generando un proxy CGLIB alrededor del bean; ese proxy intercepta las llamadas que llegan desde *fuera* de la clase, pero una llamada `this.metodo()` dentro de la misma clase nunca pasa por el proxy. En el laboratorio, `TarifaAsyncService.cotizarConFallbackAutoinvocado` llama a `consultarTarifaConFalloSimulado(ruta)` —un método `@Async` de la misma clase— y la excepción que ese método lanza se propaga de forma síncrona, antes de que exista ninguna `CompletableFuture` sobre la cual `.exceptionally()` pueda actuar. El test lo confirma: la llamada lanza `IllegalStateException` directamente, no un futuro fallido.

**Bean orquestador separado restaura el proxy (decisión/fix).** La forma estándar de evitar la autoinvocación es separar el método que orquesta del método `@Async`, en dos beans distintos inyectados por constructor. `TarifaCotizacionService` no tiene ningún método `@Async` propio; inyecta `TarifaAsyncService` y llama a sus métodos como un bean externo, así que la llamada sí cruza el proxy y el método corre en el executor configurado. Es la misma lógica que `cotizarConFallbackAutoinvocado`, pero funcionando, porque la llamada ya no es una autoinvocación.

**`exceptionally` como fallback (núcleo).** `exceptionally` registra una función que solo se ejecuta si la `CompletableFuture` anterior terminó con una excepción, y produce un valor de reemplazo en vez de propagar el fallo. `cotizarConFallbackSiFalla` envuelve la llamada al proveedor simulado que siempre falla y devuelve `BigDecimal.ZERO` como tarifa de reemplazo, registrando una advertencia. El llamador nunca ve la excepción original: solo ve el resultado de reemplazo.

**`orTimeout` corta una tarea lenta (núcleo).** `orTimeout` completa la `CompletableFuture` con un `TimeoutException` si no terminó dentro del plazo indicado, sin cancelar el trabajo subyacente (que sigue corriendo en su hilo, pero ya nadie espera su resultado). `consultarTarifaLenta` tarda 800 ms a propósito; con `orTimeout(200, MILLISECONDS).exceptionally(...)`, el llamador recibe `BigDecimal.ZERO` a los 200 ms en vez de esperar los 800 ms completos. Esto protege al llamador de un proveedor lento, aunque no libera los recursos que esa tarea sigue consumiendo en segundo plano.

**Executor con hilos virtuales (decisión).** `SimpleAsyncTaskExecutor` con `setVirtualThreads(true)` crea un hilo virtual nuevo por tarea en vez de reutilizar un pool acotado de hilos de plataforma, lo que evita agotar el pool cuando hay muchas tareas de E/S esperando (la misma decisión que el Módulo 9, Tema 4, pero aplicada aquí a un executor de `@Async` en vez de al servidor web). `setTaskDecorator(...)` se aplica sobre el mismo executor para resolver el problema del Tema 2 de este módulo.

Combinar resultados asíncronos con `thenCombine`, aplicar fallback con `exceptionally` y cortar una tarea lenta con `orTimeout` solo funciona si la llamada realmente pasa por el proxy `@Async`; una autoinvocación dentro de la misma clase lo bypasea en silencio y el código vuelve a ser síncrono sin ningún error de compilación que lo delate.

**Analogía:** `@Async` es como un buzón de encargos: alguien de fuera deja el encargo en el buzón y el proxy lo reparte a un trabajador libre. Pero si el encargado se da a sí mismo el encargo caminando directo a su propio escritorio (autoinvocación), nunca pasó por el buzón: lo hace ahí mismo, sin repartir nada.

#### Practica

Genera un proyecto Spring Boot desde Initializr con la dependencia básica.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o concurrencia.zip && unzip -o concurrencia.zip -d concurrencia
```

Declara el executor con hilos virtuales:

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "tareaAsincrona")
    public AsyncTaskExecutor tareaAsincrona() {
        SimpleAsyncTaskExecutor executor = new SimpleAsyncTaskExecutor("tarifa-async-");
        executor.setVirtualThreads(true);
        return executor;
    }
}
```

Escribe `TarifaAsyncService` con los métodos `@Async`, incluyendo el que tiene el bug a propósito:

```java
@Service
public class TarifaAsyncService {

    @Async("tareaAsincrona")
    public CompletableFuture<BigDecimal> consultarTarifaBase(String ruta) {
        dormir(100);
        return CompletableFuture.completedFuture(new BigDecimal("120.00"));
    }

    @Async("tareaAsincrona")
    public CompletableFuture<BigDecimal> consultarRecargoCombustible(String ruta) {
        dormir(80);
        return CompletableFuture.completedFuture(new BigDecimal("15.50"));
    }

    @Async("tareaAsincrona")
    public CompletableFuture<BigDecimal> consultarTarifaConFalloSimulado(String ruta) {
        dormir(50);
        throw new IllegalStateException("Proveedor de tarifas no disponible para " + ruta);
    }

    @Async("tareaAsincrona")
    public CompletableFuture<BigDecimal> consultarTarifaLenta(String ruta) {
        dormir(800);
        return CompletableFuture.completedFuture(new BigDecimal("99.99"));
    }

    // BUG intencional: autoinvocación — bypasea el proxy @Async
    public CompletableFuture<BigDecimal> cotizarConFallbackAutoinvocado(String ruta) {
        return consultarTarifaConFalloSimulado(ruta)
                .exceptionally(ex -> BigDecimal.ZERO);
    }
}
```

**Primer intento (fallo deliberado):** escribe un test que llame a `cotizarConFallbackAutoinvocado("RF-CALI")` esperando `BigDecimal.ZERO`. Al ejecutarlo, la `IllegalStateException` se lanza directamente —no la atrapa `.exceptionally()`— porque la llamada nunca pasó por el proxy.

Crea el bean orquestador separado para que la llamada sí cruce el proxy:

```java
@Service
public class TarifaCotizacionService {

    private final TarifaAsyncService tarifaAsyncService;

    public TarifaCotizacionService(TarifaAsyncService tarifaAsyncService) {
        this.tarifaAsyncService = tarifaAsyncService;
    }

    public CompletableFuture<BigDecimal> cotizarTotal(String ruta) {
        CompletableFuture<BigDecimal> base = tarifaAsyncService.consultarTarifaBase(ruta);
        CompletableFuture<BigDecimal> recargo = tarifaAsyncService.consultarRecargoCombustible(ruta);
        return base.thenCombine(recargo, BigDecimal::add);
    }

    public CompletableFuture<BigDecimal> cotizarConFallbackSiFalla(String ruta) {
        return tarifaAsyncService.consultarTarifaConFalloSimulado(ruta)
                .exceptionally(ex -> BigDecimal.ZERO);
    }

    public CompletableFuture<BigDecimal> cotizarConTimeout(String ruta, Duration limite) {
        return tarifaAsyncService.consultarTarifaLenta(ruta)
                .orTimeout(limite.toMillis(), TimeUnit.MILLISECONDS)
                .exceptionally(ex -> BigDecimal.ZERO);
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

**Resultado esperado:** `orquestador.cotizarTotal(...)` suma ambas tarifas; `orquestador.cotizarConFallbackSiFalla(...)` devuelve cero sin propagar la excepción; `orquestador.cotizarConTimeout("RF-BAQ", Duration.ofMillis(200))` devuelve cero a los 200 ms aunque la tarea real tarde 800 ms. **Fallo deliberado:** `servicioAsincrono.cotizarConFallbackAutoinvocado(...)` lanza la excepción directamente en vez de atraparla, porque es una autoinvocación.

**Pista:** si un método `@Async` "no falla pero tampoco corre en paralelo", imprime `Thread.currentThread().getName()` dentro del método y en el llamador; si ambos muestran el mismo nombre de hilo, la llamada no pasó por el proxy.

#### Aplica

Agrega una tercera cotización asíncrona a `cotizarTotal` (por ejemplo, un seguro de carga) usando `CompletableFuture.allOf` en vez de anidar `thenCombine`, y documenta por qué `allOf` no te da directamente los tres valores combinados (devuelve `CompletableFuture<Void>`; cada resultado se recupera con `.join()` sobre el futuro original).

**Checklist de salida.**

- [ ] `cotizarTotal` corre las dos consultas en paralelo y suma los resultados con `thenCombine`.
- [ ] `cotizarConFallbackSiFalla` devuelve `BigDecimal.ZERO` sin propagar la excepción del proveedor simulado.
- [ ] `cotizarConTimeout` devuelve el fallback antes de que termine la tarea lenta real.
- [ ] Puedes explicar por qué `cotizarConFallbackAutoinvocado` lanza la excepción de forma síncrona.
- [ ] El executor usa hilos virtuales (`setVirtualThreads(true)`).

**Si falla.** Si un método `@Async` corre en el mismo hilo que su llamador, revisa si la llamada es una autoinvocación: muévela a un bean distinto inyectado. Si `.exceptionally()` nunca se ejecuta pese a que el método falla, el fallo probablemente ocurrió antes de que existiera la `CompletableFuture` (síncrono), no después. Si `orTimeout` no corta nada, confirma que el límite pasado sea menor que el tiempo real de la tarea.

Entrega el orquestador, el bug de autoinvocación documentado como prueba que falla intencionalmente, y la cotización con fallback y timeout, como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no uses `@Async` para trabajo que depende secuencialmente uno del otro sin beneficio de paralelismo; el overhead de cambiar de hilo no se paga solo.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** anotar un método con `@Async` y llamarlo desde otro método de la misma clase, asumiendo que el framework "ya sabe" que debe correr async sin pasar por el proxy; y usar `CompletableFuture.completedFuture(...)` para simular trabajo async en una prueba sin notar que eso nunca ejerce el executor real.

**Fuente oficial:** [documentación de Spring Framework — Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html).

### Tema 2: Locks, deadlocks, semáforos y MDC en concurrencia · Experto · 1 h 30 min

**Prerrequisito:** Tema 1 de este módulo.

**Al terminar podrás:** provocar y corregir un deadlock real entre dos locks, acotar concurrencia con un `Semaphore`, y propagar el contexto de logging (`MDC`) a un hilo de executor que por defecto lo pierde.

#### Aprende

Dos transferencias entre las mismas dos cuentas, en direcciones opuestas, se ejecutan al mismo tiempo. El sistema se congela: ningún hilo avanza, ninguna excepción aparece, y los logs muestran ambos hilos "en progreso" para siempre.

**¿Por qué es importante?** Un deadlock no lanza ninguna excepción que lo delate: el síntoma es la ausencia total de progreso, y diagnosticarlo requiere saber exactamente qué orden de locks lo produce.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Dos `ReentrantLock` tomados en orden inverso | Núcleo | `transferirInseguro` bloquea origen y luego destino; A→B y B→A compitiendo a la vez producen deadlock. |
| Verificación del deadlock con `Thread.join(timeout)` | Evidencia | Un test lanza ambas transferencias con un `CyclicBarrier` y confirma que al menos un hilo sigue vivo tras 3 segundos. |
| Orden total consistente evita el deadlock | Núcleo/fix | `transferir` ordena los locks por el id de la cuenta, no por quién es origen o destino; las mismas dos transferencias ya no compiten en orden inverso. |
| `tryLock` con límite de tiempo | Variante | En vez de bloquear indefinidamente, `tryLock(2, SECONDS)` falla explícitamente si no consigue el lock, evitando esperar para siempre. |
| `Semaphore` acota concurrencia | Núcleo | `PoolConexiones` con 3 permisos limita a 3 el número de tareas que corren a la vez, verificado contando el pico real con un `AtomicInteger`. |
| `MDC` no cruza executors por defecto | Error frecuente | Un `correlationId` puesto con `MDC.put(...)` en el hilo llamador no aparece dentro de una tarea `@Async` sin `TaskDecorator`. |
| `TaskDecorator` copia el contexto al hilo del executor | Núcleo/fix | `MdcTaskDecorator` copia el `Map` de MDC del hilo llamador al hilo de ejecución antes de correr la tarea, y lo restaura después. |

Cada fila tiene su explicación individual a continuación.

**Dos `ReentrantLock` tomados en orden inverso (núcleo).** Cuando dos hilos necesitan los mismos dos locks pero los piden en orden distinto, cada uno puede quedarse con el primero y esperar indefinidamente el segundo que el otro ya tiene: ningún hilo libera lo que tiene porque ninguno consigue lo que falta. `transferirInseguro(origen, destino, monto)` siempre bloquea `origen` y después `destino`, en ese orden literal de los parámetros. Si un hilo llama `transferirInseguro(A, B, ...)` y otro llama `transferirInseguro(B, A, ...)` casi al mismo tiempo, el primero toma el lock de A y espera el de B, mientras el segundo toma el lock de B y espera el de A.

**Verificación del deadlock con `Thread.join(timeout)` (evidencia).** Un deadlock no se demuestra con una aserción sobre un valor; se demuestra mostrando que el progreso se detuvo. El test arranca ambos hilos sincronizados con un `CyclicBarrier` (para maximizar la probabilidad de colisión) y luego llama a `join(3000)` sobre cada uno: si al menos un hilo sigue `isAlive()` después de los 3 segundos, eso confirma que quedó bloqueado esperando un lock que nunca se liberará. El laboratorio agrega además una pausa de 50 ms entre el primer y el segundo `lock()` para ensanchar la ventana de carrera y hacer el deadlock reproducible de forma confiable, no solo posible.

**Orden total consistente evita el deadlock (núcleo/fix).** Si todos los hilos acuerdan un mismo orden para pedir un conjunto de locks —por ejemplo, ordenando por un id estable— ningún hilo puede quedar esperando un lock que otro hilo también está esperando en sentido contrario. `transferir(origen, destino, monto)` calcula cuál de las dos cuentas tiene el id "menor" y siempre bloquea esa primero, sin importar si es el origen o el destino de esa transferencia en particular. Las mismas dos transferencias cruzadas (A→B y B→A) ahora piden los locks en el mismo orden (primero la cuenta con id menor), así que nunca compiten en sentido inverso.

**`tryLock` con límite de tiempo (variante).** `lock()` espera indefinidamente; `tryLock(tiempo, unidad)` espera como máximo ese tiempo y devuelve `false` si no consiguió el lock, permitiendo fallar explícitamente en vez de congelarse. `transferir` usa `tryLock(2, SECONDS)` sobre ambos locks y lanza una excepción clara si alguno no se consigue a tiempo, lo que convierte un deadlock silencioso (si todavía quedara alguno) en un fallo visible y diagnosticable.

**`Semaphore` acota concurrencia (núcleo).** Un `Semaphore` con N permisos garantiza que como máximo N hilos ejecuten el bloque protegido a la vez; los demás esperan en `acquire()` hasta que alguien llame `release()`. `PoolConexiones` envuelve `Semaphore(maximoConcurrente)` para simular un pool de conexiones limitado: el test lanza 10 tareas contra un pool de 3 permisos y confirma, con un contador atómico que registra el pico de ejecuciones simultáneas, que ese pico nunca supera 3 y efectivamente lo alcanza. Sin el semáforo, las 10 tareas competirían sin ningún límite por el recurso que se está simulando.

**`MDC` no cruza executors por defecto (error frecuente).** `MDC` (Mapped Diagnostic Context) de SLF4J guarda sus valores en un `ThreadLocal`; cuando una tarea se ejecuta en un hilo distinto al que la encargó —como ocurre con cualquier `@Async` o `ExecutorService`— ese hilo nuevo tiene su propio `ThreadLocal` vacío. El test `sinTaskDecoratorElCorrelationIdSePierdeEnElHiloAsincrono` pone `MDC.put("correlationId", "req-123")` en el hilo de la prueba, llama a un método `@Async` que corre en el executor `tareaAsincronaSinContexto`, y confirma que `MDC.get("correlationId")` dentro de esa tarea devuelve `null`. El contexto de logging para correlacionar una petición con sus logs asíncronos simplemente no llegó.

**`TaskDecorator` copia el contexto al hilo del executor (núcleo/fix).** Spring permite registrar un `TaskDecorator` en un `TaskExecutor` que envuelve cada `Runnable` antes de ejecutarlo, permitiendo copiar manualmente cualquier `ThreadLocal` del hilo llamador al hilo de ejecución. `MdcTaskDecorator.decorate(runnable)` captura `MDC.getCopyOfContextMap()` en el hilo llamador (en el momento de encolar la tarea, no cuando se ejecuta) y lo restaura con `MDC.setContextMap(...)` dentro del hilo del executor antes de correr la tarea real, limpiándolo después. El executor `tareaAsincrona` tiene este decorator registrado; el test `conTaskDecoratorElCorrelationIdSePropagaAlHiloAsincrono` confirma que el mismo `correlationId` sí aparece dentro de la tarea async cuando se usa ese executor.

Un deadlock entre dos locks requiere que dos hilos los pidan en orden inverso; un orden total consistente (por ejemplo, por id) lo elimina sin necesidad de `tryLock`, aunque `tryLock` con límite de tiempo sigue siendo una defensa útil contra bloqueos inesperados. Un `Semaphore` acota cuántos hilos ejecutan un bloque a la vez. `MDC` es un `ThreadLocal` que no cruza automáticamente a un hilo de executor; un `TaskDecorator` que copie y restaure el `Map` de contexto es la forma estándar de propagarlo.

**Analogía:** el deadlock de los dos locks es como dos personas cruzando por una puerta angosta en direcciones opuestas, cada una sujetando el marco de su lado y esperando que la otra suelte el suyo primero: ninguna avanza hasta que alguien suelta. Un orden consistente es acordar de antemano quién cede el paso según una regla fija (por ejemplo, quien llegó por el lado izquierdo), sin importar hacia dónde vaya cada uno.

#### Practica

Continúa en la carpeta del Tema 1 y agrega las clases de este tema.

Crea `CuentaRuta` con su propio `ReentrantLock`:

```java
public class CuentaRuta {
    private final String id;
    private BigDecimal saldo;
    private final ReentrantLock lock = new ReentrantLock();
    // id, saldo, sumar(monto), restar(monto), getLock()
}
```

Escribe las dos versiones de transferencia en `ServicioTransferencias`:

```java
public void transferirInseguro(CuentaRuta origen, CuentaRuta destino, BigDecimal monto) {
    origen.getLock().lock();
    try {
        Thread.sleep(50); // ensancha la ventana de carrera para el laboratorio
        destino.getLock().lock();
        try {
            origen.restar(monto);
            destino.sumar(monto);
        } finally {
            destino.getLock().unlock();
        }
    } finally {
        origen.getLock().unlock();
    }
}

public void transferir(CuentaRuta origen, CuentaRuta destino, BigDecimal monto) {
    CuentaRuta primera = origen.getId().compareTo(destino.getId()) <= 0 ? origen : destino;
    CuentaRuta segunda = primera == origen ? destino : origen;
    primera.getLock().tryLock(2, TimeUnit.SECONDS);
    try {
        segunda.getLock().tryLock(2, TimeUnit.SECONDS);
        try {
            origen.restar(monto);
            destino.sumar(monto);
        } finally {
            segunda.getLock().unlock();
        }
    } finally {
        primera.getLock().unlock();
    }
}
```

**Primer intento (fallo deliberado):** lanza dos hilos sincronizados con un `CyclicBarrier`, uno llamando `transferirInseguro(A, B, ...)` y otro `transferirInseguro(B, A, ...)`. Con `join(3000)` sobre ambos, al menos uno sigue vivo: deadlock confirmado.

Repite el mismo test con `transferir` (la versión con orden consistente): ambos hilos terminan y los saldos vuelven a su valor original.

Crea `PoolConexiones` con un `Semaphore`:

```java
public class PoolConexiones {
    private final Semaphore permisos;
    public PoolConexiones(int maximoConcurrente) {
        this.permisos = new Semaphore(maximoConcurrente);
    }
    public <T> T usar(Supplier<T> trabajo) {
        permisos.acquire();
        try {
            return trabajo.get();
        } finally {
            permisos.release();
        }
    }
}
```

Agrega el segundo executor y el `TaskDecorator` de MDC:

```java
@Bean(name = "tareaAsincronaSinContexto")
public AsyncTaskExecutor tareaAsincronaSinContexto() {
    SimpleAsyncTaskExecutor executor = new SimpleAsyncTaskExecutor("tarifa-async-sin-ctx-");
    executor.setVirtualThreads(true);
    return executor; // sin TaskDecorator: MDC no se propaga
}

public class MdcTaskDecorator implements TaskDecorator {
    public Runnable decorate(Runnable runnable) {
        Map<String, String> contexto = MDC.getCopyOfContextMap();
        return () -> {
            Map<String, String> anterior = MDC.getCopyOfContextMap();
            try {
                if (contexto != null) MDC.setContextMap(contexto);
                runnable.run();
            } finally {
                if (anterior != null) MDC.setContextMap(anterior); else MDC.clear();
            }
        };
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

**Resultado esperado:** `transferirInseguro` con direcciones opuestas deja al menos un hilo vivo tras 3 segundos (deadlock); `transferir` con el mismo escenario termina limpio y ambos saldos vuelven a su valor original; el `Semaphore` de 3 permisos nunca deja correr más de 3 tareas a la vez entre 10 lanzadas; sin `TaskDecorator`, `MDC.get("correlationId")` es `null` dentro de la tarea async; con `TaskDecorator`, el mismo valor aparece intacto. **Fallo deliberado:** el deadlock de `transferirInseguro` y la pérdida de `correlationId` sin decorator son ambos fallos reales y reproducibles, no simulados.

**Pista:** si un deadlock no se reproduce de forma confiable, ensancha la ventana de carrera con una pausa corta entre el primer y el segundo `lock()` — el objetivo es pedagógico, no representar el tiempo real de producción.

#### Aplica

Agrega un tercer lock a `transferirInseguro`/`transferir` (por ejemplo, una cuenta de comisiones) y verifica que el orden consistente sigue evitando deadlocks con tres cuentas en vez de dos. Aplica el mismo `TaskDecorator` de MDC a un endpoint real que dispare una tarea `@Async` y confirma en los logs que el `correlationId` de la petición HTTP aparece también en el log de la tarea asíncrona.

**Checklist de salida.**

- [ ] `transferirInseguro` con direcciones opuestas produce un deadlock reproducible, verificado con `join(timeout)`.
- [ ] `transferir` con orden consistente por id completa sin deadlock con el mismo escenario.
- [ ] El `Semaphore` de `PoolConexiones` nunca permite más ejecuciones concurrentes que sus permisos.
- [ ] Puedes explicar por qué `MDC` no cruza automáticamente a un hilo de executor.
- [ ] El `TaskDecorator` propaga y restaura el contexto de MDC correctamente, incluyendo el caso sin contexto previo.

**Si falla.** Si el deadlock no se reproduce, aumenta la pausa entre locks o agrega más iteraciones. Si el orden consistente aun así produce deadlock, revisa que el criterio de orden (el id) sea realmente total y estable, no dependiente de cuál cuenta es origen. Si el pico medido del semáforo supera los permisos configurados, revisa que `acquire()`/`release()` estén balanceados incluso cuando el trabajo lanza una excepción. Si el `correlationId` sigue sin propagarse con el decorator, confirma que el executor correcto (con el decorator registrado) es el que realmente se está inyectando en el método `@Async`.

Entrega las dos versiones de transferencia con sus pruebas, el pool acotado por semáforo y el `TaskDecorator` de MDC verificado, como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no agregues `tryLock` con reintentos indefinidos como sustituto de un orden consistente; eso solo cambia un deadlock silencioso por una espera larga igualmente invisible.

Como **siguiente** paso, lleva lo aprendido al próximo módulo y conéctalo con el proyecto integrador del track.

**Errores comunes:** asumir que un deadlock siempre lanza una excepción o aparece en un log, cuando en realidad su síntoma es la ausencia total de progreso; y olvidar que `MDC` es un `ThreadLocal` y esperar que un `correlationId` puesto en el hilo de una petición HTTP aparezca automáticamente en los logs de una tarea `@Async`, sin registrar un `TaskDecorator` que lo copie.

**Fuente oficial:** [documentación de Spring Framework — Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html).
