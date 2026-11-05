# Spring Cloud Contract: proteger el contrato de Conductores

Laboratorio Maven con dos módulos:

- `conductor-producer`: define el contrato HTTP, implementa `GET /drivers/{id}`
  y ejecuta pruebas generadas contra el productor.
- `pedidos-consumer`: ejecuta una prueba de integración contra el stub producido.

Usa Spring Boot 4.1.2, Spring Cloud 2025.1.4 y Spring Cloud Contract 5.0.3. El
release train 2025.1.2 o posterior alinea Spring Cloud con Boot 4.1; el contrato
se comparte como artefacto clasificado `stubs` en el repositorio Maven local. El
POM importa el BOM del release train y el BOM de Contract por separado, para dejar
explícitas las versiones del plugin, verificador y Stub Runner.

## Ejecutar

Desde esta carpeta:

```bash
./scripts/verify-contracts.sh
```

Equivale a `./mvnw clean install`: el productor genera una prueba desde el archivo
Groovy y el artefacto de stubs; al instalarlo, la prueba del consumidor lo carga
desde `~/.m2` e inicia un servidor HTTP temporal. El resultado esperado es que
pasen las pruebas generadas del productor y `ConductorContractTest` del consumidor.

## Recorrer un cambio incompatible

Edita `conductor-producer/src/main/java/academia/rutaflow/conductor/DriverController.java`
y cambia el cuerpo de respuesta para quitar `driverId`. Ejecuta:

```bash
./mvnw -pl conductor-producer -am test
```

La prueba generada debe fallar porque el productor dejó de cumplir el contrato. No
edites el stub para ocultar la rotura. Restaura el campo y ejecuta la verificación
completa; el consumidor lee el contrato aprobado y vuelve a pasar.

## Límites

El contrato protege rutas, códigos y forma acordada del JSON; no verifica reglas
internas, rendimiento, autorización ni que el despliegue productivo ejecute esa
versión. El stub representa la respuesta pactada: no es una copia del productor.
Cada equipo debe publicar artefactos versionados y decidir qué versión de stubs
consume cada build.
