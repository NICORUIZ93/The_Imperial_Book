# JWT firmado y autorización por dueño

Laboratorio Spring Boot 4.1.2 / Java 25. Prueba la firma de un Bearer JWT HS256, el rol `ROLE_DRIVER` y la propiedad de la jornada en decisiones separadas.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw -q test
```

Las pruebas crean tokens firmados localmente con `JwtEncoder` y los envían por HTTP a MockMvc. Comprueban 401 sin token, 403 sin rol, 200 para el dueño y 403 para otra persona con el mismo rol.

La clave predeterminada es de práctica. `JornadaOwnership` usa un mapa fijo en memoria. Antes de producción, configura un proveedor de identidad y consulta el dueño desde persistencia; estas pruebas no validan conexión con Keycloak.

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
