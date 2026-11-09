# JWT firmado y autorización por dueño

Laboratorio Spring Boot 4.1.2 / Java 25. Prueba la firma de un Bearer JWT HS256, el rol `ROLE_DRIVER` y la propiedad de la jornada en decisiones separadas.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw -q test
```

Las pruebas crean tokens firmados localmente con `JwtEncoder` y los envían por HTTP a MockMvc. Comprueban 401 sin token, 403 sin rol, 200 para el dueño y 403 para otra persona con el mismo rol.

La clave predeterminada es de práctica. `JornadaOwnership` usa un mapa fijo en memoria. Antes de producción, configura un proveedor de identidad y consulta el dueño desde persistencia; estas pruebas no validan conexión con Keycloak.
