# Proyecto guía · Tienda Maven + Spring Boot

**Estado:** starter de referencia inicial. Es una pieza nueva y aislada de la Fase 1; no representa los 29 laboratorios ni marca completa la fase. Docker Desktop no estaba disponible al redactar este README, por lo que los comandos y salidas indicados son criterios esperados, no resultados observados.

Este servicio se construye en el curso desde una carpeta vacía. La persona ya sabe Java y terminal, pero no necesita conocer Maven, Spring MVC, JPA, migraciones ni Docker internamente. El proyecto usa Spring Boot 4.1.3, JDK 25 y PostgreSQL 18.7 según la matriz local del curso. La versión Maven del contenedor queda fijada en 3.10.0 y no cambia el build Gradle principal del repositorio.

## Qué construir y por qué (orden guiado)

Antes de abrir el código completo, trabaja cada etapa en este orden; al final compara archivo por archivo con este starter de referencia.

1. **`pom.xml`:** coordenadas, parent de Spring Boot, release Java, dependencias y plugin ejecutable. El BOM de Boot administra versiones compatibles; no se fijan versiones individuales sin motivo.
2. **`TiendaApplication.java`:** punto de entrada y escaneo de componentes. Se añade para que Spring Boot cree el contexto; todavía no se añade persistencia.
3. **`domain/Producto.java`:** entidad JPA e invariantes del dominio. El constructor público protege nombre y precio; el constructor sin argumentos es `protected` porque JPA debe reconstruir la entidad.
4. **`api/ProductoRequest.java` y `ProductoResponse.java`:** request validado y respuesta pública. El DTO evita que el esquema persistente se convierta accidentalmente en el contrato HTTP.
5. **`persistence/ProductoRepository.java`:** interfaz Spring Data; el framework crea su implementación al iniciar.
6. **`application/ProductoService.java`:** coordina dominio/repositorio y declara límites transaccionales; el controlador no ejecuta SQL.
7. **`api/ProductoController.java`:** expone `GET` y `POST /api/v1/productos`; `@Valid` rechaza datos mal formados y `201 Created` identifica creación.
8. **`db/migration/V1__crear_productos.sql`:** esquema versionado. Flyway crea la tabla; Hibernate valida que el mapeo coincide en vez de mutar el esquema automáticamente.
9. **`application.yml`:** URL y credenciales locales provienen de variables configurables; para Docker, el hostname es `postgres`, no `localhost`.
10. **Pruebas:** `ProductoTest` prueba invariantes y `ProductoServiceTest` aísla la coordinación con Mockito. El smoke test verifica el contrato sobre la aplicación real.
11. **`Dockerfile` y `docker-compose.yml`:** compila con Maven/JDK 25 en una etapa y ejecuta el JAR como usuario no root; Compose espera healthcheck de PostgreSQL antes de iniciar la API.
12. **`verify.sh`:** prueba automática reproducible y modo HTTP de extremo a extremo.

El código de referencia completo es el contenido de esta carpeta. No se supone que el alumno copie el proyecto prefabricado: el guion de la lección deberá presentar las analogías y diagramas antes de pedir escribir cada archivo y cada bloque.

## Requisitos del host

Docker Desktop con Compose v2 o superior en ejecución, `curl` y shell Bash. No hace falta instalar Java ni Maven en el host: ambos viven en contenedores para el build. En el primer build se requiere acceso a los registros de imágenes y Maven Central.

## Arranque reproducible

Desde esta carpeta:

```bash
docker compose config
docker compose up --build --wait
```

**Salida esperada (no verificada en esta sesión):** servicio `postgres` pasa healthcheck, imagen `api` se construye con Maven/JDK 25 y el contenedor inicia en `8080`. Consultar catálogo vacío:

```bash
curl -i http://localhost:8080/api/v1/productos
```

Respuesta prevista inicial: `HTTP/1.1 200` y `[]`.

Crear un producto:

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"nombre":"Teclado","precio":35.90}' \
  http://localhost:8080/api/v1/productos
```

Respuesta prevista: `201 Created`, `Location: /api/v1/productos/<id>` y JSON con `nombre` y `precio`. Un nombre vacío o precio cero debe producir `400 Bad Request` por `@Valid`.

En otra terminal:

```bash
./verify.sh --e2e
```

El verificador ejecuta primero `mvn test` dentro del contenedor de herramientas; luego crea un producto y comprueba la respuesta `201` y el rechazo `400`. Para solo pruebas:

```bash
./verify.sh
```

No afirma éxito si `docker compose` o Maven falla. También se puede ejecutar `docker compose --profile tools run --rm build mvn -B -ntp package` para empaquetar explícitamente.

## Servicios opcionales de la Fase 1

- `docker compose --profile mysql up -d mysql` levanta MySQL en el puerto host `3307`; el starter todavía no cambia su datasource ni incluye driver MySQL.
- `docker compose --profile cache up -d redis` levanta Redis en `6379`; la app aún no usa caché.
- Ambos servicios son infraestructura de los temas posteriores, no dependencias necesarias del primer endpoint. No iniciar perfiles opcionales sin razón.

Las credenciales en Compose son únicamente de laboratorio local y no deben reutilizarse fuera de esta máquina. Mantén volúmenes entre reinicios. Para borrar la base local deliberadamente: `docker compose down -v`.

## Modificación guiada y fallo controlado

1. Cambia `@Positive` o el constructor para permitir precio cero; ejecuta `./verify.sh --e2e` y observa que una regla de dominio debe seguir protegiendo el dato aunque la validación HTTP cambie. Revierte el cambio.
2. Cambia la URL de `DATABASE_URL` a `jdbc:postgresql://localhost:5432/tienda` dentro del contenedor. Esperado: conexión rechazada porque `localhost` señala el contenedor API; restaura el hostname `postgres`.
3. Cambia `ddl-auto: validate` a un modo que cree tablas y compara por qué en el curso se prefiere migración explícita de Flyway.

## Diagnóstico visual

```text
Host Mac                           Red Compose
localhost:8080 ───────────────► [api:8080] ───────► postgres:5432
                                      │                  │
                                      │ DNS: postgres    └─ healthcheck pg_isready
                                      └─ localhost ≠ host Mac
```

Si aparece `Connection refused`, mira primero `docker compose ps` y `docker compose logs postgres api`; luego comprueba hostname/puerto y healthcheck. Si aparece error de validación JPA al arrancar, compara columnas de `V1__crear_productos.sql` con `@Table/@Column`; no desactives el control para ocultar la diferencia.

## Evidencia y pendientes

- Proyecto Maven y configuración de Compose creados localmente.
- Sintaxis XML/YAML/shell y test Maven deben verificarse antes de dar el laboratorio por válido.
- El daemon Docker no estaba activo al preparar esta entrega; `docker compose up`, descarga de imágenes y smoke test quedan pendientes de ejecutar en Docker Desktop.
- Este starter no implementa todavía caché Redis, pruebas Pact, Testcontainers, MySQL ni el resto de los 29 laboratorios. Su alcance es construir y verificar la primera API REST persistente.
