# Módulo 5 · Caché distribuido con Redis en Tienda Aurora

Tienda Aurora tiene un catálogo de 50.000 productos. Cada vez que un usuario abre la página de un producto, el servicio consulta PostgreSQL. Con 10.000 usuarios concurrentes viendo los mismos 500 productos populares, la base de datos ejecuta la misma consulta miles de veces por segundo. El síntoma es latencia creciente y CPU de base de datos al 90%. La causa es que el sistema no recuerda lo que ya leyó. La solución no es comprar un servidor más grande: es guardar el resultado en memoria y servirlo sin tocar la base de datos.

Redis es una base de datos en memoria que sirve datos en microsegundos. Spring Cache abstrae el acceso a Redis mediante anotaciones: `@Cacheable` lee del caché o ejecuta el método y guarda el resultado; `@CacheEvict` elimina una entrada cuando los datos cambian. El TTL (time to live) define cuánto tiempo vive un dato en caché antes de expirar automáticamente.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2, Redis 7.x (Docker), Spring Boot 3.5.0. Los smokes ejecutan lógica de cache, TTL, locks, fencing y stampede en Java puro. Redis y Spring Cache reales requieren infraestructura; se incluyen notas de verificación honestas.

### Tema 1: @Cacheable, @CacheEvict y TTL · Intermedio · 180 min

## Proyecto desde cero: tienda-aurora-cache

## Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x (o usar wrapper)
docker --version  # Docker 24+ (para Redis)
```

## Estructura del proyecto

```text
tienda-aurora-cache/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/aurora/cache/
│   │   │   ├── CacheApplication.java
│   │   │   ├── config/CacheConfig.java
│   │   │   ├── domain/Product.java
│   │   │   ├── dto/ProductDto.java
│   │   │   ├── repository/ProductRepository.java
│   │   │   └── service/ProductService.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/aurora/cache/
│           └── ProductServiceTest.java
└── docker-compose.yml
```

## build.gradle.kts

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
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.postgresql:postgresql")
    implementation("com.fasterxml.jackson.core:jackson-databind")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:junit-jupiter")
}

tasks.test {
    useJUnitPlatform()
}
```

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-cache"
```

## docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: aurora
      POSTGRES_USER: aurora
      POSTGRES_PASSWORD: aurora
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aurora
    username: aurora
    password: aurora
  jpa:
    hibernate:
      ddl-auto: validate
  data:
    redis:
      host: localhost
      port: 6379
  cache:
    type: redis

server:
  port: 8080
```

## Código completo

**Archivo:** `src/main/java/com/aurora/cache/domain/Product.java`

```java
package com.aurora.cache.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private int stock;

    protected Product() {}

    public Product(String id, String name, String description, double price, int stock) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }
    public void setPrice(double price) { this.price = price; }
    public void setStock(int stock) { this.stock = stock; }
}
```

**Archivo:** `src/main/java/com/aurora/cache/dto/ProductDto.java`

```java
package com.aurora.cache.dto;

public record ProductDto(String id, String name, String description, double price, int stock) {}
```

**Archivo:** `src/main/java/com/aurora/cache/repository/ProductRepository.java`

```java
package com.aurora.cache.repository;

import com.aurora.cache.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {}
```

**Archivo:** `src/main/java/com/aurora/cache/config/CacheConfig.java`

```java
package com.aurora.cache.config;

import com.aurora.cache.dto.ProductDto;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        Map<String, RedisCacheConfiguration> configs = Map.of(
            "products", defaultConfig.entryTtl(Duration.ofMinutes(5)),
            "prices", defaultConfig.entryTtl(Duration.ofSeconds(30))
        );

        return RedisCacheManager.builder(factory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(configs)
            .build();
    }
}
```

**Archivo:** `src/main/java/com/aurora/cache/service/ProductService.java`

```java
package com.aurora.cache.service;

import com.aurora.cache.domain.Product;
import com.aurora.cache.dto.ProductDto;
import com.aurora.cache.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = "products", key = "#productId", unless = "#result == null")
    public ProductDto findById(String productId) {
        return repository.findById(productId)
            .map(p -> new ProductDto(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStock()))
            .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
    }

    @CacheEvict(value = "products", key = "#productId")
    public ProductDto update(String productId, double newPrice) {
        Product product = repository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
        product.setPrice(newPrice);
        Product updated = repository.save(product);
        return new ProductDto(updated.getId(), updated.getName(), updated.getDescription(), updated.getPrice(), updated.getStock());
    }
}
```

**Archivo:** `src/main/java/com/aurora/cache/NotFoundException.java`

```java
package com.aurora.cache;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}
```

**Archivo:** `src/main/java/com/aurora/cache/CacheApplication.java`

```java
package com.aurora.cache;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CacheApplication {
    public static void main(String[] args) {
        SpringApplication.run(CacheApplication.class, args);
    }
}
```

## Ejecutar

