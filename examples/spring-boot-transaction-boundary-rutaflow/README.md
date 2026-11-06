# Frontera transaccional Spring

Práctica corta de Spring Boot 4.1.2 / Java 25: compara una llamada que entra
por el proxy, una llamada interna con `this` y una llamada a otro bean. La prueba
lee el estado real de Spring con `TransactionSynchronizationManager`.

## Ejecutar

```bash
./scripts/verify-transactions.sh
```

Resultado: tres pruebas, sin fallos. No se usa una transacción simulada.

## Provocar el fallo

En `FronteraTransaccionalService.java`, cambia `llamadaInternaConThis()` para
devolver `trabajo.ejecutar()` en vez de `metodoInternoAnotado()`. La prueba que
espera `false` falla porque la llamada ahora cruza otro bean y abre transacción.
Restaura la llamada interna después de comprobarlo.
