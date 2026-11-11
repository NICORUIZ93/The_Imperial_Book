# Spring Cloud Config y Discovery · RutaFlow

Laboratorio local para comprobar dos cosas concretas: Config Server entrega
propiedades por HTTP y la abstracción `DiscoveryClient` encuentra una instancia
por nombre lógico. Usa Spring Boot 4.1.2, Java 25 y Spring Cloud 2025.1.4.

## Ejecutar las pruebas

Desde esta carpeta:

```bash
./mvnw -q clean test
```

Las pruebas levantan el servidor en un puerto temporal, consultan las rutas
`/servicio-pedidos/default` y `/servicio-pedidos/produccion`, comprueban el 404
para una aplicación sin archivo y resuelven `catalogo` con el bean real de
`DiscoveryClient`. No requieren Git remoto, Docker ni un proceso Eureka/Consul.

## Ver la respuesta HTTP

```bash
./mvnw spring-boot:run
```

En otra terminal:

```bash
curl -i http://localhost:8888/servicio-pedidos/default
curl -i http://localhost:8888/servicio-pedidos/produccion
curl -i http://localhost:8888/servicio-inexistente/default
```

Las dos primeras respuestas incluyen los valores `15` y `5`. La última es 404
porque este laboratorio define `accept-empty: false`.

## Rutas que debes inspeccionar

- `src/main/java/academia/rutaflow/cloud/CloudConfigDiscoveryApplication.java`:
  activa el servidor HTTP con `@EnableConfigServer`.
- `src/main/resources/application.yml`: activa el backend `native`, limita la
  búsqueda a `classpath:/config`, rechaza aplicaciones sin configuración y
  declara una instancia simple de `catalogo`.
- `src/main/resources/config/`: configura cada aplicación y sufijo de perfil.
- `src/test/java/academia/rutaflow/cloud/ConfigServerAndDiscoveryTest.java`:
  prueba HTTP y el contrato de discovery.

## Fallos para diagnosticar

1. Cambia `search-locations` a `classpath:/configs`, ejecuta la prueba
   `sirveConfiguracionDefaultYProduccionPorHttp` y observa el fallo: el servidor
   ya no encuentra los YAML. Restaura `classpath:/config`.
2. Cambia `getInstances("catalogo")` por `getInstances("pedidos")` y ejecuta
   `resuelveInstanciaCatalogoConSimpleDiscoveryClient`. La aserción de tamaño
   falla porque el nombre consultado no coincide con la clave configurada.

Este ejemplo demuestra `SimpleDiscoveryClient`, que lee propiedades estáticas.
No registra procesos ni sustituye un registro operativo como Eureka, Consul o
Kubernetes. El backend nativo está destinado a comenzar y probar; producción
requiere escoger un repositorio y proteger la configuración de acuerdo con el
entorno.

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
