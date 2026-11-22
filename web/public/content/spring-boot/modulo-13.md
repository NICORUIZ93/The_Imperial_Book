# Módulo 13: Programación reactiva con WebFlux

Cubre `Mono`/`Flux`, backpressure, WebFlux, R2DBC y cuándo NO usar reactive. Reactivo es un modelo de concurrencia; no es obligatorio para todo.

**Entorno (2026-05-22):** JDK 27. Reactor/WebFlux/R2DBC requieren dependencias.

## Aprende construyendo

### Tema 1: Mono, Flux y backpressure · Avanzado · 45 min
#### `Mono` y `Flux`
**Definición formal.** `Mono<T>` representa 0..1 elemento async; `Flux<T>` representa 0..N elementos async en Reactor.
**Para qué sirve.** Modelar flujos no bloqueantes.
**Cuándo usarlo.** I/O no bloqueante, streaming. No mezclar con bloqueo en hilos reactivos.
**Ejemplo mínimo enfocado (ejecutable con Java Flow/simulación; Reactor requiere dependencia).**
```java
Mono.just("ok").map(String::toUpperCase);
Flux.just(1,2,3).filter(x->x%2==1);
```
**Caso de uso real.** API reactiva con SSE/stream.
**Error común.** Bloquear con `.block()` en pipeline reactivo. Corrección: componer reactivamente.
**Verificación.** **Nota:** requiere Reactor.

#### Backpressure
**Definición formal.** Control de demanda donde el consumidor indica cuánto puede procesar.
**Para qué sirve.** Evitar sobrecarga.
**Cuándo usarlo.** Streams con productor rápido.
**Ejemplo mínimo enfocado (ejecutable Flow).** `request(n)`.
**Caso de uso real.** Telemetría.
**Error común.** Buffer ilimitado. Corrección: límites, drop, o control de demanda.
**Verificación.** Ya demostrado con Flow API Java.

### Tema 2: WebFlux, controladores y endpoints funcionales · Avanzado · 45 min
#### WebFlux
**Definición formal.** Stack web reactivo de Spring basado en Reactor.
**Para qué sirve.** APIs no bloqueantes y streaming.
**Cuándo usarlo.** Alta concurrencia I/O-bound con stack reactivo. No si todo el stack es bloqueante/JDBC.
**Ejemplo mínimo enfocado (Spring).**
```java
@GetMapping("/ping") Mono<String> ping(){ return Mono.just("pong"); }
```
**Caso de uso real.** Gateway/streaming endpoints.
**Error común.** Usar WebFlux con JDBC bloqueante. Corrección: R2DBC o stack MVC.
**Verificación.** **Nota:** requiere spring-webflux.

### Tema 3: R2DBC y persistencia reactiva · Avanzado · 45 min
#### R2DBC
**Definición formal.** API reactiva para bases relacionales.
**Para qué sirve.** Acceso relacional no bloqueante.
**Cuándo usarlo.** Cuando todo el flujo es reactivo. No mezclar con JPA bloqueante.
**Ejemplo mínimo enfocado (Spring Data R2DBC).**
```java
interface Repo extends ReactiveCrudRepository<Envio,Long> { Mono<Envio> findByCodigo(String c); }
```
**Caso de uso real.** Servicio reactivo con Postgres R2DBC.
**Error común.** Llamar `.block()` dentro de reactor. Corrección: mantener cadena reactiva.
**Verificación.** **Nota:** requiere driver R2DBC + BD.

### Tema 4: Cuándo NO usar reactive · Avanzado · 35 min
#### Decisión MVC vs WebFlux
**Definición formal.** Selección arquitectónica entre modelo bloqueante y reactivo según carga, stack y complejidad.
**Para qué sirve.** Evitar complejidad innecesaria.
**Cuándo usar WebFlux.** I/O no bloqueante, streaming, backpressure real. **Cuándo no.** CRUD simple, stack bloqueante, equipo sin experiencia.
**Ejemplo mínimo enfocado (checklist ejecutable como decisión).**
```bash
echo "bloqueante+CRUD= MVC; no-bloqueante+stream= WebFlux"
```
**Caso de uso real.** CRUD empresarial típico: MVC.
**Error común.** Elegir reactive por moda. Corrección: medir necesidades reales.
**Verificación (2026-05-22).** Checklist impreso; decisión basada en contexto.

## Cierre
Reactive aporta valor con backpressure y stack no bloqueante end-to-end. Sin eso, añade complejidad.
