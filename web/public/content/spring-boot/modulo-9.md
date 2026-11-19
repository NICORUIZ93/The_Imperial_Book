# Módulo 9: Concurrencia, @Async y resiliencia en el núcleo de Spring

## Aprende construyendo

Construirás cotizaciones que combinan llamadas asíncronas con `CompletableFuture`, descubrirás por qué `@Async` deja de funcionar cuando una clase se llama a sí misma, provocarás un deadlock real con dos locks tomados en orden inverso y lo corregirás con un orden consistente, y acotarás concurrencia con un `Semaphore`. El hilo conductor es RutaFlow cotizando tarifas de varios proveedores a la vez. El último tema usa lo que Spring Framework 7 trae en el núcleo para reintentar (`@Retryable`) y limitar concurrencia (`@ConcurrencyLimit`) sin dependencias extra.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** dos consultas `@Async` que se combinan con `thenCombine` en un total.
- **Caso RutaFlow:** cotizar con fallback si un proveedor falla, cotizar con un límite de tiempo que corta una respuesta lenta, y transferir saldo entre cuentas de ruta sin bloquear el sistema completo cuando dos transferencias cruzadas ocurren a la vez.

Compara ejecutar una llamada "asíncrona" que en realidad corre en el hilo que la invoca con una que realmente corre en otro hilo. No confundas "el código compila con `CompletableFuture`" con "el código efectivamente corre en paralelo".

### Tema 1: @Async y ejecutores: trabajo en segundo plano con límites

**¿Por qué es importante?** el trabajo en segundo plano necesita límites y resultados observables para no ocultar fallos ni agotar recursos.

**Meta:** demostrar qué llamadas cambian de hilo, observar errores del trabajo y rechazar tareas cuando se agota la capacidad. **Prerrequisitos:** M8 T1 y T3, métodos Java, excepciones y `CompletableFuture` del track Java. Duración: 35–40 min.

**Preparación desde cero:** necesitas JDK 25 y el repositorio. Desde su raíz copia el laboratorio completo a una carpeta nueva y entra en ella:

```bash
cp -R examples/spring-async-rutaflow practica-async
cd practica-async
./mvnw -q clean test
```

El `pom.xml` fija Spring Boot 4.1.2 y el wrapper incluido ejecuta Maven. Trabajarás con `src/main/java/academia/rutaflow/async/AsyncConfiguration.java`, `NotificacionService.java` y `src/test/java/academia/rutaflow/async/AsyncBehaviorTest.java`. **Resultado esperado:** cuatro pruebas correctas. No necesitas credenciales ni proveedor SMS; el método devuelve el nombre del hilo para observar el mecanismo.

**Evidencia final:** una llamada externa usa `notif-`, una interna conserva el hilo actual, un error llega mediante el futuro y una cuarta tarea se rechaza cuando hay dos activas y una en cola. Esto comprueba comportamiento, no una promesa de velocidad.

#### Subtema 1.1 · Ejecuta una llamada a través del proxy · 8 min

**Contexto:** RutaFlow necesita apartar trabajo breve del hilo que atiende una solicitud. Un *proxy* es el objeto intermediario que Spring entrega al pedir el servicio; decide cómo ejecutar la llamada. **Analogía:** como dejar un encargo en una ventanilla: recibirlo no significa haberlo completado.

**Hazlo tú:** abre `src/main/java/academia/rutaflow/async/NotificacionService.java` en tu copia. Este es el método completo que observarás:

```java
@Async("notificaciones")
public CompletableFuture<String> enviar(String guia) {
    if (guia.isBlank()) throw new IllegalArgumentException("Guía vacía");
    return CompletableFuture.completedFuture(Thread.currentThread().getName());
}
```

