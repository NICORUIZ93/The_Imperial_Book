# Tareas: referencia acumulativa de los módulos 2–7

Este proyecto reúne el estado final de la API: DTO y MapStruct, JPA, Flyway,
validación, errores HTTP, JWT, CORS y Actuator. Usa Java 25 y las versiones fijadas
en `pom.xml`. Es una referencia para comparar tu trabajo al terminar los módulos;
contiene cambios posteriores a las primeras prácticas y no sustituye construirlas
paso a paso.

## Ejecutar las pruebas

Desde esta carpeta, con Java 25 y un motor compatible con Docker activo:

```bash
./mvnw clean test
```

En macOS con una máquina Podman iniciada, utiliza su socket explícitamente:

```bash
export DOCKER_HOST="unix://$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')"
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
export TESTCONTAINERS_RYUK_DISABLED=true
./mvnw clean test
```

Estas variables son específicas de ese entorno. Sin motor de contenedores la
prueba PostgreSQL fallará: no la interpretes como una prueba H2 equivalente.
Con Ryuk desactivado, comprueba `podman ps -a` después de una interrupción y
elimina únicamente los contenedores efímeros creados por esta ejecución.

Los resultados están en `target/surefire-reports/`. Las pruebas verifican el
contrato HTTP mediante MockMvc (sin servidor de red), JWT y login, restricciones
JPA, migraciones, carga de relaciones y señales de salud/métricas. PostgreSQL
usa un contenedor real; las demás pruebas de persistencia usan H2 en memoria.
La clave JWT de `src/test/resources/` es exclusivamente de prueba.

## Ejecutar la aplicación de demostración

En esta carpeta, genera una clave local y arranca la aplicación:

```bash
export JWT_SECRET_BASE64="$(openssl rand -base64 32)"
./mvnw spring-boot:run
```

En otra terminal:

```bash
curl -i http://localhost:8080/api/tareas
curl -i -H 'Content-Type: application/json' \
  -d '{"email":"ana@rutaflow.dev","password":"clave-larga-segura"}' \
  http://localhost:8080/api/auth/login
```

La primera petición debe devolver 401; la segunda, un token. Copia ese token en
la cabecera `Authorization: Bearer TOKEN` para probar las rutas protegidas.
Detén la aplicación con Ctrl+C; H2 pierde los datos al cerrar el proceso.

## Límites

El usuario y contraseña están fijados para demostración. No es un sistema de
identidad de producción: no incluye revocación, rotación de claves ni usuarios
persistentes. Se incluyen anotaciones OpenAPI, pero no un servidor de documentación
Swagger ni una prueba de `/v3/api-docs`. No se acredita tráfico real de navegador,
carga, despliegue o equivalencia completa entre PostgreSQL y H2. Los endpoints
de Actuator siguen protegidos; los detalles amplios de salud se habilitan solo
en el perfil de pruebas.
