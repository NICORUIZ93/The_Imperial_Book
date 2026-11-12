# Probes de salud para RutaFlow

Proyecto Spring Boot 4.1.2 / Java 25 con Actuator. La configuración habilita los
grupos `liveness` y `readiness`. La prueba publica un `AvailabilityChangeEvent`
real para mostrar cómo Spring cambia readiness.

## Ejecutar

Desde esta carpeta:

```bash
./scripts/verify-probes.sh
```

El script ejecuta las pruebas MockMvc, inicia la app y consulta por HTTP los dos
endpoints y `GET /entrega`. Usa el puerto local 18082.

Las pruebas cubren la respuesta HTTP de la app; no arrancan un clúster ni prueban
el comportamiento del kubelet. Para construir la imagen del manifiesto:

```bash
./mvnw -q package
podman build -t rutaflow-probes:local .
```

`k8s/deployment.yaml` sirve como base. Un clúster local como kind o minikube puede
requerir que cargues la imagen en el clúster; en un clúster compartido, publícala
en un registry y cambia el campo `image`.

## Simular un error de configuración

Cambia `management.endpoint.health.probes.enabled=true` a `false` en
`src/main/resources/application.properties` y ejecuta `./mvnw clean test`. En
Spring Boot 4.1.2 omitir la propiedad deja su valor por defecto `true`; al ponerla
en `false`, ambos endpoints dan `404` y los tests fallan. Restaura `true` y vuelve
a probar.

La configuración usa el mismo puerto para Actuator y la aplicación. Si cambias
`management.server.port`, actualiza también los probes del manifiesto. En
producción, no conviertas liveness en una comprobación de base de datos: una caída
de la base puede provocar reinicios repetidos sin reparar esa dependencia.

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
