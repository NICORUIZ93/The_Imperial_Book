# Módulo 7 · Resiliencia y tolerancia a fallos en Tienda Aurora

En distribución, el fallo parcial es normal: un servicio lento, una red inestable o una dependencia caída no son excepciones raras. Resiliencia significa diseñar degradación controlada, no asumir disponibilidad perfecta. Este módulo cubre Resilience4j, timeouts, bulkheads, fallbacks y chaos engineering con criterio operativo, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los smokes validan la lógica de breaker/retry/timeout/bulkhead/fallback en Java puro. Resilience4j, Spring Boot Actuator y Toxiproxy requieren dependencias e infraestructura; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-resilience

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

### Estructura del proyecto

```text
tienda-aurora-resilience/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/aurora/resilience/
│   │   │   ├── ResilienceApplication.java
│   │   │   ├── client/InventoryClient.java
│   │   │   ├── config/ResilienceConfig.java
│   │   │   └── dto/StockView.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/aurora/resilience/
│           └── ResilienceExampleTest.java
└── docker-compose.yml
```

### build.gradle.kts

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.github.resilience4j:resilience4j-spring-boot3:2.2.0")
    implementation("org.springframework.boot:spring-boot-starter-aop")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.wiremock:wiremock-standalone:3.9.0")
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-resilience"
```

### application.yml

```yaml
spring:
  application:
    name: resilience-service

resilience4j:
  circuitbreaker:
    instances:
      inventory:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
  retry:
    instances:
      inventory:
        maxAttempts: 3
        waitDuration: 200ms
        retryExceptions:
          - java.io.IOException
  timelimiter:
    instances:
      inventory:
        timeoutDuration: 1s
  bulkhead:
    instances:
      inventory:
        maxConcurrentCalls: 20

server:
  port: 8080
```

### Código completo

**Archivo:** `src/main/java/com/aurora/resilience/dto/StockView.java`

```java
package com.aurora.resilience.dto;

public record StockView(String productId, int available, boolean known) {
    public static StockView unknown(String productId) {
        return new StockView(productId, 0, false);
    }
}
```

**Archivo:** `src/main/java/com/aurora/resilience/client/InventoryClient.java`

```java
package com.aurora.resilience.client;

import com.aurora.resilience.dto.StockView;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class InventoryClient {

    public CompletableFuture<StockView> getStock(String productId) {
        return CompletableFuture.supplyAsync(() -> remoteCall(productId));
    }

    private StockView remoteCall(String productId) {
        // Llamada HTTP real a inventory-service
        // Simulada aquí para el ejemplo
        if (Math.random() < 0.3) throw new RuntimeException("Service unavailable");
        return new StockView(productId, 10, true);
    }

    public CompletableFuture<StockView> fallback(String productId, Exception ex) {
        return CompletableFuture.completedFuture(StockView.unknown(productId));
    }
}
```

**Archivo:** `src/main/java/com/aurora/resilience/ResilienceApplication.java`

```java
package com.aurora.resilience;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ResilienceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResilienceApplication.class, args);
    }
}
```

### Tema 1: Circuit breaker, retry, rate limiter, bulkhead, time limiter · Avanzado · 180 min

## El problema: una dependencia lenta tumba un flujo completo

Tienda Aurora depende de `inventory-service` para confirmar stock. Un martes, `inventory-service` empieza a responder en 8 segundos. `order-service` sigue esperando, sus hilos se agotan, y ahora tampoco puede atender pedidos que no necesitan inventario. Una dependencia lenta tumbó un flujo completo. Reintentar a ciegas empeora el problema: si el servicio está caído, cada reintento agrega carga. Necesitas límites, no esperanza.

## La idea clave: patrones como tablero eléctrico

Piensa en el tablero eléctrico de una casa. El circuit breaker corta la corriente cuando detecta una falla. El retry es volver a encender un interruptor, pero solo si tiene sentido y con espera. El rate limiter es la válvula que limita cuánta agua pasa por minuto. El bulkhead son los compartimentos estancos de un barco: una filtración no hunde toda la nave. El time limiter es el temporizador que apaga el horno si nadie lo atiende.

Ningún patrón basta solo. Un retry sin timeout puede bloquear hilos. Un breaker sin fallback solo devuelve error más rápido. La resiliencia es una composición de patrones con criterio.

```mermaid
flowchart LR
  R[Request] --> TL[Time Limiter]
  TL --> BH[Bulkhead]
  BH --> RL[Rate Limiter]
  RL --> CB{Circuit Breaker}
  CB -->|cerrado| S[Servicio remoto]
  CB -->|abierto| F[Fallback seguro]
  S -->|falla transitoria| RT[Retry con backoff]
  RT --> S
