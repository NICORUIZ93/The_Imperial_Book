# Caché de tarifas en RutaFlow

Laboratorio con Spring Boot 4.1.2, Java 25, Spring Cache, Caffeine y Redis.
Desde esta carpeta ejecuta:

```bash
./mvnw -q clean test
```

Ejecuta seis pruebas Caffeine y omite una prueba Redis. Comprueba reutilización,
claves por zona, invalidación, `@CachePut`, tamaño/TTL configurados y métricas
hit/miss. El catálogo vive en memoria y cuenta lecturas; no mide una base real.

## Integración Redis

Arranca un servidor exclusivo de laboratorio (sustituye podman por docker si corresponde):

```bash
podman run --rm -d --name rutaflow-cache-lab -p 127.0.0.1:16379:6379 docker.io/library/redis:7.4-alpine
podman exec rutaflow-cache-lab redis-cli ping
REDIS_PORT=16379 ./mvnw -q -Dredis.integration=true -Dtest=RedisTarifaTest test
podman stop rutaflow-cache-lab
```

`RedisWriteConfiguration` activa `immediateWrites()` únicamente con el perfil
Redis. Spring Data Redis 4 con Lettuce permite escrituras e invalidaciones
diferidas; aquí ambos gestores esperan que terminen para comprobar visibilidad
inmediata. Bloquea al llamador y no garantiza una transacción con el origen.
Véase la [guía de migración oficial](https://docs.spring.io/spring-data/redis/reference/upgrading.html).

Espera `PONG` y una prueba correcta. Dos gestores en la misma JVM comparten una
entrada, comprueban su TTL de hasta 300 segundos y observan su invalidación.
El prefijo aleatorio aísla cada ejecución; la limpieza elimina solo su clave.
Sin servidor, la prueba falla por conexión: el test no simula Redis.

## Límites

Caffeine vive en cada proceso; Redis comparte entradas entre clientes conectados
al mismo servidor. El origen de este lab sigue siendo local: no demuestra
consistencia entre varias JVM, rendimiento, expiración medida esperando cinco
minutos ni tolerancia a fallos de red. Redis usa aquí serialización Java y Tarifa
implementa Serializable; un producto debe definir compatibilidad entre versiones.
Las tarifas son públicas y la clave es zona; con varios tenants incluye su identidad.
La caché permite datos obsoletos hasta invalidación o expiración. No se aplica a
autorización ni se configura un fallback silencioso.

Referencias: [Spring Boot caching](https://docs.spring.io/spring-boot/reference/io/caching.html),
[Spring Cache annotations](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html)
y [Spring Data Redis cache](https://docs.spring.io/spring-data/redis/reference/redis/redis-cache.html).
