# DDD y propiedad de datos · RutaFlow

Agregado Java pequeño para comprobar una regla de negocio sin levantar Spring,
Kafka, HTTP ni una base de datos. El módulo ficticio de Operaciones posee la
jornada y sus posiciones; otros contextos reciben datos mediante un contrato,
no accediendo a estas clases o a sus tablas.

## Ejecutar

```bash
./mvnw -q clean test
```

Las pruebas verifican que una jornada abierta acepta posiciones, que una
jornada cerrada las rechaza y que la lista devuelta no permite modificar el
estado interno.

## Fallo deliberado

En `src/main/java/academia/rutaflow/operations/Journey.java`, elimina la
comprobación de estado dentro de `record` y ejecuta:

```bash
./mvnw -q -Dtest=JourneyTest#unaJornadaCerradaRechazaNuevasPosiciones test
```

El test falla porque la invariante desaparece. Restaura la comprobación y
ejecuta de nuevo la suite completa.

El laboratorio no crea servicios separados ni persiste datos: sirve para
proteger la regla primero dentro del dominio. Si la arquitectura todavía cambia
con frecuencia, mantén esos límites dentro de un monolito modular hasta que la
propiedad de datos y los equipos justifiquen despliegues separados.
