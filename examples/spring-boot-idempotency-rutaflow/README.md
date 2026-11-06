# Idempotencia con PostgreSQL

Práctica Spring Boot 4.1.2 / Java 25. Dos threads intentan guardar la misma
clave a la vez en PostgreSQL 16. La migración instala la restricción única y
`INSERT ... ON CONFLICT DO NOTHING` deja que la base decida cuál llamada la
registra. No se captura una violación SQL dentro de la transacción.

## Ejecutar

Necesitas Podman o Docker compatible con Testcontainers:

```bash
./scripts/verify-idempotency.sh
```

Resultado: una llamada devuelve `true`, la otra `false` y la tabla conserva una
fila. El test coordina las llamadas con `CountDownLatch`; PostgreSQL determina
el resultado de la carrera.

Este ejemplo enseña la garantía de unicidad, no una API idempotente completa.
Antes de producción, vincula la clave con principal y operación, guarda un hash
de la solicitud y define cuánto tiempo conservas el resultado de la primera
respuesta.
