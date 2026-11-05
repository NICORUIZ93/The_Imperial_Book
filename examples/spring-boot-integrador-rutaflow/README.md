# Microservicio integrador RutaFlow

Laboratorio con Spring Boot 4.1.2 y Java 25. La API valida la petición, exige
JWT firmado y rol para crear, pasa por controller → service → repository y
guarda la entrega en PostgreSQL. Flyway crea la tabla; Hibernate valida el
esquema. Un contador de Micrometer mide creaciones y Actuator lo expone a
administradores.

## Ejecutar

Necesitas Java 25 y Podman o Docker compatible con Testcontainers. Desde esta
carpeta ejecuta:

```bash
./scripts/verify-integration.sh
```

El script corre cuatro pruebas contra la aplicación y un PostgreSQL efímero:
creación HTTP 201 con persistencia, rechazo HTTP 400 sin guardar, respuestas 401
y 403 según credencial y rol, y aumento del contador visible por Actuator. En
macOS detecta el socket de Podman y prepara las variables de Testcontainers; con
Docker usa la configuración del entorno.

## Recorre las capas

- `entrega/EntregaController.java`: entrada HTTP, validación y respuesta.
- `entrega/EntregaService.java`: crea la entrega dentro de una transacción.
- `entrega/EntregaRepository.java`: acceso a datos con Spring Data JPA.
- `security/JwtSecurityConfig.java`: firma/verificación HS256 y reglas JWT.
- `src/main/resources/db/migration/V1__crear_entrega.sql`: tabla gestionada por Flyway.
- `src/test/java/academia/rutaflow/integrador/entrega/ArquitecturaIntegradaTest.java`: prueba HTTP y PostgreSQL con Testcontainers.

## Provoca un error de ruta

Cambia `@PostMapping` por `@PutMapping` en `EntregaController.java` y ejecuta
`./scripts/verify-integration.sh`. La prueba falla porque manda POST y ya no
recibe HTTP 201.
Restaura `@PostMapping` y repite `./scripts/verify-integration.sh`.

La clave por defecto es solo para el laboratorio local. En un entorno desplegado,
define `RUTAFLOW_JWT_SECRET_BASE64` fuera del repositorio o conecta un emisor de
identidad; no compartas la clave de demostración. Este ejemplo no incluye
publicación de eventos.