```bash
# 1. Levantar PostgreSQL y Redis
docker compose up -d

# 2. Esperar a que estén listos
docker compose ps

# 3. Crear tabla y datos de prueba
docker exec -it $(docker compose ps -q postgres) psql -U aurora -d aurora -c "
CREATE TABLE products (id VARCHAR(50) PRIMARY KEY, name VARCHAR(200), description TEXT, price DOUBLE PRECISION, stock INT);
INSERT INTO products VALUES ('p1', 'Café Aurora', 'Café de origen', 12.50, 100);
INSERT INTO products VALUES ('p2', 'Taza Aurora', 'Taza cerámica', 8.00, 50);
"

# 4. Compilar y ejecutar
./gradlew bootRun

# 5. Probar
curl http://localhost:8080/products/p1   # primera: MISS (BD, ~80ms)
curl http://localhost:8080/products/p1   # segunda: HIT (Redis, ~2ms)
```

Salida esperada en logs:

```text
# Primera request
DEBUG: Cache miss for key 'p1' in cache 'products' -> querying DB
# Segunda request
DEBUG: Cache hit for key 'p1' in cache 'products'
```

## Por qué Redis resuelve el problema

Redis almacena datos en memoria principal, lo que lo hace órdenes de magnitud más rápido que cualquier base de datos en disco. Para Tienda Aurora, Redis sirve como caché de lectura para el catálogo: cuando un usuario consulta un producto, el servicio busca primero en Redis; si no está, consulta PostgreSQL, guarda el resultado en Redis con TTL de 5 minutos y responde al usuario.

La pregunta que un arquitecto debe responder antes de cachear es: ¿cuánta frescura necesita el dato? Un catálogo de productos puede tolerar 5 minutos de stale. Un precio en Black Friday puede requerir invalidación inmediata. Un stock disponible no debería cachearse sin invalidación por evento.

#### Tema 2: Read-through, write-through, write-behind · Avanzado · 120 min

### Tema 2: Read-through, write-through, write-behind · Avanzado · 120 min

## Patrones de caché: Cache-Aside, Read-Through, Write-Through y Write-Behind

El patrón Cache-Aside (`@Cacheable`) deja la responsabilidad de cargar el caché a la aplicación. Pero hay otros patrones con trade-offs distintos.

**Cache-Aside** (default en Spring): la aplicación busca en caché; en miss, busca en BD y guarda en caché. Control total, invalidación manual.

**Read-Through**: el caché carga automáticamente en miss. Requiere loader. Útil cuando la lógica de carga es simple.

**Write-Through**: escritura sincrónica en caché y BD. Consistencia fuerte, latencia de escritura = caché + BD. Útil cuando la consistencia caché-DB es crítica.

**Write-Behind**: escritura en caché inmediata, persistencia asíncrona. Baja latencia de escritura, riesgo de pérdida. No apropiado para datos financieros.

En Tienda Aurora, el catálogo usa Cache-Aside con TTL de 5 minutos. Para stock, se evalúa Write-Through porque la consistencia caché-DB es crítica durante promociones.

#### Tema 3: Distributed locking y fencing tokens · Avanzado · 120 min

### Tema 3: Distributed locking y fencing tokens · Avanzado · 120 min

## Distributed locking y fencing tokens

Cuando dos instancias de Tienda Aurora intentan actualizar el mismo producto simultáneamente, el caché y la BD pueden quedar inconsistentes. Un distributed lock garantiza que solo una instancia modifica el recurso a la vez. Redis implementa locks con `SET NX EX` (set if not exists, with expiry). Pero un lock sin protección contra expiración es peligroso: si el proceso que tiene el lock se bloquea, el lock expira y otro proceso lo toma, resultando en dos escrituras concurrentes.

El fencing token es la solución: cada vez que se adquiere un lock, se genera un token monótonamente creciente. El recurso (BD) verifica que el token del escritor sea mayor que el último token aplicado. Si un proceso lento intenta escribir con un token viejo, la BD lo rechaza.

La construcción con Redis usa `SET key value NX EX ttl` para adquirir el lock y un token incremental. El recurso (BD) almacena el último token aplicado y rechaza escrituras con token menor.

El error más común es usar lock sin expiry. El síntoma es deadlock si el proceso cae. La causa es no tener TTL. La corrección es `SET NX EX` con TTL corto. La señal observable es lock que nunca se libera.

#### Tema 4: Cache stampede y mitigaciones · Avanzado · 120 min

### Tema 4: Cache stampede y mitigaciones · Avanzado · 120 min

## Cache stampede y mitigaciones

Cuando el TTL de un caché popular expira, cientos de requests simultáneas golpean la base de datos al mismo tiempo. Este fenómeno se llama cache stampede (o thundering herd). Si el endpoint de producto recibe 1000 req/s y el caché expira, las 1000 requests ejecutan la query a BD simultáneamente, saturándola.

Las mitigaciones principales son:

