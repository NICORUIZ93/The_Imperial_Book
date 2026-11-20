# 6 · Cheat sheets por fase

> Entregable 6 del prompt del dueño. Cada hoja resume los **comandos y conceptos de las fichas ya escritas**;
> todo lo que aparece aquí sale de las fichas y de sus laboratorios en `examples/microservicios/`, no de memoria.
> Para descargarla: imprime esta página o expórtala a PDF desde el navegador (cada fase empieza en su propio
> encabezado `##`, así que puedes imprimir solo la tuya).
>
> **Estado el 2026-11-19:** Fase 0 parcial (Módulos 0.1, 0.2 y 0.3 escritos; 0.4 y 0.5 pendientes).
> Fases 1, 2 y 3 **pendientes**: sus hojas se completan cuando estén escritas sus fichas. El estado de cada ficha
> está en [04-indice-de-fichas.md](04-indice-de-fichas.md).

## Versiones de bolsillo

| Stack | Versión del curso |
|---|---|
| Java | JDK 25 LTS (25.0.5) |
| Spring Boot / Spring Cloud | 4.1.3 / 2025.1.4 |
| Node.js / TypeScript / NestJS | 26.13.1 LTS / 6.0.3 / 12.5.1 |
| Kafka / Kubernetes | 4.4.0 / 1.37 |

Detalle, motivos y fuentes en [08-herramientas-y-versiones.md](08-herramientas-y-versiones.md).

## Fase 0 · Fundamentos absolutos (parcial)

### Conceptos clave

| Concepto | En una línea | Ficha |
|---|---|---|
| Programa | Datos + instrucciones → resultado. Cambia un dato y puedes predecir el nuevo resultado. | Módulo 0.1 · Qué es un programa |
| Código de salida | `0` = terminó bien; distinto de `0` = algo falló. Se lee con `echo $?`. | Módulo 0.1 · Qué es un programa |
| Servidor | Proceso que **no termina**: se queda escuchando en un puerto y responde pedidos. | Módulo 0.1 · Qué es un servidor |
| Puerto ocupado | Dos servidores no pueden escuchar el mismo puerto: error `EADDRINUSE`. | Módulo 0.1 · Qué es un servidor |
| API | Contrato: qué rutas existen, qué envías y qué recibes. | Módulo 0.1 · Qué es una API |
| Códigos HTTP | `200` OK · `201` creado · `400` pediste mal · `404` no existe. Los `4xx` son del cliente: repetir igual no sirve. | Módulo 0.1 · Qué es una API |
| Rutas | Distinguen mayúsculas: `/api/menu` ≠ `/api/Menu`. | Módulo 0.1 · Qué es una API |
| Lógica | Variables, decisiones (`if/else`), operadores (`&&`, `\|\|`), repeticiones (`for`) y funciones. | Módulo 0.2 · Lógica de programación |
| Casos de borde | Los errores viven en los límites (`>` frente a `>=`): pruébalos siempre, junto con sus vecinos. | Módulo 0.2 · Lógica de programación |
| Pensamiento computacional | Descomponer → reconocer patrones → abstraer en una función → evaluar cuándo falla. | Módulo 0.2 · Pensamiento computacional |
| Algoritmo voraz | Elegir siempre «lo más grande que cabe» es rápido, pero no siempre óptimo (monedas `[1, 3, 4]` para 6). | Módulo 0.2 · Pensamiento computacional |
| Java frente a Node.js: ejecución | Java compila a bytecode y lo ejecuta la JVM; Node.js ejecuta JavaScript con V8. | Módulo 0.3 · sintaxis y ejecución |
| Java frente a Node.js: tipos | Java: tipos estáticos, el error aparece **antes** de ejecutar. JavaScript: tipos dinámicos, el error aparece al ejecutar (o como `NaN`). | Módulo 0.3 · tipos, errores y concurrencia |
| Concurrencia | Java: hilos (virtuales desde Java 21). Node.js: event loop con `async/await`. Tres esperas de 1 s en paralelo tardan ~1 s en ambos. | Módulo 0.3 · tipos, errores y concurrencia |