Ejecuta desde `practica-async`:

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#llamadaExternaCambiaDeHilo test
```

**Resultado esperado:** el futuro termina con un nombre que empieza por `notif-`; la prueba pasa. En `AsyncConfiguration.java`, `@EnableAsync` activa la interceptación y el bean `notificaciones` selecciona el ejecutor. El contexto de prueba registra ambas clases; no hay servidor HTTP.

**Fallo deliberado:** quita `@EnableAsync` de `AsyncConfiguration.java` y repite. **Diagnóstico:** se devuelve el nombre del hilo de prueba, sin prefijo `notif-`; restaura la anotación.

**Entiende:** `CompletableFuture` representa un resultado pendiente; `get(5, TimeUnit.SECONDS)` espera como máximo cinco segundos en la prueba. El método de demostración no envía un SMS. Esperar inmediatamente con `get` en un controlador volvería a bloquear ese controlador; cambiar de hilo no hace gratuito el trabajo.

**Cierra:** guarda el resultado del test y explica la diferencia entre aceptar una tarea y terminarla. Conserva la anotación restaurada antes de continuar.

#### Subtema 1.2 · Diagnostica la auto-invocación · 8 min

**Contexto:** llamar otro método de la misma instancia no vuelve a pasar por el proxy. Este límite explica por qué una anotación correcta puede parecer ignorada.

**Hazlo tú:** abre `src/main/java/academia/rutaflow/async/NotificacionService.java` y sigue este recorrido:

```java
public CompletableFuture<String> enviarDesdeDentro(String guia) {
    return this.enviar(guia);
}
```

Ejecuta desde la carpeta del laboratorio:

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#autoInvocacionConservaElHiloActual test
```

**Resultado esperado:** el nombre devuelto coincide con el hilo que ejecuta el test. Contrástalo con el subtema anterior: ambos llaman `enviar`, pero solo la llamada externa atraviesa el intermediario.

**Fallo deliberado:** en `src/test/java/academia/rutaflow/async/AsyncBehaviorTest.java`, cambia la expectativa de este test a `.startsWith("notif-")`. **Diagnóstico:** falla porque `this.enviar` es una llamada directa; restaura `.isEqualTo(Thread.currentThread().getName())`.

**Entiende:** si un caso de uso necesita ejecutar ese trabajo asíncronamente, extrae el trabajo a otro bean e invócalo mediante la dependencia inyectada. No basta con añadir más anotaciones al mismo recorrido. La identidad y las transacciones del hilo llamante tampoco se trasladan automáticamente por cambiar de hilo.

**Cierra:** dibuja llamante → proxy → ejecutor y, debajo, servicio → `this.enviar`. Marca en cuál recorrido hay cambio de hilo y conserva la prueba correcta.

#### Subtema 1.3 · Observa el error del trabajo · 8 min

**Contexto:** una tarea aceptada puede fallar después. El llamante necesita conservar el futuro para saberlo; una respuesta inmediata no demuestra éxito de negocio.

**Hazlo tú:** en `src/test/java/academia/rutaflow/async/AsyncBehaviorTest.java`, lee `errorDelTrabajoLlegaPorElFuture`. El test llama `enviar("")` y luego espera el resultado:

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#errorDelTrabajoLlegaPorElFuture test
```

**Resultado esperado:** `get` lanza `ExecutionException` cuya causa es `IllegalArgumentException`; el test pasa porque espera ese fallo. No es una excepción lanzada al encolar: la guía se valida dentro del trabajo.

**Fallo deliberado:** elimina la validación `guia.isBlank()` de `src/main/java/academia/rutaflow/async/NotificacionService.java`. **Diagnóstico:** el futuro termina correctamente y la aserción que exige excepción falla. Restaura la validación.

**Entiende:** maneja el futuro mediante composición o un registro de resultado. Si el método devuelve `void`, no puede devolver el error al llamante por un futuro; Spring ofrece `AsyncUncaughtExceptionHandler`. Ese handler registra o procesa el fallo, pero no aporta persistencia ni reintento por sí mismo. Este laboratorio verifica futuros, no un handler de métodos `void`.

**Cierra:** escribe en tu evidencia cómo distinguirías «encolado», «terminado» y «fallido» en RutaFlow sin informar entrega SMS a partir del nombre de un hilo.

#### Subtema 1.4 · Rechaza trabajo cuando no queda capacidad · 10 min

**Contexto:** si el proveedor tarda y siguen entrando solicitudes, la cola crece. Un ejecutor acotado obliga a decidir qué hacer cuando se llena; no garantiza que desaparezca la sobrecarga.

**Hazlo tú:** abre `src/main/java/academia/rutaflow/async/AsyncConfiguration.java`. El bean limita trabajadores y cola:

```java
executor.setCorePoolSize(2);
executor.setMaxPoolSize(2);
executor.setQueueCapacity(1);
executor.setThreadNamePrefix("notif-");
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
```

Ejecuta desde la carpeta del laboratorio:

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#dosActivasUnaEnColaYLaCuartaSeRechaza test
```