```

## Construyendo la solución con Resilience4j

Tienda Aurora usa Gradle. El `build.gradle.kts` de `orders-service` incluye Resilience4j (ver arriba). La configuración en `application.yml` define límites conservadores. El cliente de inventario aplica los patrones con fallback seguro.

El breaker abre cuando la tasa de fallos supera el umbral. `@Retry` solo aplica a excepciones transitorias configuradas. El fallback devuelve una respuesta segura, no inventa stock. El time limiter evita esperar indefinidamente. El bulkhead aísla la capacidad para que una dependencia lenta no agote todos los hilos.

## Verificando con un experimento

El siguiente smoke modela la lógica de decisión de Resilience4j (breaker, retry, timeout, bulkhead, fallback) en Java puro. Representa el comportamiento de los patrones sin Resilience4j real.

```java
public class ResilienceExample {
    static String breaker(boolean open) { return open ? "fallback" : "call"; }
    static boolean retryable(int status) { return status == 503 || status == 429; }
    static String withTimeout(int timeoutMs, int remoteMs) {
        return remoteMs <= timeoutMs ? "ok" : "timeout->fallback";
    }
    static boolean bulkheadAllowed(int current, int max) { return current < max; }

    public static void main(String[] args) {
        System.out.println("breaker-open=" + breaker(true));
        System.out.println("retryable-503=" + retryable(503));
        System.out.println("retryable-400=" + retryable(400));
        System.out.println("timeout-ok=" + withTimeout(1000, 300));
        System.out.println("timeout-fallback=" + withTimeout(1000, 2000));
        System.out.println("bulkhead-allowed=" + bulkheadAllowed(19, 20));
        System.out.println("bulkhead-rejected=" + bulkheadAllowed(20, 20));
    }
}
```

```bash
javac ResilienceExample.java
java ResilienceExample
```

Salida esperada:

```text
breaker-open=fallback
retryable-503=true
retryable-400=false
timeout-ok=ok
timeout-fallback=timeout->fallback
bulkhead-allowed=true
bulkhead-rejected=false
```

El experimento real consiste en: bajar `timeoutDuration` a `100ms` con un servicio que tarda 300ms y observar fallos por timeout y activación del fallback. Cambiar `maxAttempts` a `5` sin backoff en un servicio caído y observar tormenta de reintentos en métricas. Abrir el breaker y verificar que la llamada falla rápido.

### Tema 2: Timeouts en cascada · Avanzado · 120 min

## Timeouts en cascada

`checkout-service` llama a `order-service`, que llama a `payment-service`. `payment-service` tarda 10 segundos. El cliente ya canceló a los 2 segundos, pero los servicios internos siguen ocupados esperando. El sistema hace trabajo inútil y agota hilos.

Un timeout budget reparte el tiempo total entre saltos: cada servicio recibe un límite y lo respeta. Si el cliente tiene 2s, checkout recibe 1.8s, order 1.2s, payment 800ms. Si payment excede 800ms, se corta y se devuelve error controlado.

```java
public class TimeoutBudgetExample {
    static boolean withinBudget(int totalMs, int a, int b, int c) {
        return (a + b + c) <= totalMs;
    }

