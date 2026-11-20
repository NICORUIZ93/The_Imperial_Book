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
2.22.0 (`jaegertracing/jaeger:2.22.0`) · Zipkin 3.6.1 (`openzipkin/zipkin:3.6.1`) · Python 3 · Maven 3.10.1 por el
wrapper.

## Ejecutar

```bash
cd examples/microservicios/modulo-14
./verificar.sh --solo-jdk     # JDK 25 y Python: 4 demostraciones + validador del dashboard
./verificar.sh                # + promtool, Grafana, Zipkin, Prometheus raspando f070, Jaeger con f071 y tests Maven
```

El script termina con `RESULTADO: OK · Módulo 10 (Observabilidad) verificado`.

## Recorrido a mano

```bash
docker compose up -d --wait
(cd f070-micrometer-prometheus && ../mvnw -q spring-boot:run) &    # :8080
./carga.sh 300 5                                                   # 5 min con 5 % de peticiones lentas
```

- Prometheus: http://localhost:9090 → *Alerts* muestra `PedidosLatenciaP99Alta` en *pending* y luego *firing*.
- Grafana: http://localhost:3000 (`admin` / `admin-solo-dev`) → carpeta *Tienda* → *Pedidos · RED*.
- Jaeger: http://localhost:16686 · Zipkin: http://localhost:9411.