**Resultado esperado:** dos tareas esperan una señal, la tercera ocupa la única plaza de cola y una llamada adicional al servicio lanza `TaskRejectedException`. Al liberar la señal, las tareas aceptadas terminan. `CountDownLatch` coordina la prueba: una barrera confirma que ambos trabajadores entraron y otra permite salir. El timeout evita esperar indefinidamente; no mide rendimiento.

**Fallo deliberado:** cambia `setQueueCapacity(1)` a `setQueueCapacity(2)` en `AsyncConfiguration.java` y repite. **Diagnóstico:** la cuarta tarea ya cabe y la aserción de rechazo falla; restaura 1. No cambies la prueba para esconder la nueva capacidad.

**Entiende:** con dos trabajadores fijos y una plaza de espera puedes tener dos tareas ejecutándose y una pendiente. `AbortPolicy` hace visible el rechazo al intentar enviar. El llamante debe convertirlo en una respuesta controlada o guardar el trabajo mediante un mecanismo recuperable. Este ejecutor reside en memoria: un reinicio pierde trabajo pendiente. Para correo que deba recuperarse conserva el outbox de M8 T3; no lo sustituyas por `@Async`.

**Cierra:** como ejercicio independiente, usa tres trabajadores y dos plazas de cola. Adapta las barreras a tres tareas activas, encola dos y demuestra el rechazo de la sexta; ejecuta el test y justifica ese límite para un proveedor con capacidad conocida. No aceptes un número por imitación del ejemplo.

**Hito del tema:** conserva cuatro evidencias: cambio de hilo externo, auto-invocación diagnosticada, error observado mediante futuro y saturación con rechazo. Adjunta tu ejercicio independiente y una decisión para el proyecto integrador RutaFlow sobre qué trabajos pueden perderse al reiniciar y cuáles exigen outbox. Las cuatro pruebas no validan entrega SMS, carga productiva, propagación de contexto ni recuperación tras caída.

