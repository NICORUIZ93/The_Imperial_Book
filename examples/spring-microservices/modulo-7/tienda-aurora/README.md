# Tienda Aurora · Taller 7.1 (circuit breaker)

Código completo del Tema 1 del módulo 7 de *Microservicios con Spring*.
Es exactamente el que aparece en la lección y fue compilado, probado y
ejecutado el 2026-11-24 con JDK 21, Spring Boot 3.3.13 y Resilience4j 2.2.0.

```bash
# terminal 1
cd inventario && mvn spring-boot:run      # puerto 8081
# terminal 2
cd pedidos && mvn spring-boot:run         # puerto 8080
# terminal 3
curl localhost:8080/pedidos/stock/TEC-1042
```

Pruebas: `mvn test` dentro de cada carpeta (2 pruebas en cada servicio).
