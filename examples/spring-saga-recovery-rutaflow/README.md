# Recuperar una compensación con Spring Boot y H2

La tabla `compensation_job` conserva el trabajo como `PENDING` o `DONE`. El
efecto de liberar inventario y el cambio a `DONE` ocurren dentro de una
transacción local. Si el proceso falla entre ambos, la transacción revierte el
cambio parcial; el trabajo pendiente puede reintentarse. Una segunda ejecución
de una compensación ya terminada no repite el efecto.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw -q test
```

La prueba usa una base H2 en archivo temporal. Fuerza un error justo después de
actualizar inventario, comprueba el rollback, cierra el pool de conexiones,
abre el mismo archivo con otro servicio y reintenta. Después repite la
compensación y comprueba que el contador de liberaciones sigue en uno. El
servicio bloquea la fila pendiente durante la transacción para serializar
reintentos simultáneos de la misma compensación.

Para iniciar la aplicación localmente, configura la base H2 en archivo indicada
en `src/main/resources/application.yml`:

```bash
./mvnw -q spring-boot:run
```

## Archivos

- `src/main/java/academia/rutaflow/sagarecovery/CompensationService.java`:
  programa, reintenta y marca la compensación dentro de una transacción.
- `src/main/resources/schema.sql`: reserva de inventario y trabajo pendiente.
- `src/test/java/academia/rutaflow/sagarecovery/CompensationRecoveryTest.java`:
  fallo, reinicio simulado y repetición idempotente.

El cierre y la reapertura del pool simulan el límite entre dos procesos, no
matan la JVM en medio de una instrucción. H2 en archivo sirve para el ejercicio;
no coordina participantes que tengan bases diferentes. Faltan mensajería,
outbox, planificador de reintentos con espera, métricas, alarmas y políticas de
intervención manual. La transacción protege solo el cambio local del inventario
y su marcador de compensación.
