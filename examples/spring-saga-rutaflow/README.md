# Saga de pedidos con Spring Boot

Ejemplo pequeño de una saga **orquestada**: reserva inventario, cobra el pedido
y confirma el envío. Si el envío falla, revierte el cobro y libera el inventario
en orden inverso. `OrderParticipants` hace de tres servicios locales en memoria;
no hay llamadas HTTP, base de datos ni broker.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw -q test
```

`OrderSagaTest` levanta el contexto Spring, verifica el camino completo y fuerza
un fallo de envío. Comprueba el orden visible de acciones y que no queden ni
reserva ni cobro. La lista de acciones es evidencia de este proceso en memoria,
no un registro durable.

## Archivos

- `src/main/java/academia/rutaflow/saga/OrderSaga.java`: pasos y compensaciones.
- `OrderParticipants.java`: estado local y fallo controlado del envío.
- `SagaResult.java`: estado final y acciones para inspección.
- `src/test/java/academia/rutaflow/saga/OrderSagaTest.java`: éxito y reversión.

Una saga no hace rollback automático ni aislamiento ACID entre servicios. Si
una compensación falla, esta demo se interrumpe y no persiste qué quedó
pendiente. La recuperación durable, los reintentos idempotentes y el outbox
quedan fuera de este laboratorio; M15 T7 trabaja la compensación que falla.
