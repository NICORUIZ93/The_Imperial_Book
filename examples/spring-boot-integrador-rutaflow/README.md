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

El script corre cinco pruebas contra la aplicación y un PostgreSQL efímero:
creación HTTP 201 con persistencia, rechazo HTTP 400 sin guardar, respuestas 401
y 403 según credencial y rol, aumento del contador visible por Actuator y una
guardia de configuración. En macOS detecta el socket de Podman y prepara las
variables de Testcontainers; con Docker usa la configuración del entorno.

## Recorre las capas

- `src/main/java/academia/rutaflow/integrador/entrega/EntregaController.java`: entrada HTTP, validación y respuesta.
- `src/main/java/academia/rutaflow/integrador/entrega/EntregaService.java`: guardado y contador de negocio.
- `src/main/java/academia/rutaflow/integrador/entrega/EntregaRepository.java`: acceso a datos con Spring Data JPA.
- `src/main/java/academia/rutaflow/integrador/security/JwtSecurityConfig.java`: firma/verificación HS256 y reglas JWT.
- `src/main/resources/db/migration/V1__crear_entrega.sql`: tabla gestionada por Flyway.
- `src/test/java/academia/rutaflow/integrador/entrega/ArquitecturaIntegradaTest.java`: prueba HTTP y PostgreSQL con Testcontainers.
- `docs/salida-a-produccion.md`: evidencia local y pendientes para el entorno destino.

## Provoca un error de ruta

Cambia `@PostMapping` por `@PutMapping` en `EntregaController.java` y ejecuta
`./scripts/verify-integration.sh`. La prueba falla porque manda POST y ya no
recibe HTTP 201.
Restaura `@PostMapping` y repite `./scripts/verify-integration.sh`.

La clave por defecto es solo para el laboratorio local. En un entorno desplegado,
define `RUTAFLOW_JWT_SECRET_BASE64` fuera del repositorio o conecta un emisor de
identidad; no compartas la clave de demostración. Este ejemplo no incluye
publicación de eventos.

## Alternativa Gradle

Desde esta misma carpeta, con JDK 25:

```bash
./gradlew clean classes test
```

Usa las mismas fuentes y pruebas del laboratorio. Consulta la [guía del curso](../../docs/SPRING-BOOT-GRADLE.md)
para perfiles, filtros de tests, procesadores y tareas especiales. Los resultados
JUnit de Gradle están en `build/test-results/`; una compilación sin tests no
acredita el escenario de integración. Los scripts que llaman a `mvnw` siguen
usando Maven y su carpeta `target/`.
