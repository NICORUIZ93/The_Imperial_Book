# Antes de desplegar RutaFlow

El laboratorio comprueba funcionamiento local; estos resultados no certifican
un despliegue productivo.

## Comprobado localmente

- [x] Spring Boot levanta con Java 25.
- [x] Flyway aplica `V1__crear_entrega.sql`; Hibernate valida el esquema.
- [x] Testcontainers inicia PostgreSQL 16 para las pruebas.
- [x] JWT HS256 válido, firma alterada y permisos `USER` / `ADMIN` cubiertos.
- [x] La creación válida se guarda y aumenta `entregas.creadas`.
- [x] Actuator devuelve la métrica solo con permiso administrativo.

Repite la verificación con `./scripts/verify-integration.sh`.

## Falta evidencia del entorno de despliegue

- [ ] Conectar un proveedor de identidad y validar `issuer`, audiencia, rotación y expiración de claves.
- [ ] Inyectar secretos desde el gestor aprobado; quitar la clave local de demostración.
- [ ] Terminar TLS en el ingreso y revisar límites, CORS y protección contra abuso.
- [ ] Configurar exporter, retención, alertas y límites de etiquetas para métricas.
- [ ] Aplicar el manifiesto al clúster y confirmar startup, liveness y readiness con el kubelet.
- [ ] Preparar credenciales de base, copias de seguridad, restauración y procedimiento de migración.
- [ ] Construir y escanear una imagen con digest fijado, usuario sin privilegios y política de actualización.

Marca un pendiente solo cuando exista evidencia del entorno destino. El JWT y la
clave incluidos en el laboratorio sirven para pruebas locales, no para publicar
la API.
