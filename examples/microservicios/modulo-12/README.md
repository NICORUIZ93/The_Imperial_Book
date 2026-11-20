# Laboratorio · Módulo 8 · Resiliencia

Lección: [`web/public/content/microservices/modulo-12.md`](../../../web/public/content/microservices/modulo-12.md)
(Fase 1, specs/018). Todos los temas incluyen una **simulación del fallo**: con **Toxiproxy** (Docker) o con
`jdk/ProxyDeFallos.java`, un proxy TCP de este laboratorio que imita los mismos *toxics* sin Docker.

| Ficha | Demostración JDK (fallo simulado con ProxyDeFallos) | Proyecto Spring | Simulación con Toxiproxy |
|---|---|---|---|
| F057 · Resilience4j: Circuit Breaker, Retry, RateLimiter, Bulkhead, TimeLimiter | `jdk/Patrones.java` | `f057-resilience4j` | `./simular-fallo.sh caido / lento / sano` |
| F058 · Timeouts en cascada y presupuesto de latencia | `jdk/Presupuesto.java` | `f058-presupuesto` | `./simular-fallo.sh lento 1500` |
| F059 · Fallback strategies | `jdk/Fallbacks.java` | `f059-fallbacks` | `./simular-fallo.sh caido` |
| F060 · Chaos Engineering con Toxiproxy | `jdk/Caos.java` | `f060-caos` (Testcontainers + Toxiproxy) | `caos/experimento.sh` |

`jdk/Inventario.java` es el servicio que se rompe: `GET /stock/{sku}` → `{"sku":"7","stock":12}`.

## Versiones

JDK 25 LTS · Spring Boot 4.1.3 · Resilience4j 2.4.0 (`resilience4j-spring-boot4`) · Spring Cloud 2025.1.4 (BOM) ·
Testcontainers 2.0.5 · toxiproxy-java 2.1.11 · imágenes `ghcr.io/shopify/toxiproxy:2.13.0` y
`eclipse-temurin:25-jdk` · Maven 3.10.1 por el wrapper · Docker Compose v5.

## Ejecutar

```bash
cd examples/microservicios/modulo-12
./verificar.sh --solo-jdk   # las 4 demostraciones con fallos inyectados; no necesita Docker ni Maven Central
./verificar.sh              # además: Toxiproxy real (lento, caído, reset) y los tests de las 4 carpetas Maven
```

**Salida esperada de `./verificar.sh`:** cada demostración termina en `OK: ...`; el bloque de Toxiproxy imprime
`sano: 200 0.0…`, `lento: 200 1.5…`, `caido: 000 …` y `sano: 200 0.0…`; Maven sin `[ERROR]`; y la última línea
`RESULTADO: OK · Módulo 8 (Resiliencia) verificado`.

## Simular fallos con Toxiproxy

```bash
docker compose up -d --wait
curl localhost:21212/stock/7              # a través de Toxiproxy
./simular-fallo.sh lento 2000             # +2 s en cada respuesta
./simular-fallo.sh caido                  # conexión rechazada
./simular-fallo.sh cuelga                 # acepta y nunca responde
./simular-fallo.sh intermitente 0.5       # corta la mitad de las conexiones
./simular-fallo.sh sano                   # vuelve a la normalidad
./simular-fallo.sh estado                 # proxy y toxics activos
docker compose down
```

Con Toxiproxy encendido, arranca cualquier proyecto Spring (`cd f057-resilience4j && ../mvnw spring-boot:run`):
todos llaman al inventario en `http://localhost:21212`.

## Logs

`verificar.sh` guarda en `logs/` (ignorada por Git) la salida de cada demostración, de Docker Compose, de Maven y
los informes de surefire; en el Módulo 7 también los chequeos de Consul (`consul-chequeos.json`) y el log de la app.

## Estado de verificación

Las demostraciones de `jdk/` se ejecutaron con JDK 25.0.5 y su salida está pegada en la lección. Toxiproxy y los
proyectos Maven quedan en [`verificacion/microservicios/pendiente.md`](../../../verificacion/microservicios/pendiente.md).
