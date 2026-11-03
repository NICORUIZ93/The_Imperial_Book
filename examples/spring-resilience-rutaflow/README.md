# Laboratorio Spring Resilience4j de RutaFlow

Prueba el circuito que protege una llamada a un microservicio de pedidos. El laboratorio usa Resilience4j 2.4.0 como biblioteca independiente para aislar la máquina de estados; no levanta una red de microservicios.

Desde este directorio ejecuta:

```bash
./mvnw test
```

Las pruebas cuentan llamadas reales al supplier, demuestran la apertura tras cuatro fallos y comprueban la recuperación `OPEN → HALF_OPEN → CLOSED`.
