# Microservicio integrador RutaFlow

Laboratorio con Spring Boot 4.1.2 y Java 25. Una petición HTTP valida el
destinatario, pasa por controller → service → repository y guarda una entrega
en PostgreSQL. Flyway crea la tabla; Hibernate valida el esquema.

## Ejecutar

Necesitas Java 25 y Podman o Docker compatible con Testcontainers. Desde esta
carpeta ejecuta:

```bash
./scripts/verify-integration.sh
```

El script corre dos pruebas contra una aplicación real y un PostgreSQL efímero:
una confirma HTTP 201 y persistencia; otra confirma HTTP 400 para un destinatario
vacío y que no se guarda. En macOS detecta el socket de Podman y prepara las
variables de Testcontainers; con Docker usa la configuración del entorno.

## Recorre las capas

- `entrega/EntregaController.java`: entrada HTTP, validación y respuesta.
- `entrega/EntregaService.java`: crea la entrega dentro de una transacción.
- `entrega/EntregaRepository.java`: acceso a datos con Spring Data JPA.
- `src/main/resources/db/migration/V1__crear_entrega.sql`: tabla gestionada por Flyway.
- `src/test/java/academia/rutaflow/integrador/entrega/ArquitecturaIntegradaTest.java`: prueba HTTP y PostgreSQL con Testcontainers.

## Provoca un error de ruta

Cambia `@PostMapping` por `@PutMapping` en `EntregaController.java` y ejecuta
`./scripts/verify-integration.sh`. La prueba falla porque manda POST y ya no
recibe HTTP 201.
Restaura `@PostMapping` y repite `./scripts/verify-integration.sh`.

Esta muestra aún no incluye autenticación, publicación de eventos ni métricas;
se incorporan en los temas siguientes.
