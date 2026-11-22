# Módulo 9: Concurrencia, @Async y resiliencia en el núcleo de Spring

## Aprende construyendo

Construirás cotizaciones que combinan llamadas asíncronas con `CompletableFuture`, descubrirás por qué `@Async` deja de funcionar cuando una clase se llama a sí misma, provocarás un deadlock real con dos locks tomados en orden inverso y lo corregirás con un orden consistente, y acotarás concurrencia con un `Semaphore`. El hilo conductor es RutaFlow cotizando tarifas de varios proveedores a la vez. El último tema usa lo que Spring Framework 7 trae en el núcleo para reintentar (`@Retryable`) y limitar concurrencia (`@ConcurrencyLimit`) sin dependencias extra.


### Dos ejemplos: primero visible, luego real

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por dos ejemplos: primero visible, luego real con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender dos ejemplos: primero visible, luego real te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dos ejemplos: primero visible, luego real como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que dos ejemplos: primero visible, luego real resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Dos ejemplos: primero visible, luego real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Dos ejemplos: primero visible, luego real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dos ejemplos: primero visible, luego real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dos ejemplos: primero visible, luego real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dos ejemplos: primero visible, luego real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dos ejemplos: primero visible, luego real en tu contexto?
2. ¿Cómo sabrías que dos ejemplos: primero visible, luego real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dos ejemplos: primero visible, luego real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar dos ejemplos: primero visible, luego real.

</details>

### Tema 1: @Async y ejecutores: trabajo en segundo plano con límites · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por @async y ejecutores: trabajo en segundo plano con límites con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender @async y ejecutores: trabajo en segundo plano con límites te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en @async y ejecutores: trabajo en segundo plano con límites como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que @async y ejecutores: trabajo en segundo plano con límites resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| @Async y ejecutores: trabajo en segundo plano con límites se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar @Async y ejecutores: trabajo en segundo plano con límites | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Contexto: si el proveedor tarda y siguen entrando solicitudes, la cola crece. Un ejecutor acotado obliga a decidir qué hacer cuando se llena; no garantiza que desaparezca la sobrecarga.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: @async y ejecutores: trabajo en segundo plano con límites funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- @Async y ejecutores: trabajo en segundo plano con límites existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve @async y ejecutores: trabajo en segundo plano con límites en tu contexto?
2. ¿Cómo sabrías que @async y ejecutores: trabajo en segundo plano con límites no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar @async y ejecutores: trabajo en segundo plano con límites?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
cp -R spring-async-rutaflow practica-async
cd practica-async
./mvnw -q clean test
```

```java
@Async("notificaciones")
public CompletableFuture<String> enviar(String guia) {
    if (guia.isBlank()) throw new IllegalArgumentException("Guía vacía");
    return CompletableFuture.completedFuture(Thread.currentThread().getName());
}
```

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#llamadaExternaCambiaDeHilo test
```

```java
public CompletableFuture<String> enviarDesdeDentro(String guia) {
    return this.enviar(guia);
}
```

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#autoInvocacionConservaElHiloActual test
```

```bash
./mvnw -q -Dtest=AsyncBehaviorTest#errorDelTrabajoLlegaPorElFuture test
```

</details>

### Tema 2: CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por completablefuture, @async y el bug de la autoinvocación con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender completablefuture, @async y el bug de la autoinvocación te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en completablefuture, @async y el bug de la autoinvocación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que completablefuture, @async y el bug de la autoinvocación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| CompletableFuture, @Async y el bug de la autoinvocación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar CompletableFuture, @Async y el bug de la autoinvocación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses completablefuture, @async y el bug de la autoinvocación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: completablefuture, @async y el bug de la autoinvocación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- CompletableFuture, @Async y el bug de la autoinvocación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve completablefuture, @async y el bug de la autoinvocación en tu contexto?
2. ¿Cómo sabrías que completablefuture, @async y el bug de la autoinvocación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar completablefuture, @async y el bug de la autoinvocación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o concurrencia.zip && unzip -o concurrencia.zip -d concurrencia
```

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

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```

</details>

### Tema 3: Locks, deadlocks, semáforos y MDC en concurrencia · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por locks, deadlocks, semáforos y mdc en concurrencia con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender locks, deadlocks, semáforos y mdc en concurrencia te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en locks, deadlocks, semáforos y mdc en concurrencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que locks, deadlocks, semáforos y mdc en concurrencia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Locks, deadlocks, semáforos y MDC en concurrencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Locks, deadlocks, semáforos y MDC en concurrencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses locks, deadlocks, semáforos y mdc en concurrencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: locks, deadlocks, semáforos y mdc en concurrencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Locks, deadlocks, semáforos y MDC en concurrencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve locks, deadlocks, semáforos y mdc en concurrencia en tu contexto?
2. ¿Cómo sabrías que locks, deadlocks, semáforos y mdc en concurrencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar locks, deadlocks, semáforos y mdc en concurrencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
public class CuentaRuta {
    private final String id;
    private BigDecimal saldo;
    private final ReentrantLock lock = new ReentrantLock();
    // id, saldo, sumar(monto), restar(monto), getLock()
}
```

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

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```

</details>

### Tema 4: Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) en tu contexto?
2. ¿Cómo sabrías que resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar resiliencia en el núcleo: `@retryable` y `@concurrencylimit` (spring framework 7)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```java
@Retryable(includes = ProveedorNoDisponible.class,
           maxRetries = 3, delay = 50, multiplier = 2, maxDelay = 400, jitter = 10)
```

</details>