**Mutex por clave:** solo una request consulta la BD; las demás esperan el resultado. Se implementa con `ConcurrentHashMap<String, Lock>` en memoria (una instancia) o Redis lock (múltiples instancias).

**TTL con jitter:** agregar variación aleatoria al TTL para que las expiraciones se dispersen. Simple y efectivo para cachés con muchas claves similares.

**Stale-while-revalidate:** servir el valor stale mientras se recalcula en background. Ideal cuando la frescura no es crítica.

**Refresh-ahead:** recalcular el valor antes de que expire, con probabilidad creciente. Útil cuando el recálculo es predecible.

La elección depende de la tolerancia a stale y la concurrencia. Mutex por clave es la mitigación más directa para cachés de alta concurrencia con TTL corto.

## Verificación

La lógica de decisión de caché (hit/miss/expired) se puede verificar sin Redis:

```java
public class CacheDecisionExample {
    static String cache = null;
    static long expiry = 0;

    static String get(String key, long now, long ttlMs, java.util.function.Supplier<String> dbQuery) {
        if (cache != null && now < expiry) return "HIT:" + cache;
        cache = dbQuery.get();
        expiry = now + ttlMs;
        return "MISS:" + cache;
    }

    public static void main(String[] args) {
        System.out.println(get("p1", 0, 5000, () -> "product-42"));
        System.out.println(get("p1", 1000, 5000, () -> "product-42"));
        System.out.println(get("p1", 6000, 5000, () -> "product-42"));
    }
}
```

```bash
javac CacheDecisionExample.java
java CacheDecisionExample
```

Salida esperada:

```text
MISS:product-42
HIT:product-42
MISS:product-42
```

El primer acceso es MISS (consulta BD). El segundo es HIT (cache). El tercero es MISS porque el TTL de 5000ms expiró.

La lógica de mutex por clave para mitigar stampede:

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class StampedeExample {
    static Map<String, String> cache = new ConcurrentHashMap<>();
    static Map<String, AtomicLong> dbHits = new ConcurrentHashMap<>();
    static Map<String, Lock> locks = new ConcurrentHashMap<>();

    static String get(String key) {
        String cached = cache.get(key);
        if (cached != null) return "HIT:" + cached;

        Lock lock = locks.computeIfAbsent(key, k -> new ReentrantLock());
        boolean acquired = lock.tryLock();
        if (acquired) {
            try {
                dbHits.computeIfAbsent(key, k -> new AtomicLong()).incrementAndGet();
                String value = "db-value-" + key;
                cache.put(key, value);
                return "MISS-DB:" + value;
            } finally {
                lock.unlock();
            }
        } else {
            try { Thread.sleep(50); } catch (InterruptedException ignored) {}
            String v = cache.get(key);
            return v != null ? "WAIT-HIT:" + v : "WAIT-MISS";
        }
    }

    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(4);
        List<Future<String>> futures = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            futures.add(ex.submit(() -> get("product-42")));
        }
        for (Future<String> f : futures) {
            System.out.println(f.get());
        }
        System.out.println("db-hits=" + dbHits.get("product-42").get());
        ex.shutdown();
    }
}
```

```bash
javac StampedeExample.java
java StampedeExample
```

Salida esperada:

```text
MISS-DB:db-value-product-42
WAIT-HIT:db-value-product-42
WAIT-HIT:db-value-product-42
WAIT-HIT:db-value-product-42
db-hits=1
```

Solo 1 request consulta la BD; las otras 3 esperan y leen del caché.

**Nota de verificación:** no se ejecutó Redis ni Spring Cache real. Verificación propuesta: Spring Boot app con Redis (Docker), dos requests consecutivas midiendo latencia con Actuator/Micrometer, y load test con Gatling/k6 midiendo DB hits por expiración de TTL.

## Cierre

El caché distribuido con Redis resuelve el problema de lecturas repetidas en Tienda Aurora. Cache-Aside con TTL es el patrón default en Spring. La elección de TTL depende de la frescura requerida: 5 minutos para catálogo, 30 segundos para precios. La invalidación por evento (`@CacheEvict`) garantiza consistencia cuando los datos cambian. Los distributed locks con fencing tokens protegen contra escrituras concurrentes. La mitigación de stampede con mutex por clave evita que la BD se sature cuando un caché popular expira.

Las decisiones clave son: qué cachear (lecturas frecuentes, tolerancia a stale), cuánto TTL (según frescura), cómo invalidar (por evento o por TTL corto), y cómo proteger contra concurrencia (locks, fencing, stampede protection). Cada decisión tiene trade-offs que deben evaluarse con métricas reales: hit rate, latencia p95 y carga de BD.

## Checklist

- TTL configurado por caché según frescura requerida.
- `@CacheEvict` en toda operación de escritura.
- Lock con expiry para operaciones críticas.
- Fencing token para recursos mutables con escrituras concurrentes.
- Stampede protection para cachés de alta concurrencia.
- Hit rate medido con Micrometer.
- Verificación honesta cuando falta Redis/Spring Cache real.
