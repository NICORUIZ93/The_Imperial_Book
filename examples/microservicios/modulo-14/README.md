# Laboratorio · Módulo 10 · Observabilidad

Lección: [`web/public/content/microservices/modulo-14.md`](../../../web/public/content/microservices/modulo-14.md)
(Fase 1, specs/018).

| Carpeta o archivo | Ficha | Necesita |
|---|---|---|
| `jdk/MetricasPrometheus.java` · `f070-micrometer-prometheus` | Micrometer + Prometheus | Prometheus para el raspado real |
| `jdk/TrazasW3C.java` · `f071-tracing` | OpenTelemetry + Zipkin/Jaeger | Jaeger y Zipkin para ver las trazas |
| `jdk/LogsEstructurados.java` · `f072-logging-estructurado` | Logging estructurado | — |
| `grafana/` (aprovisionamiento, `dashboards/pedidos-red.json`, `validar_dashboard.py`) | Grafana: dashboards | Grafana |
| `prometheus/reglas.yml` · `prometheus/reglas_test.yml` · `jdk/PercentilP99.java` · `carga.sh` | Alerting basado en p99 | Prometheus (promtool) |

## Versiones

JDK 25 LTS (25.0.5) · Spring Boot 4.1.3 (Micrometer 1.17.3, Micrometer Tracing 1.7.3, OpenTelemetry 1.62.0, Zipkin
Reporter 3.5.3) · Prometheus v3.15.1 (`prom/prometheus:v3.15.1`) · Grafana 13.2.4 (`grafana/grafana:13.2.4`) · Jaeger
2.22.0 (`jaegertracing/jaeger:2.22.0`) · Zipkin 3.6.1 (`openzipkin/zipkin:3.6.1`) · Python 3 · Gradle 9.9.2 por el
wrapper.

## Ejecutar

```bash
cd examples/microservicios/modulo-14
./verificar.sh --solo-jdk     # JDK 25 y Python: 4 demostraciones + validador del dashboard
./verificar.sh                # + promtool, Grafana, Zipkin, Prometheus raspando f070, Jaeger con f071 y tests con Gradle
```

El script termina con `RESULTADO: OK · Módulo 10 (Observabilidad) verificado`.

## Recorrido a mano

```bash
docker compose up -d --wait
(cd f070-micrometer-prometheus && ../gradlew -q bootRun) &    # :8080
./carga.sh 300 5                                                   # 5 min con 5 % de peticiones lentas
```

- Prometheus: http://localhost:9090 → *Alerts* muestra `PedidosLatenciaP99Alta` en *pending* y luego *firing*.
- Grafana: http://localhost:3000 (`admin` / `admin-solo-dev`) → carpeta *Tienda* → *Pedidos · RED*.
- Jaeger: http://localhost:16686 · Zipkin: http://localhost:9411.

`verificar.sh` guarda en `logs/` (ignorada por git) la salida de las apps que arranca: `logs/f070.log`, `logs/f071-*.log` y, si Jaeger no muestra las trazas, `logs/jaeger.log`.

## Build: Gradle (equivalencia con Maven)

Este laboratorio se construye con Gradle 9.9.2 (Kotlin DSL) por el wrapper `./gradlew`; las versiones están en el
catálogo `gradle/libs.versions.toml`. Hasta el 2026-11-20 usaba Maven: `./mvnw test` → `./gradlew test` ·
`./mvnw -pl <carpeta> test` → `./gradlew :<carpeta>:test` · `./mvnw package -DskipTests` → `./gradlew bootJar` ·
`./mvnw spring-boot:run` → `./gradlew bootRun` · `target/` → `build/` · `pom.xml` → `build.gradle.kts`.