### Comandos

```bash
# Ejecutar programas
node programa/receta.js                 # ejecuta un archivo JavaScript
echo "Código de salida: $?"             # código de salida del último comando
java Tienda.java                        # Java: compila en memoria y ejecuta (un solo archivo)
javac Tienda.java && java Tienda        # Java: compila a Tienda.class y luego ejecuta

# Servidores y APIs
node servidor/servidor.js               # arranca un servidor (no termina: Ctrl+C para pararlo)
curl -i http://localhost:3000/          # pide una página y muestra cabeceras (-i)
curl -s http://localhost:3001/api/menu; echo
curl -s -X POST http://localhost:3001/api/pedidos \
  -H 'Content-Type: application/json' \
  -d '{"platoId":2,"cantidad":3}' -w ' [%{http_code}]\n'   # imprime también el código HTTP

# Tests
node --test --test-reporter=spec logica/cine.test.js   # tests de Node sin dependencias
java TiendaTest.java                                   # test de Java de un solo archivo

# Probar una función suelta sin escribir un archivo
node -e "import('./logica/cine.js').then(m => console.log(m.precioBoleto(60)))"
```

### Errores frecuentes

| Ves | Significa | Arreglo |
|---|---|---|
| `Error: Cannot find module '…/receta.js'` · `MODULE_NOT_FOUND` | Ejecutaste desde la carpeta equivocada. | `pwd`, luego `cd examples/microservicios/modulo-0`. |
| `EADDRINUSE` | Ya hay un proceso escuchando en ese puerto. | Para el otro servidor (Ctrl+C) o usa otro puerto. |
| `400` con un JSON que tiene una coma final | El JSON no es válido. | Quita la coma sobrante. |
| `✖` con `12000 !== 7000` en un test | Error de borde en una condición. | Imprime el valor en el borde y en sus vecinos. |
| Java muestra `L?piz` en lugar de `Lápiz` | La terminal no usa UTF-8. | Configura la terminal o la configuración regional en UTF-8 (detalle en la ficha). |

### Pendiente en esta fase

- **Módulo 0.4** (Git, terminal, HTTP, JSON, YAML, variables de entorno) — pendiente.
- **Módulo 0.5** (Primer «Hola Mundo» en ambos stacks + Docker básico) — pendiente.

## Fase 1 · Spring Boot (pendiente)

Se completa cuando estén escritos los Módulos 1–12. Bloques previstos de la hoja: Maven y arranque de Spring
Boot · anotaciones de Spring MVC y JPA · tests (JUnit, MockMvc, Testcontainers, Pact) · Redis y caché ·
Spring Cloud (Gateway, Eureka, Config) · Resilience4j · Spring Security y Keycloak · Micrometer y OpenTelemetry ·
Kafka y RabbitMQ · Docker, `kubectl`, Helm y Argo CD.

## Fase 2 · Node.js (pendiente)

Se completa cuando estén escritos los Módulos 13–23. Bloques previstos: `npm` y TypeScript · event loop y
`perf_hooks` · Express y NestJS CLI · Mongoose y Prisma · Jest, Supertest y Pact · Consul · gRPC, Apollo,
KafkaJS, amqplib y NATS · opossum/cockatiel · jsonwebtoken, Passport y Helmet · OpenTelemetry y Pino ·
sagas con NestJS CQRS · Docker, `kubectl` y GitHub Actions.

## Fase 3 · Nivel maestro (pendiente)

Se completa cuando estén escritos los Módulos 24–32. Bloques previstos: plantilla de ADR y C4 · Outbox y
Debezium · Temporal (`temporal` CLI) · Kafka transaccional y Schema Registry · Istio/Linkerd y Vault · fórmulas
de FinOps (break-even serverless frente a contenedores) · tipos de equipo de Team Topologies · checklist de
anti-patrones · Gatling y la rúbrica del Comité ([07-plantillas.md](07-plantillas.md)).
