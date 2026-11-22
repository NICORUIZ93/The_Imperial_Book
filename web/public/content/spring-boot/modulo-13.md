# Módulo 13: WebFlux y programación reactiva

Reactive no es “más rápido por defecto”. Es un modelo para concurrencia no bloqueante con backpressure, útil cuando hay muchas I/O concurrentes y el stack completo es reactivo. Usarlo mal agrega complejidad y bugs difíciles.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Spring Boot 3.5.0, Project Reactor.

## Aprende construyendo

### Tema 1: Mono, Flux y backpressure · Avanzado · 45 min

Caso guía: endpoint que consulta servicio externo y compone resultados sin bloquear hilos.

#### `Mono` y `Flux`

**Definición formal.** `Mono<T>` representa 0..1 elemento asíncrono; `Flux<T>` representa 0..N elementos con backpressure.

```mermaid
flowchart LR
  M[Mono 0..1] --> S[Subscriber]
  F[Flux 0..N] --> S
  S -->|request(n)| F
```

**Ejemplo mínimo (ejecutable con Reactor si dependencia presente; patrón conceptual).**

```java
Mono.just("ok").map(String::toUpperCase).subscribe(System.out::println);
```

**Error común.** Bloquear (`block()`) en hilos reactivos. Corrección: componer; bloquear solo en bordes permitidos.

### Tema 2: WebFlux, controladores y endpoints funcionales · Avanzado · 45 min

Caso guía: API reactiva con controller anotado o router funcional.

#### WebFlux

**Definición formal.** Módulo web reactivo de Spring, sobre Reactor/Netty por defecto, para manejo no bloqueante.

**Ejemplo mínimo.**

```java
@GetMapping("/ping")
Mono<String> ping() { return Mono.just("pong"); }
```

**Error común.** Mezclar JDBC bloqueante en WebFlux. Corrección: stack reactivo completo (R2DBC, clientes no bloqueantes) o usar MVC.

### Tema 3: R2DBC y persistencia reactiva · Avanzado · 45 min

Caso guía: consultar DB sin bloquear el event loop.

#### R2DBC

**Definición formal.** API reactiva para bases relacionales. No es JPA; es acceso no bloqueante.

**Error común.** Esperar lazy loading tipo JPA. Corrección: modelar queries explícitas y composición reactiva.

**Nota de verificación.** Requiere driver R2DBC y DB compatible.

### Tema 4: Cuándo NO usar reactive · Avanzado · 35 min

Caso guía: CRUD simple con JDBC/JPA bloqueante y bajo/medio concurrency.

#### Criterio

**Definición formal.** Reactive es adecuado cuando el beneficio de no bloquear bajo concurrencia alta compensa la complejidad y todo el stack soporta no bloqueo.

**Error común.** Adoptar WebFlux por moda. Corrección: medir, considerar MVC + virtual threads en Java moderno para muchos casos.

## Cierre

Reactive es una herramienta especializada. Úsala con stack coherente, backpressure y disciplina de no bloqueo.

## Checklist

- Distingo `Mono`/`Flux`.
- No bloqueo event loop.
- Uso R2DBC/clients reactivos si elijo WebFlux.
- Sé cuándo MVC es mejor.