**Fuentes primarias:** [Spring Framework: ejecución, `@Async`, proxies y errores](https://docs.spring.io/spring-framework/reference/integration/scheduling.html), [Spring Boot: ejecución y scheduling](https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html). El siguiente bloque compara contratos de integración; conserva separados protocolo, ejecución y garantía de entrega.

### Tema 2: CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 1 h 20 min

**Prerrequisito:** Módulo 13 de este track (WebFlux y reactividad), JDK 25 (la versión del curso) y Maven.

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

**Executor con hilos virtuales (decisión).** `SimpleAsyncTaskExecutor` con `setVirtualThreads(true)` crea un hilo virtual nuevo por tarea en vez de reutilizar un pool acotado de hilos de plataforma, lo que evita agotar el pool cuando hay muchas tareas de E/S esperando (la misma decisión que el Módulo 13, Tema 3, «Cuándo WebFlux vale la complejidad, y R2DBC», pero aplicada aquí a un executor de `@Async` en vez de al servidor web). `setTaskDecorator(...)` se aplica sobre el mismo executor para resolver el problema del Tema 3 de este módulo.

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

### Tema 3: Locks, deadlocks, semáforos y MDC en concurrencia · Experto · 1 h 30 min

**Prerrequisito:** Tema 2 de este módulo.

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

Continúa en la carpeta del Tema 2 y agrega las clases de este tema.

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

### Tema 4: Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) · Avanzado · 40 min

Al terminar, podrás reintentar una llamada que falla de forma transitoria y limitar cuántos hilos ejecutan un método a la vez, usando solo anotaciones de Spring Framework 7, y decidir cuándo necesitas Resilience4j.

**¿Por qué es importante?** Un proveedor de tarifas que responde mal una vez de cada diez no justifica un error para el usuario; un generador de etiquetas que satura la impresora no debe recibir cien peticiones a la vez. Hasta Spring Framework 6 necesitabas Spring Retry o Resilience4j para ambos casos. Desde la versión 7, `@Retryable`, `@ConcurrencyLimit` y `RetryTemplate` vienen en el núcleo. Con virtual threads (Tema 1 de este módulo y Java M5) ya no hay un pool que limite la concurrencia, así que el límite debe ser explícito.

**Prerrequisitos:** Temas 1–3 de este módulo (`@Async`, autoinvocación y `Semaphore`) y el Tema 5 del Módulo 0 (proxies). Usa JDK 25 y Spring Boot 4.1.2.

#### Subtema X.1 · Activa los métodos resilientes y reintenta un fallo transitorio · 10 min

**Contexto:** RutaFlow cotiza con un proveedor externo que a veces responde "no disponible". Un reintento corto suele bastar.

**Hazlo tú:** en el proyecto de este módulo, crea en `src/main/java/com/example/demo/`:

```java
// ProveedorNoDisponible.java
package com.example.demo;

public class ProveedorNoDisponible extends RuntimeException {
    public ProveedorNoDisponible(String mensaje) { super(mensaje); }
}
```

```java
// ProveedorTarifas.java
package com.example.demo;

public interface ProveedorTarifas {
    long tarifa(String ruta);
}
```

```java
// ResilienciaConfig.java
package com.example.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.resilience.annotation.EnableResilientMethods;

@Configuration
@EnableResilientMethods
public class ResilienciaConfig { }
```

```java
// CotizadorConReintento.java
package com.example.demo;

import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class CotizadorConReintento {
    private final ProveedorTarifas proveedor;

    public CotizadorConReintento(ProveedorTarifas proveedor) { this.proveedor = proveedor; }

    @Retryable(includes = ProveedorNoDisponible.class, maxRetries = 2, delay = 50)
    public long cotizar(String ruta) {
        return proveedor.tarifa(ruta);
    }
}
```

Crea `src/test/java/com/example/demo/CotizadorConReintentoTest.java`:

```java
package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class CotizadorConReintentoTest {
    @Autowired CotizadorConReintento cotizador;
    @MockitoBean ProveedorTarifas proveedor;

    @Test
    void reintentaHastaQueElProveedorResponde() {
        when(proveedor.tarifa("MED-ENV"))
            .thenThrow(new ProveedorNoDisponible("intento 1"))
            .thenThrow(new ProveedorNoDisponible("intento 2"))
            .thenReturn(9_000L);

        assertEquals(9_000L, cotizador.cotizar("MED-ENV"));
        verify(proveedor, times(3)).tarifa("MED-ENV");
    }

    @Test
    void agotaLosReintentosYPropagaElUltimoError() {
        when(proveedor.tarifa("MED-BOG")).thenThrow(new ProveedorNoDisponible("caído"));

        assertThrows(ProveedorNoDisponible.class, () -> cotizador.cotizar("MED-BOG"));
        verify(proveedor, times(3)).tarifa("MED-BOG");
    }
}
```

Ejecuta `./mvnw -q -Dtest=CotizadorConReintentoTest test`.

**Resultado esperado:** dos pruebas verdes: 3 llamadas en total en ambos casos (1 intento inicial + `maxRetries = 2`).

**Fallo deliberado:** quita `@EnableResilientMethods` de `ResilienciaConfig`. **Error esperado:** la primera prueba falla con `ProveedorNoDisponible: intento 1`. **Diagnóstico:** sin esa anotación nadie registra el `BeanPostProcessor` que crea el proxy de reintento; la anotación `@Retryable` queda como un comentario. Restáurala.

**Entiende:** total de intentos = 1 + `maxRetries`. Por defecto, `@Retryable` reintenta ante **cualquier** excepción, 3 veces, con 1 s de espera; aquí lo restringes a `ProveedorNoDisponible` para no reintentar errores de programación. Agotados los intentos, se propaga la **última** excepción original.

**Cierra:** guarda la salida y escribe por qué `includes` es parte del diseño, no un detalle.

#### Subtema X.2 · Configura espera exponencial y comprueba qué no se reintenta · 10 min

**Contexto:** reintentar inmediatamente contra un proveedor saturado lo satura más. La espera debe crecer y tener un tope, con algo de azar (*jitter*) para que muchas instancias no reintenten a la vez.

**Hazlo tú:** cambia la anotación por:

```java
@Retryable(includes = ProveedorNoDisponible.class,
           maxRetries = 3, delay = 50, multiplier = 2, maxDelay = 400, jitter = 10)
```

Añade al test una prueba con un error que **no** debe reintentarse:

```java
@Test
void unErrorDeDatosNoSeReintenta() {
    when(proveedor.tarifa("RUTA-RARA")).thenThrow(new IllegalArgumentException("ruta inválida"));

    assertThrows(IllegalArgumentException.class, () -> cotizador.cotizar("RUTA-RARA"));
    verify(proveedor, times(1)).tarifa("RUTA-RARA");
}
```

Actualiza los `times(3)` de las pruebas anteriores al nuevo total y ejecuta.

**Resultado esperado:** verde; los dos primeros casos ahora hacen 4 llamadas (1 + 3) y el error de datos solo una. La espera entre intentos es aproximadamente 50, 100 y 200 ms, con hasta 10 ms de variación.

**Fallo deliberado:** quita `includes = ProveedorNoDisponible.class`. **Error esperado:** `unErrorDeDatosNoSeReintenta` falla: `Wanted 1 time ... But was 4 times`. **Diagnóstico:** sin `includes`, se reintenta toda excepción, incluso las que nunca se arreglarán solas. Restaura `includes`.

**Entiende:** reintenta solo operaciones **idempotentes** (que pueden repetirse sin duplicar efectos) y fallos **transitorios**. Si el método también es `@Transactional`, el reintento envuelve a la transacción: cada intento corre en una transacción nueva. Para reintentar un bloque de código sin anotaciones existe `RetryTemplate` con `RetryPolicy.builder()`.

**Cierra:** anota qué errores de RutaFlow reintentarías y cuáles no.

#### Subtema X.3 · Limita la concurrencia con `@ConcurrencyLimit` · 10 min

**Contexto:** la impresora de etiquetas acepta dos trabajos a la vez. Con virtual threads, cien peticiones pueden llegar juntas al mismo método.

**Hazlo tú:** crea `src/main/java/com/example/demo/GeneradorEtiquetas.java`:

```java
package com.example.demo;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.resilience.annotation.ConcurrencyLimit;
import org.springframework.stereotype.Service;

@Service
public class GeneradorEtiquetas {
    private final AtomicInteger activos = new AtomicInteger();
    private final AtomicInteger maximo = new AtomicInteger();

    @ConcurrencyLimit(2)
    public void generar(String envio) throws InterruptedException {
        int ahora = activos.incrementAndGet();
        maximo.accumulateAndGet(ahora, Math::max);
        try {
            Thread.sleep(50);
        } finally {
            activos.decrementAndGet();
        }
    }

    public int maximoObservado() { return maximo.get(); }
}
```

Crea `src/test/java/com/example/demo/GeneradorEtiquetasTest.java`:

```java
package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class GeneradorEtiquetasTest {
    @Autowired GeneradorEtiquetas generador;

    @Test
    void nuncaHayMasDeDosTrabajosALaVez() {
        try (var hilos = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 20; i++) {
                String envio = "RF-" + i;
                hilos.submit(() -> { generador.generar(envio); return null; });
            }
        }
        assertTrue(generador.maximoObservado() <= 2,
            "máximo observado: " + generador.maximoObservado());
    }
}
```

Ejecuta `./mvnw -q -Dtest=GeneradorEtiquetasTest test`.

**Resultado esperado:** verde; el máximo observado es 2. Las veinte tareas terminan, porque las sobrantes **esperan** su turno (no se rechazan).

**Fallo deliberado:** cambia la llamada del test para que pase por un método interno: añade a `GeneradorEtiquetas` un método `generarLote(String envio)` que llame a `generar(envio)` y úsalo en el test. **Error esperado:** `máximo observado: 20` (o cercano). **Diagnóstico:** autoinvocación otra vez: la llamada interna no cruza el proxy. Vuelve a llamar a `generar` desde fuera.

**Entiende:** `@ConcurrencyLimit` funciona como un `Semaphore` declarativo (Tema 3): bloquea a los hilos sobrantes hasta que se libera un permiso. Con `@ConcurrencyLimit(1)` el método queda serializado para ese bean. **Límite:** el límite es por instancia de la aplicación; con tres réplicas habrá hasta seis trabajos simultáneos en total.

**Cierra:** guarda la salida y calcula el máximo global para tus réplicas.

#### Subtema X.4 · Decide entre el núcleo de Spring y Resilience4j · 6 min

**Contexto:** el Módulo 16 usa Resilience4j para `CircuitBreaker`, `Bulkhead` y `RateLimiter`. No necesitas ambos para todo.

**Hazlo tú:** completa la tabla para RutaFlow:

| Necesidad | Núcleo de Spring 7 | Resilience4j | Tu elección |
|---|---|---|---|
| Reintento con espera exponencial | `@Retryable`, `RetryTemplate` | `Retry` | |
| Limitar llamadas simultáneas | `@ConcurrencyLimit` (espera) | `Bulkhead` (puede rechazar al instante) | |
| Dejar de llamar a un servicio caído | no existe | `CircuitBreaker` | |
| Limitar llamadas por segundo | no existe | `RateLimiter` | |
| Métricas de cada mecanismo | eventos `MethodRetryEvent` | integración con Micrometer | |

**Resultado esperado:** una elección justificada por fila.

**Fallo deliberado:** intenta resolver "dejar de llamar a un servicio caído" solo con `@Retryable` y muchos reintentos. **Diagnóstico:** cada petición de usuario seguirá esperando todos los reintentos contra un servicio que ya sabes caído; eso es exactamente lo que evita un circuit breaker.

**Entiende:** usa el núcleo cuando basten reintento y límite de concurrencia: menos dependencias y la misma semántica de proxies. Añade Resilience4j cuando necesites cortar el circuito, limitar por tasa o rechazar en lugar de esperar.

**Cierra:** enlaza esta tabla desde el ADR de resiliencia del proyecto (Módulo 15).

**Ejercicio:** reescribe el reintento del Subtema X.1 de forma programática con `RetryTemplate`, sin anotaciones, para una llamada que se construye en tiempo de ejecución. Escribe primero qué clase define la política.

<details>
<summary>Solución</summary>

```java
import java.time.Duration;
import org.springframework.core.retry.RetryPolicy;
import org.springframework.core.retry.RetryTemplate;

RetryPolicy politica = RetryPolicy.builder()
    .includes(ProveedorNoDisponible.class)
    .maxRetries(2)
    .delay(Duration.ofMillis(50))
    .build();
var reintentos = new RetryTemplate(politica);

long tarifa = reintentos.invoke(() -> proveedor.tarifa("MED-ENV"));
```

`invoke` propaga la última excepción original sin envolverla; `execute` lanza una `RetryException` (checked) con todos los intentos, útil si debes registrar cada fallo. El builder usa `Duration`, mientras la anotación usa milisegundos.

</details>

**Hito del tema:**

- [ ] Reintenté un fallo transitorio con `@Retryable` y verifiqué 1 + `maxRetries` llamadas.
- [ ] Comprobé que un error de datos no se reintenta gracias a `includes`.
- [ ] Limité un método a dos ejecuciones simultáneas con `@ConcurrencyLimit` y virtual threads.
- [ ] Decidí qué cubre el núcleo de Spring y qué requiere Resilience4j.

**Fuentes oficiales:** [Spring Framework — Resilience Features](https://docs.spring.io/spring-framework/reference/core/resilience.html).

**Proyecto integrador:** aplica `@Retryable` al cliente de tarifas de RutaFlow y `@ConcurrencyLimit` al generador de etiquetas. **Límite:** el reintento multiplica la carga sobre el proveedor; mide con Micrometer (Módulo 7) antes de subir `maxRetries`.