    public static void main(String[] args) {
        System.out.println("budget-ok=" + withinBudget(2000, 200, 800, 800));
        System.out.println("budget-exceeded=" + withinBudget(2000, 500, 800, 800));
    }
}
```

```bash
javac TimeoutBudgetExample.java
java TimeoutBudgetExample
```

Salida esperada:

```text
budget-ok=true
budget-exceeded=false
```

El error más común es timeout mayor que el del cliente. El síntoma es trabajo inútil tras cancelación. La causa son budgets desalineados. La corrección es propagar deadline/budget y configurar connect/read/request timeout.

### Tema 3: Fallback strategies · Intermedio · 120 min

## Fallback strategies

El servicio de recomendaciones cae. El usuario intenta comprar café en Tienda Aurora y el checkout falla completo, aunque las recomendaciones no son necesarias para pagar. Una dependencia opcional tumbó un flujo crítico.

Un fallback es como el cajero que, cuando el sommelier no está disponible, te cobra el café y omite la recomendación. Preserva lo esencial. Un fallback bueno preserva la experiencia crítica y hace visible la degradación. Un fallback malo oculta fallos y viola reglas de negocio.

```java
import java.util.*;

public class FallbackExample {
    static List<String> recommend(boolean fail) {
        if (fail) return List.of(); // fallback: lista vacía
        return List.of("cafe", "taza");
    }

    public static void main(String[] args) {
        System.out.println("fallback-size=" + recommend(true).size());
        System.out.println("normal-size=" + recommend(false).size());
    }
}
```

```bash
javac FallbackExample.java
java FallbackExample
```

Salida esperada:

```text
fallback-size=0
normal-size=2
```

Si recomendaciones falla, checkout muestra catálogo sin personalización. Si pagos falla, checkout devuelve error controlado y no confirma el pedido. El error más común es fallback que viola negocio: aprobar un pago, confirmar stock inexistente o autorizar acceso.

### Tema 4: Chaos engineering · Avanzado · 120 min

## Chaos engineering

Tienes circuit breakers, timeouts y fallbacks configurados. Nadie sabe si funcionan. El primer incidente real ocurre en Black Friday, y descubres que el fallback no estaba conectado.

Chaos engineering es como un simulacro de incendio. No enciendes el edificio; pruebas que la alarma suena, las rutas de salida funcionan y la gente sabe actuar. Inyectas fallos controlados para validar hipótesis.

```java
public class ChaosExample {
    static String outcome(boolean timeoutInjected, boolean fallback) {
        if (timeoutInjected && fallback) return "degraded";
        if (timeoutInjected) return "error";
        return "ok";
    }

    public static void main(String[] args) {
        System.out.println("with-fallback=" + outcome(true, true));
        System.out.println("without-fallback=" + outcome(true, false));
    }
}
```

```bash
javac ChaosExample.java
java ChaosExample
```

Salida esperada:

```text
with-fallback=degraded
without-fallback=error
```

El primer caso es la resiliencia funcionando: degradación controlada. El segundo es la deuda de resiliencia: sin fallback, el fallo se propaga. Chaos engineering convierte la resiliencia en evidencia.

## Cierre

La resiliencia no es un decorador: es un presupuesto de fallos. Timeouts, breakers, retries, bulkheads y fallbacks deben configurarse con métricas, probarse con caos controlado y revisarse cuando cambia el sistema. La ficha rápida del capítulo anterior protegía lecturas; aquí aprendiste a proteger la cadena de llamadas cuando el mundo real falla.

## Checklist

- Timeout en toda llamada remota.
- Retry solo en fallos transitorios idempotentes.
- Fallback seguro y observable.
- Bulkhead/rate limit donde hay saturación.
- Experimentos de chaos con hipótesis y abort conditions.
- Nota de verificación honesta cuando falta infra.
