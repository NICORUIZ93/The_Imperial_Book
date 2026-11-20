# Laboratorio · Módulo 5 · Introducción a microservicios y DDD

Lección: [`web/public/content/microservices/modulo-9.md`](../../../web/public/content/microservices/modulo-9.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un proyecto Maven autónomo con el código y los tests de una ficha.

| Carpeta | Ficha | Infraestructura |
|---|---|---|
| `f041-estilos` | Monolito vs Microservicios vs SOA (incluye el ejercicio «no usar microservicios») | — |
| `f042-ddd` | DDD: Bounded Contexts, Agregados, Eventos de Dominio | — |
| `f043-modulith` | Spring Modulith | H2 en memoria (para las transacciones) |
| `f044-doce-factores` | 12-Factor App | — |
| `f045-strangler-fig` | Strangler Fig Pattern (fachada + capa anticorrupción) | — (los tests levantan dos servidores HTTP falsos) |
| `f046-bd-por-servicio` | Database-per-service | PostgreSQL `envios_db` y `facturacion_db` |

## Versiones

JDK 25 LTS (25.0.5) · Spring Boot 4.1.3 (Spring Framework 7.0.11, JUnit Jupiter 6.0.3) · Spring Modulith 2.1.3 ·
H2 2.4.240 · driver PostgreSQL 42.7.14 (gestionado por Boot) · imagen `postgres:18.7` · Maven 3.9.11 por el
wrapper (`./mvnw`, descarga Maven la primera vez).

## Ejecutar

```bash
cd examples/microservicios/modulo-9
./verificar.sh
```

El script muestra la versión de Java y de Docker Compose, hace `docker compose up -d --wait`, ejecuta
`./mvnw -q -fae test` en las 6 carpetas, comprueba los tres guiones SQL de F046 (dos deben fallar y uno devolver
2 filas), imprime `RESULTADO: OK · Módulo 5 (Introducción a microservicios y DDD) verificado` y termina con
`docker compose down`.

Para trabajar una ficha a mano:

```bash
cd f042-ddd && ../mvnw test                    # las fichas F041–F045 no necesitan Docker
docker compose up -d --wait                    # PostgreSQL :5432 para F046
cd f046-bd-por-servicio && ../mvnw test
docker compose down
```

Las fichas F041, F042 y la parte de Java puro de F044 y F045 también corren sin Maven, solo con el JDK
(los comandos exactos están en la lección). Si el puerto 5432 está ocupado por un PostgreSQL local, detenlo
antes de `docker compose up`.
