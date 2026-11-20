# Laboratorio · Módulo 4 · Caching y rendimiento

Lección: [`web/public/content/microservices/modulo-8.md`](../../../web/public/content/microservices/modulo-8.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un proyecto Maven autónomo; `simuladores/` reproduce el mismo
razonamiento en Python (solo biblioteca estándar) contra los mismos Redis, para ver los comandos uno a uno.

| Carpeta | Ficha | Infraestructura |
|---|---|---|
| `f037-cache-redis` | Caching con Redis: @Cacheable, @CacheEvict, TTL (3 tests) | `redis` :6379 |
| `f038-patrones-cache` + `simuladores/patrones.py` | Patrones: Read-Through, Write-Behind, Write-Through (3 tests) | `redis` :6379 y `postgres` :5432 |
| `f039-redlock-fencing` + `simuladores/redlock_fencing.py` | Distributed Locking con Redlock y Fencing Tokens (4 tests) | `redis` :6379 y `redis-a/b/c` :6380–6382 |
| `f040-cache-stampede` + `simuladores/stampede.py` | Cache stampede y solución con locks (22 tests) | `redis` :6379 |

## Versiones

JDK 25 LTS · Spring Boot 4.1.3 (Spring Data Redis 4.1.3, Lettuce 7.5.2, driver PostgreSQL 42.7.14, JUnit Jupiter
6.0.3) · imágenes `redis:8.10.2` y `postgres:18.7` · Python 3.10+ para los simuladores (probados con 3.13.18 contra
Redis 7.0.15) · Maven por el wrapper.

## Ejecutar

```bash
cd examples/microservicios/modulo-8
./verificar.sh
```

Levanta los 5 contenedores, ejecuta los 9 tests de Python y los tests de Maven, apaga todo y termina con
`RESULTADO: OK · Módulo 4 (Caching y rendimiento) verificado`.

A mano:

```bash
docker compose up -d --wait
cd simuladores && python3 patrones.py && python3 redlock_fencing.py && python3 stampede.py && cd ..
cd f037-cache-redis && ../mvnw test
docker compose exec redis redis-cli --scan --pattern 'productos::*'
docker compose down
```
