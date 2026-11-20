# Laboratorio · Módulo 7 · Spring Cloud e infraestructura

Lección: [`web/public/content/microservices/modulo-11.md`](../../../web/public/content/microservices/modulo-11.md)
(Fase 1, specs/018). La carpeta `jdk/` tiene una demostración por ficha que solo necesita JDK 25 (el mecanismo
por dentro); cada carpeta `fNNN-*` es un subproyecto Gradle (Kotlin DSL) con el código Spring Cloud y su test.

| Ficha | Demostración JDK | Proyecto Spring | Necesita |
|---|---|---|---|
| F052 · Service Discovery: Eureka, Consul | `jdk/Registro.java` | `f052-eureka`, `f052-consul` | Maven Central; Docker para Consul |
| F053 · API Gateway: Spring Cloud Gateway | `jdk/MiniGateway.java` | `f053-gateway` | Maven Central |
| F054 · Config Server: configuración centralizada | `jdk/ConfigCentral.java` | `f054-config` (+ `config-repo/`) | Maven Central |
| F055 · Load Balancing: Spring Cloud LoadBalancer | `jdk/Balanceador.java` | `f055-loadbalancer` | Maven Central |
| F056 · BFF pattern | `jdk/Bff.java` | `f056-bff` | Maven Central |

## Versiones

JDK 25 LTS · Spring Boot 4.1.3 · Spring Cloud 2025.1.4 «Oakwood» (Gateway 5.0.4, Netflix/Eureka 5.0.3, Consul
5.0.4, Config 5.0.6, Commons/LoadBalancer 5.0.4) · Testcontainers 2.0.5 · imagen `hashicorp/consul:2.1.0` ·
Gradle 9.9.2 por el wrapper (`./gradlew`) · Docker Compose v5.

## Ejecutar

```bash
cd examples/microservicios/modulo-11
./verificar.sh --solo-jdk   # las 5 demostraciones; no necesita Docker ni Maven Central
./verificar.sh              # además: Consul con Compose (registro real) y los tests de las 6 carpetas con Gradle
```

**Salida esperada de `./verificar.sh`:** cada demostración termina en una línea `OK: ...`, después
`OK: catalogo registrado y sano en Consul`, Gradle sin `FAILED` y la última línea
`RESULTADO: OK · Módulo 7 (Spring Cloud e infraestructura) verificado`.

A mano, ficha por ficha:

```bash
java jdk/Registro.java                                      # F052 por dentro
cd f052-eureka && ../gradlew test                              # F052 Eureka (servidor + 2 instancias)
cd f052-consul && ../gradlew test                              # F052 Consul (Testcontainers; Docker encendido)
cd f053-gateway && ../gradlew test                             # F053
cd f054-config && ../gradlew test                              # F054 (se ejecuta desde f054-config: lee ./config-repo)
cd f055-loadbalancer && ../gradlew test                        # F055
cd f056-bff && ../gradlew test                                 # F056
```

`servicios-falsos.py` (Python 3.10+, solo biblioteca estándar) sirve los archivos de una carpeta como JSON, con
latencia opcional: lo usan los mini-laboratorios para tener «servicios» detrás del gateway y de los BFF
(`python3 servicios-falsos.py 8081 /tmp/s 150`).

## Infraestructura

`docker-compose.yml` arranca **Consul 2.1.0** en modo desarrollo (`agent -dev`, un nodo, datos en memoria) con su
UI en http://localhost:8500. Eureka Server y Config Server son aplicaciones Spring Boot de este laboratorio
(`f052-eureka`, `f054-config`): se arrancan con `../gradlew bootRun` (ver cada ficha).

## Logs

`verificar.sh` guarda en `logs/` (ignorada por Git) la salida de cada demostración, de Docker Compose, de Gradle y
los informes XML de los tests (`build/test-results`); en el Módulo 7 también los chequeos de Consul (`consul-chequeos.json`) y el log de la app.

## Estado de verificación

Las demostraciones de `jdk/` se ejecutaron con JDK 25.0.5 y su salida está pegada en la lección. Los proyectos
Los tests con Gradle y Consul quedan en [`verificacion/microservicios/pendiente.md`](../../../verificacion/microservicios/pendiente.md):
necesitan Maven Central y Docker Hub, que no están disponibles en el entorno donde se escribió.

## Build: Gradle (equivalencia con Maven)

Este laboratorio se construye con Gradle 9.9.2 (Kotlin DSL) por el wrapper `./gradlew`; las versiones están en el
catálogo `gradle/libs.versions.toml`. Hasta el 2026-11-20 usaba Maven: `./mvnw test` → `./gradlew test` ·
`./mvnw -pl <carpeta> test` → `./gradlew :<carpeta>:test` · `./mvnw package -DskipTests` → `./gradlew bootJar` ·
`./mvnw spring-boot:run` → `./gradlew bootRun` · `target/` → `build/` · `pom.xml` → `build.gradle.kts`.
